import os
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from datetime import datetime, date, time as dtime

attendance_bp = Blueprint('attendance', __name__)
LATE_THRESHOLD = dtime(9, 30)

@attendance_bp.route('/scan', methods=['POST'])
def scan_face():
    from models.employee import Employee, Attendance
    from utils.face_utils import recognize_face
    data = request.get_json()
    if not data.get('image'):
        return jsonify({'error': 'No image provided'}), 400
    employees = Employee.query.filter_by(is_active=True).filter(
        Employee.face_encoding.isnot(None)).all()
    if not employees:
        return jsonify({'error': 'No registered faces'}), 404
    temp_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    matched, confidence = recognize_face(data['image'], employees, temp_dir)
    if not matched:
        return jsonify({'recognized': False, 'message': 'Face not recognized. Please try again.'})
    today = date.today()
    now   = datetime.now()
    existing = Attendance.query.filter_by(employee_id=matched.id, date=today).first()
    if existing:
        if existing.check_out:
            return jsonify({'recognized': True, 'already_completed': True,
                'employee': matched.to_dict(), 'attendance': existing.to_dict(),
                'message': f'Attendance already complete for {matched.name} today.'})
        existing.check_out = now
        db.session.commit()
        dur = now - existing.check_in
        h, m = dur.seconds//3600, (dur.seconds%3600)//60
        return jsonify({'recognized': True, 'action': 'checkout',
            'employee': matched.to_dict(), 'attendance': existing.to_dict(),
            'confidence': confidence, 'message': f'Goodbye {matched.name}! {h}h {m}m'})
    status = 'late' if now.time() > LATE_THRESHOLD else 'present'
    rec = Attendance(employee_id=matched.id, date=today, check_in=now,
                     status=status, confidence=confidence)
    db.session.add(rec)
    db.session.commit()
    msg = f'Welcome {matched.name}! {"⚠️ Late" if status=="late" else "✅ On time"}'
    return jsonify({'recognized': True, 'action': 'checkin',
        'employee': matched.to_dict(), 'attendance': rec.to_dict(),
        'confidence': confidence, 'message': msg, 'status': status})

@attendance_bp.route('/today', methods=['GET'])
def today_attendance():
    from models.employee import Employee, Attendance
    today   = date.today()
    records = Attendance.query.filter_by(date=today).all()
    all_emp = Employee.query.filter_by(is_active=True).all()
    present_ids = {r.employee_id for r in records}
    absent = [e for e in all_emp if e.id not in present_ids]
    return jsonify({
        'date': today.isoformat(),
        'total_employees': len(all_emp),
        'present': len([r for r in records if r.status in ['present','late']]),
        'late':    len([r for r in records if r.status == 'late']),
        'absent':  len(absent),
        'records': [r.to_dict() for r in records],
        'absent_employees': [e.to_dict() for e in absent]
    })

@attendance_bp.route('/history', methods=['GET'])
def attendance_history():
    from models.employee import Employee, Attendance
    q = Attendance.query.join(Employee)
    sd = request.args.get('start_date')
    ed = request.args.get('end_date')
    ei = request.args.get('employee_id')
    dp = request.args.get('department')
    if sd: q = q.filter(Attendance.date >= datetime.strptime(sd,'%Y-%m-%d').date())
    if ed: q = q.filter(Attendance.date <= datetime.strptime(ed,'%Y-%m-%d').date())
    if ei: q = q.filter(Attendance.employee_id == int(ei))
    if dp: q = q.filter(Employee.department == dp)
    records = q.order_by(Attendance.date.desc()).all()
    return jsonify([r.to_dict() for r in records])

@attendance_bp.route('/stats', methods=['GET'])
def stats():
    from models.employee import Employee, Attendance
    today  = date.today()
    trecs  = Attendance.query.filter_by(date=today).all()
    total  = Employee.query.filter_by(is_active=True).count()
    month_start = today.replace(day=1)
    mrecs  = Attendance.query.filter(
        Attendance.date >= month_start, Attendance.date <= today).all()
    return jsonify({
        'today': {
            'total': total,
            'present': len([r for r in trecs if r.status in ['present','late']]),
            'late':    len([r for r in trecs if r.status == 'late']),
            'absent':  total - len(trecs),
            'checked_out': len([r for r in trecs if r.check_out])
        },
        'this_month': {
            'total_records': len(mrecs),
            'present_days': len([r for r in mrecs if r.status == 'present']),
            'late_days':    len([r for r in mrecs if r.status == 'late'])
        }
    })

@attendance_bp.route('/send-absence-alerts', methods=['POST'])
def send_absence_alerts():
    from models.employee import Employee, Attendance
    from utils.email_utils import send_absence_alert
    today = date.today()
    all_emp = Employee.query.filter_by(is_active=True).all()
    present_ids = {r.employee_id for r in Attendance.query.filter_by(date=today).all()}
    absent  = [e for e in all_emp if e.id not in present_ids]
    sent    = sum(1 for e in absent if send_absence_alert(e, today))
    return jsonify({'success': True, 'absent_count': len(absent), 'emails_sent': sent})
