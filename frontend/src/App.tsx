import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SkyScene, { MAX_ADS } from './components/SkyScene';
import AdCreator from './components/AdCreator';
import VehicleDetailsModal from './components/VehicleDetailsModal';
import AuthVerify from './pages/AuthVerify';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Docs from './pages/Docs';
import { useAppDispatch, useAppSelector } from './store';
import { toggleAdCreator, setTimeOfDay } from './store/slices/uiSlice';
import { fetchActiveAds } from './store/slices/adsSlice';
import { checkAuth } from './store/slices/authSlice';
import { RootState } from './store';
import { UIState } from './store/slices/uiSlice';
import { useTranslation } from 'react-i18next';

// Custom hook for viewport height management
const useViewportHeight = () => {
  const [height] = useState(() => {
    if (window.visualViewport) {
      return window.visualViewport.height;
    }
    return window.innerHeight;
  });
  return height;
};

// Custom hook for time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) return 'day';
  return 'night';
};

// GitHub button component
const GitHubButton: React.FC = () => (
  <a
    href="https://github.com/carlosmds/mods"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition flex items-center justify-center"
    title="GitHub"
  >
    <img src="/icons/github.svg" alt="GitHub" className="w-6 h-6" />
  </a>
);

const MainApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAdCreatorOpen } = useAppSelector((state: RootState) => state.ui as UIState);
  const ads = useAppSelector((state: RootState) => state.ads.ads);
  const isMaxAdsReached = ads.length >= MAX_ADS;
  const { t } = useTranslation();
  const initialHeight = useViewportHeight();

  // Check authentication status and fetch active ads on initial load and after navigation
  useEffect(() => {
    dispatch(checkAuth());
    dispatch(fetchActiveAds());
  }, [dispatch, location.pathname]);

  // Update time of day based on system time
  useEffect(() => {
    const updateTimeOfDay = () => {
      dispatch(setTimeOfDay(getTimeOfDay()));
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="relative w-full min-h-screen" style={{ touchAction: 'none' }}>
      {/* Fixed background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: initialHeight, zIndex: 0 }}>
        <SkyScene 
          width={window.innerWidth}
          height={initialHeight}
        />
      </div>
      {/* Foreground UI */}
      <div className="fixed bottom-8 right-8 group flex flex-row items-end space-x-3" style={{ zIndex: 10 }}>
        <GitHubButton />
        {/* Floating action button for creating new ads */}
        <button
          onClick={() => !isMaxAdsReached && dispatch(toggleAdCreator())}
          className={`bg-blue-500 text-white p-4 rounded-full shadow-lg transition-colors relative flex items-center justify-center
            ${isMaxAdsReached ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={isMaxAdsReached}
        >
          <svg
            className="w-6 h-6 mr-0 md:mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="hidden md:inline text-base font-medium">{t('ads.add_new_ad')}</span>
          <span className="inline md:hidden text-base font-medium">{t('ads.add_new_ad')}</span>
        </button>
        {isMaxAdsReached && (
          <div className="absolute bottom-16 right-0 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {t('ads.max_limit', { max: MAX_ADS })}
          </div>
        )}
      </div>

      {/* Ad Creator Modal */}
      {isAdCreatorOpen && !isMaxAdsReached && <div style={{ zIndex: 20, position: 'relative' }}><AdCreator /></div>}

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/auth/verify/:token" element={<AuthVerify />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
    </Router>
  );
};

export default App;
