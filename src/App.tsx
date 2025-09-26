import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import ProtectedRoute from './lib/ProtectedRoute'
import { Login, Account, Register, Activate, ResetPassword, ResetPasswordFinish } from './modules/auth'
import { Samples, SampleDetail } from './modules/samples'
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


