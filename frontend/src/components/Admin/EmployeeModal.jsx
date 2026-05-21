import { useState, useRef } from 'react'
import { X, Camera, Upload, User } from 'lucide-react'
import api from '../../utils/api'

const DEPARTMENTS = ['Engineering', 'Design', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations', 'Management']

export default function EmployeeModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState({
    emp_id: employee?.emp_id || '',
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    face_image: null,
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraMode, setCameraMode] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraMode(true)
    } catch {
      setError('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraMode(false)
  }

  const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPreview(dataUrl)
    setForm(f => ({ ...f, face_image: dataUrl }))
    stopCamera()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setPreview(dataUrl)
      setForm(f => ({ ...f, face_image: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (employee?.id) {
        await api.put(`/employees/${employee.id}`, form)
      } else {
        await api.post('/employees/', form)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <h3>{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Employee ID *</label>
              <input className="input" value={form.emp_id} onChange={e => setForm(f => ({ ...f, emp_id: e.target.value }))} required disabled={!!employee} placeholder="EMP001" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="John Doe" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="john@company.com" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Department</label>
              <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label>Designation</label>
              <input className="input" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="Software Engineer" />
            </div>
          </div>

          {/* Face Photo Section */}
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <label>Face Photo (for Recognition)</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Preview */}
              <div style={{
                width: 120, height: 130, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={40} color="var(--text-disabled)" />
                )}
              </div>

              {/* Camera */}
              <div style={{ flex: 1 }}>
                {cameraMode ? (
                  <div>
                    <video ref={videoRef} style={{ width: '100%', borderRadius: 8, background: '#000', maxHeight: 200 }} muted playsInline />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button type="button" className="btn btn-primary btn-sm" onClick={capturePhoto}><Camera size={14} />Capture</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={stopCamera}><X size={14} />Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={startCamera}><Camera size={14} />Use Camera</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current.click()}><Upload size={14} />Upload Photo</button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Clear, front-facing photo for best results</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <div style={{ color: 'var(--accent-red)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(248,81,73,0.1)', borderRadius: 6 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #fff3', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /></> : null}
              {loading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
