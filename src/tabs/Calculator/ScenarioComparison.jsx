import { useState, useRef } from 'react'
import clsx from 'clsx'

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtIrr(irr) {
  return irr != null ? `${(irr * 100).toFixed(1)}%` : '—'
}
function fmtNpv(npv) {
  if (npv == null) return '—'
  return npv >= 0 ? `$${(npv / 1_000_000).toFixed(2)}M` : `-$${(Math.abs(npv) / 1_000_000).toFixed(2)}M`
}
function fmtLcoe(lcoe) {
  return lcoe != null ? `$${lcoe.toFixed(4)}/kWh` : '—'
}
function fmtPayback(p) {
  return p != null ? `${p.toFixed(1)} yrs` : '—'
}
function fmtCo2(t) {
  if (t == null) return '—'
  return t >= 1_000 ? `${(t / 1_000).toFixed(1)}k t` : `${Math.round(t)} t`
}
function fmtCapex(s) {
  const capex = s.systemSizeKW * 1000 * s.installCostPerW
  return `$${(capex / 1_000_000).toFixed(2)}M`
}

// ── Status coloring ───────────────────────────────────────────────────────────

function irrColor(irr) {
  if (irr == null) return 'text-on-surface/40'
  if (irr >= 0.12) return 'text-primary'
  if (irr >= 0.08) return 'text-secondary'
  return 'text-error'
}
function npvColor(npv) {
  if (npv == null) return 'text-on-surface/40'
  return npv > 0 ? 'text-primary' : 'text-error'
}

// ── Best-in-column highlight ──────────────────────────────────────────────────

function bestIdx(scenarios, key, lowerIsBetter = false) {
  let best = null
  let bestVal = lowerIsBetter ? Infinity : -Infinity
  scenarios.forEach((s, i) => {
    const v = s[key]
    if (v == null) return
    if (lowerIsBetter ? v < bestVal : v > bestVal) { bestVal = v; best = i }
  })
  return best
}

// ── Row definition ────────────────────────────────────────────────────────────

const ROWS = [
  { label: 'Energy Type',     key: 'energyType',    fmt: (s) => s.energyType === 'wind' ? '💨 Wind' : '☀️ Solar', metric: false },
  { label: 'State',           key: 'stateName',     fmt: (s) => s.stateName ?? 'U.S.', metric: false },
  { label: 'System Size',     key: 'systemSizeKW',  fmt: (s) => `${s.systemSizeKW.toLocaleString()} kW`, metric: false },
  { label: 'Capex',           key: '_capex',        fmt: fmtCapex, metric: false },
  { label: 'Capacity Factor', key: 'capacityFactor',fmt: (s) => `${(s.capacityFactor * 100).toFixed(1)}%`, metric: false },
  { label: 'ITC',             key: 'itcPercent',    fmt: (s) => `${(s.itcPercent * 100).toFixed(0)}%`, metric: false },
  { label: 'MACRS',           key: 'useMacrs',      fmt: (s) => s.useMacrs ? 'On' : 'Off', metric: false },
  { label: null },  // divider
  { label: 'IRR',             key: 'irr',           fmt: (s) => fmtIrr(s.irr),     metric: true, higher: true,  color: (s) => irrColor(s.irr) },
  { label: 'NPV',             key: 'npv',           fmt: (s) => fmtNpv(s.npv),     metric: true, higher: true,  color: (s) => npvColor(s.npv) },
  { label: 'LCOE',            key: 'lcoe',          fmt: (s) => fmtLcoe(s.lcoe),   metric: true, higher: false },
  { label: 'Payback',         key: 'payback',       fmt: (s) => fmtPayback(s.payback), metric: true, higher: false },
  { label: null },  // divider
  { label: 'CO₂ Offset/yr',  key: 'co2Tonnes',     fmt: (s) => fmtCo2(s.co2Tonnes), metric: true, higher: true },
  { label: 'ESG Grade',       key: 'esgGrade',      fmt: (s) => s.esgGrade ?? '—', metric: false },
]

// ── Inline name editor ────────────────────────────────────────────────────────

