import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Registration.scss";

// API URL - Configure based on environment, matching Login.jsx
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

    // Username validation
    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 3) {
      tempErrors.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      tempErrors.username =
        "Username can only contain letters, numbers and underscores";
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email address is invalid";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      tempErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      tempErrors.acceptTerms = "You must accept the terms and conditions";
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
      console.log("Attempting registration with:", {
        username: formData.username,
        email: formData.email,
        password: "***",
      });
      console.log("API URL:", `${API_URL}/auth/register`);

      // Make API call to register endpoint
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include", // Include cookies in the request
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (!response.ok) {
        // Handle error response
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            general: data.message || "Registration failed. Please try again.",
          });
        }
        return;
      }

      // Handle successful registration
      setRegistrationSuccess(true);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-form-wrapper">
        {registrationSuccess ? (
          <div className="registration-success">
            <h2>Registration Successful!</h2>
            <p>Your account has been created successfully.</p>
            <p>Please check your email to verify your account.</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <div className="registration-header">
              <h1>Join Xlingo</h1>
              <p>Create your account to start learning languages</p>
            </div>
            <form onSubmit={handleSubmit} className="registration-form">
              {errors.general && (
                <div className="error-message">{errors.general}</div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className={errors.username ? "input-error" : ""}
                  disabled={isLoading}
                />
                {errors.username && (
                  <span className="error">{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={errors.email ? "input-error" : ""}
                  disabled={isLoading}
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className={errors.password ? "input-error" : ""}
                  disabled={isLoading}
                />
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
                <small className="password-hint">
                  Use at least 6 characters with one uppercase letter, one
                  lowercase letter, and one number
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? "input-error" : ""}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <span className="error">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="acceptTerms">
                  I accept the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </label>
                {errors.acceptTerms && (
                  <span className="error">{errors.acceptTerms}</span>
                )}
              </div>

              <button
                type="submit"
                className={`registration-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="registration-footer">
              <p className="login-link">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Registration;
