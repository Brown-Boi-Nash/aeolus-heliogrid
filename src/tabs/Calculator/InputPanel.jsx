import { useCallback } from 'react'
import useDashboardStore from '../../store/dashboardStore'
import ScenarioToggle from '../../components/ui/ScenarioToggle'

function InputField({ label, id, value, onChange, min, max, step = 'any', unit, hint }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="label-caps block"
      >
        {label}
        {unit && <span className="ml-1 opacity-50 normal-case font-medium not-uppercase tracking-normal text-[9px]">({unit})</span>}
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

export default function InputPanel({ selectedStateAbbr }) {
  const inputs = useDashboardStore((s) => s.calculatorInputs)
  const setInput = useDashboardStore((s) => s.setCalculatorInput)
  const reset = useDashboardStore((s) => s.resetCalculatorToDefaults)

  const set = useCallback((key) => (val) => setInput(key, val), [setInput])

  return (
    <aside
      className="bg-surface-container-high rounded-xl p-6 flex flex-col gap-6"
      aria-label="Project input parameters"
    >
      <div className="space-y-1">
        <h2 className="font-bold text-on-surface text-base uppercase tracking-wider">
          Input Parameters
        </h2>
        <p className="label-caps opacity-60">Configure project baseline assumptions</p>
        {selectedStateAbbr && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {selectedStateAbbr} data applied
            </span>
          </div>
        )}
      </div>

      {/* Scenario Toggle */}
      <div className="space-y-2">
        <p className="label-caps">Scenario</p>
        <ScenarioToggle />
      </div>

      {/* Project Parameters */}
      <fieldset className="space-y-4">
        <legend className="label-caps text-primary border-b border-on-surface/5 pb-1.5 w-full">
          Project Parameters
        </legend>
        <InputField
          id="systemSizeKW"
          label="System Size"
          value={inputs.systemSizeKW}
          onChange={set('systemSizeKW')}
          min={1}
          unit="kW"
        />
        <InputField
          id="capacityFactor"
          label="Capacity Factor"
          value={inputs.capacityFactor}
          onChange={set('capacityFactor')}
          min={0.01}
          max={0.9}
          step={0.01}
          unit="decimal"
          hint="0.20 = 20% utilization"
        />
        <InputField
          id="degradationRate"
          label="Annual Degradation"
          value={inputs.degradationRate}
          onChange={set('degradationRate')}
          min={0}
          max={0.05}
          step={0.001}
          unit="decimal / yr"
        />
        <InputField
          id="installCostPerW"
          label="Install Cost"
          value={inputs.installCostPerW}
          onChange={set('installCostPerW')}
          min={0.1}
          step={0.01}
          unit="$/W"
        />
        <InputField
          id="omCostPerKWPerYear"
          label="O&M Cost"
          value={inputs.omCostPerKWPerYear}
          onChange={set('omCostPerKWPerYear')}
          min={0}
          unit="$/kW/yr"
        />
        <InputField
          id="electricityRate"
          label="Electricity Rate"
          value={inputs.electricityRate}
          onChange={set('electricityRate')}
          min={0.01}
          step={0.001}
          unit="$/kWh"
          hint="Auto-filled from EIA national avg"
        />
        <InputField
          id="escalationRate"
          label="Price Escalation"
          value={inputs.escalationRate}
          onChange={set('escalationRate')}
          min={0}
          max={0.1}
          step={0.001}
          unit="decimal / yr"
        />
      </fieldset>

      {/* Financing */}
      <fieldset className="space-y-4">
        <legend className="label-caps text-primary border-b border-on-surface/5 pb-1.5 w-full">
          Financing
        </legend>
        <InputField
          id="debtFraction"
          label="Debt Fraction"
          value={inputs.debtFraction}
          onChange={set('debtFraction')}
          min={0}
          max={0.95}
          step={0.01}
          unit="decimal"
        />
        <InputField
          id="interestRate"
          label="Interest Rate"
          value={inputs.interestRate}
          onChange={set('interestRate')}
          min={0}
          max={0.25}
          step={0.001}
          unit="decimal / yr"
        />
        <InputField
          id="loanTermYears"
          label="Loan Term"
          value={inputs.loanTermYears}
          onChange={set('loanTermYears')}
          min={1}
          max={30}
          step={1}
          unit="years"
        />
        <InputField
          id="projectLifeYears"
          label="Project Life"
          value={inputs.projectLifeYears}
          onChange={set('projectLifeYears')}
          min={5}
          max={40}
          step={1}
          unit="years"
        />
      </fieldset>

      {/* Policy */}
      <fieldset className="space-y-4">
        <legend className="label-caps text-primary border-b border-on-surface/5 pb-1.5 w-full">
          Policy &amp; Tax
        </legend>
        <InputField
          id="itcPercent"
          label="ITC / Tax Credit"
          value={inputs.itcPercent}
          onChange={set('itcPercent')}
          min={0}
          max={0.6}
          step={0.01}
          unit="decimal"
          hint="Standard IRA rate = 0.30"
        />
        <InputField
          id="discountRate"
          label="Discount Rate"
          value={inputs.discountRate ?? 0.08}
          onChange={set('discountRate')}
          min={0.01}
          max={0.3}
          step={0.001}
          unit="decimal"
          hint="Used for NPV & LCOE"
        />
      </fieldset>

      {/* Reset */}
      <button
        onClick={reset}
        className="mt-auto w-full py-3 rounded-xl border-2 border-primary text-primary text-xs font-extrabold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Reset all inputs to default values"
      >
        Reset to Defaults
      </button>
    </aside>
  )
}
