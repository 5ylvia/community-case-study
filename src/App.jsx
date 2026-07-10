import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./lib/auth";
import { mockCities } from "./mocks/data";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import TogetherPage from "./pages/TogetherPage";
import HomemealPage from "./pages/HomemealPage";
import RecoPage from "./pages/RecoPage";
import MePage from "./pages/MePage";
import NotificationsPage from "./pages/NotificationsPage";
import AuthPage from "./pages/AuthPage";
import CitySelectPage from "./pages/CitySelectPage";
import ReviewModal from "./components/ReviewModal";
import TermsPage from "./pages/TermsPage";
import DetailPage from "./pages/DetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import LowTurnoutModal from "./components/LowTurnoutModal.jsx";

function AppContent() {
  const { user, profile, guest, basePath, enterGuest, setViewCityId, setViewCitySlug } = useAuth();
  const location = useLocation();

  // Auto-switch city when URL points to a different city (logged-in user)
  useEffect(() => {
    if (!user || guest) return;
    const match = location.pathname.match(/^\/([a-z-]+)\//);
    if (!match) return;
    const citySlug = match[1];
    const urlCity = mockCities.find((c) => c.name.toLowerCase().replace(/\s+/g, "-") === citySlug);
    if (urlCity && urlCity.id !== profile?.city_id) {
      setViewCityId(urlCity.id);
      setViewCitySlug(`/${citySlug}`);
    }
  }, []);

  // Auto guest entry when accessing a city URL directly
  if (!user && !guest) {
    const match = location.pathname.match(/^\/([a-z-]+)\//);
    if (match) {
      return <AutoGuest path={location.pathname} enterGuest={enterGuest} />;
    }
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Redirect to home when accessing /login while logged in
  if (location.pathname === "/login" && user) return (
    <Routes>
      <Route path="/login" element={<Navigate to={`${basePath}/homemeal`} replace />} />
    </Routes>
  );

  // Guest accessing /login → login page (without layout)
  if (location.pathname === "/login" && guest) return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
    </Routes>
  );

  if (!guest) {
    if (profile && profile.flame_score <= 5) return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-heading font-bold text-ink mb-2">Your Ember has gone out</p>
          <p className="text-body text-ink-soft leading-relaxed">Your trust score is too low to continue using the service.<br />You can start fresh with a new account.</p>
        </div>
      </div>
    );
    if (profile && !profile.city_id) return <CitySelectPage />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-sans md:pl-20">
      <Header />
      <div className="max-w-120 mx-auto">
        <Routes>
          <Route path="/:city/homemeal" element={<HomemealPage />} />
          <Route path="/:city/homemeal/:id" element={<DetailPage />} />
          <Route path="/:city/together" element={<TogetherPage />} />
          <Route path="/:city/together/:id" element={<DetailPage />} />
          <Route path="/:city/reco" element={<RecoPage />} />
          <Route path="/:city/reco/:id" element={<DetailPage />} />
          <Route path="/me" element={guest ? <Navigate to="/login" replace /> : <MePage />} />
          <Route path="/notifications" element={guest ? <Navigate to="/login" replace /> : <NotificationsPage onBack={() => window.history.back()} />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={basePath ? <Navigate to={`${basePath}/homemeal`} replace /> : <NotFoundPage />} />
        </Routes>
      </div>
      <TabBar />
      <ReviewModal />
      <LowTurnoutModal />
    </div>
  );
}

function AutoGuest({ path, enterGuest }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const match = path.match(/^\/([a-z-]+)\//);
    if (!match) { setLoading(false); return; }
    const [, citySlug] = match;

    const city = mockCities.find((c) =>
      c.name.toLowerCase().replace(/\s+/g, "-") === citySlug
    );
    if (city) {
      enterGuest(city.id, `/${citySlug}`);
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-ink-soft text-body">Loading...</div>
    </div>
  );
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename="/community-case-study">
          <AppContent />
          <Analytics />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
