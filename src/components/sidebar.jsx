import React from 'react';
import PropTypes from 'prop-types'; 
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const linkClasses = "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700";
  const activeLinkClasses = "bg-gray-700";

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
      navigate('/');
    }
  };

  return (
    <div className={`
      w-64 bg-gray-800 text-white flex flex-col p-4
      fixed inset-y-0 left-0 z-30
      transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      transition-transform duration-300 ease-in-out
    `}>
      <div className="flex-grow">
        <h2 className="text-2xl font-semibold text-center mb-8">Admin Panel</h2>
        
        <nav className="space-y-2">
          <NavLink to="/admin/dashboard" end className={getNavLinkClass}>
            Dashboard
          </NavLink>
          {/* MODIFIED: The User Verification link has been removed */}
          <NavLink to="/admin/user-management" className={getNavLinkClass}>
            User Management
          </NavLink>
          <NavLink to="/admin/reports" className={getNavLinkClass}>
            Reports
          </NavLink>
        </nav>
      </div>
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Sidebar;
