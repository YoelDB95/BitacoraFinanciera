import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Resumen from './pages/Resumen.jsx'
import Empresa from './pages/Empresa.jsx'
import Rutas from './pages/Rutas.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="trabajo">
          <Route index element={<Navigate to="/trabajo/resumen" replace />} />
          <Route path="resumen" element={<Resumen />} />
          <Route path="empresa" element={<Empresa />} />
        </Route>
        <Route path="transacciones" element={<Transactions />} />
        <Route path="rutas" element={<Rutas />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}