import { useState } from 'react'
import {
  Mail, Lock, Eye, EyeOff,
  ArrowRight, XCircle, AlertCircle,
  ShieldCheck, KeyRound, Clock, Users
} from 'lucide-react'
import { validateLoginForm, validateField } from '../utils/validation'

function LoginScreen({ onLogin, onGoToRegister, loading, error }) {
  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [errors, setErrors]             = useState({})
  const [touched, setTouched]           = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const result = validateField(name, value, formData)
      setErrors(prev => ({ ...prev, [name]: result.valid ? '' : result.message }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const result = validateField(name, value, formData)
    setErrors(prev => ({ ...prev, [name]: result.valid ? '' : result.message }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const { valid, errors: formErrors } = validateLoginForm(formData)
    setErrors(formErrors)
    if (!valid) return
    setIsSubmitting(true)
    const result = await onLogin(formData.email, formData.password)
    if (!result.success) setIsSubmitting(false)
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── TOP NAV ── */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/parliament-logo.png"
            alt="Ethiopian Parliament"
            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
          />
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
          onClick={onGoToRegister}
          style={{
            background: '#1e3a5f',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Request Access
        </button>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 60%, #1d4ed8 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <img
          src="/parliament-logo.png"
          alt="Ethiopian Parliament"
          style={{
            width: '100px',
            height: '100px',
            objectFit: 'contain',
            marginBottom: '24px',
            filter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.2))',
          }}
        />
        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Secure. Private. Classified.
        </h1>
        <p style={{ fontSize: '18px', color: '#93c5fd', margin: '0 0 8px' }}>
          Parliament SecureChat
        </p>
        <p style={{ fontSize: '14px', color: '#bfdbfe', maxWidth: '480px', margin: '0 auto' }}>
          End-to-end encrypted communications for members of the
          House of Peoples' Representatives of the FDRE.
          Every message is encrypted before it leaves your device.
        </p>
      </section>

      {/* ── 3 FEATURE CARDS ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        maxWidth: '900px',
        margin: '-40px auto 0',
        padding: '0 24px',
        position: 'relative',
        zIndex: 10,
      }}>
        {[
          {
            icon: <ShieldCheck size={28} color="#1d4ed8"/>,
            title: 'ECDH Encryption',
            desc: 'Your encryption keys are generated on your device and never leave it. Even server administrators cannot read your messages.',
          },
          {
            icon: <Clock size={28} color="#1d4ed8"/>,
            title: '2-Minute Timeout',
            desc: 'Sessions automatically terminate after 2 minutes of inactivity. All keys are cleared from memory on logout.',
          },
          {
            icon: <Users size={28} color="#1d4ed8"/>,
            title: 'Admin Verified',
            desc: 'Every account requires approval from a parliament administrator before gaining access to secure communications.',
          },
        ].map((f, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '52px', height: '52px',
              background: '#eff6ff',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2444', margin: '0 0 8px' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── LOGIN FORM ── */}
      <section style={{
        maxWidth: '440px',
        margin: '48px auto',
        padding: '0 24px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <KeyRound size={20} color="#1d4ed8"/>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2444', margin: 0 }}>
              Secure Sign In
            </h2>
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

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: '#64748b', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '6px'
              }}>
                Official Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}/>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@parliament.gov.et"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    fontSize: '14px',
                    border: `1px solid ${errors.email ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    outline: 'none',
                    color: '#0f2444',
                    background: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlurCapture={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0'}
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
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: '#64748b', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}/>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    fontSize: '14px',
                    border: `1px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    outline: 'none',
                    color: '#0f2444',
                    background: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlurCapture={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: 0,
                  }}
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
            <button
              type="submit"
              disabled={loading || isSubmitting}
              style={{
                width: '100%',
                padding: '13px',
                background: loading || isSubmitting ? '#93c5fd' : '#1d4ed8',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
            >
              {loading || isSubmitting ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}/>
                  Establishing secure session...
                </>
              ) : (
                <>
                  <ShieldCheck size={16}/>
                  Sign In Securely
                  <ArrowRight size={16}/>
                </>
              )}
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '16px' }}>
            Need access?{' '}
            <button
              onClick={onGoToRegister}
              style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
            >
              Request account
            </button>
          </p>
        </div>

        {/* Warning */}
        <div style={{
          marginTop: '16px',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            ⚠️ Unauthorized access is a criminal offense under Ethiopian law.
            All sessions are monitored and logged.
            Session auto-terminates after 2 minutes of inactivity.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section style={{
        background: '#fff',
        padding: '64px 24px',
        borderTop: '1px solid #e2e8f0',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f2444', margin: '0 0 12px' }}>
            Only parliament members can access your messages.
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '560px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            Parliament SecureChat uses ECDH key exchange — the same technology
            used by Signal and WhatsApp. Your private key never leaves your device.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              {
                step: '01',
                title: 'Your key pair is generated',
                desc: 'When you log in, your browser generates a unique public/private key pair. Your private key never leaves your device.',
              },
              {
                step: '02',
                title: 'Keys are exchanged securely',
                desc: 'Your public key is shared. Each conversation derives a unique shared secret using ECDH — without sending the secret itself.',
              },
              {
                step: '03',
                title: 'Messages encrypted locally',
                desc: 'Every message is encrypted on your device before being sent. The server stores only unreadable ciphertext.',
              },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '32px', fontWeight: 900,
                  color: '#dbeafe', marginBottom: '12px',
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2444', margin: '0 0 8px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#0f2444',
        color: '#94a3b8',
        padding: '32px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/parliament-logo.png"
            alt="Parliament"
            style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.8 }}
          />
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
              House of Peoples' Representatives · FDRE
            </p>
            <p style={{ margin: 0, fontSize: '11px' }}>
              SecureChat — Classified Communications Portal
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '12px' }}>
          🔐 End-to-end encrypted · ECDH key exchange · AES-GCM messages
        </p>
      </footer>

    </div>
  )
}

export default LoginScreen