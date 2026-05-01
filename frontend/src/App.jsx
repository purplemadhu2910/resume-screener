import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import ResumeScreener from './components/ResumeScreener'

function AppRoutes() {
  const { user } = useAuth()
  return user ? <ResumeScreener /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
