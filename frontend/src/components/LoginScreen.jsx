import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight, XCircle, ArrowLeft, Sun, Moon } from 'lucide-react'
import { validateLoginForm, validateField } from '../utils/validation'

function LoginScreen({ onLogin, onGoToRegister, onBack, loading, error, darkMode, onToggleDark }) {
  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [errors, setErrors]             = useState({})
  const [touched, setTouched]           = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForgot, setShowForgot]     = useState(false)

  const d = darkMode

  // Color system
  const pageBg    = d ? 'linear-gradient(160deg, #0d1e35 0%, #102848 50%, #091628 100%)' : 'linear-gradient(160deg, #dceeff 0%, #eef5ff 50%, #e0eeff 100%)'
  const cardBg    = d ? 'rgba(17,32,56,0.95)'  : 'rgba(255,255,255,0.9)'
  const cardBorder= d ? 'rgba(0,102,178,0.25)' : 'rgba(0,102,178,0.12)'
  const textHead  = d ? '#e6f4ff'  : '#001a3d'
  const textMuted = d ? '#5b8ab8'  : '#4a6580'
  const inputBg   = d ? '#061220'  : 'rgba(255,255,255,0.8)'
  const inputBdr  = d ? 'rgba(0,102,178,0.3)' : '#d4e5f7'
  const inputClr  = d ? '#e6f4ff'  : '#001a3d'
  const ringClr   = d ? 'rgba(0,102,178,0.1)' : 'rgba(0,102,178,0.08)'
  const noticeBg  = d ? 'rgba(0,102,178,0.08)' : 'rgba(0,102,178,0.05)'
  const noticeBdr = d ? 'rgba(0,102,178,0.2)'  : 'rgba(0,102,178,0.1)'
  const forgotBg  = d ? 'rgba(0,30,60,0.8)'    : '#f0f8ff'
  const forgotBdr = d ? 'rgba(0,102,178,0.3)'  : 'rgba(0,102,178,0.2)'
  const blue      = '#0066b2'
  const blueLt    = '#1a80cc'

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

  const busy = loading || isSubmitting

  return (
    <div style={{
      minHeight: '100vh',
      background: pageBg,
      fontFamily: "'Montserrat', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '20px',
      transition: 'background 0.4s ease',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes ls-up   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ls-err  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ls-float { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.025)} }
        @keyframes ls-fade  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        .ls-input {
          width: 100%; outline: none; font-family: inherit;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .ls-input:focus {
          border-color: ${blue} !important;
          box-shadow: 0 0 0 3px rgba(0,102,178,0.15) !important;
        }
        .ls-submit { transition: all 0.2s; }
        .ls-submit:hover:not(:disabled) { background: ${blueLt} !important; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,102,178,0.4) !important; }
        .ls-submit:active:not(:disabled) { transform: translateY(0); }
        .ls-back { transition: all 0.2s; }
        .ls-back:hover { background: ${d ? 'rgba(0,102,178,0.2)' : 'rgba(0,102,178,0.1)'} !important; color: ${blue} !important; }
        .ls-toggle { transition: all 0.2s; }
        .ls-toggle:hover { background: ${d ? 'rgba(255,255,255,0.15)' : 'rgba(0,102,178,0.12)'} !important; }
        .ls-req:hover { text-decoration: underline; color: ${blueLt} !important; }
        .ls-forgot:hover { text-decoration: underline; color: ${blueLt} !important; }
      `}</style>

      {/* Parliament logo — large background watermark */}
      <img src="/parliament-logo.png" alt="" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(300px, 55vw, 700px)', height: 'auto',
        objectFit: 'contain', pointerEvents: 'none',
        opacity: d ? 0.06 : 0.07,
        filter: d ? 'brightness(0) invert(1)' : 'saturate(0.2)',
        animation: 'ls-float 12s ease-in-out infinite',
        zIndex: 0,
      }}/>

      {/* Decorative rings */}
      {[500, 340, 180].map(size => (
        <div key={size} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          border: `1px solid ${ringClr}`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 0,
        }}/>
      ))}

      {/* Back arrow — floating top-left */}
      {onBack && (
        <button onClick={onBack} className="ls-back"
          style={{
            position: 'fixed', top: '20px', left: '20px', zIndex: 100,
            width: '40px', height: '40px', borderRadius: '10px',
            border: `1px solid ${cardBorder}`,
            background: d ? 'rgba(17,32,56,0.8)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: textMuted,
          }}>
          <ArrowLeft size={18}/>
        </button>
      )}

      {/* Dark mode toggle — floating top-right */}
      {onToggleDark && (
        <button onClick={onToggleDark} className="ls-toggle"
          title={d ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 100,
            width: '40px', height: '40px', borderRadius: '10px',
            border: `1px solid ${cardBorder}`,
            background: d ? 'rgba(17,32,56,0.8)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: textMuted,
          }}>
          {d ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
      )}

      {/* Sign-in card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        background: cardBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: `1px solid ${cardBorder}`,
        boxShadow: d
          ? '0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset'
          : '0 8px 48px rgba(0,26,61,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
        padding: 'clamp(32px,5vw,48px)',
        animation: 'ls-up 0.5s ease both',
        transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/parliament-logo.png" alt="Parliament"
            style={{
              width: '56px', height: '56px', objectFit: 'contain',
              display: 'block', margin: '0 auto 16px',
              filter: d ? 'brightness(1.3) drop-shadow(0 0 6px rgba(0,150,255,0.4))' : 'none',
              transition: 'filter 0.4s',
            }}/>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: textHead, margin: '0 0 6px', letterSpacing: '-0.4px', transition: 'color 0.4s' }}>
            Sign in to SecureChat
          </h1>
          <p style={{ fontSize: '13px', color: textMuted, margin: 0, transition: 'color 0.4s' }}>
            House of Peoples' Representatives
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            background: d ? 'rgba(220,38,38,0.15)' : '#fef2f2',
            border: `1px solid ${d ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
            animation: 'ls-err 0.3s ease',
          }}>
            <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }}/>
            <p style={{ fontSize: '13px', color: d ? '#fca5a5' : '#dc2626', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', transition: 'color 0.4s' }}>
              Official Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color={textMuted} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              <input
                className="ls-input"
                name="email" type="email" value={formData.email}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="you@parliament.gov.et"
                style={{
                  padding: '12px 13px 12px 38px', fontSize: '14px',
                  border: `1.5px solid ${errors.email ? '#ef4444' : inputBdr}`,
                  borderRadius: '10px',
                  color: inputClr,
                  background: errors.email ? (d ? 'rgba(220,38,38,0.1)' : '#fef9f9') : inputBg,
                }}
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
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.4s' }}>
                Password
              </label>
              <button type="button" className="ls-forgot"
                onClick={() => setShowForgot(v => !v)}
                style={{ background: 'none', border: 'none', color: blue, fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, transition: 'color 0.18s' }}>
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color={textMuted} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              <input
                className="ls-input"
                name="password" type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange} onBlur={handleBlur}
                placeholder="Enter your password"
                style={{
                  padding: '12px 42px 12px 38px', fontSize: '14px',
                  border: `1.5px solid ${errors.password ? '#ef4444' : inputBdr}`,
                  borderRadius: '10px',
                  color: inputClr,
                  background: errors.password ? (d ? 'rgba(220,38,38,0.1)' : '#fef9f9') : inputBg,
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.18s' }}
                onMouseEnter={e => e.currentTarget.style.color = blue}
                onMouseLeave={e => e.currentTarget.style.color = textMuted}
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

          {/* Forgot password info box */}
          {showForgot && (
            <div style={{
              background: forgotBg, border: `1px solid ${forgotBdr}`,
              borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
              animation: 'ls-fade 0.25s ease',
            }}>
              <p style={{ fontSize: '12px', color: textMuted, margin: '0 0 4px', fontWeight: 700 }}>
                Password Reset
              </p>
              <p style={{ fontSize: '12px', color: textMuted, margin: 0, lineHeight: 1.6 }}>
                Contact your system administrator. They will generate a secure reset link and share it with you. The link expires in 24 hours and can only be used once.
              </p>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={busy} className="ls-submit"
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
              background: busy ? 'rgba(0,102,178,0.5)' : blue,
              color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: busy ? 'none' : '0 4px 20px rgba(0,102,178,0.35)',
              fontFamily: 'inherit', letterSpacing: '0.01em',
              marginTop: showForgot ? 0 : '20px',
            }}>
            {busy ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }}/>
                Establishing secure session...
              </>
            ) : (
              <><ShieldCheck size={16}/> Sign In Securely <ArrowRight size={15}/></>
            )}
          </button>
        </form>

        {/* Footer links */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: textMuted, marginTop: '20px', marginBottom: 0, transition: 'color 0.4s' }}>
          Need access?{' '}
          <button onClick={onGoToRegister} className="ls-req"
            style={{ background: 'none', border: 'none', color: blue, fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'color 0.18s' }}>
            Request Access
          </button>
        </p>

        {/* Security notice */}
        <div style={{
          marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px',
          padding: '10px 13px',
          background: noticeBg, border: `1px solid ${noticeBdr}`, borderRadius: '10px',
          transition: 'background 0.4s, border-color 0.4s',
        }}>
          <AlertCircle size={13} color={textMuted} style={{ flexShrink: 0, marginTop: '1px' }}/>
          <p style={{ fontSize: '11px', color: textMuted, margin: 0, lineHeight: 1.6, transition: 'color 0.4s' }}>
            Unauthorized access is a criminal offense under Ethiopian law. All sessions are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
