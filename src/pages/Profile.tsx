import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string }>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleEditProfile = () => {
    console.log("Edit profile clicked");
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-color)",
        minHeight: "100vh",
        padding: isDesktop ? "40px" : "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: isDesktop ? "center" : "flex-start"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isDesktop ? 700 : "100%",
          margin: isDesktop ? "0" : "0 auto",
          padding: isDesktop ? 75 : 30,
          color: "white",
          background: "var(--glass-bg)",
          backdropFilter: "blur(10px)",
          borderRadius: isDesktop ? 20 : 12,
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <h2 style={{ 
          marginBottom: isDesktop ? 24 : 20, 
          fontWeight: 600,
          fontSize: isDesktop ? "1.5rem" : "1.25rem"
        }}>
          Profile
        </h2>

        <div style={{ marginBottom: isDesktop ? 20 : 16 }}>
          <label style={{ 
            fontSize: isDesktop ? "0.875rem" : "0.75rem", 
            color: "rgba(255, 255, 255, 0.7)",
            display: "block",
            marginBottom: 6
          }}>
            First Name:
          </label>
          <input
            type="text"
            value={userData.firstName}
            readOnly
            style={{ 
              width: "100%", 
              padding: isDesktop ? 16 : 12, 
              marginTop: 4, 
              borderRadius: isDesktop ? 12 : 8,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.87)",
              fontSize: isDesktop ? "1rem" : "0.875rem",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div style={{ marginBottom: isDesktop ? 20 : 16 }}>
          <label style={{ 
            fontSize: isDesktop ? "0.875rem" : "0.75rem", 
            color: "rgba(255, 255, 255, 0.7)",
            display: "block",
            marginBottom: 6
          }}>
            Last Name:
          </label>
          <input
            type="text"
            value={userData.lastName}
            readOnly
            style={{ 
              width: "100%", 
              padding: isDesktop ? 16 : 12, 
              marginTop: 4, 
              borderRadius: isDesktop ? 12 : 8,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.87)",
              fontSize: isDesktop ? "1rem" : "0.875rem",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div style={{ marginBottom: isDesktop ? 28 : 24 }}>
          <label style={{ 
            fontSize: isDesktop ? "0.875rem" : "0.75rem", 
            color: "rgba(255, 255, 255, 0.7)",
            display: "block",
            marginBottom: 6
          }}>
            Email:
          </label>
          <input
            type="email"
            value={userData.email}
            readOnly
            style={{ 
              width: "100%", 
              padding: isDesktop ? 16 : 12, 
              marginTop: 4, 
              borderRadius: isDesktop ? 12 : 8,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.87)",
              fontSize: isDesktop ? "1rem" : "0.875rem",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button
            onClick={handleEditProfile}
            style={{
              padding: "12px 20px",
              background: "var(--accent-color)",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
          >
            Edit Profile
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              padding: "12px 20px",
              background: "rgba(248, 113, 113, 0.1)",
              color: "#f87171",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
