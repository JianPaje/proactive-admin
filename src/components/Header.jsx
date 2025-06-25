import React, { useState, useEffect } from 'react';

const Header = ({ toggleSidebar }) => {
  // Create a state variable to hold the current time.
  // initialize it with the current time when the component first loads.
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Create an interval that will run a function every 1sec.
    const timerId = setInterval(() => {
      // Every second, update our state with the new current time.
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []); // The empty array [] ensures this effect only runs once.


  return (
    // We update the main div to use flexbox to position items
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* This is the left side of the header */}
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-800 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
        <h1 className="text-xl font-semibold ml-4">Admin Dashboard</h1>
      </div>

      {/*  This is the new right side of the header, for our clock */}
      <div className="text-lg font-semibold text-gray-700">
        {/* We format the time to a locale-specific string, like "1:38:38 AM" */}
        {currentTime.toLocaleTimeString()}
      </div>
    </header>
  );
};

export default Header;