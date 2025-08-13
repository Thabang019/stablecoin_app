import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Welcome to Stablecoin App</h1>
      <p>Your secure platform for stablecoin transactions</p>
      <div style={{ marginTop: 20 }}>
        <Link to="/login" style={{ marginRight: 15 }}>Login</Link>
        <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  )
}

export default LandingPage
