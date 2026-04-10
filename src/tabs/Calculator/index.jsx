import { useState, useCallback, useMemo } from 'react'
import useDashboardStore from '../../store/dashboardStore'
import { useCalculator } from '../../hooks/useCalculator'
import InputPanel from './InputPanel'
import OutputPanel from './OutputPanel'
import CashFlowSection from './CashFlowSection'
import SensitivityHeatmap from './SensitivityHeatmap'
import DebtSchedule from './DebtSchedule'
import ScenarioComparison from './ScenarioComparison'
import MemoModal from './MemoModal'
import { generateInvestmentMemo } from '../../lib/geminiClient'
import { computeEsg } from '../../lib/esgCalc'
import { useSavedScenarios } from '../../hooks/useSavedScenarios'

export default function Calculator({ onNavigate }) {
  const { inputs, results } = useCalculator()
  const selectedStateAbbr = useDashboardStore((s) => s.selectedStateAbbr)
  const energyType        = useDashboardStore((s) => s.energyType)
  const selectedState     = useDashboardStore((s) => s.selectedState)
  const nationalElectricityPrice = useDashboardStore((s) => s.nationalElectricityPrice)
  const totalSolarCapacityGW     = useDashboardStore((s) => s.totalSolarCapacityGW)
  const totalWindCapacityGW      = useDashboardStore((s) => s.totalWindCapacityGW)
  const treasury10Y              = useDashboardStore((s) => s.treasury10Y)
  const fedFunds                 = useDashboardStore((s) => s.fedFunds)
  const breakEvenInflation       = useDashboardStore((s) => s.breakEvenInflation)

  const esg = useMemo(
    () => computeEsg(inputs, selectedState?.abbr),
    [inputs, selectedState?.abbr],
  )

  // ── Memo ──────────────────────────────────────────────────────────────────
  const [showMemo, setShowMemo]         = useState(false)
  const [memo, setMemo]                 = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateMemo = useCallback(async () => {
    setMemo(null)
    setShowMemo(true)
    setIsGenerating(true)
    try {
      const text = await generateInvestmentMemo({
        energyType,
        selectedState,
        nationalElectricityPrice,
        totalSolarCapacityGW,
        totalWindCapacityGW,
        irr:               results.irr,
        npv:               results.npv,
        lcoe:              results.lcoe,
        payback:           results.payback,
        scenario:          inputs.scenario,
        systemSizeKW:      inputs.systemSizeKW,
        capacityFactor:    inputs.capacityFactor,
        installCostPerW:   inputs.installCostPerW,
        omCostPerKWPerYear: inputs.omCostPerKWPerYear,
        debtFraction:      inputs.debtFraction,
        itcPercent:        inputs.itcPercent,
        projectLifeYears:  inputs.projectLifeYears,
        treasury10Y,
        fedFunds,
        breakEvenInflation,
        esg,
        useMacrs:         inputs.useMacrs,
        corporateTaxRate: inputs.corporateTaxRate,
      })
      setMemo(text)
    } catch {
      setMemo('Failed to generate memo. Please check your Gemini API key and try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [energyType, selectedState, nationalElectricityPrice, totalSolarCapacityGW, totalWindCapacityGW, treasury10Y, fedFunds, breakEvenInflation, inputs, results])

  const handleCopy = useCallback(() => {
    if (memo) navigator.clipboard.writeText(memo)
  }, [memo])

  // ── Saved scenarios ───────────────────────────────────────────────────────
  const { scenarios, saveScenario, deleteScenario, clearAll } = useSavedScenarios()
  const [savedFlash, setSavedFlash] = useState(false)

  const handleSaveScenario = useCallback(() => {
    const statePart = selectedState?.name ?? 'U.S.'
    const techPart  = energyType === 'wind' ? 'Wind' : 'Solar'
    const sizePart  = `${inputs.systemSizeKW.toLocaleString()} kW`

    saveScenario({
      id:             Date.now().toString(),
      name:           `${techPart} · ${statePart} · ${sizePart}`,
      timestamp:      new Date().toISOString(),
      // Config
      energyType,
      stateName:      selectedState?.name ?? null,
      stateAbbr:      selectedState?.abbr ?? null,
      scenario:       inputs.scenario,
      // Key inputs
      systemSizeKW:   inputs.systemSizeKW,
      capacityFactor: inputs.capacityFactor,
      installCostPerW: inputs.installCostPerW,
      itcPercent:     inputs.itcPercent,
      debtFraction:   inputs.debtFraction,
      useMacrs:       inputs.useMacrs,
      corporateTaxRate: inputs.corporateTaxRate,
      // Results
      irr:     results.irr,
      npv:     results.npv,
      lcoe:    results.lcoe,
      payback: results.payback,
      // ESG
      co2Tonnes: esg.co2Tonnes,
      esgGrade:  esg.grade,
    })

    // Brief confirmation flash
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }, [energyType, selectedState, inputs, results, esg, saveScenario])

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────────── */}
      <section
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        aria-labelledby="calculator-heading"
      >
        <div>
          <h1
            id="calculator-heading"
            className="text-4xl font-extrabold text-on-surface tracking-tight"
          >
            Project Economics
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            {energyType === 'wind' ? 'Wind' : 'Solar'} investment return modeling · Instant recalculation
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Save Scenario */}
          <button
            onClick={handleSaveScenario}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-extrabold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              savedFlash
                ? 'border-primary bg-primary text-on-primary'
                : 'border-primary text-primary hover:bg-primary hover:text-on-primary'
            }`}
            aria-label="Save current scenario snapshot"
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: `'FILL' ${savedFlash ? 1 : 0}` }}
            >
              {savedFlash ? 'check_circle' : 'bookmark_add'}
            </span>
            {savedFlash ? 'Saved!' : 'Save Scenario'}
          </button>

          {/* Generate Memo */}
          <button
            onClick={handleGenerateMemo}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-extrabold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-botanical disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Generate AI investment memo"
          >
            <span className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            {isGenerating ? 'Generating…' : 'Generate Memo'}
          </button>

          {selectedStateAbbr && (
            <div
              className="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-2 rounded-xl text-xs font-bold"
              role="status"
              aria-live="polite"
            >
              <span
                className="material-symbols-outlined text-sm"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              {selectedStateAbbr} data applied from Map
              <button
                onClick={() => onNavigate?.(3)}
                className="underline underline-offset-2 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current rounded"
                aria-label="Go to Geographic Map tab"
              >
                Change →
              </button>
            </div>
          )}
        </div>
      </section>

      {showMemo && (
        <MemoModal
          memo={memo}
          isGenerating={isGenerating}
          onClose={() => setShowMemo(false)}
          onCopy={handleCopy}
          printMeta={{
            projectName: `${inputs.systemSizeKW.toLocaleString()} kW ${energyType === 'wind' ? 'Wind' : 'Solar'} — ${selectedState?.name ?? 'U.S.'}`,
            state: selectedState ? `${selectedState.name} (${selectedState.abbr})` : 'U.S. (no state selected)',
            energyType,
          }}
        />
      )}

      {/* ── Inputs ───────────────────────────────────────────────── */}
      <InputPanel selectedStateAbbr={selectedStateAbbr} energyType={energyType} />

      {/* ── Outputs + Cash Flow ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <OutputPanel results={results} inputs={inputs} />
        </div>
        <div className="lg:col-span-8 min-h-[520px]">
          <CashFlowSection
            cashFlows={results.cashFlows}
            projectLifeYears={inputs.projectLifeYears}
          />
        </div>
      </div>

      <SensitivityHeatmap inputs={inputs} />

      {/* ── Debt Schedule ────────────────────────────────────────── */}
      <DebtSchedule inputs={inputs} />

      {/* ── Scenario Comparison ──────────────────────────────────── */}
      <ScenarioComparison
        scenarios={scenarios}
        onDelete={deleteScenario}
        onClearAll={clearAll}
      />

      {/* ── Methodology Note ─────────────────────────────────────── */}
      <section
        className="bg-surface-container-highest rounded-xl p-5 border-l-4 border-primary"
        aria-label="Calculation methodology"
      >
        <p className="label-caps text-primary mb-1">Methodology</p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          IRR solved via bisection. NPV discounted at user-specified rate.
          LCOE = (discounted lifetime costs − MACRS tax shields) / (discounted lifetime energy).
          Cash flows modeled as equity perspective — Year 0 is net equity outflow after ITC.{' '}
          {inputs.useMacrs
            ? `MACRS: IRS 5-year schedule (20/32/19.2/11.52/11.52/5.76%) applied to depreciable basis of $${((inputs.systemSizeKW * 1000 * inputs.installCostPerW) * (1 - 0.5 * inputs.itcPercent) / 1_000_000).toFixed(2)}M (CapEx less 50% of ITC per §168(k)). Tax shields at ${((inputs.corporateTaxRate ?? 0.21) * 100).toFixed(0)}% corporate rate added to cash flows in years 1–6.`
            : 'MACRS depreciation is currently disabled.'}
          {' '}Capacity factor and electricity rate auto-fill from Geographic Map or EIA national average.
        </p>
      </section>

    </div>
  )
}
