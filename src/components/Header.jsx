import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Header = ({ toggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // This clock logic is good for displaying the time in the header
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []); 

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-800 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
        <h1 className="text-xl font-semibold ml-4">Admin Dashboard</h1>
      </div>

      <div className="text-lg font-semibold text-gray-700">
        {currentTime.toLocaleTimeString()}
      </div>
    </header>
  );
};

// <--- ADD THIS PROPTYPES VALIDATION BLOCK ---
Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired, // 'toggleSidebar' is expected to be a function and is required.
};

export default Header;