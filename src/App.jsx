import { useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import MarketOverview from './tabs/MarketOverview/index.jsx'
import Calculator from './tabs/Calculator/index.jsx'
import ResearchAssistant from './tabs/ResearchAssistant/index.jsx'
import GeographicMap from './tabs/GeographicMap/index.jsx'

const TABS = [
  {
    label: 'Market Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    component: MarketOverview,
  },
  {
    label: 'Project Economics',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    component: Calculator,
  },
  {
    label: 'Research Assistant',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    component: ResearchAssistant,
  },
  {
    label: 'Geographic Map',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    component: GeographicMap,
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-energy-500">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  U.S. Renewable Energy
                </h1>
                <p className="text-xs text-slate-500 leading-tight">Investment Dashboard</p>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Live data from EIA · NREL · Gemini AI
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tab.List className="flex gap-0 -mb-px">
              {TABS.map((tab, idx) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) =>
                    clsx(
                      'flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors focus:outline-none whitespace-nowrap',
                      selected
                        ? 'border-energy-500 text-energy-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    )
                  }
                >
                  {tab.icon}
                  {tab.label}
                </Tab>
              ))}
            </Tab.List>
          </div>
        </div>

        {/* Tab Content */}
        <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tab.Panels>
            {TABS.map((tab) => (
              <Tab.Panel key={tab.label} className="animate-fade-in">
                <tab.component onNavigate={setActiveTab} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </main>
      </Tab.Group>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          Data sources: EIA Open Data API · NREL Developer API · Google Gemini AI
        </div>
      </footer>
    </div>
  )
}
