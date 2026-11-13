import { CheckCircle2, XCircle, Lightbulb, TrendingUp, BookOpen, Code2 } from 'lucide-react'
import LearningRoadmap from './LearningRoadmap'
import ProjectRecommendations from './ProjectRecommendations'

function SectionCheck({ label, present }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${present ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      {present
        ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
        : <XCircle size={16} className="text-red-400 shrink-0" />
      }
      <span className={`text-sm font-medium ${present ? 'text-emerald-700' : 'text-red-600'}`}>{label}</span>
      <span className={`ml-auto text-xs font-medium ${present ? 'text-emerald-600' : 'text-red-500'}`}>
        {present ? 'Found' : 'Missing'}
      </span>
    </div>
  )
}

function strengthLabel(score) {
  if (score >= 75) return { label: 'Strong', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
  if (score >= 45) return { label: 'Average', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
  return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
}

export default function ResumeOnlyResults({ data }) {
  const { score, sections_found, detected_skills, suggestions, word_count, learning_resources, project_recommendations } = data
  const strength = strengthLabel(score)

  return (
    <div className="space-y-5">
      {/* Score hero */}
      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={score >= 75 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{score}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${strength.bg} ${strength.color}`}>
            {strength.label}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Resume Analysis Complete</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            We scanned your resume for structure, skills, and content quality. Here's what we found.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-sm">
            <span className="text-gray-600"><span className="font-semibold text-gray-900">{word_count}</span> words</span>
            <span className="text-gray-600"><span className="font-semibold text-gray-900">{detected_skills?.length ?? 0}</span> skills detected</span>
          </div>
        </div>
      </div>

      {/* Sections check */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={17} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-800">Resume Sections</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <SectionCheck label="Work Experience" present={sections_found?.experience} />
          <SectionCheck label="Education" present={sections_found?.education} />
          <SectionCheck label="Skills" present={sections_found?.skills} />
          <SectionCheck label="Projects" present={sections_found?.projects} />
        </div>
      </div>

      {/* Detected skills */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Code2 size={17} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-800">Detected Skills</h3>
          <span className="ml-auto badge-blue">{detected_skills?.length ?? 0} found</span>
        </div>
        {detected_skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {detected_skills.map(s => (
              <span key={s} className="badge-green capitalize">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No recognizable skills detected. Make sure to list your skills explicitly.</p>
        )}
      </div>

      {/* Suggestions */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={17} className="text-amber-500" />
          <h3 className="font-semibold text-gray-800">Improvement Tips</h3>
        </div>
        <ul className="space-y-2.5">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
              <TrendingUp size={14} className="text-amber-500 mt-0.5 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Learning resources */}
      {learning_resources?.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Recommended Learning</h3>
          </div>
          <LearningRoadmap resources={learning_resources} />
        </div>
      )}

      {/* Project recommendations */}
      {project_recommendations?.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 size={17} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Project Ideas to Build</h3>
          </div>
          <ProjectRecommendations projects={project_recommendations} />
        </div>
      )}
    </div>
  )
}
