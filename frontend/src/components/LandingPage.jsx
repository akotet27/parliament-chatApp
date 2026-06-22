import { useState } from 'react'
import { Lock, Users, FileText, Shield, Clock, Activity, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react'

const FEATURES = [
  { icon: Lock,     label: 'End-to-End Encrypted' },
  { icon: Users,    label: 'Group Channels'        },
  { icon: FileText, label: 'File Sharing'          },
  { icon: Shield,   label: 'Admin Verified'        },
  { icon: Clock,    label: 'Session Auto-Lock'     },
  { icon: Activity, label: 'Audit Logs'            },
]

function LandingPage({ onEnterPortal, darkMode, onToggleDark }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const d = darkMode

  const navy    = '#001a3d'
  const blue    = '#0066b2'
  const blueLt  = '#1a80cc'

  // adaptive colors per mode
  const pageBg    = d ? `linear-gradient(175deg, ${navy} 0%, #002855 55%, #001f4d 100%)` : 'linear-gradient(160deg, #f0f8ff 0%, #ffffff 55%, #f5f9ff 100%)'
  const navBg     = d ? 'rgba(0,16,32,0.82)' : 'rgba(255,255,255,0.88)'
  const navBorder = d ? 'rgba(0,102,178,0.15)' : 'rgba(0,102,178,0.12)'
  const headColor = d ? '#fff' : navy
  const subColor  = d ? 'rgba(255,255,255,0.6)' : '#4a6580'
  const badgeColor= d ? 'rgba(255,255,255,0.3)' : '#6a8aaa'
  const featCardBg= d ? 'rgba(255,255,255,0.05)' : 'rgba(0,102,178,0.05)'
  const featCardBorder = d ? 'rgba(0,102,178,0.2)' : 'rgba(0,102,178,0.12)'
  const featTextColor  = d ? 'rgba(255,255,255,0.75)' : '#001a3d'

  return (
    <div style={{
      minHeight: '100vh',
      background: pageBg,
      fontFamily: "'Montserrat', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.4s ease',
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes lp-up   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-build { 0%,100%{opacity:${d ? 0.07 : 0.05};transform:translate(-50%,-50%) scale(1)} 50%{opacity:${d ? 0.12 : 0.08};transform:translate(-50%,-50%) scale(1.03)} }
        @keyframes lp-ring  { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.04)} }

        .lp-nav-link { font-size: 13px; font-weight: 600; background: none; border: none; cursor: pointer; font-family: inherit; color: ${d ? 'rgba(255,255,255,0.7)' : '#4a6580'}; transition: color 0.18s; padding: 4px 2px; }
        .lp-nav-link:hover { color: ${d ? '#fff' : navy} !important; }

        .lp-cta {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 15px 38px; border: none; border-radius: 8px;
          font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer;
          background: ${blue}; color: #fff; letter-spacing: 0.01em;
          box-shadow: 0 6px 28px rgba(0,102,178,0.4);
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }
        .lp-cta:hover { background: ${blueLt}; transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,102,178,0.55); }
        .lp-cta:active { transform: translateY(0) scale(0.98); }

        .lp-feat-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 8px;
          background: ${featCardBg}; border: 1px solid ${featCardBorder};
          transition: all 0.2s;
        }
        .lp-feat-pill:hover { transform: translateY(-2px); border-color: ${d ? 'rgba(0,102,178,0.45)' : 'rgba(0,102,178,0.3)'}; }

        .lp-toggle { transition: all 0.2s; }
        .lp-toggle:hover { background: ${d ? 'rgba(255,255,255,0.15)' : 'rgba(0,102,178,0.12)'} !important; }

        @media (max-width: 640px) {
          .lp-hero-h1 { font-size: clamp(34px,10vw,52px) !important; letter-spacing: -0.8px !important; }
          .lp-mob-btn { display: flex !important; }
          .lp-feat-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 400px) {
          .lp-feat-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ═══ PARLIAMENT BUILDING WATERMARK ═══ */}
      <img src="/parliament-logo.png" alt="" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'clamp(420px, 62vw, 860px)', height: 'auto',
        objectFit: 'contain', pointerEvents: 'none',
        opacity: d ? 0.08 : 0.05,
        filter: d ? 'brightness(0) invert(1)' : 'saturate(0.3) opacity(0.5)',
        animation: 'lp-build 14s ease-in-out infinite',
        zIndex: 0,
      }}/>

      {/* Concentric rings */}
      {[600, 420, 260].map((size, i) => (
        <div key={size} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: `${size}px`, height: `${size}px`,
          borderRadius: '50%',
          border: `1px solid ${d ? 'rgba(0,102,178,0.1)' : 'rgba(0,102,178,0.07)'}`,
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none', zIndex: 0,
          animation: `lp-ring ${12 + i * 2}s ease-in-out infinite`,
        }}/>
      ))}

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: 'relative', zIndex: 100,
        height: '64px',
        background: navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${navBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 72px)',
        flexShrink: 0,
        transition: 'all 0.35s ease',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img src="/parliament-logo.png" alt="FDRE"
            style={{
              width: '36px', height: '36px', objectFit: 'contain',
              filter: d ? 'brightness(1.4) drop-shadow(0 0 4px rgba(0,150,255,0.5))' : 'none',
              transition: 'filter 0.35s',
            }}/>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: headColor, letterSpacing: '-0.2px', lineHeight: 1.2, transition: 'color 0.35s' }}>
              Parliament SecureChat
            </div>
            <div style={{ fontSize: '9px', color: subColor, letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'color 0.35s' }}>
              FDRE · House of Peoples' Representatives
            </div>
          </div>
        </div>

        {/* Always-visible right: one toggle + mobile hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onToggleDark} className="lp-toggle"
            title={d ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: '36px', height: '36px', borderRadius: '8px', border: 'none',
              background: d ? 'rgba(255,255,255,0.1)' : 'rgba(0,102,178,0.09)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: d ? 'rgba(255,255,255,0.85)' : '#4a6580',
              flexShrink: 0,
            }}>
            {d ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <button className="lp-mob-btn" onClick={() => setMobileOpen(v => !v)}
            style={{ display: 'none', background: 'none', border: 'none', color: headColor, cursor: 'pointer', padding: '4px' }}>
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0, zIndex: 99,
          background: d ? 'rgba(0,22,50,0.97)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
          padding: '20px 24px 28px',
          borderBottom: `1px solid ${navBorder}`,
          boxShadow: '0 8px 24px rgba(0,26,61,0.15)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {['About', 'Security', 'Features'].map(l => (
            <span key={l} style={{ fontSize: '15px', fontWeight: 600, color: headColor, cursor: 'pointer' }}>{l}</span>
          ))}
          <button onClick={() => { setMobileOpen(false); onEnterPortal() }}
            className="lp-cta" style={{ marginTop: '8px', justifyContent: 'center' }}>
            Enter Secure Portal <ArrowRight size={16}/>
          </button>
        </div>
      )}

      {/* ═══ HERO (fills remaining height) ═══ */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(32px, 6vh, 60px) 20px clamp(20px, 4vh, 40px)',
        position: 'relative', zIndex: 1,
      }}>
        {/* FDRE label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          marginBottom: '24px',
          animation: 'lp-up 0.7s ease 0.05s both',
        }}>
          <div style={{ width: '24px', height: '2px', background: blue, borderRadius: '1px' }}/>
          <span style={{ fontSize: '11px', fontWeight: 700, color: d ? '#33a0d4' : blue, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Federal Democratic Republic of Ethiopia
          </span>
          <div style={{ width: '24px', height: '2px', background: blue, borderRadius: '1px' }}/>
        </div>

        {/* Headline */}
        <h1 className="lp-hero-h1" style={{
          fontSize: 'clamp(40px, 6.5vw, 72px)',
          fontWeight: 800, color: headColor,
          lineHeight: 1.08, letterSpacing: '-1.5px',
          marginBottom: '16px',
          animation: 'lp-up 0.7s ease 0.1s both',
          transition: 'color 0.35s',
        }}>
          Security is not<br/>just a feature.
        </h1>

        <p style={{
          fontSize: '13px', fontWeight: 700,
          color: d ? 'rgba(255,255,255,0.4)' : '#6a8aaa',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: '18px',
          animation: 'lp-up 0.7s ease 0.15s both',
        }}>
          It's Parliament's standard.
        </p>

        {/* Subtitle */}
        <p style={{
          fontSize: '16px', color: subColor,
          maxWidth: '480px', lineHeight: 1.75, marginBottom: '36px',
          animation: 'lp-up 0.7s ease 0.2s both',
          transition: 'color 0.35s',
        }}>
          Every decision in Parliament SecureChat begins with the safety and security of your official communications.
        </p>

        {/* CTA */}
        <div style={{ animation: 'lp-up 0.7s ease 0.25s both' }}>
          <button onClick={onEnterPortal} className="lp-cta">
            Enter Secure Portal <ArrowRight size={16}/>
          </button>
        </div>

        {/* Feature pills */}
        <div className="lp-feat-row" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '10px',
          maxWidth: '860px',
          width: '100%',
          marginTop: '48px',
          animation: 'lp-up 0.7s ease 0.35s both',
        }}>
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="lp-feat-pill">
              <Icon size={14} color={blue} strokeWidth={2} style={{ flexShrink: 0 }}/>
              <span style={{ fontSize: '11px', fontWeight: 600, color: featTextColor, lineHeight: 1.3, transition: 'color 0.35s' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <p style={{
          marginTop: '28px',
          fontSize: '11px',
          color: badgeColor,
          letterSpacing: '0.06em',
          animation: 'lp-up 0.7s ease 0.4s both',
          transition: 'color 0.35s',
        }}>
          ECDH Encrypted · Admin-Verified · Session Protected · Audit Logged
        </p>
      </div>

      {/* ═══ MINIMAL FOOTER ═══ */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '14px clamp(20px,5vw,72px)',
        borderTop: `1px solid ${d ? 'rgba(255,255,255,0.06)' : 'rgba(0,102,178,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '8px',
        background: d ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ fontSize: '11px', color: badgeColor, fontWeight: 600 }}>
          © 2026 Parliament SecureChat · FDRE · House of Peoples' Representatives
        </span>
        <img src="/parliament-logo.png" alt="FDRE"
          style={{ width: '24px', height: '24px', objectFit: 'contain', opacity: 0.55, filter: d ? 'brightness(1.4)' : 'none' }}/>
      </div>
    </div>
  )
}

export default LandingPage
