import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight, XCircle, ArrowLeft } from 'lucide-react'
import { validateLoginForm, validateField } from '../utils/validation'

const C = { navy: '#001a3d', blue: '#0066b2', blueLt: '#1a80cc', muted: '#4a6580', border: '#d4e5f7' }

function LoginScreen({ onLogin, onGoToRegister, onBack, loading, error }) {
  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [errors, setErrors]             = useState({})
  const [touched, setTouched]           = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      background: 'linear-gradient(160deg, #dceeff 0%, #eef5ff 50%, #e0eeff 100%)',
      fontFamily: "'Montserrat', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '20px',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes ls-up   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ls-err  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ls-float { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.025)} }

        .ls-input {
          width: 100%; outline: none; font-family: inherit;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .ls-input:focus {
          border-color: ${C.blue} !important;
          box-shadow: 0 0 0 3px rgba(0,102,178,0.12) !important;
        }
        .ls-submit { transition: all 0.2s; }
        .ls-submit:hover:not(:disabled) { background: ${C.blueLt} !important; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,102,178,0.4) !important; }
        .ls-submit:active:not(:disabled) { transform: translateY(0); }
        .ls-back { transition: all 0.2s; }
        .ls-back:hover { background: rgba(0,102,178,0.1) !important; color: ${C.blue} !important; }
        .ls-req:hover { text-decoration: underline; color: ${C.blueLt} !important; }
      `}</style>

      {/* Parliament logo — large background watermark */}
      <img src="/parliament-logo.png" alt="" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(300px, 55vw, 700px)', height: 'auto',
        objectFit: 'contain', pointerEvents: 'none',
        opacity: 0.07,
        filter: 'saturate(0.2)',
        animation: 'ls-float 12s ease-in-out infinite',
        zIndex: 0,
      }}/>

      {/* Decorative circles */}
      {[500, 340, 180].map(size => (
        <div key={size} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          border: '1px solid rgba(0,102,178,0.08)',
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
            border: '1px solid rgba(0,102,178,0.2)',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.muted,
          }}>
          <ArrowLeft size={18}/>
        </button>
      )}

      {/* Sign-in card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(0,102,178,0.12)',
        boxShadow: '0 8px 48px rgba(0,26,61,0.14), 0 1px 0 rgba(255,255,255,0.8) inset',
        padding: 'clamp(32px,5vw,48px)',
        animation: 'ls-up 0.5s ease both',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/parliament-logo.png" alt="Parliament"
            style={{ width: '56px', height: '56px', objectFit: 'contain', display: 'block', margin: '0 auto 16px' }}/>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: C.navy, margin: '0 0 6px', letterSpacing: '-0.4px' }}>
            Sign in to SecureChat
          </h1>
          <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>
            House of Peoples' Representatives
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
            animation: 'ls-err 0.3s ease',
          }}>
            <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }}/>
            <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Official Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color={C.muted} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              <input
                className="ls-input"
                name="email" type="email" value={formData.email}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="you@parliament.gov.et"
                style={{
                  padding: '12px 13px 12px 38px', fontSize: '14px',
                  border: `1.5px solid ${errors.email ? '#ef4444' : C.border}`,
                  borderRadius: '10px', color: C.navy, background: errors.email ? '#fef9f9' : 'rgba(255,255,255,0.8)',
                }}
              />
            </div>
            {errors.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                <AlertCircle size={12} color="#ef4444"/>
                <span style={{ fontSize: '12px', color: '#dc2626' }}>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color={C.muted} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              <input
                className="ls-input"
                name="password" type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange} onBlur={handleBlur}
                placeholder="Enter your password"
                style={{
                  padding: '12px 42px 12px 38px', fontSize: '14px',
                  border: `1.5px solid ${errors.password ? '#ef4444' : C.border}`,
                  borderRadius: '10px', color: C.navy, background: errors.password ? '#fef9f9' : 'rgba(255,255,255,0.8)',
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.18s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.blue}
                onMouseLeave={e => e.currentTarget.style.color = C.muted}
              >
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {errors.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                <AlertCircle size={12} color="#ef4444"/>
                <span style={{ fontSize: '12px', color: '#dc2626' }}>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={busy} className="ls-submit"
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
              background: busy ? 'rgba(0,102,178,0.5)' : C.blue,
              color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: busy ? 'none' : '0 4px 20px rgba(0,102,178,0.35)',
              fontFamily: 'inherit', letterSpacing: '0.01em',
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
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.muted, marginTop: '20px', marginBottom: 0 }}>
          Need access?{' '}
          <button onClick={onGoToRegister} className="ls-req"
            style={{ background: 'none', border: 'none', color: C.blue, fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'color 0.18s' }}>
            Request Access
          </button>
        </p>

        {/* Security notice */}
        <div style={{
          marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px',
          padding: '10px 13px',
          background: 'rgba(0,102,178,0.05)', border: '1px solid rgba(0,102,178,0.1)', borderRadius: '10px',
        }}>
          <AlertCircle size={13} color={C.muted} style={{ flexShrink: 0, marginTop: '1px' }}/>
          <p style={{ fontSize: '11px', color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Unauthorized access is a criminal offense under Ethiopian law. All sessions are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
