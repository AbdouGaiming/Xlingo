import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Login from "./Pages/Login";
import Registration from "./Pages/Registration";
import Home from "./Pages/Home/Home";
import Navbar from "./components/shared/Navbar";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Community from "./Pages/Community/Community";
import FriendProfile from "./Pages/Community/components/profile/FriendProfile";
import LessonsAdventure from "./Pages/LessonsAdventure/LessonsAdventure";
import LanguageSelector from "./components/language/LanguageSelector";
import VocabularyFlashcards from "./components/language/VocabularyFlashcards";
import PronunciationPractice from "./Pages/Practice/PronunciationPractice";
import Practice from "./Pages/Practice/Practice";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Protected route component to handle auth checks consistently
const ProtectedRoute = ({ children }) => {
  const userFromStorage = localStorage.getItem("xlingoUser");
  const tokenFromStorage = localStorage.getItem("xlingoToken");

  if (!userFromStorage || !tokenFromStorage) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on initial load and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const userFromStorage = localStorage.getItem("xlingoUser");
      const tokenFromStorage = localStorage.getItem("xlingoToken");

      if (userFromStorage && tokenFromStorage) {
        try {
          const parsedUser = JSON.parse(userFromStorage);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          localStorage.removeItem("xlingoUser");
          localStorage.removeItem("xlingoToken");
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "xlingoUser" || e.key === "xlingoToken") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("xlingoUser");
    localStorage.removeItem("xlingoToken");
    localStorage.removeItem("lastLoginTime");
    setUser(null);
  };

  const handleSelectLanguage = useCallback(
    (language) => {
      if (user) {
        const updatedUser = { ...user, currentLanguage: language };
        localStorage.setItem("xlingoUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    },
    [user]
  );

  // Don't render until we've checked authentication
  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <AppContent
          user={user}
          setUser={setUser}
          handleLogout={handleLogout}
          handleSelectLanguage={handleSelectLanguage}
        />
      </BrowserRouter>
    </div>
  );
}

// Separate component to access router hooks
function AppContent({ user, setUser, handleLogout, handleSelectLanguage }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Update user when logging in
  const handleLogin = useCallback(
    (userData) => {
      setUser(userData);
      navigate("/dashboard");
    },
    [navigate, setUser]
  );

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="app-content">
        <Routes>
          {/* Home route - main landing page */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* Login route */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLoginSuccess={handleLogin} />
              )
            }
          />

          {/* Registration route */}
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Registration />}
          />

          {/* Language Selection */}
          <Route
            path="/select-language"
            element={
              <ProtectedRoute>
                <LanguageSelector
                  onSelectLanguage={(lang) => {
                    handleSelectLanguage(lang);
                    navigate("/dashboard");
                  }}
                />
              </ProtectedRoute>
            }
          />

          {/* Dashboard route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Community routes */}
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/profile/:userId"
            element={
              <ProtectedRoute>
                <FriendProfile />
              </ProtectedRoute>
            }
          />

          {/* Lessons Adventure route */}
          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <LessonsAdventure />
              </ProtectedRoute>
            }
          />

          {/* Specific Lesson route */}
          <Route
            path="/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LessonsAdventure />
              </ProtectedRoute>
            }
          />

          {/* Base Practice route */}
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />

          {/* Specific Practice routes (like vocabulary) */}
          <Route
            path="/practice/vocabulary/:categoryId"
            element={
              <ProtectedRoute>
                <VocabularyFlashcards
                  languageId={user?.currentLanguage?.id || "es"}
                  categoryId={location.pathname.split("/").pop()}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/practice/vocabulary"
            element={
              <ProtectedRoute>
                <VocabularyFlashcards
                  languageId={user?.currentLanguage?.id || "es"}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/practice/pronunciation"
            element={
              <ProtectedRoute>
                <PronunciationPractice />
              </ProtectedRoute>
            }
          />

          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
