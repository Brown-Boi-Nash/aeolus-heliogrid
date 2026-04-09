const SOLAR_SUGGESTIONS = [
  'What is LCOE and how does my solar project compare?',
  'Explain the 30% Investment Tax Credit (ITC) for solar',
  'How does my IRR compare to market benchmarks?',
  'Which U.S. states have the best solar irradiance?',
  'What is the impact of battery storage co-location with solar?',
]

const WIND_SUGGESTIONS = [
  'What is LCOE and how does my wind project compare?',
  'Should I use ITC or PTC for a wind project under the IRA?',
  'How does my IRR compare to onshore wind benchmarks?',
  'Which U.S. states have the best wind resource at 100m?',
  'What are the key O&M cost drivers for onshore wind turbines?',
]

export default function SuggestedQuestions({ onSelect, energyType = 'solar' }) {
  const suggestions = energyType === 'wind' ? WIND_SUGGESTIONS : SOLAR_SUGGESTIONS

  return (
    <div
      className="flex flex-col gap-2"
      role="list"
      aria-label="Suggested questions"
    >
      {suggestions.map((q) => (
        <button
          key={q}
          role="listitem"
          onClick={() => onSelect(q)}
          className="text-left p-3 text-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors duration-150 border-b border-on-surface/5 text-on-surface/70 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          aria-label={`Ask: ${q}`}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
