import { useState, useRef, useEffect, useCallback } from 'react'
import { Scan, CheckCircle, XCircle, Clock, UserCheck, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import api from '../utils/api'

const SCAN_INTERVAL = 3500  // ms between auto-scans
const RESULT_DISPLAY = 4000 // ms to show result

export default function KioskPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [scanState, setScanState] = useState('idle') // idle | scanning | success | error | unknown
  const [result, setResult] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isProcessing, setIsProcessing] = useState(false)

  // Clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Start camera
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      } catch (e) {
        setScanState('error')
        setResult({ message: 'Camera access denied. Please allow camera permission.' })
      }
    }
    start()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const captureAndScan = useCallback(async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current || !cameraReady) return

    setIsProcessing(true)
    setScanState('scanning')

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const image = canvas.toDataURL('image/jpeg', 0.85)

    try {
      const resp = await api.post('/attendance/scan', { image })
      const data = resp.data

      if (data.recognized) {
        if (data.already_completed) {
          setScanState('error')
          setResult({ ...data, icon: 'warning' })
        } else {
          setScanState('success')
          setResult(data)
        }
      } else {
        setScanState('unknown')
        setResult(data)
      }
    } catch {
      setScanState('error')
      setResult({ message: 'Connection error. Please try again.' })
    }

    setTimeout(() => {
      setScanState('idle')
      setResult(null)
      setIsProcessing(false)
    }, RESULT_DISPLAY)
  }, [isProcessing, cameraReady])

  // Auto-scan loop
  useEffect(() => {
    if (cameraReady) {
      intervalRef.current = setInterval(captureAndScan, SCAN_INTERVAL)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [cameraReady, captureAndScan])

  const borderColor = scanState === 'success' ? 'var(--accent-green)' :
    scanState === 'error' || scanState === 'unknown' ? 'var(--accent-red)' :
    scanState === 'scanning' ? 'var(--accent-blue)' : 'var(--border)'

  const glowColor = scanState === 'success' ? 'rgba(63,185,80,0.3)' :
    scanState === 'scanning' ? 'rgba(88,166,255,0.3)' : 'transparent'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(var(--border-light) 1px, transparent 1px), linear-gradient(90deg, var(--border-light) 1px, transparent 1px)`,
        backgroundSize: '64px 64px', opacity: 0.3
      }} />

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent-blue-dim), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Scan size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            FaceAttend
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {format(currentTime, 'EEEE, MMMM d')}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, paddingTop: 56 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: 4, color: 'var(--text-primary)' }}>
            Face Recognition Check-In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Position your face in the frame
          </p>
        </div>

        {/* Camera box */}
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: `3px solid ${borderColor}`,
          boxShadow: `0 0 40px ${glowColor}`,
          transition: 'all 0.3s',
          aspectRatio: '4/3',
          background: '#000'
        }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Scan line */}
          {scanState === 'scanning' && <div className="scan-line" />}

          {/* Face oval */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{
              width: 200, height: 240,
              border: `2px dashed ${borderColor}`,
              borderRadius: '50%',
              opacity: 0.7,
              transition: 'all 0.3s',
              boxShadow: scanState === 'success' ? '0 0 20px rgba(63,185,80,0.4)' : 'none'
            }} />
          </div>

          {/* Status overlay on result */}
          {result && (
            <div style={{
              position: 'absolute', inset: 0,
              background: scanState === 'success' ? 'rgba(13,40,24,0.85)' : 'rgba(45,15,15,0.85)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 24,
              animation: 'fadeIn 0.3s ease'
            }}>
              {scanState === 'success' ? (
                <>
                  <CheckCircle size={56} color="var(--accent-green)" style={{ marginBottom: 12 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent-green)', marginBottom: 4 }}>
                    {result.action === 'checkin' ? 'CHECKED IN' : 'CHECKED OUT'}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {result.employee?.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {result.employee?.department} · {result.employee?.designation}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--accent-green)' }}>
                    {result.message}
                  </div>
                  {result.confidence && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      Confidence: {result.confidence}%
                    </div>
                  )}
                </>
              ) : (
                <>
                  {scanState === 'unknown' ? (
                    <XCircle size={56} color="var(--accent-red)" style={{ marginBottom: 12 }} />
                  ) : (
                    <AlertTriangle size={56} color="var(--accent-yellow)" style={{ marginBottom: 12 }} />
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: scanState === 'unknown' ? 'var(--accent-red)' : 'var(--accent-yellow)', marginBottom: 8 }}>
                    {scanState === 'unknown' ? 'NOT RECOGNIZED' : 'NOTICE'}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {result.message}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Status badge */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: 20, padding: '5px 16px',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: borderColor,
            whiteSpace: 'nowrap'
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: borderColor,
              animation: scanState === 'scanning' ? 'pulse 1s infinite' : 'none'
            }} />
            {scanState === 'idle' ? 'READY TO SCAN' :
             scanState === 'scanning' ? 'SCANNING...' :
             scanState === 'success' ? 'RECOGNIZED' :
             scanState === 'unknown' ? 'UNRECOGNIZED' : 'ERROR'}
          </div>
        </div>

        {/* Manual scan button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 16, justifyContent: 'center', padding: '14px' }}
          onClick={captureAndScan}
          disabled={isProcessing || !cameraReady}
        >
          <UserCheck size={18} />
          {isProcessing ? 'Processing...' : 'Tap to Scan'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          Auto-scanning every {SCAN_INTERVAL / 1000}s · Powered by DeepFace
        </p>
      </div>
    </div>
  )
}
