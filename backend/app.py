import os
from flask import Flask
from flask_cors import CORS
from extensions import db, mail

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY']                  = os.environ.get('SECRET_KEY','face-attend-2024')
    app.config['SQLALCHEMY_DATABASE_URI']     = 'sqlite:///' + os.path.join(os.path.dirname(__file__),'attendance.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER']               = os.path.join(os.path.dirname(__file__),'uploads')
    app.config['MAX_CONTENT_LENGTH']          = 16 * 1024 * 1024
    app.config['MAIL_SERVER']   = os.environ.get('MAIL_SERVER','smtp.gmail.com')
    app.config['MAIL_PORT']     = int(os.environ.get('MAIL_PORT',587))
    app.config['MAIL_USE_TLS']  = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME','')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD','')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME','noreply@office.com')

    # Allow all origins for deployed version (requests will have proper auth)
    CORS(app, supports_credentials=True)
    db.init_app(app)
    mail.init_app(app)

    from routes.auth       import auth_bp
    from routes.employees  import employees_bp
    from routes.attendance import attendance_bp
    from routes.reports    import reports_bp
    app.register_blueprint(auth_bp,       url_prefix='/api/auth')
    app.register_blueprint(employees_bp,  url_prefix='/api/employees')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(reports_bp,    url_prefix='/api/reports')

    with app.app_context():
        from models.user import User
        from models.employee import Employee, Attendance
        db.create_all()
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('✅ Admin seeded  admin / admin123')
    return app

if __name__ == '__main__':
    create_app().run(debug=True, port=5000, use_reloader=False)
