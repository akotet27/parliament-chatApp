import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'
import AdminDashboard from './components/AdminDashboard'
import ChatRoom from './components/ChatRoom'
import { keyStore } from './crypto/e2e'
import { Shield, Clock } from 'lucide-react'

// ── Loading screen ─────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#030712' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}
      >
        <Shield className="w-8 h-8 text-white"/>
      </div>
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"/>
      <p className="text-sm" style={{ color: '#6B7280' }}>
        Establishing secure session...
      </p>
    </div>
  )
}

// ── Pending approval screen ────────────────────────────
function PendingScreen({ onLogout }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#030712' }}
    >
      <div className="w-full max-w-sm text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: '#D9770622', border: '1px solid #D9770644' }}
        >
          <Clock className="w-10 h-10 text-amber-400"/>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          Awaiting Approval
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          Your account has been created and is pending
          admin approval. You will be able to access
          Parliament SecureChat once approved.
        </p>
        <div
          className="rounded-2xl p-4 mb-6 border"
          style={{ background: '#111827', borderColor: '#1F2937' }}
        >
          <p className="text-xs" style={{ color: '#6B7280' }}>
            An administrator will review your request.
            Please contact your parliament office if
            you need urgent access.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-sm font-medium hover:underline"
          style={{ color: '#60A5FA' }}
        >
          Back to login
        </button>
      </div>
    </div>
  )
}

// ── Suspended screen ───────────────────────────────────
function SuspendedScreen({ onLogout }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#030712' }}
    >
      <div className="w-full max-w-sm text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: '#DC262622', border: '1px solid #DC262644' }}
        >
          <Shield className="w-10 h-10 text-red-400"/>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          Account Suspended
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          Your access to Parliament SecureChat has been
          suspended. Please contact your administrator.
        </p>
        <button
          onClick={onLogout}
          className="text-sm font-medium hover:underline"
          style={{ color: '#60A5FA' }}
        >
          Back to login
        </button>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────
function App() {
  const [screen, setScreen]         = useState('login')
  const [appLoading, setAppLoading] = useState(true)
  const [logoutReason, setLogoutReason] = useState('')

  const auth = useAuth()

  // Check for existing session on load
  useEffect(() => {
    const token = sessionStorage.getItem('parliament_token')
    if (token) {
      auth.fetchMe()
        .then(user => {
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

  // Update screen based on user role
  useEffect(() => {
    if (!auth.user) return
    if (auth.user.role === 'admin')     setScreen('admin')
    else if (auth.user.role === 'member')    setScreen('chat')
    else if (auth.user.role === 'pending')   setScreen('pending')
    else if (auth.user.role === 'suspended') setScreen('suspended')
  }, [auth.user])

  const handleLogin = async (email, password) => {
    const result = await auth.login(email, password)
    return result
  }

  const handleRegister = async (formData) => {
    const result = await auth.register(formData)
    if (result.success) {
      setScreen('registered')
    }
    return result
  }

  const handleLogout = async (reason = 'manual') => {
    setLogoutReason(reason)
    await auth.logout(reason)
    setScreen('login')
  }

  if (appLoading) return <LoadingScreen/>

  return (
    <>
      {/* Inactivity logout toast */}
      {logoutReason === 'inactivity' && screen === 'login' && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl"
          style={{ background: '#7F1D1D', color: '#FCA5A5', border: '1px solid #EF4444' }}
        >
          ⏱️ Session expired due to inactivity
        </div>
      )}

      {screen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onGoToRegister={() => setScreen('register')}
          loading={auth.loading}
          error={auth.error}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen
          onRegister={handleRegister}
          onGoToLogin={() => setScreen('login')}
          loading={auth.loading}
          error={auth.error}
        />
      )}

      {screen === 'registered' && (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: '#030712' }}
        >
          <div className="w-full max-w-sm text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: '#05966922', border: '1px solid #05966944' }}
            >
              <Shield className="w-10 h-10 text-green-400"/>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Registration Successful!
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              Your account has been created. An administrator
              will review and approve your access.
            </p>
            <button
              onClick={() => {
                auth.setError('')
                setScreen('login')
              }}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', color: '#fff' }}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {screen === 'pending' && (
        <PendingScreen onLogout={handleLogout}/>
      )}

      {screen === 'suspended' && (
        <SuspendedScreen onLogout={handleLogout}/>
      )}

      {screen === 'admin' && auth.user && (
        <AdminDashboard
          onLogout={handleLogout}
          auth={auth}
        />
      )}

      {screen === 'chat' && auth.user && (
        <ChatRoom
          user={auth.user}
          onLogout={handleLogout}
          fetchPublicKey={auth.fetchPublicKey}
        />
      )}
    </>
  )
}

export default App