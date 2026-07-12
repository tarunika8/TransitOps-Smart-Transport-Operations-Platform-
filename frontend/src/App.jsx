import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Drivers from './pages/Drivers.jsx';
import Trips from './pages/Trips.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Fuel from './pages/Fuel.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import { ToastProvider } from './hooks/useToast.jsx';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/fuel" element={<Fuel />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
