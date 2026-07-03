from flask import render_template, jsonify
from app.devices import devices_bp
from app.firebase_db import get_all_devices, upsert_device_by_node_id, delete_device
from datetime import datetime, timezone


@devices_bp.route('/')
def list_devices():
    devices = get_all_devices()
    return render_template('devices/list.html', devices=devices)


@devices_bp.route('/sync-gns3', methods=['POST'])
def sync_gns3():
    try:
        from gns3.topology import get_routers_from_gns3, get_active_project_id, get_ip_and_mac_via_console
        project_id = get_active_project_id()
        routers    = get_routers_from_gns3(project_id)

        existing            = get_all_devices()
        existing_nodes      = {d['gns3_node_id']: d['id'] for d in existing if d.get('gns3_node_id')}
        existing_nodes_data = {d['gns3_node_id']: d for d in existing if d.get('gns3_node_id')}
        gns3_node_ids       = set()

        for r in routers:
            node_id      = r.get('node_id')
            console_host = r.get('console_host', 'localhost')
            console_port = r.get('console_port')
            gns3_node_ids.add(node_id)

            ip  = r.get('ip_address') or ''
            mac = ''
            if console_port and r.get('status') == 'started':
                info = get_ip_and_mac_via_console(console_host, int(console_port))
                ip   = info.get('ip_address') or ip
                mac  = info.get('mac_address') or ''

            is_new = node_id not in existing_nodes
            data = {
                'ip_address':   ip,
                'hostname':     r['name'],
                'mac_address':  mac,
                'device_type':  'mikrotik_routeros',
                'gns3_status':  r['status'],
                'last_seen':    datetime.now(timezone.utc),
                'gns3_node_id': node_id,
                'console_host': console_host,
                'console_port': console_port,
            }
            if is_new:
                data['status'] = 'nekonfiguriran'
            else:
                existing_dev = existing_nodes_data.get(node_id, {})
                old_status   = existing_dev.get('status', '')
                if old_status not in ('konfiguriran', 'nekonfiguriran'):
                    last_deploy  = existing_dev.get('last_deploy_status', '')
                    data['status'] = 'konfiguriran' if last_deploy == 'uspjeh' else 'nekonfiguriran'
            upsert_device_by_node_id(node_id, data)

        for node_id, doc_id in existing_nodes.items():
            if node_id not in gns3_node_ids:
                delete_device(doc_id)

        return jsonify({"status": "success", "synced": len(routers)})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
