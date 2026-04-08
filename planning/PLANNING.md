# Planning Document

> Complete this document **before writing any code**. This is part of the evaluation.
> Your intent here will be compared against what you actually built in `docs/architecture.md`.

---

## Tech Stack

**Framework / Language:** React + Vite (JavaScript/JSX)

> I chose this stack because Vite provides an incredibly fast developer experience, and React's component-based architecture is perfect for building complex, highly interactive dashboards. Vercel makes deploying Vite apps seamless and securely handles environment variables.

**Key Libraries:**
- **Tailwind CSS:** For rapid, responsive UI development without managing separate CSS files.
- **Zustand:** For global state management. It allows selector-based rendering, ensuring the heavy calculator tab doesn't re-render unnecessarily on every keystroke.
- **SWR:** For data fetching. Its stale-while-revalidate caching is perfect for polling the EIA and NREL APIs smoothly.
- **Recharts:** For declarative, composable React charting (cash flows and market trends).
- **react-map-gl + Mapbox GL JS:** For high-performance vector choropleth geographic visualizations.
- **mathjs:** To handle complex financial calculations, specifically the Newton-Raphson solver needed for accurate IRR edge cases.

**AI Provider:** Google Gemini (`gemini-2.5-flash-lite`) via `@google/generative-ai` SDK

> I chose Gemini Flash Lite for its free tier (no billing required), extremely low latency, and straightforward SDK. Live EIA and NREL metrics plus the user's current calculator state (IRR, NPV, LCOE, selected state) are injected into the system prompt on every request, grounding the AI's answers in real data rather than general knowledge.

---

## Phases & Priorities

> I am prioritizing the core data fetching, state management, and the calculator first, as they form the foundation of the app. AI and map visualizations will follow.

| Phase | Target Dates | Goals |
|-------|-------------|-------|
| 1 | Days 1-2 | Scaffold app, setup Zustand store, build pure financial calculator logic (IRR, NPV, LCOE), and create the interactive Calculator UI (Tab 2). |
| 2 | Days 3-4 | Integrate EIA and NREL APIs using SWR. Build Market Overview (Tab 1) and Geographic Map (Tab 4). Wire up the cross-tab data flow (Map -> Calculator). |
| 3 | Days 5-6 | Setup Vercel Serverless function for the AI Assistant (Tab 3). Implement context injection (passing live data to the LLM prompt). Polish UI, add tooltips, and deploy. |

---

## What I'll Cut If Time Is Short

> **First thing I'd drop:** The Tier 2 stretch goals, specifically the 5x5 IRR Sensitivity Heatmap and the Data Provenance tooltips. While they add great value, the core requirements take precedence.
> 
> **Last thing I'd drop:** The cross-tab data flow and the dynamic recalculation in the Economics tab. These are explicitly required and form the core "feel" of a high-quality dashboard.

---

## Open Questions / Risks

> 1. **EIA API Data Formatting:** Public government APIs can sometimes return messy or nested data structures. Normalizing this data cleanly so it doesn't break the UI is a risk.
> 2. **AI Context Window:** Ensuring the AI prompt effectively understands the financial data without hallucinating numbers.
> 3. **Client-Side Secrets:** Ensuring API keys for EIA and NREL are safely routed through Vercel serverless functions or appropriately restricted if used purely client-side via Vite environment variables.

---

## TODO (Post-Core Improvements)

- Add a first-time user onboarding flow:
  - Ask whether the visitor is a first-time user.
  - If yes, launch a short guided tour across the 4 tabs (market, calculator, assistant, map).
  - Include a skip button and "don't show again" preference persisted in local storage.
