import { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Clock, TrendingUp, Bell } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../utils/api'
import { format } from 'date-fns'

const COLORS = ['#3fb950', '#d29922', '#f85149', '#58a6ff']

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [todayData, setTodayData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertLoading, setAlertLoading] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/attendance/stats'),
      api.get('/attendance/today'),
    ]).then(([s, t]) => {
      setStats(s.data)
      setTodayData(t.data)
    }).finally(() => setLoading(false))
  }, [])

  const sendAlerts = async () => {
    setAlertLoading(true)
    try {
      const r = await api.post('/attendance/send-absence-alerts')
      setAlertMsg(`✅ Sent ${r.data.emails_sent} absence alerts`)
    } catch {
      setAlertMsg('Failed to send alerts')
    } finally {
      setAlertLoading(false)
      setTimeout(() => setAlertMsg(''), 4000)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>

  const today = stats?.today || {}
  const pieData = [
    { name: 'Present', value: today.present - today.late },
    { name: 'Late', value: today.late },
    { name: 'Absent', value: today.absent },
  ].filter(d => d.value > 0)

  const recentRecords = todayData?.records?.slice(0, 8) || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {alertMsg && <span style={{ fontSize: 13, color: 'var(--accent-green)' }}>{alertMsg}</span>}
          <button className="btn btn-ghost" onClick={sendAlerts} disabled={alertLoading}>
            <Bell size={15} />
            {alertLoading ? 'Sending...' : 'Send Absence Alerts'}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Employees', value: today.total || 0, icon: Users, color: '#58a6ff', bg: 'rgba(88,166,255,0.1)' },
          { label: 'Present Today', value: today.present || 0, icon: UserCheck, color: '#3fb950', bg: 'rgba(63,185,80,0.1)' },
          { label: 'Absent Today', value: today.absent || 0, icon: UserX, color: '#f85149', bg: 'rgba(248,81,73,0.1)' },
          { label: 'Late Arrivals', value: today.late || 0, icon: Clock, color: '#d29922', bg: 'rgba(210,153,34,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Pie chart */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Today's Overview</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No attendance data for today</p></div>
          )}
        </div>

        {/* Recent check-ins */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Recent Check-ins</h3>
          {recentRecords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentRecords.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: r.status === 'present' ? 'rgba(63,185,80,0.15)' : r.status === 'late' ? 'rgba(210,153,34,0.15)' : 'rgba(248,81,73,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: r.status === 'present' ? 'var(--accent-green)' : r.status === 'late' ? 'var(--accent-yellow)' : 'var(--accent-red)',
                    flexShrink: 0
                  }}>
                    {r.employee_name?.[0]}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.employee_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.department}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {r.check_in ? format(new Date(r.check_in), 'HH:mm') : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>No check-ins yet today</p></div>
          )}
        </div>
      </div>

      {/* Absent employees */}
      {todayData?.absent_employees?.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>Absent Today ({todayData.absent_employees.length})</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {todayData.absent_employees.map(emp => (
              <div key={emp.id} style={{
                padding: '6px 14px', background: 'rgba(248,81,73,0.08)',
                border: '1px solid rgba(248,81,73,0.2)',
                borderRadius: 20, fontSize: 13, color: 'var(--text-secondary)'
              }}>
                <span style={{ color: 'var(--accent-red)', marginRight: 6 }}>●</span>
                {emp.name}
                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>{emp.department}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
