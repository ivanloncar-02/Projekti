import os
import zipfile

project_files = {
    "requirements.txt": """Flask==3.0.2
Flask-SQLAlchemy==3.1.1
psycopg2-binary==2.9.9
firebase-admin==6.5.0
netmiko==4.3.0
python-dotenv==1.0.1
requests==2.31.0
""",

    ".env": """FLASK_ENV=development
SECRET_KEY=super-tajni-kljuc-za-flask
DATABASE_URL=postgresql://admin:password@localhost:5432/network_db
FIREBASE_CREDENTIALS_PATH=path/to/firebase-service-account.json
""",

    "config.py": """import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS_PATH')
""",

    "run.py": """from app import create_app

app = create_app()

if __name__ == '__main__':
    # Slušaj na 0.0.0.0 kako bi GNS3 uređaji mogli pristupiti serveru
    app.run(host='0.0.0.0', port=5000, debug=True)
""",

    "app/__init__.py": """from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import firebase_admin
from firebase_admin import credentials
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # Inicijalizacija Firebase SDK-a
    try:
        cred = credentials.Certificate(app.config['FIREBASE_CREDENTIALS'])
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase nije inicijaliziran (provjeri .env putanju): {e}")

    # Registracija Blueprinta
    from app.auth.routes import auth_bp
    from app.devices.routes import devices_bp
    from app.configs.routes import configs_bp
    from app.reports.routes import reports_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(devices_bp, url_prefix='/devices')
    app.register_blueprint(configs_bp, url_prefix='/configs')
    app.register_blueprint(reports_bp, url_prefix='/reports')

    return app
""",

    "app/models.py": """from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), default='user') # admin ili user
    logs = db.relationship('AuditLog', backref='user', lazy=True)

class Device(db.Model):
    __tablename__ = 'devices'
    id = db.Column(db.Integer, primary_key=True)
    hostname = db.Column(db.String(64), nullable=True)
    ip_address = db.Column(db.String(45), unique=True, nullable=False)
    mac_address = db.Column(db.String(17), unique=True, nullable=True)
    device_type = db.Column(db.String(32), nullable=False) # cisco_ios, mikrotik_routeros
    status = db.Column(db.String(20), default='nekonfiguriran') # konfiguriran / nekonfiguriran
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)

class ConfigTemplate(db.Model):
    __tablename__ = 'config_templates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    device_type = db.Column(db.String(32), nullable=False)
    content = db.Column(db.Text, nullable=False) # Jinja2 kod predloška

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(255), nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=True)
    status = db.Column(db.String(20), nullable=False) # uspjeh / greska
""",

    # --- PLUGINS / BLUEPRINTS ---
    "app/auth/__init__.py": """from flask import Blueprint
auth_bp = Blueprint('auth', __name__)
""",
    "app/auth/routes.py": """from flask import render_template, request, jsonify, redirect, url_prefix
from app.auth import auth_bp
from firebase_admin import auth
from app.models import User
from app import db

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Primanje Firebase ID Tokena s frontenda
        data = request.get_json()
        id_token = data.get('idToken')
        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            email = decoded_token['email']
            
            # Provjera korisnika u lokalnoj bazi
            user = User.query.filter_by(firebase_uid=uid).first()
            if not user:
                user = User(firebase_uid=uid, email=email, role='user')
                db.session.add(user)
                db.session.commit()
                
            return jsonify({"status": "success", "role": user.role})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 401
            
    return render_template('auth/login.html')
""",

    "app/devices/__init__.py": """from flask import Blueprint
devices_bp = Blueprint('devices', __name__)
""",
    "app/devices/routes.py": """from flask import render_template, jsonify, request
from app.devices import devices_bp
from app.models import Device
from app import db
import subprocess

@devices_bp.route('/')
def list_devices():
    devices = Device.query.all()
    return render_template('devices/list.html', devices=devices)

@devices_bp.route('/discover', methods=['POST'])
def discover_network():
    # Pokretanje pozadinske nmap skripte za detekciju mreže
    try:
        result = subprocess.run(['python', 'scripts/discover.py'], capture_output=True, text=True)
        return jsonify({"status": "success", "output": result.stdout})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
""",

    "app/configs/__init__.py": """from flask import Blueprint
configs_bp = Blueprint('configs', __name__)
""",
    "app/configs/routes.py": """from flask import render_template, request, jsonify, render_template_string
from app.configs import configs_bp
from app.models import Device, ConfigTemplate, AuditLog
from app import db
from jinja2 import Template

# Day-0 ZTP Endpoint za povlačenje skripti s routera
@configs_bp.route('/ztp/<mac_address>', methods=['GET'])
def ztp_provision(mac_address):
    device = Device.query.filter_by(mac_address=mac_address).first()
    if not device:
        # Automatska detekcija novog uređaja pri prvom javljanju
        device = Device(ip_address=request.remote_addr, mac_address=mac_address, device_type='cisco_ios', status='nekonfiguriran')
        db.session.add(device)
        db.session.commit()

    # Dohvati odgovarajući predložak
    template_obj = ConfigTemplate.query.filter_by(device_type=device.device_type).first()
    if not template_obj:
        return "# Predlozak nije pronaden", 404

    # Renderiranje Jinja2 mrežne konfiguracije
    j2_template = Template(template_obj.content)
    rendered_config = j2_template.render(device_name=f"Router-{mac_address.replace(':', '')}")
    
    return rendered_config

# Endpoint za primanje statusa deploymenta s uređaja
@configs_bp.route('/ztp/status', methods=['POST'])
def ztp_status():
    data = request.get_json()
    mac = data.get('mac_address')
    status = data.get('status') # 'uspjeh' ili 'greska'
    error_msg = data.get('error', '')

    device = Device.query.filter_by(mac_address=mac).first()
    if device:
        device.status = 'konfiguriran' if status == 'uspjeh' else 'nekonfiguriran'
        log = AuditLog(action=f"ZTP Deployment: {error_msg}".strip(), device_id=device.id, status=status)
        db.session.add(log)
        db.session.commit()
    return jsonify({"status": "received"})

@configs_bp.route('/templates')
def manage_templates():
    templates = ConfigTemplate.query.all()
    return render_template('configs/templates_manage.html', templates=templates)
""",

    "app/reports/__init__.py": """from flask import Blueprint
reports_bp = Blueprint('reports', __name__)
""",
    "app/reports/routes.py": """from flask import render_template, send_file
from app.reports import reports_bp
from app.models import Device, AuditLog

@reports_bp.route('/dashboard')
def dashboard():
    conf_count = Device.query.filter_by(status='konfiguriran').count()
    unconf_count = Device.query.filter_by(status='nekonfiguriran').count()
    return render_template('reports/dashboard.html', conf_count=conf_count, unconf_count=unconf_count)

@reports_bp.route('/pdf')
def export_pdf():
    # Placeholder za generiranje PDF izvještaja
    return "Ovdje implementirati generiranje PDF-a pomoću WeasyPrint ili pdfkit-a."
""",

    # --- HTML TEMPLATES ---
    "app/templates/base.html": """<!DOCTYPE html>
<html lang="hr">
<head>
    <meta charset="UTF-8">
    <title>Network Automation Manager</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
</head>
<body>
    <nav>
        <a href="/reports/dashboard">Dashboard</a> | 
        <a href="/devices/">Uređaji</a> | 
        <a href="/configs/templates">Predlošci</a>
    </nav>
    <hr>
    <div class="content">
        {% block content %}{% endblock %}
    </div>
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>
""",

    "app/templates/auth/login.html": """{% extends "base.html" %}
{% block content %}
<h2>Prijava u sustav</h2>
<form id="login-form">
    <input type="email" id="email" placeholder="Email" required><br><br>
    <input type="password" id="password" placeholder="Lozinka" required><br><br>
    <button type="submit">Prijavi se preko Firebase-a</button>
</form>
{% endblock %}
""",

    "app/templates/devices/list.html": """{% extends "base.html" %}
{% block content %}
<h2>Upravljanje mrežnim uređajima</h2>
<button onclick="discoverNetwork()">Pokreni mrežnu detekciju</button>
<table border="1" cellpadding="5" style="margin-top: 15px; width: 100%;">
    <tr>
        <th>Hostname</th>
        <th>IP Adresa</th>
        <th>MAC Adresa</th>
        <th>Tip Uređaja</th>
        <th>Status</th>
    </tr>
    {% for d in devices %}
    <tr>
        <td>{{ d.hostname or 'Nepoznato' }}</td>
        <td>{{ d.ip_address }}</td>
        <td>{{ d.mac_address }}</td>
        <td>{{ d.device_type }}</td>
        <td><strong>{{ d.status }}</strong></td>
    </tr>
    {% endfor %}
</table>
<script>
function discoverNetwork() {
    alert("Pokrećem mrežnu detekciju (Nmap)... Sačekajte.");
    fetch('/devices/discover', {method: 'POST'})
    .then(res => res.json())
    .then(data => { alert("Završeno! " + JSON.stringify(data)); location.reload(); });
}
</script>
{% endblock %}
""",

    "app/templates/configs/templates_manage.html": """{% extends "base.html" %}
{% block content %}
<h2>Konfiguracijski Predlošci (Jinja2)</h2>
<ul>
    {% for t in templates %}
    <li><strong>{{ t.name }}</strong> ({{ t.device_type }})</li>
    {% else %}
    <li>Nema spremljenih predložaka u bazi podataka.</li>
    {% endfor %}
</ul>
{% endblock %}
""",

    "app/templates/reports/dashboard.html": """{% extends "base.html" %}
{% block content %}
<h2>Statistika i Izvještaji</h2>
<p>Broj konfiguriranih uređaja: <strong>{{ conf_count }}</strong></p>
<p>Broj nekonfiguriranih uređaja: <strong>{{ unconf_count }}</strong></p>
<hr>
<a href="/reports/pdf" target="_blank"><button>Izvezi izvještaj u PDF obliku</button></a>
{% endblock %}
""",

    # --- STATIC ---
    "app/static/css/style.css": """body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4;}
nav { background: #333; padding: 10px; color: white; }
nav a { color: white; text-decoration: none; margin-right: 15px; }
table { border-collapse: collapse; background: white; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
button { padding: 10px 15px; background: #007bff; color: white; border: none; cursor: pointer; }
button:hover { background: #0056b3; }
""",

    "app/static/js/main.js": """// Ovdje unesi svoj Firebase Config objekt s Firebase konzole
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID"
};
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}
// Logika za Firebase login formu...
""",

    # --- SCRIPTS (AUTOMATION) ---
    "scripts/templates/cisco_ios.j2": """hostname {{ device_name }}
!
interface GigabitEthernet1
 description Spoj prema lokalnom Flask poslužitelju
 ip address {{ ip_address }} 255.255.255.0
 no shutdown
!
router ospf 1
 network 192.168.0.0 0.0.255.255 area 0
!
end
""",

    "scripts/templates/mikrotik.rsc.j2": """/system identity set name={{ device_name }}
/ip address add address={{ ip_address }}/24 interface=ether1
""",

    "scripts/deploy.py": """import sys
from netmiko import ConnectHandler

def deploy_configuration(ip, device_type, config_text):
    # Skripta koju poziva Flask kada radimo Day-1/2 Push modifikaciju
    device_params = {
        'device_type': device_type,
        'host': ip,
        'username': 'admin',
        'password': 'password',
    }
    try:
        with ConnectHandler(**device_params) as net_connect:
            net_connect.enable()
            output = net_connect.send_config_set(config_text.splitlines())
            return True, output
    except Exception as e:
        return False, str(e)

if __name__ == '__main__':
    print("Netmiko deployment skripta spremna.")
""",

    "scripts/discover.py": """import sys

def ping_sweep():
    # Ovdje se implementira nmap ili ping sweep za detekciju
    print("Mrežni scan završen. Pronađeni novi uređaji na 192.168.122.50")

if __name__ == '__main__':
    ping_sweep()
""",

    # --- GNS3 INTEGRACIJA ---
    "gns3/topology.py": """import requests

GNS3_SERVER = "http://localhost:3080/v2"

def get_projects():
    # Dohvaćanje topologija preko GNS3 REST API-ja
    try:
        response = requests.get(f"{GNS3_SERVER}/projects")
        return response.json()
    except Exception as e:
        return []

if __name__ == '__main__':
    print("GNS3 API integracija.")
""",

    "gns3/bridge.sh": """#!/bin/bash
# Skripta za kreiranje virtualnog TAP sučelja na Linuxu za spajanje GNS3 s Flaskom
sudo ip tuntap add mode tap tap0
sudo ip addr add 192.168.122.1/24 dev tap0
sudo ip link set dev tap0 up
echo "TAP sučelje tap0 je podignuto na IP: 192.168.122.1"
""",

    "gns3/dhcp_config.txt": """! Primjer Cisco IOS DHCP konfiguracije za ZTP unutar GNS3
ip dhcp pool ZTP_POOL
 network 192.168.122.0 255.255.255.0
 default-router 192.168.122.1
 dns-server 8.8.8.8
 ! Option 67 definira boot skriptu na Flask serveru (192.168.122.1:5000)
 option 67 ascii "http://192.168.122.1:5000/configs/ztp/auto-boot"
"""
}

def build_structure():
    print(" započinjem generiranje projekta 'network-config-manager'...")
    
    # Prvo stvori sve mape i datoteke
    for path, content in project_files.items():
        # Kreiraj direktorij ako ne postoji
        dir_name = os.path.dirname(path)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name)
            
        # Zapiši datoteku
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  Stvoreno: {path}")

    # Zatim sve spakiraj u ZIP arhivu
    zip_filename = "network-config-manager.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Izbjegavaj dodavanje same arhive ili skripte za generiranje u arhivu
            if "build_project.py" in files:
                files.remove("build_project.py")
            if zip_filename in files:
                files.remove(zip_filename)
            if ".git" in root:
                continue
                
            for file in files:
                file_path = os.path.join(root, file)
                # Relativna putanja unutar ZIP-a
                archive_name = os.path.relpath(file_path, start=".")
                zipf.write(file_path, archive_name)
                
    print(f"\\n Uspješno stvorena lokalna ZIP arhiva: {zip_filename}")
    print("Sada je možeš prenijeti, otpakirati ili odmah otvoriti u VS Codeu!")

if __name__ == '__main__':
    build_structure()