import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/Welcome'
import LoginPage from './pages/SignIn'
import SignUpPage from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/Profile'
import SendMoneyPage from './pages/Send'
import RequestDetailsPage from './pages/RequestDetails'
import CollaborativeDashboard from './pages/PaymentsDashboard'

import { registerSW } from 'virtual:pwa-register'
import { logger } from './utils/logger'

// Initialize logger
logger.info('Application starting', { 
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE 
});

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/send" element={<SendMoneyPage />} />
          <Route path="/request/:requestId" element={<RequestDetailsPage />} />
          <Route path="/collaborative" element={<CollaborativeDashboard />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
