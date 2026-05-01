import { useState } from 'react'
import { BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

const LEVEL_STYLE = {
  Beginner:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Intermediate: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Advanced:     'bg-red-500/15 text-red-300 border-red-500/30',
}

const PLATFORM_STYLE = {
  Coursera:       'bg-blue-500/15 text-blue-300',
  YouTube:        'bg-red-500/15 text-red-300',
  'freeCodeCamp': 'bg-orange-500/15 text-orange-300',
  Kaggle:         'bg-cyan-500/15 text-cyan-300',
  'Official Docs':'bg-slate-500/15 text-slate-300',
  'Free Book':    'bg-purple-500/15 text-purple-300',
  GitHub:         'bg-slate-500/15 text-slate-300',
  default:        'bg-violet-500/15 text-violet-300',
}

function getPlatformStyle(platform) {
  return PLATFORM_STYLE[platform] || PLATFORM_STYLE.default
}

function SkillCard({ item }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <BookOpen size={15} className="text-violet-400" />
          </div>
          <span className="font-semibold text-slate-200 capitalize">{item.skill}</span>
          <span className="text-xs text-slate-500">{item.courses.length} resource{item.courses.length > 1 ? 's' : ''}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
          {item.courses.map((course, i) => (
            <a
              key={i}
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/20 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-violet-300 transition-colors truncate">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformStyle(course.platform)}`}>
                      {course.platform}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_STYLE[course.level]}`}>
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-500 group-hover:text-violet-400 transition-colors shrink-0 ml-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LearningRoadmap({ resources }) {
  if (!resources || resources.length === 0) return null

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-violet-400" />
          <h3 className="font-semibold text-slate-200">Learning Roadmap</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium">
          {resources.length} skill{resources.length > 1 ? 's' : ''} to learn
        </span>
      </div>

      <p className="text-sm text-slate-400">
        Curated free resources to help you close the skill gap for this role.
      </p>

      <div className="space-y-3">
        {resources.map((item) => (
          <SkillCard key={item.skill} item={item} />
        ))}
      </div>
    </div>
  )
}
