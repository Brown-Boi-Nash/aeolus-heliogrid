import { useState, useCallback } from 'react'
import { Tab } from '@headlessui/react'
import { Joyride, STATUS } from 'react-joyride'
import clsx from 'clsx'
import MarketOverview from './tabs/MarketOverview/index.jsx'
import Calculator from './tabs/Calculator/index.jsx'
import ResearchAssistant from './tabs/ResearchAssistant/index.jsx'
import GeographicMap from './tabs/GeographicMap/index.jsx'
import EnergyToggle from './components/ui/EnergyToggle.jsx'
import WelcomeModal, { STORAGE_KEY } from './components/onboarding/WelcomeModal.jsx'
import { TOUR_STEPS } from './components/onboarding/tourSteps.js'

const TABS = [
  {
    id: 'market',
    label: 'Market Overview',
    shortLabel: 'Market',
    icon: 'analytics',
    tourAttr: 'tab-market',
    component: MarketOverview,
  },
  {
    id: 'economics',
    label: 'Project Economics',
    shortLabel: 'Economics',
    icon: 'calculate',
    tourAttr: 'tab-economics',
    component: Calculator,
  },
  {
    id: 'assistant',
    label: 'Research Assistant',
    shortLabel: 'Research',
    icon: 'auto_awesome',
    tourAttr: 'tab-assistant',
    component: ResearchAssistant,
  },
  {
    id: 'map',
    label: 'Geographic Map',
    shortLabel: 'Map',
    icon: 'map',
    tourAttr: 'tab-map',
    component: GeographicMap,
  },
]

// Joyride custom styles — match the dashboard design system
const JOYRIDE_STYLES = {
  options: {
    primaryColor: 'var(--color-primary, #2d6a4f)',
    backgroundColor: 'var(--color-surface-container, #f4f9f6)',
    textColor: 'var(--color-on-surface, #1b2e25)',
    arrowColor: 'var(--color-surface-container, #f4f9f6)',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '16px',
    padding: '20px 24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    maxWidth: 360,
  },
  tooltipTitle: {
    fontSize: '15px',
    fontWeight: 800,
    letterSpacing: '-0.01em',
    marginBottom: '8px',
  },
  tooltipContent: {
    fontSize: '13px',
    lineHeight: '1.6',
  },
  buttonNext: {
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '13px',
    padding: '8px 18px',
  },
  buttonBack: {
    color: 'var(--color-on-surface, #1b2e25)',
    fontWeight: 600,
    fontSize: '13px',
  },
  buttonSkip: {
    color: 'var(--color-on-surface, #1b2e25)',
    fontSize: '12px',
  },
  spotlight: {
    borderRadius: '12px',
  },
}

function hasSeenTour() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markTourSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {}
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0)

  // Welcome modal: show if the user hasn't seen the tour yet
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenTour())
  const [runTour, setRunTour] = useState(false)

  const handleStartTour = useCallback(() => {
    markTourSeen()
    setShowWelcome(false)
    setRunTour(true)
  }, [])

  const handleSkip = useCallback(() => {
    markTourSeen()
    setShowWelcome(false)
  }, [])

  const handleRestartTour = useCallback(() => {
    setRunTour(false)
    // Small delay to let Joyride reset before re-running
    setTimeout(() => setRunTour(true), 50)
  }, [])

  const handleJoyrideCallback = useCallback(({ status }) => {
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* First-time welcome prompt */}
      {showWelcome && (
        <WelcomeModal onStartTour={handleStartTour} onSkip={handleSkip} />
      )}

      {/* Guided tour */}
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        styles={JOYRIDE_STYLES}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Done',
          next: 'Next',
          skip: 'Skip tour',
        }}
        callback={handleJoyrideCallback}
      />

      {/* Accessibility: skip to main content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* ── Glassmorphism Top Nav ──────────────────────────────────── */}
      <header className="glass-nav sticky top-0 z-50" role="banner">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center gap-3"
            aria-label="Aeolus HelioGrid"
            data-tour="brand"
          >
            <div
              className="w-8 h-8 rounded-xl bg-botanical-gradient flex items-center justify-center"
              aria-hidden="true"
            >
              <span
                className="material-symbols-outlined text-white text-lg"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
              >
                wind_power
              </span>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-primary">
              Aeolus HelioGrid
            </span>
          </div>

          {/* Desktop Tab Nav */}
          <Tab.Group
            as="nav"
            selectedIndex={activeTab}
            onChange={setActiveTab}
            aria-label="Dashboard sections"
            className="hidden md:flex items-center gap-6"
          >
            <Tab.List className="flex items-center gap-1">
              {TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  data-tour={tab.tourAttr}
                  className={({ selected }) =>
                    clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest transition-colors duration-200 rounded-lg',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      selected
                        ? 'text-primary border-b-2 border-primary rounded-none pb-1'
                        : 'text-on-surface/60 hover:text-primary'
                    )
                  }
                >
                  <span
                    className="material-symbols-outlined text-base leading-none"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </Tab>
              ))}
            </Tab.List>

            {/* Tab Panels — full width below nav */}
            <Tab.Panels
              as="main"
              id="main-content"
              className="hidden"
              aria-live="polite"
            />
          </Tab.Group>

          <div className="hidden lg:flex items-center gap-4">
            <div data-tour="energy-toggle">
              <EnergyToggle />
            </div>

            {/* Live data badge + Tour trigger */}
            <div className="hidden lg:flex items-center gap-3">
              <div
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface/50"
                aria-label="Live market data indicator"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
                Live Market Data
              </div>

              {/* Tour restart button */}
              <button
                onClick={handleRestartTour}
                title="Restart tour"
                aria-label="Restart guided tour"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-on-surface/40 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                  aria-hidden="true"
                >
                  tour
                </span>
                Tour
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Tab Shell ─────────────────────────────────────────── */}
      <Tab.Group as="div" className="flex-1 flex flex-col" selectedIndex={activeTab} onChange={setActiveTab}>
        {/* Mobile Tab Bar */}
        <Tab.List
          as="nav"
          aria-label="Dashboard sections"
          className="md:hidden flex border-b border-on-surface/5 bg-surface-container-low overflow-x-auto scrollbar-botanical"
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                clsx(
                  'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-2 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  selected
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface/50 hover:text-primary'
                )
              }
            >
              <span
                className="material-symbols-outlined text-lg"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
              >
                {tab.icon}
              </span>
              {tab.shortLabel}
            </Tab>
          ))}
        </Tab.List>

        {/* Tab Content */}
        <Tab.Panels as="main" id="main-content" className="flex-1" aria-live="polite">
          {TABS.map((tab) => (
            <Tab.Panel
              key={tab.id}
              className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in"
              tabIndex={-1}
            >
              <tab.component onNavigate={setActiveTab} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="bg-surface-container-high py-3"
        role="contentinfo"
        aria-label="Data attribution"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
            Data: EIA Open Data API · NREL Developer API · Google Gemini AI · Mapbox · FRED
          </p>
        </div>
      </footer>
    </div>
  )
}
