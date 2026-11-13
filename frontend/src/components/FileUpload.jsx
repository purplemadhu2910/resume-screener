import { useState, useCallback } from 'react'
import { Upload, CheckCircle, X } from 'lucide-react'

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

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed transition-all duration-200 p-8 text-center cursor-pointer
        ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
        ${file ? 'border-emerald-300 bg-emerald-50 cursor-default' : ''}`}
      onClick={() => !file && document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFileChange(e.target.files[0])}
      />

      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800 text-sm truncate max-w-[180px]">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onFileChange(null) }}
            className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
            <Upload size={20} className="text-indigo-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm">Drop your resume here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse &middot; PDF or DOCX</p>
          </div>
        </div>
      )}
    </div>
  )
}
