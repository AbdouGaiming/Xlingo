import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("xlingoUser");
  const user = isLoggedIn
    ? JSON.parse(localStorage.getItem("xlingoUser"))
    : null;

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
