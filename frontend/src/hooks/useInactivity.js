// ═══════════════════════════════════════════════════════
// Inactivity Monitor — Auto logout after 2 minutes
//
// Tracks: mouse movement, clicks, keyboard, scrolling
// At 1:30 → shows warning popup
// At 2:00 → forces logout, clears all keys
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react'

const TIMEOUT_MS      = 2 * 60 * 1000   // 2 minutes
const WARNING_MS      = 30 * 1000        // warn at 30 seconds left
const TICK_INTERVAL   = 1000             // update every second

export function useInactivity(onLogout, isActive = true) {
  const [secondsLeft, setSecondsLeft]     = useState(120)
  const [showWarning, setShowWarning]     = useState(false)
  const [isExpired, setIsExpired]         = useState(false)

  const timerRef        = useRef(null)
  const tickRef         = useRef(null)
  const lastActivityRef = useRef(Date.now())

  // ── Reset the timer on any activity ─────────────────
  const resetTimer = useCallback(() => {
    if (!isActive) return
    lastActivityRef.current = Date.now()
    setSecondsLeft(120)
    setShowWarning(false)
    setIsExpired(false)
  }, [isActive])

  // ── Force logout immediately ─────────────────────────
  const forceLogout = useCallback(() => {
    clearTimeout(timerRef.current)
    clearInterval(tickRef.current)
    setIsExpired(true)
    setShowWarning(false)
    onLogout()
  }, [onLogout])

  // ── Start monitoring ─────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    // Activity events to watch
    const events = [
      'mousemove', 'mousedown', 'keydown',
      'touchstart', 'scroll', 'click', 'keypress'
    ]

    const handleActivity = () => resetTimer()

    // Attach all event listeners
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))

    // Countdown tick — updates every second
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current
      const remaining = Math.max(0, Math.ceil((TIMEOUT_MS - elapsed) / 1000))

      setSecondsLeft(remaining)

      // Show warning at 30 seconds left
      if (remaining <= WARNING_MS / 1000 && remaining > 0) {
        setShowWarning(true)
      }

      // Logout when time is up
      if (remaining === 0) {
        forceLogout()
      }
    }, TICK_INTERVAL)

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity))
      clearInterval(tickRef.current)
      clearTimeout(timerRef.current)
    }
  }, [isActive, resetTimer, forceLogout])

  // Format seconds as MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return {
    secondsLeft,
    timeLeft: formatTime(secondsLeft),
    showWarning,
    isExpired,
    resetTimer,
    forceLogout,
  }
}