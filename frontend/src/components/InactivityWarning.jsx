import { AlertTriangle, LogOut, Activity } from 'lucide-react'

function InactivityWarning({ secondsLeft, onStayLoggedIn, onLogoutNow, darkMode }) {
  const d = darkMode

  const cardBg    = d ? 'rgba(14,22,40,0.97)' : 'rgba(255,255,255,0.98)'
  const textPrimary = d ? '#f1f5f9' : '#0f2444'
  const textMuted   = d ? '#8496b0' : '#64748b'
  const border      = d ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.3)'

  const urgent = secondsLeft <= 10

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>

      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      }}/>

      <style>{`
        @keyframes pulse-bar { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes countdown-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: '380px',
        background: cardBg,
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderRadius: '24px',
        border: `1px solid ${border}`,
        boxShadow: d
          ? '0 0 0 1px rgba(239,68,68,0.12), 0 32px 80px rgba(0,0,0,0.7)'
          : '0 0 0 1px rgba(239,68,68,0.1), 0 24px 64px rgba(239,68,68,0.15)',
        overflow: 'hidden',
        animation: 'fadeIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Animated red top bar */}
        <div style={{
          height: '4px',
          background: urgent
            ? 'linear-gradient(90deg, #dc2626, #ef4444, #dc2626)'
            : 'linear-gradient(90deg, #991b1b, #dc2626, #991b1b)',
          backgroundSize: '200% 100%',
          animation: 'pulse-bar 1s ease-in-out infinite',
        }}/>

        <div style={{ padding: '28px' }}>

          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
              background: d ? 'rgba(239,68,68,0.12)' : '#fef2f2',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={22} color="#ef4444"/>
            </div>
            <div>
              <p style={{ fontSize: '17px', fontWeight: 800, color: textPrimary, margin: 0, lineHeight: 1.2 }}>
                Session Expiring
              </p>
              <p style={{ fontSize: '12px', color: textMuted, margin: 0, marginTop: '2px' }}>
                Parliamentary session security
              </p>
            </div>
          </div>

          {/* Message */}
          <p style={{ fontSize: '13px', color: textMuted, marginBottom: '18px', lineHeight: 1.7 }}>
            You have been inactive. For security, your session will automatically terminate in:
          </p>

          {/* Countdown */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <div style={{
              background: d ? 'rgba(239,68,68,0.08)' : '#fef2f2',
              border: `1.5px solid rgba(239,68,68,${urgent ? '0.6' : '0.25'})`,
              borderRadius: '18px', padding: '16px 40px', textAlign: 'center',
              animation: urgent ? 'countdown-shake 0.4s ease-in-out infinite' : 'none',
            }}>
              <span style={{
                fontSize: '54px', fontWeight: 900, color: '#ef4444',
                fontFamily: 'monospace', lineHeight: 1, display: 'block',
              }}>
                {secondsLeft}
              </span>
              <span style={{ fontSize: '11px', color: '#ef4444', opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {secondsLeft === 1 ? 'second' : 'seconds'} remaining
              </span>
            </div>
          </div>

          {/* Warning note */}
          <div style={{
            background: d ? 'rgba(234,179,8,0.08)' : 'rgba(254,252,232,0.9)',
            border: '1px solid rgba(234,179,8,0.25)',
            borderRadius: '12px', padding: '12px 14px', marginBottom: '22px',
          }}>
            <p style={{ fontSize: '12px', color: d ? 'rgba(253,224,71,0.8)' : '#92400e', margin: 0, lineHeight: 1.65 }}>
              ⚠️ All encryption keys will be cleared from memory on logout. You will need to enter your password again to re-establish secure communications.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onStayLoggedIn}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Activity size={15}/> I'm still here
            </button>
            <button
              onClick={onLogoutNow}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '13px 18px', borderRadius: '12px', cursor: 'pointer',
                background: d ? '#450a0a' : '#fef2f2',
                border: '1px solid #fecaca', color: '#dc2626',
                fontSize: '13px', fontWeight: 700,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fecaca' }}
              onMouseLeave={e => { e.currentTarget.style.background = d ? '#450a0a' : '#fef2f2' }}
            >
              <LogOut size={15}/> Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default InactivityWarning
