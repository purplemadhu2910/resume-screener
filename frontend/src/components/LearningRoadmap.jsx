import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

const LEVEL_STYLE = {
  Beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced:     'bg-red-50 text-red-700 border-red-200',
}

function SkillCard({ item }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-indigo-500" />
          <span className="font-semibold text-gray-700 capitalize text-sm">{item.skill}</span>
          <span className="text-xs text-gray-400">{item.courses.length} resource{item.courses.length > 1 ? 's' : ''}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2 border-t border-gray-100 pt-2">
          {item.courses.map((course, i) => (
            <a
              key={i}
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition-all group"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors truncate">{course.title}</p>
                <div className="flex items-center gap-2">
                  <span className="badge-gray">{course.platform}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_STYLE[course.level]}`}>{course.level}</span>
                </div>
              </div>
              <ExternalLink size={13} className="text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0 ml-3" />
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
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Curated resources to help you close the skill gap.</p>
      {resources.map(item => <SkillCard key={item.skill} item={item} />)}
    </div>
  )
}
