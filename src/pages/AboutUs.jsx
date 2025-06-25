import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="RetroConnect Logo" className="h-10 mr-3" />
            <span className="text-xl font-bold text-gray-800">RetroConnect</span>
          </Link>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container mx-auto p-8 md:p-16">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          About RetroConnect
        </h1>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              RetroConnect is a mobile e-commerce application designed to provide a versatile platform for Filipino users to buy, sell, and barter both new and secondhand items. Our objective is to enhance the online shopping experience for Filipino consumers by introducing unique features and creating a user-centric platform that addresses specific needs within the local e-commerce landscape.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">A New Concept in E-Commerce</h2>
            <p className="text-gray-600 leading-relaxed">
              We aim to revolutionize the way users interact with e-commerce by breaking the mold of traditional monetary transactions. RetroConnect introduces innovative features that foster a community-driven marketplace and encourage sustainable consumption.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Unique Features</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <strong>Barter System:</strong> Enabling users to exchange items directly without the need for money, facilitating a unique way to trade.
              </li>
              <li>
                <strong>Local Pick-up Map:</strong> Allowing users to easily find and transact with sellers in their local area for urgent needs and in-person item verification.
              </li>
              <li>
                <strong>Virtual Closet Integration:</strong> Helping users organize and style their digital wardrobe to better coordinate outfits before purchasing.
              </li>
               <li>
                <strong>Repair and Upcycling Services:</strong> Connecting users with nearby repair shops to fix and give new life to secondhand goods.
              </li>
              <li>
                <strong>Sell or Donate Option:</strong> Providing a convenient way for sellers to declutter by listing unsold items as donations for the community.
              </li>
               <li>
                <strong>Social Sharing & Communication:</strong> Building trust and community through shared item photos, reviews, and direct video/text communication between buyers and sellers.
              </li>
            </ul>
          </div>


        </div>

        <div className="text-center mt-12">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;