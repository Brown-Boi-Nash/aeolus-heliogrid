import clsx from 'clsx'

// Minimal markdown: bold **text**, line breaks
function renderMarkdown(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} className="font-extrabold text-primary">{part}</strong>
            : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    )
  })
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className={clsx('flex gap-3 max-w-3xl', isUser && 'ml-auto flex-row-reverse')}
      role="listitem"
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center',
          isUser ? 'bg-secondary' : 'bg-primary'
        )}
        aria-hidden="true"
      >
        <span
          className="material-symbols-outlined text-white text-base"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          {isUser ? 'person' : 'auto_awesome'}
        </span>
      </div>

      <div className={clsx('flex flex-col gap-1', isUser && 'items-end')}>
        {/* Bubble */}
        <div
          className={clsx(
            'px-5 py-4 text-sm leading-relaxed shadow-chat',
            isUser
              ? 'bg-primary text-on-primary rounded-2xl rounded-tr-none'
              : 'bg-surface-container-lowest text-on-surface rounded-2xl rounded-tl-none'
          )}
        >
          {isUser
            ? message.text
            : renderMarkdown(message.text)
          }

          {/* Citations */}
          {message.citations?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-on-surface/5 flex flex-wrap gap-1.5">
              {message.citations.map((c) => (
                <span
                  key={c}
                  className="text-[9px] font-bold uppercase tracking-widest bg-surface-container px-2 py-0.5 rounded text-on-surface-variant"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface/30">
          {isUser ? 'You' : 'Gemini AI'} · {time}
        </span>
      </div>
    </div>
  )
}
