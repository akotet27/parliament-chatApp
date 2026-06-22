import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LandingPage from './components/LandingPage'
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'
import AdminDashboard from './components/AdminDashboard'
import ChatRoom from './components/ChatRoom'
import { Shield } from 'lucide-react'

function LoadingScreen() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <img src="/parliament-logo.png" alt="Parliament" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid #0066b2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
      <p style={{ fontSize: '14px', color: '#64748b' }}>Establishing secure session...</p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.95)} }
      `}</style>
    </div>
  )
}

function PendingScreen({ onLogout }) {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
        <img src="/parliament-logo.png" alt="Parliament" style={{ width: '80px', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f2444', margin: '0 0 12px' }}>Awaiting Approval</h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>
          Your account is pending admin approval. You will be able to access Parliament SecureChat once approved.
        </p>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#0066b2', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
          Back to login
        </button>
      </div>
    </div>
  )
}

function SuspendedScreen({ onLogout }) {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Shield size={28} color="#dc2626"/></div>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f2444', margin: '0 0 12px' }}>Account Suspended</h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>Your access has been suspended. Contact administrator.</p>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#0066b2', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
          Back to login
        </button>
      </div>
    </div>
  )
}

const API_BASE = 'https://parliament-chatapp-1.onrender.com/api'

function ResetPasswordScreen({ token, onDone }) {
  const [pw, setPw]       = useState('')
  const [confirm, setCfm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]     = useState('')
  const [err, setErr]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pw.length < 8) { setErr('Password must be at least 8 characters'); return }
    if (pw !== confirm) { setErr('Passwords do not match'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: pw })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setMsg('Password updated! You can now sign in.')
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #dceeff 0%, #eef5ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', system-ui, sans-serif", padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: '#fff', borderRadius: '20px', padding: '36px', boxShadow: '0 8px 48px rgba(0,26,61,0.14)', border: '1px solid rgba(0,102,178,0.12)' }}>
        <img src="/parliament-logo.png" alt="" style={{ width: '48px', margin: '0 auto 16px', display: 'block', objectFit: 'contain' }}/>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#001a3d', textAlign: 'center', margin: '0 0 6px' }}>Set New Password</h2>
        <p style={{ fontSize: '13px', color: '#4a6580', textAlign: 'center', margin: '0 0 24px' }}>Choose a strong password for your account.</p>
        {msg ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <p style={{ color: '#15803d', fontWeight: 600, margin: '0 0 12px' }}>{msg}</p>
            <button onClick={onDone} style={{ background: '#0066b2', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Go to Sign In</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {err && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{err}</p>}
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="New password (min 8 chars)" style={{ width: '100%', padding: '12px 14px', marginBottom: '12px', border: '1.5px solid #d4e5f7', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
            <input type="password" value={confirm} onChange={e => setCfm(e.target.value)} placeholder="Confirm new password" style={{ width: '100%', padding: '12px 14px', marginBottom: '20px', border: '1.5px solid #d4e5f7', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? 'rgba(0,102,178,0.5)' : '#0066b2', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Updating…' : 'Set Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('landing')
  const [appLoading, setAppLoading] = useState(true)
  const [logoutReason, setLogoutReason] = useState('')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('parliament_dark') === 'true')
  const [resetToken, setResetToken] = useState(null)
  const auth = useAuth()

  useEffect(() => {
    // Check for password reset token in URL first
    const params = new URLSearchParams(window.location.search)
    const rt = params.get('reset_token')
    if (rt) {
      setResetToken(rt)
      setScreen('reset-password')
      setAppLoading(false)
      return
    }

    const token = sessionStorage.getItem('parliament_token')
    if (token) {
      auth.fetchMe()
        .then((user) => {
          if (user) {
            setScreen('chat')
          } else {
            setScreen('login')
          }
        })
        .finally(() => setAppLoading(false))
    } else {
      setAppLoading(false)
      setScreen('landing')
    }
  }, [])

  useEffect(() => {
    if (!auth.user) return
    if (auth.user.role === 'admin') setScreen('admin')
    else if (auth.user.role === 'member') setScreen('chat')
    else if (auth.user.role === 'pending') setScreen('pending')
    else if (auth.user.role === 'suspended') setScreen('suspended')
  }, [auth.user])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('parliament_dark', String(next))
  }

  const handleLogin = async (email, password) => auth.login(email, password)
  const handleRegister = async (formData) => {
    const result = await auth.register(formData)
    if (result.success) setScreen('registered')
    return result
  }
  const handleLogout = async (reason = 'manual') => {
    setLogoutReason(reason)
    await auth.logout(reason)
    setScreen('landing')
  }

  if (appLoading) return <LoadingScreen />

  return (
    <div style={{ colorScheme: darkMode ? 'dark' : 'light' }}>
      {/* Inactivity logout toast */}
      {logoutReason === 'inactivity' && (screen === 'landing' || screen === 'login') && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: '#7F1D1D', color: '#FCA5A5',
          border: '1px solid #EF4444', borderRadius: '10px',
          padding: '10px 20px', fontSize: '13px', fontWeight: 500,
        }}>
          Session expired due to inactivity
        </div>
      )}

      {screen === 'landing' && (
        <LandingPage
          onEnterPortal={() => setScreen('login')}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />
      )}

      {screen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onGoToRegister={() => setScreen('register')}
          onBack={() => setScreen('landing')}
          loading={auth.loading}
          error={auth.error}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen
          onRegister={handleRegister}
          onGoToLogin={() => setScreen('login')}
          loading={auth.loading}
          error={auth.error}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />
      )}

      {screen === 'registered' && (
        <div style={{
          background: darkMode ? '#0f172a' : '#f8fafc',
          minHeight: '100vh', fontFamily: 'system-ui',
          display: 'flex', flexDirection: 'column',
        }}>
          <nav style={{
            background: darkMode ? '#1e293b' : '#fff',
            borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            padding: '12px 48px', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <img src="/parliament-logo.png" alt="Parliament" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
            <p style={{ fontSize: '13px', fontWeight: 800, color: darkMode ? '#e2e8f0' : '#003466', margin: 0 }}>
              Parliament SecureChat
            </p>
          </nav>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ textAlign: 'center', maxWidth: '440px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Shield size={28} color="#16a34a"/></div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: darkMode ? '#f1f5f9' : '#0f2444', margin: '0 0 12px' }}>
                Registration Successful!
              </h2>
              <p style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>
                Your account has been created. An administrator will review and approve your access to Parliament SecureChat.
              </p>
              <div style={{
                background: darkMode ? '#422006' : '#fffbeb',
                border: `1px solid ${darkMode ? '#854d0e' : '#fde68a'}`,
                borderRadius: '12px', padding: '14px 16px', marginBottom: '24px',
              }}>
                <p style={{ fontSize: '13px', color: darkMode ? '#fde68a' : '#92400e', margin: 0 }}>
                  Contact your parliament office for urgent access.
                </p>
              </div>
              <button
                onClick={() => { auth.setError(''); setScreen('login') }}
                style={{
                  padding: '13px 32px', background: '#0066b2', color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '14px',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === 'reset-password' && resetToken && (
        <ResetPasswordScreen
          token={resetToken}
          onDone={() => {
            setResetToken(null)
            window.history.replaceState({}, '', window.location.pathname)
            setScreen('login')
          }}
        />
      )}

      {screen === 'pending' && <PendingScreen onLogout={handleLogout} />}
      {screen === 'suspended' && <SuspendedScreen onLogout={handleLogout} />}

      {screen === 'admin' && auth.user && (
        <AdminDashboard
          onLogout={handleLogout}
          auth={auth}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />
      )}

      {screen === 'chat' && auth.user && (
        <ChatRoom
          user={auth.user}
          onLogout={handleLogout}
          fetchPublicKey={auth.fetchPublicKey}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          authApi={auth.api}
        />
      )}
    </div>
  )
}

export default App