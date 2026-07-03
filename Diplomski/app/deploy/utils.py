import paramiko
from jinja2 import Template


def render_from_content(content: str, data: dict) -> tuple[bool, str]:
    """Renderira Jinja2 predložak iz stringa (Firestore sadržaj)."""
    try:
        rendered = Template(content).render(data)
        return True, rendered
    except Exception as e:
        return False, f"Greška pri renderiranju predloška: {e}"


_MIKROTIK_ERRORS = [
    'bad command name', 'expected end of command', 'no such item',
    'input does not match', 'invalid value', 'failure:', 'script error',
    'expected command name',
]


def _resolve_find_interface(client: paramiko.SSHClient, line: str) -> str:
    """
    Zamjenjuje [find interface=X] s numeričkim ID-jem adrese iz RouterOS-a.
    exec_command ne podržava [find] sintaksu, ali /ip address print where radi.
    """
    import re
    match = re.search(r'\[find interface=(\S+?)\]', line)
    if not match:
        return line
    interface = match.group(1)
    try:
        _, stdout, _ = client.exec_command(
            f'/ip address print terse where interface={interface}', timeout=8
        )
        output = stdout.read().decode('utf-8', errors='replace')
        id_match = re.search(r'^\s*(\d+)', output, re.MULTILINE)
        if id_match:
            resolved = line.replace(match.group(0), id_match.group(1))
            print(f"[SSH find] {line} → {resolved}")
            return resolved
    except Exception as e:
        print(f"[SSH find GREŠKA]: {e}")
    return line


def _ssh_send_lines(host: str, port: int, username: str, password: str,
                    config_lines: list[str]) -> tuple[bool, str]:
    """
    Šalje RouterOS naredbe putem exec_command.
    Naredbe s [find interface=X] prvo razriješimo u numerički ID pa koristimo njega.
    """
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=port, username=username,
                       password=password, timeout=20, look_for_keys=False,
                       allow_agent=False)

        all_output = []
        errors     = []

        for line in config_lines:
            if '[find' in line:
                line = _resolve_find_interface(client, line)

            try:
                stdin, stdout, stderr = client.exec_command(line, timeout=10)
                out = stdout.read().decode('utf-8', errors='replace')
                err = stderr.read().decode('utf-8', errors='replace')
                combined = (out + err).strip()
                all_output.append(f">> {line}\n{combined}" if combined else f">> {line}")
                lower = combined.lower()
                if any(e in lower for e in _MIKROTIK_ERRORS):
                    errors.append(f"{line} → {combined}")
            except Exception as e:
                all_output.append(f">> {line}\n[SSH prekinut: {e}]")
                break

        full_log = '\n'.join(all_output)
        print(f"[SSH Izlaz]:\n{full_log}")

        if errors:
            return False, "Greške:\n" + "\n".join(errors) + "\n\nLog:\n" + full_log
        return True, full_log
    except Exception as e:
        print(f"[SSH GREŠKA]: {e}")
        return False, f"SSH greška: {e}"
    finally:
        try:
            client.close()
        except Exception:
            pass


def deploy_from_content(content: str, device_ssh_info: dict, data: dict) -> tuple[bool, str]:
    """Deployira konfiguraciju iz Firestore sadržaja predloška preko SSH."""
    ok, result = render_from_content(content, data)
    if not ok:
        return False, result

    config_lines = _clean_config_lines(result)
    return _ssh_send_lines(
        host=device_ssh_info['host'],
        port=int(device_ssh_info.get('port', 22)),
        username=device_ssh_info.get('username', 'admin'),
        password=device_ssh_info.get('password', ''),
        config_lines=config_lines,
    )

def _clean_config_lines(rendered: str) -> list[str]:
    """Čisti prazne redove i komentare (#) iz MikroTik konfiguracije."""
    lines = []
    for line in rendered.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith('#'):
            continue
        lines.append(stripped)
    return lines


