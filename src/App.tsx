import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Flame } from 'lucide-react';
import TopBar from './components/TopBar';
import Header from './components/Header';
import PurposeBanner from './components/PurposeBanner';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HeatmapPage from './pages/HeatmapPage';
import ReportHazardPage from './pages/ReportHazardPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import AccountabilityPage from './pages/AccountabilityPage';
import GalleryPage from './pages/GalleryPage';
import QuizPage from './pages/QuizPage';
import { useHazardStore } from './lib/store';

export default function App() {
  const { loading, init } = useHazardStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <TopBar />
      <Header />
      <PurposeBanner />
      <main className="flex-1 bg-paper">
        {loading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink/50">
            <Flame size={28} className="animate-pulse text-ember" />
            <p className="text-[13px] font-medium">Loading live hazard data…</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/report" element={<ReportHazardPage />} />
            <Route path="/accountability" element={<AccountabilityPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/dashboard" element={<OfficerDashboardPage />} />
          </Routes>
        )}
      </main>
      <Footer />
    </BrowserRouter>
  );
}
