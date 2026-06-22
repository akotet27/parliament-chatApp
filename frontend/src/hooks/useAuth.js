// ═══════════════════════════════════════════════════════
// Authentication Hook
// Handles login, register, logout, token management
// Works with the E2E encryption system
// ═══════════════════════════════════════════════════════

import { useState, useCallback } from 'react'
import axios from 'axios'
import { setupEncryption, keyStore } from '../crypto/e2e'

const API = 'https://parliament-chatapp-1.onrender.com/api'// Axios instance with auth token
const api = axios.create({ baseURL: API })

// Attach token to every request automatically
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('parliament_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // ── REGISTER ──────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/register', {
        username:  formData.username,
        email:     formData.email,
        phone:     formData.phone,
        password:  formData.password,
      })
      return { success: true, message: res.data.message }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── LOGIN ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError('')
    try {
      // Step 1 — authenticate with server
      const res = await api.post('/login', { email, password })
      const { token, user: userData } = res.data

      // Step 2 — store token in sessionStorage only
      // sessionStorage clears when tab closes — no "remember me"
      sessionStorage.setItem('parliament_token', token)

      // Step 3 — generate ECDH key pair (the "half" of the key)
      const publicKeyBase64 = await setupEncryption()

      // Step 4 — upload public key to server
      await api.post('/keys/upload', { public_key: publicKeyBase64 })

      // Step 5 — set user state
      setUser({ ...userData, token })

      console.log('🔐 Login successful — E2E keys established')
      return { success: true, user: userData }

    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── LOGOUT ────────────────────────────────────────────
  const logout = useCallback(async (reason = 'manual') => {
    try {
      // Notify server
      await api.post('/logout').catch(() => {})
    } finally {
      // Clear EVERYTHING from memory
      keyStore.clear()
      sessionStorage.removeItem('parliament_token')
      sessionStorage.removeItem('parliament_user')
      setUser(null)
      setError('')
      console.log(`🔐 Logged out — reason: ${reason} — all keys cleared`)
    }
  }, [])

  // ── FETCH PUBLIC KEY of another user ──────────────────
  // Used by E2E system to derive shared key
  const fetchPublicKey = useCallback(async (username) => {
    try {
      const res = await api.get(`/keys/${username}`)
      return res.data.public_key
    } catch {
      return null
    }
  }, [])

  // ── GET CURRENT USER from server ──────────────────────
  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/me')
      const token = sessionStorage.getItem('parliament_token')
      const userData = { ...res.data, token }
      setUser(userData)
      return userData
    } catch {
      logout('session_expired')
      return null
    }
  }, [logout])

  // ── APPROVE USER (admin only) ─────────────────────────
  const approveUser = useCallback(async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.detail }
    }
  }, [])

  // ── SUSPEND USER (admin only) ─────────────────────────
  const suspendUser = useCallback(async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.detail }
    }
  }, [])

  // ── GET ALL USERS (admin only) ────────────────────────
  const getAllUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users')
      return res.data
    } catch {
      return []
    }
  }, [])

  return {
    user,
    loading,
    error,
    setError,
    register,
    login,
    logout,
    fetchMe,
    fetchPublicKey,
    approveUser,
    suspendUser,
    getAllUsers,
    api,
    isAdmin: user?.role === 'admin',
    isMember: user?.role === 'member',
    isPending: user?.role === 'pending',
    isSuspended: user?.role === 'suspended',
  }
}