import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AssignStudentPage from './pages/admin/AssignStudentPage'
import CreateUserPage from './pages/admin/CreateUserPage'
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
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<CreateUserPage />} />
            <Route path="pairings" element={<AssignStudentPage />} />
          </Route>
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
