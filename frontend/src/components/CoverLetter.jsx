import { useState } from 'react'
import { Copy, Check, Download, FileText } from 'lucide-react'

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
    a.href = url; a.download = 'cover_letter.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={17} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-800">Cover Letter</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3">
            {copied ? <><Check size={13} className="text-emerald-500" /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
          <button onClick={handleDownload} className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3">
            <Download size={13} /> Download
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400">Auto-generated from your matched skills. Edit before sending.</p>
      <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 leading-relaxed font-sans">
        {coverLetter}
      </pre>
    </div>
  )
}
