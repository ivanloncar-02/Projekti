from flask import render_template, request, jsonify, session
from app.deploy import deploy_bp
from app.firebase_db import (
    get_all_devices, get_all_templates,
    set_device_deployment, add_audit_log,
    get_template_by_id, get_db,
)
from .utils import deploy_from_content
import time


@deploy_bp.route('/gns3', methods=['GET'])
def gns3_deploy_page():
    from gns3.topology import get_routers_from_gns3, get_active_project_id
    project_id = get_active_project_id()
    routers    = get_routers_from_gns3(project_id)
    templates  = get_all_templates()

    db_devices = {d['gns3_node_id']: d for d in get_all_devices() if d.get('gns3_node_id')}
    for r in routers:
        db = db_devices.get(r.get('node_id'), {})
        r['ip_address']  = db.get('ip_address')  or r.get('ip_address') or ''
        r['mac_address'] = db.get('mac_address') or ''

    return render_template(
        'configs/gns3_deploy.html',
        routers=routers,
        templates=templates,
        gns3_ok=(project_id is not None),
        project_id=project_id,
    )



@deploy_bp.route('/gns3/push', methods=['POST'])
def gns3_push():
    req = request.get_json()

    node_name     = req.get('node_name', 'nepoznat')
    template_id   = req.get('template_id')
    template_name = req.get('template_name', '')
    params        = req.get('params', {})
    access_method = req.get('access_method', 'ssh')

    tmpl = get_template_by_id(template_id) if template_id else None
    if not tmpl:
        return jsonify({'status': 'error',
                        'message': 'Predložak nije pronađen u bazi.'}), 404
    content       = tmpl['content']
    template_name = tmpl['name']

    if access_method == 'ssh':
        host     = req.get('host')
        port     = int(req.get('port', 22))
        username = req.get('username', 'admin')
        password = req.get('password', 'admin')

        ssh_info = {
            'device_type': 'mikrotik_routeros',
            'host':        host,
            'port':        port,
            'username':    username,
            'password':    password,
        }
        success, message = deploy_from_content(content, ssh_info, params)

        ssh_never_connected = (not success and
                               ('SSH greška' in message or 'timed out' in message.lower()
                                or 'connection refused' in message.lower()
                                or 'unable to connect' in message.lower()))

        wan_ip_cidr = params.get('wan_ip_cidr', '')
        if wan_ip_cidr and not ssh_never_connected:
            import socket as _sock
            new_ip = wan_ip_cidr.split('/')[0].strip()
            if new_ip and new_ip != host:
                time.sleep(4)
                new_reachable = False
                old_reachable = False
                try:
                    with _sock.create_connection((new_ip, port), timeout=6):
                        new_reachable = True
                except Exception:
                    pass
                if not new_reachable:
                    try:
                        with _sock.create_connection((host, port), timeout=3):
                            old_reachable = True
                    except Exception:
                        pass

                if new_reachable:
                    success = True
                    message = (f"IP promijenjen: {host} → {new_ip}. "
                               f"Uređaj je dostupan na novoj adresi.")
                elif old_reachable:
                    success = False
                    message = (f"IP nije promijenjen — uređaj je i dalje na {host}. "
                               f"Provjeri je li naredba u predlošku ispravna "
                               f"i postoji li adresa na sučelju {params.get('wan_interface', 'ether1')}.")
                else:
                    success = True
                    message = (f"IP promijenjen: {host} → {new_ip} "
                               f"(SSH prekinut). Provjeri ručno dostupnost na {new_ip}.")

    else:
        return jsonify({'status': 'error',
                        'message': f'Nepoznata metoda pristupa: {access_method}'}), 400

    node_id = req.get('node_id')
    if node_id:
        devices = get_all_devices()
        device  = next((d for d in devices if d.get('gns3_node_id') == node_id), None)
        if device:
            new_ip = ''
            if params.get('wan_ip_cidr'):
                new_ip = params['wan_ip_cidr'].split('/')[0].strip()
            set_device_deployment(
                doc_id        = device['id'],
                success       = success,
                template_name = template_name,
                message       = message,
                user_email    = session.get('user_email'),
            )
            if success and new_ip:
                get_db().collection('devices').document(device['id']).update({
                    'ip_address': new_ip,
                })

    add_audit_log(
        action=f"GNS3 Push [{access_method}] na '{node_name}': {template_name} – {message}",
        status='uspjeh' if success else 'greska',
        user_email=session.get('user_email'),
        template_name=template_name,
    )

    code = 200 if success else 500
    return jsonify({'status': 'success' if success else 'error', 'message': message}), code
