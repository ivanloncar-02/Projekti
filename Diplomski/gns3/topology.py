import re
import socket
import time
import requests

GNS3_SERVER = "http://localhost:3081/v2"

MIKROTIK_KEYWORDS = ['mikrotik', 'routeros', 'chr', 'ros']


def _is_mikrotik(node_name: str, template_name: str = "") -> bool:
    text = (node_name + " " + template_name).lower()
    return any(kw in text for kw in MIKROTIK_KEYWORDS)


def _strip_telnet_codes(data: bytes) -> bytes:
    """Ukloni Telnet IAC sekvence i ANSI escape kodove iz konzolnog outputa."""
    data = re.sub(b'\xff[\xfb-\xfe].', b'', data)               # IAC WILL/WONT/DO/DONT
    data = re.sub(b'\xff\xfa.*?\xff\xf0', b'', data, flags=re.DOTALL)  # IAC SB...SE
    data = re.sub(b'\xff.', b'', data)                           # ostale IAC sekvence
    data = re.sub(b'\x1b\[[0-9;]*[A-Za-z]', b'', data)          # ANSI escape kodovi
    return data


def _console_recv_all(s: socket.socket, wait: float = 2.5, read_timeout: float = 2.0) -> str:
    """Čeka `wait` sekundi pa čita sve dostupne podatke sa socketa."""
    time.sleep(wait)
    s.settimeout(read_timeout)
    data = b''
    try:
        while True:
            chunk = s.recv(65536)
            if not chunk:
                break
            data += chunk
    except socket.timeout:
        pass
    return _strip_telnet_codes(data).decode('utf-8', errors='replace')


def get_ip_and_mac_via_console(console_host: str, console_port: int) -> dict:
    """
    Spaja se na GNS3 konzolni port (Telnet) i čita IP i MAC adresu MikroTik
    uređaja. Vraća dict s ključevima 'ip_address' i 'mac_address'.
    """
    result = {'ip_address': '', 'mac_address': ''}
    try:
        with socket.create_connection((console_host, console_port), timeout=5) as s:
            # Pričekaj boot / očisti banner i Telnet pregovaranje
            _console_recv_all(s, wait=2.0)

            # Pošalji Enter da se ativira prompt
            s.sendall(b'\r\n')
            _console_recv_all(s, wait=1.0)

            # Dohvati IP adrese
            s.sendall(b'/ip address print without-paging\r\n')
            ip_output = _console_recv_all(s, wait=2.0)
            ips = re.findall(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/\d+', ip_output)
            for ip in ips:
                if not ip.startswith('127.') and not ip.startswith('169.254.'):
                    result['ip_address'] = ip
                    break

            # Dohvati MAC adresu
            s.sendall(b'/interface ethernet print detail without-paging\r\n')
            mac_output = _console_recv_all(s, wait=3.5, read_timeout=2.0)
            macs = re.findall(
                r'mac-address=([0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){5})',
                mac_output
            )
            if macs:
                result['mac_address'] = macs[0].upper()

    except Exception:
        pass
    return result


def get_projects() -> list[dict]:
    try:
        r = requests.get(f"{GNS3_SERVER}/projects", timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception:
        return []


def get_active_project_id() -> str | None:
    try:
        projects = get_projects()
        for p in projects:
            if p.get('status') == 'opened':
                return p['project_id']
        if projects:
            return projects[0]['project_id']
    except Exception:
        pass
    return None


def get_routers_from_gns3(project_id: str = None) -> list[dict]:
    """
    Dohvaća sve MikroTik RouterOS nodeove iz aktivnog GNS3 projekta.
    """
    if project_id is None:
        project_id = get_active_project_id()
    if not project_id:
        return []

    try:
        resp = requests.get(f"{GNS3_SERVER}/projects/{project_id}/nodes", timeout=5)
        resp.raise_for_status()
        nodes = resp.json()
    except Exception:
        return []

    routers = []
    for node in nodes:
        node_name     = node.get('name', '')
        template_name = node.get('template', '') or node.get('node_type', '')

        if not _is_mikrotik(node_name, template_name):
            continue

        props      = node.get('properties', {})
        ip_address = props.get('management_ip') or props.get('ip_address') or None

        routers.append({
            'node_id':      node.get('node_id'),
            'name':         node_name,
            'device_type':  'mikrotik_ros',
            'status':       node.get('status', 'unknown'),
            'console_host': node.get('console_host') or 'localhost',
            'console_port': node.get('console'),
            'ip_address':   ip_address,
            'template_name': template_name,
        })

    return routers


def get_all_nodes(project_id: str = None) -> list[dict]:
    """Dohvaća sve nodeove iz aktivnog GNS3 projekta."""
    if project_id is None:
        project_id = get_active_project_id()
    if not project_id:
        return []
    try:
        resp = requests.get(f"{GNS3_SERVER}/projects/{project_id}/nodes", timeout=5)
        resp.raise_for_status()
        nodes = resp.json()
    except Exception:
        return []

    result = []
    for node in nodes:
        result.append({
            'node_id':      node.get('node_id'),
            'name':         node.get('name', ''),
            'node_type':    node.get('node_type', ''),
            'status':       node.get('status', 'unknown'),
            'x':            node.get('x', 0),
            'y':            node.get('y', 0),
            'console_host': node.get('console_host') or 'localhost',
            'console_port': node.get('console'),
            'is_mikrotik':  _is_mikrotik(node.get('name', ''),
                                         node.get('template', '') or node.get('node_type', '')),
        })
    return result


def get_links(project_id: str = None) -> list[dict]:
    """Dohvaća sve linkove između nodeova iz aktivnog GNS3 projekta."""
    if project_id is None:
        project_id = get_active_project_id()
    if not project_id:
        return []
    try:
        resp = requests.get(f"{GNS3_SERVER}/projects/{project_id}/links", timeout=5)
        resp.raise_for_status()
        links = resp.json()
    except Exception:
        return []

    result = []
    for link in links:
        nodes = link.get('nodes', [])
        if len(nodes) >= 2:
            result.append({
                'link_id':    link.get('link_id'),
                'from_node':  nodes[0].get('node_id'),
                'from_port':  nodes[0].get('adapter_number'),
                'to_node':    nodes[1].get('node_id'),
                'to_port':    nodes[1].get('adapter_number'),
                'link_type':  link.get('link_type', 'ethernet'),
            })
    return result


def get_full_topology(project_id: str = None) -> dict:
    """Vraća cjelokupnu topologiju: nodeove i linkove."""
    if project_id is None:
        project_id = get_active_project_id()
    return {
        'project_id': project_id,
        'nodes':      get_all_nodes(project_id),
        'links':      get_links(project_id),
    }


if __name__ == '__main__':
    pid = get_active_project_id()
    print(f"Aktivan projekt: {pid}")
    for r in get_routers_from_gns3(pid):
        print(r)