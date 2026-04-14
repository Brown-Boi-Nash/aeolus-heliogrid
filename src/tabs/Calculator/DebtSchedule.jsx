import { useMemo, useState } from 'react'
import { buildDebtSchedule } from '../../lib/financialCalc'

function fmt$(n) {
  if (n == null) return '—'
  return '$' + Math.round(n).toLocaleString()
}

function fmt$k(n) {
  if (n == null || n === 0) return '—'
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${Math.round(n / 1_000).toLocaleString()}k`
}

export default function DebtSchedule({ inputs }) {
  const [collapsed, setCollapsed] = useState(true)

  const schedule = useMemo(() => buildDebtSchedule(inputs), [inputs])

  // No debt — nothing to show
  if (!schedule.length) return null

  const hasMacrs   = inputs.useMacrs && schedule.some((r) => r.macrsShield > 0)
  const totalInterest  = schedule.reduce((s, r) => s + r.interest, 0)
  const totalPrincipal = schedule.reduce((s, r) => s + r.principal, 0)
  const totalShield    = schedule.reduce((s, r) => s + r.macrsShield, 0)
  const loanAmount     = schedule[0].beginBalance

  return (
    <section
      className="bg-surface-container-low rounded-xl overflow-hidden"
      aria-labelledby="debt-schedule-heading"
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-on-surface/5 transition-colors text-left"
        aria-expanded={!collapsed}
        aria-controls="debt-schedule-body"
      >
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-xl"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          >
            account_balance
          </span>
          <div>
            <h2
              id="debt-schedule-heading"
              className="font-bold text-on-surface text-base uppercase tracking-wider"
            >
              Debt Amortization Schedule
            </h2>
            <p className="label-caps opacity-60 mt-0.5">
              {inputs.loanTermYears}-year loan · {fmt$k(loanAmount)} principal ·{' '}
              {((inputs.interestRate ?? 0) * 100).toFixed(2)}% p.a.
              {hasMacrs && ` · MACRS shields shown`}
            </p>
          </div>
        </div>
        <span
          className={`material-symbols-outlined text-on-surface/40 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {/* Summary strip — always visible */}
      <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Loan Amount',      value: fmt$k(loanAmount) },
          { label: 'Total Interest',   value: fmt$k(totalInterest) },
          { label: 'Total Principal',  value: fmt$k(totalPrincipal) },
          hasMacrs
            ? { label: 'MACRS Tax Shields', value: fmt$k(totalShield), highlight: true }
            : { label: 'Annual Payment',    value: fmt$k(schedule[0]?.payment) },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="bg-surface-container rounded-lg px-3 py-2">
            <p className="label-caps opacity-60">{label}</p>
            <p className={`text-base font-black tabular-nums mt-0.5 ${highlight ? 'text-primary' : 'text-on-surface'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Detail table */}
      {!collapsed && (
        <div id="debt-schedule-body" className="px-6 pb-6 overflow-x-auto scrollbar-botanical">
          <table
            className="w-full min-w-[420px] text-xs"
            aria-label="Debt amortization schedule"
          >
            <thead>
              <tr className="border-b border-on-surface/10">
                {['Year', 'Beg. Balance', 'Interest', 'Principal', 'Payment', 'End Balance', ...(hasMacrs ? ['MACRS Shield'] : [])].map((h) => (
                  <th
                    key={h}
                    className="text-right first:text-left px-2 py-2 label-caps whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr
                  key={row.year}
                  className={`border-b border-on-surface/5 transition-colors hover:bg-on-surface/5 ${
                    i % 2 === 0 ? '' : 'bg-surface-container/30'
                  }`}
                >
                  <td className="px-2 py-1.5 font-bold text-on-surface tabular-nums">{row.year}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-on-surface/70">{fmt$(row.beginBalance)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-error/80 font-medium">{fmt$(row.interest)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-on-surface/70">{fmt$(row.principal)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-on-surface font-semibold">{fmt$(row.payment)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-on-surface/70">{fmt$(row.endBalance)}</td>
                  {hasMacrs && (
                    <td className="px-2 py-1.5 text-right tabular-nums text-primary font-semibold">
                      {row.macrsShield > 0 ? fmt$(row.macrsShield) : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-on-surface/20 bg-surface-container/50">
                <td className="px-2 py-2 font-extrabold label-caps">Totals</td>
                <td className="px-2 py-2 text-right" />
                <td className="px-2 py-2 text-right text-error/80 font-bold tabular-nums">{fmt$(totalInterest)}</td>
                <td className="px-2 py-2 text-right font-bold tabular-nums">{fmt$(totalPrincipal)}</td>
                <td className="px-2 py-2 text-right" />
                <td className="px-2 py-2 text-right" />
                {hasMacrs && (
                  <td className="px-2 py-2 text-right text-primary font-bold tabular-nums">{fmt$(totalShield)}</td>
                )}
              </tr>
            </tfoot>
          </table>
          <p className="text-[11px] text-on-surface/40 mt-3">
            Standard fixed-rate amortization · Interest = beginning balance × {((inputs.interestRate ?? 0) * 100).toFixed(2)}% ·
            {hasMacrs && ` MACRS shields at ${((inputs.corporateTaxRate ?? 0.21) * 100).toFixed(0)}% corp. tax rate (IRS Rev. Proc. 87-56) ·`}{' '}
            All values in nominal dollars
          </p>
        </div>
      )}
    </section>
  )
}
