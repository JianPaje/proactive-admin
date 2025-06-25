// src/components/UserDetailModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UserDetailModal = ({ user, onClose, onVerify }) => {
  const [isIdFlipped, setIsIdFlipped] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Section */}
          <div className="md:col-span-1 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Profile Picture</h3>
              <img src={user.profile_pic || 'https://placehold.co/400x400?text=No+Image'} alt="Profile" className="w-full h-auto rounded-lg border" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Verified ID Image</h3>
              <p className="text-xs text-gray-500 mb-1">Click image to flip</p>
              
              {/* --- THIS IS THE MODIFIED PART --- */}
              {/* We changed the <div> to a <button> for accessibility */}
              <button
                type="button"
                onClick={() => setIsIdFlipped(!isIdFlipped)}
                className="block w-full border rounded-lg overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Flip ID card to see other side"
              >
                {isIdFlipped ? (
                  <img src={user.verified_id_image_back || 'https://placehold.co/400x250?text=ID+Back'} alt="Verified ID Back" className="w-full h-auto" />
                ) : (
                  <img src={user.verified_id_image || 'https://placehold.co/400x250?text=ID+Front'} alt="Verified ID Front" className="w-full h-auto" />
                )}
              </button>
            </div>
          </div>

          {/* Text Details Section */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-sm font-bold text-gray-600">Full Name</span>
              <p className="text-lg">{user.full_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-600">Email Address</span>
              <p className="text-lg">{user.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-600">Phone Number</span>
              <p className="text-lg">{user.phone_number || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-600">Address</span>
              <p className="text-lg">{user.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
          >
            Close
          </button>
          <button
            onClick={() => onVerify(user.id)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            Set as Fully Verified
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation remains the same
UserDetailModal.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    profile_pic: PropTypes.string,
    verified_id_image: PropTypes.string,
    verified_id_image_back: PropTypes.string,
    full_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    address: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
};

export default UserDetailModal;