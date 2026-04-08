import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

/**
 * Send a message to Gemini 2.5 Flash Lite with a grounded system prompt
 * that includes live dashboard context (EIA metrics, calculator state).
 */
export async function sendGeminiMessage(userMessage, context = {}) {
  const {
    nationalElectricityPrice,
    totalSolarCapacityGW,
    irr,
    npv,
    lcoe,
    payback,
    scenario,
    selectedState,
    systemSizeKW,
    capacityFactor,
  } = context

  const systemPrompt = `You are an expert renewable energy investment analyst assistant embedded in the Botanical Ledger dashboard.
You help investment analysts evaluate U.S. solar and wind energy opportunities.

LIVE DASHBOARD CONTEXT (use these real numbers in your answers):
- U.S. National Average Electricity Price: ${nationalElectricityPrice != null ? `$${nationalElectricityPrice.toFixed(3)}/kWh (EIA live data)` : 'not yet loaded'}
- Total U.S. Installed Solar Capacity: ${totalSolarCapacityGW != null ? `${totalSolarCapacityGW.toFixed(0)} GW (EIA live data)` : 'not yet loaded'}
- Current Calculator Scenario: ${scenario ?? 'base'}
- System Size: ${systemSizeKW ? `${systemSizeKW.toLocaleString()} kW` : 'not set'}
- Capacity Factor: ${capacityFactor != null ? `${(capacityFactor * 100).toFixed(1)}%` : 'not set'}
- Modeled IRR: ${irr != null ? `${(irr * 100).toFixed(2)}%` : 'not calculated'}
- Modeled NPV: ${npv != null ? `$${(npv / 1_000_000).toFixed(2)}M` : 'not calculated'}
- Modeled LCOE: ${lcoe != null ? `$${lcoe.toFixed(4)}/kWh` : 'not calculated'}
- Simple Payback: ${payback != null ? `${payback.toFixed(1)} years` : 'not calculated'}
- Selected State on Map: ${selectedState ? `${selectedState.name} (GHI: ${selectedState.ghi?.toFixed(2)} kWh/m²/day)` : 'none selected'}

GUIDELINES:
- Always cite data sources (EIA, NREL, NREL ATB, IRS, etc.)
- Be concise and quantitative — investment analysts want numbers, not fluff
- Reference the user's live calculator numbers when relevant
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
