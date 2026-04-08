# Architecture Documentation

## System Overview

The Botanical Ledger is a single-page React application (Vite) deployed on Vercel.
All data fetching is client-side. There is no custom backend — API keys are scoped
to client-safe public APIs (EIA, NREL, Mapbox) and the Gemini SDK runs directly
in the browser.

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
             │               │               │             │
             ▼               ▼               ▼             ▼
        ┌────────┐      ┌─────────┐   ┌──────────┐  ┌──────────┐
        │  EIA   │      │Financial│   │  Gemini  │  │  NREL    │
        │  API   │      │ Calc Lib│   │2.5 Flash │  │ PVWatts  │
        │        │      │(pure JS)│   │   Lite   │  │   API    │
        └────────┘      └─────────┘   └──────────┘  └──────────┘
                                                          +
                                                     ┌──────────┐
                                                     │  Mapbox  │
                                                     │  GL JS   │
                                                     └──────────┘
```

---

## Component Tree

```
App.jsx  (Headlessui Tab.Group — glassmorphism nav)
│
├── Tab 1: MarketOverview/
│   ├── index.jsx            ← calls useEiaData(), reads Zustand marketSlice
│   ├── MetricsGrid          ← 4× MetricCard (EIA live values)
│   └── CapacityTrendChart   ← Recharts LineChart + BarChart
│
├── Tab 2: Calculator/
│   ├── index.jsx            ← reads selectedStateAbbr from Zustand
│   ├── InputPanel.jsx       ← writes to calculatorSlice via setCalculatorInput
│   ├── OutputPanel.jsx      ← reads from useCalculator() hook (derived)
│   └── CashFlowSection.jsx  ← horizontal bar chart (Botanical Ledger style)
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
│  Google Gemini API  (generativelanguage.googleapis.com)         │
│                                                                 │
│  Model: gemini-2.5-flash-lite                                   │
│  SDK: @google/generative-ai (browser-side)                      │
│                                                                 │
│  System prompt injected on every call includes:                 │
│    - Live EIA electricity price + total solar capacity          │
│    - Current calculator scenario + IRR/NPV/LCOE/payback         │
│    - Selected state name + GHI from map                         │
│                                                                 │
│  Response text scanned for keywords → citation badge rendering  │
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
│   ├── geminiClient.js             Gemini SDK wrapper + context injection
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
```

---

## Key Engineering Decisions

| Decision | Rationale |
|----------|-----------|
| Zustand over Context API | Selector-based subscriptions prevent calculator re-renders from propagating to Map/Chat tabs on every keystroke |
| SWR over React Query | Smaller bundle; stale-while-revalidate semantics match EIA polling cadence; no mutations needed |
| Pre-bundle GHI values | NREL free tier is rate-limited — calling all 50 states at load would exhaust quota. Live NREL calls reserved for the clicked state only |
| Bisection IRR solver | Handles edge cases (no sign change, multiple IRRs) correctly vs. naive stepped search |
| `systemInstruction` on `getGenerativeModel()` | Required by Gemini SDK — passing it to `startChat()` is silently ignored and causes failures |
| GeoJSON via `?url` import | Vite cannot statically import `.geojson` without a plugin; URL import + runtime fetch avoids the build error cleanly |
| Botanical Ledger design system | Tonal layering (no 1px borders), parchment palette, Manrope font — differentiates from generic SaaS blue templates |
| No custom backend | EIA and NREL keys are low-risk public API keys; Gemini and Mapbox keys restricted by referer in production |

---

## What Changed From the Plan

| Original Plan | Actual Implementation | Reason |
|--------------|----------------------|--------|
| Mock AI chat | Real Gemini 2.5 Flash Lite | Gemini free tier obtained |
| OpenAI as AI provider | Google Gemini | Free tier, no billing required |
| Pre-fetch all 50 NREL states | Pre-bundle GHI from NSRDB, live PVWatts on click only | Rate limit protection |
| mathjs for IRR | Custom bisection in financialCalc.js | mathjs IRR API is not straightforward; bisection is more transparent |
