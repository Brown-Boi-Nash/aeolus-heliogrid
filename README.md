[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/hl3jCjv_)

# Aeolus HelioGrid — U.S. Renewable Energy Investment Dashboard

## 🌐 Live URL: [https://aeolus-heliogrid.vercel.app](https://aeolus-heliogrid.vercel.app)

> CDF AI Engineering Hackathon · April 2026 · Built by **Brown-Boi-Nash**

---

## What It Does

Aeolus HelioGrid is a four-tab investment analysis dashboard that helps analysts evaluate U.S. solar and wind energy opportunities using live public data.

| Tab | Description |
|-----|-------------|
| **Market Overview** | Live EIA electricity prices, installed capacity trends, Top 5 states leaderboard, grid parity analysis vs NREL ATB 2024 |
| **Project Economics** | Interactive IRR/NPV/LCOE/payback calculator with 3 scenarios, sensitivity heatmap, 20-year cash flow chart, MACRS depreciation, PPA mode, P90 downside IRR |
| **Research Assistant** | Gemini 2.5 Flash Lite AI grounded in live dashboard context — chat Q&A and AI-generated investment memos |
| **Geographic Map** | Mapbox choropleth of solar/wind resources by state — click any state to apply live NREL + EIA data to the calculator |

---

## Cross-Tab Data Flows

1. **Market → Calculator**: EIA national electricity price auto-seeds the calculator's revenue rate on first load
2. **Map → Calculator**: Clicking a state fetches live NREL PVWatts capacity factor + EIA state electricity rate, pre-fills the calculator, and navigates to Tab 2

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React + Vite | Fast DX, instant HMR, clean SPA output |
| Styling | Tailwind CSS + CSS custom properties | Botanical Ledger design system with full dark mode support |
| State | Zustand | Selector-based subscriptions — calculator inputs don't re-render map tab |
| Data fetching | SWR | Stale-while-revalidate dedup — EIA calls shared across Tab 1 and Tab 4 |
| Charts | Recharts | Declarative, composable, lightweight |
| Map | react-map-gl + Mapbox GL JS | Vector choropleth with GeoJSON layer, dark/light style switching |
| AI | Google Gemini 2.5 Flash Lite | Free tier, low latency, grounded with live dashboard context |
| Deployment | Vercel | Zero-config Vite deploy + serverless functions for API key security |

---

## Features Implemented

**Tier 1 — Core (all complete):**
- ✅ Market Overview with live EIA data and trend charts
- ✅ Project Economics calculator (IRR, NPV, LCOE, payback, cash flow)
- ✅ Research Assistant with live context injection and source citations
- ✅ Geographic Map with state choropleth and click-to-calculator cross-tab flow
- ✅ Two live cross-tab data flows
- ✅ Live deployment on Vercel

**Tier 2 — Stretch (all implemented):**
- ✅ IRR sensitivity heatmap (electricity rate × install cost, 10% hurdle breakeven)
- ✅ AI-generated investment memo (structured 7-section output)
- ✅ Data provenance — every metric cites its source and fetch time
- ✅ Export PDF (investment memo)
- ✅ MACRS accelerated depreciation (IRS 5-year schedule, §168(k) basis adjustment)
- ✅ Named saved scenarios with inline rename
- ✅ P90 downside IRR (NREL convention — capacity factor × 0.90)
- ✅ PPA mode toggle (75% of retail rate for utility-scale projects)
- ✅ Grid Parity Status with NREL ATB 2024 LCOE benchmarks
- ✅ Top States Leaderboard (resource 40% + rate 35% + policy 25% scoring)
- ✅ Dark mode with botanical warm-dark palette
- ✅ FRED macro data hints (10Y Treasury, Fed Funds, breakeven inflation)
- ✅ Onboarding tour

---

## Security

- `GEMINI_API_KEY` lives in Vercel serverless functions only — never bundled into client JS
- FRED API routed through `/fred-api/` server proxy to avoid CORS
- All other keys are free-tier public APIs designed for browser use
- AI guardrails: scope-restricted system prompt, 500-char input limit, jailbreak refusal

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/Community-Dreams-Foundation-Hackathons/renewable-energy-analysis-dashboard-Brown-Boi-Nash-1.git

# 2. Install
npm install

# 3. Environment variables — create .env.local with:
VITE_EIA_API_KEY=your_key
VITE_NREL_API_KEY=your_key
VITE_FRED_API_KEY=your_key
VITE_MAPBOX_TOKEN=your_token
GEMINI_API_KEY=your_key        # server-only, no VITE_ prefix

# 4. Run
npm run dev
```

---

## AI Tools Used

**Claude Code (Anthropic)** — primary coding assistant:
- Component architecture, state management, and cross-tab data flow design
- Financial model (IRR bisection, NPV, LCOE, MACRS depreciation, P90, PPA)
- API integrations (EIA, NREL, FRED, Gemini, Mapbox)
- UI/UX design system (Botanical Ledger — parchment palette, dark mode)
- Security hardening (Gemini serverless proxy, CORS fixes, AI guardrails)

**Google Stitch** — UI design:
- Initial dashboard layout and component structure generation
- Design direction for the four-tab interface
- Informed the Botanical Ledger color palette and card layouts

All implementation choices, assumptions, and code were reviewed and validated throughout development.

---

## Walkthrough Video

📹 **[Watch the 5-minute demo](https://youtu.be/T8r8LHYzpqM)**

---

## Docs

- [Planning Document](planning/PLANNING.md)
- [Architecture Overview](docs/architecture.md)
- [Reflection](docs/reflection.md)
- [Walkthrough](docs/walkthrough.md)

---

## Submission Checklist

- [x] Live deployment URL at top of README
- [x] Planning document — `planning/PLANNING.md`
- [x] Architecture overview — `docs/architecture.md`
- [x] Reflection — `docs/reflection.md`
- [x] Walkthrough video link — `docs/walkthrough.md`
- [x] Clean commit history
- [x] No API keys committed
