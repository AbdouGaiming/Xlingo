import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const menuRef = useRef(null);

  // Initialize or update user state whenever the user prop or localStorage changes
  useEffect(() => {
    const checkUserState = () => {
      const storedUser = localStorage.getItem('xlingoUser');
      
      // If we have a user prop, use it
      if (user) {
        setCurrentUser(user);
        return;
      }
      
      // If no user prop but we have stored user data, use that
      if (storedUser && localStorage.getItem('xlingoToken')) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('xlingoUser');
          localStorage.removeItem('xlingoToken');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    checkUserState();
  }, [user, location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Clear user data
    setCurrentUser(null);
    
    // Call the provided logout handler
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    }
    
    closeMenu();
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

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} ref={menuRef}>
          {/* Navigation links - only show when logged in */}
          {currentUser ? (
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
            {currentUser ? (
              <>
                <div className="user-profile">
                  <Link to="/profile" onClick={closeMenu}>
                    <div className="user-avatar">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name || currentUser.username} />
                      ) : (
                        <span>{(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{currentUser.name || currentUser.username || 'User'}</span>
                      <span className="user-level">Level {currentUser.level || 1}</span>
                    </div>
                  </Link>
                </div>
                <button className="logout-button" onClick={handleLogout}>
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