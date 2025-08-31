import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // Login
        const response = await fetch("https://zarstablecoin-app.onrender.com/api/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userId = await response.text();
        localStorage.setItem("userId", userId);

        // Fetch user details
        const getUserResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${API_AUTH_TOKEN}` // Or remove if not needed
          }
        });

        const data = await getUserResponse.json();

        if (!getUserResponse.ok) {
          alert(data.message || "Error fetching user");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data));

        console.log("Response data:", data);
        navigate("/dashboard");
        
      } catch (error) {
        alert("Something went wrong. Please try again later.");
        console.error("Login error:", error);
      }
    };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: 400, margin: 'auto', padding: 20, textAlign: 'center' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Email</label><br />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Password</label><br />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 16px' }}>Login</button>
        </form>
        <p style={{ marginTop: 12 }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage