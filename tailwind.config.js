/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Botanical Ledger Design System ─────────────────────────────
      colors: {
        // Surface hierarchy (parchment stack)
        'surface':                  '#fffcca',
        'surface-bright':           '#fffcca',
        'surface-dim':              '#dfdda7',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#f9f6bf',
        'surface-container':        '#f4f0ba',
        'surface-container-high':   '#eeebb4',
        'surface-container-highest':'#e8e5af',
        'surface-variant':          '#e8e5af',
        'surface-tint':             '#406659',
        // Text
        'on-surface':               '#1d1d00',
        'on-surface-variant':       '#414845',
        'on-background':            '#1d1d00',
        'inverse-on-surface':       '#f6f3bc',
        'inverse-surface':          '#33320c',
        // Primary (deep forest green)
        'primary':                  '#244a3e',
        'primary-container':        '#3c6255',
        'primary-fixed':            '#c2ecdb',
        'primary-fixed-dim':        '#a6cfbf',
        'on-primary':               '#ffffff',
        'on-primary-fixed':         '#002118',
        'on-primary-fixed-variant': '#284e41',
        'on-primary-container':     '#b2dccb',
        'inverse-primary':          '#a6cfbf',
        // Secondary (sage green)
        'secondary':                '#41664f',
        'secondary-container':      '#c0eacc',
        'secondary-fixed':          '#c3eccf',
        'secondary-fixed-dim':      '#a8d0b4',
        'on-secondary':             '#ffffff',
        'on-secondary-container':   '#466b53',
        'on-secondary-fixed':       '#002110',
        'on-secondary-fixed-variant':'#2a4e38',
        // Tertiary (moss)
        'tertiary':                 '#374824',
        'tertiary-container':       '#4e603a',
        'tertiary-fixed':           '#d4eab9',
        'tertiary-fixed-dim':       '#b8ce9e',
        'on-tertiary':              '#ffffff',
        'on-tertiary-container':    '#c4daaa',
        'on-tertiary-fixed':        '#102002',
        'on-tertiary-fixed-variant':'#3a4c28',
        // Error
        'error':                    '#ba1a1a',
        'error-container':          '#ffdad6',
        'on-error':                 '#ffffff',
        'on-error-container':       '#93000a',
        // Outline
        'outline':                  '#717975',
        'outline-variant':          '#c1c8c3',
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
        'botanical':  '0px 12px 32px rgba(29, 29, 0, 0.06)',
        'botanical-lg': '0px 20px 48px rgba(29, 29, 0, 0.08)',
        'chat':       '0px 8px 24px rgba(29, 29, 0, 0.08)',
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
        'botanical-gradient': 'linear-gradient(135deg, #244a3e 0%, #3c6255 100%)',
      },
    },
  },
  plugins: [],
}
