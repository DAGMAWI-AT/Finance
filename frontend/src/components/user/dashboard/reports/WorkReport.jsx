import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { FaEdit, FaEye, FaTrashAlt, FaSort } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import styled from "styled-components";
import debounce from "lodash.debounce";
import axios from "axios";

// Environment Variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Styled Components for CSS-in-JS
const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  ${({ status }) =>
    status === "approve"
      ? "background: #dcfce7; color: #16a34a;"
      : status === "reject"
      ? "background: #fee2e2; color: #dc2626;"
      : status === "pending"
      ? "background: #fef9c3; color: #ca8a04;"
      : status === "inprogress"
      ? "background: #dbeafe; color: #2563eb;"
      : "background: #f3f4f6; color: #4b5563;"}
`;

const WorkReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: "asc" });
  const [filters, setFilters] = useState({
    search: "",
    startDate: null,
    endDate: null,
  });
  const [pagination, setPagination] = useState({
    pageSize: 10,
    currentPage: 1,
  });



  // Fetch all reports
  const fetchData = useCallback(async () => {
    try {
      const [meResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users/me`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/reportCategory/cat`)
      ]);

      if (!meResponse.data?.success) {
        navigate("/user/login");
        return;
      }

      const reportsResponse = await axios.get(
        `${API_BASE_URL}/api/report/user/${meResponse.data.id}`
      );

      const categoryMap = categoriesResponse.data.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {});

      setReport(reportsResponse.data.data || []);
      setCategories(categoryMap);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/user/login");
      } else {
        Swal.fire("Error!", error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // useEffect(() => {
  //   fetchProfileData();
  // }, [fetchProfileData]);

  // Sorting functionality
  const sortedReports = useMemo(() => {
    return [...report].sort((a, b) => {
      if (!sortConfig.field) return 0;
      if (a[sortConfig.field] < b[sortConfig.field]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.field] > b[sortConfig.field]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [report, sortConfig]);

  // Filtering functionality with debounced search
  const filteredReports = useMemo(() => {
    return sortedReports.filter((item) => {
      const matchesSearch = item.report_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.category_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.status?.toLowerCase().includes(filters.search.toLowerCase());

      const withinDateRange =
        (!filters.startDate || new Date(item.created_at) >= filters.startDate) &&
        (!filters.endDate || new Date(item.created_at) <= filters.endDate);

      return matchesSearch && withinDateRange;
    });
  }, [sortedReports, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / pagination.pageSize);
  const currentData = useMemo(() => {
    return filteredReports.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    );
  }, [filteredReports, pagination]);

  // Handle sorting
  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Handle filter changes with debouncing
  const handleFilterChange = useCallback(
    debounce((e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    }, 300),
    []
  );

  // Handle date changes
  const handleDateChange = useCallback((date, field) => {
    setFilters((prev) => ({ ...prev, [field]: date }));
  }, []);

  // Handle page size changes
  const handlePageSizeChange = useCallback((e) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: Number(e.target.value),
      currentPage: 1,
    }));
  }, []);

  // Handle viewing a report
  const handleViewReport = useCallback((id) => {
    navigate(`/user/viewworkreport/${id}`);
  }, [navigate]);

  // Handle updating a report
  const handleUpdateReport = useCallback((id) => {
    navigate(`/user/update_report/${id}`);
  }, [navigate]);

  // Handle deleting a report
  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/report/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          Swal.fire("Deleted!", "Your report has been deleted.", "success");
          setReport((prevReports) => prevReports.filter((item) => item.id !== id));
        } else {
          Swal.fire("Error!", "Failed to delete the report.", "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="p-1 lg:p-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Work Reports</h1>
        <button
          onClick={() => navigate("/user/upload_report")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>+ New Report</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-1 lg:p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* Search Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Reports
            </label>
            <input
              type="text"
              name="search"
              placeholder="Search reports..."
              className="w-60 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={handleFilterChange}
            />
          </div>

          {/* Date Filter */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                onChange={(e) => handleDateChange(new Date(e.target.value), "startDate")}
                className="w-40 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                onChange={(e) => handleDateChange(new Date(e.target.value), "endDate")}
                className="w-40 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <TableContainer>
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size} entries
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.pageSize, filteredReports.length)} of{" "}
            {filteredReports.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["ID", "Report Name", "Type", "Status", "Expiry Date", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => header !== "Actions" && handleSort(header.toLowerCase().replace(" ", "_"))}
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      {sortConfig.field === header.toLowerCase().replace(" ", "_") && (
                        <FaSort className={`transform ${sortConfig.direction === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {currentData.map((item, index) => {
                // const isExpired = new Date(categories.expire_date) < new Date();
                const category = categories[item.category_id] || {} ;
                const now = new Date();
                const isExpired = (
                  (new Date(category.expire_date) < now && new Date(item.expire_date) < now) ||
                  (new Date(item.expire_date) < now && item.category_id === null) ||
                  (category && Object.keys(category).length === 0)
                );                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.report_name}</td>
                    {/* <td className="px-4 py-3 text-sm text-gray-600">{category.category_name}</td> */}
                    <td className="px-4 py-3 text-sm text-gray-600">{item.category_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status}>{item.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {/* {new Date(category.expire_date).toLocaleDateString() } */}
                       {new Date(item.expire_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleViewReport(item.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => !isExpired && handleUpdateReport(item.id)}
                        className={`p-2 rounded-lg ${
                          isExpired ? "text-gray-400 cursor-not-allowed" : "text-yellow-600 hover:bg-yellow-50"
                        }`}
                        disabled={isExpired}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => !isExpired && handleDelete(item.id)}
                        className={`p-2 rounded-lg ${
                          isExpired ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:bg-red-50"
                        }`}
                        disabled={isExpired}
                      >
                        <FaTrashAlt className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))
            }
            disabled={pagination.currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              pagination.currentPage === 1
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, currentPage: i + 1 }))
                }
                className={`px-3 py-1 rounded-md ${
                  pagination.currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
            }
            disabled={pagination.currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              pagination.currentPage === totalPages
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </TableContainer>
    </div>
  );
};

export default WorkReport;