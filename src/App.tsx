import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
  const init = useHazardStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <TopBar />
      <Header />
      <PurposeBanner />
      <main className="flex-1 bg-paper">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/report" element={<ReportHazardPage />} />
          <Route path="/accountability" element={<AccountabilityPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/dashboard" element={<OfficerDashboardPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
