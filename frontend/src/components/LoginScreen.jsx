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
  const bg          = d ? '#060c1a' : '#eef2ff'
  const navBg       = d ? 'rgba(6,12,26,0.85)' : 'rgba(255,255,255,0.85)'
  const cardBg      = d ? 'rgba(14,22,40,0.94)' : 'rgba(255,255,255,0.96)'
  const border      = d ? 'rgba(255,255,255,0.08)' : 'rgba(29,78,216,0.13)'
  const textPrimary = d ? '#f1f5f9' : '#0f2444'
  const textMuted   = d ? '#8496b0' : '#64748b'
  const inputBg     = d ? 'rgba(255,255,255,0.05)' : 'rgba(249,250,251,0.9)'
  const inputColor  = d ? '#f1f5f9' : '#0f2444'
  const inputBorder = d ? 'rgba(255,255,255,0.1)' : '#dde4f0'

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
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', transition: 'background 0.4s', position: 'relative', overflowX: 'hidden' }}>

      <style>{`
        * { box-sizing: border-box; }

        /* ── Keyframes ── */
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes float     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow      { 0%,100%{opacity:0.4;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.65;transform:translate(-50%,-50%) scale(1.08)} }
        @keyframes logoBg    { 0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:0.42;transform:scale(1.05)} }
        @keyframes ringPulse { 0%{transform:translate(-50%,-50%) scale(0.92);opacity:0.12} 100%{transform:translate(-50%,-50%) scale(1.08);opacity:0.03} }

        /* ── Component styles ── */
        .feature-card {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 56px rgba(29,78,216,0.18) !important;
          border-color: rgba(59,130,246,0.35) !important;
        }

        .submit-btn {
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.25s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(29,78,216,0.5) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }

        .logo-interactive {
          transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), filter 0.4s;
          display: inline-block; cursor: pointer;
        }
        .logo-interactive:hover {
          transform: scale(1.12) rotate(5deg) !important;
          filter: drop-shadow(0 0 40px rgba(96,165,250,0.7)) drop-shadow(0 4px 20px rgba(0,0,0,0.5)) !important;
        }
        .logo-interactive:active { transform: scale(0.92) !important; }

        .nav-logo {
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          cursor: pointer; display: block;
        }
        .nav-logo:hover { transform: scale(1.15) rotate(6deg); }

        .dark-btn:hover  { background: ${d ? 'rgba(255,255,255,0.08)' : 'rgba(29,78,216,0.06)'} !important; }
        .reg-btn:hover   { opacity: 0.82; transform: translateY(-1px); }
        .req-btn:hover   { color: #2563eb !important; text-decoration: underline; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px ${d ? 'rgba(0,0,0,0.4)' : 'rgba(29,78,216,0.12)'} !important; }

        .input-field {
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          width: 100%; font-family: inherit; outline: none;
        }
        .input-field:focus {
          border-color: #1d4ed8 !important;
          box-shadow: 0 0 0 4px rgba(29,78,216,0.13) !important;
          background: ${d ? 'rgba(29,78,216,0.09)' : 'rgba(255,255,255,1)'} !important;
        }

        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .steps-grid    { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .nav-inner     { max-width: 1080px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 62px; }

        @media(max-width:860px) {
          .features-grid { grid-template-columns: repeat(2,1fr) !important; }
          .steps-grid    { grid-template-columns: 1fr !important; }
          .nav-inner     { padding: 0 20px !important; }
        }
        @media(max-width:540px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .nav-inner     { padding: 0 16px !important; }
          .nav-title     { display: none; }
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        background: navBg,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${border}`,
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'background 0.4s',
        boxShadow: d ? '0 1px 24px rgba(0,0,0,0.4)' : '0 1px 16px rgba(29,78,216,0.07)',
      }}>
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/parliament-logo.png" alt="Parliament"
              className="nav-logo"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              onClick={() => setLogoClicked(p => !p)}
              style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(29,78,216,0.25))' }}
            />
            <div className="nav-title">
              <p style={{ fontSize: '13px', fontWeight: 800, color: textPrimary, margin: 0, lineHeight: 1.2 }}>
                Parliament SecureChat
              </p>
              <p style={{ fontSize: '10px', color: textMuted, margin: 0, letterSpacing: '0.03em' }}>
                House of Peoples' Representatives · FDRE
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={onToggleDark} className="dark-btn"
              style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, transition: 'all 0.2s' }}>
              {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
            <button onClick={onGoToRegister} className="reg-btn"
              style={{ background: d ? 'rgba(29,78,216,0.18)' : '#1d4ed8', color: d ? '#60a5fa' : '#fff', border: d ? '1px solid rgba(59,130,246,0.35)' : 'none', borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              Request Access
            </button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{
        background: d
          ? 'linear-gradient(175deg, #060c1a 0%, #0d1a35 60%, #1a2d55 100%)'
          : 'linear-gradient(175deg, #0f2444 0%, #1a3d72 55%, #1d4ed8 100%)',
        padding: 'clamp(64px,9vw,108px) 24px clamp(90px,13vw,130px)',
        textAlign: 'center',
        position: 'relative', zIndex: 1,
        overflow: 'hidden',
      }}>

        {/* ── Parliament logo — sits at bottom of hero, only top arc visible ── */}
        <div style={{
          position: 'absolute', bottom: '-38%', left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(560px, 85vw)', height: 'min(560px, 85vw)',
          pointerEvents: 'none', zIndex: 0,
          maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 75%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 75%)',
        }}>
          <img src="/parliament-logo.png" alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'contain', display: 'block',
              filter: 'grayscale(1) sepia(1) hue-rotate(185deg) saturate(6) brightness(2.5)',
              animation: logoHovered ? 'none' : 'logoBg 8s ease-in-out infinite',
              opacity: logoHovered ? 0.55 : undefined,
              transition: 'opacity 0.6s ease',
            }}
          />
        </div>

        {/* Rings */}
        {[180, 300, 440, 580].map((size, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: size, height: size, borderRadius: '50%',
            border: `1px solid rgba(255,255,255,${0.05 - i * 0.01})`,
            pointerEvents: 'none',
            animation: `ringPulse ${3.5 + i * 0.8}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }}/>
        ))}

        {/* Hero logo */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '22px', animation: 'fadeUp 0.6s ease both' }}>
          <div
            className="logo-interactive"
            onClick={() => setLogoClicked(p => !p)}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{
              transform: logoClicked ? 'scale(2.2)' : 'scale(1)',
              filter: 'drop-shadow(0 0 32px rgba(96,165,250,0.45)) drop-shadow(0 6px 20px rgba(0,0,0,0.5))',
              animation: logoClicked ? 'none' : 'float 4s ease-in-out infinite',
            }}
          >
            <img src="/parliament-logo.png" alt="Parliament"
              style={{ width: 'clamp(76px,11vw,108px)', height: 'clamp(76px,11vw,108px)', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>

        {/* Reveal on click */}
        <div style={{ overflow: 'hidden', maxHeight: logoClicked ? '56px' : '0', opacity: logoClicked ? 1 : 0, transition: 'max-height 0.5s ease, opacity 0.4s', marginBottom: logoClicked ? '14px' : '0' }}>
          <p style={{ fontSize: 'clamp(11px,2vw,13px)', color: '#93c5fd', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 3px', fontWeight: 700 }}>
            የኢ.ፌ.ዴ.ሪ የሕዝብ ተወካዮች ምክር ቤት
          </p>
          <p style={{ fontSize: 'clamp(10px,1.6vw,11px)', color: '#60a5fa', margin: 0, opacity: 0.8 }}>
            House of Peoples' Representatives of the FDRE
          </p>
        </div>

        {/* Heading */}
        <div style={{ position: 'relative', zIndex: 2, animation: 'fadeUp 0.7s 0.1s ease both' }}>
          <h1 style={{ fontSize: 'clamp(30px,6vw,58px)', fontWeight: 900, margin: '0 0 12px', color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.08 }}>
            Secure. Private.{' '}
            <span style={{ background: 'linear-gradient(130deg, #60a5fa 0%, #a78bfa 55%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Classified.
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(14px,2.5vw,18px)', color: 'rgba(255,255,255,0.6)', margin: '0 auto', maxWidth: '460px', lineHeight: 1.7 }}>
            End-to-end encrypted communications for members of the House of Peoples' Representatives.
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '16px', letterSpacing: '0.06em', transition: 'opacity 0.4s' }}>
            {logoClicked ? '↑ Click the logo again to minimize' : '↑ Click the logo to reveal identity'}
          </p>
        </div>
      </section>

      {/* ══ FEATURE CARDS ══ */}
      <section style={{ maxWidth: '860px', margin: '-36px auto 0', padding: '0 20px', position: 'relative', zIndex: 10, animation: 'fadeUp 0.7s 0.15s ease both' }}>
        <div className="features-grid">
          {[
            { icon: <ShieldCheck size={22} color="#3b82f6"/>, title: 'ECDH Encryption',   desc: 'Keys are generated on your device only. Private keys never leave your browser.' },
            { icon: <Clock       size={22} color="#3b82f6"/>, title: 'Auto Session Lock', desc: 'Sessions lock after 2 minutes of inactivity and all encryption keys are cleared.' },
            { icon: <Users       size={22} color="#3b82f6"/>, title: 'Admin Verified',    desc: 'Every member account is reviewed and approved by parliament administration.' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: cardBg,
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '18px', padding: '22px',
              boxShadow: d ? '0 4px 32px rgba(0,0,0,0.35)' : '0 4px 24px rgba(29,78,216,0.09)',
              border: `1px solid ${border}`,
              transition: 'background 0.3s',
            }}>
              <div style={{ width: '46px', height: '46px', background: d ? 'rgba(29,78,216,0.18)' : '#eff6ff', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: d ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: textPrimary, margin: '0 0 7px' }}>{f.title}</h3>
              <p style={{ fontSize: '12px', color: textMuted, margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ LOGIN FORM ══ */}
      <section style={{ maxWidth: '420px', margin: '44px auto', padding: '0 20px', position: 'relative', zIndex: 5, animation: 'fadeUp 0.75s 0.2s ease both' }}>

        <div style={{
          background: cardBg,
          backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '24px',
          padding: 'clamp(26px,5vw,38px)',
          boxShadow: d
            ? '0 0 0 1px rgba(255,255,255,0.07), 0 24px 80px rgba(0,0,0,0.65), 0 4px 16px rgba(29,78,216,0.12)'
            : '0 0 0 1px rgba(29,78,216,0.1), 0 20px 72px rgba(29,78,216,0.11), 0 4px 16px rgba(0,0,0,0.04)',
          position: 'relative', overflow: 'hidden',
          transition: 'background 0.4s',
        }}>

          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(29,78,216,0.35)', flexShrink: 0 }}>
                <KeyRound size={19} color="#fff"/>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: textPrimary, margin: 0, lineHeight: 1.2 }}>Secure Sign In</h2>
                <p style={{ fontSize: '12px', color: textMuted, margin: 0 }}>Parliament credentials required</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: d ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', animation: 'slideDown 0.3s ease' }}>
                <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }}/>
                <p style={{ fontSize: '13px', color: '#ef4444', margin: 0, lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Official Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color={d ? '#4b6080' : '#94a3b8'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}/>
                  <input
                    className="input-field"
                    name="email" type="email" value={formData.email}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="you@parliament.gov.et" autoComplete="off"
                    style={{ padding: '12px 14px 12px 40px', fontSize: '14px', border: `1.5px solid ${errors.email ? '#ef4444' : inputBorder}`, borderRadius: '12px', color: inputColor, background: inputBg, boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                    onBlurCapture={e => e.target.style.borderColor = errors.email ? '#ef4444' : inputBorder}
                  />
                </div>
                {errors.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                    <AlertCircle size={12} color="#ef4444"/>
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '26px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color={d ? '#4b6080' : '#94a3b8'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}/>
                  <input
                    className="input-field"
                    name="password" type={showPassword ? 'text' : 'password'}
                    value={formData.password} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Enter your password" autoComplete="off"
                    style={{ padding: '12px 44px 12px 40px', fontSize: '14px', border: `1.5px solid ${errors.password ? '#ef4444' : inputBorder}`, borderRadius: '12px', color: inputColor, background: inputBg, boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                    onBlurCapture={e => e.target.style.borderColor = errors.password ? '#ef4444' : inputBorder}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: d ? '#4b6080' : '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                    onMouseLeave={e => e.currentTarget.style.color = d ? '#4b6080' : '#94a3b8'}
                  >
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.password && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                    <AlertCircle size={12} color="#ef4444"/>
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading || isSubmitting} className="submit-btn"
                style={{ width: '100%', padding: '14px', background: loading || isSubmitting ? (d ? '#1e3564' : '#93c5fd') : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: loading || isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading || isSubmitting ? 'none' : '0 4px 22px rgba(29,78,216,0.38)', letterSpacing: '0.02em' }}>
                {loading || isSubmitting ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.25)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }}/>
                    Establishing secure session...
                  </>
                ) : (
                  <><ShieldCheck size={16}/> Sign In Securely <ArrowRight size={16}/></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: textMuted, marginTop: '20px' }}>
              Need access?{' '}
              <button onClick={onGoToRegister} className="req-btn"
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '13px', transition: 'color 0.2s', padding: 0 }}>
                Request an account →
              </button>
            </p>

          </div>
        </div>

        {/* Security notice */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', background: d ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '14px', transition: 'background 0.4s' }}>
          <AlertCircle size={13} color={textMuted} style={{ flexShrink: 0 }}/>
          <p style={{ fontSize: '11px', color: textMuted, margin: 0, lineHeight: 1.55 }}>
            Unauthorized access is a criminal offense under Ethiopian law. All sessions are monitored and logged.
          </p>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ background: d ? 'rgba(8,15,28,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: 'clamp(52px,8vw,80px) clamp(20px,5vw,48px)', borderTop: `1px solid ${border}`, position: 'relative', zIndex: 1, transition: 'background 0.4s' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: textPrimary, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Zero-knowledge architecture
          </h2>
          <p style={{ fontSize: 'clamp(13px,2vw,15px)', color: textMuted, maxWidth: '500px', margin: '0 auto 44px', lineHeight: 1.7 }}>
            Uses ECDH key exchange — the same technology powering Signal and WhatsApp. The server never sees your messages.
          </p>

          <div className="steps-grid" style={{ textAlign: 'left' }}>
            {[
              { step: '01', title: 'Key pair generated', desc: 'Your browser generates a unique public/private key pair on login. The private key is stored only in memory — never sent anywhere.' },
              { step: '02', title: 'Keys exchanged',     desc: 'Public keys are shared. Each conversation derives a unique shared secret locally using ECDH — without transmitting it over the network.' },
              { step: '03', title: 'Messages encrypted', desc: 'Every message is encrypted on your device before sending. The server stores only unreadable ciphertext.' },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{ padding: '24px', background: d ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)', borderRadius: '18px', border: `1px solid ${border}`, transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: d ? '0 2px 16px rgba(0,0,0,0.25)' : '0 2px 12px rgba(29,78,216,0.06)' }}>
                <div style={{ fontSize: '38px', fontWeight: 900, marginBottom: '12px', background: d ? 'linear-gradient(135deg, #1e3a5f, #2563eb)' : 'linear-gradient(135deg, #bfdbfe, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: textMuted, margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: d ? '#030810' : '#0c1f40', padding: 'clamp(20px,3vw,32px) clamp(20px,5vw,52px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/parliament-logo.png" alt="Parliament" style={{ width: '32px', height: '32px', objectFit: 'contain', opacity: 0.75, flexShrink: 0, filter: 'brightness(3) saturate(0.4)' }}/>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>House of Peoples' Representatives · FDRE</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>SecureChat — Classified Communications Portal</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          <ShieldCheck size={13} color="#3b82f6"/>
          End-to-end encrypted
        </div>
      </footer>

    </div>
  )
}

export default LoginScreen
