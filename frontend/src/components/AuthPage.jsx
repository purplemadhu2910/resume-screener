import { useState } from 'react'
import axios from 'axios'
import { Eye, EyeOff, Loader2, AlertCircle, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AuthPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && !form.name.trim()) {
      setError('Full name is required'); return
    }
    if (!form.username.trim() || !form.password) {
      setError('Username and password are required'); return
    }
    if (mode === 'signup' && form.username.trim().length < 3) {
      setError('Username must be at least 3 characters'); return
    }
    if (mode === 'signup' && !/^[a-z0-9_]+$/i.test(form.username.trim())) {
      setError('Username can only contain letters, numbers, and underscores'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/login' : '/register'
      const payload = mode === 'login'
        ? { username: form.username, password: form.password }
        : { name: form.name, username: form.username, password: form.password }

      const { data } = await axios.post(`${API}${endpoint}`, payload)
      login({ token: data.token, refresh_token: data.refresh_token, name: data.name, username: data.username })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <FileText size={22} className="text-white" />
          <span className="text-white font-bold text-lg">ResumeAI</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Get your resume<br />noticed by recruiters
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed">
            Upload your resume and instantly see how well it matches any job description. Get actionable feedback, skill gap analysis, and a tailored cover letter.
          </p>
          <div className="space-y-3">
            {['Instant match score against job descriptions', 'Skill gap analysis with learning resources', 'AI-generated cover letter'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-indigo-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-xs">Built for students and job seekers</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <FileText size={20} className="text-indigo-600" />
            <span className="font-bold text-gray-900">ResumeAI</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'login' ? "Sign in to your account to continue." : "It's free and takes less than a minute."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="John Doe"
                  className="input"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={set('username')}
                placeholder="johndoe"
                className="input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Please wait…</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
