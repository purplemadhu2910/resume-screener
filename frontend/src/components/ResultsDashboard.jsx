import { useRef } from 'react'
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, Download } from 'lucide-react'
import ScoreRing from './ScoreRing'
import ScoreBreakdown from './ScoreBreakdown'
import SkillBadge from './SkillBadge'
import LearningRoadmap from './LearningRoadmap'
import ProjectRecommendations from './ProjectRecommendations'
import KeywordDensity from './KeywordDensity'
import CoverLetter from './CoverLetter'

function Section({ icon: Icon, title, iconClass, children }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className={iconClass} />
        <h3 className="font-semibold text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ResultsDashboard({ data }) {
  const { score, score_breakdown, matched_skills, missing_skills, suggestions, learning_resources, project_recommendations, keyword_density, cover_letter } = data
  const printRef = useRef()

  const handleDownloadPDF = () => {
    const content = `
RESUME ANALYSIS REPORT
======================
Overall Score: ${score}%

Score Breakdown:
  Skills Section : ${score_breakdown?.skills ?? 'N/A'}%
  Experience     : ${score_breakdown?.experience ?? 'N/A'}%
  Education      : ${score_breakdown?.education ?? 'N/A'}%

Matched Skills (${matched_skills.length}):
${matched_skills.join(', ') || 'None'}

Missing Skills (${missing_skills.length}):
${missing_skills.join(', ') || 'None'}

Improvement Suggestions:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

ATS Keyword Density:
${(keyword_density || []).slice(0, 15).map(d => `  ${d.skill}: ${d.count} mention(s)`).join('\n')}

---
COVER LETTER
${cover_letter || ''}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume_analysis_report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6" ref={printRef}>
      {/* Score hero */}
      <div className="glass rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8">
        <ScoreRing score={score} />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-100">Analysis Complete</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your resume was compared against the job description using TF-IDF cosine similarity.
            The score reflects keyword and context alignment.
          </p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={15} />
              <span>{matched_skills.length} skills matched</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <XCircle size={15} />
              <span>{missing_skills.length} skills missing</span>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-violet-500/20 hover:text-violet-300 text-slate-400 border border-white/10 text-sm transition-all"
          >
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      {/* Score breakdown */}
      <ScoreBreakdown breakdown={score_breakdown} />

      {/* Skills grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Section icon={CheckCircle2} title="Matched Skills" iconClass="text-emerald-400">
          {matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matched_skills.map(s => <SkillBadge key={s} skill={s} variant="matched" />)}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No common skills detected.</p>
          )}
        </Section>

        <Section icon={XCircle} title="Missing Skills" iconClass="text-red-400">
          {missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missing_skills.map(s => <SkillBadge key={s} skill={s} variant="missing" />)}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No missing skills — great coverage!</p>
          )}
        </Section>
      </div>

      {/* Suggestions */}
      <Section icon={Lightbulb} title="Improvement Suggestions" iconClass="text-amber-400">
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <TrendingUp size={15} className="text-amber-400 mt-0.5 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </Section>

      {/* Keyword Density */}
      <KeywordDensity density={keyword_density} />

      {/* Cover Letter */}
      <CoverLetter coverLetter={cover_letter} />

      {/* Learning Roadmap */}
      <LearningRoadmap resources={learning_resources} />

      {/* Project Recommendations */}
      <ProjectRecommendations projects={project_recommendations} />
    </div>
  )
}
