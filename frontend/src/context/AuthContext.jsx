import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refresh_token')
    const name = localStorage.getItem('name')
    const username = localStorage.getItem('username')
    return token ? { token, refreshToken, name, username } : null
  })

  const login = ({ token, refresh_token, name, username }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('name', name)
    localStorage.setItem('username', username)
    setUser({ token, refreshToken: refresh_token, name, username })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('name')
    localStorage.removeItem('username')
    setUser(null)
  }

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) { logout(); return null }
    try {
      const { data } = await axios.post(`${API}/refresh`, {}, {
        headers: { Authorization: `Bearer ${refreshToken}` }
      })
      localStorage.setItem('token', data.token)
      setUser(prev => ({ ...prev, token: data.token }))
      return data.token
    } catch {
      logout()
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
