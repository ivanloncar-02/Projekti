from datetime import datetime, timezone
from firebase_admin import firestore

def get_db():
    return firestore.client()


# ─────────────────────────────────────────
# USERS
# ─────────────────────────────────────────

def get_user_by_uid(uid: str) -> dict | None:
    db = get_db()
    docs = db.collection('users').where('firebase_uid', '==', uid).limit(1).stream()
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        return data
    return None

def create_user(uid: str, email: str, role: str) -> dict:
    db = get_db()
    data = {'firebase_uid': uid, 'email': email, 'role': role}
    ref = db.collection('users').add(data)
    return {'id': ref[1].id, **data}

def count_users() -> int:
    db = get_db()
    return len(list(db.collection('users').stream()))


# ─────────────────────────────────────────
# DEVICES
# ─────────────────────────────────────────

def get_all_devices() -> list[dict]:
    db = get_db()
    return [{'id': d.id, **d.to_dict()} for d in db.collection('devices').stream()]

def get_device_by_ip(ip: str) -> dict | None:
    db = get_db()
    docs = db.collection('devices').where('ip_address', '==', ip).limit(1).stream()
    for doc in docs:
        return {'id': doc.id, **doc.to_dict()}
    return None


def upsert_device_by_node_id(node_id: str, data: dict) -> str:
    """Dodaj ili ažuriraj GNS3 uređaj prema node_id. Vraća doc ID."""
    db = get_db()
    data['last_seen'] = datetime.now(timezone.utc)
    docs = db.collection('devices').where('gns3_node_id', '==', node_id).limit(1).stream()
    for doc in docs:
        db.collection('devices').document(doc.id).update(data)
        return doc.id
    ref = db.collection('devices').add(data)
    return ref[1].id

def delete_device(doc_id: str):
    get_db().collection('devices').document(doc_id).delete()


def set_device_deployment(doc_id: str, success: bool, template_name: str,
                          message: str, user_email: str = None):
    """Bilježi rezultat zadnjeg deployanja na uređaju."""
    get_db().collection('devices').document(doc_id).update({
        'status':              'konfiguriran' if success else 'nekonfiguriran',
        'last_deploy_time':    datetime.now(timezone.utc),
        'last_deploy_status':  'uspjeh' if success else 'greska',
        'last_deploy_template': template_name or '',
        'last_deploy_message': message or '',
        'last_deploy_user':    user_email or '',
        'last_seen':           datetime.now(timezone.utc),
    })

def count_devices_by_status(status: str) -> int:
    db = get_db()
    return len(list(db.collection('devices').where('status', '==', status).stream()))


# ─────────────────────────────────────────
# CONFIG TEMPLATES
# ─────────────────────────────────────────

def get_all_templates() -> list[dict]:
    db = get_db()
    return [{'id': d.id, **d.to_dict()} for d in db.collection('config_templates').stream()]

def get_template_by_name(name: str) -> dict | None:
    db = get_db()
    docs = db.collection('config_templates').where('name', '==', name).limit(1).stream()
    for doc in docs:
        return {'id': doc.id, **doc.to_dict()}
    return None


def get_template_by_id(doc_id: str) -> dict | None:
    db  = get_db()
    doc = db.collection('config_templates').document(doc_id).get()
    if doc.exists:
        return {'id': doc.id, **doc.to_dict()}
    return None

def delete_template(doc_id: str):
    get_db().collection('config_templates').document(doc_id).delete()

def upsert_template(name: str, device_type: str, content: str) -> str:
    db = get_db()
    existing = get_template_by_name(name)
    data = {'name': name, 'device_type': device_type, 'content': content}
    if existing:
        db.collection('config_templates').document(existing['id']).update(data)
        return existing['id']
    ref = db.collection('config_templates').add(data)
    return ref[1].id


# ─────────────────────────────────────────
# AUDIT LOGS
# ─────────────────────────────────────────

def add_audit_log(action: str, status: str,
                  user_email: str = None,
                  device_id: str = None,
                  template_name: str = None):
    db = get_db()
    db.collection('audit_logs').add({
        'timestamp':     datetime.now(timezone.utc),
        'user_email':    user_email or '',
        'action':        action,
        'device_id':     device_id or '',
        'template_name': template_name or '',
        'status':        status,
    })

def get_audit_logs(limit: int = 50) -> list[dict]:
    db = get_db()
    docs = (db.collection('audit_logs')
              .order_by('timestamp', direction=firestore.Query.DESCENDING)
              .limit(limit)
              .stream())
    result = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        # Pretvori Firestore Timestamp u string za prikaz
        if hasattr(d.get('timestamp'), 'strftime'):
            d['timestamp_str'] = d['timestamp'].strftime('%d.%m.%Y %H:%M:%S')
        else:
            d['timestamp_str'] = str(d.get('timestamp', ''))
        result.append(d)
    return result

def get_audit_logs_by_user(user_email: str, limit: int = 30) -> list[dict]:
    db = get_db()
    docs = (db.collection('audit_logs')
              .where('user_email', '==', user_email)
              .order_by('timestamp', direction=firestore.Query.DESCENDING)
              .limit(limit)
              .stream())
    result = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        if hasattr(d.get('timestamp'), 'strftime'):
            d['timestamp_str'] = d['timestamp'].strftime('%d.%m.%Y %H:%M:%S')
        else:
            d['timestamp_str'] = str(d.get('timestamp', ''))
        result.append(d)
    return result