// ═══════════════════════════════════════════════════════
// Inactivity Warning Popup
// Shows 30 seconds before auto logout
// ═══════════════════════════════════════════════════════

import { AlertTriangle, LogOut, Activity } from 'lucide-react'

function InactivityWarning({ timeLeft, onStayLoggedIn, onLogoutNow }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>

      {/* Warning card */}
      <div className="relative w-full max-w-sm bg-gray-900 rounded-2xl border border-red-500/50 shadow-2xl overflow-hidden">

        {/* Red top bar */}
        <div className="h-1.5 bg-red-500 animate-pulse"/>

        <div className="p-6">

          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400"/>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                Session Expiring
              </h2>
              <p className="text-gray-400 text-sm">
                Parliamentary session security
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            You have been inactive. For security, your session will
            automatically terminate in:
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-8 py-4 text-center">
              <span className="text-5xl font-black text-red-400 font-mono">
                {timeLeft}
              </span>
              <p className="text-red-400/70 text-xs mt-1 uppercase tracking-wider">
                seconds remaining
              </p>
            </div>
          </div>

          {/* Warning note */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-5">
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              ⚠️ All encryption keys will be cleared from memory on logout.
              You will need to enter your password again to re-establish
              secure communications.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onStayLoggedIn}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all bg-green-600 hover:bg-green-500 text-white"
            >
              <Activity className="w-4 h-4"/>
              I'm still here
            </button>
            <button
              onClick={onLogoutNow}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gray-700 hover:bg-gray-600 text-gray-300"
            >
              <LogOut className="w-4 h-4"/>
              Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default InactivityWarning