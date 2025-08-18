import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string }>({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.user) {
        setUserData(parsedUser.user);
      } else {
        setUserData(parsedUser);
      }
    }
  }, []);

  const handleLogout = () => {
    try {
      setUserData({
        firstName: "",
        lastName: "",
        email: "",
      });

      localStorage.removeItem('user');
      localStorage.removeItem('userId');
  
      window.location.href = '/login'; 
      
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "auto",
        padding: 20,
        color: "white",
        backgroundColor: "#121212",
        borderRadius: 12,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Profile</h2>

      <div style={{ marginBottom: 12 }}>
        <label>First Name:</label>
        <input
          type="text"
          value={userData.firstName}
          readOnly
          style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Last Name:</label>
        <input
          type="text"
          value={userData.lastName}
          readOnly
          style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Email:</label>
        <input
          type="email"
          value={userData.email}
          readOnly
          style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6 }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </div>

    </div>
  );
};

export default ProfilePage;
