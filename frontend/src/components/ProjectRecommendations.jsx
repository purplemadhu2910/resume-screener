import { useState } from 'react'
import { Hammer, ChevronDown, ChevronUp, Tag } from 'lucide-react'

const DIFFICULTY_STYLE = {
  Beginner:     { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  Intermediate: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',     dot: 'bg-amber-400'   },
  Advanced:     { badge: 'bg-red-500/15 text-red-300 border-red-500/30',            dot: 'bg-red-400'     },
}

function ProjectCard({ project }) {
  const [open, setOpen] = useState(false)
  const style = DIFFICULTY_STYLE[project.difficulty] || DIFFICULTY_STYLE.Intermediate

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left gap-4"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${style.dot}`} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-200 text-sm">{project.title}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${style.badge}`}>
                {project.difficulty}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 capitalize">
                {project.skill}
              </span>
            </div>
          </div>
        </div>
        {open
          ? <ChevronUp size={15} className="text-slate-400 shrink-0 mt-1" />
          : <ChevronDown size={15} className="text-slate-400 shrink-0 mt-1" />
        }
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-white/5 pt-3 space-y-3">
          <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"
              >
                <Tag size={10} className="text-slate-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectRecommendations({ projects }) {
  if (!projects || projects.length === 0) return null

  const byDifficulty = { Beginner: [], Intermediate: [], Advanced: [] }
  projects.forEach(p => {
    if (byDifficulty[p.difficulty]) byDifficulty[p.difficulty].push(p)
    else byDifficulty.Intermediate.push(p)
  })

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hammer size={18} className="text-indigo-400" />
          <h3 className="font-semibold text-slate-200">Recommended Projects</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
          {projects.length} project{projects.length > 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-sm text-slate-400">
        Build these projects to demonstrate the skills this role requires — perfect for your portfolio.
      </p>

      {/* Difficulty legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        {Object.entries(DIFFICULTY_STYLE).map(([level, s]) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${s.dot}`} /> {level}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {projects.map((p, i) => (
          <ProjectCard key={`${p.title}-${i}`} project={p} />
        ))}
      </div>
    </div>
  )
}
