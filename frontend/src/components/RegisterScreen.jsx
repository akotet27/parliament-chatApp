import { useState } from 'react'
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle, XCircle, ArrowRight,
  AlertCircle, ShieldCheck
} from 'lucide-react'
import {
  validateField,
  validateRegisterForm,
  validatePassword
} from '../utils/validation'

function StrengthMeter({ password }) {
  const result = validatePassword(password)
  if (!password) return null
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map(level => (
          <div key={level} style={{
            height: '4px', flex: 1, borderRadius: '99px',
            background: result.strength >= level ? result.strengthColor : '#e2e8f0',
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
              : <XCircle size={13} color="#cbd5e1"/>
            }
            <span style={{ fontSize: '12px', color: rule.passed ? '#22c55e' : '#94a3b8' }}>
              {rule.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, onBlur, error, placeholder, hint, rightEl }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 700,
        color: '#64748b', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '6px'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: '100%',
            padding: rightEl ? '11px 40px 11px 14px' : '11px 14px',
            fontSize: '14px',
            border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
            borderRadius: '10px',
            outline: 'none',
            color: '#0f2444',
            background: '#f8fafc',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#1d4ed8'}
          onBlurCapture={e => e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0'}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {rightEl}
          </div>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <AlertCircle size={12} color="#ef4444"/>
          <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>
        </div>
      )}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>{hint}</p>
      )}
    </div>
  )
}

function RegisterScreen({ onRegister, onGoToLogin, loading, error }) {
  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 48px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/parliament-logo.png" alt="Ethiopian Parliament"
            style={{ width: '48px', height: '48px', objectFit: 'contain' }}/>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
              የኢ.ፌ.ዴ.ሪ የሕዝብ ተወካዮች ምክር ቤት
            </p>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              House of Peoples' Representatives · SecureChat
            </p>
          </div>
        </div>
        <button
          onClick={onGoToLogin}
          style={{
            background: 'transparent', color: '#1d4ed8',
            border: '1px solid #1d4ed8', borderRadius: '8px',
            padding: '8px 18px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 60%, #1d4ed8 100%)',
        padding: '60px 24px', textAlign: 'center', color: '#fff',
      }}>
        <img src="/parliament-logo.png" alt="Parliament"
          style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '20px',
            filter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.2))' }}/>
        <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '0 0 8px' }}>
          Request Access
        </h1>
        <p style={{ fontSize: '14px', color: '#bfdbfe', maxWidth: '420px', margin: '0 auto' }}>
          Create your Parliament SecureChat account.
          Admin approval required before access is granted.
        </p>
      </section>

      {/* Form */}
      <section style={{ maxWidth: '480px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '36px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
        }}>

          {/* Notice */}
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '10px', padding: '12px 14px', marginBottom: '24px',
            display: 'flex', alignItems: 'flex-start', gap: '8px',
          }}>
            <AlertCircle size={16} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '1px' }}/>
            <p style={{ fontSize: '12px', color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
              Your account requires admin approval before you can access
              parliament communications.
            </p>
          </div>

          {/* Server error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
            }}>
              <XCircle size={16} color="#ef4444"/>
              <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field
              label="Full Name / Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username}
              placeholder="e.g. Akotet_Shimelis"
              hint="2-20 characters, letters, numbers, underscores only"
            />
            <Field
              label="Official Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              placeholder="you@parliament.gov.et"
            />
            <Field
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              placeholder="+251 9XX XXX XXX"
              hint="Include country code e.g. +251"
            />

            {/* Password with strength */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: '#64748b', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a strong password"
                  autoComplete="off"
                  style={{
                    width: '100%', padding: '11px 40px 11px 14px',
                    fontSize: '14px',
                    border: `1px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '10px', outline: 'none',
                    color: '#0f2444', background: '#f8fafc', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlurCapture={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <AlertCircle size={12} color="#ef4444"/>
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{errors.password}</p>
                </div>
              )}
              {formData.password && <StrengthMeter password={formData.password}/>}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: '#64748b', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '6px'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="confirmPassword"
                  type={showCfm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Repeat your password"
                  autoComplete="off"
                  style={{
                    width: '100%', padding: '11px 40px 11px 14px',
                    fontSize: '14px',
                    border: `1px solid ${errors.confirmPassword ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '10px', outline: 'none',
                    color: '#0f2444', background: '#f8fafc', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlurCapture={e => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowCfm(!showCfm)}
                  style={{ position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showCfm ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.confirmPassword && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <AlertCircle size={12} color="#ef4444"/>
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{errors.confirmPassword}</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || submitted}
              style={{
                width: '100%', padding: '13px',
                background: loading || submitted ? '#93c5fd' : '#1d4ed8',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700,
                cursor: loading || submitted ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
              }}
            >
              {loading || submitted ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}/>
                  Creating account...
                </>
              ) : (
                <>
                  <ShieldCheck size={16}/>
                  Create Secure Account
                  <ArrowRight size={16}/>
                </>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '16px' }}>
            Already have an account?{' '}
            <button onClick={onGoToLogin}
              style={{ background: 'none', border: 'none', color: '#1d4ed8',
                fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              Sign in
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '16px' }}>
          🔐 End-to-end encrypted · Keys never leave your device
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0f2444', color: '#94a3b8',
        padding: '24px 48px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/parliament-logo.png" alt="Parliament"
            style={{ width: '32px', height: '32px', objectFit: 'contain', opacity: 0.8 }}/>
          <p style={{ margin: 0, fontSize: '12px', color: '#e2e8f0' }}>
            House of Peoples' Representatives · FDRE
          </p>
        </div>
        <p style={{ margin: 0, fontSize: '12px' }}>
          🔐 ECDH encrypted · AES-GCM messages
        </p>
      </footer>
    </div>
  )
}

export default RegisterScreen