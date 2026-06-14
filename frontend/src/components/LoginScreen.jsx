import { useState, useEffect } from 'react'
import {
  Mail, Lock, Eye, EyeOff,
  ArrowRight, XCircle, AlertCircle,
  ShieldCheck, KeyRound, Clock, Users, Moon, Sun
} from 'lucide-react'
import { validateLoginForm, validateField } from '../utils/validation'

function LoginScreen({ onLogin, onGoToRegister, loading, error, darkMode, onToggleDark }) {
  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [errors, setErrors]             = useState({})
  const [touched, setTouched]           = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoHovered, setLogoHovered]   = useState(false)
  const [logoClicked, setLogoClicked]   = useState(false)
  const [mousePos, setMousePos]         = useState({ x: 0, y: 0 })

  // Track mouse position for background logo follow effect
  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const d = darkMode
  const bg          = d ? '#0f172a' : '#f8fafc'
  const navBg       = d ? '#1e293b' : '#ffffff'
  const cardBg      = d ? '#1e293b' : '#ffffff'
  const border      = d ? '#334155' : '#e2e8f0'
  const textPrimary = d ? '#f1f5f9' : '#0f2444'
  const textMuted   = d ? '#94a3b8' : '#64748b'
  const inputBg     = d ? '#0f172a' : '#f8fafc'
  const inputColor  = d ? '#f1f5f9' : '#0f2444'
  const heroBg      = d
    ? 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e3a5f 100%)'
    : 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 60%, #1d4ed8 100%)'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const r = validateField(name, value, formData)
      setErrors(prev => ({ ...prev, [name]: r.valid ? '' : r.message }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const r = validateField(name, value, formData)
    setErrors(prev => ({ ...prev, [name]: r.valid ? '' : r.message }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const { valid, errors: fe } = validateLoginForm(formData)
    setErrors(fe)
    if (!valid) return
    setIsSubmitting(true)
    const result = await onLogin(formData.email, formData.password)
    if (!result.success) setIsSubmitting(false)
  }

  const handleLogoClick = () => {
    setLogoClicked(prev => !prev)
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'system-ui, sans-serif', transition: 'background 0.3s' }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes logoGrow { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes bgLogoFloat { 0%,100%{opacity:0.04;transform:scale(1) rotate(-5deg)} 50%{opacity:0.07;transform:scale(1.05) rotate(-3deg)} }
        .nav-btn:hover { opacity: 0.85 !important; transform: translateY(-1px); }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .step-card:hover { transform: translateY(-3px); }
        input:focus { box-shadow: 0 0 0 3px rgba(29,78,216,0.15); }
      `}</style>

      {/* ── Background logo that follows mouse ── */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 0,
        left: mousePos.x - 150, top: mousePos.y - 150,
        width: '300px', height: '300px',
        transition: 'left 0.8s ease, top 0.8s ease',
        opacity: logoHovered ? 0.08 : 0.03,
      }}>
        <img src="/parliament-logo.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain',
            filter: d ? 'invert(1)' : 'none',
            animation: 'bgLogoFloat 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Fixed large background logo (decorative) ── */}
      <div style={{
        position: 'fixed', right: '-80px', bottom: '-80px',
        width: '400px', height: '400px', pointerEvents: 'none', zIndex: 0,
        opacity: 0.04, animation: 'bgLogoFloat 6s ease-in-out infinite',
      }}>
        <img src="/parliament-logo.png" alt=""
          style={{ width: '100%', filter: d ? 'invert(1)' : 'none' }}/>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        background: navBg, borderBottom: `1px solid ${border}`,
        padding: '12px 48px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
        transition: 'background 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/parliament-logo.png" alt="Parliament"
            style={{ width: '44px', height: '44px', objectFit: 'contain',
              cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.1) rotate(5deg)'; setLogoHovered(true) }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; setLogoHovered(false) }}
            onClick={handleLogoClick}
          />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: textPrimary, margin: 0 }}>
              የኢ.ፌ.ዴ.ሪ የሕዝብ ተወካዮች ምክር ቤት
            </p>
            <p style={{ fontSize: '11px', color: textMuted, margin: 0 }}>
              House of Peoples' Representatives · SecureChat
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Dark mode toggle */}
          <button onClick={onToggleDark} className="nav-btn"
            style={{
              width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${border}`,
              background: navBg, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: textMuted,
              transition: 'all 0.2s',
            }}>
            {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <button onClick={onGoToRegister} className="nav-btn"
            style={{
              background: '#1d4ed8', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '8px 18px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
            Request Access
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: heroBg, padding: '72px 24px',
        textAlign: 'center', color: '#fff', position: 'relative', zIndex: 1,
        overflow: 'hidden',
      }}>
        {/* Animated rings behind logo */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}>
          {[200, 300, 400].map((size, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: size + 'px', height: size + 'px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.08)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `pulse ${2 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}/>
          ))}
        </div>

        {/* Interactive logo */}
        <div
          onClick={handleLogoClick}
          style={{
            display: 'inline-block', cursor: 'pointer', marginBottom: '20px',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: logoClicked ? 'scale(2.2)' : 'scale(1)',
            position: 'relative', zIndex: 2,
          }}
          onMouseEnter={e => { if (!logoClicked) e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { if (!logoClicked) e.currentTarget.style.transform = 'scale(1)' }}
        >
          <img src="/parliament-logo.png" alt="Ethiopian Parliament"
            style={{
              width: logoClicked ? '120px' : '90px',
              height: logoClicked ? '120px' : '90px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 32px rgba(255,255,255,0.25))',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: logoClicked ? 'none' : 'float 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Name shown when logo is clicked */}
        <div style={{
          maxHeight: logoClicked ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.5s ease',
          marginBottom: logoClicked ? '12px' : '0',
        }}>
          <p style={{
            fontSize: '13px', color: '#bfdbfe', letterSpacing: '3px',
            textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 600,
          }}>
            የኢ.ፌ.ዴ.ሪ የሕዝብ ተወካዮች ምክር ቤት
          </p>
          <p style={{ fontSize: '12px', color: '#93c5fd', margin: 0 }}>
            House of Peoples' Representatives of the FDRE
          </p>
        </div>

        <h1 style={{
          fontSize: '38px', fontWeight: 900, margin: '0 0 8px',
          letterSpacing: '-0.5px', position: 'relative', zIndex: 2,
        }}>
          Secure. Private. Classified.
        </h1>
        <p style={{ fontSize: '18px', color: '#93c5fd', margin: '0 0 8px', position: 'relative', zIndex: 2 }}>
          Parliament SecureChat
        </p>
        <p style={{ fontSize: '14px', color: '#bfdbfe', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          End-to-end encrypted communications for members of the
          House of Peoples' Representatives. Every message encrypted before leaving your device.
        </p>

        {/* Click hint */}
        {!logoClicked && (
          <p style={{ fontSize: '12px', color: '#60a5fa', marginTop: '16px', opacity: 0.7, position: 'relative', zIndex: 2 }}>
            ↑ Click the logo to reveal
          </p>
        )}
        {logoClicked && (
          <p style={{ fontSize: '12px', color: '#60a5fa', marginTop: '8px', opacity: 0.7, position: 'relative', zIndex: 2 }}>
            Click again to minimize
          </p>
        )}
      </section>

      {/* ── FEATURE CARDS ── */}
      <section style={{
        maxWidth: '900px', margin: '-40px auto 0',
        padding: '0 24px', position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {[
            { icon: <ShieldCheck size={26} color="#1d4ed8"/>, title: 'ECDH Encryption', desc: 'Keys generated on your device and never leave it. Server administrators cannot read messages.' },
            { icon: <Clock size={26} color="#1d4ed8"/>, title: '2-Minute Timeout', desc: 'Sessions terminate after 2 minutes of inactivity. All keys cleared from memory on logout.' },
            { icon: <Users size={26} color="#1d4ed8"/>, title: 'Admin Verified', desc: 'Every account requires approval from a parliament administrator before gaining access.' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: cardBg, borderRadius: '16px', padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${border}`,
              transition: 'all 0.25s', cursor: 'default',
            }}>
              <div style={{ width: '50px', height: '50px', background: d ? '#1e3a5f' : '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: textMuted, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOGIN FORM ── */}
      <section style={{ maxWidth: '440px', margin: '48px auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: cardBg, borderRadius: '20px', padding: '36px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.1)', border: `1px solid ${border}`,
          animation: 'fadeIn 0.4s ease',
          transition: 'background 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <KeyRound size={20} color="#1d4ed8"/>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: textPrimary, margin: 0 }}>
              Secure Sign In
            </h2>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: d ? '#450a0a' : '#fef2f2', border: `1px solid ${d ? '#991b1b' : '#fecaca'}`, borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
              <XCircle size={16} color="#ef4444"/>
              <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Official Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                <input
                  name="email" type="email" value={formData.email}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="you@parliament.gov.et" autoComplete="off"
                  style={{ width: '100%', padding: '11px 12px 11px 38px', fontSize: '14px', border: `1px solid ${errors.email ? '#ef4444' : border}`, borderRadius: '10px', outline: 'none', color: inputColor, background: inputBg, boxSizing: 'border-box', transition: 'all 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlurCapture={e => e.target.style.borderColor = errors.email ? '#ef4444' : border}
                />
              </div>
              {errors.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <AlertCircle size={12} color="#ef4444"/>
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Enter your password" autoComplete="off"
                  style={{ width: '100%', padding: '11px 40px 11px 38px', fontSize: '14px', border: `1px solid ${errors.password ? '#ef4444' : border}`, borderRadius: '10px', outline: 'none', color: inputColor, background: inputBg, boxSizing: 'border-box', transition: 'all 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlurCapture={e => e.target.style.borderColor = errors.password ? '#ef4444' : border}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <AlertCircle size={12} color="#ef4444"/>
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{errors.password}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading || isSubmitting} className="submit-btn"
              style={{
                width: '100%', padding: '13px', background: '#1d4ed8',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700,
                cursor: loading || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading || isSubmitting ? 0.7 : 1, transition: 'all 0.2s',
              }}>
              {loading || isSubmitting ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                  Establishing secure session...
                </>
              ) : (
                <><ShieldCheck size={16}/> Sign In Securely <ArrowRight size={16}/></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: textMuted, marginTop: '16px' }}>
            Need access?{' '}
            <button onClick={onGoToRegister}
              style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: '13px', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Request account
            </button>
          </p>
        </div>

        <div style={{ marginTop: '16px', background: cardBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '14px 16px', textAlign: 'center', transition: 'background 0.3s' }}>
          <p style={{ fontSize: '12px', color: textMuted, margin: 0, lineHeight: 1.6 }}>
            ⚠️ Unauthorized access is a criminal offense under Ethiopian law.
            All sessions are monitored and logged.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: d ? '#1e293b' : '#fff', padding: '64px 24px', borderTop: `1px solid ${border}`, position: 'relative', zIndex: 1, transition: 'background 0.3s' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: textPrimary, margin: '0 0 12px' }}>
            Only parliament members can access your messages.
          </h2>
          <p style={{ fontSize: '15px', color: textMuted, maxWidth: '560px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            Parliament SecureChat uses ECDH — the same technology used by Signal and WhatsApp.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '32px' }}>
            {[
              { step: '01', title: 'Key pair generated', desc: 'Your browser generates a unique public/private key pair on login. Private key never leaves your device.' },
              { step: '02', title: 'Keys exchanged', desc: 'Public keys shared. Each conversation derives a unique shared secret using ECDH.' },
              { step: '03', title: 'Messages encrypted', desc: 'Every message encrypted locally before sending. Server stores only unreadable ciphertext.' },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{ textAlign: 'left', transition: 'transform 0.25s', cursor: 'default' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: d ? '#1e3a5f' : '#dbeafe', marginBottom: '12px' }}>{s.step}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: textMuted, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f2444', color: '#94a3b8', padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/parliament-logo.png" alt="Parliament" style={{ width: '34px', height: '34px', objectFit: 'contain', opacity: 0.8 }}/>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
              House of Peoples' Representatives · FDRE
            </p>
            <p style={{ margin: 0, fontSize: '11px' }}>SecureChat — Classified Communications Portal</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '12px' }}>🔐 ECDH encrypted · AES-GCM messages</p>
      </footer>

    </div>
  )
}

export default LoginScreen