import { useEffect, useState } from 'react'

function MiniRing({ label, score }) {
  const [animated, setAnimated] = useState(0)
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  const color =
    score >= 70 ? 'stroke-emerald-400' :
    score >= 45 ? 'stroke-amber-400' :
    'stroke-red-400'

  const textColor =
    score >= 70 ? 'text-emerald-400' :
    score >= 45 ? 'text-amber-400' :
    'text-red-400'

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 150)
    return () => clearTimeout(t)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 font-medium capitalize">{label}</span>
    </div>
  )
}

export default function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-slate-200 text-sm">Score Breakdown</h3>
      <p className="text-xs text-slate-500">How well your resume covers JD skills across each section.</p>
      <div className="flex justify-around">
        <MiniRing label="Skills Section" score={breakdown.skills} />
        <MiniRing label="Experience" score={breakdown.experience} />
        <MiniRing label="Education" score={breakdown.education} />
      </div>
    </div>
  )
}
