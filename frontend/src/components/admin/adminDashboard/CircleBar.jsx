import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  GroupWorkRounded,
  PeopleAltOutlined,
  Report,
  Assignment,
  Business,
  Person
} from "@mui/icons-material";
import CountUp from "react-countup";
import { CircularProgressbar } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const statusColors = {
  approve: "#10B981",
  pending: "#F59E0B",
  inprogress: "#3B82F6",
  new: "#8B5CF6",
  reject: "#EF4444"
};

function CircleBar() {
  const [dashboardData, setDashboardData] = useState({});
  const [statusData, setStatusData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/api/users/res/dashboard`),
      fetch(`${process.env.REACT_APP_API_URL}/api/report/api/report-status`)
    ])
    .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
    .then(([dashboard, status]) => {
      setDashboardData(dashboard);
      setStatusData(status);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });
  }, []);

  const MetricCard = ({ icon, title, value, children }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-indigo-50 rounded-lg">{icon}</div>
        <span className="text-2xl font-bold text-gray-700">
          {!loading ? <CountUp end={value} duration={1.5} /> : '--'}
        </span>
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-4">{title}</h3>
      {children}
    </div>
  );

  const ProgressItem = ({ label, value, color }) => (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-700">
        {!loading ? <CountUp end={value} duration={1.5} /> : '--'}
      </span>
    </div>
  );

  return (
    <section className="p-8 min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<PeopleAltOutlined className="text-indigo-600" fontSize="large" />}
          title="Total Users"
          value={dashboardData.totalUsers}
        >
          <ProgressItem label="Active" value={dashboardData.activeUsers} color="#10B981" />
          <ProgressItem label="Inactive" value={dashboardData.inactiveUsers} color="#EF4444" />
        </MetricCard>

        <MetricCard
          icon={<Business className="text-green-600" fontSize="large" />}
          title="CSOs"
          value={dashboardData.totalCSO}
        >
          <div className="w-16 mx-auto mt-2">
            <CircularProgressbar
              value={dashboardData.csoPercentage || 0}
              text={`${dashboardData.csoPercentage || 0}%`}
              strokeWidth={12}
              styles={{
                path: { stroke: "#10B981" },
                text: { fill: "#1F2937", fontSize: '24px' }
              }}
            />
          </div>
        </MetricCard>

        <MetricCard
          icon={<Person className="text-purple-600" fontSize="large" />}
          title="Staff Members"
          value={dashboardData.totalStaff}
        >
          <div className="grid grid-cols-2 gap-2">
            <ProgressItem label="Active" value={dashboardData.activeStaff} color="#3B82F6" />
            <ProgressItem label="Admins" value={dashboardData.adminStaff} color="#8B5CF6" />
            <ProgressItem label="Inactive" value={dashboardData.inactiveStaff} color="#EF4444" />
            <ProgressItem label="Super Admins" value={dashboardData.superAdminStaff} color="#10B981" />
          </div>
        </MetricCard>

        <MetricCard
          icon={<Assignment className="text-red-600" fontSize="large" />}
          title="Total Reports"
          value={dashboardData.totalReports}
        >
          <div className="w-16 mx-auto mt-2">
            <CircularProgressbar
              value={dashboardData.reportsPercentage || 0}
              text={`${dashboardData.reportsPercentage || 0}%`}
              strokeWidth={12}
              styles={{
                path: { stroke: "#EF4444" },
                text: { fill: "#1F2937", fontSize: '24px' }
              }}
            />
          </div>
        </MetricCard>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-500 mb-6">Report Status Distribution</h2>
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 xl:w-1/3 h-80">
            {Object.keys(statusData).length > 0 ? (
              <Pie 
                data={{
                  labels: Object.keys(statusData),
                  datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: Object.keys(statusData).map(s => statusColors[s]),
                    borderWidth: 0
                  }]
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: { 
                      backgroundColor: '#1F2937',
                      titleFont: { size: 14 },
                      bodyFont: { size: 14 },
                      padding: 12
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            ) : (
              <div className="text-center text-gray-400 h-full flex items-center justify-center">
                {loading ? 'Loading data...' : 'No status data available'}
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-1/2 xl:w-1/3 mt-6 lg:mt-0">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statusData).map(([status, count]) => (
                <div key={status} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: statusColors[status] }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 capitalize">{status}</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {!loading ? <CountUp end={count} duration={1.5} /> : '--'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CircleBar;