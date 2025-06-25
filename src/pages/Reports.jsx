import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // To link to user profiles

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This function will be called to update a report's status
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);
      
      if (error) throw error;

      // Update the status in our local state for instant UI feedback
      setReports(currentReports =>
        currentReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
      alert('Report status updated!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update report status.');
    }
  };

  useEffect(() => {
    // Fetch initial data when the component loads
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false }); // Show newest reports first

        if (error) throw error;
        setReports(data);
      } catch (err) {
        setError('Failed to fetch reports. Please check your RLS policies.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    //  Set up the real-time subscription
    // This listens for any new rows inserted into the 'reports' table
    const channel = supabase
      .channel('public:reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          console.log('New report received!', payload.new);
          // Add the new report to the top of our list in the UI
          setReports(currentReports => [payload.new, ...currentReports]);
        }
      )
      .subscribe();

    // 3Cleanup function to remove the channel subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Reports</h1>
      {reports.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p>No reports found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Reported User</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Reporter</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Reason</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Date</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b text-sm">
                    <Link to={`/user/${report.reported_user_id}`} className="text-blue-600 hover:underline">
                      {report.reported_user_id.substring(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-5 py-4 border-b text-sm">
                    <Link to={`/user/${report.reporter_user_id}`} className="text-blue-600 hover:underline">
                      {report.reporter_user_id.substring(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-5 py-4 border-b text-sm">{report.reason || 'N/A'}</td>
                  <td className="px-5 py-4 border-b text-sm">{new Date(report.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 border-b text-sm font-semibold">{report.status.replace('_', ' ')}</td>
                  <td className="px-5 py-4 border-b text-sm">
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      className="p-1 border border-gray-300 rounded"
                    >
                      <option value="pending_review">Pending</option>
                      <option value="action_taken">Action Taken</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
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

export default Reports;