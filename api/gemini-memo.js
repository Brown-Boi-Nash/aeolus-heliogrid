import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'Service unavailable' })
  }

  const { context = {} } = req.body ?? {}

  const prompt = buildMemoPrompt(context)

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
    })

    const result = await model.generateContent(prompt)
    return res.status(200).json({ text: result.response.text() })
  } catch (err) {
    console.error('[gemini-memo] error:', err.message)
    return res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' })
  }
}

function buildMemoPrompt(context) {
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
    useMacrs,
    corporateTaxRate,
    policy,
  } = context

  const tech = energyType === 'wind' ? 'Onshore Wind' : 'Utility-Scale Solar PV'
  const capexM = systemSizeKW && installCostPerW
    ? ((systemSizeKW * 1000 * installCostPerW) / 1_000_000).toFixed(2)
    : null
  const annualMWh = systemSizeKW && capacityFactor
    ? ((systemSizeKW * capacityFactor * 8760) / 1000).toFixed(0)
    : null

  return `You are a senior renewable energy investment analyst. Write a concise, professional investment memo for an investment committee based strictly on the data provided below. Do not invent numbers. Do not deviate from the format requested.

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
- MACRS Depreciation: ${useMacrs ? `Enabled — IRS 5-year schedule (20/32/19.2/11.52/11.52/5.76%), depreciable basis = CapEx × ${itcPercent != null ? (1 - 0.5 * itcPercent).toFixed(2) : '0.85'} (§168(k) basis adjustment), corporate tax rate ${corporateTaxRate != null ? `${(corporateTaxRate * 100).toFixed(0)}%` : '21%'}` : 'Disabled'}

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

${policy ? `STATE POLICY (${selectedState?.abbr}):
- RPS: ${policy.rps ?? 'None'}
- Net Metering: ${policy.netMetering}
- Property Tax Exemption: ${policy.propertyTax ? 'Yes' : 'No'}
- Sales Tax Exemption: ${policy.salesTax ? 'Yes' : 'No'}
- State Incentive: ${policy.stateCredit ?? 'None beyond federal ITC'}
- Analyst Note: ${policy.notes}` : 'STATE POLICY: No state selected — use national federal ITC context only.'}

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
}
