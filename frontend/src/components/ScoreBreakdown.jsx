import { useEffect, useState } from 'react'

function Bar({ label, score }) {
  const [animated, setAnimated] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 150); return () => clearTimeout(t) }, [score])

  const color = score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-400' : 'bg-red-400'
  const text = score >= 70 ? 'text-emerald-600' : score >= 45 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 font-medium capitalize">{label}</span>
        <span className={`font-bold ${text}`}>{score}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  )
}

export default function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">How well your resume covers JD skills across each section.</p>
      <Bar label="Skills Section" score={breakdown.skills} />
      <Bar label="Experience" score={breakdown.experience} />
      <Bar label="Education" score={breakdown.education} />
    </div>
  )
}
