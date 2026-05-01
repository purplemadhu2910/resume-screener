import { useState } from 'react'
import { FileText, Copy, Check, Download } from 'lucide-react'

export default function CoverLetter({ coverLetter }) {
  const [copied, setCopied] = useState(false)

  if (!coverLetter) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cover_letter.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-pink-400" />
          <h3 className="font-semibold text-slate-200">Cover Letter Generator</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 hover:text-violet-300 text-slate-400 border border-white/10 transition-all"
          >
            {copied ? <><Check size={13} className="text-emerald-400" /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 hover:text-violet-300 text-slate-400 border border-white/10 transition-all"
          >
            <Download size={13} /> Download
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Auto-generated based on your matched skills and the job description. Edit before sending.
      </p>
      <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-white/5 border border-white/10 rounded-xl p-4 leading-relaxed font-sans">
        {coverLetter}
      </pre>
    </div>
  )
}
