import { getPolicyForState } from '../constants/statePolicies'

/**
 * Send a chat message through the /api/gemini-chat serverless function.
 * The Gemini API key never leaves the server — it is NOT bundled in the client JS.
 */
export async function sendGeminiMessage(userMessage, context = {}) {
  // Resolve state policy client-side and pass it as plain data to the server
  const policy = context.selectedState?.abbr
    ? getPolicyForState(context.selectedState.abbr)
    : null

  const res = await fetch('/api/gemini-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, context: { ...context, policy } }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }

  const data = await res.json()
  return data.text
}

/**
 * Generate a structured investment memo through the /api/gemini-memo serverless function.
 */
export async function generateInvestmentMemo(context = {}) {
  const policy = context.selectedState?.abbr
    ? getPolicyForState(context.selectedState.abbr)
    : null

  const res = await fetch('/api/gemini-memo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context: { ...context, policy } }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }

  const data = await res.json()
  return data.text
}
