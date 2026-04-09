import { useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import MarketOverview from './tabs/MarketOverview/index.jsx'
import Calculator from './tabs/Calculator/index.jsx'
import ResearchAssistant from './tabs/ResearchAssistant/index.jsx'
import GeographicMap from './tabs/GeographicMap/index.jsx'
import EnergyToggle from './components/ui/EnergyToggle.jsx'

const TABS = [
  {
    id: 'market',
    label: 'Market Overview',
    shortLabel: 'Market',
    icon: 'analytics',
    component: MarketOverview,
  },
  {
    id: 'economics',
    label: 'Project Economics',
    shortLabel: 'Economics',
    icon: 'calculate',
    component: Calculator,
  },
  {
    id: 'assistant',
    label: 'Research Assistant',
    shortLabel: 'Research',
    icon: 'auto_awesome',
    component: ResearchAssistant,
  },
  {
    id: 'map',
    label: 'Geographic Map',
    shortLabel: 'Map',
    icon: 'map',
    component: GeographicMap,
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Accessibility: skip to main content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* ── Glassmorphism Top Nav ──────────────────────────────────── */}
      <header
        className="glass-nav sticky top-0 z-50"
        role="banner"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3" aria-label="The Botanical Ledger">
            <div
              className="w-8 h-8 rounded-xl bg-botanical-gradient flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-white text-lg"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                eco
              </span>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-primary">
              The Botanical Ledger
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
            <EnergyToggle />
            <div
              className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface/50"
              aria-label="Live market data indicator"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
              Live Market Data
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
            Data: EIA Open Data API · NREL Developer API · Google Gemini AI · Mapbox
          </p>
        </div>
      </footer>
    </div>
  )
}
