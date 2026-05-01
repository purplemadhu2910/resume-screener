import { useEffect, useState } from 'react'
import axios from 'axios'
import { History, Trash2, RotateCcw, ChevronRight, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function HistoryPanel({ token, onLoad, onClose }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHistory(data.history || [])
    } catch {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  const handleDelete = async (id) => {
    await axios.delete(`${API}/history/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setHistory(h => h.filter(e => e.id !== id))
  }

  const scoreColor = (s) =>
    s >= 70 ? 'text-emerald-400' : s >= 45 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={18} className="text-violet-400" />
          <h3 className="font-semibold text-slate-200">Analysis History</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 text-center py-4">Loading…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No past analyses yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {history.map(entry => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">{entry.filename}</p>
                <p className="text-xs text-slate-500">{entry.date}</p>
              </div>
              <div className="flex items-center gap-3 ml-3 shrink-0">
                <span className={`text-sm font-bold ${scoreColor(entry.score)}`}>{entry.score}%</span>
                <button
                  onClick={() => { onLoad(entry); onClose() }}
                  className="text-slate-400 hover:text-violet-400 transition-colors"
                  title="Reload this result"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
