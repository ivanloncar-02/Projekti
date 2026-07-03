from flask import render_template, request, jsonify, session
from app.configs import configs_bp
from app.firebase_db import (
    get_all_templates, get_all_devices,
    get_device_by_ip,
    set_device_deployment, add_audit_log,
    upsert_template, delete_template, get_template_by_id, get_template_by_name,
)
from app.deploy.utils import deploy_from_content


# =====================================================================
# 1. Pregled i push predložaka
# =====================================================================

@configs_bp.route('/templates')
def manage_templates():
    templates = get_all_templates()
    devices   = get_all_devices()
    return render_template('configs/templates_manage.html',
                           templates=templates, devices=devices)


@configs_bp.route('/templates/new', methods=['GET', 'POST'])
def new_template():
    if request.method == 'POST':
        data = request.get_json()
        name = (data.get('name') or '').strip()
        device_type = (data.get('device_type') or '').strip()
        content = (data.get('content') or '').strip()

        if not name or not device_type or not content:
            return jsonify({'status': 'error', 'message': 'Sva polja su obavezna.'}), 400

        doc_id = upsert_template(name, device_type, content)
        add_audit_log(
            action=f"Dodan/ažuriran predložak: {name}",
            status='uspjeh',
            user_email=session.get('user_email'),
            template_name=name,
        )
        return jsonify({'status': 'success', 'id': doc_id})

    return render_template('configs/template_form.html', template=None)


@configs_bp.route('/templates/<doc_id>/edit', methods=['GET', 'POST'])
def edit_template(doc_id):
    tmpl = get_template_by_id(doc_id)
    if not tmpl:
        return "Predložak nije pronađen.", 404

    if request.method == 'POST':
        data        = request.get_json()
        name        = (data.get('name') or tmpl['name']).strip()
        device_type = (data.get('device_type') or tmpl['device_type']).strip()
        content     = (data.get('content') or '').strip()

        if not content:
            return jsonify({'status': 'error', 'message': 'Sadržaj predloška ne smije biti prazan.'}), 400

        upsert_template(name, device_type, content)
        add_audit_log(
            action=f"Izmijenjen predložak: {name}",
            status='uspjeh',
            user_email=session.get('user_email'),
            template_name=name,
        )
        return jsonify({'status': 'success'})

    return render_template('configs/template_form.html', template=tmpl)


@configs_bp.route('/templates/<doc_id>/delete', methods=['POST'])
def delete_template_route(doc_id):
    tmpl = get_template_by_id(doc_id)
    if not tmpl:
        return jsonify({'status': 'error', 'message': 'Predložak nije pronađen.'}), 404

    delete_template(doc_id)
    add_audit_log(
        action=f"Obrisan predložak: {tmpl['name']}",
        status='uspjeh',
        user_email=session.get('user_email'),
        template_name=tmpl['name'],
    )
    return jsonify({'status': 'success'})


@configs_bp.route('/deploy-template', methods=['POST'])
def deploy_template():
    req = request.get_json()

    template_name = req.get('template_name')
    host          = req.get('host')
    port          = int(req.get('port', 22))
    username      = req.get('username', 'admin')
    password      = req.get('password', 'admin')
    params        = req.get('params', {})

    if not host:
        return jsonify({'status': 'error', 'message': 'IP adresa nije upisana.'}), 400

    ssh_info = {
        'device_type': 'mikrotik_routeros',
        'host':        host,
        'port':        port,
        'username':    username,
        'password':    password,
    }

    tmpl = get_template_by_name(template_name)
    if not tmpl:
        return jsonify({'status': 'error', 'message': 'Predložak nije pronađen u bazi.'}), 404

    success, message = deploy_from_content(tmpl['content'], ssh_info, params)

    # Ažuriraj status uređaja u Firestoreu ako postoji
    device = get_device_by_ip(host)
    if device:
        set_device_deployment(
            doc_id=device['id'],
            success=success,
            template_name=template_name,
            message=message,
            user_email=session.get('user_email'),
        )

    add_audit_log(
        action=f"Predložak Push na '{host}': {template_name} – {message}",
        status='uspjeh' if success else 'greska',
        user_email=session.get('user_email'),
        template_name=template_name,
    )

    code = 200 if success else 500
    return jsonify({'status': 'success' if success else 'error', 'message': message}), code
