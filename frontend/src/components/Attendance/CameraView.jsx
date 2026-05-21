import { useRef, useState, useEffect, useCallback } from 'react'
import { Camera, CameraOff, RefreshCw } from 'lucide-react'

export default function CameraView({ onCapture, scanning = false, status = 'idle', autoScan = false, scanInterval = 3000 }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('user')

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.')
      setCameraActive(false)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    setCameraActive(false)
  }, [])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return null
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [cameraActive])

  const handleManualCapture = () => {
    const frame = captureFrame()
    if (frame && onCapture) onCapture(frame)
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (autoScan && cameraActive && onCapture) {
      intervalRef.current = setInterval(() => {
        const frame = captureFrame()
        if (frame) onCapture(frame)
      }, scanInterval)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoScan, cameraActive, scanInterval])

  const containerClass = `camera-container ${status === 'scanning' ? 'scanning' : status === 'success' ? 'success' : status === 'error' ? 'error' : ''}`

  return (
    <div>
      <div className={containerClass} style={{ maxWidth: '100%' }}>
        {error ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: 12, padding: 24, minHeight: 280
          }}>
            <CameraOff size={40} color="var(--accent-red)" />
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={startCamera}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="camera-video" muted playsInline />
            <canvas ref={canvasRef} className="camera-canvas" />

            {scanning && <div className="scan-line" />}

            {/* Face guide overlay */}
            <div className="face-overlay">
              <div className="face-frame" style={{
                borderColor: status === 'success' ? 'var(--accent-green)' :
                             status === 'error' ? 'var(--accent-red)' :
                             'rgba(88,166,255,0.5)'
              }} />
            </div>

            {/* Status indicator */}
            {scanning && (
              <div style={{
                position: 'absolute', top: 12, left: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,0,0,0.7)',
                borderRadius: 20, padding: '4px 12px',
                fontSize: 12, color: 'var(--accent-blue)'
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent-blue)',
                  animation: 'pulse 1.5s ease infinite'
                }} />
                SCANNING
              </div>
            )}
          </>
        )}
      </div>

      {!autoScan && cameraActive && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            className={`btn btn-primary ${scanning ? '' : ''}`}
            onClick={handleManualCapture}
            disabled={scanning || !cameraActive}
            style={{ flex: 1 }}
          >
            <Camera size={16} />
            {scanning ? 'Processing...' : 'Scan Face'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setFacingMode(f => f === 'user' ? 'environment' : 'user')
              stopCamera()
              setTimeout(startCamera, 300)
            }}
            title="Flip camera"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
