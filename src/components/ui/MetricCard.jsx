import clsx from 'clsx'
import InfoHint from './InfoHint'

/**
 * KPI card following the Botanical Ledger design system.
 * Uses tonal layering (surface-container-lowest on surface) — no borders.
 * Includes an accessible aria-label and a watermark icon for visual flair.
 */
export default function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  source,
  info,
  isLoading,
  isError,
  accentVariant = 'default', // 'default' | 'hero' (botanical gradient bg)
  watermarkIcon,              // Material Symbol name, e.g. 'bolt'
}) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className="bg-surface-container-lowest rounded-xl p-6 shadow-botanical animate-pulse"
        aria-busy="true"
        aria-label={`Loading ${label}`}
      >
        <div className="space-y-4">
          <div className="h-2.5 bg-surface-container-high rounded w-2/3" />
          <div className="h-9 bg-surface-container-high rounded w-1/2" />
          <div className="h-2.5 bg-surface-container-high rounded w-1/3" />
        </div>
      </div>
    )
  }

  // Hero variant — botanical gradient background
  if (accentVariant === 'hero') {
    return (
      <div
        className="bg-botanical-gradient rounded-xl p-6 text-on-primary flex flex-col justify-between relative overflow-hidden shadow-botanical"
        role="region"
        aria-label={label}
      >
        <div className="space-y-1">
          <p className="label-caps opacity-80 text-on-primary flex items-center gap-1.5">
            {label}
            <InfoHint text={info} label={`${label} definition`} />
          </p>
          <p className="text-4xl font-black tracking-tight italic" aria-live="polite">
            {isError ? '—' : (value ?? '—')}
            {unit && !isError && (
              <span className="text-sm font-normal opacity-70 ml-1 not-italic">{unit}</span>
            )}
          </p>
        </div>
        {delta != null && !isError && (
          <div className="mt-4 flex items-center gap-2">
            <DeltaChip delta={delta} label={deltaLabel} inverted />
          </div>
        )}
        {watermarkIcon && (
          <span
            className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-[0.07] select-none pointer-events-none"
            aria-hidden="true"
          >
            {watermarkIcon}
          </span>
        )}
        {source && (
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-3">{source}</p>
        )}
      </div>
    )
  }

  // Standard card — surface-container-lowest on parchment surface
  return (
    <div
      className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-botanical"
      role="region"
      aria-label={label}
    >
      <div className="space-y-1">
        <p className="label-caps flex items-center gap-1.5">
          {label}
          <InfoHint text={info} label={`${label} definition`} />
        </p>
        <p
          className="text-4xl font-extrabold text-primary tracking-tight tabular-nums"
          aria-live="polite"
        >
          {isError ? '—' : (value ?? '—')}
          {unit && !isError && (
            <span className="text-sm font-normal text-on-surface-variant ml-1">{unit}</span>
          )}
        </p>
      </div>

      {delta != null && !isError && (
        <div className="mt-4 flex items-center gap-2">
          <DeltaChip delta={delta} label={deltaLabel} />
          {source && (
            <span className="text-xs text-on-surface-variant italic">{source}</span>
          )}
        </div>
      )}

      {delta == null && source && !isError && (
        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-on-surface/40">{source}</p>
      )}

      {isError && (
        <p className="mt-3 text-xs text-on-surface/40 italic">Data unavailable</p>
      )}

      {watermarkIcon && (
        <span
          className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-[0.04] select-none pointer-events-none"
          aria-hidden="true"
        >
          {watermarkIcon}
        </span>
      )}
    </div>
  )
}

function DeltaChip({ delta, label, inverted = false }) {
  const isPositive = delta > 0
  const isNegative = delta < 0
  const formatted = `${isPositive ? '+' : ''}${typeof delta === 'number' ? delta.toFixed(1) : delta}${label ? ` ${label}` : ''}`

  if (inverted) {
    // On dark background
    return (
      <span
        className={clsx(
          'px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1',
          isPositive ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
          : isNegative ? 'bg-error-container text-on-error-container'
          : 'bg-white/20 text-white'
        )}
        aria-label={`${isPositive ? 'Up' : isNegative ? 'Down' : 'No change'} ${Math.abs(delta).toFixed(1)}${label ? ' ' + label : ''}`}
      >
        <span className="material-symbols-outlined text-xs" aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
          {isPositive ? 'trending_up' : isNegative ? 'trending_down' : 'trending_flat'}
        </span>
        {formatted}
      </span>
    )
  }

  return (
    <span
      className={clsx(
        'chip-positive',
        isPositive ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
        : isNegative ? 'bg-error-container text-on-error-container'
        : 'bg-surface-container text-on-surface-variant'
      )}
      aria-label={`${isPositive ? 'Increased' : isNegative ? 'Decreased' : 'Unchanged'} by ${Math.abs(delta).toFixed(1)}${label ? ' ' + label : ''}`}
    >
      <span className="material-symbols-outlined text-xs" aria-hidden="true"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
        {isPositive ? 'trending_up' : isNegative ? 'trending_down' : 'trending_flat'}
      </span>
      {formatted}
    </span>
  )
}
