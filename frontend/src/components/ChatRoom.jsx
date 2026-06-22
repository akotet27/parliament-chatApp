import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send, Shield, LogOut, Lock, Hash,
  ArrowLeft, Moon, Sun,
  Edit2, Trash2, Check, X, ChevronLeft, ChevronRight,
  MessageSquare, Menu, Paperclip, UserPlus, Bell, Download,
  Image, FileText, CheckCircle, XCircle, Users, Plus
} from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useInactivity } from '../hooks/useInactivity'
import InactivityWarning from './InactivityWarning'
import CreateGroupModal from './CreateGroupModal'

const API = 'https://parliament-chatapp-1.onrender.com/api'

// ── File Attachment ────────────────────────────────────
function FileAttachment({ fileId, filename, mimetype, isOwn, darkMode }) {
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const isImage = mimetype?.startsWith('image/')
  const d = darkMode

  const fetchFile = async () => {
    if (fileData || loading) return
    setLoading(true)
    try {
      const token = sessionStorage.getItem('parliament_token')
      const res = await fetch(`${API}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      setFileData(json.data)
    } catch {}
    finally { setLoading(false) }
  }

  const handleDownload = async () => {
    await fetchFile()
    if (!fileData) return
    const link = document.createElement('a')
    link.href = `data:${mimetype || 'application/octet-stream'};base64,${fileData}`
    link.download = filename
    link.click()
  }

  useEffect(() => { if (isImage) fetchFile() }, [fileId])

  return (
    <div style={{ marginTop: '4px' }}>
      {isImage && fileData ? (
        <img
          src={`data:${mimetype};base64,${fileData}`}
          alt={filename}
          style={{ maxWidth: '240px', maxHeight: '200px', borderRadius: '8px', display: 'block', cursor: 'pointer' }}
          onClick={handleDownload}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: isOwn ? 'rgba(255,255,255,0.15)' : (d ? '#002a50' : '#e2e8f0'), borderRadius: '8px', marginTop: '4px' }}>
          {isImage ? <Image size={16} style={{ flexShrink: 0 }}/> : <FileText size={16} style={{ flexShrink: 0 }}/>}
          <span style={{ fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename}</span>
          <button onClick={handleDownload} disabled={loading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isOwn ? '#fff' : '#0066b2', opacity: loading ? 0.5 : 1, padding: '2px', display: 'flex' }}>
            <Download size={14}/>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Message Bubble ─────────────────────────────────────
function MessageBubble({ msg, isOwn, darkMode, onDelete, onEdit }) {
  const [hovered,   setHovered]   = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [editText,  setEditText]  = useState(msg.text)
  const [showDel,   setShowDel]   = useState(false)

  const d           = darkMode
  const ownBg       = 'linear-gradient(135deg, #0066b2, #1a80cc)'
  const otherBg     = d ? '#0f2a48' : '#ffffff'
  const otherColor  = d ? '#e6f4ff' : '#002244'

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
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0066b2', marginBottom: '4px', marginLeft: '36px' }}>
          {msg.from}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isOwn ? 'row-reverse' : 'row', maxWidth: '75%' }}>
        {/* Avatar */}
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isOwn ? '#0066b2' : (d ? '#475569' : '#e2e8f0'), color: isOwn ? '#fff' : (d ? '#f1f5f9' : '#0f2444'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
          {msg.from?.[0]?.toUpperCase()}
        </div>

        <div style={{ position: 'relative' }}>
          {/* Action buttons on hover */}
          {hovered && isOwn && !editing && (
            <div style={{ position: 'absolute', top: '-32px', right: 0, display: 'flex', gap: '4px', zIndex: 10 }}>
              <button
                onClick={() => { setEditing(true); setEditText(msg.text) }}
                title="Edit message"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${d ? '#475569' : '#e2e8f0'}`, background: d ? '#002a50' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066b2', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#dff0ff'}
                onMouseLeave={e => e.currentTarget.style.background = d ? '#002a50' : '#fff'}
              >
                <Edit2 size={13}/>
              </button>
              <button
                onClick={() => setShowDel(true)}
                title="Delete message"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${d ? '#475569' : '#e2e8f0'}`, background: d ? '#002a50' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = d ? '#002a50' : '#fff'}
              >
                <Trash2 size={13}/>
              </button>
            </div>
          )}

          {/* Delete confirmation */}
          {showDel && (
            <div style={{ position: 'absolute', top: '-44px', right: 0, zIndex: 20, background: d ? '#002a50' : '#fff', border: `1px solid ${d ? '#475569' : '#e2e8f0'}`, borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '12px', color: d ? '#f1f5f9' : '#0f2444' }}>Delete?</span>
              <button onClick={() => { onDelete(msg.id); setShowDel(false) }}
                style={{ padding: '3px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Yes
              </button>
              <button onClick={() => setShowDel(false)}
                style={{ padding: '3px 10px', background: d ? '#003070' : '#f1f5f9', color: d ? '#f1f5f9' : '#374151', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
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
                style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '2px solid #0066b2', borderRadius: '12px', outline: 'none', resize: 'none', background: d ? '#001020' : '#fff', color: d ? '#f1f5f9' : '#0f2444', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: '60px' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveEdit}
                  style={{ padding: '4px 12px', background: '#0066b2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12}/> Save
                </button>
                <button onClick={() => { setEditing(false); setEditText(msg.text) }}
                  style={{ padding: '4px 12px', background: d ? '#003070' : '#f1f5f9', color: d ? '#f1f5f9' : '#374151', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <X size={12}/> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '10px 16px', borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isOwn ? ownBg : otherBg, color: isOwn ? '#fff' : otherColor, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.15s', transform: hovered ? 'scale(1.01)' : 'scale(1)' }}>
              {msg.isFile ? (
                <FileAttachment
                  fileId={msg.file_id} filename={msg.filename}
                  mimetype={msg.mimetype} isOwn={isOwn} darkMode={d}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.text}</p>
              )}
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
      <div style={{ background: darkMode ? '#003070' : '#f1f5f9', borderRadius: '12px', padding: '8px 12px', display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 150, 300].map(delay => (
          <div key={delay} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0066b2', animation: 'bounce 1s infinite', animationDelay: `${delay}ms` }}/>
        ))}
      </div>
      <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>{name} is typing...</span>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  )
}

// ── Main ChatRoom ──────────────────────────────────────
function ChatRoom({ user, onLogout, fetchPublicKey, darkMode, onToggleDark, authApi }) {
  const [activeRoom,      setActiveRoom]      = useState('general')
  const [input,           setInput]           = useState('')
  const [sidebarOpen,     setSidebarOpen]     = useState(true)
  const [localMessages,   setLocalMessages]   = useState({})
  const [allMembers,      setAllMembers]       = useState([])
  const [friendRequests,  setFriendRequests]  = useState([])
  const [sentRequests,    setSentRequests]    = useState(new Set())
  const [notification,    setNotification]    = useState(null)
  const [uploading,       setUploading]       = useState(false)
  const [groups,          setGroups]          = useState([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [connectedUsers,  setConnectedUsers]  = useState(new Set())

  const messagesEndRef = useRef(null)
  const typingTimeout  = useRef(null)
  const isTypingRef    = useRef(false)
  const inputRef       = useRef(null)
  const fileInputRef   = useRef(null)

  const {
    connected, onlineUsers, groupMessages, groupRoomMessages,
    privateMessages, typingUsers, unreadCounts,
    sendGroupMessage, sendPrivateMessage,
    sendTyping, sendStopTyping,
    fetchPrivateHistory, fetchGroupHistory, clearUnread,
    pendingFriendRequests, sendFileMessage,
    sendDeleteMessage, sendEditMessage, friendRequestAccepted,
  } = useWebSocket(user, fetchPublicKey)

  const { timeLeft, showWarning, resetTimer } = useInactivity(
    () => onLogout('inactivity'), true
  )

  // Notify when a sent request is accepted
  useEffect(() => {
    if (friendRequestAccepted) {
      showNotif(`${friendRequestAccepted} accepted your connection request!`, 'success')
      setSentRequests(prev => { const s = new Set(prev); s.delete(friendRequestAccepted); return s })
    }
  }, [friendRequestAccepted])

  // Sync WebSocket-delivered friend requests
  useEffect(() => {
    if (pendingFriendRequests?.length) {
      setFriendRequests(prev => {
        const existingIds = new Set(prev.map(r => r.id))
        const newOnes = pendingFriendRequests.filter(r => !existingIds.has(r.id))
        return [...prev, ...newOnes]
      })
    }
  }, [pendingFriendRequests])

  // Fetch all members on mount
  useEffect(() => {
    const load = async () => {
      if (!authApi) return
      try {
        const [membersRes, reqRes, sentRes, groupsRes, connectionsRes] = await Promise.all([
          authApi.get('/users'),
          authApi.get('/friends/requests'),
          authApi.get('/friends/sent'),
          authApi.get('/groups'),
          authApi.get('/friends/connections'),
        ])
        setAllMembers(membersRes.data)
        // Merge so real-time WebSocket requests aren't overwritten
        setFriendRequests(prev => {
          const existingIds = new Set(prev.map(r => r.id))
          const newOnes = reqRes.data.filter(r => !existingIds.has(r.id))
          return [...prev, ...newOnes]
        })
        setSentRequests(new Set(sentRes.data.map(r => r.to_username)))
        setGroups(groupsRes.data || [])
        setConnectedUsers(new Set(connectionsRes.data || []))
      } catch {}
    }
    load()
  }, [authApi])

  // Colors — 1Password-inspired light/dark system
  const d           = darkMode
  const bg          = d ? '#0d1e35' : '#dce9f7'
  const sidebarBg   = d ? '#112038' : '#ffffff'
  const headerBg    = d ? '#112038' : '#ffffff'
  const msgAreaBg   = d ? '#091628' : '#e2eef9'
  const inputAreaBg = d ? '#112038' : '#ffffff'
  const border      = d ? 'rgba(0,102,178,0.2)' : 'rgba(0,102,178,0.15)'
  const textPrimary = d ? '#e6f4ff' : '#001a3d'
  const textMuted   = d ? '#5b8ab8' : '#4a6580'
  const inputBg     = d ? '#000d1f' : '#f5faff'
  const inputColor  = d ? '#e6f4ff' : '#001a3d'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages, privateMessages, localMessages, activeRoom])

  const isCustomGroup = groups.some(g => g.id === activeRoom)
  const isDM = activeRoom !== 'general' && !isCustomGroup

  useEffect(() => {
    const isGroup = groups.some(g => g.id === activeRoom)
    if (isDM) { fetchPrivateHistory(activeRoom); clearUnread(activeRoom) }
    else if (isGroup) { fetchGroupHistory(activeRoom) }
  }, [activeRoom])

  // Merge server messages with local edits/deletes
  const getRawMessages = () => {
    if (activeRoom === 'general') return groupMessages
    if (isCustomGroup) return groupRoomMessages[activeRoom] || []
    return privateMessages[activeRoom] || []
  }

  const currentMessages = getRawMessages().map(msg => {
    const local = localMessages[msg.id]
    if (!local) return msg
    if (local.deleted) return null
    return { ...msg, text: local.text, edited: true }
  }).filter(Boolean)

  const whoIsTyping = typingUsers[activeRoom]
  const otherUsers  = onlineUsers.filter(u => u !== user.username)
  const onlineSet   = new Set(onlineUsers)

  const showNotif = (msg, type = 'info') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleSend = async () => {
    if (!input.trim()) return
    if (isDM) await sendPrivateMessage(activeRoom, input)
    else await sendGroupMessage(input, activeRoom)
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

  const handleEdit = (msgId, newText) => {
    setLocalMessages(prev => ({ ...prev, [msgId]: { text: newText } }))
    const toUser = isDM ? activeRoom : null
    sendEditMessage(msgId, newText, isDM, toUser)
  }

  const handleDelete = (msgId) => {
    setLocalMessages(prev => ({ ...prev, [msgId]: { deleted: true } }))
    sendDeleteMessage(msgId)
  }

  const handleSelfChat = () => setActiveRoom(user.username)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !authApi) return
    if (file.size > 50 * 1024 * 1024) { showNotif('File too large (max 50MB)', 'error'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await authApi.post('/upload', formData)
      const { file_id, filename, mimetype } = res.data
      const to = isDM ? activeRoom : null
      sendFileMessage(file_id, filename, mimetype, to)
      showNotif(`Sent: ${filename}`, 'success')
    } catch { showNotif('Upload failed', 'error') }
    finally { setUploading(false); e.target.value = '' }
  }

  const handleConnectRequest = async (toUsername) => {
    if (!authApi) return
    try {
      await authApi.post('/friends/request', { to_username: toUsername })
      setSentRequests(prev => new Set([...prev, toUsername]))
      showNotif(`Connection request sent to ${toUsername}`, 'success')
    } catch (err) {
      showNotif(err.response?.data?.detail || 'Could not send request', 'error')
    }
  }

  const handleAccept = async (requestId, fromUsername) => {
    if (!authApi) return
    try {
      await authApi.put(`/friends/requests/${requestId}/accept`)
      setFriendRequests(prev => prev.filter(r => r.id !== requestId))
      showNotif(`Connected with ${fromUsername}!`, 'success')
    } catch { showNotif('Could not accept request', 'error') }
  }

  const handleReject = async (requestId) => {
    if (!authApi) return
    try {
      await authApi.put(`/friends/requests/${requestId}/reject`)
      setFriendRequests(prev => prev.filter(r => r.id !== requestId))
    } catch {}
  }

  const handleCreateGroup = async (name, members) => {
    if (!authApi) throw new Error('Not authenticated')
    const res = await authApi.post('/groups', { name, members })
    setGroups(prev => [res.data, ...prev])
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Montserrat', system-ui, sans-serif", background: bg, transition: 'background 0.3s' }}>

      <style>{`
        @keyframes slideIn { from{transform:translateX(-100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeMsg { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .room-btn { transition: all 0.15s; }
        .room-btn:hover { background: ${d ? '#003466' : '#cce4f8'} !important; color: #0066b2 !important; }
        .send-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .send-btn:hover:not(:disabled) { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,102,178,0.5) !important; }
        .sidebar-toggle:hover { background: ${d ? '#003466' : '#d0e8fa'} !important; color: #0066b2 !important; }
        .attach-btn:hover:not(:disabled) { background: ${d ? '#003070' : '#d0e8fa'} !important; color: #0066b2 !important; }
        .signout-btn:hover { background: ${d ? 'rgba(220,38,38,0.12)' : '#fef2f2'} !important; color: #dc2626 !important; border-color: #fecaca !important; }

        /* ── Responsiveness ── */
        @media (max-width: 768px) {
          .chat-sidebar {
            position: fixed !important; left: 0; top: 0; bottom: 0; height: 100vh !important;
            z-index: 200; box-shadow: 6px 0 24px rgba(0,0,0,0.25) !important;
          }
          .mobile-backdrop { display: block !important; }
          .chat-header-actions { gap: 6px !important; }
        }
        .mobile-backdrop { display: none; }

        @media (max-width: 480px) {
          .input-area { padding: 8px 10px !important; }
          .input-btn { width: 40px !important; height: 40px !important; }
          .chat-header-title { font-size: 12px !important; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${d ? 'rgba(0,102,178,0.3)' : 'rgba(0,102,178,0.2)'}; border-radius: 2px; }
      `}</style>

      {showWarning && (
        <InactivityWarning
          timeLeft={timeLeft}
          onStayLoggedIn={resetTimer}
          onLogoutNow={() => onLogout('manual')}
          darkMode={darkMode}
        />
      )}

      {/* Mobile overlay — tap to close sidebar */}
      <div className="mobile-backdrop" onClick={() => setSidebarOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 199,
        background: 'rgba(0,10,30,0.5)',
        backdropFilter: 'blur(2px)',
        cursor: 'pointer',
        display: 'none',  // CSS overrides to block on ≤768px only when sidebar open
        opacity: sidebarOpen ? 1 : 0,
        pointerEvents: sidebarOpen ? 'auto' : 'none',
        transition: 'opacity 0.25s',
      }}/>

      {/* ── SIDEBAR ── */}
      <div className="chat-sidebar" style={{
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
          <div style={{ background: d ? '#001020' : '#f8fafc', borderRadius: '10px', padding: '10px 12px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dff0ff', color: '#0066b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</p>
              <p style={{ fontSize: '11px', color: textMuted, margin: 0, textTransform: 'capitalize' }}>{user.role}</p>
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}/>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>

          {/* Channels */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 4px 6px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Channels</p>
            <button onClick={() => setShowCreateGroup(true)} title="New Group" style={{ width: '20px', height: '20px', borderRadius: '5px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#0066b2'}
              onMouseLeave={e => e.currentTarget.style.color = textMuted}>
              <Plus size={14}/>
            </button>
          </div>
          <button
            className="room-btn"
            onClick={() => setActiveRoom('general')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeRoom === 'general' ? (d ? '#003466' : '#dff0ff') : 'transparent', color: activeRoom === 'general' ? '#0066b2' : textMuted, fontSize: '13px', fontWeight: 600, textAlign: 'left', borderLeft: activeRoom === 'general' ? '3px solid #0066b2' : '3px solid transparent', transition: 'all 0.15s' }}
          >
            <Hash size={15}/> general
          </button>
          {groups.map(g => (
            <button key={g.id} className="room-btn" onClick={() => setActiveRoom(g.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeRoom === g.id ? (d ? '#003466' : '#dff0ff') : 'transparent', color: activeRoom === g.id ? '#0066b2' : textMuted, fontSize: '13px', fontWeight: 600, textAlign: 'left', borderLeft: activeRoom === g.id ? '3px solid #0066b2' : '3px solid transparent', transition: 'all 0.15s' }}>
              <Users size={15}/> {g.name}
            </button>
          ))}

          {/* Chat with yourself */}
          <p style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px 4px' }}>Notes to self</p>
          <button
            className="room-btn"
            onClick={handleSelfChat}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeRoom === user.username ? (d ? '#003466' : '#dff0ff') : 'transparent', color: activeRoom === user.username ? '#0066b2' : textMuted, fontSize: '13px', fontWeight: 600, textAlign: 'left', borderLeft: activeRoom === user.username ? '3px solid #0066b2' : '3px solid transparent', transition: 'all 0.15s' }}
          >
            <MessageSquare size={15}/> My Notes
            <span style={{ marginLeft: 'auto', fontSize: '10px', background: d ? '#003070' : '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: textMuted }}>You</span>
          </button>

          {/* Connection Requests */}
          {friendRequests.length > 0 && (
            <>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#0066b2', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={12}/> Requests
                <span style={{ background: '#0066b2', color: '#fff', fontSize: '10px', borderRadius: '99px', padding: '1px 6px' }}>{friendRequests.length}</span>
              </p>
              {friendRequests.map(req => (
                <div key={req.id} style={{ background: d ? '#002a50' : '#dff0ff', borderRadius: '8px', padding: '8px 10px', marginBottom: '4px', border: `1px solid ${d ? '#003070' : '#99ccee'}` }}>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    <UserPlus size={11} style={{ marginRight: '4px' }}/>{req.from_username} wants to connect
                  </p>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleAccept(req.id, req.from_username)}
                      style={{ flex: 1, padding: '4px', background: '#0066b2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <CheckCircle size={11}/> Accept
                    </button>
                    <button onClick={() => handleReject(req.id)}
                      style={{ flex: 1, padding: '4px', background: 'transparent', color: textMuted, border: `1px solid ${border}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <XCircle size={11}/> Decline
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Members / DMs — all members, online + offline */}
          <p style={{ fontSize: '11px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={12}/> Members ({onlineUsers.length} online)
          </p>
          {allMembers.filter(m => m.username !== user.username).length === 0 && otherUsers.length === 0 ? (
            <p style={{ fontSize: '12px', color: textMuted, padding: '4px 12px' }}>No other members</p>
          ) : (
            <>
              {/* Online first */}
              {otherUsers.map(uid => (
                <button key={uid} className="room-btn"
                  onClick={() => { setActiveRoom(uid); clearUnread(uid) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeRoom === uid ? (d ? '#003466' : '#dff0ff') : 'transparent', borderLeft: activeRoom === uid ? '3px solid #0066b2' : '3px solid transparent', marginBottom: '2px', textAlign: 'left', transition: 'all 0.15s' }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: d ? '#003070' : '#dff0ff', color: '#0066b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                      {uid[0]?.toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', border: '2px solid ' + sidebarBg }}/>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: activeRoom === uid ? '#0066b2' : textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uid}</span>
                  {unreadCounts[uid] > 0 && (
                    <span style={{ background: '#0066b2', color: '#fff', fontSize: '11px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {unreadCounts[uid]}
                    </span>
                  )}
                </button>
              ))}
              {/* Offline members */}
              {allMembers
                .filter(m => m.username !== user.username && !onlineSet.has(m.username))
                .map(m => {
                  const alreadySent = sentRequests.has(m.username) || connectedUsers.has(m.username)
                  const isConnected = connectedUsers.has(m.username)
                  return (
                    <div key={m.username} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', marginBottom: '2px', opacity: 0.65 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: d ? '#003070' : '#e2e8f0', color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                          {m.username[0]?.toUpperCase()}
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', border: '2px solid ' + sidebarBg }}/>
                      </div>
                      <span style={{ fontSize: '13px', color: textMuted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.username}</span>
                      {isConnected ? (
                        <span style={{ fontSize: '10px', color: '#16a34a', flexShrink: 0 }}>Connected</span>
                      ) : !alreadySent ? (
                        <button onClick={() => handleConnectRequest(m.username)}
                          title="Send connection request"
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066b2', flexShrink: 0 }}>
                          <UserPlus size={12}/>
                        </button>
                      ) : (
                        <span style={{ fontSize: '10px', color: textMuted, flexShrink: 0 }}>sent</span>
                      )}
                    </div>
                  )
                })
              }
            </>
          )}
        </div>

        {/* Bottom controls */}
        <div style={{ padding: '12px', borderTop: `1px solid ${border}`, flexShrink: 0 }}>
          {/* Dark mode */}
          <button onClick={onToggleDark}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = d ? '#003070' : '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {darkMode ? <Sun size={15}/> : <Moon size={15}/>}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>

          {/* Sign out */}
          <button onClick={() => onLogout('manual')} className="signout-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066b2', padding: 0, display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ArrowLeft size={20}/>
              </button>
            )}

            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activeRoom === user.username ? '#f0fdf4' : '#dff0ff', color: activeRoom === user.username ? '#16a34a' : '#0066b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
              {activeRoom === 'general' || isCustomGroup ? '#' : activeRoom[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: textPrimary, margin: 0 }}>
                {activeRoom === 'general' ? 'general'
                  : isCustomGroup ? (groups.find(g => g.id === activeRoom)?.name || activeRoom)
                  : activeRoom === user.username ? 'My Notes'
                  : activeRoom}
              </p>
              <p style={{ fontSize: '12px', color: textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={11}/>
                {activeRoom === 'general' ? 'Parliament general channel'
                  : isCustomGroup ? 'Encrypted group channel'
                  : activeRoom === user.username ? 'Private notes — only you can see this'
                  : 'End-to-end encrypted DM'}
              </p>
            </div>
          </div>

          {/* Right side — subtle connection dot only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div title={connected ? 'Connected' : 'Reconnecting…'}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#16a34a' : '#f59e0b', flexShrink: 0, boxShadow: connected ? '0 0 6px rgba(22,163,74,0.5)' : '0 0 6px rgba(245,158,11,0.5)', transition: 'all 0.4s' }}/>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: msgAreaBg, transition: 'background 0.3s', position: 'relative' }}>
          {/* Parliament watermark */}
          <img src="/parliament-logo.png" alt="" style={{
            position: 'absolute', bottom: '12%', right: '4%',
            width: 'clamp(80px, 15vw, 160px)', height: 'auto',
            objectFit: 'contain', pointerEvents: 'none',
            opacity: d ? 0.04 : 0.06,
            filter: d ? 'brightness(0) invert(1)' : 'saturate(0)',
            zIndex: 0,
          }}/>

          {currentMessages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: d ? '#002a50' : '#dff0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {activeRoom === user.username
                  ? <MessageSquare size={28} color="#16a34a"/>
                  : <Lock size={28} color="#0066b2"/>
                }
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>
                {activeRoom === 'general' ? 'Welcome to Parliament SecureChat'
                  : isCustomGroup ? `Welcome to ${groups.find(g => g.id === activeRoom)?.name || activeRoom}`
                  : activeRoom === user.username ? 'Your private notes'
                  : `Start a secure conversation with ${activeRoom}`}
              </p>
              <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 4px' }}>
                {activeRoom === user.username
                  ? 'Write notes, save links, keep reminders — only visible to you'
                  : 'Messages are end-to-end encrypted'}
              </p>
              {activeRoom !== user.username && (
                <p style={{ fontSize: '12px', color: d ? '#475569' : '#94a3b8', margin: 0 }}>
                  Not even server administrators can read these messages
                </p>
              )}
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 1 }}>
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
        </div>

        {/* Notification toast */}
        {notification && (
          <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: notification.type === 'error' ? '#dc2626' : notification.type === 'success' ? '#16a34a' : '#0066b2', color: '#fff', padding: '10px 20px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
            {notification.msg}
          </div>
        )}

        {/* Input area */}
        <div className="input-area" style={{ background: inputAreaBg, borderTop: `1px solid ${border}`, padding: '12px 16px', flexShrink: 0, transition: 'background 0.3s' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            {/* File attach button */}
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx" />
            <button
              className="attach-btn input-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={!connected || uploading}
              title="Attach file"
              style={{ width: '46px', height: '46px', borderRadius: '12px', border: `1px solid ${border}`, background: 'transparent', cursor: connected && !uploading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: uploading ? '#0066b2' : textMuted, flexShrink: 0, transition: 'all 0.2s' }}
            >
              {uploading ? <div style={{ width: '18px', height: '18px', border: '2px solid #0066b2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> : <Paperclip size={18}/>}
            </button>

            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                placeholder={
                  activeRoom === user.username ? 'Write a note to yourself...'
                  : isDM ? `Message ${activeRoom}...`
                  : isCustomGroup ? `Message #${groups.find(g => g.id === activeRoom)?.name || activeRoom}...`
                  : 'Message #general...'
                }
                rows={1}
                style={{ width: '100%', padding: '13px 16px', fontSize: '14px', border: `1px solid ${border}`, borderRadius: '12px', outline: 'none', resize: 'none', color: inputColor, background: inputBg, boxSizing: 'border-box', minHeight: '46px', maxHeight: '120px', fontFamily: 'inherit', lineHeight: '20px', transition: 'border-color 0.2s, box-shadow 0.2s', display: 'block' }}
                onFocus={e => { e.target.style.borderColor = '#0066b2'; e.target.style.boxShadow = '0 0 0 3px rgba(0,102,178,0.12)' }}
                onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="send-btn input-btn"
              style={{ width: '46px', height: '46px', borderRadius: '12px', border: 'none', background: input.trim() && connected ? 'linear-gradient(135deg, #0066b2, #1a80cc)' : (d ? '#003070' : '#dce9f7'), color: input.trim() && connected ? '#fff' : (d ? '#64748b' : '#94a3b8'), cursor: input.trim() && connected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: input.trim() && connected ? '0 4px 12px rgba(0,102,178,0.35)' : 'none' }}
            >
              <Send size={18}/>
            </button>
          </div>
        </div>
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          allMembers={allMembers}
          currentUser={user}
          darkMode={darkMode}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  )
}

export default ChatRoom