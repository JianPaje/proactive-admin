// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [graphData, setGraphData] = useState([
    { time: new Date().toLocaleTimeString(), users: 0 }
  ]);

  useEffect(() => {
    console.log('DASHBOARD: Attempting to set up realtime listener...');

    const channel = supabase.channel('online-users');

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const count = Object.keys(presenceState).length;
      
      console.log('DASHBOARD: Sync event received! Users online:', count);
      setOnlineUsersCount(count);

      setGraphData(prevData => {
        const newData = [...prevData, { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          users: count 
        }];
        if (newData.length > 20) {
          return newData.slice(newData.length - 20);
        }
        return newData;
      });
    });

    channel.subscribe((status) => {
      // This will tell us if the admin panel successfully connects
      console.log('DASHBOARD: Realtime subscription status is:', status);
    });

    return () => {
      console.log('DASHBOARD: Removing channel subscription.');
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Real-Time Activity</h2>
        <p className="text-3xl font-bold text-blue-600">{onlineUsersCount}
          <span className="text-lg font-normal text-gray-500 ml-2">
            {onlineUsersCount === 1 ? 'User' : 'Users'} Online
          </span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Users Online (Live)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;