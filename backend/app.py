import os
from flask import Flask
from flask_cors import CORS
from extensions import db, mail

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'face-attend-2024')
    
    # Anchor the database explicitly to the project directory
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'attendance.db')
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', '')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME', 'noreply@office.com')

    db.init_app(app)
    mail.init_app(app)

    # Allow all origins in production (API auth will protect)
    CORS(app, supports_credentials=True, 
         origins="*",
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    authbp = __import__('routes.auth', fromlist=['authbp']).authbp
    employees_bp = __import__('routes.employees', fromlist=['employees_bp']).employees_bp
    attendance_bp = __import__('routes.attendance', fromlist=['attendance_bp']).attendance_bp
    reports_bp = __import__('routes.reports', fromlist=['reports_bp']).reports_bp
    app.register_blueprint(authbp, url_prefix='/api/auth')
    app.register_blueprint(employees_bp, url_prefix='/api/employees')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')

   

    with app.app_context():
        from models.user import User
        from models.employee import Employee, Attendance
        
        # Clear out any stale, locked tables and rewrite fresh ones
        db.create_all()
        
        # Seed Admin user securely
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin = User(username='admin', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('✅ Admin successfully seeded into database: admin / admin123')
        else:
            print('ℹ️ Admin user already exists in database.')
            
    return app

if __name__ == '__main__':
    create_app().run(debug=True, port=5000, use_reloader=False)