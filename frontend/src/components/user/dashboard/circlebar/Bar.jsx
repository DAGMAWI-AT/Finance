import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaClock, FaTimesCircle, FaPlusCircle, FaSpinner } from "react-icons/fa";
import axios from "axios";

const Bar = ({ darkMode }) => {
  const [statusCounts, setStatusCounts] = useState({
    approve: 0,
    pending: 0,
    reject: 0,
    new: 0,
    inprogress: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
       const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
               withCredentials: true,
             });
             if (!meResponse.data.success) {
               throw new Error("Failed to get user details");
             }
             const { userId } = meResponse.data;
        if (!userId) throw new Error("Invalid token: ID not found");

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/report/status-counts/${userId}`);

        if (response.data) {
          setStatusCounts(response.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching status counts:", error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusCounts();
  }, []);

  const reports = [
    { title: "Approved Requests", count: statusCounts.approve, icon: <FaCheckCircle className="text-green-500" /> },
    { title: "Pending Approvals", count: statusCounts.pending, icon: <FaClock className="text-yellow-500" /> },
    { title: "Rejected Requests", count: statusCounts.reject, icon: <FaTimesCircle className="text-red-500" /> },
    { title: "New Requests", count: statusCounts.new, icon: <FaPlusCircle className="text-blue-500" /> },
    { title: "In Progress", count: statusCounts.inprogress, icon: <FaSpinner className="text-purple-500" /> },
  ];

  return (
    <div className=" mx-auto p-4">
      <h2 className="text-xl font-bold text-center text-gray-500 uppercase mb-6">Request Status Overview</h2>

    
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {reports.map((report, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              <div className="text-4xl mb-3">{report.icon}</div>
              <h3 className="text-sm font-semibold mb-2">{report.title}</h3>
              <span className="text-xl font-bold">{report.count} / {statusCounts.total}</span>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Bar;
