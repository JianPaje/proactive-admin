import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import UserDetailModal from '../components/UserDetailModal.jsx';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Assuming you might have a 'role' column in your 'users' table.
      // If not, you can remove it from the select query.
      const { data, error: fetchError } = await supabase.from('users').select('*, role');
      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    if (!window.confirm(`Are you sure you want to set this user's status to "${newStatus}"?`)) {
      return;
    }
    
    try {
      if (newStatus === 'suspended') {
        const { error: functionError } = await supabase.functions.invoke('suspend-user', {
          body: { userIdToSuspend: userId },
        });
        if (functionError) throw functionError;
      } else {
        const { error: updateError } = await supabase
          .from('users')
          .update({ status: newStatus })
          .eq('id', userId);
        if (updateError) throw updateError;
      }

      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prevUser => ({ ...prevUser, status: newStatus }));
      }

      alert(`User status updated to ${newStatus}.`);

    } catch (err) {
      alert(`Failed to update user status: ${err.message}`);
      console.error(err);
    }
  };
  
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  
  const handleFullVerification = (userId) => {
    // Mapping "Approve" button to the 'fully_verified' status
    handleUpdateStatus(userId, 'fully_verified');
  };

  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <input
          type="text"
          placeholder="Search by email or username..."
          className="px-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Card Grid Layout */}
      <div className="grid grid-cols-1 gap-6">
        {filteredUsers.length > 0 ? filteredUsers.map(user => (
          // Single User Card
          <div key={user.id} className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
            
            {/* Left Side: User Info */}
            <div className="flex items-center space-x-4">
              {/* Avatar Placeholder */}
              <div className="flex-shrink-0">
                 <svg className="h-16 w-16 text-gray-300 rounded-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
              </div>
              
              {/* Text Details */}
              <div className="flex-grow">
                <div>
                  <span className="font-bold text-sm text-gray-600">Full Name</span>
                  <p className="text-gray-900 font-medium">{user.username || 'N/A'}</p>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-sm text-gray-600">LRN/USN</span>
                  {/* NOTE: Using a placeholder as 'role' or 'LRN' is not in the original code */}
                  <p className="text-gray-700">{user.role || 'Student User'}</p> 
                </div>
                <button
                  onClick={() => handleViewDetails(user)}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  User Details
                </button>
              </div>
            </div>

            {/* Right Side: Action Buttons */}
            <div className="flex flex-col space-y-2">
               {/* "Approve" maps to fully verified status */}
               <button
                 onClick={() => handleFullVerification(user.id)}
                 className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
               >
                 Approve
               </button>
               {/* "Deny" maps to suspended status */}
               <button
                 onClick={() => handleUpdateStatus(user.id, 'suspended')}
                 className="px-6 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
               >
                 Deny
               </button>
            </div>

          </div>
        )) : (
          <div className="text-center py-4">
              <p>No users found.</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={handleCloseModal}
          onVerify={handleFullVerification}
        />
      )}
    </div>
  );
};

export default UserManagement;