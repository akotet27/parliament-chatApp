import { useState } from 'react'
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle, XCircle, ArrowRight, ArrowLeft,
  AlertCircle, ShieldCheck, Sun, Moon
} from 'lucide-react'
import {
  validateField,
  validateRegisterForm,
  validatePassword
} from '../utils/validation'

function StrengthMeter({ password, dark }) {
  const result = validatePassword(password)
  if (!password) return null
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map(level => (
          <div key={level} style={{
            height: '4px', flex: 1, borderRadius: '99px',
            background: result.strength >= level ? result.strengthColor : (dark ? '#1e3a5a' : '#e2e8f0'),
            transition: 'background 0.3s',
          }}/>
        ))}
      </div>
      {result.strengthLabel && (
        <p style={{ fontSize: '12px', fontWeight: 600, color: result.strengthColor, margin: '0 0 6px' }}>
          {result.strengthLabel} password
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {result.rules.map(rule => (
          <div key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {rule.passed
              ? <CheckCircle size={13} color="#22c55e"/>
              : <XCircle size={13} color={dark ? '#2a4a6a' : '#cbd5e1'}/>
            }
            <span style={{ fontSize: '12px', color: rule.passed ? '#22c55e' : (dark ? '#4a7aaa' : '#94a3b8') }}>
              {rule.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RegisterScreen({ onRegister, onGoToLogin, loading, error, darkMode, onToggleDark }) {
  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const d = darkMode
  const blue   = '#0066b2'
  const blueLt = '#1a80cc'
  const navy   = '#001a3d'
  const pageBg = d
    ? 'linear-gradient(160deg, #0d1e35 0%, #102848 50%, #091628 100%)'
    : 'linear-gradient(160deg, #dceeff 0%, #eef5ff 50%, #e0eeff 100%)'
  const cardBg      = d ? 'rgba(17,32,56,0.92)' : 'rgba(255,255,255,0.92)'
  const cardBorder  = d ? 'rgba(0,102,178,0.25)' : 'rgba(0,102,178,0.12)'
  const headColor   = d ? '#e6f4ff' : navy
  const subColor    = d ? '#5b8ab8' : '#4a6580'
  const labelColor  = d ? '#5b8ab8' : '#64748b'
  const inputBg     = d ? 'rgba(255,255,255,0.06)' : '#fafcff'
  const inputBorder = d ? 'rgba(0,102,178,0.25)' : '#d4e5f7'
  const inputColor  = d ? '#e6f4ff' : navy

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const r = validateField(name, value, { ...formData, [name]: value })
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
    setTouched({ username: true, email: true, phone: true, password: true, confirmPassword: true })
    const { valid, errors: fe } = validateRegisterForm(formData)
    setErrors(fe)
    if (!valid) return
    setSubmitted(true)
    const result = await onRegister(formData)
    if (!result.success) setSubmitted(false)
  }

  const busy = loading || submitted

  // Shared input style factory
  const inp = (name) => ({
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: `1.5px solid ${errors[name] ? '#ef4444' : inputBorder}`,
    borderRadius: '10px',
    outline: 'none',
    color: inputColor,
    background: errors[name] ? (d ? 'rgba(239,68,68,0.08)' : '#fef9f9') : inputBg,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  })

  const ErrMsg = ({ field }) => errors[field] ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
      <AlertCircle size={12} color="#ef4444"/>
      <span style={{ fontSize: '12px', color: '#dc2626' }}>{errors[field]}</span>
    </div>
  ) : null

  return (
    <div style={{
      minHeight: '100vh',
      background: pageBg,
      fontFamily: "'Montserrat', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.4s',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes rs-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rs-float { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.02)} }

        .rs-inp:focus { border-color: ${blue} !important; box-shadow: 0 0 0 3px rgba(0,102,178,0.12) !important; }
        .rs-back { transition: all 0.2s; }
        .rs-back:hover { background: rgba(0,102,178,0.12) !important; color: ${blue} !important; }
        .rs-toggle { transition: all 0.2s; }
        .rs-toggle:hover { background: ${d ? 'rgba(255,255,255,0.15)' : 'rgba(0,102,178,0.12)'} !important; }
        .rs-submit { transition: all 0.2s; }
        .rs-submit:hover:not(:disabled) { background: ${blueLt} !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,102,178,0.4) !important; }
        .rs-link:hover { color: ${blueLt} !important; text-decoration: underline; }
      `}</style>

      {/* Large logo watermark — behind the card */}
      <img src="/parliament-logo.png" alt="" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(280px, 52vw, 680px)', height: 'auto',
        objectFit: 'contain', pointerEvents: 'none',
        opacity: d ? 0.06 : 0.07,
        filter: d ? 'brightness(1.4)' : 'saturate(0.2)',
        animation: 'rs-float 12s ease-in-out infinite',
        zIndex: 0,
      }}/>

      {/* Decorative rings */}
      {[460, 310, 160].map(size => (
        <div key={size} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          border: `1px solid rgba(0,102,178,${d ? 0.1 : 0.07})`,
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none', zIndex: 0,
        }}/>
      ))}

      {/* Back arrow — floating top-left */}
      <button onClick={onGoToLogin} className="rs-back"
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 200,
          width: '40px', height: '40px', borderRadius: '10px',
          border: `1px solid rgba(0,102,178,${d ? 0.3 : 0.2})`,
          background: d ? 'rgba(17,32,56,0.8)' : 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: subColor,
        }}>
        <ArrowLeft size={18}/>
      </button>

      {/* Dark/Light toggle — floating top-right */}
      <button onClick={onToggleDark} className="rs-toggle"
        title={d ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 200,
          width: '40px', height: '40px', borderRadius: '10px',
          border: `1px solid rgba(0,102,178,${d ? 0.3 : 0.2})`,
          background: d ? 'rgba(17,32,56,0.8)' : 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: subColor,
        }}>
        {d ? <Sun size={16}/> : <Moon size={16}/>}
      </button>

      {/* Scrollable form wrapper */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '70px 20px 40px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: '460px', animation: 'rs-up 0.5s ease both' }}>

          {/* Card */}
          <div style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: `1px solid ${cardBorder}`,
            boxShadow: `0 8px 48px ${d ? 'rgba(0,0,0,0.4)' : 'rgba(0,26,61,0.14)'}`,
            padding: 'clamp(28px,5vw,44px)',
          }}>

            {/* Card header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <img src="/parliament-logo.png" alt="Parliament"
                style={{ width: '52px', height: '52px', objectFit: 'contain', display: 'block', margin: '0 auto 14px', filter: d ? 'brightness(1.3)' : 'none' }}/>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: headColor, margin: '0 0 6px', letterSpacing: '-0.4px' }}>
                Request Access
              </h1>
              <p style={{ fontSize: '13px', color: subColor, margin: 0 }}>
                Create your Parliament SecureChat account
              </p>
            </div>

            {/* Admin approval notice */}
            <div style={{
              background: d ? 'rgba(0,102,178,0.12)' : '#dff0ff',
              border: `1px solid ${d ? 'rgba(0,102,178,0.3)' : '#99ccee'}`,
              borderRadius: '10px', padding: '12px 14px', marginBottom: '22px',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <AlertCircle size={15} color={blue} style={{ flexShrink: 0, marginTop: '1px' }}/>
              <p style={{ fontSize: '12px', color: d ? '#5b8ab8' : '#004b99', margin: 0, lineHeight: 1.6 }}>
                Your account requires admin approval before you can access parliament communications.
              </p>
            </div>

            {/* Server error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: d ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                border: `1px solid ${d ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
                borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
              }}>
                <XCircle size={16} color="#ef4444"/>
                <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
                  Full Name / Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={14} color={subColor} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input name="username" value={formData.username}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. Akotet_Shimelis"
                    className="rs-inp"
                    style={{ ...inp('username'), paddingLeft: '38px' }}
                  />
                </div>
                <ErrMsg field="username"/>
                {!errors.username && <p style={{ fontSize: '11px', color: subColor, margin: '4px 0 0' }}>2–20 characters, letters, numbers, underscores</p>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
                  Official Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} color={subColor} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input name="email" type="email" value={formData.email}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="you@parliament.gov.et"
                    className="rs-inp"
                    style={{ ...inp('email'), paddingLeft: '38px' }}
                  />
                </div>
                <ErrMsg field="email"/>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} color={subColor} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input name="phone" type="tel" value={formData.phone}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="+251 9XX XXX XXX"
                    className="rs-inp"
                    style={{ ...inp('phone'), paddingLeft: '38px' }}
                  />
                </div>
                <ErrMsg field="phone"/>
                {!errors.phone && <p style={{ fontSize: '11px', color: subColor, margin: '4px 0 0' }}>Include country code e.g. +251</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color={subColor} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input name="password" type={showPwd ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Create a strong password"
                    className="rs-inp"
                    style={{ ...inp('password'), paddingLeft: '38px', paddingRight: '42px' }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: subColor, display: 'flex', alignItems: 'center' }}>
                    {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                <ErrMsg field="password"/>
                {formData.password && <StrengthMeter password={formData.password} dark={d}/>}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '26px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color={subColor} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input name="confirmPassword" type={showCfm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Repeat your password"
                    className="rs-inp"
                    style={{ ...inp('confirmPassword'), paddingLeft: '38px', paddingRight: '42px' }}
                  />
                  <button type="button" onClick={() => setShowCfm(!showCfm)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: subColor, display: 'flex', alignItems: 'center' }}>
                    {showCfm ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                <ErrMsg field="confirmPassword"/>
              </div>

              {/* Submit */}
              <button type="submit" disabled={busy} className="rs-submit"
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
                  background: busy ? 'rgba(0,102,178,0.5)' : blue,
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: busy ? 'none' : '0 4px 20px rgba(0,102,178,0.35)',
                  fontFamily: 'inherit',
                }}>
                {busy ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                    Creating account...
                  </>
                ) : (
                  <><ShieldCheck size={16}/> Create Secure Account <ArrowRight size={15}/></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: subColor, marginTop: '18px', marginBottom: 0 }}>
              Already have an account?{' '}
              <button onClick={onGoToLogin} className="rs-link"
                style={{ background: 'none', border: 'none', color: blue, fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'color 0.18s' }}>
                Sign in
              </button>
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: d ? 'rgba(255,255,255,0.2)' : '#9ab0c8', marginTop: '16px' }}>
            End-to-end encrypted · Keys never leave your device
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterScreen
