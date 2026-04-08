export default function InfoHint({ text, label = 'More info' }) {
  if (!text) return null

  return (
    <span className="relative inline-flex items-center group align-middle">
      <button
        type="button"
        aria-label={label}
        className="w-4 h-4 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-extrabold leading-none flex items-center justify-center hover:bg-surface-container-highest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[130%] z-30 hidden group-hover:block group-focus-within:block w-56 bg-surface-container-lowest text-on-surface text-[10px] font-semibold leading-relaxed p-2.5 rounded-lg shadow-botanical normal-case tracking-normal"
      >
        {text}
      </span>
    </span>
  )
}
