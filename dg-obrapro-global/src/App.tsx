import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from './store/appStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ObrasPage from './pages/ObrasPage'
import ObraDetailPage from './pages/ObraDetailPage'
import RegistroPage from './pages/RegistroPage'
import FeedPage from './pages/FeedPage'
import RankingsPage from './pages/RankingsPage'
import MapaPage from './pages/MapaPage'
import PaisesPage from './pages/PaisesPage'
import EmpresasPage from './pages/EmpresasPage'
import AtividadesPage from './pages/AtividadesPage'
import RelatoriosPage from './pages/RelatoriosPage'
import EquipasPage from './pages/EquipasPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#F5F5F5',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#F5C518', secondary: '#0A0A0A' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#0A0A0A' },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="obras" element={<ObrasPage />} />
          <Route path="obras/:id" element={<ObraDetailPage />} />
          <Route path="obras/:id/registro" element={<RegistroPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="mapa" element={<MapaPage />} />
          <Route path="paises" element={<PaisesPage />} />
          <Route path="empresas" element={<EmpresasPage />} />
          <Route path="atividades" element={<AtividadesPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="equipas" element={<EquipasPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
