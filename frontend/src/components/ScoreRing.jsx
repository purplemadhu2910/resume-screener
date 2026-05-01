import { useEffect, useState } from 'react'

function getScoreColor(score) {
  if (score >= 70) return { ring: 'text-emerald-400', track: 'stroke-emerald-400', label: 'Excellent Match', bg: 'bg-emerald-500/10 text-emerald-400' }
  if (score >= 45) return { ring: 'text-amber-400', track: 'stroke-amber-400', label: 'Moderate Match', bg: 'bg-amber-500/10 text-amber-400' }
  return { ring: 'text-red-400', track: 'stroke-red-400', label: 'Low Match', bg: 'bg-red-500/10 text-red-400' }
}

export default function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const colors = getScoreColor(score)
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-white/10" />
          <circle
            cx="64" cy="64" r={radius} fill="none"
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colors.track} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold ${colors.ring}`}>{score}%</span>
          <span className="text-xs text-slate-400 font-medium">Match</span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.bg}`}>{colors.label}</span>
    </div>
  )
}
