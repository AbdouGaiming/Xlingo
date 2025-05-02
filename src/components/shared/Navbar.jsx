import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.scss";

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const isInitialMount = useRef(true);

  // Initialize or update user state whenever the user prop or localStorage changes
  useEffect(() => {
    const checkUserState = () => {
      try {
        const storedUser = localStorage.getItem("xlingoUser");
        const token = localStorage.getItem("xlingoToken");

        // If we have a user prop, use it
        if (user) {
          setCurrentUser(user);
          return;
        }

        // If no user prop but we have stored user data, use that
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error checking user state:", error);
        localStorage.removeItem("xlingoUser");
        localStorage.removeItem("xlingoToken");
        setCurrentUser(null);
      }
    };

    checkUserState();
  }, [user]);

  // Monitor user authentication status
  useEffect(() => {
    // Skip on initial mount to avoid unnecessary redirects
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Check if on protected page but not authenticated
    const protectedRoutes = [
      "/dashboard",
      "/lessons",
      "/practice",
      "/community",
      "/profile",
    ];
    const isProtectedRoute = protectedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (isProtectedRoute && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, location.pathname, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const isActive = useCallback(
    (path) => {
      // Exact match for dashboard
      if (path === "/dashboard" && location.pathname === "/dashboard") {
        return true;
      }
      // StartsWith match for others, ensuring it's not just a partial match of another top-level route
      if (path !== "/dashboard" && location.pathname.startsWith(path)) {
        // Check if the next character is a '/' or the end of the string
        const nextChar = location.pathname[path.length];
        return nextChar === "/" || nextChar === undefined;
      }
      return false; // No match
    },
    [location.pathname]
  );

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("xlingoUser");
    localStorage.removeItem("xlingoToken");
    localStorage.removeItem("lastLoginTime");
    setCurrentUser(null);

    // Call the provided logout handler
    if (onLogout && typeof onLogout === "function") {
      onLogout();
    }

    closeMenu();
    navigate("/");
  };

  const handleNavLinkClick = (path) => {
    if (
      !currentUser &&
      path !== "/" &&
      !path.includes("login") &&
      !path.includes("register")
    ) {
      navigate("/login");
      return;
    }

    closeMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" onClick={() => handleNavLinkClick("/")}>
            <span className="logo-icon">🌍</span>
            <span className="logo-text brand-text">Xlingo</span>
          </Link>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className={`toggle-icon ${isMenuOpen ? "active" : ""}`}></span>
        </div>

        <div
          className={`navbar-menu ${isMenuOpen ? "active" : ""}`}
          ref={menuRef}
        >
          {/* Navigation links - only show when logged in */}
          {currentUser ? (
            <ul className="navbar-nav">
              <li
                className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
              >
                <Link
                  to="/dashboard"
                  onClick={() => handleNavLinkClick("/dashboard")}
                >
                  <span className="nav-icon">📊</span>
                  Dashboard
                </Link>
              </li>
              <li
                className={`nav-item ${isActive("/lessons") ? "active" : ""}`}
              >
                <Link
                  to="/lessons"
                  onClick={() => handleNavLinkClick("/lessons")}
                >
                  <span className="nav-icon">📚</span>
                  Lessons
                </Link>
              </li>
              <li
                className={`nav-item ${isActive("/practice") ? "active" : ""}`}
              >
                <Link
                  to="/practice"
                  onClick={() => handleNavLinkClick("/practice")}
                >
                  <span className="nav-icon">🎯</span>
                  Practice
                </Link>
              </li>
              <li
                className={`nav-item ${isActive("/community") ? "active" : ""}`}
              >
                <Link
                  to="/community"
                  onClick={() => handleNavLinkClick("/community")}
                >
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
                  <Link
                    to="/profile"
                    onClick={() => handleNavLinkClick("/profile")}
                  >
                    <div className="user-avatar">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name || currentUser.username}
                        />
                      ) : (
                        <span>
                          {(currentUser.name || currentUser.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {currentUser.name || currentUser.username || "User"}
                      </span>
                      <span className="user-level">
                        Level {currentUser.level || 1}
                      </span>
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
                <Link
                  to="/login"
                  className="login-button"
                  onClick={() => handleNavLinkClick("/login")}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="register-button"
                  onClick={() => handleNavLinkClick("/register")}
                >
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
