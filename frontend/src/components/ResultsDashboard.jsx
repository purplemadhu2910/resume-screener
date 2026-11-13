import { useRef } from 'react'
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, Download, BookOpen, Code2, BarChart2 } from 'lucide-react'
import ScoreRing from './ScoreRing'
import ScoreBreakdown from './ScoreBreakdown'
import LearningRoadmap from './LearningRoadmap'
import ProjectRecommendations from './ProjectRecommendations'
import KeywordDensity from './KeywordDensity'
import CoverLetter from './CoverLetter'

export default function ResultsDashboard({ data }) {
  const { score, score_breakdown, matched_skills, missing_skills, suggestions, learning_resources, project_recommendations, keyword_density, cover_letter } = data
  const printRef = useRef()

  const handleDownload = () => {
    const content = `RESUME ANALYSIS REPORT\n${'='.repeat(40)}\nOverall Score: ${score}%\n\nScore Breakdown:\n  Skills: ${score_breakdown?.skills ?? 'N/A'}%\n  Experience: ${score_breakdown?.experience ?? 'N/A'}%\n  Education: ${score_breakdown?.education ?? 'N/A'}%\n\nMatched Skills (${matched_skills.length}):\n${matched_skills.join(', ') || 'None'}\n\nMissing Skills (${missing_skills.length}):\n${missing_skills.join(', ') || 'None'}\n\nSuggestions:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${'='.repeat(40)}\nCOVER LETTER\n${cover_letter || ''}`.trim()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'resume_analysis.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5" ref={printRef}>
      {/* Score hero */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <ScoreRing score={score} />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900">Analysis Complete</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your resume was compared against the job description using TF-IDF cosine similarity — measuring keyword and context alignment.
          </p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={14} />
              <span>{matched_skills.length} skills matched</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-500">
              <XCircle size={14} />
              <span>{missing_skills.length} skills missing</span>
            </div>
          </div>
          <button onClick={handleDownload} className="btn-ghost inline-flex items-center gap-2 text-sm">
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={17} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-800">Score Breakdown</h3>
        </div>
        <ScoreBreakdown breakdown={score_breakdown} />
      </div>

      {/* Skills grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-emerald-500" />
            <h3 className="font-semibold text-gray-800">Matched Skills</h3>
            <span className="ml-auto badge-green">{matched_skills.length}</span>
          </div>
          {matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matched_skills.map(s => <span key={s} className="badge-green capitalize">{s}</span>)}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No common skills detected.</p>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle size={17} className="text-red-400" />
            <h3 className="font-semibold text-gray-800">Missing Skills</h3>
            <span className="ml-auto badge-red">{missing_skills.length}</span>
          </div>
          {missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missing_skills.map(s => <span key={s} className="badge-red capitalize">{s}</span>)}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No missing skills — great coverage!</p>
          )}
        </div>
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

      {/* Keyword Density */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={17} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-800">Keyword Density</h3>
        </div>
        <KeywordDensity density={keyword_density} />
      </div>

      {/* Cover Letter */}
      <div className="card p-6 space-y-4">
        <CoverLetter coverLetter={cover_letter} />
      </div>

      {/* Learning Roadmap */}
      {learning_resources?.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Learning Roadmap</h3>
          </div>
          <LearningRoadmap resources={learning_resources} />
        </div>
      )}

      {/* Project Recommendations */}
      {project_recommendations?.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 size={17} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Project Ideas</h3>
          </div>
          <ProjectRecommendations projects={project_recommendations} />
        </div>
      )}
    </div>
  )
}
