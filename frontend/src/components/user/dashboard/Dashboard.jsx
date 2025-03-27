import React from 'react';
import Bar from './circlebar/Bar';
import DashboardReport from './DashboardReport';

const Dashboard = ({ darkMode }) => {
  return (
    // <div className={`dashboard ${darkMode ? "dark" : "light"}`}>
    <div>
      {/* <h1 className="text-2xl font-bold mb-4 text-gray-300">Dashboard</h1> */}
      <Bar/>
      <DashboardReport/>
    </div>
  );
};

export default Dashboard;
