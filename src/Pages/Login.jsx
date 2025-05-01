import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.scss";

// API URL - using relative URL to avoid CORS issues
const API_URL = "/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("xlingoToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

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

    setIsLoading(true);
    setErrors({});

    try {
      console.log("Attempting login with:", { ...formData, password: "***" });

      // Make API call to login endpoint
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
        setErrors(
          data.errors || { general: "Login failed. Please try again." }
        );
        return;
      }

      // Handle successful login
      if (data.success && data.user) {
        // Set success state
        setLoginSuccess(true);

        // Save user data to localStorage
        localStorage.setItem("xlingoUser", JSON.stringify(data.user));

        // Store the token separately for easier access
        if (data.user.token) {
          localStorage.setItem("xlingoToken", data.user.token);
        }

        // Update last login time
        localStorage.setItem("lastLoginTime", new Date().toISOString());

        // Show success message briefly before redirecting
        setTimeout(() => {
          // Redirect to home page after successful login
          window.location.href = "/"; // Using window.location for a full page refresh
        }, 500);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
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
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username or email"
                className={errors.username ? "input-error" : ""}
                disabled={isLoading}
              />
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? "input-error" : ""}
                disabled={isLoading}
              />
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
                disabled={isLoading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <button
              type="submit"
              className={`login-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p className="signup-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
