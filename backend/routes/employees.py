import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from extensions import db

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('/', methods=['GET'])
def get_employees():
    from models.employee import Employee
    employees = Employee.query.filter_by(is_active=True).all()
    return jsonify([e.to_dict() for e in employees])

@employees_bp.route('/<int:eid>', methods=['GET'])
def get_employee(eid):
    from models.employee import Employee
    emp = Employee.query.get_or_404(eid)
    return jsonify(emp.to_dict())

@employees_bp.route('/', methods=['POST'])
def create_employee():
    from models.employee import Employee
    data = request.get_json()
    for f in ['emp_id','name','email']:
        if not data.get(f):
            return jsonify({'error': f'{f} is required'}), 400
    if Employee.query.filter_by(emp_id=data['emp_id']).first():
        return jsonify({'error': 'Employee ID already exists'}), 409
    if Employee.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    emp = Employee(
        emp_id=data['emp_id'], name=data['name'], email=data['email'],
        department=data.get('department',''), designation=data.get('designation','')
    )
    if data.get('face_image'):
        _register_face(emp, data['face_image'], current_app)
    db.session.add(emp)
    db.session.commit()
    return jsonify({'success': True, 'employee': emp.to_dict()}), 201

@employees_bp.route('/<int:eid>', methods=['PUT'])
def update_employee(eid):
    from models.employee import Employee
    emp = Employee.query.get_or_404(eid)
    data = request.get_json()
    for f in ['name','email','department','designation']:
        if f in data:
            setattr(emp, f, data[f])
    if data.get('face_image'):
        _register_face(emp, data['face_image'], current_app)
    db.session.commit()
    return jsonify({'success': True, 'employee': emp.to_dict()})

@employees_bp.route('/<int:eid>', methods=['DELETE'])
def delete_employee(eid):
    from models.employee import Employee
    emp = Employee.query.get_or_404(eid)
    emp.is_active = False
    db.session.commit()
    return jsonify({'success': True})

@employees_bp.route('/photo/<path:filename>')
def get_photo(filename):
    return send_from_directory(
        os.path.join(current_app.config['UPLOAD_FOLDER'], 'registered'), filename
    )

@employees_bp.route('/<int:eid>/register-face', methods=['POST'])
def register_face(eid):
    from models.employee import Employee
    emp = Employee.query.get_or_404(eid)
    data = request.get_json()
    if not data.get('face_image'):
        return jsonify({'error': 'No image provided'}), 400
    ok = _register_face(emp, data['face_image'], current_app)
    if ok:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Face registered'})
    return jsonify({'success': False, 'error': 'No face detected'}), 400

def _register_face(emp, face_image, app):
    from utils.face_utils import encode_face_from_base64, save_employee_photo
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    path, fname = save_employee_photo(face_image, emp.emp_id, app.config['UPLOAD_FOLDER'])
    if fname:
        emp.photo_path = fname
    encoding = encode_face_from_base64(face_image, temp_dir)
    if encoding:
        emp.face_encoding = encoding
        return True
    return False
