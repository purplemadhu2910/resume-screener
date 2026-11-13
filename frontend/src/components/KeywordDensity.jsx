export default function KeywordDensity({ density }) {
  if (!density || density.length === 0) return null
  const top = density.slice(0, 15)
  const max = Math.max(...top.map(d => d.count), 1)

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">How many times each required keyword appears in your resume. Aim for 1–2 mentions per skill.</p>
      <div className="space-y-2.5">
        {top.map(({ skill, count }) => {
          const pct = (count / max) * 100
          const barColor = count === 0 ? 'bg-red-400' : count === 1 ? 'bg-amber-400' : 'bg-emerald-500'
          const numColor = count === 0 ? 'text-red-500' : count === 1 ? 'text-amber-500' : 'text-emerald-600'
          return (
            <div key={skill} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 capitalize w-32 shrink-0 truncate">{skill}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${Math.max(pct, count === 0 ? 0 : 5)}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-5 text-right ${numColor}`}>{count}</span>
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 text-xs text-gray-400 pt-1">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Missing</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Once</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Well covered</span>
      </div>
    </div>
  )
}
