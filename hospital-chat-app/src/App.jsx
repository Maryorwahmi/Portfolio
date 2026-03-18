/**
 * Hospital Chat App - Abiex's Health Care
 * Designed by: CaptianCode
 * 
 * A secure, real-time hospital communication platform
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navigation from './components/Layout/Navigation';
import HomePage from './pages/HomePage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import PatientDashboard from './pages/Dashboard/PatientDashboard';
import DoctorDashboard from './pages/Dashboard/DoctorDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import Consultations from './pages/Consultations';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Feedback from './pages/Feedback';
import Support from './pages/Support';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session with expiration
    const storedUser = localStorage.getItem('user');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (storedUser && sessionExpiry) {
      const expiryTime = parseInt(sessionExpiry);
      const currentTime = Date.now();
      
      if (currentTime < expiryTime) {
        // Session is still valid
        setUser(JSON.parse(storedUser));
      } else {
        // Session expired, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('sessionExpiry');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, rememberMe = false) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set session expiry (24 hours for remember me, 8 hours otherwise)
    const expiryHours = rememberMe ? 24 : 8;
    const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set default session expiry for new registrations (8 hours)
    const expiryTime = Date.now() + (8 * 60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());
  };

  const getDashboardComponent = () => {
    if (!user) return <Navigate to="/login" />;
    
    switch (user.role) {
      case 'patient':
        return <PatientDashboard user={user} />;
      case 'doctor':
        return <DoctorDashboard user={user} />;
      case 'nurse':
        return <DoctorDashboard user={user} />; // Nurses use similar dashboard to doctors
      case 'admin':
        return <AdminDashboard />;
      default:
        return <PatientDashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <HomePage />
              </>
            } 
          />
          
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            } 
          />
          
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/dashboard" /> : <Register onRegister={handleRegister} />
            } 
          />

          {/* Public Pages */}
          <Route 
            path="/consultations" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Consultations />
              </>
            } 
          />
          
          <Route 
            path="/appointments" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Appointments />
              </>
            } 
          />
          
          <Route 
            path="/prescriptions" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Prescriptions />
              </>
            } 
          />
          
          <Route 
            path="/feedback" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Feedback />
              </>
            } 
          />
          
          <Route 
            path="/support" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Support />
              </>
            } 
          />
          
          <Route 
            path="/chat-with-us" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Support />
              </>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                {getDashboardComponent()}
              </>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
