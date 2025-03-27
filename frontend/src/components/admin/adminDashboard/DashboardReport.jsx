import React, { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Assignment, FolderSpecial, Category } from "@mui/icons-material";

const statusColors = {
  new: "#8B5CF6",
  approve: "#10B981",
  reject: "#EF4444",
  pending: "#F59E0B",
  inprogress: "#3B82F6"
};

const DashboardReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/report/bycategory/reports`);
        if (data.success) {
          setReportData(Object.entries(data.reports));
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const StatusItem = ({ label, value, color }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-gray-500 capitalize">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-700">
        {!loading ? <CountUp end={value} duration={1.5} /> : '--'}
      </span>
    </div>
  );

  const CategoryCard = ({ category, stats }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Category className="text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 capitalize">{category}</h2>
        </div>
        <span className="text-lg font-bold text-purple-600">
          <CountUp end={stats.total} duration={1.5} />
        </span>
      </div>
      
      <div className="space-y-2">
        <StatusItem label="New" value={stats.new || 0} color={statusColors.new} />
        <StatusItem label="Approved" value={stats.approve || 0} color={statusColors.approve} />
        <StatusItem label="Rejected" value={stats.reject || 0} color={statusColors.reject} />
        <StatusItem label="Pending" value={stats.pending || 0} color={statusColors.pending} />
        <StatusItem label="In Progress" value={stats.inprogress || 0} color={statusColors.inprogress} />
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-500 uppercase">Report Categories</h1>
      <div className="flex items-center space-x-2 text-gray-500">
          <Assignment />
          <span className="font-medium">{reportData.length} Categories</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-4 bg-gray-100 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.map(([category, stats]) => (
            <CategoryCard 
              key={category}
              category={category}
              stats={stats}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardReport;