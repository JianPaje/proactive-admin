import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        usersCount: 0,
        reportsCount: 0,
        pendingReportsCount: 0,
    });
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            // --- Fetch Total Counts ---
            const { count: usersCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            const { count: reportsCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true });

            const { count: pendingReportsCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            setStats({ usersCount, reportsCount, pendingReportsCount });

            // --- Fetch Weekly Data ---
            const today = new Date();
            const oneWeekAgo = new Date(new Date().setDate(today.getDate() - 7)).toISOString();
            const twoWeeksAgo = new Date(new Date().setDate(today.getDate() - 14)).toISOString();

            // New users this week
            const { count: newUsersThisWeek } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', oneWeekAgo);

            // New reports this week
            const { count: newReportsThisWeek } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', oneWeekAgo);

            // New users last week
            const { count: newUsersLastWeek } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', twoWeeksAgo)
                .lt('created_at', oneWeekAgo);
            
            // New reports last week
            const { count: newReportsLastWeek } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', twoWeeksAgo)
                .lt('created_at', oneWeekAgo);

            setWeeklyData([
                { name: 'Last Week', 'New Users': newUsersLastWeek, 'New Reports': newReportsLastWeek },
                { name: 'This Week', 'New Users': newUsersThisWeek, 'New Reports': newReportsThisWeek },
            ]);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Set up real-time listeners
        const reportsChannel = supabase
            .channel('public:reports')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, 
                () => fetchDashboardData()
            )
            .subscribe();
            
        const usersChannel = supabase
            .channel('public:users')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, 
                () => fetchDashboardData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(reportsChannel);
            supabase.removeChannel(usersChannel);
        };
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Users</h2>
                    <p className="text-3xl font-bold text-blue-600">{stats.usersCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Reports</h2>
                    <p className="text-3xl font-bold text-green-600">{stats.reportsCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-500 mb-2">Pending Reports</h2>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingReportsCount}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Weekly Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="New Users" fill="#8884d8" />
                        <Bar dataKey="New Reports" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardPage;
