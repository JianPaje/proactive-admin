import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import UserDetailModal from '../components/UserDetailModal.jsx';


// Helper to get styling for different user statuses
const getStatusClasses = (status) => {
  switch (status) {
    case 'verified':
    case 'full verified': 
      return 'bg-green-100 text-green-800';
    // REMOVED: pending_approval case is no longer needed
    case 'suspended': 
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};

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
      const { data, error: fetchError } = await supabase.from('users').select('*');
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
    handleUpdateStatus(userId, 'full verified');
  };

  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Component for rendering action buttons based on user status
  const ActionButtons = ({ user }) => {
    switch (user.status) {
      // REMOVED: pending_approval case is no longer needed
      case 'suspended':
        return (
          <button type="button" onClick={() => handleUpdateStatus(user.id, 'fully_verified')} className="text-green-600 hover:underline">
            Reactivate
          </button>
        );
      case 'verified':
      case 'full verified':
        return (
          <button type="button" onClick={() => handleUpdateStatus(user.id, 'suspended')} className="text-red-600 hover:underline">
            Suspend
          </button>
        );
      default:
        return null; // Or show a default state if needed
    }
  };

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
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Email</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Display Name</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Registered On</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Status</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Face Verified</th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b text-sm">{user.email}</td>
                <td className="px-5 py-4 border-b text-sm">{user.username || 'N/A'}</td>
                <td className="px-5 py-4 border-b text-sm">{user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</td>
                <td className="px-5 py-4 border-b text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(user.status)}`}>
                    {user.status ? user.status.replace(/_/g, ' ') : 'N/A'}
                  </span>
                </td>
                <td className="px-5 py-4 border-b text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_face_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_face_verified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-4 border-b text-sm">
                  <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => handleViewDetails(user)} className="text-gray-500 hover:text-blue-600" title="View Details">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <ActionButtons user={user} />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center py-4">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
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
