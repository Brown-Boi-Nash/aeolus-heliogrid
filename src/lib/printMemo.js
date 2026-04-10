/**
 * Opens a print-ready window containing the investment memo as a formatted PDF page.
 * Uses window.print() — browser provides the native "Save as PDF" dialog.
 * No external dependencies.
 *
 * @param {string} memoText  Raw markdown-ish memo text from Gemini
 * @param {object} meta      { projectName, state, energyType, date }
 */
export function printMemo(memoText, meta = {}) {
  const {
    projectName  = 'Renewable Energy Project',
    state        = 'U.S.',
    energyType   = 'solar',
    date         = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  } = meta

  const techLabel = energyType === 'wind' ? 'Onshore Wind' : 'Utility-Scale Solar PV'

  // Convert the memo markdown to print HTML
  const bodyHtml = memoToHtml(memoText)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investment Memo — ${projectName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: Letter portrait;
      margin: 0.9in 0.85in 0.85in 0.85in;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 10.5pt;
      line-height: 1.65;
      color: #1a1a1a;
      background: #fff;
    }

    /* ── Cover header ─────────────────────────────────────── */
    .cover-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 14pt;
      border-bottom: 2.5pt solid #2d6a4f;
      margin-bottom: 18pt;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8pt;
    }

    .brand-icon {
      width: 28pt;
      height: 28pt;
      background: linear-gradient(135deg, #2d6a4f 0%, #52b788 100%);
      border-radius: 7pt;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16pt;
      font-weight: bold;
      line-height: 1;
    }

    .brand-name {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13pt;
      font-weight: 800;
      color: #2d6a4f;
      letter-spacing: -0.3pt;
    }

    .brand-sub {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 7pt;
      font-weight: 600;
      letter-spacing: 1.2pt;
      text-transform: uppercase;
      color: #6b7280;
      margin-top: 2pt;
    }

    .header-meta {
      text-align: right;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 8pt;
      color: #6b7280;
      line-height: 1.7;
    }

    /* ── Memo title block ─────────────────────────────────── */
    .memo-title-block {
      margin-bottom: 20pt;
    }

    .memo-label {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 2pt;
      text-transform: uppercase;
      color: #2d6a4f;
      margin-bottom: 4pt;
    }

    .memo-title {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 18pt;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.5pt;
      line-height: 1.2;
      margin-bottom: 6pt;
    }

    .memo-sub {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 9.5pt;
      color: #4b5563;
      font-weight: 400;
    }

    /* ── Sections ─────────────────────────────────────────── */
    .section {
      margin-bottom: 16pt;
      page-break-inside: avoid;
    }

    .section-heading {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: 1.8pt;
      text-transform: uppercase;
      color: #2d6a4f;
      border-bottom: 0.75pt solid #d1fae5;
      padding-bottom: 3pt;
      margin-bottom: 6pt;
    }

    .section p {
      margin-bottom: 5pt;
      color: #1f2937;
    }

    .section ul {
      padding-left: 14pt;
      margin-bottom: 4pt;
    }

    .section li {
      margin-bottom: 3pt;
      color: #1f2937;
    }

    strong { font-weight: 700; color: #111827; }

    /* ── Footer ───────────────────────────────────────────── */
    .footer {
      margin-top: 24pt;
      padding-top: 8pt;
      border-top: 0.75pt solid #e5e7eb;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 7pt;
      color: #9ca3af;
      line-height: 1.5;
    }

    .footer strong { color: #6b7280; font-weight: 600; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Cover header -->
  <div class="cover-header">
    <div class="brand">
      <div class="brand-icon">&#9651;</div>
      <div>
        <div class="brand-name">Aeolus HelioGrid</div>
        <div class="brand-sub">U.S. Renewable Energy Investment Dashboard</div>
      </div>
    </div>
    <div class="header-meta">
      <div><strong>CONFIDENTIAL</strong></div>
      <div>${date}</div>
      <div>${techLabel} · ${state}</div>
    </div>
  </div>

  <!-- Memo title block -->
  <div class="memo-title-block">
    <div class="memo-label">Investment Memorandum</div>
    <div class="memo-title">${projectName}</div>
    <div class="memo-sub">${techLabel} · ${state} · AI-assisted analysis powered by Google Gemini 2.5 Flash Lite</div>
  </div>

  <!-- Memo body -->
  ${bodyHtml}

  <!-- Footer -->
  <div class="footer">
    <strong>Disclaimer:</strong> This memorandum was generated by an AI system using live data from EIA Open Data API, NREL Developer API,
    NREL ATB 2024, IRS / IRA 2022, EPA eGRID 2022, and FRED (Federal Reserve Bank of St. Louis).
    All projections are model outputs and do not constitute investment advice.
    Verify all figures independently before making investment decisions.
    &nbsp;·&nbsp; Generated by Aeolus HelioGrid &nbsp;·&nbsp; ${date}
  </div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    // Fallback if popup blocked: clipboard copy already exists
    alert('Popup blocked. Please allow popups for this site and try again, or use the Copy button.')
    return
  }
  win.document.write(html)
  win.document.close()
  // Give fonts/styles time to settle before triggering print
  win.onload = () => win.print()
  // Fallback timeout in case onload already fired
  setTimeout(() => { try { win.print() } catch {} }, 400)
}

// ── Markdown → print HTML ────────────────────────────────────────────────────

function memoToHtml(text) {
  if (!text) return ''

  const sections = text.split(/^## /m).filter(Boolean)

  return sections.map((section) => {
    const newline = section.indexOf('\n')
    const heading = newline === -1 ? section.trim() : section.slice(0, newline).trim()
    const body    = newline === -1 ? '' : section.slice(newline + 1).trim()

    const lines     = body.split('\n')
    const hasBullets = lines.some((l) => l.startsWith('- '))

    const renderedLines = lines
      .filter((l) => l.trim())
      .map((line) => {
        const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        return line.startsWith('- ')
          ? `<li>${html.slice(2)}</li>`
          : `<p>${html}</p>`
      })
      .join('\n')

    const inner = hasBullets
      ? `<ul>${renderedLines}</ul>`
      : renderedLines

    return `
      <div class="section">
        <div class="section-heading">${escapeHtml(heading)}</div>
        ${inner}
      </div>`
  }).join('\n')
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
