# Solar / Wind Toggle Feature Spec

## Goal

Add a global **Solar | Wind** toggle to the nav so analysts can switch the entire dashboard context between solar and wind investment analysis. One toggle, every tab adapts.

---

## The Toggle

- Lives in the top nav header (right of the tab labels, left of the "Live Market Data" badge)
- Two buttons: `☀ Solar` and `🌬 Wind`
- Persisted in Zustand as `energyType: 'solar' | 'wind'`
- Switching resets calculator inputs to the appropriate defaults for that energy type

---

## What Changes Per Tab

### Tab 1 — Market Overview

| Element | Solar | Wind |
|---------|-------|------|
| KPI: Installed Capacity | Solar GW (EIA SOL) | Wind GW (EIA WND) |
| KPI: Tax Incentive | ITC 30% · IRA 2022 | ITC/PTC 30% · IRA 2022 |
| KPI: LCOE Range | $0.033–$0.068/kWh (NREL ATB) | $0.033–$0.054/kWh onshore (NREL ATB) |
| KPI: Electricity Price | National avg (unchanged) | National avg (unchanged) |
| Regional table col | Avg GHI (kWh/m²/day) | Avg Wind Speed (m/s) |
| Regional table label | Solar Resource | Wind Resource |
| Outlook logic | GHI + price thresholds | Wind speed + price thresholds |

### Tab 2 — Project Economics Calculator

| Input | Solar default | Wind default |
|-------|--------------|--------------|
| System Size | 1,000 kW | 1,000 kW (onshore) |
| Capacity Factor | 0.18 | 0.35 |
| Install Cost/W | $2.00/W | $1.30/W |
| O&M Cost/kW/yr | $15 | $40 |
| Degradation Rate | 0.5%/yr | 0.3%/yr |
| ITC % | 30% | 30% (IRA allows wind to use ITC) |

Financial math (IRR, NPV, LCOE, payback) stays identical — only inputs differ.
Panel header changes: "Solar Investment Return Modeling" → "Wind Investment Return Modeling"

### Tab 3 — Research Assistant

Inject `energyType` into the Gemini system prompt so responses are contextually relevant (solar vs. wind technology, policy, market).

### Tab 4 — Geographic Map

| Element | Solar | Wind |
|---------|-------|------|
| Choropleth metric | GHI (kWh/m²/day) | Wind Speed (m/s at 100m) |
| Color scale label | Low GHI → High GHI | Low Wind → High Wind |
| State popup row | GHI: X.XX | Avg Wind: X.X m/s |
| Capacity factor fill | PVWatts (live NREL) | Pre-bundled windCF |

---

## New / Modified Files

### New files
- `src/constants/windDefaults.js` — wind financial defaults + scenario multipliers
- `src/components/ui/EnergyToggle.jsx` — Solar/Wind pill toggle component

### Modified files
- `src/constants/stateMetadata.js` — add `windSpeed` (m/s) and `windCF` fields per state
- `src/store/dashboardStore.js` — add `energyType`, `setEnergyType`, `totalWindCapacityGW`, wind capacity setter
- `src/App.jsx` — render `<EnergyToggle />` in nav header
- `src/lib/eiaClient.js` — add `fetchWindCapacity()` (same pattern as solar, `energysourceid=WND`)
- `src/hooks/useEiaData.js` — fetch wind capacity in parallel with solar
- `src/tabs/MarketOverview/index.jsx` — conditional KPI cards + regional table column
- `src/tabs/GeographicMap/MapContainer.jsx` — conditional choropleth dataset + legend
- `src/tabs/GeographicMap/index.jsx` — pass energyType to MapContainer
- `src/tabs/Calculator/InputPanel.jsx` — swap defaults when energyType changes
- `src/tabs/ResearchAssistant/index.jsx` — inject energyType into system prompt context

---

## Pre-bundled Wind Data (stateMetadata.js additions)

Annual average wind speed at 100m hub height (NREL Wind Toolkit state averages).
Wind capacity factor derived from wind speed class:

| Wind Speed | CF |
|------------|-----|
| < 5.5 m/s  | 0.25 |
| 5.5–6.5 m/s | 0.30 |
| 6.5–7.5 m/s | 0.35 |
| > 7.5 m/s  | 0.42 |

Wind resource label thresholds:

| Wind Speed | Label |
|------------|-------|
| ≥ 7.5 m/s | Exceptional |
| ≥ 6.5 m/s | Excellent |
| ≥ 5.5 m/s | Good |
| ≥ 4.5 m/s | Moderate |
| < 4.5 m/s | Low |

---

## EIA Wind Capacity Query

Same endpoint as solar capability, change energy source:
- `facets[energysourceid][]=WND` (was SOL)
- Response field: `capability` (same)
- Store field: `totalWindCapacityGW`

---

## What Does NOT Change

- Financial calculation functions (`financialCalc.js`) — 100% technology-agnostic
- `useCalculator.js` hook logic — just reads inputs
- Scenario toggle (Base / Optimistic / Conservative) — works for both
- Cross-tab flow #1 (EIA price → calculator electricityRate) — unchanged
- Cross-tab flow #2 (map click → calculator fill) — works for both; wind mode fills windCF instead of solar CF

---

## Implementation Order

1. `windDefaults.js` + `stateMetadata.js` wind fields (data foundation)
2. `dashboardStore.js` — energyType + wind capacity fields
3. `eiaClient.js` + `useEiaData.js` — wind capacity fetch
4. `EnergyToggle.jsx` + wire into `App.jsx`
5. `MarketOverview` — conditional KPIs + regional table
6. `MapContainer` — conditional choropleth
7. `InputPanel` — swap defaults on energyType change
8. `ResearchAssistant` — inject energyType into prompt
