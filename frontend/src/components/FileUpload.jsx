import { useState, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

export default function FileUpload({ file, onFileChange }) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.name.endsWith('.pdf') || dropped.name.endsWith('.docx'))) {
      onFileChange(dropped)
    }
  }, [onFileChange])

  const handleChange = (e) => {
    if (e.target.files[0]) onFileChange(e.target.files[0])
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer
        ${dragging ? 'border-violet-400 bg-violet-500/10' : 'border-white/20 hover:border-violet-500/50 hover:bg-white/5'}
        ${file ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
      onClick={() => !file && document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleChange}
      />

      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-100 text-sm truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onFileChange(null) }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto">
            <Upload size={22} className="text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">Drop your resume here</p>
            <p className="text-sm text-slate-400 mt-1">or click to browse · PDF, DOCX</p>
          </div>
        </div>
      )}
    </div>
  )
}
