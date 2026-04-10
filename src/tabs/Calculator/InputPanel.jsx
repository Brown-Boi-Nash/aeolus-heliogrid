import { useCallback } from 'react'
import useDashboardStore from '../../store/dashboardStore'
import { useFredData } from '../../hooks/useFredData'
import ScenarioToggle from '../../components/ui/ScenarioToggle'
import InfoHint from '../../components/ui/InfoHint'

/** Round a float to `dp` decimal places for display, without affecting stored precision. */
function round(val, dp = 4) {
  return parseFloat((val ?? 0).toFixed(dp))
}

function InputField({ label, info, id, value, onChange, min, max, step = 'any', unit, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label-caps flex items-center gap-1.5">
        {label}
        <InfoHint text={info} label={`${label} info`} />
        {unit && (
          <span className="ml-1 opacity-50 normal-case font-medium tracking-normal text-[9px]">
            ({unit})
          </span>
        )}
      </label>
      <div className="relative flex-1">
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
      <p id={hint ? `${id}-hint` : undefined} className="text-[10px] text-on-surface/40 font-medium min-h-[14px]">
        {hint ?? ''}
      </p>
    </div>
  )
}

function MacrsToggle({ checked, onChange, info }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="label-caps flex items-center gap-1.5">
        MACRS Depreciation
        <InfoHint text={info} label="MACRS info" />
      </span>
      {/* Toggle aligned to match input box height */}
      <div className="flex items-center h-[42px]">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={onChange}
          className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            checked ? 'bg-primary' : 'bg-on-surface/20'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <p className="text-[10px] text-on-surface/40 font-medium min-h-[14px]">
        {checked ? 'On — tax shields in yrs 1–6' : 'Off — no depreciation benefit'}
      </p>
    </div>
  )
}

