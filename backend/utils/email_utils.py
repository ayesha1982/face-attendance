from datetime import date

def send_absence_alert(employee, absence_date=None):
    try:
        from extensions import mail
        from flask_mail import Message
        if not employee.email: return False
        if absence_date is None: absence_date = date.today()
        msg = Message(
            subject=f'Absence Alert - {employee.name} on {absence_date}',
            recipients=[employee.email],
            body=f'Dear {employee.name}, you were absent on {absence_date}. Please contact HR if this is an error.'
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f'Email error: {e}')
        return False
