function formatTime(isoString) {
  if (!isoString) return 'Not yet fetched'
  return new Date(isoString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DataProvenance({ title = 'Data Provenance', fetchedAt, items = [] }) {
  return (
    <section className="bg-surface-container-high rounded-xl p-5" aria-label={title}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
          Last refreshed: {formatTime(fetchedAt)}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-surface-container-lowest rounded-lg p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface/45">{item.label}</p>
            <p className="text-xs font-semibold text-on-surface mt-1">{item.source}</p>
            {item.note && <p className="text-[10px] text-on-surface/45 mt-1">{item.note}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
