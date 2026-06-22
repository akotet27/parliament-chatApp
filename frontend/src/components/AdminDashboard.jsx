import { useState, useEffect, useCallback } from 'react'
import {
  Users, CheckCircle, XCircle,
  Clock, Activity, LogOut, RefreshCw,
  Lock, AlertTriangle, UserCheck,
  UserX, LayoutDashboard, Sun, Moon,
  Menu, X, Link, Copy, Check
} from 'lucide-react'

const BLUE   = '#0066b2'
const BLUELT = '#1a80cc'

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ role, dark }) {
  const styles = {
    admin:     { bg: dark ? 'rgba(0,102,178,0.2)' : '#dff0ff', color: '#0066b2', label: 'Admin' },
    member:    { bg: dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4', color: '#16a34a', label: 'Member' },
    pending:   { bg: dark ? 'rgba(217,119,6,0.15)' : '#fffbeb', color: '#d97706', label: 'Pending' },
    suspended: { bg: dark ? 'rgba(220,38,38,0.15)' : '#fef2f2', color: '#dc2626', label: 'Suspended' },
  }
  const s = styles[role] || styles.pending
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, dark }) {
  const bg     = dark ? '#112038' : '#ffffff'
  const border = dark ? 'rgba(0,102,178,0.18)' : '#e8edf4'
  const text   = dark ? '#e6f4ff' : '#002244'
  const muted  = dark ? '#5b8ab8' : '#64748b'
  return (
    <div style={{ background: bg, borderRadius: '14px', padding: '18px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color}/>
      </div>
      <div>
        <p style={{ fontSize: '26px', fontWeight: 900, color: text, margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '12px', color: muted, margin: '3px 0 0' }}>{label}</p>
      </div>
    </div>
  )
}

// ── Reset link modal ──────────────────────────────────────
function ResetLinkModal({ user, onClose, authApi, dark }) {
  const [link, setLink]       = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)
  const [err, setErr]         = useState('')

  const d          = dark
  const modalBg    = d ? '#112038' : '#ffffff'
  const textHead   = d ? '#e6f4ff' : '#002244'
  const textMuted  = d ? '#5b8ab8' : '#64748b'
  const inputBg    = d ? '#061220' : '#f0f8ff'
  const inputBdr   = d ? 'rgba(0,102,178,0.3)' : '#dde4f0'

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await authApi.post(`/admin/users/${user.id}/reset-token`)
        const token = res.data.token
        setLink(`${window.location.origin}?reset_token=${token}`)
      } catch {
        setErr('Could not generate reset link. Try again.')
      } finally { setLoading(false) }
    }
    generate()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleEmail = () => {
    const subject = encodeURIComponent('Parliament SecureChat — Password Reset')
    const body = encodeURIComponent(
      `Dear ${user.username},\n\nA password reset has been initiated for your Parliament SecureChat account.\n\nClick the link below to set your new password (expires in 24 hours):\n${link}\n\nDo not share this link with anyone. It can only be used once.\n\nParliament SecureChat Admin`
    )
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: modalBg, borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.35)', border: `1px solid ${inputBdr}` }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: textHead, margin: 0 }}>Password Reset Link</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }}><X size={18}/></button>
        </div>

        {/* Recipient info */}
        <div style={{ background: d ? 'rgba(0,102,178,0.1)' : '#f0f8ff', border: `1px solid ${d ? 'rgba(0,102,178,0.25)' : 'rgba(0,102,178,0.15)'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: textMuted, margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recipient</p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: textHead, margin: '0 0 2px' }}>{user.username}</p>
          <p style={{ fontSize: '12px', color: BLUE, margin: 0 }}>{user.email}</p>
        </div>

        <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 14px', lineHeight: 1.6 }}>
          The link below expires in <strong style={{ color: textHead }}>24 hours</strong> and can only be used once. Send it to the user via email or another secure channel.
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTop: `3px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
          </div>
        ) : err ? (
          <p style={{ color: '#dc2626', fontSize: '13px' }}>{err}</p>
        ) : (
          <>
            {/* Link row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input readOnly value={link}
                style={{ flex: 1, padding: '10px 12px', fontSize: '12px', border: `1px solid ${inputBdr}`, borderRadius: '8px', outline: 'none', color: textHead, background: inputBg, fontFamily: 'monospace', minWidth: 0 }}
                onFocus={e => e.target.select()}
              />
              <button onClick={handleCopy}
                style={{ padding: '10px 14px', background: copied ? '#16a34a' : BLUE, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 0.2s', flexShrink: 0 }}>
                {copied ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy</>}
              </button>
            </div>

            {/* Send by email button */}
            <button onClick={handleEmail}
              style={{ width: '100%', padding: '11px', background: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '8px', color: BLUE, fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontFamily: 'inherit', transition: 'background 0.18s' }}
              onMouseEnter={e => e.currentTarget.style.background = d ? 'rgba(0,102,178,0.15)' : 'rgba(0,102,178,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Link size={14}/> Send Reset Email to {user.email}
            </button>
          </>
        )}

        <p style={{ fontSize: '11px', color: d ? '#334f70' : '#94a3b8', margin: '12px 0 0', lineHeight: 1.5 }}>
          The user sets their own password using this link — you will never see or store their password.
        </p>
      </div>
    </div>
  )
}

