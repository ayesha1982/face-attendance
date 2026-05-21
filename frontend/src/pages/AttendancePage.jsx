import { useState, useEffect } from 'react'
import { Search, CalendarCheck, Clock, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import api from '../utils/api'

export default function AttendancePage() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    start_date: format(new Date(), 'yyyy-MM-01'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    employee_id: '',
    department: '',
  })

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]

  useEffect(() => {
    api.get('/employees/').then(r => setEmployees(r.data))
  }, [])

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/attendance/history?${params}`)
      .then(r => setRecords(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const statusCounts = {
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length,
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Log</h1>
          <p className="page-subtitle">{records.length} records found</p>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Present', count: statusCounts.present, color: 'var(--accent-green)', bg: 'rgba(63,185,80,0.1)' },
          { label: 'Late', count: statusCounts.late, color: 'var(--accent-yellow)', bg: 'rgba(210,153,34,0.1)' },
          { label: 'Absent', count: statusCounts.absent, color: 'var(--accent-red)', bg: 'rgba(248,81,73,0.1)' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{ padding: '10px 18px', background: bg, borderRadius: 10, fontSize: 13 }}>
            <span style={{ color, fontWeight: 700, fontSize: 18, marginRight: 6 }}>{count}</span>
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ margin: 0, flex: '0 0 150px' }}>
          <label>From</label>
          <input type="date" className="input" value={filters.start_date} onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} />
        </div>
        <div className="form-group" style={{ margin: 0, flex: '0 0 150px' }}>
          <label>To</label>
          <input type="date" className="input" value={filters.end_date} onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} />
        </div>
        <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
          <label>Employee</label>
          <select className="input" value={filters.employee_id} onChange={e => setFilters(f => ({ ...f, employee_id: e.target.value }))}>
            <option value="">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
          <label>Department</label>
          <select className="input" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={load} style={{ marginBottom: 0 }}>
          <Search size={15} /> Search
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>ID</th>
              <th>Department</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</td></tr>
            ) : records.map(r => {
              let duration = '-'
              if (r.check_in && r.check_out) {
                const diff = (new Date(r.check_out) - new Date(r.check_in)) / 1000 / 60
                const h = Math.floor(diff / 60), m = Math.round(diff % 60)
                duration = `${h}h ${m}m`
              }
              return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.employee_name}</td>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: 12 }}>{r.emp_id}</td>
                  <td>{r.department || '-'}</td>
                  <td>{r.date ? format(new Date(r.date), 'dd MMM yyyy') : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CalendarCheck size={13} color="var(--accent-green)" />
                      {r.check_in ? format(new Date(r.check_in), 'HH:mm') : '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <LogOut size={13} color="var(--accent-blue)" />
                      {r.check_out ? format(new Date(r.check_out), 'HH:mm') : '-'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{duration}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {r.confidence ? `${r.confidence}%` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
