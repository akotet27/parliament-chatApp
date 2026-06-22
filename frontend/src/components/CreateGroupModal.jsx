import { useState } from 'react'
import { X, Users, Hash } from 'lucide-react'

function CreateGroupModal({ allMembers, currentUser, darkMode, onClose, onCreate }) {
  const [name, setName]               = useState('')
  const [selected, setSelected]       = useState(new Set())
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const d          = darkMode
  const bg         = d ? '#1e293b' : '#ffffff'
  const border     = d ? '#334155' : '#e2e8f0'
  const textPrim   = d ? '#f1f5f9' : '#0f2444'
  const textMuted  = d ? '#94a3b8' : '#64748b'
  const inputBg    = d ? '#0f172a' : '#f8fafc'
  const inputColor = d ? '#f1f5f9' : '#0f2444'

  const otherMembers = allMembers.filter(m => m.username !== currentUser.username)

  const toggle = (username) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(username) ? next.delete(username) : next.add(username)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Group name is required'); return }
    setLoading(true)
    setError('')
    try {
      await onCreate(name.trim(), [...selected])
      onClose()
    } catch (e) {
      setError(e.message || 'Failed to create group')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: bg, borderRadius: '20px', width: '100%', maxWidth: '420px',
        margin: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        border: `1px solid ${border}`, overflow: 'hidden',
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0066b2, #1a80cc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#fff"/>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: textPrim }}>New Group</p>
              <p style={{ margin: 0, fontSize: '11px', color: textMuted }}>Create a group channel</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted }}>
            <X size={16}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Name input */}
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
            Group Name
          </label>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Hash size={14} color={d ? '#475569' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Budget Committee"
              autoFocus
              style={{
                width: '100%', padding: '11px 12px 11px 34px', fontSize: '14px',
                border: `1.5px solid ${error ? '#ef4444' : border}`, borderRadius: '10px',
                color: inputColor, background: inputBg, outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#0066b2'}
              onBlur={e => e.target.style.borderColor = error ? '#ef4444' : border}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Member list */}
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
            Add Members ({selected.size} selected)
          </label>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: `1px solid ${border}`, borderRadius: '10px' }}>
            {otherMembers.length === 0 ? (
              <p style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: textMuted, margin: 0 }}>No other members available</p>
            ) : (
              otherMembers.map((m, i) => (
                <label key={m.username} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', cursor: 'pointer',
                  borderBottom: i < otherMembers.length - 1 ? `1px solid ${border}` : 'none',
                  background: selected.has(m.username) ? (d ? 'rgba(0,102,178,0.2)' : '#dff0ff') : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <input
                    type="checkbox"
                    checked={selected.has(m.username)}
                    onChange={() => toggle(m.username)}
                    style={{ width: '16px', height: '16px', accentColor: '#0066b2', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: d ? '#334155' : '#dff0ff', color: '#0066b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                    {m.username[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: textPrim }}>{m.username}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: textMuted, textTransform: 'capitalize' }}>{m.role}</span>
                </label>
              ))
            )}
          </div>

          {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: '10px 0 0' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px 20px', display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            style={{
              flex: 2, padding: '11px', borderRadius: '10px', border: 'none',
              background: name.trim() && !loading ? 'linear-gradient(135deg, #0066b2, #1a80cc)' : (d ? '#334155' : '#e2e8f0'),
              color: name.trim() && !loading ? '#fff' : textMuted,
              fontSize: '13px', fontWeight: 700, cursor: name.trim() && !loading ? 'pointer' : 'not-allowed',
              boxShadow: name.trim() && !loading ? '0 4px 14px rgba(0,102,178,0.3)' : 'none',
            }}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal
