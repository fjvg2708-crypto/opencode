import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetsList from './pages/AssetsList';
import AssetDetail from './pages/AssetDetail';
import NewAssetWizard from './pages/NewAssetWizard';
import QrScanner from './pages/QrScanner';
import ScanResolve from './pages/ScanResolve';
import Alerts from './pages/Alerts';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<AssetsList />} />
          <Route path="/assets/new" element={<NewAssetWizard />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/scan" element={<QrScanner />} />
          <Route path="/scan/:token" element={<ScanResolve />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Route>
    </Routes>
  );
}
