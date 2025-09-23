import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Account from './pages/Account'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/account" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
         {/* test comment */}
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Routes>
    </Layout>
  )
}


