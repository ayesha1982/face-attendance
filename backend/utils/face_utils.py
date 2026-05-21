import os, json, base64
import numpy as np
from datetime import datetime

def encode_face_from_base64(b64, temp_dir):
    try:
        from deepface import DeepFace
        data = b64.split(',')[1] if ',' in b64 else b64
        path = os.path.join(temp_dir, f'tmp_{datetime.now().strftime("%f")}.jpg')
        with open(path,'wb') as f: f.write(base64.b64decode(data))
        try:
            res = DeepFace.represent(img_path=path, model_name='Facenet512', enforce_detection=True)
            return json.dumps(res[0]['embedding']) if res else None
        finally:
            if os.path.exists(path): os.remove(path)
    except Exception as e:
        print(f'Encode error: {e}')
        return None

def recognize_face(b64, employees, temp_dir, threshold=0.65):
    try:
        from deepface import DeepFace
        import scipy.spatial.distance as dist
        data = b64.split(',')[1] if ',' in b64 else b64
        path = os.path.join(temp_dir, f'scan_{datetime.now().strftime("%f")}.jpg')
        with open(path,'wb') as f: f.write(base64.b64decode(data))
        try:
            res = DeepFace.represent(img_path=path, model_name='Facenet512', enforce_detection=True)
            if not res: return None, 0
            incoming = np.array(res[0]['embedding'])
        except Exception as e:
            print(f'No face in frame: {e}')
            return None, 0
        finally:
            if os.path.exists(path): os.remove(path)
        best, best_conf = None, 0
        for emp in employees:
            if not emp.face_encoding: continue
            try:
                stored = np.array(json.loads(emp.face_encoding))
                sim = 1 - dist.cosine(incoming, stored)
                if sim > best_conf: best_conf, best = sim, emp
            except: pass
        if best_conf >= threshold:
            return best, round(best_conf*100, 2)
        return None, 0
    except Exception as e:
        print(f'Recognition error: {e}')
        return None, 0

def save_employee_photo(b64, emp_id, upload_dir):
    try:
        data = b64.split(',')[1] if ',' in b64 else b64
        fname = f'{emp_id}_{datetime.now().strftime("%Y%m%d%H%M%S")}.jpg'
        path  = os.path.join(upload_dir, 'registered', fname)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path,'wb') as f: f.write(base64.b64decode(data))
        return path, fname
    except Exception as e:
        print(f'Photo save error: {e}')
        return None, None
