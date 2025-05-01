import React from "react";
import "./App.css";
import Login from "./Pages/Login";
import Registration from "./Pages/Registration";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("xlingoUser");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Login route */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
          />

          {/* Registration route */}
          <Route
            path="/register"
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Registration />
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <div>Dashboard Page (Coming Soon)</div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Home route - redirects based on login status */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
