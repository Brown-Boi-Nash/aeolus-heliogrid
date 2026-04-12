import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'aeolusHelioGrid_tourSeen'

/**
 * WelcomeModal — shown once to first-time visitors.
 * Asks whether they want a tour. "Skip" persists the choice to localStorage.
 */
export default function WelcomeModal({ onStartTour, onSkip }) {
  const skipRef = useRef(null)

  // Trap focus within the modal while it's open
  useEffect(() => {
    skipRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-desc"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Card */}
      <div className="relative bg-surface-container rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-6 animate-fade-in">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-botanical-gradient flex items-center justify-center shadow-lg">
          <span
            className="material-symbols-outlined text-white text-4xl"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            aria-hidden="true"
          >
            wind_power
          </span>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h2
            id="welcome-title"
            className="text-2xl font-extrabold text-primary tracking-tight mb-2"
          >
            Welcome to Aeolus HelioGrid
          </h2>
          <p id="welcome-desc" className="text-sm text-on-surface/70 leading-relaxed">
            A U.S. renewable energy investment dashboard with live market data,
            project economics, AI analysis, and geographic insights.
          </p>
          <p className="mt-2 text-sm text-on-surface/60">
            Would you like a quick tour of the key features?
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onStartTour}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm tracking-wide hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              tour
            </span>
            Take the Tour
          </button>

          <button
            ref={skipRef}
            onClick={onSkip}
            className="flex-1 px-5 py-3 rounded-xl border border-on-surface/20 text-on-surface/60 font-semibold text-sm hover:bg-on-surface/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-surface/40 focus-visible:ring-offset-2"
          >
            Skip for now
          </button>
        </div>

        <p className="text-[10px] text-on-surface/40 text-center">
          You can revisit this tour any time from the menu.
        </p>
      </div>
    </div>
  )
}

export { STORAGE_KEY }
