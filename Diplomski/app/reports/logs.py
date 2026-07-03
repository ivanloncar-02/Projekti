import re
from flask import render_template, jsonify, session, request
from app.reports import reports_bp
from app.firebase_db import get_audit_logs, get_audit_logs_by_user


def _extract_router_name(action: str) -> str:
    m = re.search(r"na '([^']+)'", action)
    return m.group(1) if m else ''


def _get_router_logs(limit: int = 200) -> list:
    logs = get_audit_logs(limit=limit)
    result = []
    for log in logs:
        action = log.get('action', '')
        if 'GNS3 Push' not in action:
            continue
        log['router_name'] = _extract_router_name(action)
        result.append(log)
    return result


@reports_bp.route('/logs')
def all_logs():
    if session.get('user_role') != 'admin':
        return "Pristup odbijen", 403
    logs         = _get_router_logs(limit=200)
    router_names = sorted({l['router_name'] for l in logs if l['router_name']})
    return render_template('reports/logs.html', logs=logs,
                           router_names=router_names, filter_router=None,
                           is_admin=True)


@reports_bp.route('/logs/router/<router_name>')
def logs_by_router(router_name):
    if session.get('user_role') != 'admin':
        return "Pristup odbijen", 403
    all_dep_logs = _get_router_logs(limit=200)
    logs         = [l for l in all_dep_logs if l['router_name'] == router_name]
    router_names = sorted({l['router_name'] for l in all_dep_logs if l['router_name']})
    return render_template('reports/logs.html', logs=logs,
                           router_names=router_names, filter_router=router_name,
                           is_admin=True)


@reports_bp.route('/api/logs')
def api_logs():
    is_admin   = session.get('user_role') == 'admin'
    user_email = session.get('user_email')
    limit      = int(request.args.get('limit', 20))

    logs = get_audit_logs(limit=limit) if is_admin else get_audit_logs_by_user(user_email, limit=limit)
    for log in logs:
        log.pop('timestamp', None)
    return jsonify(logs)


@reports_bp.route('/topology')
def topology():
    from gns3.topology import get_full_topology, get_active_project_id
    project_id = get_active_project_id()
    topo       = get_full_topology(project_id) if project_id else {}
    if not topo:
        topo = {}
    topo.setdefault('nodes', [])
    topo.setdefault('links', [])
    topo.setdefault('project_id', None)
    return render_template('reports/topology.html',
                           topo=topo,
                           gns3_ok=(project_id is not None))


@reports_bp.route('/api/topology')
def api_topology():
    from gns3.topology import get_full_topology, get_active_project_id
    project_id = get_active_project_id()
    return jsonify(get_full_topology(project_id))
