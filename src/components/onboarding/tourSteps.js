/**
 * react-joyride step definitions for the Aeolus HelioGrid onboarding tour.
 * Each `target` is a CSS selector pointing to an element with a `data-tour` attribute.
 */
export const TOUR_STEPS = [
  {
    target: '[data-tour="brand"]',
    title: 'Welcome to Aeolus HelioGrid',
    content:
      'Your all-in-one U.S. renewable energy investment dashboard — real-time market data, project economics, AI-powered analysis, and geographic intelligence in one place.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="energy-toggle"]',
    title: 'Solar or Wind — your call',
    content:
      'Switch between Solar and Wind at any time. Every tab — market metrics, the calculator, the map, and the AI assistant — adapts to your selection automatically.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-market"]',
    title: 'Market Overview',
    content:
      'Live capacity figures, LCOE trends, and federal incentive status pulled from the EIA. A macro strip shows real-time FRED data: 10Y Treasury, Fed Funds, and breakeven inflation so you can benchmark returns.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-economics"]',
    title: 'Project Economics Calculator',
    content:
      'Model any solar or wind project: size, CapEx, capacity factor, debt structure, and degradation. The calculator outputs IRR, NPV, LCOE, and payback period — and can generate a full AI investment memo in seconds.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-assistant"]',
    title: 'AI Research Assistant',
    content:
      'Ask anything about renewable energy — policy, financing, technology, or market trends. The assistant is context-aware: it knows your selected state, energy type, and current macro rates.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-map"]',
    title: 'Geographic Intelligence',
    content:
      'A choropleth map of U.S. solar irradiance or wind capacity factor by state. Click any state for resource details, electricity rates, and a full state policy card — RPS mandates, net metering rules, and tax incentives.',
    placement: 'bottom',
  },
]
