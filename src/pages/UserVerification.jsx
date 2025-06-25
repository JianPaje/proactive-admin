// src/pages/UserVerification.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Make sure this path is correct for your admin project

const UserVerification = () => {
  // State to hold the list of users waiting for approval
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This function fetches users from the database
  const fetchPendingUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Query the 'users' table in Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*') // Get all columns
        .eq('status', 'pending_approval'); // IMPORTANT: Only get users with this status

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (err) {
      setError('Failed to fetch users. Please check your RLS policies.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect runs once when the page loads to fetch the initial data
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // This function handles updating a user's status to 'approved' or 'rejected'
  const handleUpdateUserStatus = async (userId, newStatus) => {
    // We can add a confirmation pop-up for safety
    if (!window.confirm(`Are you sure you want to ${newStatus === 'approved' ? 'Approve' : 'Reject'} this user?`)) {
        return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus }) // Update the status column
        .eq('id', userId);             // For the user with this specific ID

      if (error) throw error;

      // If the update is successful, remove the user from our local list
      // so they disappear from the screen without a page refresh.
      setPendingUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
      alert(`User has been ${newStatus}!`);

    } catch (err) {
      console.error(`Error updating user status:`, err);
      alert(`Failed to update user. Please try again.`);
    }
  };

  if (loading) return <div className="text-center p-4">Loading pending users...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-6">User Verification Queue</h1>
      {pendingUsers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p>No users are currently waiting for approval.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Email</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Full Name</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Registered On</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b text-sm">{user.email}</td>
                  <td className="px-5 py-4 border-b text-sm">{user.full_name || 'N/A'}</td>
                  <td className="px-5 py-4 border-b text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-5 py-4 border-b text-sm space-x-2">
                    <button
                      onClick={() => handleUpdateUserStatus(user.id, 'approved')}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateUserStatus(user.id, 'rejected')}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );  
};

export default UserVerification;