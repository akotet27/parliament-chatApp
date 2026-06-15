import { useState, useEffect, useRef, useCallback } from 'react'
import { keyStore } from '../crypto/e2e'

const WS_URL = 'wss://your-render-url.onrender.com/ws'
// Simple XOR encryption for group messages
// Both sides use the same key derived from a shared secret
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

  const [connected,       setConnected]       = useState(false)
  const [onlineUsers,     setOnlineUsers]     = useState([])
  const [groupMessages,   setGroupMessages]   = useState([])
  const [privateMessages, setPrivateMessages] = useState({})
  const [typingUsers,     setTypingUsers]     = useState({})
  const [unreadCounts,    setUnreadCounts]    = useState({})
  const typingTimers = useRef({})

  useEffect(() => {
    if (!user?.token) return

    ws.current = new WebSocket(`${WS_URL}/${user.token}`)

    ws.current.onopen = () => {
      setConnected(true)
      pingInterval.current = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }

    ws.current.onclose = () => {
      setConnected(false)
      clearInterval(pingInterval.current)
    }

    ws.current.onerror = () => setConnected(false)

    return () => {
      clearInterval(pingInterval.current)
      ws.current?.close()
    }
  }, [user?.token])

  const handleMessage = useCallback(async (data) => {
    switch (data.type) {

      case 'user_joined':
      case 'user_left':
        setOnlineUsers(data.online_users || [])
        break

      case 'history':
        const history = data.messages.map(msg => ({
          ...msg,
          text: simpleDecrypt(msg.ciphertext, GROUP_KEY),
          from: msg.sender_name,
        }))
        setGroupMessages(history)
        break

      case 'group_message':
        setGroupMessages(prev => [...prev, {
          ...data,
          text: simpleDecrypt(data.ciphertext, GROUP_KEY),
          from: data.sender,
        }])
        break

      case 'private_message':
        const dmPartner = data.sender === user.username ? data.to : data.sender
        const dmText = simpleDecrypt(data.ciphertext, `${data.sender}-${data.to}-dm`)
        setPrivateMessages(prev => ({
          ...prev,
          [dmPartner]: [...(prev[dmPartner] || []), {
            ...data, text: dmText, from: data.sender,
          }]
        }))
        if (data.sender !== user.username) {
          setUnreadCounts(prev => ({
            ...prev,
            [data.sender]: (prev[data.sender] || 0) + 1
          }))
        }
        break

      case 'private_history':
        const dmHistory = data.messages.map(msg => ({
          ...msg,
          text: simpleDecrypt(
            msg.ciphertext,
            `${msg.sender_name}-${data.with}-dm`
          ),
          from: msg.sender_name,
        }))
        setPrivateMessages(prev => ({ ...prev, [data.with]: dmHistory }))
        break

      case 'typing':
        const room = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => ({ ...prev, [room]: data.from }))
        if (typingTimers.current[room]) clearTimeout(typingTimers.current[room])
        typingTimers.current[room] = setTimeout(() => {
          setTypingUsers(prev => { const u = { ...prev }; delete u[room]; return u })
        }, 3000)
        break

      case 'stop_typing':
        const stopRoom = data.room === 'general' ? 'general' : data.from
        setTypingUsers(prev => { const u = { ...prev }; delete u[stopRoom]; return u })
        break

      case 'pong':
        break

      default:
        break
    }
  }, [user?.username])

  const sendGroupMessage = useCallback((text) => {
    if (!ws.current || !text.trim()) return
    const ciphertext = simpleEncrypt(text, GROUP_KEY)
    ws.current.send(JSON.stringify({
      type: 'group_message',
      ciphertext,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }, [])

  const sendPrivateMessage = useCallback((toUsername, text) => {
    if (!ws.current || !text.trim()) return
    const key = `${user.username}-${toUsername}-dm`
    const ciphertext = simpleEncrypt(text, key)
    ws.current.send(JSON.stringify({
      type: 'private_message',
      to: toUsername,
      ciphertext,
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

  return {
    connected, onlineUsers, groupMessages,
    privateMessages, typingUsers, unreadCounts,
    sendGroupMessage, sendPrivateMessage,
    sendTyping, sendStopTyping,
    fetchPrivateHistory, clearUnread,
  }
}