import { useState, useEffect, useRef, useCallback } from 'react'
import { keyStore } from '../crypto/e2e'

const WS_URL = 'wss://parliament-chatapp-1.onrender.com/ws'
const GROUP_KEY = 'parliament-group-2026'

function simpleEncrypt(text, key) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(unescape(encodeURIComponent(result)))
}

function simpleDecrypt(encoded, key) {
  try {
    const text = decodeURIComponent(escape(atob(encoded)))
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  } catch {
    return '[Message could not be decrypted]'
  }
}

export function useWebSocket(user, fetchPublicKey) {
  const ws             = useRef(null)
  const pingInterval   = useRef(null)
  // Ref so the reconnect closure always calls the latest handleMessage
  const handleMessageRef = useRef(null)

  const [connected,              setConnected]              = useState(false)
  const [onlineUsers,            setOnlineUsers]            = useState([])
  const [groupMessages,          setGroupMessages]          = useState([])
  const [groupRoomMessages,      setGroupRoomMessages]      = useState({})
  const [privateMessages,        setPrivateMessages]        = useState({})
  const [typingUsers,            setTypingUsers]            = useState({})
  const [unreadCounts,           setUnreadCounts]           = useState({})
  const [pendingFriendRequests,  setPendingFriendRequests]  = useState([])
  const [friendRequestAccepted,  setFriendRequestAccepted]  = useState(null)
  const typingTimers = useRef({})

  const handleMessage = useCallback(async (data) => {
    switch (data.type) {

      case 'user_joined':
      case 'user_left':
        setOnlineUsers(data.online_users || [])
        break

      case 'history': {
        const history = data.messages.map(msg => {
          if (msg.message_type === 'file') {
            const parts = msg.ciphertext.replace('__FILE__', '').split('__')
            return { ...msg, isFile: true, file_id: parts[0], filename: parts[1], mimetype: parts[2] || '', text: `📎 ${parts[1]}`, from: msg.sender_name }
          }
          return { ...msg, text: simpleDecrypt(msg.ciphertext, GROUP_KEY), from: msg.sender_name }
        })
        setGroupMessages(history)
        break
      }

      case 'group_message': {
        const msgRoom = data.room || 'general'
        const decoded = { ...data, text: simpleDecrypt(data.ciphertext, GROUP_KEY), from: data.sender }
        if (msgRoom === 'general') {
          setGroupMessages(prev => [...prev, decoded])
        } else {
          setGroupRoomMessages(prev => ({
            ...prev,
            [msgRoom]: [...(prev[msgRoom] || []), decoded],
          }))
        }
        break
      }

      case 'group_history': {
        const msgs = data.messages.map(msg => ({
          ...msg,
          text: simpleDecrypt(msg.ciphertext, GROUP_KEY),
          from: msg.sender_name,
        }))
        setGroupRoomMessages(prev => ({ ...prev, [data.room]: msgs }))
        break
      }

      case 'private_message': {
        const dmPartner = data.sender === user.username ? data.to : data.sender
        const dmText = simpleDecrypt(data.ciphertext, `${data.sender}-${data.to}-dm`)
        setPrivateMessages(prev => ({
          ...prev,
          [dmPartner]: [...(prev[dmPartner] || []), { ...data, text: dmText, from: data.sender }]
        }))
        if (data.sender !== user.username) {
          setUnreadCounts(prev => ({ ...prev, [data.sender]: (prev[data.sender] || 0) + 1 }))
        }
        break
      }

      case 'private_history': {
        const dmHistory = data.messages.map(msg => {
          if (msg.message_type === 'file') {
            const parts = msg.ciphertext.replace('__FILE__', '').split('__')
            return { ...msg, isFile: true, file_id: parts[0], filename: parts[1], mimetype: parts[2] || '', text: `📎 ${parts[1]}`, from: msg.sender_name }
          }
          return { ...msg, text: simpleDecrypt(msg.ciphertext, `${msg.sender_name}-${data.with}-dm`), from: msg.sender_name }
        })
        setPrivateMessages(prev => ({ ...prev, [data.with]: dmHistory }))
        break
      }

      case 'typing': {
        const room = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => ({ ...prev, [room]: data.from }))
        if (typingTimers.current[room]) clearTimeout(typingTimers.current[room])
        typingTimers.current[room] = setTimeout(() => {
          setTypingUsers(prev => { const u = { ...prev }; delete u[room]; return u })
        }, 3000)
        break
      }

      case 'stop_typing': {
        const stopRoom = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => { const u = { ...prev }; delete u[stopRoom]; return u })
        break
      }

      case 'file_message': {
        const isGroup = !data.to
        const partner = isGroup ? null : (data.sender === user.username ? data.to : data.sender)
        const fileMsg = { ...data, from: data.sender, isFile: true }
        if (isGroup) {
          setGroupMessages(prev => [...prev, fileMsg])
        } else {
          setPrivateMessages(prev => ({ ...prev, [partner]: [...(prev[partner] || []), fileMsg] }))
          if (data.sender !== user.username) {
            setUnreadCounts(prev => ({ ...prev, [data.sender]: (prev[data.sender] || 0) + 1 }))
          }
        }
        break
      }

      case 'pending_friend_requests':
        setPendingFriendRequests(data.requests || [])
        break

      case 'friend_request':
        setPendingFriendRequests(prev => [...prev, { id: data.request_id, from_username: data.from_username }])
        break

      case 'friend_request_accepted':
        setFriendRequestAccepted(data.by_username)
        break

      case 'message_deleted':
        setGroupMessages(prev => prev.filter(m => m.id !== data.id))
        setPrivateMessages(prev => {
          const updated = {}
          for (const [key, msgs] of Object.entries(prev)) {
            updated[key] = msgs.filter(m => m.id !== data.id)
          }
          return updated
        })
        break

      case 'message_edited': {
        if (!data.is_dm) {
          const editedText = simpleDecrypt(data.ciphertext, GROUP_KEY)
          setGroupMessages(prev => prev.map(m =>
            m.id === data.id ? { ...m, text: editedText, edited: true } : m
          ))
        } else {
          const dmKey = `${data.from}-${data.to || data.from}-dm`
          const editedText = simpleDecrypt(data.ciphertext, dmKey)
          const partner = data.from === user.username ? (data.to || data.from) : data.from
          setPrivateMessages(prev => ({
            ...prev,
            [partner]: (prev[partner] || []).map(m =>
              m.id === data.id ? { ...m, text: editedText, edited: true } : m
            )
          }))
        }
        break
      }

      case 'pong':
        break

      default:
        break
    }
  }, [user?.username])

  // Keep ref in sync so the closure inside useEffect always calls the latest version
  handleMessageRef.current = handleMessage

  // Auto-reconnect with exponential backoff
  useEffect(() => {
    if (!user?.token) return

    let alive = true
    let retryDelay = 1500
    let retryTimer = null

    function connect() {
      if (!alive) return

      const socket = new WebSocket(`${WS_URL}/${user.token}`)
      ws.current = socket

      socket.onopen = () => {
        if (!alive) { socket.close(); return }
        setConnected(true)
        retryDelay = 1500  // reset backoff on success

        clearInterval(pingInterval.current)
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }))
          }
        }, 25000)
      }

      socket.onmessage = (event) => {
        try { handleMessageRef.current?.(JSON.parse(event.data)) } catch {}
      }

      socket.onclose = () => {
        setConnected(false)
        clearInterval(pingInterval.current)
        if (alive) {
          // Exponential backoff: 1.5s → 2.25s → 3.4s … capped at 15s
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 1.5, 15000)
            connect()
          }, retryDelay)
        }
      }

      socket.onerror = () => {
        // onclose fires automatically after onerror — reconnect handled there
      }
    }

    connect()

    return () => {
      alive = false
      clearTimeout(retryTimer)
      clearInterval(pingInterval.current)
      ws.current?.close()
    }
  }, [user?.token])

  const sendGroupMessage = useCallback((text, room = 'general') => {
    if (!ws.current || !text.trim()) return
    const ciphertext = simpleEncrypt(text, GROUP_KEY)
    ws.current.send(JSON.stringify({
      type: 'group_message', room, ciphertext,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [])

  const fetchGroupHistory = useCallback((roomId) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'fetch_group_history', room: roomId }))
  }, [])

  const sendPrivateMessage = useCallback((toUsername, text) => {
    if (!ws.current || !text.trim()) return
    const key = `${user.username}-${toUsername}-dm`
    const ciphertext = simpleEncrypt(text, key)
    ws.current.send(JSON.stringify({
      type: 'private_message', to: toUsername, ciphertext,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [user?.username])

  const sendTyping = useCallback((to = 'general') => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'typing', to }))
  }, [])

  const sendStopTyping = useCallback((to = 'general') => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'stop_typing', to }))
  }, [])

  const fetchPrivateHistory = useCallback((withUser) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'fetch_private', with: withUser }))
  }, [])

  const clearUnread = useCallback((username) => {
    setUnreadCounts(prev => ({ ...prev, [username]: 0 }))
  }, [])

  const sendFileMessage = useCallback((fileId, filename, mimetype, toUsername = null) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({
      type: 'file_message', file_id: fileId, filename, mimetype,
      to: toUsername || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [])

  const sendDeleteMessage = useCallback((msgId) => {
    if (!ws.current) return
    ws.current.send(JSON.stringify({ type: 'delete_message', msg_id: msgId }))
  }, [])

  const sendEditMessage = useCallback((msgId, newText, isDM, toUsername) => {
    if (!ws.current) return
    const key = isDM ? `${user.username}-${toUsername || user.username}-dm` : GROUP_KEY
    const ciphertext = simpleEncrypt(newText, key)
    ws.current.send(JSON.stringify({ type: 'edit_message', msg_id: msgId, ciphertext }))
  }, [user?.username])

  return {
    connected, onlineUsers, groupMessages, groupRoomMessages,
    privateMessages, typingUsers, unreadCounts,
    sendGroupMessage, sendPrivateMessage,
    sendTyping, sendStopTyping,
    fetchPrivateHistory, fetchGroupHistory, clearUnread,
    sendFileMessage, pendingFriendRequests,
    sendDeleteMessage, sendEditMessage, friendRequestAccepted,
  }
}
