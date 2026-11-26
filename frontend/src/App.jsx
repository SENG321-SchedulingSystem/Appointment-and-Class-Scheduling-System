import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import AdminPage from './pages/AdminPage'
import InstructorPage from './pages/InstructorPage'
import LoginPage from './pages/LoginPage'
import StudentPage from './pages/StudentPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute role="INSTRUCTOR">
                <InstructorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
