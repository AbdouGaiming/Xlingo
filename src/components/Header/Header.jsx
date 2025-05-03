import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("xlingoUser");
  const user = isLoggedIn
    ? JSON.parse(localStorage.getItem("xlingoUser"))
    : null;
  const [userStats, setUserStats] = useState(null);

  // Fetch user stats including streak when component mounts
  useEffect(() => {
    if (isLoggedIn && user?._id) {
      // In a real app, you'd fetch this from your API
      // For now, we'll simulate getting user stats
      const mockFetchUserStats = async () => {
        try {
          // This would be a real API call in production
          // const response = await fetch(`/api/users/${user._id}/stats`);
          // const data = await response.json();
          
          // For demo purposes, we'll get streak from localStorage or use a default
          const userData = JSON.parse(localStorage.getItem("xlingoUser"));
          setUserStats({
            streak: userData?.streak?.count || 0,
            xp: userData?.xp || 0
          });
        } catch (error) {
          console.error("Error fetching user stats:", error);
        }
      };
      
      mockFetchUserStats();
    }
  }, [isLoggedIn, user]);

  const handleLogout = () => {
    localStorage.removeItem("xlingoUser");
    localStorage.removeItem("xlingoToken");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/">
            <h1 className="logo">Xlingo</h1>
          </Link>
        </div>

        <nav className="navigation">
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/courses">Courses</Link>
            </li>
            <li>
              <Link to="/resources">Resources</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>

        <div className="auth-container">
          {isLoggedIn ? (
            <>
              <span className="welcome-text">
                Welcome, {user?.username || "User"}
              </span>
              
              {userStats && (
                <div className="user-stats">
                  <div className="streak-count" title="Your current streak">
                    <span className="streak-icon">🔥</span>
                    <span className="count">{userStats.streak}</span>
                  </div>
                  <div className="xp-count" title="Experience points">
                    <span className="xp-icon">✨</span>
                    <span className="count">{userStats.xp}</span>
                  </div>
                </div>
              )}
              
              <Link to="/dashboard" className="dashboard-btn">
                Dashboard
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
