import clsx from 'clsx'

export default function ThemeToggle({ theme = 'light', onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={clsx(
        'flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors',
        'bg-surface-container-high text-on-surface/65 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
    >
      <span
        className="material-symbols-outlined text-sm"
        aria-hidden="true"
        style={{ fontVariationSettings: `'FILL' ${isDark ? 1 : 0}, 'wght' 500` }}
      >
        {isDark ? 'dark_mode' : 'light_mode'}
      </span>
      {isDark ? 'Dark mode' : 'Light mode'}
    </button>
  )
}
