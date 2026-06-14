import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send, Shield, LogOut, Lock, Hash,
  ArrowLeft, Clock, AlertTriangle, Moon, Sun,
  Edit2, Trash2, Check, X, ChevronLeft, ChevronRight,
  MessageSquare, Menu
} from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useInactivity } from '../hooks/useInactivity'
import InactivityWarning from './InactivityWarning'

// ── Message Bubble ─────────────────────────────────────
function MessageBubble({ msg, isOwn, darkMode, onDelete, onEdit }) {
  const [hovered,   setHovered]   = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [editText,  setEditText]  = useState(msg.text)
  const [showDel,   setShowDel]   = useState(false)

  const d           = darkMode
  const ownBg       = 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
  const otherBg     = d ? '#334155' : '#f1f5f9'
  const otherColor  = d ? '#f1f5f9' : '#0f2444'

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== msg.text) {
      onEdit(msg.id, editText.trim())
    }
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit() }
    if (e.key === 'Escape') { setEditing(false); setEditText(msg.text) }
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', marginBottom: '16px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowDel(false) }}
    >
      {!isOwn && (
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px', marginLeft: '36px' }}>
          {msg.from}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isOwn ? 'row-reverse' : 'row', maxWidth: '75%' }}>
        {/* Avatar */}
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isOwn ? '#1d4ed8' : (d ? '#475569' : '#e2e8f0'), color: isOwn ? '#fff' : (d ? '#f1f5f9' : '#0f2444'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
          {msg.from?.[0]?.toUpperCase()}
        </div>

        <div style={{ position: 'relative' }}>
          {/* Action buttons on hover */}
          {hovered && isOwn && !editing && (
            <div style={{ position: 'absolute', top: '-32px', right: 0, display: 'flex', gap: '4px', zIndex: 10 }}>
              <button
                onClick={() => { setEditing(true); setEditText(msg.text) }}
                title="Edit message"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${d ? '#475569' : '#e2e8f0'}`, background: d ? '#1e293b' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseLeave={e => e.currentTarget.style.background = d ? '#1e293b' : '#fff'}
              >
                <Edit2 size={13}/>
              </button>
              <button
                onClick={() => setShowDel(true)}
                title="Delete message"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${d ? '#475569' : '#e2e8f0'}`, background: d ? '#1e293b' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = d ? '#1e293b' : '#fff'}
              >
                <Trash2 size={13}/>
              </button>
            </div>
          )}

          {/* Delete confirmation */}
          {showDel && (
            <div style={{ position: 'absolute', top: '-44px', right: 0, zIndex: 20, background: d ? '#1e293b' : '#fff', border: `1px solid ${d ? '#475569' : '#e2e8f0'}`, borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '12px', color: d ? '#f1f5f9' : '#0f2444' }}>Delete?</span>
              <button onClick={() => { onDelete(msg.id); setShowDel(false) }}
                style={{ padding: '3px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Yes
              </button>
              <button onClick={() => setShowDel(false)}
                style={{ padding: '3px 10px', background: d ? '#334155' : '#f1f5f9', color: d ? '#f1f5f9' : '#374151', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                No
              </button>
            </div>
          )}

          {/* Message bubble */}
          {editing ? (
            <div style={{ minWidth: '200px' }}>
              <textarea
                autoFocus
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '2px solid #1d4ed8', borderRadius: '12px', outline: 'none', resize: 'none', background: d ? '#0f172a' : '#fff', color: d ? '#f1f5f9' : '#0f2444', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: '60px' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveEdit}
                  style={{ padding: '4px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12}/> Save
                </button>
                <button onClick={() => { setEditing(false); setEditText(msg.text) }}
                  style={{ padding: '4px 12px', background: d ? '#334155' : '#f1f5f9', color: d ? '#f1f5f9' : '#374151', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <X size={12}/> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '10px 16px', borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isOwn ? ownBg : otherBg, color: isOwn ? '#fff' : otherColor, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.15s', transform: hovered ? 'scale(1.01)' : 'scale(1)' }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {msg.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                {msg.edited && <span style={{ fontSize: '10px', opacity: 0.6, fontStyle: 'italic' }}>edited</span>}
                <Lock size={10} style={{ opacity: 0.5 }}/>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>{msg.timestamp}</span>
                {isOwn && <span style={{ fontSize: '11px', opacity: 0.6 }}>✓✓</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Typing Indicator ───────────────────────────────────
function TypingIndicator({ name, darkMode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0 8px' }}>
      <div style={{ background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '12px', padding: '8px 12px', display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 150, 300].map(delay => (
          <div key={delay} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8', animation: 'bounce 1s infinite', animationDelay: `${delay}ms` }}/>
        ))}
      </div>
      <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>{name} is typing...</span>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  )
}

// ── Main ChatRoom ──────────────────────────────────────
function ChatRoom({ user, onLogout, fetchPublicKey, darkMode, onToggleDark }) {
  const [activeRoom,    setActiveRoom]    = useState('general')
  const [input,         setInput]         = useState('')
  const [sidebarOpen,   setSidebarOpen]   = useState(true)
  const [localMessages, setLocalMessages] = useState({})

  const messagesEndRef = useRef(null)
  const typingTimeout  = useRef(null)
  const isTypingRef    = useRef(false)
  const inputRef       = useRef(null)

  const {
    connected, onlineUsers, groupMessages,
    privateMessages, typingUsers, unreadCounts,
    sendGroupMessage, sendPrivateMessage,
    sendTyping, sendStopTyping,
    fetchPrivateHistory, clearUnread,
  } = useWebSocket(user, fetchPublicKey)

  const { timeLeft, showWarning, resetTimer, forceLogout } = useInactivity(
    () => onLogout('inactivity'), true
  )

  // Colors
  const d           = darkMode
  const bg          = d ? '#0f172a' : '#f8fafc'
  const sidebarBg   = d ? '#1e293b' : '#ffffff'
  const headerBg    = d ? '#1e293b' : '#ffffff'
  const msgAreaBg   = d ? '#0f172a' : '#f8fafc'
  const inputAreaBg = d ? '#1e293b' : '#ffffff'
  const border      = d ? '#334155' : '#e2e8f0'
  const textPrimary = d ? '#f1f5f9' : '#0f2444'
  const textMuted   = d ? '#94a3b8' : '#64748b'
  const inputBg     = d ? '#0f172a' : '#f8fafc'
  const inputColor  = d ? '#f1f5f9' : '#0f2444'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages, privateMessages, localMessages, activeRoom])

  useEffect(() => {
    const isDM = activeRoom !== 'general'
    if (isDM) { fetchPrivateHistory(activeRoom); clearUnread(activeRoom) }
  }, [activeRoom])

  const isDM = activeRoom !== 'general'

  // Merge server messages with local edits/deletes
  const getRawMessages = () => {
    if (isDM) return privateMessages[activeRoom] || []
    return groupMessages
  }

  const currentMessages = getRawMessages().map(msg => {
    const local = localMessages[msg.id]
    if (!local) return msg
    if (local.deleted) return null
    return { ...msg, text: local.text, edited: true }
  }).filter(Boolean)

  const whoIsTyping = typingUsers[activeRoom]
  const allUsers    = [...new Set([...onlineUsers, user.username])]
  const otherUsers  = onlineUsers.filter(u => u !== user.username)

  const handleSend = async () => {
    if (!input.trim()) return
    if (isDM) await sendPrivateMessage(activeRoom, input)
    else await sendGroupMessage(input)
    setInput('')
    sendStopTyping(activeRoom)
    isTypingRef.current = false
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!isTypingRef.current) { isTypingRef.current = true; sendTyping(activeRoom) }
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false; sendStopTyping(activeRoom)
    }, 2000)
  }

  // Edit message locally
  const handleEdit = (msgId, newText) => {
    setLocalMessages(prev => ({ ...prev, [msgId]: { text: newText } }))
  }

  // Delete message locally
  const handleDelete = (msgId) => {
    setLocalMessages(prev => ({ ...prev, [msgId]: { deleted: true } }))
  }

  // Chat with yourself
  const handleSelfChat = () => {
    setActiveRoom(user.username)
  }

  const warningColor = showWarning ? '#dc2626' : '#1d4ed8'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: bg, transition: 'background 0.3s' }}>

      <style>{`
        @keyframes slideIn { from{transform:translateX(-100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeMsg { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .room-btn:hover { background: ${d ? '#334155' : '#f1f5f9'} !important; }
        .send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
        .sidebar-toggle:hover { background: ${d ? '#334155' : '#f1f5f9'} !important; }
      `}</style>

      {showWarning && (
        <InactivityWarning
          timeLeft={timeLeft}
          onStayLoggedIn={resetTimer}
          onLogoutNow={() => onLogout('manual')}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? '260px' : '0px',
        minWidth: sidebarOpen ? '260px' : '0px',
        overflow: 'hidden',
        background: sidebarBg,
        borderRight: `1px solid ${border}`,
        display: 'flex', flexDirection: 'column', height: '100%',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {/* Logo header */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <img src="/parliament-logo.png" alt="Parliament"
              style={{ width: '36px', height: '36px', objectFit: 'contain', transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.15) rotate(5deg)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
            <div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: textPrimary, margin: 0 }}>Parliament</p>
              <p style={{ fontSize: '11px', color: textMuted, margin: 0 }}>SecureChat</p>
            </div>
          </div>

          {/* User card */}
          <div style={{ background: d ? '#0f172a' : '#f8fafc', borderRadius: '10px', padding: '10px 12px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</p>
              <p style={{ fontSize: '11px', color: textMuted, margin: 0, textTransform: 'capitalize' }}>{user.role}</p>
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}/>
          </div>
        </div>

        {/* Session timer */}
        <div style={{ margin: '10px 12px', borderRadius: '10px', padding: '10px 14px', background: showWarning ? (d ? '#450a0a' : '#fef2f2') : (d ? '#0f172a' : '#f8fafc'), border: `1px solid ${showWarning ? '#fecaca' : border}`, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Clock size={15} color={warningColor}/>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: textMuted, margin: 0 }}>Session timeout</p>
            <p style={{ fontSize: '16px', fontWeight: 800, color: warningColor, margin: 0, fontFamily: 'monospace' }}>{timeLeft}</p>
          </div>
          {showWarning && <AlertTriangle size={16} color="#dc2626"/>}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>

          {/* Channels */}
          <p style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '10px 0 6px 4px' }}>Channels</p>
          <button
            className="room-btn"
            onClick={() => setActiveRoom('general')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeRoom === 'general' ? (d ? '#1e3a5f' : '#eff6ff') : 'transparent', color: activeRoom === 'general' ? '#1d4ed8' : textMuted, fontSize: '13px', fontWeight: 600, textAlign: 'left', borderLeft: activeRoom === 'general' ? '3px solid #1d4ed8' : '3px solid transparent', transition: 'all 0.15s' }}
          >
            <Hash size={15}/> general
          </button>

          {/* Chat with yourself */}
          <p style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px 4px' }}>Notes to self</p>
          <button
            className="room-btn"
            onClick={handleSelfChat}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeRoom === user.username ? (d ? '#1e3a5f' : '#eff6ff') : 'transparent', color: activeRoom === user.username ? '#1d4ed8' : textMuted, fontSize: '13px', fontWeight: 600, textAlign: 'left', borderLeft: activeRoom === user.username ? '3px solid #1d4ed8' : '3px solid transparent', transition: 'all 0.15s' }}
          >
            <MessageSquare size={15}/> My Notes
            <span style={{ marginLeft: 'auto', fontSize: '10px', background: d ? '#334155' : '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: textMuted }}>You</span>
          </button>

          {/* Members / DMs */}
          <p style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px 4px' }}>
            Members ({onlineUsers.length} online)
          </p>
          {otherUsers.length === 0 ? (
            <p style={{ fontSize: '12px', color: textMuted, padding: '4px 12px' }}>No other members online</p>
          ) : otherUsers.map(uid => (
            <button key={uid} className="room-btn"
              onClick={() => { setActiveRoom(uid); clearUnread(uid) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeRoom === uid ? (d ? '#1e3a5f' : '#eff6ff') : 'transparent', borderLeft: activeRoom === uid ? '3px solid #1d4ed8' : '3px solid transparent', marginBottom: '2px', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: d ? '#334155' : '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                  {uid[0]?.toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', border: '2px solid ' + sidebarBg }}/>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: activeRoom === uid ? '#1d4ed8' : textMuted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uid}</span>
              {unreadCounts[uid] > 0 && (
                <span style={{ background: '#1d4ed8', color: '#fff', fontSize: '11px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {unreadCounts[uid]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom controls */}
        <div style={{ padding: '12px', borderTop: `1px solid ${border}`, flexShrink: 0 }}>
          {/* Dark mode */}
          <button onClick={onToggleDark}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = d ? '#334155' : '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {darkMode ? <Sun size={15}/> : <Moon size={15}/>}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>

          {/* E2E badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: d ? '#1e3a5f' : '#eff6ff', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px' }}>
            <Lock size={13} color="#1d4ed8"/>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>E2E Encrypted</span>
          </div>

          {/* Sign out */}
          <button onClick={() => onLogout('manual')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: d ? '#450a0a' : '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.transform = 'scale(1.01)' }}
            onMouseLeave={e => { e.currentTarget.style.background = d ? '#450a0a' : '#fef2f2'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{ background: headerBg, borderBottom: `1px solid ${border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0, transition: 'background 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Sidebar toggle button */}
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, transition: 'all 0.2s', flexShrink: 0 }}
            >
              {sidebarOpen ? <ChevronLeft size={18}/> : <Menu size={18}/>}
            </button>

            {isDM && activeRoom !== user.username && (
              <button onClick={() => setActiveRoom('general')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', padding: 0, display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ArrowLeft size={20}/>
              </button>
            )}

            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activeRoom === user.username ? '#f0fdf4' : '#eff6ff', color: activeRoom === user.username ? '#16a34a' : '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
              {activeRoom === 'general' ? '#' : activeRoom[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: textPrimary, margin: 0 }}>
                {activeRoom === 'general' ? '# general'
                  : activeRoom === user.username ? '📝 My Notes'
                  : activeRoom}
              </p>
              <p style={{ fontSize: '12px', color: textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={11}/>
                {activeRoom === 'general' ? 'Parliament general channel'
                  : activeRoom === user.username ? 'Private notes — only you can see this'
                  : 'End-to-end encrypted DM'}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={onToggleDark}
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = d ? '#334155' : '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {darkMode ? <Sun size={15}/> : <Moon size={15}/>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: connected ? (d ? '#052e16' : '#f0fdf4') : (d ? '#450a0a' : '#fef2f2'), border: `1px solid ${connected ? '#bbf7d0' : '#fecaca'}`, borderRadius: '99px', padding: '6px 14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#16a34a' : '#dc2626' }}/>
              <Shield size={14} color={connected ? '#16a34a' : '#dc2626'}/>
              <span style={{ fontSize: '12px', fontWeight: 600, color: connected ? '#16a34a' : '#dc2626' }}>
                {connected ? 'Secure' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: msgAreaBg, transition: 'background 0.3s' }}>
          {currentMessages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: d ? '#1e293b' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {activeRoom === user.username
                  ? <span style={{ fontSize: '28px' }}>📝</span>
                  : <Lock size={28} color="#1d4ed8"/>
                }
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>
                {activeRoom === 'general' ? 'Welcome to Parliament SecureChat'
                  : activeRoom === user.username ? 'Your private notes'
                  : `Start a secure conversation with ${activeRoom}`}
              </p>
              <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 4px' }}>
                {activeRoom === user.username
                  ? '✏️ Write notes, save links, keep reminders — only visible to you'
                  : '🔐 Messages are end-to-end encrypted'}
              </p>
              {activeRoom !== user.username && (
                <p style={{ fontSize: '12px', color: d ? '#475569' : '#94a3b8', margin: 0 }}>
                  Not even server administrators can read these messages
                </p>
              )}
            </div>
          )}

          {currentMessages.map((msg, i) => (
            <div key={msg.id || i} style={{ animation: 'fadeMsg 0.3s ease' }}>
              <MessageBubble
                msg={msg}
                isOwn={msg.from === user.username}
                darkMode={darkMode}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          ))}

          {whoIsTyping && <TypingIndicator name={whoIsTyping} darkMode={darkMode}/>}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input area */}
        <div style={{ background: inputAreaBg, borderTop: `1px solid ${border}`, padding: '16px 20px', flexShrink: 0, transition: 'background 0.3s' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                placeholder={
                  activeRoom === user.username ? 'Write a note to yourself...'
                  : isDM ? `Encrypted message to ${activeRoom}...`
                  : 'Encrypted message to #general...'
                }
                rows={1}
                style={{ width: '100%', padding: '12px 40px 12px 16px', fontSize: '14px', border: `1px solid ${border}`, borderRadius: '12px', outline: 'none', resize: 'none', color: inputColor, background: inputBg, boxSizing: 'border-box', minHeight: '46px', maxHeight: '120px', fontFamily: 'inherit', lineHeight: 1.5, transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.1)' }}
                onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
              <Lock size={14} color={d ? '#475569' : '#cbd5e1'} style={{ position: 'absolute', right: '12px', bottom: '14px', pointerEvents: 'none' }}/>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="send-btn"
              style={{ width: '46px', height: '46px', borderRadius: '12px', border: 'none', background: input.trim() && connected ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)' : (d ? '#334155' : '#e2e8f0'), color: input.trim() && connected ? '#fff' : (d ? '#64748b' : '#94a3b8'), cursor: input.trim() && connected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: input.trim() && connected ? '0 4px 12px rgba(29,78,216,0.3)' : 'none' }}
            >
              <Send size={18}/>
            </button>
          </div>
          <p style={{ fontSize: '11px', color: d ? '#475569' : '#94a3b8', textAlign: 'center', margin: '8px 0 0' }}>
            🔐 End-to-end encrypted · Session expires in {timeLeft} · Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom