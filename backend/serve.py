"""
Unified server: Flask API + React frontend static files
Serves with Gunicorn in production, Flask in development
"""
import os
from app import create_app
from flask import send_from_directory, send_file

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
# Fallback for Docker environment
if not os.path.exists(FRONTEND_DIST):
    FRONTEND_DIST = '/app/frontend/dist'

app = create_app()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    full_path = os.path.join(FRONTEND_DIST, path)
    if path and os.path.exists(full_path):
        return send_from_directory(FRONTEND_DIST, path)
    return send_file(os.path.join(FRONTEND_DIST, 'index.html'))

if __name__ == '__main__':
    print("\n🚀 FaceAttend running at http://localhost:5000")
    print("   Login: admin / admin123")
    print("   Kiosk: http://localhost:5000/kiosk\n")
    port = int(os.environ.get('PORT', 5000))
    # Dev server - gunicorn handles production
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
