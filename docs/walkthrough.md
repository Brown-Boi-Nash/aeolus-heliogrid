# Walkthrough Video

**Live Dashboard:** [https://aeolus-heliogrid.vercel.app](https://aeolus-heliogrid.vercel.app)

**Video Link:** [https://youtu.be/T8r8LHYzpqM](https://youtu.be/T8r8LHYzpqM)

---

## Suggested Run-of-Show (~5 minutes)

### 1. Market Overview (Tab 1) — ~1 min
- Show live EIA electricity price metric card with data provenance tooltip
- Scroll through the capacity trend chart (solar GW by year)
- Point out the Top 5 States leaderboard and Grid Parity status panel
- Show FRED macro hints (10Y Treasury, Fed Funds, breakeven inflation)
- Toggle dark mode to demonstrate the botanical warm-dark palette

### 2. Project Economics (Tab 2) — ~1.5 min
- Walk through the input panel: system size, capacity factor, install cost, ITC%
- Switch between Base / Optimistic / Conservative scenarios — IRR/NPV/LCOE update instantly
- Show the 20-year cash flow bar chart
- Open the IRR sensitivity heatmap — explain the two axes (electricity rate × install cost)
- Toggle PPA mode and show how IRR changes
- Click "Generate Investment Memo" and show the 7-section AI output + PDF export

### 3. Geographic Map → Calculator Cross-Tab Flow (Tab 4 → Tab 2) — ~1 min
- Show the Mapbox choropleth (GHI / wind speed by state, green-to-blue ramp)
- Click a high-resource state (e.g., Arizona for solar, Iowa for wind)
- Show the state popup: GHI, retail rate, capacity factor, NREL data source
- Click "Use in Calculator" — demonstrate auto-navigation to Tab 2 with pre-filled inputs
- Show IRR/LCOE updated to reflect the selected state's real data

### 4. Research Assistant (Tab 3) — ~1 min
- Show the Active Context Feed sidebar (live calculator scenario, EIA price, selected state)
- Ask a suggested question: "What is my project's LCOE compared to grid parity?"
- Show the grounded response citing live dashboard numbers
- Ask a follow-up: "How does the ITC affect IRR?"
- Point out citation badges and the 500-char input guardrail

### 5. Key Technical Decisions — ~30 sec
- Gemini API key in Vercel serverless functions — never bundled in client JS
- FRED CORS resolved via Vercel rewrite (no extra backend needed)
- Mapbox `key={theme}` remount pattern — prevents race crash on style change
- IRR bisection solver — handles edge cases (no sign change, negative project)
- Zustand selector subscriptions — calculator keystrokes don't re-render map tab
