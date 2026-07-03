from flask import render_template, session
from app.reports import reports_bp
from app.firebase_db import (
    get_audit_logs, get_audit_logs_by_user,
    count_devices_by_status, get_all_devices,
    get_all_templates,
)


@reports_bp.route('/dashboard')
def dashboard():
    is_admin   = session.get('user_role') == 'admin'
    user_email = session.get('user_email')

    conf_count   = count_devices_by_status('konfiguriran')
    unconf_count = count_devices_by_status('nekonfiguriran')
    devices      = get_all_devices()

    logs = get_audit_logs(limit=100) if is_admin else get_audit_logs_by_user(user_email, limit=100)

    type_counts = {}
    for d in devices:
        dt = d.get('device_type', 'nepoznat')
        type_counts[dt] = type_counts.get(dt, 0) + 1

    template_count = len(get_all_templates())

    return render_template('reports/dashboard.html',
                           conf_count=conf_count,
                           unconf_count=unconf_count,
                           logs=logs,
                           devices=devices,
                           type_counts=type_counts,
                           template_count=template_count,
                           is_admin=is_admin)
