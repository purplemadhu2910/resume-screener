import { BarChart2 } from 'lucide-react'

export default function KeywordDensity({ density }) {
  if (!density || density.length === 0) return null

  const top = density.slice(0, 15)
  const max = Math.max(...top.map(d => d.count), 1)

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 size={18} className="text-cyan-400" />
        <h3 className="font-semibold text-slate-200">ATS Keyword Density</h3>
      </div>
      <p className="text-xs text-slate-500">
        How many times each required JD keyword appears in your resume. Aim for at least 1–2 mentions per key skill.
      </p>
      <div className="space-y-2.5">
        {top.map(({ skill, count }) => {
          const pct = (count / max) * 100
          const color = count === 0 ? 'bg-red-500/60' : count === 1 ? 'bg-amber-500/60' : 'bg-emerald-500/60'
          return (
            <div key={skill} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 capitalize w-32 shrink-0 truncate">{skill}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${Math.max(pct, count === 0 ? 0 : 4)}%` }}
                />
              </div>
              <span className={`text-xs font-semibold w-6 text-right ${count === 0 ? 'text-red-400' : count === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {count}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 text-xs text-slate-500 pt-1">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/60" /> Missing</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500/60" /> Mentioned once</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500/60" /> Well covered</span>
      </div>
    </div>
  )
}
