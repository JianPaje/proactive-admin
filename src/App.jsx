// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import Components and Pages
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs'; // 1. IMPORT THE NEW PAGE
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserVerification from './pages/UserVerification';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} /> {/* 2. ADD THE NEW ROUTE */}
          <Route path="/admin/login" element={<LoginPage />} />


          {/* --- PROTECTED ADMIN ROUTES --- */}
          <Route element={<Layout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/user-verification" element={<UserVerification />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;