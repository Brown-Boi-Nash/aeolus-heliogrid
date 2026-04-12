# Reflection

## What I Built
- A four-tab React dashboard with a custom "Botanical Ledger" visual system:
  - Market Overview (EIA live metrics, trend charts, FRED macro hints, top states leaderboard, grid parity status)
  - Project Economics (editable assumptions, IRR/NPV/LCOE/payback engine, 20-year cash flow bars, sensitivity heatmap, MACRS depreciation, PPA mode, P90 downside IRR, named scenarios)
  - Geographic Map (Mapbox choropleth with state click → NREL PVWatts fetch → calculator auto-fill, full dark/light mode support)
  - Research Assistant (Gemini 2.5 Flash Lite with live dashboard context injection, AI-generated investment memos, PDF export)
- Cross-tab data flows:
  - EIA national electricity price initializes calculator defaults on first load
  - Clicking a map state applies electricity rate + capacity factor in calculator and navigates to Tab 2
- Stretch goals implemented:
  - IRR sensitivity heatmap (+/-20% electricity rate vs install cost)
  - AI-generated 7-section investment memo (exportable as PDF)
  - Data provenance sections across tabs (source attribution + refresh context)
  - Full dark mode with warm botanical palette
  - FRED macro data (10Y Treasury, Fed Funds, breakeven inflation)
  - MACRS 5-year accelerated depreciation with §168(k) bonus basis
  - P90 downside IRR and PPA mode toggle
  - Named saved scenarios with inline rename
  - Onboarding tour
- Security hardening:
  - Gemini API key moved to Vercel serverless functions (never bundled in client JS)
  - FRED API routed through Vercel rewrite to resolve CORS without exposing a key
  - AI guardrails: scope-restricted system prompt, jailbreak refusal, 500-char input cap enforced server-side

## What I'd Do Differently
- Add automated tests for financial calculations (IRR edge cases, payback precision, LCOE sanity checks) — the bisection solver covers the critical path but edge cases (zero capacity factor, very high debt ratios) deserve explicit test coverage.
- Add interactive map legend filtering (e.g., "show only states with GHI > 5.0" or wind speed > 7 m/s) to let analysts pre-screen geographies without clicking each state.
- Add optimistic caching + retry backoff for external API outages — EIA and NREL occasionally return 429s during peak hours; a simple exponential retry would prevent silent stale data.
- Add richer provenance with direct endpoint URLs and raw API response inspection for analyst trust — some evaluators want to verify the numbers, not just trust a "Source: EIA" badge.

## AI Tools Used
- **Claude Code (Anthropic)** was used throughout as the primary coding assistant:
  - Component architecture, Zustand state design, and cross-tab data flow
  - Financial model implementation (IRR bisection, NPV, LCOE, MACRS depreciation, P90, PPA)
  - API integrations (EIA, NREL, FRED, Gemini, Mapbox)
  - UI/UX design system (Botanical Ledger — parchment palette, full dark mode)
  - Security hardening (Gemini serverless proxy, CORS fixes, AI guardrails)
  - Debugging integration issues across EIA/NREL/Gemini/Mapbox clients

All implementation choices, assumptions, and code were reviewed and validated throughout development.
