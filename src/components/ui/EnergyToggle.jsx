import clsx from 'clsx'
import useDashboardStore from '../../store/dashboardStore'

export default function EnergyToggle() {
  const energyType = useDashboardStore((s) => s.energyType)
  const setEnergyType = useDashboardStore((s) => s.setEnergyType)

  return (
    <div
      className="flex items-center bg-surface-container-high rounded-xl p-1"
      role="radiogroup"
      aria-label="Energy technology mode"
    >
      {[
        { id: 'solar', label: 'Solar', icon: 'light_mode' },
        { id: 'wind', label: 'Wind', icon: 'air' },
      ].map((item) => {
        const active = energyType === item.id
        return (
          <button
            key={item.id}
            onClick={() => setEnergyType(item.id)}
            role="radio"
            aria-checked={active}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-colors',
              active
                ? 'bg-primary text-on-primary'
                : 'text-on-surface/60 hover:text-primary'
            )}
          >
            <span
              className="material-symbols-outlined text-sm"
              aria-hidden="true"
              style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400` }}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

