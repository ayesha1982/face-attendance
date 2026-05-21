from flask import Blueprint, request, jsonify, session
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
        
    from models.user import User
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user:
            return jsonify({'success': False, 'error': 'Invalid username or password'}), 401
        
        if not user.check_password(password):
            return jsonify({'success': False, 'error': 'Invalid username or password'}), 401
        
        # Set permanent session
        from flask import session as flask_session
        flask_session.permanent = True
        flask_session['user_id'] = user.id
        flask_session['role'] = user.role
        
        return jsonify({'success': True, 'user': user.to_dict()}), 200
    except Exception as e:
        print(f'Login error: {str(e)}')
        return jsonify({'success': False, 'error': 'Login failed'}), 500

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
