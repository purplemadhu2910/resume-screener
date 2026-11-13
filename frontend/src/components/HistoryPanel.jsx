import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trash2, ChevronRight, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function HistoryPanel({ token, onLoad, onClose, dark }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setHistory(r.data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    await axios.delete(`${API}/history/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    setHistory(h => h.filter(e => e.id !== id))
  }

  const scoreColor = (s) => s >= 70 ? 'text-emerald-500' : s >= 45 ? 'text-amber-500' : 'text-red-500'
  const rowCls = dark
    ? 'flex items-center justify-between p-3 rounded-xl border border-gray-800 hover:border-indigo-700 hover:bg-indigo-900/20 transition-all'
    : 'flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all'

  if (loading) return <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-gray-400" /></div>

  if (history.length === 0) return (
    <p className={`text-sm text-center py-10 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No past analyses yet.</p>
  )

  return (
    <div className="space-y-2">
      {history.map(entry => (
        <div key={entry.id} className={rowCls}>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium truncate ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{entry.filename}</p>
            <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{entry.date}</p>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <span className={`text-sm font-bold ${scoreColor(entry.score)}`}>{entry.score}%</span>
            <button onClick={() => { onLoad(entry); onClose() }} className={`transition-colors ${dark ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-500'}`} title="View">
              <ChevronRight size={15} />
            </button>
            <button onClick={() => handleDelete(entry.id)} className={`transition-colors ${dark ? 'text-gray-600 hover:text-red-400' : 'text-gray-300 hover:text-red-400'}`} title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
