from flask import Flask, redirect, url_for, request, session
import firebase_admin
from firebase_admin import credentials
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicijalizacija Firebase Admin SDK
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(app.config['FIREBASE_CREDENTIALS'])
            firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase nije inicijaliziran: {e}")

    # Registracija Blueprinta
    from app.auth.auth import auth_bp
    from app.devices.devices import devices_bp
    from app.configs.configs import configs_bp
    from app.reports import reports_bp
    from app.deploy import deploy_bp

    app.register_blueprint(auth_bp,     url_prefix='/auth')
    app.register_blueprint(devices_bp,  url_prefix='/devices')
    app.register_blueprint(configs_bp,  url_prefix='/configs')
    app.register_blueprint(reports_bp,  url_prefix='/reports')
    app.register_blueprint(deploy_bp,   url_prefix='/deploy')

    @app.before_request
    def require_login():
        allowed = ['auth.login', 'auth.register', 'static']
        if request.endpoint and request.endpoint not in allowed:
            if 'user_id' not in session:
                return redirect(url_for('auth.login'))

    @app.route('/')
    def index():
        return redirect(url_for('reports.dashboard'))

    return app