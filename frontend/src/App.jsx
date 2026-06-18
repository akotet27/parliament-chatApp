import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'
import AdminDashboard from './components/AdminDashboard'
import ChatRoom from './components/ChatRoom'
import { Shield } from 'lucide-react'

function LoadingScreen() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <img src="/parliament-logo.png" alt="Parliament" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid #1d4ed8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
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
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f2444', margin: '0 0 12px' }}>Account Suspended</h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>Your access has been suspended. Contact administrator.</p>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
          Back to login
        </button>
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('login')
  const [appLoading, setAppLoading] = useState(true)
  const [logoutReason, setLogoutReason] = useState('')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('parliament_dark') === 'true')
  const auth = useAuth()

  useEffect(() => {
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
    setScreen('login')
  }

  if (appLoading) return <LoadingScreen />

  return (
    <div style={{ colorScheme: darkMode ? 'dark' : 'light' }}>
      {/* Inactivity logout toast */}
      {logoutReason === 'inactivity' && screen === 'login' && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: '#7F1D1D', color: '#FCA5A5',
          border: '1px solid #EF4444', borderRadius: '10px',
          padding: '10px 20px', fontSize: '13px', fontWeight: 500,
        }}>
          ⏱️ Session expired due to inactivity
        </div>
      )}

      {screen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onGoToRegister={() => setScreen('register')}
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
            <p style={{ fontSize: '13px', fontWeight: 800, color: darkMode ? '#e2e8f0' : '#1e3a5f', margin: 0 }}>
              Parliament SecureChat
            </p>
          </nav>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ textAlign: 'center', maxWidth: '440px' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>✅</div>
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
                  ⏳ Contact your parliament office for urgent access.
                </p>
              </div>
              <button
                onClick={() => { auth.setError(''); setScreen('login') }}
                style={{
                  padding: '13px 32px', background: '#1d4ed8', color: '#fff',
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