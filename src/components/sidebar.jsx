import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();
  // 2. Get the navigate function by calling the hook
  const navigate = useNavigate();

  const linkClasses = "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700";
  const activeLinkClasses = "bg-gray-700";

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses;
  };

  //This function ensures you go to the homepage AFTER logging out
  const handleLogout = async () => {
    try {
      await logout(); // Sign the user out from Supabase
      navigate('/');   // Immediately redirect to the homepage
    } catch (error) {
      console.error('Failed to log out:', error);
      navigate('/'); // Redirect to homepage even if there was an error
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
          <NavLink to="/admin/user-verification" className={getNavLinkClass}>
            User Verification
          </NavLink>
          <NavLink to="/admin/user-management" className={getNavLinkClass}>
            User Management
          </NavLink>
          <NavLink to="/admin/reports" className={getNavLinkClass}>
            Reports
          </NavLink>
        </nav>
      </div>
      <div className="mt-auto">
        {/* The button now calls our new handleLogout function */}
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

export default Sidebar;