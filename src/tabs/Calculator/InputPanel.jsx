import { useCallback } from 'react'
import useDashboardStore from '../../store/dashboardStore'
import ScenarioToggle from '../../components/ui/ScenarioToggle'
import InfoHint from '../../components/ui/InfoHint'

function InputField({ label, info, id, value, onChange, min, max, step = 'any', unit, hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label-caps flex items-center gap-1.5">
        {label}
        <InfoHint text={info} label={`${label} info`} />
        {unit && (
          <span className="ml-1 opacity-50 normal-case font-medium tracking-normal text-[9px]">
            ({unit})
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="input-botanical w-full"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <div className="absolute bottom-0 left-0 w-full h-px bg-outline-variant opacity-20 pointer-events-none" aria-hidden="true" />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-[10px] text-on-surface/40 font-medium">{hint}</p>
      )}
    </div>
  )
}

export default function InputPanel({ selectedStateAbbr, energyType = 'solar' }) {
  const inputs   = useDashboardStore((s) => s.calculatorInputs)
  const setInput = useDashboardStore((s) => s.setCalculatorInput)
  const reset    = useDashboardStore((s) => s.resetCalculatorToDefaults)
  const set = useCallback((key) => (val) => setInput(key, val), [setInput])

  return (
    <section
      className="bg-surface-container-high rounded-xl p-6 space-y-6"
      aria-label="Project input parameters"
    >
      {/* ── Top bar: title + scenario + reset ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="font-bold text-on-surface text-base uppercase tracking-wider">
            Input Parameters
          </h2>
          <p className="label-caps opacity-60">
            Configure {energyType === 'wind' ? 'wind' : 'solar'} project baseline assumptions
          </p>
          {selectedStateAbbr && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {selectedStateAbbr} data applied
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <ScenarioToggle />
          <button
            onClick={reset}
            className="py-2 px-4 rounded-xl border-2 border-primary text-primary text-xs font-extrabold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 whitespace-nowrap"
            aria-label="Reset all inputs to default values"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Row 1: Project Parameters (7 fields across full width) ── */}
      <fieldset>
        <legend className="label-caps text-primary border-b border-on-surface/5 pb-1 w-full block mb-4">
          Project Parameters
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-4">
          <InputField
            id="systemSizeKW" label="System Size"
            info="Nameplate project capacity used for production and capex sizing."
            value={inputs.systemSizeKW} onChange={set('systemSizeKW')}
            min={1} unit="kW"
          />
          <InputField
            id="capacityFactor" label="Capacity Factor"
            info="Share of theoretical maximum output produced annually. 0.20 means 20% utilization."
            value={inputs.capacityFactor} onChange={set('capacityFactor')}
            min={0.01} max={0.9} step={0.01} unit="decimal"
            hint="0.20 = 20% utilization"
          />
          <InputField
            id="degradationRate" label="Annual Degradation"
            info="Annual decline in system output due to panel aging."
            value={inputs.degradationRate} onChange={set('degradationRate')}
            min={0} max={0.05} step={0.001} unit="decimal / yr"
          />
          <InputField
            id="installCostPerW" label="Install Cost"
            info="Upfront installed cost per watt for initial project capex."
            value={inputs.installCostPerW} onChange={set('installCostPerW')}
            min={0.1} step={0.01} unit="$/W"
          />
          <InputField
            id="omCostPerKWPerYear" label="O&M Cost"
            info="Recurring yearly operations and maintenance cost per kW."
            value={inputs.omCostPerKWPerYear} onChange={set('omCostPerKWPerYear')}
            min={0} unit="$/kW/yr"
          />
          <InputField
            id="electricityRate" label="Electricity Rate"
            info="Revenue rate per kWh. Auto-seeded from EIA and updated by selected map state."
            value={inputs.electricityRate} onChange={set('electricityRate')}
            min={0.01} step={0.001} unit="$/kWh"
            hint="Auto-filled from EIA avg"
          />
          <InputField
            id="escalationRate" label="Price Escalation"
            info="Expected annual increase in electricity price and O&M assumptions."
            value={inputs.escalationRate} onChange={set('escalationRate')}
            min={0} max={0.1} step={0.001} unit="decimal / yr"
          />
        </div>
      </fieldset>

      {/* ── Row 2: Financing + Policy side by side ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-x-8 gap-y-6">

        {/* Financing */}
        <fieldset>
          <legend className="label-caps text-primary border-b border-on-surface/5 pb-1 w-full block mb-4">
            Financing
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <InputField
              id="debtFraction" label="Debt Fraction"
              info="Share of capex financed by debt; remainder is equity."
              value={inputs.debtFraction} onChange={set('debtFraction')}
              min={0} max={0.95} step={0.01} unit="decimal"
            />
            <InputField
              id="interestRate" label="Interest Rate"
              info="Loan interest rate used for annual debt service."
              value={inputs.interestRate} onChange={set('interestRate')}
              min={0} max={0.25} step={0.001} unit="decimal / yr"
            />
            <InputField
              id="loanTermYears" label="Loan Term"
              info="Number of years debt payments are modeled."
              value={inputs.loanTermYears} onChange={set('loanTermYears')}
              min={1} max={30} step={1} unit="years"
            />
            <InputField
              id="projectLifeYears" label="Project Life"
              info="Total operating life used for lifetime energy and cash flow calculations."
              value={inputs.projectLifeYears} onChange={set('projectLifeYears')}
              min={5} max={40} step={1} unit="years"
            />
          </div>
        </fieldset>

        {/* Vertical divider */}
        <div className="hidden md:block w-px bg-on-surface/5 self-stretch" aria-hidden="true" />

        {/* Policy & Tax */}
        <fieldset className="md:min-w-[240px]">
          <legend className="label-caps text-primary border-b border-on-surface/5 pb-1 w-full block mb-4">
            Policy &amp; Tax
          </legend>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <InputField
              id="itcPercent" label="ITC / Tax Credit"
              info="Investment Tax Credit percentage reducing year-0 equity outflow."
              value={inputs.itcPercent} onChange={set('itcPercent')}
              min={0} max={0.6} step={0.01} unit="decimal"
              hint="IRA rate = 0.30"
            />
            <InputField
              id="discountRate" label="Discount Rate"
              info="Required return used to discount future cash flows for NPV and LCOE."
              value={inputs.discountRate ?? 0.08} onChange={set('discountRate')}
              min={0.01} max={0.3} step={0.001} unit="decimal"
              hint="NPV & LCOE"
            />
          </div>
        </fieldset>

      </div>
    </section>
  )
}
