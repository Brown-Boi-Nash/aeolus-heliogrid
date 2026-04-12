import { useEffect, useRef, useCallback } from 'react'
import { printMemo } from '../../lib/printMemo'

/**
 * Renders a markdown-ish investment memo string into structured HTML sections.
 * Only handles the fixed section format returned by generateInvestmentMemo().
 */
function renderMemo(text) {
  if (!text) return null

  // Split on ## headings
  const sections = text.split(/^## /m).filter(Boolean)

  return sections.map((section) => {
    const newline = section.indexOf('\n')
    const heading = newline === -1 ? section.trim() : section.slice(0, newline).trim()
    const body    = newline === -1 ? '' : section.slice(newline + 1).trim()

    // Render body: bold, bullet points
    const lines = body.split('\n').map((line, i) => {
      // Bold: **text**
      const rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      if (line.startsWith('- ')) {
        return (
          <li
            key={i}
            className="text-sm text-on-surface/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: rendered.slice(2) }}
          />
        )
      }
      return rendered ? (
        <p
          key={i}
          className="text-sm text-on-surface/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      ) : null
    }).filter(Boolean)

    const hasBullets = body.split('\n').some((l) => l.startsWith('- '))

    return (
      <div key={heading} className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary border-b border-on-surface/10 pb-1.5">
          {heading}
        </h3>
        {hasBullets
          ? <ul className="space-y-1 pl-3 list-disc list-outside">{lines}</ul>
          : <div className="space-y-1.5">{lines}</div>
        }
      </div>
    )
  })
}

export default function MemoModal({ memo, isGenerating, onClose, onCopy, printMeta }) {
  const dialogRef = useRef(null)

  const handleExportPdf = useCallback(() => {
    if (memo) printMemo(memo, printMeta)
  }, [memo, printMeta])

  // Trap focus and close on Escape
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    el.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Investment Memo"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface rounded-2xl shadow-botanical-lg overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/10 bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-botanical-gradient flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <div>
              <h2 className="font-extrabold text-on-surface text-sm">Investment Memo</h2>
              <p className="label-caps opacity-50">AI-generated · Aeolus HelioGrid · Gemini 2.5 Flash Lite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {memo && !isGenerating && (
              <>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-on-surface/60 hover:text-primary hover:bg-surface-container transition-colors"
                  aria-label="Export memo as PDF"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  Export PDF
                </button>
                <button
                  onClick={onCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-on-surface/60 hover:text-primary hover:bg-surface-container transition-colors"
                  aria-label="Copy memo to clipboard"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  Copy
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
              aria-label="Close memo"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-botanical px-6 py-5">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-on-surface-variant font-medium">Generating investment memo…</p>
            </div>
          ) : memo ? (
            <div className="space-y-5">
              {renderMemo(memo)}
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface/40 pt-2 border-t border-on-surface/10">
                AI-generated analysis. Verify all figures independently before investment decisions.
                Data: EIA Open Data API · NREL Developer API · NREL ATB 2024 · IRS / IRA 2022
              </p>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant text-center py-12">No memo generated.</p>
          )}
        </div>
      </div>
    </div>
  )
}
