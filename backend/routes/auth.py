from flask import Blueprint, request, jsonify, session
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    from models.user import User
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username','')).first()
    if user and user.check_password(data.get('password','')):
        session['user_id'] = user.id
        session['role']    = user.role
        return jsonify({'success': True, 'user': user.to_dict()})
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@auth_bp.route('/me', methods=['GET'])
def me():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'authenticated': False}), 401
    from models.user import User
    user = User.query.get(uid)
    if not user:
        return jsonify({'authenticated': False}), 401
    return jsonify({'authenticated': True, 'user': user.to_dict()})

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401
    from models.user import User
    data = request.get_json()
    user = User.query.get(uid)
    if not user.check_password(data.get('current_password', '')):
        return jsonify({'error': 'Current password incorrect'}), 400
    user.set_password(data.get('new_password', ''))
    db.session.commit()
    return jsonify({'success': True})
