import { GoogleGenerativeAI } from '@google/generative-ai'
import { getPolicyForState } from '../constants/statePolicies'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

/**
 * Send a message to Gemini 2.5 Flash Lite with a grounded system prompt
 * that includes live dashboard context (EIA metrics, calculator state).
 */
export async function sendGeminiMessage(userMessage, context = {}) {
  const {
    nationalElectricityPrice,
    totalSolarCapacityGW,
    totalWindCapacityGW,
    energyType,
    irr,
    npv,
    lcoe,
    payback,
    scenario,
    selectedState,
    systemSizeKW,
    capacityFactor,
    treasury10Y,
    fedFunds,
    breakEvenInflation,
  } = context

  const systemPrompt = `You are an expert renewable energy investment analyst assistant embedded in the Aeolus HelioGrid dashboard.
You help investment analysts evaluate U.S. solar and wind energy opportunities.

LIVE DASHBOARD CONTEXT (use these real numbers in your answers):
- Active Technology Mode: ${energyType === 'wind' ? 'Wind' : 'Solar'}
- U.S. National Average Electricity Price: ${nationalElectricityPrice != null ? `$${nationalElectricityPrice.toFixed(3)}/kWh (EIA live data)` : 'not yet loaded'}
- Total U.S. Installed Solar Capacity: ${totalSolarCapacityGW != null ? `${totalSolarCapacityGW.toFixed(0)} GW (EIA live data)` : 'not yet loaded'}
- Total U.S. Installed Wind Capacity: ${totalWindCapacityGW != null ? `${totalWindCapacityGW.toFixed(0)} GW (EIA live data)` : 'not yet loaded'}
- Current Calculator Scenario: ${scenario ?? 'base'}
- System Size: ${systemSizeKW ? `${systemSizeKW.toLocaleString()} kW` : 'not set'}
- Capacity Factor: ${capacityFactor != null ? `${(capacityFactor * 100).toFixed(1)}%` : 'not set'}
- Modeled IRR: ${irr != null ? `${(irr * 100).toFixed(2)}%` : 'not calculated'}
- Modeled NPV: ${npv != null ? `$${(npv / 1_000_000).toFixed(2)}M` : 'not calculated'}
- Modeled LCOE: ${lcoe != null ? `$${lcoe.toFixed(4)}/kWh` : 'not calculated'}
- Simple Payback: ${payback != null ? `${payback.toFixed(1)} years` : 'not calculated'}
- FRED 10Y Treasury Yield: ${treasury10Y != null ? `${treasury10Y.toFixed(2)}% (risk-free rate benchmark)` : 'not loaded'}
- FRED Fed Funds Rate: ${fedFunds != null ? `${fedFunds.toFixed(2)}%` : 'not loaded'}
- FRED 10Y Breakeven Inflation: ${breakEvenInflation != null ? `${breakEvenInflation.toFixed(2)}%` : 'not loaded'}
- Selected State on Map: ${selectedState
    ? energyType === 'wind'
      ? `${selectedState.name} (Wind: ${selectedState.windSpeed?.toFixed(2) ?? 'n/a'} m/s)`
      : `${selectedState.name} (GHI: ${selectedState.ghi?.toFixed(2)} kWh/m²/day)`
    : 'none selected'}
${(() => {
  const policy = selectedState?.abbr ? getPolicyForState(selectedState.abbr) : null
  if (!policy) return ''
  return `- State RPS: ${policy.rps ?? 'None'}
- Net Metering: ${policy.netMetering}
- Property Tax Exemption: ${policy.propertyTax ? 'Yes' : 'No'}
- Sales Tax Exemption: ${policy.salesTax ? 'Yes' : 'No'}
- State Incentive: ${policy.stateCredit ?? 'None beyond federal ITC'}
- Policy Note: ${policy.notes}`
})()}

GUIDELINES:
- Always cite data sources (EIA, NREL, NREL ATB, IRS, etc.)
- Be concise and quantitative — investment analysts want numbers, not fluff
- Reference the user's live calculator numbers when relevant
- Prioritize analysis aligned to the active technology mode
- If asked about a specific state, reference the map data if available
- Format key figures in **bold**
- Keep responses under 250 words unless the question demands more detail`

  // systemInstruction must be passed to getGenerativeModel(), not startChat()
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction: systemPrompt,
  })

  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.4,
    },
  })

  const result = await chat.sendMessage(userMessage)
  return result.response.text()
}

/**
 * Generate a structured 1-page investment memo grounded in live dashboard data.
 * Returns a markdown string with fixed section headers.
 */
