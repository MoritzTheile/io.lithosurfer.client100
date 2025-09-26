import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Account from './pages/Account'
import Register from './pages/Register'
import Activate from './pages/Activate'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordFinish from './pages/ResetPasswordFinish'
import Samples from './pages/Samples'
import SampleDetail from './pages/SampleDetail'
import { ACCESS_TOKEN_STORAGE_KEY } from './lib/config'

export default function App() {
  return (
    <Layout>
      <Routes>
          <Route path="/" element={<Navigate to="/account" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset/finish" element={<ResetPasswordFinish />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/samples"
            element={
              <ProtectedRoute>
                <Samples />
              </ProtectedRoute>
            }
          />
          <Route
            path="/samples/:id"
            element={
              <ProtectedRoute>
                <SampleDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/account" replace />} />
        </Routes>
    </Layout>
  )
}


