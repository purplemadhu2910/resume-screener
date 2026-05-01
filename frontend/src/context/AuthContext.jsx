import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('name')
    const email = localStorage.getItem('email')
    return token ? { token, name, email } : null
  })

  const login = ({ token, name, email }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('name', name)
    localStorage.setItem('email', email)
    setUser({ token, name, email })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('email')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
