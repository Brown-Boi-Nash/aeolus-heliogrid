# Reflection

## What I Built
- A four-tab React dashboard with a custom "Botanical Ledger" visual system:
  - Market Overview (EIA live metrics, trend charts, regional context table)
  - Project Economics (editable assumptions, IRR/NPV/LCOE/payback engine, 20-year cash flow bars)
  - Geographic Map (Mapbox choropleth with state click -> NREL PVWatts fetch -> calculator auto-fill)
  - Research Assistant (Gemini 2.5 Flash Lite with live dashboard context injection)
- Cross-tab data flows:
  - EIA national electricity price initializes calculator defaults
  - Clicking a map state applies electricity rate + capacity factor in calculator and navigates to Tab 2
- Stretch goals implemented:
  - IRR sensitivity heatmap (+/-20% electricity rate vs install cost)
  - Data provenance sections across tabs (source attribution + refresh context)
- Reliability and UX polish:
  - App-level React error boundary fallback
  - Improved responsive behavior on map/chat layouts
  - Better loading/error/empty handling in key sections

## What I'd Do Differently
- Move third-party API requests to serverless proxy endpoints to better isolate keys and add request-level observability.
- Add automated tests for financial calculations (IRR edge cases, payback precision, LCOE sanity checks).
- Add interactive map legend filtering (e.g., "show only GHI > 5.0"), and richer provenance with direct endpoint URLs.
- Add optimistic caching + retry backoff for external API outages.

## AI Tools Used
- ChatGPT/Codex was used to:
  - Scaffold and iterate component architecture for tabs and shared UI elements.
  - Refactor and validate financial model logic (cash-flow construction, IRR bisection, NPV/LCOE/payback).
  - Debug integration issues across EIA/NREL/Gemini/Mapbox clients.
  - Improve accessibility and responsive behavior without regressing the visual design system.
- Final implementation choices, assumptions, and all code-level validation were manually reviewed and adjusted in-repo.
