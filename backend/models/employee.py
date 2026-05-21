from extensions import db
from datetime import datetime

class Employee(db.Model):
    __tablename__ = 'employees'
    id            = db.Column(db.Integer, primary_key=True)
    emp_id        = db.Column(db.String(20), unique=True, nullable=False)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    department    = db.Column(db.String(80))
    designation   = db.Column(db.String(80))
    photo_path    = db.Column(db.String(255))
    face_encoding = db.Column(db.Text)
    is_active     = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    attendances   = db.relationship('Attendance', backref='employee', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'emp_id': self.emp_id, 'name': self.name,
            'email': self.email, 'department': self.department,
            'designation': self.designation, 'photo_path': self.photo_path,
            'has_face': self.face_encoding is not None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id          = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    date        = db.Column(db.Date, nullable=False)
    check_in    = db.Column(db.DateTime)
    check_out   = db.Column(db.DateTime)
    status      = db.Column(db.String(20), default='present')
    confidence  = db.Column(db.Float)
    notes       = db.Column(db.String(255))

    def to_dict(self):
        emp = self.employee
        return {
            'id': self.id, 'employee_id': self.employee_id,
            'employee_name': emp.name if emp else '',
            'emp_id': emp.emp_id if emp else '',
            'department': emp.department if emp else '',
            'date': self.date.isoformat(),
            'check_in':  self.check_in.isoformat()  if self.check_in  else None,
            'check_out': self.check_out.isoformat() if self.check_out else None,
            'status': self.status, 'confidence': self.confidence, 'notes': self.notes
        }
