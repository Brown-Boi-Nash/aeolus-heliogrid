import { useState, useRef, useEffect, useCallback } from 'react'
import useDashboardStore from '../../store/dashboardStore'
import { useCalculator } from '../../hooks/useCalculator'
import { sendGeminiMessage } from '../../lib/geminiClient'
import MessageBubble from './MessageBubble'
import SuggestedQuestions from './SuggestedQuestions'
import { SCENARIO_MULTIPLIERS } from '../../constants/financialDefaults'
import { applyScenario } from '../../lib/financialCalc'

// Citations to inject based on keywords in the response
function extractCitations(text) {
  const citations = []
  if (/EIA|electricity price|retail/i.test(text))   citations.push('EIA Open Data')
  if (/NREL|PVWatts|irradiance|GHI|capacity factor/i.test(text)) citations.push('NREL NSRDB')
  if (/ITC|IRA|Inflation Reduction|tax credit/i.test(text)) citations.push('IRS / IRA 2022')
  if (/LCOE|levelized/i.test(text))                 citations.push('NREL ATB 2024')
  if (/IRR|NPV|payback|cash flow/i.test(text))      citations.push('Calculator (live)')
  return [...new Set(citations)]
}

export default function ResearchAssistant() {
  const [inputText, setInputText]   = useState('')
  const messagesEndRef              = useRef(null)
  const textareaRef                 = useRef(null)

  const chatMessages  = useDashboardStore((s) => s.chatMessages)
  const isChatLoading = useDashboardStore((s) => s.isChatLoading)
  const addMessage    = useDashboardStore((s) => s.addChatMessage)
  const setLoading    = useDashboardStore((s) => s.setChatLoading)
  const clearChat     = useDashboardStore((s) => s.clearChat)

  // Gather live context from store
  const nationalElectricityPrice = useDashboardStore((s) => s.nationalElectricityPrice)
  const totalSolarCapacityGW     = useDashboardStore((s) => s.totalSolarCapacityGW)
  const totalWindCapacityGW      = useDashboardStore((s) => s.totalWindCapacityGW)
  const energyType               = useDashboardStore((s) => s.energyType)
  const selectedState            = useDashboardStore((s) => s.selectedState)
  const { inputs, results }      = useCalculator()

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isChatLoading])

  const buildContext = useCallback(() => {
    const multipliers = SCENARIO_MULTIPLIERS[inputs.scenario] ?? SCENARIO_MULTIPLIERS.base
    const adjusted    = applyScenario(inputs, multipliers)
    return {
      nationalElectricityPrice,
      totalSolarCapacityGW,
      totalWindCapacityGW,
      energyType,
      irr:          results.irr,
      npv:          results.npv,
      lcoe:         results.lcoe,
      payback:      results.payback,
      scenario:     inputs.scenario,
      systemSizeKW: adjusted.systemSizeKW,
      capacityFactor: adjusted.capacityFactor,
      selectedState,
    }
  }, [nationalElectricityPrice, totalSolarCapacityGW, totalWindCapacityGW, energyType, inputs, results, selectedState])

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? inputText).trim()
    if (!trimmed || isChatLoading) return

    setInputText('')

    // Add user message
    addMessage({ role: 'user', text: trimmed, timestamp: Date.now() })
    setLoading(true)

    try {
      const responseText = await sendGeminiMessage(trimmed, buildContext())
      const citations    = extractCitations(responseText)
      addMessage({ role: 'assistant', text: responseText, citations, timestamp: Date.now() })
    } catch (err) {
      console.error('Gemini error:', err)
      addMessage({
        role: 'assistant',
        text: `Unable to reach Gemini AI. Error: ${err?.message ?? 'Unknown error'}. Check your API key in \`.env.local\`.`,
        citations: [],
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }, [inputText, isChatLoading, addMessage, setLoading, buildContext])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isEmpty = chatMessages.length === 0

  return (
    <div className="animate-fade-in h-[70vh] min-h-[520px] md:h-[calc(100vh-220px)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full rounded-xl overflow-hidden shadow-botanical">

        {/* ── Chat Area ─────────────────────────────────────────────── */}
        <section
          className="lg:col-span-8 flex flex-col bg-surface-container-low"
          aria-label="Chat conversation"
        >
          {/* Chat header */}
          <div className="glass-nav px-6 py-4 flex items-center justify-between border-b border-on-surface/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-botanical-gradient flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h1 className="font-bold text-on-surface text-sm">Research Assistant</h1>
                <p className="label-caps opacity-60">
                  Powered by Gemini 2.5 Flash Lite · {energyType === 'wind' ? 'Wind' : 'Solar'} mode
                </p>
              </div>
            </div>
            {chatMessages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error rounded px-2 py-1"
                aria-label="Clear chat history"
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-6 scrollbar-botanical"
            role="list"
            aria-label="Chat messages"
            aria-live="polite"
          >
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-botanical-gradient flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface mb-1">Ask about your investment</h2>
                  <p className="text-sm text-on-surface-variant max-w-sm">
                    I have access to your live EIA data, map resource context, and current calculator scenario.
                    {' '}
                    Try a question from the panel →
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {chatMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                {isChatLoading && (
                  <div className="flex gap-3 max-w-3xl" role="status" aria-label="Assistant is typing">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center opacity-60 animate-pulse-soft">
                      <span className="material-symbols-outlined text-white text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div className="bg-surface-container-highest/40 px-5 py-3 rounded-2xl rounded-tl-none text-xs italic text-on-surface/50 self-start">
                      Analyzing with live market data…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-surface-container-low border-t border-on-surface/5">
            <div
              className="relative bg-surface-container-lowest rounded-2xl p-2 shadow-chat focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
              role="form"
              aria-label="Message input"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about LCOE, IRR, ITC policy, state solar resources…"
                  rows={1}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 px-2 resize-none scrollbar-botanical max-h-32 min-h-[44px] text-on-surface placeholder:text-on-surface/30"
                  aria-label="Chat message input. Press Enter to send, Shift+Enter for new line."
                  aria-multiline="true"
                  disabled={isChatLoading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim() || isChatLoading}
                  className="bg-primary hover:bg-primary-container text-on-primary w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 shadow-botanical disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 flex-shrink-0"
                  aria-label="Send message"
                >
                  <span className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
              <div className="flex justify-between items-center px-2 pt-1.5 mt-1 border-t border-on-surface/5">
                <span className="chip-positive bg-tertiary-fixed text-on-tertiary-fixed-variant">
                  Gemini 2.5 Flash Lite
                </span>
                <span className="text-[9px] font-bold text-on-surface/30 uppercase tracking-widest">
                  Shift+Enter for new line
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Context Sidebar ────────────────────────────────────────── */}
        <aside
          className="lg:col-span-4 bg-surface-container-high p-5 flex flex-col gap-6 overflow-y-auto scrollbar-botanical border-l border-on-surface/5"
          aria-label="Active data context and suggested questions"
        >
          {/* Live Context Feed */}
          <div>
            <h2 className="label-caps mb-3">Active Context Feed</h2>
            <div className="space-y-2.5">
              <ContextCard
                title="Calculator Scenario"
                value={inputs.scenario.charAt(0).toUpperCase() + inputs.scenario.slice(1)}
                sub={`${energyType === 'wind' ? 'Wind' : 'Solar'} · ${results.irr != null ? `IRR: ${(results.irr * 100).toFixed(1)}%` : 'IRR: not calculated'}`}
                accent
              />
              {nationalElectricityPrice && (
                <ContextCard
                  title="EIA Electricity Price"
                  value={`$${nationalElectricityPrice.toFixed(3)}/kWh`}
                  sub="U.S. National Average"
                />
              )}
              {selectedState && (
                <ContextCard
                  title={`${selectedState.name} on Map`}
                  value={energyType === 'wind'
                    ? `Wind ${selectedState.windSpeed?.toFixed(2) ?? '—'} m/s`
                    : `GHI ${selectedState.ghi?.toFixed(2)} kWh/m²/day`}
                  sub={selectedState.capacityFactor
                    ? `Cap. Factor: ${(selectedState.capacityFactor * 100).toFixed(1)}%`
                    : 'Click "Use in Calculator" on map'}
                />
              )}
              {results.lcoe != null && (
                <ContextCard
                  title="Project LCOE"
                  value={`$${results.lcoe.toFixed(4)}/kWh`}
                  sub={results.lcoe < 0.05 ? 'Grid parity achieved' : 'Above utility avg.'}
                />
              )}
            </div>
          </div>

          {/* Suggested Questions */}
          <div>
            <h2 className="label-caps mb-3">Suggested Questions</h2>
            <SuggestedQuestions onSelect={sendMessage} />
          </div>

          <div>
            <h2 className="label-caps mb-3">Data Provenance</h2>
            <div className="space-y-2">
              {[
                'EIA Open Data API (market pricing, capacity)',
                'NREL NSRDB + PVWatts (irradiance, capacity factor)',
                'Calculator state (IRR, NPV, LCOE, payback)',
                'Gemini 2.5 Flash Lite (grounded response synthesis)',
              ].map((line) => (
                <div key={line} className="bg-surface-container-lowest rounded-lg px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/65">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}

function ContextCard({ title, value, sub, accent }) {
  return (
    <div className={`p-4 rounded-xl shadow-sm ${accent ? 'bg-surface-container-lowest border-l-4 border-primary' : 'bg-surface-container-lowest'}`}>
      <p className="label-caps text-primary mb-0.5">{title}</p>
      <p className="text-base font-extrabold text-on-surface tabular-nums">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant mt-0.5 italic">{sub}</p>}
    </div>
  )
}
