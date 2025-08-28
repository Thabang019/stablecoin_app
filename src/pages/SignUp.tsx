import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const SignUpPage = () => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (password !== confirmPassword) {
    alert("Passwords don't match")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
      })
    })

    const data = await response.json()
    console.log('External API response:', data)

    if (!response.ok) {
      alert(data.message || 'Error creating user externally')
      return
    }

      const saveResponse = await fetch("https://zarstablecoin-app.onrender.com/api/user/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          userId: data.user.id,
          role: "User",
          phoneNumber,
        }),
      })

      const saveData = await saveResponse.json()
      console.log('Local backend response:', saveData)

      if (!saveResponse.ok) {
        alert(saveData.message || 'Error saving user locally')
        return
      }

      alert('Sign up successful! Please log in.')
      navigate('/login')

    } catch (error) {
      alert('Something went wrong. Please try again later.')
      console.error('SignUp error:', error)
    }
  }


  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>First Name</label><br />
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Last Name</label><br />
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
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
        <div style={{ marginBottom: 12 }}>
          <label>Confirm Password</label><br />
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
         <div style={{ marginBottom: 12 }}>
          <label>Phone Number</label><br />
          <input
            type="text"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px' }}>Sign Up</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default SignUpPage
