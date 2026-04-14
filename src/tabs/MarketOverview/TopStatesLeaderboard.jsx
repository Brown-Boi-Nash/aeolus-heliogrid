/**
 * Top States Leaderboard — horizontal 5-card layout
 *
 * Scoring — weighted composite (all components normalized 0–1):
 *   Resource quality    40%  — GHI (solar) or wind speed (wind)
 *   Electricity rate    35%  — state retail vs. min/max range; higher = more revenue potential
 *   Policy environment  25%  — RPS, net metering, tax exemptions, state credits
 */

import { useMemo } from 'react'
import useDashboardStore from '../../store/dashboardStore'
import { STATE_METADATA } from '../../constants/stateMetadata'
import { STATE_POLICIES } from '../../constants/statePolicies'
import MethodologyDrawer, { MethodRow } from '../../components/ui/MethodologyDrawer'

// ── Scoring ────────────────────────────────────────────────────────────────────

function normalize(value, min, max) {
  if (max === min) return 0
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

function policyScore(abbr) {
  const p = STATE_POLICIES[abbr]
  if (!p) return 0
  return (p.rps ? 0.35 : 0)
    + ({ full: 0.30, virtual: 0.20, limited: 0.12, none: 0 }[p.netMetering] ?? 0)
    + (p.propertyTax ? 0.20 : 0)
    + (p.salesTax    ? 0.10 : 0)
    + (p.stateCredit ? 0.05 : 0)
}

function buildRationale(abbr, energyType, resourceVal, price, nationalPrice) {
  const policy = STATE_POLICIES[abbr]
  const parts  = []

  if (energyType === 'solar') {
    parts.push(resourceVal >= 5.5
      ? `Exceptional GHI ${resourceVal.toFixed(2)}`
      : `GHI ${resourceVal.toFixed(2)} kWh/m²/d`)
  } else {
    parts.push(resourceVal >= 7.5
      ? `Class-leading wind ${resourceVal.toFixed(1)} m/s`
      : `Wind ${resourceVal.toFixed(1)} m/s avg`)
  }

  if (price != null) {
    const prem = Math.round(((price - nationalPrice) / nationalPrice) * 100)
    if (prem >= 20) parts.push(`${prem}% above US avg rate`)
  }

  if (policy?.stateCredit)     parts.push(policy.stateCredit)
  else if (policy?.rps)        parts.push('RPS mandate')

  return parts.slice(0, 2).join(' · ')
}

function rankStates(energyType, statePrices, nationalPrice) {
  const ghiValues  = STATE_METADATA.map((s) => s.ghi)
  const windValues = STATE_METADATA.map((s) => s.windSpeed)
  const ghiMin  = Math.min(...ghiValues),  ghiMax  = Math.max(...ghiValues)
  const windMin = Math.min(...windValues),  windMax = Math.max(...windValues)

  const livePrices = Object.values(statePrices).filter(Boolean)
  const rateMin = livePrices.length ? Math.min(...livePrices) : 0
  const rateMax = livePrices.length ? Math.max(...livePrices) : 0.30

  return STATE_METADATA
    .filter((s) => s.abbr !== 'DC')
    .map((s) => {
      const resourceVal = energyType === 'wind' ? s.windSpeed : s.ghi
      const resMin      = energyType === 'wind' ? windMin : ghiMin
      const resMax      = energyType === 'wind' ? windMax : ghiMax
      const price       = statePrices[s.abbr] ?? null

      const resScore  = normalize(resourceVal, resMin, resMax)
      const rateScore = price != null ? normalize(price, rateMin, rateMax) : 0
      const polScore  = policyScore(s.abbr)
      const composite = resScore * 0.40 + rateScore * 0.35 + polScore * 0.25

      return {
        abbr: s.abbr, name: s.name, fips: s.fips,
        lat: s.lat, lon: s.lon, ghi: s.ghi,
        windSpeed: s.windSpeed, windCF: s.windCF,
        price, composite, resScore, rateScore, polScore, resourceVal,
        rationale: buildRationale(s.abbr, energyType, resourceVal, price, nationalPrice ?? 0.122),
      }
    })
    .filter((s) => s.price != null)
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 5)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MiniBar({ score, color }) {
  return (
    <div className="h-1 rounded-full bg-on-surface/10 overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.round(score * 100)}%` }}
      />
    </div>
  )
}

const RANK_STYLES = [
  { num: 'text-primary',             bg: 'bg-primary/8'             },  // #1 — deep teal
  { num: 'text-secondary',           bg: 'bg-secondary/6'           },  // #2 — sage
  { num: 'text-tertiary-container',  bg: 'bg-tertiary/5'            },  // #3 — emerald
  { num: 'text-on-surface/35',       bg: 'bg-transparent'           },  // #4
  { num: 'text-on-surface/40',       bg: 'bg-transparent'           },  // #5
]

function StateCard({ rank, state, onSelect }) {
  const style = RANK_STYLES[rank] ?? RANK_STYLES[4]
  const score = Math.round(state.composite * 100)

  return (
    <button
      type="button"
      onClick={() => onSelect(state)}
      className={`flex-1 min-w-0 flex flex-col gap-3 p-4 rounded-xl border border-outline-variant/50 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${style.bg}`}
      aria-label={`${state.name} — score ${score} — open in Calculator`}
    >
      {/* Rank + score */}
      <div className="flex items-center justify-between">
        <span className={`text-xl font-black tabular-nums ${style.num}`}>{rank + 1}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black tabular-nums text-on-surface">{score}</span>
          <span className="text-[11px] font-bold text-on-surface/40 uppercase tracking-wider">/100</span>
        </div>
      </div>

      {/* State name + rate */}
      <div>
        <p className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors leading-tight">
          {state.name}
          <span
            className="material-symbols-outlined text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity align-middle"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            arrow_forward
          </span>
        </p>
        {state.price != null && (
          <p className="text-[10px] font-mono font-bold text-on-surface-variant mt-0.5">
            ${state.price.toFixed(3)}/kWh
          </p>
        )}
      </div>

      {/* Rationale */}
      <p className="text-[10px] text-on-surface-variant leading-snug line-clamp-2 min-h-[28px]">
        {state.rationale}
      </p>

      {/* Score bars */}
      <div className="space-y-1.5 pt-1 border-t border-on-surface/6">
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-1.5 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface/40 w-6">Res</span>
          <MiniBar score={state.resScore}  color="bg-primary" />
          <span className="text-[11px] tabular-nums font-bold text-on-surface/40 w-4 text-right">{Math.round(state.resScore * 100)}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-1.5 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface/40 w-6">Rate</span>
          <MiniBar score={state.rateScore} color="bg-secondary" />
          <span className="text-[11px] tabular-nums font-bold text-on-surface/40 w-4 text-right">{Math.round(state.rateScore * 100)}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-1.5 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface/40 w-6">Pol</span>
          <MiniBar score={state.polScore}  color="bg-tertiary" />
          <span className="text-[11px] tabular-nums font-bold text-on-surface/40 w-4 text-right">{Math.round(state.polScore * 100)}</span>
        </div>
      </div>
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TopStatesLeaderboard({ statePrices, nationalPrice, onNavigate }) {
  const setSelectedState       = useDashboardStore((s) => s.setSelectedState)
  const applyStateToCalculator = useDashboardStore((s) => s.applyStateToCalculator)
  const energyType             = useDashboardStore((s) => s.energyType)

  const topStates = useMemo(
    () => rankStates(energyType, statePrices, nationalPrice),
    [energyType, statePrices, nationalPrice],
  )

  function handleSelect(state) {
    const capacityFactor = energyType === 'wind' ? state.windCF : state.ghi / 24
    setSelectedState({ fips: state.fips, name: state.name, abbr: state.abbr, lat: state.lat, lon: state.lon, ghi: state.ghi, capacityFactor, electricityRate: state.price })
    applyStateToCalculator({ fips: state.fips, abbr: state.abbr, capacityFactor, electricityRate: state.price })
    onNavigate?.(1)
  }

  return (
    <section aria-labelledby="leaderboard-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-botanical-gradient flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-white text-sm"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              leaderboard
            </span>
          </div>
          <div>
            <h2 id="leaderboard-heading" className="font-bold text-on-surface text-base uppercase tracking-wider">
              Top 5 States
            </h2>
            <p className="label-caps opacity-50">
              {energyType === 'wind' ? 'Wind' : 'Solar'} · Resource 40 · Rate 35 · Policy 25 · click to model
            </p>
          </div>
        </div>
        <p className="text-[11px] text-on-surface/40 hidden sm:block">
          EIA · NREL · DSIRE
        </p>
      </div>

      {/* Cards */}
      {topStates.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-xs text-on-surface/40">
          Loading state data…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topStates.map((state, i) => (
            <StateCard
              key={state.abbr}
              rank={i}
              state={state}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <MethodologyDrawer title="How states are ranked">
        <MethodRow label="Composite Score">
          Each state is scored out of 100 using three weighted components: Resource Quality (40%), Electricity Rate (35%), and Policy Environment (25%). All components are normalized to 0–1 before weighting.
        </MethodRow>
        <MethodRow label="Resource Quality (40%)">
          Solar mode uses pre-bundled GHI (global horizontal irradiance, kWh/m²/day) from NREL NSRDB. Wind mode uses average wind speed (m/s) at 100m. Both are min-max normalized across all 50 states so the best state always scores 100 and the worst scores 0.
        </MethodRow>
        <MethodRow label="Electricity Rate (35%)">
          Live state retail electricity prices from the EIA API. Higher rate = higher score — a state with $0.25/kWh offers more revenue potential than one at $0.08/kWh for the same project output. States with no live EIA price are excluded.
        </MethodRow>
        <MethodRow label="Policy Environment (25%)">
          Point tally based on DSIRE database: RPS mandate (+35), full net metering (+30), virtual net metering (+20), limited net metering (+12), property tax exemption (+20), sales tax exemption (+10), state tax credit (+5). Max 100 points.
        </MethodRow>
        <MethodRow label="Clicking a state">
          Applies the state's live NREL PVWatts capacity factor and EIA electricity rate directly to the Project Economics calculator and navigates to Tab 2.
        </MethodRow>
      </MethodologyDrawer>
    </section>
  )
}
