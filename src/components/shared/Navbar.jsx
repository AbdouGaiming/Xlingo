import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>
            <span className="logo-icon">🌍</span>
            <span className="logo-text">Xlingo</span>
          </Link>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className={`toggle-icon ${isMenuOpen ? 'active' : ''}`}></span>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {/* Only show navigation links when user is logged in */}
          {user ? (
            <ul className="navbar-nav">
              <li className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                <Link to="/dashboard" onClick={closeMenu}>
                  <span className="nav-icon">📊</span>
                  Dashboard
                </Link>
              </li>
              <li className={`nav-item ${isActive('/lessons') ? 'active' : ''}`}>
                <Link to="/lessons" onClick={closeMenu}>
                  <span className="nav-icon">📚</span>
                  Lessons
                </Link>
              </li>
              <li className={`nav-item ${isActive('/practice') ? 'active' : ''}`}>
                <Link to="/practice" onClick={closeMenu}>
                  <span className="nav-icon">🎯</span>
                  Practice
                </Link>
              </li>
              <li className={`nav-item ${isActive('/community') ? 'active' : ''}`}>
                <Link to="/community" onClick={closeMenu}>
                  <span className="nav-icon">👥</span>
                  Community
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav">
              {/* Empty navbar-nav to maintain layout when not logged in */}
            </ul>
          )}

          <div className="navbar-actions">
            {user ? (
              <>
                <div className="user-profile">
                  <Link to="/profile" onClick={closeMenu}>
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-level">Level {user.level || 1}</span>
                    </div>
                  </Link>
                </div>
                <button className="logout-button" onClick={onLogout}>
                  <span className="logout-icon">🚪</span>
                  <span className="logout-text">Logout</span>
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-button" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="register-button" onClick={closeMenu}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;