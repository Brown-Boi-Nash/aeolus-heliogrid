# Architecture Documentation

## System Overview

Aeolus HelioGrid is a single-page React application (Vite) deployed on Vercel.
Most data fetching is client-side. Gemini AI calls are routed through Vercel
serverless functions so the API key is never bundled into the client JS.
The FRED API is proxied through Vercel rewrites to avoid browser CORS restrictions.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (SPA)                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    React + Vite                              │   │
│  │                                                              │   │
│  │   ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌───────┐  │   │
│  │   │  Market    │  │ Project    │  │ Research │  │  Geo  │  │   │
│  │   │  Overview  │  │ Economics  │  │Assistant │  │  Map  │  │   │
│  │   │  Tab 1     │  │ Tab 2      │  │  Tab 3   │  │ Tab 4 │  │   │
│  │   └─────┬──────┘  └─────┬──────┘  └────┬─────┘  └───┬───┘  │   │
│  │         │               │               │             │      │   │
│  │   ══════╪═══════════════╪═══════════════╪═════════════╪════  │   │
│  │                  ZUSTAND GLOBAL STORE                        │   │
│  │         marketSlice  calculatorSlice  chatSlice  mapSlice    │   │
│  │   ══════╪═══════════════╪═══════════════╪═════════════╪════  │   │
│  │         │               │               │             │      │   │
│  │   ┌─────┴──────┐  ┌─────┴──────┐  ┌────┴─────┐  ┌───┴───┐  │   │
│  │   │useEiaData  │  │useCalculator│  │ Gemini  │  │NREL   │  │   │
│  │   │(SWR hook)  │  │(useMemo)   │  │ Client  │  │Client │  │   │
│  │   └─────┬──────┘  └─────┬──────┘  └────┬─────┘  └───┬───┘  │   │
│  └─────────┼───────────────┼───────────────┼─────────────┼──────┘   │
└────────────┼───────────────┼───────────────┼─────────────┼──────────┘
             │               │           POST /api/*        │
             ▼               ▼               │             ▼
        ┌────────┐      ┌─────────┐   ┌──────▼───┐  ┌──────────┐
        │  EIA   │      │Financial│   │  Vercel  │  │  NREL    │
        │  API   │      │ Calc Lib│   │Serverless│  │ PVWatts  │
        │        │      │(pure JS)│   │Functions │  │   API    │
        └────────┘      └─────────┘   └────┬─────┘  └──────────┘
                                           │              +
                                           ▼         ┌──────────┐
                                      ┌──────────┐   │  Mapbox  │
                                      │  Gemini  │   │  GL JS   │
                                      │2.5 Flash │   └──────────┘
                                      │   Lite   │
                                      └──────────┘

        FRED API → browser fetches /fred-api/* → Vercel rewrites to api.stlouisfed.org
```

---

## Component Tree

```
App.jsx  (Headlessui Tab.Group — glassmorphism nav)
│
├── Tab 1: MarketOverview/
│   ├── index.jsx              ← calls useEiaData(), reads Zustand marketSlice
│   ├── MetricsGrid            ← 4× MetricCard (EIA live values)
│   ├── CapacityTrendChart     ← Recharts LineChart + BarChart
│   ├── TopStatesLeaderboard   ← weighted composite ranking (see Methodology)
│   └── GridParityStatus       ← LCOE vs. NREL ATB 2024 benchmarks
│
├── Tab 2: Calculator/
│   ├── index.jsx              ← reads selectedStateAbbr from Zustand
│   ├── InputPanel.jsx         ← writes to calculatorSlice via setCalculatorInput
│   ├── OutputPanel.jsx        ← reads from useCalculator() hook (derived)
│   ├── CashFlowSection.jsx    ← horizontal bar chart (Botanical Ledger style)
│   └── SensitivityHeatmap     ← 5×5 IRR grid (electricityRate × installCostPerW)
│
├── Tab 3: ResearchAssistant/
│   ├── index.jsx            ← sends to geminiClient, reads full context from Zustand
│   ├── MessageBubble.jsx    ← inline markdown renderer + citation badges
│   └── SuggestedQuestions   ← 5 starter prompts → pre-fill textarea
│
└── Tab 4: GeographicMap/
    ├── index.jsx            ← calls useEiaData() for state prices (SWR dedup)
    ├── MapContainer.jsx     ← react-map-gl, GeoJSON choropleth, click handler
    ├── StatePopup.jsx       ← Mapbox Popup with NREL data + CTA button
    └── LegendPanel.jsx      ← GHI color scale overlay
```

---

## State Management (Zustand)

```
dashboardStore  (subscribeWithSelector middleware)
│
├── marketSlice
│   ├── nationalElectricityPrice  : number | null
│   ├── totalSolarCapacityGW      : number | null
│   ├── priceTimeSeries           : { period, price }[]
│   ├── statePrices               : { [abbr]: number }
│   └── marketLastFetched         : ISO string | null
│
├── calculatorSlice
│   ├── calculatorInputs          : { systemSizeKW, capacityFactor,
│   │                                 electricityRate, installCostPerW,
│   │                                 omCostPerKWPerYear, degradationRate,
│   │                                 escalationRate, debtFraction,
│   │                                 interestRate, loanTermYears,
│   │                                 projectLifeYears, itcPercent,
│   │                                 discountRate, scenario }
│   ├── selectedStateFips         : string | null
│   └── selectedStateAbbr         : string | null
│
├── mapSlice
│   ├── selectedState             : { fips, abbr, name, ghi,
│   │                                 electricityRate, capacityFactor,
│   │                                 lat, lon } | null
│   └── hoveredFips               : string | null
│
├── fredSlice
│   ├── treasury10Y               : number | null   (DGS10 — 10Y Treasury yield %)
│   ├── fedFunds                  : number | null   (FEDFUNDS — Fed Funds Rate %)
│   └── breakEvenInflation        : number | null   (T10YIE — 10Y breakeven inflation %)
│
├── uiSlice
│   └── energyType                : 'solar' | 'wind'
│
└── chatSlice
    ├── chatMessages              : { id, role, text, citations, timestamp }[]
    └── isChatLoading             : boolean
```

---

## Cross-Tab Data Flows

```
  ┌─────────────────────────────────────────────────────────┐
  │  CROSS-TAB FLOW #1 — Market Price → Calculator Default  │
  └─────────────────────────────────────────────────────────┘

  Tab 1 (Market Overview)
    └─ useEiaData() fetches EIA national price
         └─ setMarketData() writes nationalElectricityPrice to Zustand
              └─ initializeCalculatorFromMarket() (one-time, on first load)
                   └─ writes electricityRate into calculatorSlice.inputs
                        └─ Tab 2 (Calculator) reads it immediately ✓


  ┌─────────────────────────────────────────────────────────┐
  │  CROSS-TAB FLOW #2 — Map State Click → Calculator Fill  │
  └─────────────────────────────────────────────────────────┘

  Tab 4 (Geographic Map)
    └─ User clicks a state on the Mapbox choropleth
         └─ fetchPVWatts(lat, lon) → NREL API (live call)
              └─ returns { capacityFactor }
                   └─ reads electricityRate from statePrices[abbr] (EIA)
                        └─ applyStateToCalculator({ capacityFactor,
                             electricityRate, fips, abbr }) → Zustand action
                                └─ Tab 2 inputs update instantly
                                     └─ IRR / NPV / LCOE recalculate via
                                          useCalculator() useMemo ✓
                                └─ onNavigate(1) → switches to Calculator tab
```

---

## Data Flow: Financial Calculations

```
  calculatorSlice.inputs
          │
          ▼
  useCalculator() hook  (useMemo — recalculates on every input change)
          │
          ├─ applyScenario(inputs, SCENARIO_MULTIPLIERS[scenario])
          │    └─ adjusts capacityFactor × multiplier
          │    └─ adjusts electricityRate × multiplier
          │    └─ adjusts installCostPerW × multiplier
          │
          └─ runCalculations(adjustedInputs)  [src/lib/financialCalc.js]
               ├─ buildCashFlows()   → CF[0..N] array (equity perspective)
               │    Year 0: -(capex × (1-debtFraction) - capex × itcPercent)
               │    Year N: revenue - omCost - debtService
               ├─ calcIRR()          → bisection root-find on NPV=0
               ├─ calcNPV()          → Σ CFn / (1+r)^n
               ├─ calcPayback()      → first year cumulative ≥ equity
               └─ calcLCOE()        → discounted cost / discounted energy
                         │
                         ▼
              OutputPanel + CashFlowSection render instantly
```

---

## External API Integration

```
┌─────────────────────────────────────────────────────────────────┐
│  EIA Open Data API  (api.eia.gov/v2)                            │
│                                                                 │
│  Endpoint 1: electricity/retail-sales/data                      │
│    → national avg monthly price (24 months) → price chart      │
│    → state prices by abbr (latest annual) → map popups         │
│                                                                 │
│  Endpoint 2: electricity/electric-power-operational-data        │
│    → annual solar utility capacity (10 years) → capacity chart  │
│                                                                 │
│  Fetched via: useEiaData() SWR hook (5-min dedup cache)         │
│  Called from: Tab 1 + Tab 4 (SWR deduplicates automatically)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NREL Developer API  (developer.nrel.gov/api)                   │
│                                                                 │
│  Endpoint: pvwatts/v8.json                                      │
│    → capacity_factor for a given lat/lon                        │
│    → called LIVE on each state click (not pre-fetched)          │
│                                                                 │
│  GHI values (choropleth color): pre-bundled in                  │
│    src/constants/stateMetadata.js from NREL NSRDB               │
│    Rationale: avoids 50× rate-limited API calls at page load    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Google Gemini API  (via Vercel serverless functions)           │
│                                                                 │
│  Model: gemini-2.5-flash-lite                                   │
│  Key location: GEMINI_API_KEY — server env only, never bundled  │
│                                                                 │
│  api/gemini-chat.js   — POST /api/gemini-chat                   │
│    Receives: { userMessage, context }                           │
│    Sanitizes input: strips control chars, enforces 500-char cap │
│    Builds system prompt server-side with scope guardrails       │
│    Calls Gemini REST API, returns { text }                      │
│                                                                 │
│  api/gemini-memo.js   — POST /api/gemini-memo                   │
│    Generates structured 7-section investment memo from context  │
│                                                                 │
│  Context injected (from client via POST body):                  │
│    - Live EIA electricity price + total solar/wind capacity     │
│    - Current calculator scenario + IRR/NPV/LCOE/payback         │
│    - Selected state name + GHI/wind speed from map              │
│    - FRED macro data: 10Y Treasury, Fed Funds, inflation        │
│    - State policy/incentive summary (resolved client-side)      │
│                                                                 │
│  AI guardrails: scope-restricted system prompt, jailbreak       │
│    refusal instruction, 500-char input limit enforced both      │
│    client-side (textarea) and server-side (slice+sanitize)      │
│                                                                 │
│  Response text scanned for keywords → citation badge rendering  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FRED API  (api.stlouisfed.org) — proxied                       │
│                                                                 │
│  Browser fetches /fred-api/fred/series/observations?...         │
│  Vercel rewrite: /fred-api/* → https://api.stlouisfed.org/*     │
│  Dev proxy: Vite server.proxy mirrors same path rewrite         │
│                                                                 │
│  Series fetched: DGS10 (10Y Treasury), FEDFUNDS, T10YIE        │
│    → displayed as macro context hints in Market Overview         │
│    → injected into Gemini context for grounded AI responses     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Mapbox GL JS  (api.mapbox.com)                                 │
│                                                                 │
│  Map style: mapbox://styles/mapbox/light-v11                    │
│  GeoJSON: us-states.geojson (US Census TIGER, fetched via URL)  │
│  Choropleth: fill-color interpolates GHI 3.0→6.2 kWh/m²/day   │
│  State click → NREL PVWatts fetch → Zustand cross-tab action    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
src/
├── main.jsx                        Entry point
├── App.jsx                         Tab shell, glassmorphism nav, skip-link
├── index.css                       Tailwind directives, Botanical design tokens
│
├── store/
│   └── dashboardStore.js           Zustand: 4 slices + cross-tab actions
│
├── constants/
│   ├── financialDefaults.js        Default calculator values + scenario multipliers
│   ├── stateMetadata.js            50 states: FIPS, lat/lon, pre-bundled GHI
│   └── mockAiResponses.js          (unused — replaced by real Gemini)
│
├── lib/
│   ├── eiaClient.js                EIA fetch functions (3 endpoints)
│   ├── nrelClient.js               NREL PVWatts + Solar Resource fetchers
│   ├── geminiClient.js             fetch() wrapper for /api/gemini-chat and /api/gemini-memo
│   ├── fredClient.js               FRED API fetch (proxied via /fred-api/*)
│   ├── financialCalc.js            Pure: buildCashFlows, calcIRR, calcNPV,
│   │                               calcLCOE, calcPayback, applyScenario
│   └── dataNormalizer.js           Raw API → app-shaped data transforms
│
├── hooks/
│   ├── useEiaData.js               SWR hook: fetches all EIA data, writes store
│   ├── useNrelData.js              SWR hook: NREL by lat/lon (on-demand)
│   └── useCalculator.js            useMemo: applies scenario + runs all calcs
│
├── components/
│   ├── ui/
│   │   ├── MetricCard.jsx          KPI card: tonal layers, watermark, delta chip
│   │   ├── ScenarioToggle.jsx      3-button radio: Base/Optimistic/Conservative
│   │   └── LoadingSpinner.jsx      Accessible spinner
│   └── charts/
│       ├── LineChart.jsx           Recharts wrapper (price trend)
│       └── CashFlowChart.jsx       Recharts bar chart
│
├── tabs/
│   ├── MarketOverview/
│   │   ├── index.jsx
│   │   └── CapacityTrendChart.jsx
│   ├── Calculator/
│   │   ├── index.jsx
│   │   ├── InputPanel.jsx
│   │   ├── OutputPanel.jsx
│   │   └── CashFlowSection.jsx
│   ├── ResearchAssistant/
│   │   ├── index.jsx
│   │   ├── MessageBubble.jsx
│   │   └── SuggestedQuestions.jsx
│   └── GeographicMap/
│       ├── index.jsx
│       ├── MapContainer.jsx
│       ├── StatePopup.jsx
│       └── LegendPanel.jsx
│
└── assets/
    └── us-states.geojson           US Census TIGER simplified polygons (89KB)

api/                                Vercel serverless functions (Node.js)
├── gemini-chat.js                  POST /api/gemini-chat — AI chat proxy
└── gemini-memo.js                  POST /api/gemini-memo — Investment memo generator
```

---

## Financial & Ranking Methodology

### Top States Leaderboard — Composite Scoring

Each of the 50 states (excluding DC) is scored using a **weighted composite** of three normalized components:

```
Composite = (Resource × 0.40) + (Rate × 0.35) + (Policy × 0.25)
```

All component scores are normalized to [0, 1] before weighting. The composite is multiplied by 100 for display.

**Resource Score (40%)** — min-max normalization across all 50 states

```
normalize(value, min, max) = (value − min) / (max − min)   clamped to [0, 1]
```

- Solar mode: uses pre-bundled GHI (kWh/m²/day) from `constants/stateMetadata.js` (NREL NSRDB)
- Wind mode: uses pre-bundled average wind speed (m/s) from the same source
- Min and max are computed dynamically from the full 50-state array each render, so the best state always scores 1.0 and the worst always scores 0.0

**Rate Score (35%)** — same min-max normalization applied to **live EIA state retail prices**

- Higher electricity rate → higher score. Rationale: a state with $0.25/kWh offers more revenue potential than one at $0.08/kWh for the same project output.
- Min/max derived from the live `statePrices` map fetched from EIA. States with no live price are excluded from the ranking entirely.

**Policy Score (25%)** — fixed point tally (max 1.0)

| Policy factor | Points |
|---|---|
| RPS (Renewable Portfolio Standard) mandate | 0.35 |
| Net metering — full retail | 0.30 |
| Net metering — virtual | 0.20 |
| Net metering — limited | 0.12 |
| Property tax exemption on solar/wind installations | 0.20 |
| Sales tax exemption on equipment | 0.10 |
| State-level tax credit or direct incentive | 0.05 |

Source: `constants/statePolicies.js` — static lookup table based on DSIRE database.

---

### Financial Calculator — Calculation Methods

**Cash Flow Construction (`buildCashFlows`)**

```
Year 0 (equity outlay):
  CF[0] = −(capex × (1 − debtFraction) − capex × itcPercent)
  where capex = systemSizeKW × 1000 × installCostPerW

Year N (1 to projectLifeYears):
  annualEnergyKWh = systemSizeKW × 8760 × capacityFactor × (1 − degradationRate)^N
  revenue         = annualEnergyKWh × electricityRate × (1 + escalationRate)^N
  omCost          = systemSizeKW × omCostPerKWPerYear × (1 + escalationRate)^N
  debtService     = annualDebtPayment  (fixed, computed from loanTermYears + interestRate)
  depreciation    = capex × MACRS_SCHEDULE[N]  (IRS 5-year, §168(k) bonus-adjusted basis)
  taxSaving       = depreciation × TAX_RATE     (passed through as positive cash flow)
  CF[N] = revenue − omCost − debtService + taxSaving
```

**PPA mode:** `electricityRate` is replaced by `electricityRate × 0.75` (75% of retail — utility-scale power purchase agreement convention).

**P90 downside IRR:** Re-runs all calculations with `capacityFactor × 0.90` (NREL P90 convention — 90th-percentile conservative resource estimate).

**MACRS Depreciation (IRS 5-year, §168(k))**

```
Depreciable basis = capex × (1 − itcPercent / 2)   [§168(k) ITC basis reduction]
Year 1: 20.00%   Year 2: 32.00%   Year 3: 19.20%
Year 4: 11.52%   Year 5: 11.52%   Year 6:  5.76%
```

**IRR (`calcIRR`) — Bisection solver**

```
Search bounds: r_low = −0.50, r_high = 5.00
Loop: r_mid = (r_low + r_high) / 2
      NPV_mid = Σ CF[n] / (1 + r_mid)^n
      if NPV_mid > 0: r_low = r_mid  else: r_high = r_mid
Until |NPV_mid| < 1e-6 or max 200 iterations
Returns null if NPV never changes sign (project always negative)
```

Bisection was chosen over Newton-Raphson because it guarantees convergence within bounds and handles edge cases (sign never changes, flat cash flows) without diverging.

**NPV (`calcNPV`)**

```
NPV = Σ [ CF[n] / (1 + discountRate)^n ]   for n = 0 to projectLifeYears
```

Default discount rate: 8% (configurable via calculator input).

**Payback Period (`calcPayback`)**

```
Cumulative = 0
For n = 1 to N:
  Cumulative += CF[n]
  if Cumulative ≥ |CF[0]|:
    return (n − 1) + (|CF[0]| − prev_cumulative) / CF[n]   [fractional year interpolation]
Returns null if payback not achieved within project life
```

**LCOE (`calcLCOE`) — Levelized Cost of Energy**

```
LCOE = Σ [ Cost[n] / (1 + r)^n ]  /  Σ [ Energy[n] / (1 + r)^n ]

where:
  Cost[n]   = capex (year 0 only) + omCost[n] + debtService[n]
  Energy[n] = annualEnergyKWh[n]  (degraded by degradationRate each year)
  r         = discountRate
```

**Scenario Multipliers**

| Scenario | Capacity Factor | Electricity Rate | Install Cost/W |
|---|---|---|---|
| Optimistic | × 1.10 | × 1.10 | × 0.90 |
| Base | × 1.00 | × 1.00 | × 1.00 |
| Conservative | × 0.90 | × 0.90 | × 1.10 |

Applied in `useCalculator()` before all calculations run.

**IRR Sensitivity Heatmap**

A 5×5 matrix computed via `useMemo` — 25 separate `calcIRR()` calls with `electricityRate` and `installCostPerW` each varied ±20% in 4 equal steps. Cells are color-coded: green if IRR ≥ 10% hurdle rate, red if below.

---

## Key Engineering Decisions

| Decision | Rationale |
|----------|-----------|
| Zustand over Context API | Selector-based subscriptions prevent calculator re-renders from propagating to Map/Chat tabs on every keystroke |
| SWR over React Query | Smaller bundle; stale-while-revalidate semantics match EIA polling cadence; no mutations needed |
| Pre-bundle GHI values | NREL free tier is rate-limited — calling all 50 states at load would exhaust quota. Live NREL calls reserved for the clicked state only |
| Bisection IRR solver | Handles edge cases (no sign change, multiple IRRs) correctly vs. naive stepped search |
| Gemini via serverless functions | `GEMINI_API_KEY` must never appear in client JS (bundled by Vite's env injection). Serverless functions run server-side only, keeping the key unexposed. The browser-side `@google/generative-ai` SDK was removed entirely |
| FRED proxy via Vercel rewrite | `api.stlouisfed.org` sends `Vary: Origin` without CORS headers for browser requests. A Vercel rewrite (`/fred-api/*`) acts as a server-side relay, bypassing the restriction without a dedicated function |
| `key={theme}` on Mapbox `<Map>` | Changing `mapStyle` while `reuseMaps` is set triggers a `removeSource` race that crashes the map. Forcing a fresh mount on theme change is the only reliable fix |
| Dark mode via `html.dark` CSS class | All color tokens are CSS custom properties (space-separated RGB channels). Toggling `html.dark` rewrites every token in one paint — no JS color interpolation, no Tailwind `dark:` variants scattered across components |
| GeoJSON via `?url` import | Vite cannot statically import `.geojson` without a plugin; URL import + runtime fetch avoids the build error cleanly |
| Botanical Ledger design system | Tonal layering (no 1px borders), parchment palette, Manrope font — differentiates from generic SaaS blue templates |

---

## What Changed From the Plan

| Original Plan | Actual Implementation | Reason |
|--------------|----------------------|--------|
| Mock AI chat | Real Gemini 2.5 Flash Lite | Gemini free tier obtained |
| OpenAI as AI provider | Google Gemini | Free tier, no billing required |
| Browser-side Gemini SDK | Vercel serverless functions (`api/gemini-chat.js`, `api/gemini-memo.js`) | API key security — `VITE_` prefix would bundle the key into client JS |
| Direct FRED API calls | Proxied via `/fred-api/*` Vercel rewrite + Vite dev proxy | CORS — stlouisfed.org blocks browser requests |
| Pre-fetch all 50 NREL states | Pre-bundle GHI from NSRDB, live PVWatts on click only | Rate limit protection |
| mathjs for IRR | Custom bisection in financialCalc.js | mathjs IRR API is not straightforward; bisection is more transparent |

---

## Post-Plan Enhancements

| Enhancement | Implementation |
|------------|----------------|
| Global error resilience | App-level React Error Boundary wraps `App` in `main.jsx` and presents a graceful fallback with reload action |
| Sensitivity analysis stretch goal | Added 5x5 IRR sensitivity heatmap on Project Economics tab (`electricityRate` vs `installCostPerW`, +/-20%) |
| Data provenance stretch goal | Added provenance panels with source attribution and fetch context to Market, Map, and Calculator tabs |
| AI investment memo | Structured 7-section memo generated by `api/gemini-memo.js`, exportable as PDF |
| Dark mode | Full `html.dark` CSS custom property system; Mapbox style switches between `light-v11` / `dark-v11`; map remounts on theme change via `key={theme}` |
| FRED macro hints | 10Y Treasury, Fed Funds Rate, breakeven inflation surfaced in Market Overview and injected into Gemini context |
| AI guardrails | Server-side scope restriction prompt, jailbreak refusal, 500-char sanitized input limit, generic client error message |
| Named scenarios | Calculator supports Base / Optimistic / Conservative with inline rename; P90 downside IRR; PPA mode toggle |
| MACRS depreciation | IRS 5-year accelerated schedule with §168(k) bonus depreciation basis adjustment |
| Responsive polish | Improved map container sizing and Research Assistant viewport behavior on smaller screens |
