import React from 'react';
import logo from '../assets/logo.png';
import appScreenshot from '../assets/th.jpg'; 

const HomePage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* --- Navigation Bar --- */}
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="RetroConnect Logo" className="h-10 mr-3" />
            <span className="text-xl font-bold">RetroConnect</span>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          
          {/* Left Side: Text Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Connect to a World of Retro Finds
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover, buy, and sell vintage treasures and retro classics,
              all from the palm of your hand.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#download-google-play" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                Download for Android
              </a>
              {/* --- THIS IS THE MODIFIED BUTTON --- */}
              <a href="/about" className="bg-transparent text-blue-600 font-bold py-3 px-6 rounded-lg border border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300">
                About Us
              </a>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <img src={appScreenshot} alt="RetroConnect App Screenshot" className="max-w-xs md:max-w-sm rounded-2xl shadow-lg" />
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomePage;