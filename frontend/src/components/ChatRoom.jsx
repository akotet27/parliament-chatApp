import { useState, useEffect, useRef } from 'react'
import {
  Send, Shield, LogOut, Lock,
  Hash, ArrowLeft, Clock, AlertTriangle,
} from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useInactivity } from '../hooks/useInactivity'
import InactivityWarning from './InactivityWarning'

function MessageBubble({ msg, isOwn }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
    }}>
      {!isOwn && (
        <span style={{
          fontSize: '12px', fontWeight: 700,
          color: '#1d4ed8', marginBottom: '4px',
          marginLeft: '36px',
        }}>
          {msg.from}
        </span>
      )}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        gap: '8px',
        flexDirection: isOwn ? 'row-reverse' : 'row',
      }}>
        {/* Avatar */}
        {!isOwn && (
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#eff6ff', color: '#1d4ed8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '12px', flexShrink: 0,
          }}>
            {msg.from?.[0]?.toUpperCase()}
          </div>
        )}
        {/* Bubble */}
        <div style={{
          maxWidth: '340px', padding: '10px 16px',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isOwn
            ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
            : '#f1f5f9',
          color: isOwn ? '#fff' : '#0f2444',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
            {msg.text}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end', gap: '4px', marginTop: '4px',
          }}>
            <Lock size={10} style={{ opacity: 0.5 }}/>
            <span style={{ fontSize: '11px', opacity: 0.6 }}>
              {msg.timestamp}
            </span>
            {isOwn && <span style={{ fontSize: '11px', opacity: 0.6 }}>✓✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0 8px' }}>
      <div style={{
        background: '#f1f5f9', borderRadius: '12px',
        padding: '8px 12px', display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        {[0, 150, 300].map(delay => (
          <div key={delay} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#1d4ed8', animation: 'bounce 1s infinite',
            animationDelay: `${delay}ms`,
          }}/>
        ))}
      </div>
      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{name} is typing...</span>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  )
}

function ChatRoom({ user, onLogout, fetchPublicKey }) {
  const [activeRoom, setActiveRoom] = useState('general')
  const [input, setInput]           = useState('')
  const messagesEndRef  = useRef(null)
  const typingTimeout   = useRef(null)
  const isTypingRef     = useRef(false)
  const inputRef        = useRef(null)

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages, privateMessages, activeRoom])

  useEffect(() => {
    const isDM = activeRoom !== 'general'
    if (isDM) { fetchPrivateHistory(activeRoom); clearUnread(activeRoom) }
  }, [activeRoom])

  const isDM = activeRoom !== 'general'
  const currentMessages = isDM ? (privateMessages[activeRoom] || []) : groupMessages
  const whoIsTyping = typingUsers[activeRoom]

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

  const otherUsers = onlineUsers.filter(uid => uid !== user.id)
  const warningColor = showWarning ? '#dc2626' : '#1d4ed8'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>

      {showWarning && (
        <InactivityWarning
          timeLeft={timeLeft}
          onStayLoggedIn={resetTimer}
          onLogoutNow={() => onLogout('manual')}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: '260px', minWidth: '260px',
        background: '#fff', borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', height: '100%',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}>

        {/* Logo header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <img src="/parliament-logo.png" alt="Parliament"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}/>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f2444', margin: 0 }}>
                Parliament
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                SecureChat
              </p>
            </div>
          </div>

          {/* User card */}
          <div style={{
            background: '#f8fafc', borderRadius: '10px',
            padding: '10px 12px', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#eff6ff', color: '#1d4ed8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '13px', flexShrink: 0,
            }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f2444', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.username}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textTransform: 'capitalize' }}>
                {user.role}
              </p>
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}/>
          </div>
        </div>

        {/* Session timer */}
        <div style={{
          margin: '12px', borderRadius: '10px', padding: '10px 14px',
          background: showWarning ? '#fef2f2' : '#f8fafc',
          border: `1px solid ${showWarning ? '#fecaca' : '#e2e8f0'}`,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <Clock size={15} color={warningColor}/>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Session timeout</p>
            <p style={{ fontSize: '16px', fontWeight: 800, color: warningColor, margin: 0, fontFamily: 'monospace' }}>
              {timeLeft}
            </p>
          </div>
          {showWarning && <AlertTriangle size={16} color="#dc2626"/>}
        </div>

        {/* Channels */}
        <div style={{ padding: '0 12px 8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 4px' }}>
            Channels
          </p>
          <button
            onClick={() => setActiveRoom('general')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeRoom === 'general' ? '#eff6ff' : 'transparent',
              color: activeRoom === 'general' ? '#1d4ed8' : '#64748b',
              fontSize: '13px', fontWeight: 600, textAlign: 'left',
              borderLeft: activeRoom === 'general' ? '3px solid #1d4ed8' : '3px solid transparent',
            }}
          >
            <Hash size={15}/>
            general
          </button>
        </div>

        {/* Members */}
        <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '8px 0 6px 4px' }}>
            Members ({onlineUsers.length} online)
          </p>
          {otherUsers.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#94a3b8', padding: '4px 12px' }}>
              No other members online
            </p>
          ) : otherUsers.map(uid => (
            <button
              key={uid}
              onClick={() => { setActiveRoom(uid); clearUnread(uid) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: activeRoom === uid ? '#eff6ff' : 'transparent',
                borderLeft: activeRoom === uid ? '3px solid #1d4ed8' : '3px solid transparent',
                marginBottom: '2px', textAlign: 'left',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#eff6ff', color: '#1d4ed8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '12px',
                }}>
                  {uid[0]?.toUpperCase()}
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#16a34a', border: '2px solid #fff',
                }}/>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: activeRoom === uid ? '#1d4ed8' : '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {uid}
              </span>
              {unreadCounts[uid] > 0 && (
                <span style={{
                  background: '#1d4ed8', color: '#fff',
                  fontSize: '11px', fontWeight: 700,
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadCounts[uid]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#eff6ff', borderRadius: '8px', padding: '8px 12px',
            marginBottom: '8px',
          }}>
            <Lock size={13} color="#1d4ed8"/>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>
              E2E Encrypted
            </span>
          </div>
          <button
            onClick={() => onLogout('manual')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca',
              background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={14}/>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '14px 24px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isDM && (
              <button onClick={() => setActiveRoom('general')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', padding: 0 }}>
                <ArrowLeft size={20}/>
              </button>
            )}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#eff6ff', color: '#1d4ed8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '14px',
            }}>
              {isDM ? activeRoom[0]?.toUpperCase() : '#'}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f2444', margin: 0 }}>
                {isDM ? activeRoom : '# general'}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={11}/> {isDM ? 'End-to-end encrypted DM' : 'Parliament general channel'}
              </p>
            </div>
          </div>

          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: connected ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${connected ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '99px', padding: '6px 14px',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: connected ? '#16a34a' : '#dc2626',
            }}/>
            <Shield size={14} color={connected ? '#16a34a' : '#dc2626'}/>
            <span style={{ fontSize: '12px', fontWeight: 600, color: connected ? '#16a34a' : '#dc2626' }}>
              {connected ? 'Secure' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
          {currentMessages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: '#eff6ff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '16px',
              }}>
                <Lock size={28} color="#1d4ed8"/>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f2444', margin: '0 0 8px' }}>
                {isDM ? `Start a secure conversation with ${activeRoom}` : 'Welcome to Parliament SecureChat'}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>
                🔐 Messages are end-to-end encrypted
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Not even server administrators can read these messages
              </p>
            </div>
          )}

          {currentMessages.map((msg, i) => (
            <MessageBubble key={msg.id || i} msg={msg} isOwn={msg.from === user.username}/>
          ))}

          {whoIsTyping && <TypingIndicator name={whoIsTyping}/>}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input */}
        <div style={{
          background: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 24px',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                placeholder={isDM ? `Encrypted message to ${activeRoom}...` : 'Encrypted message to #general...'}
                rows={1}
                style={{
                  width: '100%', padding: '12px 40px 12px 16px',
                  fontSize: '14px', border: '1px solid #e2e8f0',
                  borderRadius: '12px', outline: 'none', resize: 'none',
                  color: '#0f2444', background: '#f8fafc', boxSizing: 'border-box',
                  minHeight: '46px', maxHeight: '120px', fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
                onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
              <Lock size={14} color="#cbd5e1" style={{ position: 'absolute', right: '12px', bottom: '14px' }}/>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              style={{
                width: '46px', height: '46px', borderRadius: '12px', border: 'none',
                background: input.trim() && connected ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)' : '#e2e8f0',
                color: input.trim() && connected ? '#fff' : '#94a3b8',
                cursor: input.trim() && connected ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              <Send size={18}/>
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', margin: '8px 0 0' }}>
            🔐 End-to-end encrypted · ECDH key exchange · Session expires in {timeLeft}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom