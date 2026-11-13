import { useState } from 'react'
import axios from 'axios'
import { GitCompare, Upload, X, Loader2, Trophy, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function CompareResumes({ token, jd, onClose, dark }) {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addFiles = (e) => {
    const picked = Array.from(e.target.files).filter(f => f.name.endsWith('.pdf') || f.name.endsWith('.docx'))
    setFiles(prev => [...prev, ...picked].slice(0, 5))
  }

  const handleCompare = async () => {
    if (files.length < 2) { setError('Upload at least 2 resumes.'); return }
    if (!jd.trim()) { setError('Fill in the job description first.'); return }
    setError(''); setLoading(true); setResults(null)
    try {
      const form = new FormData()
      form.append('job_description', jd)
      files.forEach((f, i) => form.append(`resume_${i}`, f))
      const { data } = await axios.post(`${API}/compare`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setResults(data.results)
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed.')
    } finally {
      setLoading(false)
    }
  }

  const rankColor = (r) => r === 1 ? 'text-yellow-500' : r === 2 ? 'text-gray-400' : r === 3 ? 'text-amber-600' : 'text-gray-300'
  const scoreColor = (s) => s >= 70 ? 'text-emerald-500' : s >= 45 ? 'text-amber-500' : 'text-red-500'
  const rowCls = dark ? 'flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 border border-gray-700' : 'flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-200'
  const resultCard = dark ? 'p-3 rounded-xl border border-gray-800 space-y-2' : 'p-3 rounded-xl border border-gray-200 space-y-2'
  const labelCls = dark ? 'text-xs px-2 py-0.5 rounded-lg bg-gray-800 capitalize text-gray-400' : 'text-xs px-2 py-0.5 rounded-lg bg-gray-100 capitalize text-gray-500'

  return (
    <div className="space-y-4">
      <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Upload up to 5 resumes to rank them against the job description.</p>

      <div className="space-y-2">
        {files.map((f, i) => (
          <div key={i} className={rowCls}>
            <span className={`text-sm truncate ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{f.name}</span>
            <button onClick={() => setFiles(fs => fs.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-400 transition-colors ml-2 shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
        {files.length < 5 && (
          <label className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dark ? 'border-gray-700 hover:border-indigo-600 hover:bg-indigo-900/20' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
            <Upload size={14} className="text-gray-400" />
            <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-400'}`}>Add resume (PDF or DOCX)</span>
            <input type="file" accept=".pdf,.docx" multiple className="hidden" onChange={addFiles} />
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertCircle size={13} className="shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={handleCompare}
        disabled={loading || files.length < 2}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <><Loader2 size={14} className="animate-spin" /> Comparing…</> : <><GitCompare size={14} /> Compare & Rank</>}
      </button>

      {results && (
        <div className="space-y-2 pt-1">
          <p className={`text-xs font-medium uppercase tracking-wider ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Rankings</p>
          {results.map(r => (
            <div key={r.filename} className={resultCard}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className={rankColor(r.rank)} />
                  <span className={`text-sm font-semibold truncate max-w-[140px] ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{r.filename}</span>
                </div>
                <span className={`text-base font-extrabold ${scoreColor(r.score)}`}>{r.score}%</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={11} /> {r.matched_skills.length} matched</span>
                <span className="flex items-center gap-1 text-red-500"><XCircle size={11} /> {r.missing_skills.length} missing</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['skills', 'experience', 'education'].map(k => (
                  <span key={k} className={labelCls}>
                    {k}: <span className={`font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{r.score_breakdown[k]}%</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
