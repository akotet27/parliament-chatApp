import { useState } from 'react'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, XCircle,
  AlertCircle, ShieldCheck, KeyRound, Clock, Users, Moon, Sun
} from 'lucide-react'
import { validateLoginForm, validateField } from '../utils/validation'

function LoginScreen({ onLogin, onGoToRegister, loading, error, darkMode, onToggleDark }) {
  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [errors, setErrors]             = useState({})
  const [touched, setTouched]           = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoClicked, setLogoClicked]   = useState(false)
  const [logoHovered, setLogoHovered]   = useState(false)

  const d           = darkMode
  const bg          = d ? '#0f172a' : '#f0f4ff'
  const navBg       = d ? '#1e293b' : '#ffffff'
  const cardBg      = d ? '#1e293b' : '#ffffff'
  const border      = d ? '#334155' : '#e2e8f0'
  const textPrimary = d ? '#f1f5f9' : '#0f2444'
  const textMuted   = d ? '#94a3b8' : '#64748b'
  const inputBg     = d ? '#0f172a' : '#f8fafc'
  const inputColor  = d ? '#f1f5f9' : '#0f2444'
  const heroBg      = d
    ? 'linear-gradient(160deg, #020617 0%, #0f172a 50%, #1e3a5f 100%)'
    : 'linear-gradient(160deg, #0f2444 0%, #1e3a5f 60%, #1d4ed8 100%)'

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

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'system-ui, sans-serif', transition: 'background 0.3s', position: 'relative' }}>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes bgPulse { 0%,100%{opacity:0.12;transform:translate(-50%,-50%) scale(0.98)} 50%{opacity:0.22;transform:translate(-50%,-50%) scale(1.03)} }
        @keyframes ringPulse { 0%{transform:translate(-50%,-50%) scale(0.95);opacity:0.3} 100%{transform:translate(-50%,-50%) scale(1.05);opacity:0.08} }

        .nav-btn:hover { opacity:0.8; transform:translateY(-1px); }
        .feature-card { transition: transform 0.25s, box-shadow 0.25s; cursor:default; }
        .feature-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,0.14) !important; }
        .submit-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 6px 20px rgba(29,78,216,0.35) !important; }
        .step-card { transition:transform 0.25s; cursor:default; }
        .step-card:hover { transform:translateY(-4px); }
        .req-link:hover { opacity:0.7; }
        input:focus { box-shadow:0 0 0 3px rgba(29,78,216,0.15) !important; }

        .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .steps-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; }
        .nav-inner     { display:flex; align-items:center; justify-content:space-between; padding:12px 48px; }

        @media(max-width:900px) {
          .features-grid { grid-template-columns:repeat(2,1fr) !important; }
          .steps-grid    { grid-template-columns:repeat(2,1fr) !important; gap:20px !important; }
          .nav-inner     { padding:12px 24px !important; }
        }
        @media(max-width:600px) {
          .features-grid { grid-template-columns:1fr !important; }
          .steps-grid    { grid-template-columns:1fr !important; }
          .nav-inner     { padding:10px 16px !important; }
          .nav-title     { display:none; }
          .hero-title    { font-size:24px !important; }
          .form-card     { padding:22px !important; }
          .section-title { font-size:20px !important; }
        }
        @media(max-width:400px) {
          .hero-title    { font-size:20px !important; }
          .feature-card  { padding:16px !important; }
        }
      `}</style>

      {/* ══ GLOBAL CENTERED BACKGROUND LOGO ══ */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        width: 'min(580px, 88vw)',
        height: 'min(580px, 88vw)',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'bgPulse 5s ease-in-out infinite',
      }}>
        <img src="/parliament-logo.png" alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'contain',
            filter: d
              ? 'invert(1) brightness(2)'
              : 'sepia(1) saturate(0.8) hue-rotate(190deg) brightness(0.9)',
            opacity: logoHovered ? 0.28 : 0.16,
            transition: 'opacity 0.5s',
          }}
        />
      </div>

      {/* ══ NAV ══ */}
      <nav style={{ background: navBg, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.08)', transition: 'background 0.3s' }}>
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/parliament-logo.png" alt="Parliament"
              style={{ width: '40px', height: '40px', objectFit: 'contain', cursor: 'pointer', transition: 'transform 0.25s', flexShrink: 0 }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.15) rotate(6deg)'; setLogoHovered(true) }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; setLogoHovered(false) }}
              onClick={() => setLogoClicked(p => !p)}
            />
            <div className="nav-title">
              <p style={{ fontSize: '13px', fontWeight: 800, color: textPrimary, margin: 0, whiteSpace: 'nowrap' }}>
                የኢ.ፌ.ዴ.ሪ የሕዝብ ተወካዮች ምክር ቤት
              </p>
              <p style={{ fontSize: '11px', color: textMuted, margin: 0, whiteSpace: 'nowrap' }}>
                House of Peoples' Representatives
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={onToggleDark} className="nav-btn"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${border}`, background: navBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, transition: 'all 0.2s' }}>
              {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
            <button onClick={onGoToRegister} className="nav-btn"
              style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              Request Access
            </button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ background: heroBg, padding: 'clamp(48px,8vw,80px) 24px', textAlign: 'center', color: '#fff', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        {/* Animated rings */}
        {[160, 240, 320].map((size, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: size + 'px', height: size + 'px',
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)',
            transform: 'translate(-50%,-50%)',
            animation: `ringPulse ${2 + i * 0.7}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`, pointerEvents: 'none',
          }}/>
        ))}

        {/* Interactive hero logo */}
        <div
          onClick={() => setLogoClicked(p => !p)}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          style={{
            display: 'inline-block', cursor: 'pointer',
            marginBottom: '16px', position: 'relative', zIndex: 2,
            transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            transform: logoClicked ? 'scale(2.1)' : logoHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <img src="/parliament-logo.png" alt="Ethiopian Parliament"
            style={{
              width: 'clamp(64px,10vw,92px)',
              height: 'clamp(64px,10vw,92px)',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 24px rgba(255,255,255,0.3))',
              transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              animation: logoClicked ? 'none' : 'float 3s ease-in-out infinite',
              display: 'block',
            }}
          />
        </div>

        {/* Revealed name */}
        <div style={{ overflow: 'hidden', maxHeight: logoClicked ? '80px' : '0', transition: 'max-height 0.5s ease', marginBottom: logoClicked ? '12px' : '0' }}>
          <p style={{ fontSize: 'clamp(11px,2vw,13px)', color: '#bfdbfe', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 3px', fontWeight: 600 }}>
            የኢ.ፌ.ዴ.ሪ የሕዝብ ተወካዮች ምክር ቤት
          </p>
          <p style={{ fontSize: 'clamp(10px,1.8vw,12px)', color: '#93c5fd', margin: 0 }}>
            House of Peoples' Representatives of the FDRE
          </p>
        </div>

        <h1 className="hero-title" style={{ fontSize: 'clamp(22px,5vw,38px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.5px', position: 'relative', zIndex: 2, lineHeight: 1.15 }}>
          Secure. Private. Classified.
        </h1>
        <p style={{ fontSize: 'clamp(14px,2.5vw,18px)', color: '#93c5fd', margin: '0 0 10px', position: 'relative', zIndex: 2 }}>
          Parliament SecureChat
        </p>
        <p style={{ fontSize: 'clamp(12px,1.8vw,14px)', color: '#bfdbfe', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2, lineHeight: 1.7 }}>
          End-to-end encrypted communications for members of the House of Peoples' Representatives. Every message encrypted before leaving your device.
        </p>
        <p style={{ fontSize: '12px', color: '#60a5fa', marginTop: '14px', opacity: 0.75, position: 'relative', zIndex: 2 }}>
          {logoClicked ? '↑ Click logo again to minimize' : '↑ Click the logo to reveal identity'}
        </p>
      </section>

      {/* ══ FEATURE CARDS ══ */}
      <section style={{ maxWidth: '900px', margin: '-36px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div className="features-grid">
          {[
            { icon: <ShieldCheck size={24} color="#1d4ed8"/>, title: 'ECDH Encryption',  desc: 'Keys generated on your device and never leave it. Server administrators cannot read messages.' },
            { icon: <Clock       size={24} color="#1d4ed8"/>, title: '2-Minute Timeout', desc: 'Sessions terminate after 2 minutes of inactivity. All keys cleared from memory on logout.' },
            { icon: <Users       size={24} color="#1d4ed8"/>, title: 'Admin Verified',   desc: 'Every account requires approval from a parliament administrator before gaining access.' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{ background: cardBg, borderRadius: '16px', padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${border}`, transition: 'background 0.3s' }}>
              <div style={{ width: '48px', height: '48px', background: d ? '#1e3a5f' : '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: textMuted, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ LOGIN FORM ══ */}
      <section style={{ maxWidth: '460px', margin: '44px auto', padding: '0 20px', position: 'relative', zIndex: 5 }}>

        {/* Form card with watermark logo */}
        <div className="form-card" style={{
          background: d ? 'rgba(30,41,59,0.92)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: d
            ? '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 8px 40px rgba(29,78,216,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
          border: `1px solid ${d ? 'rgba(255,255,255,0.08)' : 'rgba(29,78,216,0.12)'}`,
          animation: 'fadeIn 0.4s ease',
          transition: 'background 0.3s',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* ── WATERMARK LOGO inside card ── */}
          <div style={{
            position: 'absolute',
            bottom: '-24px', right: '-24px',
            width: '180px', height: '180px',
            pointerEvents: 'none', zIndex: 0,
          }}>
            <img src="/parliament-logo.png" alt=""
              style={{
                width: '100%', height: '100%', objectFit: 'contain',
                opacity: d ? 0.07 : 0.09,
                filter: d ? 'invert(1)' : 'sepia(1) saturate(0.5) hue-rotate(190deg)',
              }}
            />
          </div>

          {/* ── Top-left small watermark ── */}
          <div style={{
            position: 'absolute',
            top: '-16px', left: '-16px',
            width: '100px', height: '100px',
            pointerEvents: 'none', zIndex: 0,
            opacity: d ? 0.04 : 0.06,
          }}>
            <img src="/parliament-logo.png" alt=""
              style={{ width: '100%', filter: d ? 'invert(1)' : 'none' }}
            />
          </div>

          {/* All form content above watermark */}
          <div style={{ position: 'relative', zIndex: 1 }}>

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
                  <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input
                    name="email" type="email" value={formData.email}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="you@parliament.gov.et" autoComplete="off"
                    style={{ width: '100%', padding: '11px 12px 11px 36px', fontSize: '14px', border: `1.5px solid ${errors.email ? '#ef4444' : border}`, borderRadius: '10px', outline: 'none', color: inputColor, background: d ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.9)', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.12)' }}
                    onBlurCapture={e => { e.target.style.borderColor = errors.email ? '#ef4444' : border; e.target.style.boxShadow = 'none' }}
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
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input
                    name="password" type={showPassword ? 'text' : 'password'}
                    value={formData.password} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Enter your password" autoComplete="off"
                    style={{ width: '100%', padding: '11px 40px 11px 36px', fontSize: '14px', border: `1.5px solid ${errors.password ? '#ef4444' : border}`, borderRadius: '10px', outline: 'none', color: inputColor, background: d ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.9)', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.12)' }}
                    onBlurCapture={e => { e.target.style.borderColor = errors.password ? '#ef4444' : border; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
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

              {/* Submit */}
              <button type="submit" disabled={loading || isSubmitting} className="submit-btn"
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: loading || isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading || isSubmitting ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(29,78,216,0.3)' }}>
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

            <p style={{ textAlign: 'center', fontSize: '13px', color: textMuted, marginTop: '18px', margin: '18px 0 0' }}>
              Need access?{' '}
              <button onClick={onGoToRegister} className="req-link"
                style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 700, cursor: 'pointer', fontSize: '13px', transition: 'opacity 0.2s' }}>
                Request account
              </button>
            </p>

          </div>
        </div>

        {/* Warning */}
        <div style={{ marginTop: '14px', background: d ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: `1px solid ${border}`, borderRadius: '12px', padding: '12px 16px', textAlign: 'center', transition: 'background 0.3s' }}>
          <p style={{ fontSize: '12px', color: textMuted, margin: 0, lineHeight: 1.6 }}>
            ⚠️ Unauthorized access is a criminal offense under Ethiopian law.
            All sessions are monitored and logged.
          </p>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ background: d ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', padding: 'clamp(40px,6vw,64px) 24px', borderTop: `1px solid ${border}`, position: 'relative', zIndex: 1, transition: 'background 0.3s' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title" style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: textPrimary, margin: '0 0 12px' }}>
            Only parliament members can access your messages.
          </h2>
          <p style={{ fontSize: 'clamp(13px,2vw,15px)', color: textMuted, maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Parliament SecureChat uses ECDH — the same technology used by Signal and WhatsApp.
          </p>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Key pair generated', desc: 'Your browser generates a unique public/private key pair on login. Private key never leaves your device.' },
              { step: '02', title: 'Keys exchanged',     desc: 'Public keys shared. Each conversation derives a unique shared secret using ECDH — without sending it.' },
              { step: '03', title: 'Messages encrypted', desc: 'Every message encrypted locally before sending. Server stores only unreadable ciphertext.' },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, color: d ? '#1e3a5f' : '#dbeafe', marginBottom: '10px' }}>{s.step}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: textMuted, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#0f2444', color: '#94a3b8', padding: 'clamp(20px,3vw,28px) clamp(20px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/parliament-logo.png" alt="Parliament" style={{ width: '32px', height: '32px', objectFit: 'contain', opacity: 0.85, flexShrink: 0 }}/>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>House of Peoples' Representatives · FDRE</p>
            <p style={{ margin: 0, fontSize: '11px' }}>SecureChat — Classified Communications Portal</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '12px' }}>🔐 ECDH encrypted · AES-GCM messages</p>
      </footer>

    </div>
  )
}

export default LoginScreen