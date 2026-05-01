import { useState } from 'react'
import axios from 'axios'
import { Sparkles, Loader2, AlertCircle, RotateCcw, LogOut, History, GitCompare } from 'lucide-react'
import FileUpload from './FileUpload'
import ResultsDashboard from './ResultsDashboard'
import HistoryPanel from './HistoryPanel'
import CompareResumes from './CompareResumes'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const JD_SAMPLES = [
  {
    label: 'Frontend',
    text: `We are looking for a Frontend Engineer with strong experience in React, TypeScript, and Tailwind CSS.\nYou should be proficient in JavaScript, HTML, CSS, and have experience with REST APIs, Git, and Agile workflows.\nFamiliarity with Webpack, Vite, and unit testing is a plus. Strong communication and teamwork skills required.`,
  },
  {
    label: 'Data Scientist',
    text: `Seeking a Data Scientist skilled in Python, machine learning, deep learning, and NLP.\nMust have hands-on experience with scikit-learn, TensorFlow, PyTorch, pandas, and numpy.\nExperience with SQL, data analysis, feature engineering, and model deployment on AWS or GCP is preferred.`,
  },
  {
    label: 'Backend',
    text: `Looking for a Backend Engineer with expertise in Python, FastAPI or Django, PostgreSQL, Redis, and Docker.\nExperience with microservices, system design, CI/CD pipelines, and Kubernetes is required.\nProficiency in Git, Linux, and REST API design is essential.`,
  },
]

export default function ResumeScreener() {
  const { user, logout } = useAuth()
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showCompare, setShowCompare] = useState(false)

  const handleAnalyze = async () => {
    if (!file || !jd.trim()) {
      setError('Please upload a resume and provide a job description.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('resume', file)
      form.append('job_description', jd)
      const { data } = await axios.post(`${API}/analyze`, form, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      setResult(data)
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
      } else {
        setError(err.response?.data?.error || 'Server error. Make sure the backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setJd('')
    setResult(null)
    setError('')
    setShowHistory(false)
    setShowCompare(false)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <span className="font-bold text-slate-100 text-sm">Resume Screener</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowHistory(v => !v); setShowCompare(false) }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${showHistory ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
            >
              <History size={13} /> History
            </button>
            <button
              onClick={() => { setShowCompare(v => !v); setShowHistory(false) }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${showCompare ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
            >
              <GitCompare size={13} /> Compare
            </button>
            <span className="text-sm text-slate-400 hidden sm:block">👋 {user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-white/10 hover:border-red-500/20 transition-all"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles size={13} /> AI-Powered
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Resume{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Screener
            </span>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Upload your resume and paste a job description to get an instant compatibility score powered by NLP.
          </p>
        </div>

        {/* History panel */}
        {showHistory && (
          <HistoryPanel
            token={user.token}
            onLoad={(entry) => setResult(entry)}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Compare panel */}
        {showCompare && (
          <CompareResumes
            token={user.token}
            jd={jd}
            onClose={() => setShowCompare(false)}
          />
        )}

        {!result ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left — Upload */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-slate-200 text-sm uppercase tracking-wider">1 · Upload Resume</h2>
              <FileUpload file={file} onFileChange={setFile} />
            </div>

            {/* Right — JD */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-200 text-sm uppercase tracking-wider">2 · Job Description</h2>
                <div className="flex gap-1">
                  {JD_SAMPLES.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setJd(s.text)}
                      className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-violet-500/20 hover:text-violet-300 text-slate-400 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={jd}
                onChange={e => setJd(e.target.value)}
                placeholder="Paste the job description here, or click a sample above…"
                rows={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>

            {/* CTA */}
            <div className="lg:col-span-2 space-y-3">
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white text-base transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Analyzing…</>
                  : <><Sparkles size={18} /> Analyze Resume</>
                }
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ResultsDashboard data={result} />
            <button
              onClick={handleReset}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-colors"
            >
              <RotateCcw size={15} /> Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
