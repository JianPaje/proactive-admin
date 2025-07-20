// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthProvider';


import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import RegistrationPage from './pages/RegistrationPage'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} /> {/* <-- 2. ADD THE NEW ROUTE */}


          {/* --- PROTECTED ADMIN ROUTES --- */}
          <Route element={<Layout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;