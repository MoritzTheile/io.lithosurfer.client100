import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import ProtectedRoute from './lib/ProtectedRoute'
import Login from './modules/auth/pages/Login'
import Account from './modules/auth/pages/Account'
import Register from './modules/auth/pages/Register'
import Activate from './modules/auth/pages/Activate'
import ResetPassword from './modules/auth/pages/ResetPassword'
import ResetPasswordFinish from './modules/auth/pages/ResetPasswordFinish'
import Samples from './modules/samples/pages/Samples'
import SampleDetail from './modules/samples/pages/SampleDetail'
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


