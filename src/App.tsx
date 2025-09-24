import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Account from './pages/Account'
import Map from './pages/Map'
import Register from './pages/Register'
import Activate from './pages/Activate'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordFinish from './pages/ResetPasswordFinish'
import Samples from './pages/Samples'
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
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
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
         {/* test comment */}
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Routes>
    </Layout>
  )
}


