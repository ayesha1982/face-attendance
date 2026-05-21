import { useState, useEffect } from 'react'
import { Download, FileText, Sheet, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { format } from 'date-fns'
import api from '../utils/api'

export default function ReportsPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    start_date: format(new Date(), 'yyyy-MM-01'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    department: '',
  })
  const [exporting, setExporting] = useState('')

  const loadSummary = () => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/reports/summary?${params}`)
      .then(r => setSummary(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadSummary() }, [])

  const handleExport = async (type) => {
    setExporting(type)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      const response = await fetch(`/api/reports/${type}?${params}`, { credentials: 'include' })
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_${filters.start_date}_to_${filters.end_date}.${type === 'excel' ? 'xlsx' : 'pdf'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export failed. Make sure the backend is running.')
    } finally {
      setExporting('')
    }
  }

  const deptChartData = summary ? Object.entries(summary.by_department || {}).map(([dept, counts]) => ({
    dept: dept.length > 10 ? dept.slice(0, 10) + '…' : dept,
    Present: counts.present,
    Late: counts.late,
    Absent: counts.absent,
  })) : []

  const attendanceRate = summary && summary.total_records > 0
    ? Math.round(((summary.present + summary.late) / summary.total_records) * 100)
    : 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Export and analyze attendance data</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => handleExport('excel')} disabled={exporting === 'excel'}>
            <Sheet size={15} />
            {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'}>
            <Download size={15} />
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label>From</label>
          <input type="date" className="input" value={filters.start_date} onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label>To</label>
          <input type="date" className="input" value={filters.end_date} onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} />
        </div>
        <button className="btn btn-ghost" onClick={loadSummary}>
          <BarChart3 size={15} /> Generate Report
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <>
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Records', value: summary.total_records, color: 'var(--accent-blue)' },
              { label: 'Present', value: summary.present, color: 'var(--accent-green)' },
              { label: 'Late', value: summary.late, color: 'var(--accent-yellow)' },
              { label: 'Absent', value: summary.absent, color: 'var(--accent-red)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Attendance rate */}
          <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attendance Rate</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: attendanceRate >= 80 ? 'var(--accent-green)' : attendanceRate >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
                {attendanceRate}%
              </div>
            </div>
            <div style={{ flex: 1, height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${attendanceRate}%`,
                background: attendanceRate >= 80 ? 'var(--accent-green)' : attendanceRate >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                borderRadius: 6,
                transition: 'width 1s ease'
              }} />
            </div>
          </div>

          {/* Department chart */}
          {deptChartData.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>By Department</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="dept" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  />
                  <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="Present" fill="#3fb950" radius={[4,4,0,0]} />
                  <Bar dataKey="Late" fill="#d29922" radius={[4,4,0,0]} />
                  <Bar dataKey="Absent" fill="#f85149" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {loading && <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner" /></div>}
    </div>
  )
}
