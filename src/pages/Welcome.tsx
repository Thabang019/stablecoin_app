import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="landing-container">
      <h1 className="main-title">Welcome to Stablecoin App</h1>
      <p className="subtitle">Your secure platform for stablecoin transactions</p>
      <div className="link-container">
        <Link to="/login" className="btn-link">Login</Link>
        <Link to="/signup" className="btn-link">Sign Up</Link>
      </div>
    </div>
  )
}

export default LandingPage
