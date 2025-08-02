import React from 'react';
// Make sure you have a logo file at this path
import logo from '../assets/0.png'; 
import appScreenshot from '../assets/ImageBackground.png';

const HomePage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* --- Navigation Bar --- */}
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* The height class is set to h-16 for a larger logo */}
            <img src={logo} alt="ProActive Logo" className="h-16 mr-3" /> 
            <span className="text-2xl font-bold text-gray-800">ProActive</span>
          </div>
          {/* Optional: You can add login/about links here */}
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="container mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col md:flex-row items-center">
          
          {/* Left Side: Text Content */}
          <div className="md:w-3/5 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Gamifying Student Discipline and Efficiency 
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              An innovative mobile app that converts academic assignments into engaging experiences using daily quests, a points system, and leaderboards to make discipline and efficiency fun to practice.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              {/* NOTE: You will need to replace "#" with your actual Android APK download link. */}
              <a href="https://expo.dev/artifacts/eas/dVqZxtH46gyfKMpvBWbDoF.apk" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                Download for Android
              </a>
              <a href="/about" className="bg-transparent text-blue-600 font-bold py-3 px-6 rounded-lg border border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300">
                Learn More
              </a>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="md:w-2/5 mt-12 md:mt-0 flex justify-center">
            <img src={appScreenshot} alt="ProActive App Screenshot" className="max-w-xs md:max-w-sm rounded-2xl shadow-lg" />
          </div> 

        </div>
      </main>
    </div>
  );
};

export default HomePage;
