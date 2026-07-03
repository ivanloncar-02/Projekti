from flask import render_template, request, jsonify, redirect, session, url_for
from app.auth import auth_bp
from firebase_admin import auth
from app.firebase_db import get_user_by_uid, create_user, count_users


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('reports.dashboard'))

    if request.method == 'POST':
        data     = request.get_json()
        id_token = data.get('idToken')
        try:
            decoded = auth.verify_id_token(id_token)
            uid     = decoded['uid']

            user = get_user_by_uid(uid)
            if not user:
                return jsonify({"status": "error",
                                "message": "Korisnik nije registriran. Molim registrirajte se."}), 403

            session['user_id']    = user['id']
            session['user_email'] = user['email']
            session['user_role']  = user['role']
            return jsonify({"status": "success", "role": user['role']})

        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 401

    return render_template('auth/login.html')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('reports.dashboard'))

    if request.method == 'POST':
        data     = request.get_json()
        id_token = data.get('idToken')
        try:
            decoded = auth.verify_id_token(id_token)
            uid     = decoded['uid']
            email   = decoded['email']

            user = get_user_by_uid(uid)
            if not user:
                role = 'admin' if count_users() == 0 else 'user'
                user = create_user(uid, email, role)

            return jsonify({"status": "success",
                            "message": f"Registracija uspješna. Uloga: {user['role']}"})

        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 400

    return render_template('auth/register.html')


@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))