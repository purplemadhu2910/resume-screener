import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  FileText, LogOut, Loader2, AlertCircle, RotateCcw,
  Sparkles, ScanSearch, Moon, Sun, Menu, X,
  History, GitCompare
} from 'lucide-react'
import FileUpload from './FileUpload'
import ResultsDashboard from './ResultsDashboard'
import ResumeOnlyResults from './ResumeOnlyResults'
import HistoryPanel from './HistoryPanel'
import CompareResumes from './CompareResumes'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const JD_SAMPLES = [
  {
    label: 'Frontend',
    text: `We are looking for a Frontend Engineer with strong experience in React, TypeScript, and Tailwind CSS.\nYou should be proficient in JavaScript, HTML, CSS, and have experience with REST APIs, Git, and Agile workflows.\nFamiliarity with Webpack, Vite, and unit testing is a plus.`,
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
  const [mode, setMode] = useState('jd')
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [resultMode, setResultMode] = useState('jd')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [drawer, setDrawer] = useState(null) // null | 'history' | 'compare'

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleAnalyze = async () => {
    if (!file) { setError('Please upload a resume file.'); return }
    if (mode === 'jd' && !jd.trim()) { setError('Please paste a job description.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('resume', file)
      if (mode === 'jd') form.append('job_description', jd)
      const endpoint = mode === 'jd' ? '/analyze' : '/analyze-resume'
      const { data } = await axios.post(`${API}${endpoint}`, form, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      setResult(data)
      setResultMode(mode)
    } catch (err) {
      if (err.response?.status === 401) logout()
      else setError(err.response?.data?.error || 'Server error. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null); setJd(''); setResult(null); setError(''); setDrawer(null)
  }

  const navBg = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
  const pageBg = dark ? 'bg-gray-950' : 'bg-gray-50'
  const textPrimary = dark ? 'text-gray-100' : 'text-gray-900'
  const textMuted = dark ? 'text-gray-400' : 'text-gray-500'
  const cardCls = dark ? 'bg-gray-900 border border-gray-800 rounded-2xl shadow-sm' : 'bg-white border border-gray-200 rounded-2xl shadow-sm'
  const inputCls = dark
    ? 'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 transition-all resize-none'
    : 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none'
  const btnGhost = dark
    ? 'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
    : 'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
  const sampleBtn = dark
    ? 'text-xs px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-indigo-900/40 hover:text-indigo-400 text-gray-400 transition-colors font-medium'
    : 'text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 transition-colors font-medium'

  return (
    <div className={`min-h-screen ${pageBg}`}>
      {/* Navbar */}
      <nav className={`${navBg} border-b sticky top-0 z-20`}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-500" />
            <span className={`font-bold ${textPrimary}`}>ResumeAI</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(v => !v)}
              className={btnGhost}
              title="Toggle dark mode"
            >
              {dark ? <Sun size={13} /> : <Moon size={13} />}
              <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Features menu button */}
            <button
              onClick={() => setDrawer(v => v ? null : 'menu')}
              className={`${btnGhost} ${drawer ? (dark ? 'bg-indigo-900/40 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-200') : ''}`}
            >
              {drawer ? <X size={13} /> : <Menu size={13} />}
              <span className="hidden sm:inline">Tools</span>
            </button>

            <span className={`text-sm hidden sm:block ${textMuted}`}>Hi, {user?.name?.split(' ')[0]}</span>
            <button
              onClick={logout}
              className={`${btnGhost} hover:text-red-500 hover:border-red-300`}
            >
              <LogOut size={13} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Right-side drawer */}
      {drawer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            onClick={() => setDrawer(null)}
          />
          {/* Drawer panel */}
          <div className={`fixed top-0 right-0 h-full w-80 z-40 shadow-2xl flex flex-col ${dark ? 'bg-gray-900 border-l border-gray-800' : 'bg-white border-l border-gray-200'}`}>
            {/* Drawer header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <span className={`font-semibold text-sm ${textPrimary}`}>Tools</span>
              <button onClick={() => setDrawer(null)} className={`${textMuted} hover:text-red-400 transition-colors`}>
                <X size={16} />
              </button>
            </div>

            {/* Drawer tabs */}
            <div className={`flex border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              {[
                { id: 'history', icon: History, label: 'History' },
                { id: 'compare', icon: GitCompare, label: 'Compare' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setDrawer(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors
                    ${drawer === id
                      ? 'border-indigo-500 text-indigo-500'
                      : `border-transparent ${textMuted} hover:text-indigo-400`}`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-4">
              {drawer === 'history' && (
                <HistoryPanel
                  token={user.token}
                  dark={dark}
                  onLoad={(entry) => { setResult(entry); setResultMode('jd'); setDrawer(null) }}
                  onClose={() => setDrawer(null)}
                />
              )}
              {drawer === 'compare' && (
                <CompareResumes
                  token={user.token}
                  jd={jd}
                  dark={dark}
                  onClose={() => setDrawer(null)}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Resume Analyzer</h1>
          <p className={`text-sm ${textMuted}`}>Upload your resume to get instant feedback and improvement suggestions.</p>
        </div>

        {!result ? (
          <div className="space-y-6">
            {/* Mode toggle */}
            <div className={`${cardCls} p-1 inline-flex gap-1`}>
              <button
                onClick={() => { setMode('jd'); setError('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${mode === 'jd' ? 'bg-indigo-600 text-white shadow-sm' : textMuted}`}
              >
                <Sparkles size={14} /> Match with Job Description
              </button>
              <button
                onClick={() => { setMode('resume'); setError('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${mode === 'resume' ? 'bg-indigo-600 text-white shadow-sm' : textMuted}`}
              >
                <ScanSearch size={14} /> Analyze Resume Only
              </button>
            </div>

            <div className={`grid gap-6 ${mode === 'jd' ? 'lg:grid-cols-2' : 'max-w-xl'}`}>
              {/* Upload */}
              <div className={`${cardCls} p-6 space-y-4`}>
                <div>
                  <h2 className={`font-semibold ${textPrimary}`}>Upload Resume</h2>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>PDF or DOCX, max 5MB</p>
                </div>
                <FileUpload file={file} onFileChange={setFile} dark={dark} />
              </div>

              {/* JD panel */}
              {mode === 'jd' && (
                <div className={`${cardCls} p-6 space-y-4`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className={`font-semibold ${textPrimary}`}>Job Description</h2>
                      <p className={`text-xs mt-0.5 ${textMuted}`}>Paste the full job posting</p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {JD_SAMPLES.map(s => (
                        <button key={s.label} onClick={() => setJd(s.text)} className={sampleBtn}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={jd}
                    onChange={e => setJd(e.target.value)}
                    placeholder="Paste the job description here, or pick a sample above…"
                    rows={10}
                    className={inputCls}
                  />
                </div>
              )}
            </div>

            {mode === 'resume' && (
              <div className={`max-w-xl rounded-xl px-4 py-3 text-sm border ${dark ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                We'll analyze your resume structure, detected skills, and give you improvement tips — no job description needed.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-xl">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-8 py-3 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
                : mode === 'jd'
                  ? <><Sparkles size={16} /> Analyze Match</>
                  : <><ScanSearch size={16} /> Analyze Resume</>
              }
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {resultMode === 'jd'
              ? <ResultsDashboard data={result} dark={dark} />
              : <ResumeOnlyResults data={result} dark={dark} />
            }
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors
                ${dark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <RotateCcw size={14} /> Analyze another resume
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
