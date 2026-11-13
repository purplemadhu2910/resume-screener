import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const DIFF = {
  Beginner:     { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  Intermediate: { badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400'   },
  Advanced:     { badge: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-400'     },
}

function ProjectCard({ project }) {
  const [open, setOpen] = useState(false)
  const style = DIFF[project.difficulty] || DIFF.Intermediate

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left gap-4"
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-700 text-sm">{project.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>{project.difficulty}</span>
              <span className="badge-blue capitalize">{project.skill}</span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={14} className="text-gray-400 shrink-0 mt-1" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3 space-y-2">
          <p className="text-sm text-gray-500 leading-relaxed">{project.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map(t => <span key={t} className="badge-gray">{t}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectRecommendations({ projects }) {
  if (!projects || projects.length === 0) return null
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 mb-3">Build these to demonstrate the skills this role requires.</p>
      {projects.map((p, i) => <ProjectCard key={`${p.title}-${i}`} project={p} />)}
    </div>
  )
}
