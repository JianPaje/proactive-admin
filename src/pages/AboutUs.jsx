import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Make sure this path is correct

const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-center relative">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="ProActive Logo" className="h-12 mr-3" />
            <span className="text-xl font-bold text-gray-800">ProActive</span>
          </Link>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container mx-auto p-8 md:p-16">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          About ProActive
        </h1>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">About The Project</h2>
            <p className="text-gray-600 leading-relaxed">
              "ProActive: Gamifying Student Discipline and Efficiency" was developed by Peter Allen Soriano, Rene Capulan, and Jian Paje, students of AMA Computer College Fairview. This project addresses modern challenges like procrastination and disengagement by transforming routine academic tasks into an interactive and motivating game.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Our primary objective is to assess and improve student engagement, discipline, and productivity through gamification. We aim to convert tedious assignments and responsibilities into engaging challenges, fostering better time management, self-discipline, and a more positive attitude towards academic and extracurricular activities.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">A New Approach to Student Engagement</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe that the motivational principles found in gaming—achievements, leaderboards, and rewards—can be powerfully applied to student life. ProActive bridges the gap between entertainment and education, creating a tool that is both fun to use and effective in building essential life skills for the mobile-first generation.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Core Features</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <strong>Daily & Side Quests:</strong> Turning homework, attendance, and other responsibilities into completable quests.
              </li>
              <li>
                <strong>Points & Rewards System:</strong> Students gain points and unlock achievements for completing tasks, reinforcing positive behavior.
              </li>
              <li>
                <strong>Ranking System & Leaderboards:</strong> Fostering healthy competition and a sense of progression by allowing students to climb the ranks.
              </li>
              <li>
                <strong>Event-Based Challenges:</strong> Special events to encourage participation in extracurriculars and other school activities.
              </li>
              <li>
                <strong>Admin & Teacher Portals:</strong> Allowing school staff to monitor student progress, create custom tasks, and manage the system.
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