export async function generateInvestmentMemo(context = {}) {
  const {
    energyType = 'solar',
    selectedState,
    nationalElectricityPrice,
    totalSolarCapacityGW,
    totalWindCapacityGW,
    irr, npv, lcoe, payback,
    scenario,
    systemSizeKW,
    capacityFactor,
    installCostPerW,
    omCostPerKWPerYear,
    debtFraction,
    itcPercent,
    projectLifeYears,
    treasury10Y,
    fedFunds,
    breakEvenInflation,
    esg,
  } = context

  const tech = energyType === 'wind' ? 'Onshore Wind' : 'Utility-Scale Solar PV'
  const capexM = systemSizeKW && installCostPerW
    ? ((systemSizeKW * 1000 * installCostPerW) / 1_000_000).toFixed(2)
    : null
  const annualMWh = systemSizeKW && capacityFactor
    ? ((systemSizeKW * capacityFactor * 8760) / 1000).toFixed(0)
    : null

  const prompt = `You are a senior renewable energy investment analyst. Write a concise, professional investment memo for an investment committee based strictly on the data provided below. Do not invent numbers.

PROJECT DATA:
- Technology: ${tech}
- Location: ${selectedState ? `${selectedState.name} (${selectedState.abbr})` : 'U.S. (no state selected)'}
- ${energyType === 'wind' ? `Wind Speed (100m): ${selectedState?.windSpeed?.toFixed(2) ?? 'n/a'} m/s` : `Solar Resource (GHI): ${selectedState?.ghi?.toFixed(2) ?? 'n/a'} kWh/m²/day`}
- System Size: ${systemSizeKW?.toLocaleString() ?? 'n/a'} kW
- Capacity Factor: ${capacityFactor != null ? `${(capacityFactor * 100).toFixed(1)}%` : 'n/a'}
- Annual Energy Output: ${annualMWh ?? 'n/a'} MWh/yr
- Total Capex: ${capexM ? `$${capexM}M` : 'n/a'} ($${installCostPerW}/W install cost)
- O&M Cost: $${omCostPerKWPerYear ?? 'n/a'}/kW/yr
- Debt Financing: ${debtFraction != null ? `${(debtFraction * 100).toFixed(0)}%` : 'n/a'} of capex
- Federal ITC: ${itcPercent != null ? `${(itcPercent * 100).toFixed(0)}%` : 'n/a'}
- Project Life: ${projectLifeYears ?? 25} years
- Scenario: ${scenario ?? 'base'}

FINANCIAL RETURNS:
- IRR: ${irr != null ? `${(irr * 100).toFixed(2)}%` : 'not calculated'}
- NPV: ${npv != null ? `$${(npv / 1_000_000).toFixed(2)}M` : 'not calculated'}
- LCOE: ${lcoe != null ? `$${lcoe.toFixed(4)}/kWh` : 'not calculated'}
- Simple Payback: ${payback != null ? `${payback.toFixed(1)} years` : 'not calculated'}

MARKET CONTEXT:
- U.S. National Avg Electricity Price: ${nationalElectricityPrice != null ? `$${nationalElectricityPrice.toFixed(3)}/kWh (EIA)` : 'n/a'}
- State Retail Rate: ${selectedState?.electricityRate != null ? `$${selectedState.electricityRate.toFixed(3)}/kWh (EIA)` : 'n/a'}
- U.S. Installed ${energyType === 'wind' ? 'Wind' : 'Solar'} Capacity: ${energyType === 'wind' ? (totalWindCapacityGW?.toFixed(0) ?? 'n/a') : (totalSolarCapacityGW?.toFixed(0) ?? 'n/a')} GW (EIA)
- FRED 10Y Treasury Yield: ${treasury10Y != null ? `${treasury10Y.toFixed(2)}% (risk-free benchmark)` : 'n/a'}
- FRED Fed Funds Rate: ${fedFunds != null ? `${fedFunds.toFixed(2)}%` : 'n/a'}
- FRED 10Y Breakeven Inflation: ${breakEvenInflation != null ? `${breakEvenInflation.toFixed(2)}%` : 'n/a'}

${(() => {
  const policy = selectedState?.abbr ? getPolicyForState(selectedState.abbr) : null
  if (!policy) return 'STATE POLICY: No state selected — use national federal ITC context only.'
  return `STATE POLICY (${selectedState.abbr}):
- RPS: ${policy.rps ?? 'None'}
- Net Metering: ${policy.netMetering}
- Property Tax Exemption: ${policy.propertyTax ? 'Yes' : 'No'}
- Sales Tax Exemption: ${policy.salesTax ? 'Yes' : 'No'}
- State Incentive: ${policy.stateCredit ?? 'None beyond federal ITC'}
- Analyst Note: ${policy.notes}`
})()}

${esg ? `ESG & CLIMATE IMPACT (EPA eGRID 2022 · computed from project inputs):
- ESG Grade: ${esg.grade} (${esg.label}) — Score ${esg.score}/100
- Annual CO₂ Offset: ${esg.co2Tonnes >= 1000 ? `${(esg.co2Tonnes / 1000).toFixed(1)}k` : Math.round(esg.co2Tonnes)} tonnes/yr
- Equivalent Passenger Cars Removed: ${esg.carsEquivalent.toLocaleString()} (EPA: 4.6 t CO₂/car/yr)
- Homes Powered Annually: ${esg.homesPowered.toLocaleString()} (EIA: 10,500 kWh/home/yr)` : ''}

FORMAT YOUR RESPONSE EXACTLY as follows (use these exact section headers, use **bold** for key numbers):

## Executive Summary
2-3 sentences. Verdict: invest / conditional / pass. Reference IRR vs 10% hurdle rate.

## Resource Assessment
Quality of the ${energyType === 'wind' ? 'wind' : 'solar'} resource at this location. Compare to U.S. averages. 2-3 sentences.

## Financial Returns
IRR, NPV, LCOE, payback. Benchmark against NREL ATB and market comparables. 3-4 sentences.

## Key Risks
3 bullet points. Be specific to this technology and location.

## Policy & Incentives
ITC/PTC context, IRA 2022 relevance, any state-level considerations. 2-3 sentences.

## ESG & Climate Impact
Reference the computed CO₂ offset, homes powered, and ESG grade. Contextualize within ESG investing trends and institutional mandates. 2-3 sentences.

## Recommendation
1-2 sentences. Clear action: proceed to due diligence / revise assumptions / pass.

Data sources: EIA, NREL, NREL ATB 2024, IRS/IRA 2022, EPA eGRID 2022.`

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}
