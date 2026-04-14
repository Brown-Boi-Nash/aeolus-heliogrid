import { useState } from 'react'

/**
 * A slim collapsible drawer triggered by a text button.
 * Place at the bottom of any section that has non-obvious calculations.
 *
 * Props:
 *   title    — button label (default "Methodology")
 *   children — drawer content (JSX)
 */
export default function MethodologyDrawer({ title = 'Methodology', children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2 border-t border-on-surface/8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-on-surface/40 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        aria-expanded={open}
      >
        <span
          className="material-symbols-outlined text-sm transition-transform duration-200"
          aria-hidden="true"
          style={{
            fontVariationSettings: "'FILL' 0, 'wght' 400",
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          expand_more
        </span>
        {title}
      </button>

      {open && (
        <div className="pt-3 pb-4 space-y-3 text-xs text-on-surface-variant leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

/** Reusable row inside a drawer — label + explanation */
export function MethodRow({ label, children }) {
  return (
    <div>
      <p className="font-extrabold text-on-surface text-[11px] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[11px] text-on-surface-variant leading-relaxed">{children}</p>
    </div>
  )
}
