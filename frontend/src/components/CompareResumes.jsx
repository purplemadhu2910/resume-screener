import { useState } from 'react'
import axios from 'axios'
import { GitCompare, Upload, X, Loader2, Trophy, CheckCircle2, XCircle } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function CompareResumes({ token, jd, onClose }) {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addFiles = (e) => {
    const picked = Array.from(e.target.files).filter(
      f => f.name.endsWith('.pdf') || f.name.endsWith('.docx')
    )
    setFiles(prev => [...prev, ...picked].slice(0, 5))
  }

  const removeFile = (i) => setFiles(f => f.filter((_, idx) => idx !== i))

  const handleCompare = async () => {
    if (files.length < 2) { setError('Upload at least 2 resumes to compare.'); return }
    if (!jd.trim()) { setError('Please fill in the job description first.'); return }
    setError('')
    setLoading(true)
    setResults(null)
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

  const rankColor = (rank) => rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-slate-500'
  const scoreColor = (s) => s >= 70 ? 'text-emerald-400' : s >= 45 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare size={18} className="text-indigo-400" />
          <h3 className="font-semibold text-slate-200">Compare Resumes</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X size={16} />
        </button>
      </div>
      <p className="text-xs text-slate-500">Upload up to 5 resumes to rank them against the job description.</p>

      {/* File list */}
      <div className="space-y-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm text-slate-300 truncate">{f.name}</span>
            <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 transition-colors ml-2">
              <X size={14} />
            </button>
          </div>
        ))}
        {files.length < 5 && (
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-white/20 hover:border-violet-500/50 cursor-pointer transition-colors">
            <Upload size={14} className="text-slate-400" />
            <span className="text-sm text-slate-400">Add resume (PDF/DOCX)</span>
            <input type="file" accept=".pdf,.docx" multiple className="hidden" onChange={addFiles} />
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
      )}

      <button
        onClick={handleCompare}
        disabled={loading || files.length < 2}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white text-sm transition-all flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Comparing…</> : <><GitCompare size={16} /> Compare & Rank</>}
      </button>

      {results && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Rankings</p>
          {results.map(r => (
            <div key={r.filename} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={15} className={rankColor(r.rank)} />
                  <span className="text-sm font-semibold text-slate-200 truncate max-w-[180px]">{r.filename}</span>
                </div>
                <span className={`text-lg font-extrabold ${scoreColor(r.score)}`}>{r.score}%</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={12} /> {r.matched_skills.length} matched</span>
                <span className="flex items-center gap-1 text-red-400"><XCircle size={12} /> {r.missing_skills.length} missing</span>
              </div>
              <div className="flex gap-2 text-xs text-slate-500">
                {['skills', 'experience', 'education'].map(k => (
                  <span key={k} className="px-2 py-0.5 rounded-lg bg-white/5 capitalize">
                    {k}: <span className="text-slate-300">{r.score_breakdown[k]}%</span>
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
