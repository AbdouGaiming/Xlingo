import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import PronunciationPractice from "./Pages/Practice/PronunciationPractice";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/shared/Navbar";

function App() {
  // State to manage user authentication
  const [user, setUser] = useState(null);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('xlingoUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem('xlingoUser'); // Clear invalid data
      }
    }
  }, []);
  
  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('xlingoUser');
    setUser(null);
  };
  
  // Check if user is logged in
  const isLoggedIn = !!user;

  return (
    <div className="App">
      <HashRouter>
        {/* Navbar will appear on all pages */}
        <Navbar user={user} onLogout={handleLogout} />
        
        {/* Main content container with proper margin-top */}
        <div className="main-content">
          <Routes>
            {/* Login route */}
            <Route path="/login" element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={(userData) => setUser(userData)} />
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              isLoggedIn ? <Dashboard user={user} /> : <Navigate to="/login" />
            } />

            <Route path="/practice" element={
              isLoggedIn ? <PronunciationPractice /> : <Navigate to="/login" />
            } />
            
            <Route path="/practice/:type/:id" element={
              isLoggedIn ? <PronunciationPractice /> : <Navigate to="/login" />
            } />

            <Route path="/lessons" element={
              isLoggedIn ? <div className="page-container">Lessons Page (Coming Soon)</div> : <Navigate to="/login" />
            } />
            
            <Route path="/lessons/new" element={
              isLoggedIn ? <div className="page-container">New Lesson (Coming Soon)</div> : <Navigate to="/login" />
            } />

            <Route path="/community" element={
              isLoggedIn ? <div className="page-container">Community Page (Coming Soon)</div> : <Navigate to="/login" />
            } />
            
            <Route path="/community/chat" element={
              isLoggedIn ? <div className="page-container">Language Partners Chat (Coming Soon)</div> : <Navigate to="/login" />
            } />

            <Route path="/profile" element={
              isLoggedIn ? <div className="page-container">Profile Page (Coming Soon)</div> : <Navigate to="/login" />
            } />
            
            <Route path="/challenges" element={
              isLoggedIn ? <div className="page-container">Challenges Page (Coming Soon)</div> : <Navigate to="/login" />
            } />
            
            {/* Home route - redirects based on login status */}
            <Route path="/" element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
            
            {/* Catch all other routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </HashRouter>
    </div>
  );
}

export default App;