export default function InputPanel({ selectedStateAbbr, energyType = 'solar' }) {
  const inputs   = useDashboardStore((s) => s.calculatorInputs)
  const setInput = useDashboardStore((s) => s.setCalculatorInput)
  const reset    = useDashboardStore((s) => s.resetCalculatorToDefaults)
  const set = useCallback((key) => (val) => setInput(key, val), [setInput])

  useFredData()
  const treasury10Y        = useDashboardStore((s) => s.treasury10Y)
  const fedFunds           = useDashboardStore((s) => s.fedFunds)
  const breakEvenInflation = useDashboardStore((s) => s.breakEvenInflation)

  return (
    <section
      className="bg-surface-container-high rounded-xl p-6 space-y-6"
      aria-label="Project input parameters"
    >
      {/* ── Header bar ───────────────────────────────────────────────── */}
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

      {/* ── Row 1: Project Parameters ────────────────────────────────── */}
      <fieldset>
        <legend className="label-caps text-primary border-b border-on-surface/5 pb-1 w-full block mb-4">
          Project Parameters
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-2">
          <InputField
            id="systemSizeKW" label="System Size"
            info="Nameplate project capacity used for production and capex sizing."
            value={inputs.systemSizeKW} onChange={set('systemSizeKW')}
            min={1} unit="kW"
          />
          <InputField
            id="capacityFactor" label="Capacity Factor"
            info="Share of theoretical maximum output produced annually. 0.20 means 20% utilization."
            value={round(inputs.capacityFactor, 4)} onChange={set('capacityFactor')}
            min={0.01} max={0.9} step={0.01} unit="decimal"
            hint={`${(inputs.capacityFactor * 100).toFixed(1)}% utilization`}
          />
          <InputField
            id="degradationRate" label="Degradation / yr"
            info="Annual decline in system output due to panel or turbine aging."
            value={round(inputs.degradationRate, 4)} onChange={set('degradationRate')}
            min={0} max={0.05} step={0.001} unit="decimal"
          />
          <InputField
            id="installCostPerW" label="Install Cost"
            info="Upfront installed cost per watt for initial project capex."
            value={round(inputs.installCostPerW, 3)} onChange={set('installCostPerW')}
            min={0.1} step={0.01} unit="$/W"
          />
          <InputField
            id="omCostPerKWPerYear" label="O&M Cost"
            info="Recurring yearly operations and maintenance cost per kW."
            value={round(inputs.omCostPerKWPerYear, 2)} onChange={set('omCostPerKWPerYear')}
            min={0} unit="$/kW/yr"
          />
          <InputField
            id="electricityRate" label="Electricity Rate"
            info="Revenue rate per kWh. Auto-seeded from EIA and updated by selected map state."
            value={round(inputs.electricityRate, 4)} onChange={set('electricityRate')}
            min={0.01} step={0.001} unit="$/kWh"
            hint="Auto-filled from EIA"
          />
          <InputField
            id="escalationRate" label="Price Escalation"
            info="Expected annual increase in electricity price and O&M costs."
            value={round(inputs.escalationRate, 4)} onChange={set('escalationRate')}
            min={0} max={0.1} step={0.001} unit="decimal / yr"
            hint={breakEvenInflation != null ? `FRED breakeven: ${breakEvenInflation.toFixed(2)}%` : undefined}
          />
        </div>
      </fieldset>

      {/* ── Row 2: Financing (left) + Policy & Tax (right), equal halves ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

        {/* Financing */}
        <fieldset>
          <legend className="label-caps text-primary border-b border-on-surface/5 pb-1 w-full block mb-4">
            Financing
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            <InputField
              id="debtFraction" label="Debt Fraction"
              info="Share of capex financed by debt; remainder is equity."
              value={round(inputs.debtFraction, 3)} onChange={set('debtFraction')}
              min={0} max={0.95} step={0.01} unit="decimal"
            />
            <InputField
              id="interestRate" label="Interest Rate"
              info="Loan interest rate used for annual debt service."
              value={round(inputs.interestRate, 4)} onChange={set('interestRate')}
              min={0} max={0.25} step={0.001} unit="decimal / yr"
              hint={fedFunds != null ? `FRED Fed Funds: ${fedFunds.toFixed(2)}%` : undefined}
            />
            <InputField
              id="loanTermYears" label="Loan Term"
              info="Number of years over which debt is amortized."
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

        {/* Policy & Tax — same 4-column grid as Financing */}
        <fieldset>
          <legend className="label-caps text-primary border-b border-on-surface/5 pb-1 w-full block mb-4">
            Policy &amp; Tax
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            <InputField
              id="itcPercent" label="ITC / Credit"
              info="Investment Tax Credit percentage reducing year-0 equity outflow. IRA 2022 base rate is 30%."
              value={round(inputs.itcPercent, 3)} onChange={set('itcPercent')}
              min={0} max={0.6} step={0.01} unit="decimal"
              hint="IRA 2022: 30%"
            />
            <InputField
              id="discountRate" label="Discount Rate"
              info="Required return used to discount future cash flows for NPV and LCOE."
              value={round(inputs.discountRate ?? 0.08, 4)} onChange={set('discountRate')}
              min={0.01} max={0.3} step={0.001} unit="decimal"
              hint={treasury10Y != null ? `FRED 10Y: ${treasury10Y.toFixed(2)}%` : 'NPV & LCOE'}
            />
            <InputField
              id="corporateTaxRate" label="Corp. Tax Rate"
              info="Federal corporate income tax rate applied to MACRS depreciation deductions. TCJA 2017 flat rate is 21%."
              value={round(inputs.corporateTaxRate ?? 0.21, 3)} onChange={set('corporateTaxRate')}
              min={0} max={0.5} step={0.01} unit="decimal"
              hint="TCJA 2017: 21%"
            />
            <MacrsToggle
              checked={!!inputs.useMacrs}
              onChange={() => setInput('useMacrs', !inputs.useMacrs)}
              info="IRS 5-year MACRS accelerated depreciation for solar/wind (Rev. Proc. 87-56). Basis reduced by 50% of ITC per §168(k). Schedule: 20/32/19.2/11.52/11.52/5.76% over 6 years."
            />
          </div>
        </fieldset>

      </div>
    </section>
  )
}
