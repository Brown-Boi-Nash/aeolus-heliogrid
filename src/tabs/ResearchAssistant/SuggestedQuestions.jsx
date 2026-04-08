const SUGGESTIONS = [
  'What is LCOE and how does my project compare?',
  'Explain the 30% Investment Tax Credit (ITC)',
  'How does my IRR compare to market benchmarks?',
  'Which U.S. states have the best solar resource?',
  'What is the impact of battery storage co-location?',
]

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div
      className="flex flex-col gap-2"
      role="list"
      aria-label="Suggested questions"
    >
      {SUGGESTIONS.map((q) => (
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
