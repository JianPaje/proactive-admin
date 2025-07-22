import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types'; // --- ADDED: Import PropTypes
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; 

// Modal to view report details and screenshots
const DetailsModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Report Details</h2>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>
                <div>
                    <p className="mb-2"><strong>Reason:</strong> {report.reason}</p>
                    <p className="mb-4"><strong>Details:</strong> {report.details || 'No additional details provided.'}</p>
                    {report.screenshot_url && (
                        <div>
                            <p className="font-bold mb-2">Screenshot:</p>
                            <img src={report.screenshot_url} alt="Report screenshot" className="rounded-lg max-w-full h-auto" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ADDED: PropTypes for DetailsModal ---
DetailsModal.propTypes = {
    report: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};


// Modal to send email warnings
const WarningModal = ({ report, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (report) {
            const template = `This is a warning regarding your conduct on the platform. We have received a report concerning: ${report.reason}. Please review our community guidelines to avoid further action.`;
            setMessage(template);
        }
    }, [report]);

    if (!report) return null;

    const handleSend = async () => {
        setIsSending(true);
        await onSend(message);
        setIsSending(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">Send Email Warning</h2>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-40 p-2 border border-gray-300 rounded-md mb-4"
                />
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg" disabled={isSending}>Cancel</button>
                    <button onClick={handleSend} className="px-4 py-2 bg-red-500 text-white rounded-lg" disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ADDED: PropTypes for WarningModal ---
WarningModal.propTypes = {
    report: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
};


const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [warningReport, setWarningReport] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatusChange = async (reportId, newStatus, notify = true) => {
        try {
            const { error } = await supabase
                .from('reports') 
                .update({ status: newStatus })
                .eq('id', reportId);
            
            if (error) throw error;

            setReports(currentReports =>
                currentReports.map(report =>
                    report.id === reportId ? { ...report, status: newStatus } : report
                )
            );
            if (notify) {
                alert('Report status updated!');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update report status.');
        }
    };

    const handleSendWarning = async (message) => {
        if (!warningReport) return;

        try {
            const reportedUserEmail = warningReport.reported_user_email;
            const reporterEmail = warningReport.reporter_email;

            if (!reportedUserEmail || !reporterEmail) {
                throw new Error("Reported user or reporter email is missing from the data.");
            }

            const { data, error } = await supabase.functions.invoke('send-warning', {
                body: {
                    reportedUser: { email: reportedUserEmail, username: warningReport.reported_username },
                    reporter: { email: reporterEmail, username: warningReport.reporter_username },
                    message,
                    reason: warningReport.reason,
                },
            });

            if (error) {
                console.error('Edge function invocation error:', error);
                throw error;
            }

            alert('Warning email sent successfully!');
            await handleStatusChange(warningReport.id, 'action_taken', false);
            setWarningReport(null); 

        } catch (error) {
            console.error('Failed to send warning:', error);
            alert(`Error: ${error.message || 'Failed to send a request to the Edge Function'}`);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase
                .from('detailed_reports') 
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data);
        } catch (err) {
            setError('Failed to fetch reports. Ensure the "detailed_reports" view is created.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchReports();

        const channel = supabase
            .channel('public:reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, 
                () => fetchReports()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredReports = useMemo(() => {
        if (!searchTerm) {
            return reports;
        }
        return reports.filter(report => 
            report.reported_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporter_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.report_type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reports, searchTerm]);

    if (loading) return <div>Loading reports...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            {/* --- FIXED: Restored the full UI --- */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User and Listing Reports</h1>
                <input 
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            {filteredReports.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p>No reports found.</p>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Report Type</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Reported User</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Reporter</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Details</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Date</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Status</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 border-b text-sm capitalize">
                                        {report.report_type?.replace('_', ' ') || 'N/A'}
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <Link to={`/user/${report.final_reported_user_id}`} className="text-blue-600 hover:underline">
                                            {report.reported_username || 'N/A'}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <Link to={`/user/${report.reporter_id}`} className="text-blue-600 hover:underline">
                                            {report.reporter_username || 'N/A'}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <button onClick={() => setSelectedReport(report)} className="text-blue-600 hover:underline">
                                            View
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">{new Date(report.created_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-4 border-b text-sm font-semibold capitalize">{report.status.replace('_', ' ')}</td>
                                    <td className="px-5 py-4 border-b text-sm space-x-2">
                                        {report.status === 'pending' ? (
                                            <>
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                    className="p-1 border border-gray-300 rounded"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="action_taken">Action Taken</option>
                                                    <option value="dismissed">Dismissed</option>
                                                </select>
                                                <button onClick={() => setWarningReport(report)} className="px-3 py-1 bg-blue-500 text-white rounded-md text-xs font-bold">
                                                    EMAIL
                                                </button>
                                            </>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                                                Recorded
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedReport && <DetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
            {warningReport && <WarningModal report={warningReport} onClose={() => setWarningReport(null)} onSend={handleSendWarning} />}
        </div>
    );
};

export default Reports;
