import React, { useState } from 'react'; 
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; 
import { useAuth } from '../hook/useAuth';

const Layout = () => {
  const { user } = useAuth();
 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Pass the state to the Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      <div className={`
        flex-1 flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'md:ml-64' : 'ml-0'} 
      `}>
        {/* Pass the function to toggle the state to the Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;