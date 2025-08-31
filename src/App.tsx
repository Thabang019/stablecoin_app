import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Welcome'
import LoginPage from './pages/SignIn'
import SignUpPage from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/Profile'
import SendMoneyPage from './pages/Send'
import RequestDetailsPage from './pages/RequestDetails'
import CollaborativeDashboard from './pages/PaymentsDashboard'

function App() {
  return (
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
        <Route path="/scan" element={<SendMoneyPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App