import { useEffect, useState } from 'react'

function getColors(score) {
  if (score >= 70) return { stroke: '#10b981', label: 'Excellent Match', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600' }
  if (score >= 45) return { stroke: '#f59e0b', label: 'Moderate Match', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600' }
  return { stroke: '#ef4444', label: 'Low Match', badge: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-600' }
}

export default function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const colors = getColors(score)
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100)
    return () => clearTimeout(t)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={radius} fill="none"
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={colors.stroke}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold ${colors.text}`}>{score}%</span>
          <span className="text-xs text-gray-400 font-medium">Match</span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colors.badge}`}>{colors.label}</span>
    </div>
  )
}
