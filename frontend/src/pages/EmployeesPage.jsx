import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, UserCheck, User, Camera } from 'lucide-react'
import api from '../utils/api'
import EmployeeModal from '../components/Admin/EmployeeModal'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmp, setEditingEmp] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/employees/')
      .then(r => { setEmployees(r.data); setFiltered(r.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let list = employees
    if (search) list = list.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.emp_id.toLowerCase().includes(search.toLowerCase()))
    if (deptFilter) list = list.filter(e => e.department === deptFilter)
    setFiltered(list)
  }, [search, deptFilter, employees])

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this employee?')) return
    setDeletingId(id)
    await api.delete(`/employees/${id}`)
    setDeletingId(null)
    load()
  }

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} registered · {employees.filter(e => e.has_face).length} with face data</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingEmp(null); setModalOpen(true) }}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ flex: '0 0 200px' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Employee cards grid */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map(emp => (
              <div key={emp.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: emp.has_face ? 'rgba(63,185,80,0.15)' : 'var(--bg-tertiary)',
                    border: `2px solid ${emp.has_face ? 'var(--accent-green)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: emp.has_face ? 'var(--accent-green)' : 'var(--text-muted)'
                  }}>
                    {emp.name[0]}
                  </div>

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {emp.emp_id}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {emp.department} {emp.designation && `· ${emp.designation}`}
                    </div>
                  </div>
                </div>

                {/* Face status */}
                <div style={{
                  marginTop: 12, padding: '6px 10px',
                  background: emp.has_face ? 'rgba(63,185,80,0.08)' : 'rgba(210,153,34,0.08)',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12,
                  color: emp.has_face ? 'var(--accent-green)' : 'var(--accent-yellow)'
                }}>
                  {emp.has_face ? <UserCheck size={13} /> : <Camera size={13} />}
                  {emp.has_face ? 'Face registered' : 'No face data — register face'}
                </div>

                {/* Email */}
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {emp.email}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setEditingEmp(emp); setModalOpen(true) }}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)} disabled={deletingId === emp.id}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <User size={40} />
              <p style={{ marginTop: 8 }}>No employees found</p>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <EmployeeModal
          employee={editingEmp}
          onClose={() => { setModalOpen(false); setEditingEmp(null) }}
          onSaved={load}
        />
      )}
    </div>
  )
}
