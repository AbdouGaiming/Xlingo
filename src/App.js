import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Pages/Login";
import Registration from "./Pages/Registration";
import Home from "./Pages/Home/Home";
import Navbar from "./components/shared/Navbar";
import Dashboard from "./Pages/Dashboard/Dashboard";
import LanguageSelector from "./components/language/LanguageSelector";
import VocabularyFlashcards from "./components/language/VocabularyFlashcards";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  // Check if user is logged in
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userFromStorage = localStorage.getItem("xlingoUser");
    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("xlingoUser");
    localStorage.removeItem("xlingoToken");
    setUser(null);
    window.location.href = "/login";
  };

  const handleSelectLanguage = (language) => {
    if (user) {
      // Update user's selected language
      const updatedUser = { ...user, currentLanguage: language };
      localStorage.setItem("xlingoUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="app-content">
          <Routes>
            {/* Home route - main landing page */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />

            {/* Login route */}
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Login />}
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
                user ? (
                  <LanguageSelector onSelectLanguage={handleSelectLanguage} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Dashboard route */}
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />

            {/* Practice routes */}
            <Route
              path="/practice/vocabulary/:categoryId"
              element={
                user ? (
                  <VocabularyFlashcards
                    languageId={user?.currentLanguage?.id || "es"}
                    categoryId="food"
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/practice/vocabulary"
              element={
                user ? (
                  <VocabularyFlashcards
                    languageId={user?.currentLanguage?.id || "es"}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Catch all other routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
