import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.scss";

// API URL - Configure based on environment
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("xlingoToken");
    const user = localStorage.getItem("xlingoUser");

    if (token && user) {
      console.log("User already logged in, redirecting to home");
      navigate("/");
    }
  }, [navigate]);

  // Handle navigation after successful login
  useEffect(() => {
    if (loginSuccess) {
      const redirectTimer = setTimeout(() => {
        console.log("Login successful, redirecting to home page");
        // Let App.js handle the navigation
      }, 1000); // Slightly longer delay for better UX

      return () => clearTimeout(redirectTimer);
    }
  }, [loginSuccess, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setErrors({});

    try {
      console.log("Attempting login with:", { ...formData, password: "***" });
      console.log("API URL:", `${API_URL}/auth/login-frontend`);

      // Make API call
      const response = await fetch(`${API_URL}/auth/login-frontend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // Include cookies in the request
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        // Handle error response
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            general: data.message || "Login failed. Please try again.",
          });
        }
        return;
      }

      // Handle successful login
      if (data.success && data.user) {
        // Save user data to localStorage
        localStorage.setItem("xlingoUser", JSON.stringify(data.user));

        // Store the token separately for easier access
        if (data.user.token) {
          localStorage.setItem("xlingoToken", data.user.token);
        }

        // Update last login time
        localStorage.setItem("lastLoginTime", new Date().toISOString());

        // Set success state - this will trigger the useEffect for redirection
        setLoginSuccess(true);

        // Call the onLoginSuccess prop to update user state in App component
        if (onLoginSuccess && typeof onLoginSuccess === "function") {
          onLoginSuccess(data.user);

          // Navigate to dashboard after successful login
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }
      } else {
        setErrors({
          general: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    }
  };

  // Generate animated particles
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push(<div key={`particle-${i}`} className="particle"></div>);
    }
    return particles;
  };

  return (
    <div className="login-container">
      {/* Animated background particles */}
      <div className="particles">{renderParticles()}</div>

      {/* Giant X logo in background */}
      <div className="x-logo-bg">X</div>

      <div className="login-form-wrapper">
        <div className="login-header">
          <h1>Welcome to Xlingo</h1>
          <p>Login to your account</p>
        </div>

        {loginSuccess ? (
          <div className="success-message">
            Login successful! Redirecting to home page...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}

            <div className="form-group">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className={errors.username ? "input-error" : ""}
              />
              <label
                htmlFor="username"
                className={formData.username ? "active" : ""}
              >
                Username or Email
              </label>
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={errors.password ? "input-error" : ""}
              />
              <label
                htmlFor="password"
                className={formData.password ? "active" : ""}
              >
                Password
              </label>
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        )}

        <div className="login-footer">
          <p className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p className="signup-link">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
