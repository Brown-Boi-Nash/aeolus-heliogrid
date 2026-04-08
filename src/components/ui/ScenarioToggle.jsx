import clsx from 'clsx'
import useDashboardStore from '../../store/dashboardStore'

const SCENARIOS = [
  { id: 'conservative', label: 'Conservative' },
  { id: 'base',         label: 'Base Case' },
  { id: 'optimistic',  label: 'Optimistic' },
]

export default function ScenarioToggle() {
  const scenario    = useDashboardStore((s) => s.calculatorInputs.scenario)
  const setScenario = useDashboardStore((s) => s.setScenario)

  return (
    <div
      role="radiogroup"
      aria-label="Scenario selection"
      className="flex rounded-xl overflow-hidden bg-surface-container-high"
    >
      {SCENARIOS.map(({ id, label }) => {
        const selected = scenario === id
        return (
          <button
            key={id}
            role="radio"
            aria-checked={selected}
            onClick={() => setScenario(id)}
            className={clsx(
              'flex-1 py-2 px-3 text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
              selected
                ? 'bg-primary text-on-primary'
                : 'text-on-surface/50 hover:text-primary hover:bg-surface-container'
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
