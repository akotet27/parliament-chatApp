import { useState, useEffect } from 'react'
import {
  Shield, Users, CheckCircle, XCircle,
  Clock, Activity, LogOut, RefreshCw,
  Eye, Lock, AlertTriangle, UserCheck,
  UserX, ChevronDown, ChevronUp, KeyRound
} from 'lucide-react'

function StatusBadge({ role }) {
  const styles = {
    admin:     { bg: '#eff6ff', color: '#1d4ed8', label: 'Admin' },
    member:    { bg: '#f0fdf4', color: '#16a34a', label: 'Member' },
    pending:   { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
    suspended: { bg: '#fef2f2', color: '#dc2626', label: 'Suspended' },
  }
  const s = styles[role] || styles.pending
  return (
    <span style={{
      fontSize: '11px', fontWeight: 700,
      padding: '3px 10px', borderRadius: '99px',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color}/>
      </div>
      <div>
        <p style={{ fontSize: '28px', fontWeight: 900, color: '#0f2444', margin: 0, lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{label}</p>
      </div>
    </div>
  )
}

function AdminDashboard({ onLogout, auth }) {
  const [users, setUsers]         = useState([])
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [actionLoading, setActionLoading] = useState({})
  const [expandedUser, setExpandedUser]   = useState(null)
  const [feedback, setFeedback]   = useState('')

  const showFeedback = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 3000)
  }

  const loadData = async () => {
    setLoading(true)
    const [usersData, logsData] = await Promise.all([
      auth.getAllUsers(),
      auth.api.get('/admin/logs').then(r => r.data).catch(() => [])
    ])
    setUsers(usersData)
    setLogs(logsData)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleApprove = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'approving' }))
    const result = await auth.approveUser(userId)
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'member' } : u))
      showFeedback('✅ User approved successfully')
    }
    setActionLoading(prev => ({ ...prev, [userId]: null }))
  }

  const handleSuspend = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return
    setActionLoading(prev => ({ ...prev, [userId]: 'suspending' }))
    const result = await auth.suspendUser(userId)
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'suspended' } : u))
      showFeedback('⚠️ User suspended')
    }
    setActionLoading(prev => ({ ...prev, [userId]: null }))
  }

  const stats = {
    total:     users.length,
    members:   users.filter(u => u.role === 'member').length,
    pending:   users.filter(u => u.role === 'pending').length,
    suspended: users.filter(u => u.role === 'suspended').length,
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 32px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/parliament-logo.png" alt="Parliament"
            style={{ width: '44px', height: '44px', objectFit: 'contain' }}/>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f2444', margin: 0 }}>
              Parliament SecureChat
            </p>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              Admin Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* E2E badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '8px', padding: '6px 12px',
          }}>
            <Lock size={14} color="#1d4ed8"/>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>
              E2E Active
            </span>
          </div>

          <button onClick={loadData}
            style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: '1px solid #e2e8f0', background: '#fff',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#64748b',
            }}>
            <RefreshCw size={15}/>
          </button>

          <button onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}>
            <LogOut size={15}/>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Feedback toast */}
        {feedback && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '10px', padding: '12px 16px',
            fontSize: '14px', fontWeight: 500, color: '#15803d',
            marginBottom: '20px',
          }}>
            {feedback}
          </div>
        )}

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px', marginBottom: '28px',
        }}>
          <StatCard icon={Users}     label="Total Users"  value={stats.total}     color="#1d4ed8"/>
          <StatCard icon={UserCheck} label="Members"      value={stats.members}   color="#16a34a"/>
          <StatCard icon={Clock}     label="Pending"      value={stats.pending}   color="#d97706"/>
          <StatCard icon={UserX}     label="Suspended"    value={stats.suspended} color="#dc2626"/>
        </div>

        {/* E2E notice */}
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          marginBottom: '24px',
        }}>
          <Eye size={18} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '1px' }}/>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', margin: '0 0 4px' }}>
              End-to-End Encryption Active
            </p>
            <p style={{ fontSize: '13px', color: '#3b82f6', margin: 0, lineHeight: 1.6 }}>
              All messages are encrypted client-side using ECDH key exchange.
              Even as admin, message content is unreadable — only counts and metadata visible.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          background: '#e2e8f0', padding: '4px', borderRadius: '10px',
          width: 'fit-content',
        }}>
          {[
            { key: 'users', label: 'Users', icon: Users },
            { key: 'logs',  label: 'Activity Log', icon: Activity },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#0f2444' : '#64748b',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
              <tab.icon size={15}/>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{
              width: '32px', height: '32px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #1d4ed8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* Users tab */}
            {activeTab === 'users' && (
              <div>
                {/* Pending section */}
                {users.filter(u => u.role === 'pending').length > 0 && (
                  <div style={{
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: '16px', padding: '20px', marginBottom: '20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <AlertTriangle size={18} color="#d97706"/>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: 0 }}>
                        {users.filter(u => u.role === 'pending').length} Pending Approval
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {users.filter(u => u.role === 'pending').map(u => (
                        <div key={u.id} style={{
                          background: '#fff', borderRadius: '12px', padding: '14px 16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          border: '1px solid #fde68a',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: '#fef3c7', color: '#d97706',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '14px',
                            }}>
                              {u.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f2444', margin: 0 }}>
                                {u.username}
                              </p>
                              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                {u.email} · {u.phone}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleApprove(u.id)}
                              disabled={!!actionLoading[u.id]}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', borderRadius: '8px',
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                color: '#16a34a', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', opacity: actionLoading[u.id] ? 0.5 : 1,
                              }}>
                              <CheckCircle size={14}/>
                              Approve
                            </button>
                            <button onClick={() => handleSuspend(u.id)}
                              disabled={!!actionLoading[u.id]}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', borderRadius: '8px',
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: '#dc2626', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', opacity: actionLoading[u.id] ? 0.5 : 1,
                              }}>
                              <XCircle size={14}/>
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All users table */}
                <div style={{
                  background: '#fff', borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f2444', margin: 0 }}>
                      All Users ({users.length})
                    </p>
                  </div>

                  {users.map((u, i) => (
                    <div key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div
                        onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                        style={{
                          padding: '14px 20px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: '#eff6ff', color: '#1d4ed8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '14px', flexShrink: 0,
                          }}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f2444', margin: 0 }}>
                              {u.username}
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <StatusBadge role={u.role}/>
                          {expandedUser === u.id
                            ? <ChevronUp size={16} color="#94a3b8"/>
                            : <ChevronDown size={16} color="#94a3b8"/>
                          }
                        </div>
                      </div>

                      {/* Expanded */}
                      {expandedUser === u.id && (
                        <div style={{ padding: '0 20px 16px', background: '#f8fafc' }}>
                          <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '10px', marginBottom: '14px',
                          }}>
                            {[
                              { label: 'Phone', value: u.phone },
                              { label: 'Role', value: u.role },
                              { label: 'Last Seen', value: u.last_seen ? new Date(u.last_seen).toLocaleString() : 'Never' },
                              { label: 'Joined', value: new Date(u.created_at).toLocaleDateString() },
                            ].map(item => (
                              <div key={item.label} style={{
                                background: '#fff', borderRadius: '10px', padding: '12px',
                                border: '1px solid #e2e8f0',
                              }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {item.label}
                                </p>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f2444', margin: 0 }}>
                                  {item.value}
                                </p>
                              </div>
                            ))}
                          </div>
                          {u.role !== 'admin' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {u.role !== 'member' && (
                                <button onClick={() => handleApprove(u.id)}
                                  disabled={!!actionLoading[u.id]}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px', borderRadius: '8px',
                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    color: '#16a34a', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer',
                                  }}>
                                  <CheckCircle size={14}/>
                                  {u.role === 'pending' ? 'Approve' : 'Reinstate'}
                                </button>
                              )}
                              {u.role !== 'suspended' && (
                                <button onClick={() => handleSuspend(u.id)}
                                  disabled={!!actionLoading[u.id]}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px', borderRadius: '8px',
                                    background: '#fef2f2', border: '1px solid #fecaca',
                                    color: '#dc2626', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer',
                                  }}>
                                  <XCircle size={14}/>
                                  Suspend
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs tab */}
            {activeTab === 'logs' && (
              <div style={{
                background: '#fff', borderRadius: '16px',
                border: '1px solid #e2e8f0', overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f2444', margin: 0 }}>
                    Activity Log (last 100)
                  </p>
                </div>
                {logs.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>No activity logged yet</p>
                  </div>
                ) : logs.map((log, i) => (
                  <div key={i} style={{
                    padding: '12px 20px',
                    borderBottom: i < logs.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: log.action.includes('suspend') ? '#dc2626'
                          : log.action.includes('approve') ? '#16a34a' : '#1d4ed8',
                        flexShrink: 0,
                      }}/>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f2444', margin: 0 }}>
                          {log.username || 'Unknown'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                          {log.action}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, flexShrink: 0 }}>
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        background: '#0f2444', color: '#94a3b8',
        padding: '20px 32px', marginTop: '40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/parliament-logo.png" alt="Parliament"
            style={{ width: '30px', height: '30px', objectFit: 'contain', opacity: 0.8 }}/>
          <p style={{ margin: 0, fontSize: '12px', color: '#e2e8f0' }}>
            House of Peoples' Representatives · FDRE
          </p>
        </div>
        <p style={{ margin: 0, fontSize: '12px' }}>
          🔐 ECDH encrypted · Admin Portal
        </p>
      </footer>
    </div>
  )
}

export default AdminDashboard