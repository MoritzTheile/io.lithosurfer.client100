import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Account from './pages/Account'
import { ACCESS_TOKEN_STORAGE_KEY } from './lib/config'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/account" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
         {/* test comment */}
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Routes>
    </Layout>
  )
}