function ScenarioName({ id, name, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(name)
  const inputRef              = useRef(null)

  function startEdit() {
    setDraft(name)
    setEditing(true)
    // Focus after render
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) onRename(id, trimmed)
    setEditing(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter')  commit()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className="w-full text-center text-[10px] font-extrabold bg-surface-container border border-primary rounded px-1.5 py-0.5 text-on-surface outline-none focus:ring-1 focus:ring-primary"
        aria-label="Rename scenario"
        maxLength={60}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Click to rename"
      className="group/name flex items-center justify-center gap-1 w-full hover:text-primary transition-colors"
    >
      <span className="text-[10px] font-extrabold text-on-surface text-center leading-tight group-hover/name:text-primary transition-colors">
        {name}
      </span>
      <span
        className="material-symbols-outlined text-[10px] opacity-0 group-hover/name:opacity-40 transition-opacity flex-shrink-0"
        aria-hidden="true"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        edit
      </span>
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScenarioComparison({ scenarios, onDelete, onRename, onClearAll }) {
  if (!scenarios.length) return null

  // Pre-compute best indices for metric rows
  const bests = {}
  ROWS.forEach(({ key, metric, higher }) => {
    if (!metric || !key) return
    bests[key] = bestIdx(scenarios, key, !higher)
  })

  return (
    <section
      className="bg-surface-container-low rounded-xl overflow-hidden"
      aria-labelledby="comparison-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/10">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-xl"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          >
            compare_arrows
          </span>
          <div>
            <h2
              id="comparison-heading"
              className="font-bold text-on-surface text-base uppercase tracking-wider"
            >
              Scenario Comparison
            </h2>
            <p className="label-caps opacity-60 mt-0.5">
              {scenarios.length} saved snapshot{scenarios.length !== 1 ? 's' : ''} · up to 8
            </p>
          </div>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error/5"
          aria-label="Clear all saved scenarios"
        >
          Clear all
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto scrollbar-botanical px-6 py-5">
        <table className="w-full text-xs" aria-label="Scenario comparison">
          <thead>
            <tr>
              {/* Row label column */}
              <th className="text-left pr-4 py-2 label-caps w-28 align-bottom sticky left-0 bg-surface-container-low z-10">
                Metric
              </th>
              {scenarios.map((s, i) => (
                <th key={s.id} className="px-3 py-2 min-w-[140px] align-bottom">
                  <div className="flex flex-col items-center gap-1">
                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(s.id)}
                      className="self-end text-on-surface/20 hover:text-error transition-colors rounded p-0.5 -mt-1 -mr-1 mb-0.5"
                      aria-label={`Delete scenario ${s.name}`}
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    {/* Scenario name — click to rename */}
                    <ScenarioName id={s.id} name={s.name} onRename={onRename} />
                    {/* Timestamp */}
                    <span className="text-[11px] text-on-surface/35 font-medium">
                      {new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Scenario badge */}
                    {s.scenario && s.scenario !== 'base' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-wider">
                        {s.scenario}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => {
              // Divider row
              if (row.label === null) {
                return (
                  <tr key={`divider-${ri}`}>
                    <td colSpan={scenarios.length + 1} className="py-1">
                      <div className="border-t border-on-surface/10" />
                    </td>
                  </tr>
                )
              }

              const best = row.metric ? bests[row.key] : null

              return (
                <tr
                  key={row.key}
                  className="hover:bg-on-surface/5 transition-colors"
                >
                  {/* Row label */}
                  <td className="pr-4 py-1.5 label-caps opacity-60 align-middle sticky left-0 bg-surface-container-low z-10 whitespace-nowrap">
                    {row.label}
                  </td>
                  {scenarios.map((s, ci) => {
                    const isBest = best === ci
                    const colorCls = row.color ? row.color(s) : 'text-on-surface/80'
                    return (
                      <td
                        key={s.id}
                        className={clsx(
                          'px-3 py-1.5 text-center align-middle font-semibold tabular-nums',
                          colorCls,
                          isBest && 'relative',
                        )}
                      >
                        {isBest && (
                          <span
                            className="absolute inset-0 rounded bg-primary/8 pointer-events-none"
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative">
                          {row.fmt(s)}
                          {isBest && (
                            <span
                              className="ml-1 text-primary text-[11px] font-extrabold"
                              title="Best value in this metric"
                              aria-label="Best"
                            >
                              ★
                            </span>
                          )}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="px-6 pb-4 text-[11px] text-on-surface/40">
        ★ indicates best value in each metric row. Scenarios saved locally in your browser. Max 8 snapshots.
      </p>
    </section>
  )
}
