const withOpacity = (token) => `rgb(var(${token}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Botanical Ledger Design System ─────────────────────────────
      colors: {
        // Surface hierarchy (parchment stack)
        'surface':                  withOpacity('--color-surface'),
        'surface-bright':           withOpacity('--color-surface-bright'),
        'surface-dim':              withOpacity('--color-surface-dim'),
        'surface-container-lowest': withOpacity('--color-surface-container-lowest'),
        'surface-container-low':    withOpacity('--color-surface-container-low'),
        'surface-container':        withOpacity('--color-surface-container'),
        'surface-container-high':   withOpacity('--color-surface-container-high'),
        'surface-container-highest':withOpacity('--color-surface-container-highest'),
        'surface-variant':          withOpacity('--color-surface-variant'),
        'surface-tint':             withOpacity('--color-surface-tint'),
        // Text
        'on-surface':               withOpacity('--color-on-surface'),
        'on-surface-variant':       withOpacity('--color-on-surface-variant'),
        'on-background':            withOpacity('--color-on-background'),
        'inverse-on-surface':       withOpacity('--color-inverse-on-surface'),
        'inverse-surface':          withOpacity('--color-inverse-surface'),
        // Primary (deep teal)
        'primary':                  withOpacity('--color-primary'),
        'primary-container':        withOpacity('--color-primary-container'),
        'primary-fixed':            withOpacity('--color-primary-fixed'),
        'primary-fixed-dim':        withOpacity('--color-primary-fixed-dim'),
        'on-primary':               withOpacity('--color-on-primary'),
        'on-primary-fixed':         withOpacity('--color-on-primary-fixed'),
        'on-primary-fixed-variant': withOpacity('--color-on-primary-fixed-variant'),
        'on-primary-container':     withOpacity('--color-on-primary-container'),
        'inverse-primary':          withOpacity('--color-inverse-primary'),
        // Secondary (muted sage)
        'secondary':                withOpacity('--color-secondary'),
        'secondary-container':      withOpacity('--color-secondary-container'),
        'secondary-fixed':          withOpacity('--color-secondary-fixed'),
        'secondary-fixed-dim':      withOpacity('--color-secondary-fixed-dim'),
        'on-secondary':             withOpacity('--color-on-secondary'),
        'on-secondary-container':   withOpacity('--color-on-secondary-container'),
        'on-secondary-fixed':       withOpacity('--color-on-secondary-fixed'),
        'on-secondary-fixed-variant':withOpacity('--color-on-secondary-fixed-variant'),
        // Tertiary (emerald)
        'tertiary':                 withOpacity('--color-tertiary'),
        'tertiary-container':       withOpacity('--color-tertiary-container'),
        'tertiary-fixed':           withOpacity('--color-tertiary-fixed'),
        'tertiary-fixed-dim':       withOpacity('--color-tertiary-fixed-dim'),
        'on-tertiary':              withOpacity('--color-on-tertiary'),
        'on-tertiary-container':    withOpacity('--color-on-tertiary-container'),
        'on-tertiary-fixed':        withOpacity('--color-on-tertiary-fixed'),
        'on-tertiary-fixed-variant':withOpacity('--color-on-tertiary-fixed-variant'),
        // Error
        'error':                    withOpacity('--color-error'),
        'error-container':          withOpacity('--color-error-container'),
        'on-error':                 withOpacity('--color-on-error'),
        'on-error-container':       withOpacity('--color-on-error-container'),
        // Outline
        'outline':                  withOpacity('--color-outline'),
        'outline-variant':          withOpacity('--color-outline-variant'),
      },
      fontFamily: {
        sans:     ['Manrope', 'system-ui', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
        body:     ['Manrope', 'sans-serif'],
        label:    ['Manrope', 'sans-serif'],
        mono:     ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',  // 2px — tight, professional
        sm:      '0.125rem',
        md:      '0.25rem',
        lg:      '0.25rem',   // 4px — "sweet spot" per design doc
        xl:      '0.5rem',    // 8px — cards, buttons
        '2xl':   '0.75rem',   // 12px — chat bubbles
        full:    '9999px',
      },
      boxShadow: {
        'botanical': 'var(--shadow-botanical)',
        'botanical-lg': 'var(--shadow-botanical-lg)',
        'chat': 'var(--shadow-chat)',
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-out',
        'slide-up':  'slideUp 0.2s ease-out',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      backgroundImage: {
        'botanical-gradient': 'var(--gradient-botanical)',
      },
    },
  },
  plugins: [],
}