// ── Build per-user activity summary from flat log ─────────
function buildUserActivity(logs) {
  const map = {}
  logs.forEach(log => {
    const user = log.username || 'System'
    if (!map[user]) map[user] = {
      username: user,
      loginCount: 0, lastLogin: null,
      logoutCount: 0, lastLogout: null,
      approveCount: 0, suspendCount: 0,
      lastAction: null, lastActionTime: null,
      totalEvents: 0,
    }
    const e = map[user]
    const a = (log.action || '').toLowerCase()
    const t = log.created_at
    e.totalEvents++

    if (a.includes('login') || a.includes('joined') || a.includes('connected')) {
      e.loginCount++
      if (!e.lastLogin || t > e.lastLogin) e.lastLogin = t
    } else if (a.includes('logout') || a.includes('left') || a.includes('disconnected')) {
      e.logoutCount++
      if (!e.lastLogout || t > e.lastLogout) e.lastLogout = t
    } else if (a.includes('approve')) {
      e.approveCount++
    } else if (a.includes('suspend')) {
      e.suspendCount++
    }

    if (!e.lastActionTime || t > e.lastActionTime) {
      e.lastActionTime = t
      e.lastAction = log.action
    }
  })
  return Object.values(map).sort((a, b) =>
    (b.lastActionTime || '') > (a.lastActionTime || '') ? 1 : -1
  )
}

function fmt(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return d.toLocaleDateString()
}

