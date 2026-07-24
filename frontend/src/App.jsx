import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import Sidebar from './components/layout/Sidebar';
import OverviewPage from './pages/OverviewPage';
import MonteCarloPage from './pages/MonteCarloPage';
import MLPage from './pages/MLPage';
import CompliancePage from './pages/CompliancePage';

export default function App() {
  return (
    <ModeProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-void)', color: 'var(--text-primary)' }}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 ml-[220px]">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/montecarlo" element={<MonteCarloPage />} />
              <Route path="/ml" element={<MLPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ModeProvider>
  );
}
