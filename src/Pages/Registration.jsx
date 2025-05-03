import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Registration.scss";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  withLoading,
} from "../components/shared/SweetAlert/SweetAlert";

// API URL - Configure based on environment
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const Registration = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("xlingoToken");
    const user = localStorage.getItem("xlingoUser");

    if (token && user) {
      navigate("/");
    }

    // Get selected language from localStorage
    const languageFromStorage = localStorage.getItem("selectedLanguage");
    if (languageFromStorage) {
      setSelectedLanguage(JSON.parse(languageFromStorage));
    }
  }, [navigate]);

  // Handle input changes
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

  // Form validation
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.firstName.trim()) {
      tempErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      tempErrors.lastName = "Last name is required";
      isValid = false;
    }

    // Username validation
    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      tempErrors.username =
        "Username can only contain letters, numbers, and underscores";
      isValid = false;
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      tempErrors.username = "Username must be between 3 and 30 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Terms agreement validation
    if (!formData.agreeTerms) {
      tempErrors.agreeTerms = "You must agree to the terms and conditions";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Direct login after registration
  const loginAfterRegistration = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login-frontend`, {
        username: email, // Most login systems accept either username or email
        password: password,
        rememberMe: true,
      });

      if (response.data && response.data.success && response.data.user) {
        // Save user data and token to localStorage
        localStorage.setItem("xlingoUser", JSON.stringify(response.data.user));
        localStorage.setItem("xlingoToken", response.data.user.token);
        localStorage.setItem("lastLoginTime", new Date().toISOString());

        return true;
      }
      return false;
    } catch (error) {
      console.error("Auto-login failed:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Clear any previous errors
    setErrors({});

    // Validation
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await withLoading(
        axios.post(`${API_URL}/auth/register`, {
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
        {
          loadingTitle: "Creating Account",
          loadingText: "Setting up your new Xlingo account...",
        }
      );

      // Try to automatically log in the user
      const autoLoginSuccess = await loginAfterRegistration(
        formData.email,
        formData.password
      );

      setIsLoading(false);

      if (autoLoginSuccess) {
        // Show success message
        showSuccessAlert(
          "Account Created!",
          "Welcome to Xlingo! You've been automatically logged in."
        );

        // Set success state and redirect to dashboard
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // If auto-login fails, show success but redirect to login
        showSuccessAlert(
          "Registration Successful!",
          "Your account has been created. Please log in."
        );

        // Set success state and redirect to login after a delay
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );

      if (error.response && error.response.data) {
        // Handle validation errors from backend
        if (
          error.response.data.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          const fieldErrors = {};
          error.response.data.errors.forEach((err) => {
            fieldErrors[err.param] = err.msg;
          });
          setErrors({ ...fieldErrors });
          showErrorAlert(
            "Registration Failed",
            "Please check the form for errors."
          );
        } else if (error.response.data.message) {
          setErrors({ general: error.response.data.message });
          showErrorAlert("Registration Failed", error.response.data.message);
        } else {
          setErrors({ general: "Registration failed. Please try again." });
          showErrorAlert(
            "Registration Failed",
            "Registration failed. Please try again."
          );
        }
      } else {
        setErrors({ general: "Registration failed. Please try again later." });
        showErrorAlert(
          "Registration Failed",
          "Registration failed. Please try again later."
        );
      }
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
    <div className="registration-container">
      {/* Animated background particles */}
      <div className="particles">{renderParticles()}</div>

      {/* Giant X logo in background */}
      <div className="x-logo-bg">X</div>

      <div className="registration-form-wrapper">
        <div className="registration-header">
          <h1>Join Xlingo</h1>
          <p>Create an account to start your language journey</p>
          {selectedLanguage && (
            <p>Selected Language: {selectedLanguage.name}</p>
          )}
        </div>

        {registrationSuccess ? (
          <div className="success-message">
            Registration successful! Logging you in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="registration-form">
            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className={errors.firstName ? "input-error" : ""}
                  disabled={isLoading}
                />
                <label
                  htmlFor="firstName"
                  className={formData.firstName ? "active" : ""}
                >
                  First Name
                </label>
                {errors.firstName && (
                  <span className="error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className={errors.lastName ? "input-error" : ""}
                  disabled={isLoading}
                />
                <label
                  htmlFor="lastName"
                  className={formData.lastName ? "active" : ""}
                >
                  Last Name
                </label>
                {errors.lastName && (
                  <span className="error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className={errors.username ? "input-error" : ""}
                disabled={isLoading}
                autoComplete="username"
              />
              <label
                htmlFor="username"
                className={formData.username ? "active" : ""}
              >
                Username
              </label>
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className={errors.email ? "input-error" : ""}
                disabled={isLoading}
                autoComplete="email"
              />
              <label htmlFor="email" className={formData.email ? "active" : ""}>
                Email Address
              </label>
              {errors.email && <span className="error">{errors.email}</span>}
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
                disabled={isLoading}
                autoComplete="new-password"
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

            <div className="form-group">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className={errors.confirmPassword ? "input-error" : ""}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <label
                htmlFor="confirmPassword"
                className={formData.confirmPassword ? "active" : ""}
              >
                Confirm Password
              </label>
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="form-terms">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label htmlFor="agreeTerms">
                I agree to the <Link to="/terms">Terms & Conditions</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
              {errors.agreeTerms && (
                <span className="error">{errors.agreeTerms}</span>
              )}
            </div>

            <button
              type="submit"
              className={`register-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="registration-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