// ── Main AdminDashboard ────────────────────────────────────
function AdminDashboard({ onLogout, auth, darkMode, onToggleDark }) {
  const [users, setUsers]         = useState([])
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [userTab, setUserTab]     = useState('all')
  const [actionLoading, setActionLoading] = useState({})
  const [resetLinkTarget, setResetLinkTarget] = useState(null)
  const [feedback, setFeedback]   = useState({ msg: '', type: 'success' })
  const [search, setSearch]       = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const d = darkMode

  // ── Color system ─────────────────────────────────────────
  const adminBg     = d ? '#0d1e35' : '#f0f8ff'
  const cardBg      = d ? '#112038' : '#ffffff'
  const sidebarBg   = '#002244'
  const topBarBg    = d ? '#112038' : '#ffffff'
  const topBarBorder= d ? 'rgba(0,102,178,0.15)' : '#e8edf4'
  const border      = d ? 'rgba(0,102,178,0.18)' : '#e8edf4'
  const rowBorder   = d ? 'rgba(0,102,178,0.08)' : '#f1f5f9'
  const textPrimary = d ? '#e6f4ff' : '#002244'
  const textMuted   = d ? '#5b8ab8' : '#64748b'
  const inputBg     = d ? 'rgba(255,255,255,0.06)' : '#f0f8ff'
  const tableHead   = d ? '#091628' : '#f0f8ff'
  const rowHover    = d ? '#152540' : '#f0f8ff'

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback({ msg: '', type: 'success' }), 3500)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    const [usersData, logsData] = await Promise.all([
      auth.getAllUsers(),
      auth.api.get('/admin/logs').then(r => r.data).catch(() => [])
    ])
    setUsers(usersData)
    setLogs(logsData)
    setLoading(false)
  }, [auth])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'approving' }))
    const result = await auth.approveUser(userId)
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'member' } : u))
      showFeedback('User approved successfully')
    }
    setActionLoading(prev => ({ ...prev, [userId]: null }))
  }

  const handleSuspend = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return
    setActionLoading(prev => ({ ...prev, [userId]: 'suspending' }))
    const result = await auth.suspendUser(userId)
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'suspended' } : u))
      showFeedback('User suspended', 'warning')
    }
    setActionLoading(prev => ({ ...prev, [userId]: null }))
  }

  const stats = {
    total:     users.length,
    active:    users.filter(u => u.role === 'member' || u.role === 'admin').length,
    pending:   users.filter(u => u.role === 'pending').length,
    suspended: users.filter(u => u.role === 'suspended').length,
  }

  const filterUsers = () => {
    let list = users
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (userTab === 'pending')   return list.filter(u => u.role === 'pending')
    if (userTab === 'active')    return list.filter(u => u.role === 'member' || u.role === 'admin')
    if (userTab === 'suspended') return list.filter(u => u.role === 'suspended')
    return list
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users',     label: 'Users',     icon: Users            },
    { key: 'logs',      label: 'Activity',  icon: Activity         },
  ]

  const userActivity = buildUserActivity(logs)

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Montserrat', system-ui, sans-serif", background: adminBg, position: 'relative', transition: 'background 0.3s' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .adm-nav:hover { background: rgba(255,255,255,0.1) !important; }
        .adm-row:hover { background: ${rowHover} !important; }
        .adm-act:hover { opacity: 0.82; }
        .adm-toggle:hover { background: ${d ? 'rgba(255,255,255,0.12)' : 'rgba(0,102,178,0.1)'} !important; }

        /* Mobile */
        @media (max-width: 768px) {
          .adm-sidebar { position: fixed !important; z-index: 300; box-shadow: 4px 0 24px rgba(0,0,0,0.3) !important; }
          .adm-backdrop { display: block !important; }
          .adm-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .adm-user-grid { grid-template-columns: 1.5fr 1fr auto !important; }
          .adm-user-email, .adm-user-seen { display: none !important; }
          .adm-log-cols { grid-template-columns: 1.5fr 1fr 1fr auto !important; }
          .adm-log-session, .adm-log-action { display: none !important; }
        }
        @media (max-width: 480px) {
          .adm-stat-grid { grid-template-columns: 1fr 1fr !important; }
          .adm-main-pad { padding: 16px !important; }
        }
        .adm-backdrop { display: none; }
      `}</style>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="adm-backdrop" onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}/>
      )}

      {/* ── SIDEBAR ── */}
      <div className="adm-sidebar" style={{
        width: '220px', minWidth: '220px',
        background: sidebarBg,
        display: 'flex', flexDirection: 'column',
        height: '100vh',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/parliament-logo.png" alt="" style={{ width: '34px', height: '34px', objectFit: 'contain', filter: 'brightness(1.3)' }}/>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#f1f5f9', margin: 0, lineHeight: 1.2 }}>SecureChat</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '8px 6px 6px' }}>Management</p>
          {navItems.map(item => {
            const active = activeView === item.key
            return (
              <button key={item.key}
                onClick={() => { setActiveView(item.key); setSidebarOpen(false) }}
                className="adm-nav"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '9px', border: 'none',
                  background: active ? 'rgba(0,102,178,0.55)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontSize: '13px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', textAlign: 'left',
                  borderLeft: active ? '3px solid #1a80cc' : '3px solid transparent',
                  transition: 'all 0.15s', marginBottom: '2px', fontFamily: 'inherit',
                }}>
                <item.icon size={15}/>
                {item.label}
                {item.key === 'users' && stats.pending > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#d97706', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '99px', padding: '1px 6px' }}>
                    {stats.pending}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom: dark toggle + logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onToggleDark} className="adm-toggle"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 12px', borderRadius: '9px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              marginBottom: '8px', fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
            {d ? <Sun size={14}/> : <Moon size={14}/>}
            {d ? 'Light mode' : 'Dark mode'}
          </button>
          <div style={{ padding: '9px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 1px' }}>Administrator</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Parliament FDRE</p>
          </div>
          <button onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '9px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.1)', color: '#f87171', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}>
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ background: topBarBg, borderBottom: `1px solid ${topBarBorder}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger / sidebar toggle */}
            <button onClick={() => setSidebarOpen(v => !v)}
              style={{ width: '36px', height: '36px', borderRadius: '9px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, flexShrink: 0, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = d ? '#152540' : '#f0f8ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {sidebarOpen ? <X size={17}/> : <Menu size={17}/>}
            </button>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: textPrimary, margin: 0, transition: 'color 0.3s' }}>
                {activeView === 'dashboard' ? 'Dashboard' : activeView === 'users' ? 'User Management' : 'User Activity'}
              </p>
              <p style={{ fontSize: '12px', color: textMuted, margin: 0 }}>Parliament SecureChat Administration</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeView === 'users' && (
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                style={{ padding: '8px 14px', fontSize: '13px', border: `1px solid ${border}`, borderRadius: '9px', outline: 'none', background: inputBg, color: textPrimary, width: '190px', fontFamily: 'inherit', transition: 'all 0.2s' }}/>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: d ? 'rgba(0,102,178,0.15)' : '#dff0ff', border: `1px solid ${d ? 'rgba(0,102,178,0.3)' : '#99ccee'}`, borderRadius: '8px', padding: '6px 12px' }}>
              <Lock size={12} color={BLUE}/>
              <span style={{ fontSize: '11px', fontWeight: 600, color: BLUE }}>E2E Active</span>
            </div>
            <button onClick={loadData}
              style={{ width: '34px', height: '34px', borderRadius: '9px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = d ? '#152540' : '#f0f8ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <RefreshCw size={14}/>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="adm-main-pad" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Feedback toast */}
          {feedback.msg && (
            <div style={{ background: feedback.type === 'warning' ? (d ? 'rgba(217,119,6,0.15)' : '#fffbeb') : (d ? 'rgba(22,163,74,0.15)' : '#f0fdf4'), border: `1px solid ${feedback.type === 'warning' ? '#fde68a' : '#bbf7d0'}`, borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: feedback.type === 'warning' ? '#d97706' : '#15803d', marginBottom: '20px' }}>
              {feedback.msg}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
              <div style={{ width: '32px', height: '32px', border: `3px solid ${border}`, borderTop: `3px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            </div>
          ) : (
            <>

              {/* ── DASHBOARD ── */}
              {activeView === 'dashboard' && (
                <div>
                  <div className="adm-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
                    <StatCard icon={Users}     label="Total Users"  value={stats.total}     color={BLUE}      dark={d}/>
                    <StatCard icon={UserCheck} label="Active"       value={stats.active}    color="#16a34a"   dark={d}/>
                    <StatCard icon={Clock}     label="Pending"      value={stats.pending}   color="#d97706"   dark={d}/>
                    <StatCard icon={UserX}     label="Suspended"    value={stats.suspended} color="#dc2626"   dark={d}/>
                  </div>

                  <div style={{ background: d ? 'rgba(0,102,178,0.1)' : '#dff0ff', border: `1px solid ${d ? 'rgba(0,102,178,0.25)' : '#99ccee'}`, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                    <Lock size={18} color={BLUE} style={{ flexShrink: 0, marginTop: '1px' }}/>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: d ? '#6ac4ff' : '#004b99', margin: '0 0 3px' }}>End-to-End Encryption Active</p>
                      <p style={{ fontSize: '13px', color: d ? '#4a8ab8' : '#33a0d4', margin: 0, lineHeight: 1.6 }}>
                        All messages are encrypted client-side. Message content is unreadable — only counts and metadata are visible here.
                      </p>
                    </div>
                  </div>

                  {/* Recent activity — first 8 events */}
                  <div style={{ background: cardBg, borderRadius: '16px', border: `1px solid ${border}`, overflow: 'hidden', transition: 'background 0.3s' }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}` }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: textPrimary, margin: 0 }}>Recent Activity</p>
                    </div>
                    {logs.slice(0, 8).length === 0 ? (
                      <p style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: textMuted, margin: 0 }}>No activity yet</p>
                    ) : logs.slice(0, 8).map((log, i) => (
                      <div key={i} style={{ padding: '11px 20px', borderBottom: i < 7 ? `1px solid ${rowBorder}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: log.action?.includes('suspend') ? '#dc2626' : log.action?.includes('approve') ? '#16a34a' : BLUE, flexShrink: 0 }}/>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>{log.username || 'System'}</span>
                          <span style={{ fontSize: '12px', color: textMuted }}>{log.action}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: textMuted }}>{fmt(log.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── USERS ── */}
              {activeView === 'users' && (
                <div>
                  {stats.pending > 0 && (
                    <div style={{ background: d ? 'rgba(217,119,6,0.12)' : '#fffbeb', border: `1px solid ${d ? 'rgba(217,119,6,0.3)' : '#fde68a'}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <AlertTriangle size={16} color="#d97706"/>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#d97706' }}>
                        {stats.pending} user{stats.pending > 1 ? 's' : ''} awaiting approval
                      </span>
                      <button onClick={() => setUserTab('pending')} style={{ marginLeft: 'auto', padding: '5px 12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Review
                      </button>
                    </div>
                  )}

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: d ? 'rgba(255,255,255,0.06)' : '#e8edf4', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                    {[
                      { key: 'all',       label: `All (${users.length})` },
                      { key: 'pending',   label: `Pending (${stats.pending})` },
                      { key: 'active',    label: `Active (${stats.active})` },
                      { key: 'suspended', label: `Suspended (${stats.suspended})` },
                    ].map(tab => (
                      <button key={tab.key} onClick={() => setUserTab(tab.key)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s', background: userTab === tab.key ? (d ? '#112038' : '#fff') : 'transparent', color: userTab === tab.key ? (d ? '#e6f4ff' : '#002244') : textMuted, boxShadow: userTab === tab.key ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Table */}
                  <div style={{ background: cardBg, borderRadius: '16px', border: `1px solid ${border}`, overflow: 'hidden', transition: 'background 0.3s' }}>
                    {/* Header */}
                    <div className="adm-user-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 2.2fr 1fr 1.3fr auto', gap: '12px', padding: '11px 20px', borderBottom: `1px solid ${border}`, background: tableHead }}>
                      {['User', 'Email', 'Role', 'Last Seen', 'Actions'].map(h => (
                        <p key={h} style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{h}</p>
                      ))}
                    </div>

                    {filterUsers().length === 0 ? (
                      <p style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: textMuted, margin: 0 }}>No users in this category</p>
                    ) : filterUsers().map((u, i) => (
                      <div key={u.id}
                        className="adm-row"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 2.2fr 1fr 1.3fr auto',
                          gap: '12px', padding: '13px 20px',
                          borderBottom: i < filterUsers().length - 1 ? `1px solid ${rowBorder}` : 'none',
                          alignItems: 'center', transition: 'background 0.15s',
                        }}>

                        {/* User */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: d ? 'rgba(0,102,178,0.2)' : '#dff0ff', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</span>
                        </div>

                        {/* Email */}
                        <span className="adm-user-email" style={{ fontSize: '12px', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>

                        {/* Role */}
                        <div><StatusBadge role={u.role} dark={d}/></div>

                        {/* Last seen */}
                        <span className="adm-user-seen" style={{ fontSize: '12px', color: textMuted }}>
                          {u.last_seen ? fmt(u.last_seen) : 'Never'}
                        </span>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 }}>
                          {u.role !== 'admin' && (
                            <>
                              {u.role !== 'member' && (
                                <button onClick={() => handleApprove(u.id)} disabled={!!actionLoading[u.id]} className="adm-act"
                                  title="Approve" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', background: d ? 'rgba(22,163,74,0.15)' : '#f0fdf4', border: `1px solid ${d ? 'rgba(22,163,74,0.3)' : '#bbf7d0'}`, color: '#16a34a', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading[u.id] ? 0.5 : 1, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                                  <CheckCircle size={12}/>
                                  {u.role === 'pending' ? 'Approve' : 'Reinstate'}
                                </button>
                              )}
                              {u.role !== 'suspended' && (
                                <button onClick={() => handleSuspend(u.id)} disabled={!!actionLoading[u.id]} className="adm-act"
                                  title="Suspend" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', background: d ? 'rgba(220,38,38,0.12)' : '#fef2f2', border: `1px solid ${d ? 'rgba(220,38,38,0.3)' : '#fecaca'}`, color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading[u.id] ? 0.5 : 1, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                                  <XCircle size={12}/> Suspend
                                </button>
                              )}
                              {/* Reset link — user resets their own password */}
                              <button onClick={() => setResetLinkTarget(u)} className="adm-act"
                                title="Send password reset link to user"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', background: d ? 'rgba(0,102,178,0.12)' : '#f0f8ff', border: `1px solid ${d ? 'rgba(0,102,178,0.25)' : '#d4e5f7'}`, color: d ? '#5b8ab8' : '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                                <Link size={12}/> Reset Link
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ACTIVITY LOG — one row per user ── */}
              {activeView === 'logs' && (
                <div>
                  <div style={{ background: cardBg, borderRadius: '16px', border: `1px solid ${border}`, overflow: 'hidden', transition: 'background 0.3s' }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={15} color={BLUE}/>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: textPrimary, margin: 0 }}>User Activity Monitor</p>
                      </div>
                      <span style={{ fontSize: '12px', color: textMuted }}>{userActivity.length} users tracked</span>
                    </div>

                    {/* Table header */}
                    <div className="adm-log-cols" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.8fr 60px', gap: '12px', padding: '10px 20px', borderBottom: `1px solid ${border}`, background: tableHead }}>
                      {['User', 'Sessions', 'Disconnects', 'Last Activity', 'Events'].map(h => (
                        <p key={h} style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{h}</p>
                      ))}
                    </div>

                    {userActivity.length === 0 ? (
                      <p style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: textMuted, margin: 0 }}>No activity logged yet</p>
                    ) : userActivity.map((entry, i) => (
                      <div key={entry.username}
                        className="adm-row adm-log-cols"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.6fr 1fr 1fr 1.8fr 60px',
                          gap: '12px', padding: '13px 20px',
                          borderBottom: i < userActivity.length - 1 ? `1px solid ${rowBorder}` : 'none',
                          alignItems: 'center', transition: 'background 0.15s',
                        }}>

                        {/* User */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: d ? 'rgba(0,102,178,0.18)' : '#dff0ff', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                            {entry.username[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.username}</span>
                        </div>

                        {/* Sessions (logins) */}
                        <div className="adm-log-session" style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{entry.loginCount}</span>
                          {entry.lastLogin && (
                            <span style={{ fontSize: '10px', color: textMuted }}>{fmt(entry.lastLogin)}</span>
                          )}
                        </div>

                        {/* Disconnects */}
                        <div className="adm-log-session" style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: textMuted }}>{entry.logoutCount}</span>
                          {entry.lastLogout && (
                            <span style={{ fontSize: '10px', color: textMuted }}>{fmt(entry.lastLogout)}</span>
                          )}
                        </div>

                        {/* Last action */}
                        <div className="adm-log-action" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: '12px', color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.lastAction || '—'}
                          </span>
                          {entry.lastActionTime && (
                            <span style={{ fontSize: '10px', color: textMuted }}>{fmt(entry.lastActionTime)}</span>
                          )}
                        </div>

                        {/* Total events */}
                        <span style={{ fontSize: '13px', fontWeight: 700, color: BLUE }}>{entry.totalEvents}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reset link modal */}
      {resetLinkTarget && (
        <ResetLinkModal
          user={resetLinkTarget}
          authApi={auth.api}
          onClose={() => setResetLinkTarget(null)}
          dark={darkMode}
        />
      )}
    </div>
  )
}

export default AdminDashboard
