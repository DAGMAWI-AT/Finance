import React, { useEffect, useState } from "react";
import { FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const EachCso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cso, setCso] = useState({});
  const [report, setReport] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState({});
  const [imgError, setImgError] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState([]);

  const location = useLocation();

  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    approve: "bg-green-100 text-green-700",
    inprogress: "bg-orange-100 text-orange-700",
    pending: "bg-yellow-100 text-yellow-700",
    reject: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const fetchCsoData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/report/${id}`);
        if (!response.ok) {
          console.error("Failed to fetch CSO data:", response.status);
          return;
        }
        const data = await response.json();
        setReport(data.data || []);

        const categoryIds = data.data.map((item) => item.category_id);
        const uniqueCategoryIds = [...new Set(categoryIds)];

        const categoryPromises = uniqueCategoryIds.map(async (categoryId) => {
          const categoryResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/api/reportCategory/${categoryId}`
          );
          if (!categoryResponse.ok) {
            console.error("Failed to fetch category data:", categoryResponse.status);
            return null;
          }
          const categoryData = await categoryResponse.json();
          return categoryData;
        });

        const categoryResults = await Promise.all(categoryPromises);
        const categoryMap = {};
        const uniqueCategories = [];
        categoryResults.forEach((category) => {
          if (category) {
            categoryMap[category.id] = category.category_name;
            if (!uniqueCategories.includes(category.category_name)) {
              uniqueCategories.push(category.category_name);
            }
          }
        });

        setCategories(categoryMap);
        setAvailableCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CSO data:", error);
        setLoading(false);
      }
    };
    fetchCsoData();
  }, [id]);

  useEffect(() => {
    const fetchCsoProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cso/res/${id}`);
        if (!response.ok) {
          console.error("Failed to fetch CSO profile:", response.status);
          return;
        }
        const data = await response.json();
        setCso(data || {});
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CSO profile:", error);
        setLoading(false);
      }
    };
    fetchCsoProfile();
  }, [id]);

  const sortedReports = React.useMemo(() => {
    let sortableReports = [...report];
    if (sortConfig.key) {
      sortableReports.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableReports;
  }, [report, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredReports = sortedReports.filter((item) => {
    const matchesCategory =
      filter === "all" ||
      (categories[item.category_id]?.toLowerCase() || "") === filter.toLowerCase();

    const matchesSearch = (item.report_name?.toLowerCase() || "").includes(
      search.toLowerCase()
    ) || item.status?.toLowerCase().includes(search.toLowerCase() || "") || categories[item.category_id]?.toLowerCase().includes(search.toLowerCase() || "");

    const reportDate = new Date(item.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const matchesDate =
      (!start || reportDate >= start) && (!end || reportDate <= end);

    return matchesCategory && matchesSearch && matchesDate;
  });

  const indexOfLastReport = currentPage * itemsPerPage;
  const indexOfFirstReport = indexOfLastReport - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleView = (report) => {
    navigate(`/admin/show_report/${report.id}`);
  };

  const handleProfile = () => {
    navigate(`/admin/cso_profile/${cso.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

 
  
  
  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {!imgError && cso.logo ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}/${cso.logo}`}
                  onError={() => setImgError(true)}
                  alt="Profile logo"
                  className="w-16 h-16 rounded-xl border-2 border-gray-100 shadow-md object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-500 font-sans touch-pan-up">{cso.csoName}</h1>
              <p className="text-gray-600 font-medium mt-1">ID: {cso.registrationId}</p>
            </div>
          </div>
          <button
            onClick={handleProfile}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            View Profile
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white shadow-sm font-medium"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 placeholder-gray-400 shadow-sm font-medium"
            />
            
            <div className="flex gap-2 items-center col-span-2">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 w-full shadow-sm"
                />
                <span className="text-gray-500">–</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 w-full shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 shadow-sm font-medium"
                >
                  {[10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 whitespace-nowrap uppercase">
              <tr>
                {[
                  { key: "report_name", label: "File Name" },
                  { key: "category_id", label: "Type" },
                  { key: "created_at", label: "Submitted Date" },
                  { key: "updated_at", label: "Updated Date" },
                  { key: null, label: "File" },
                  { key: "status", label: "Status" },
                  { key: null, label: "Actions" },
                ].map((header) => (
                  <th
                    key={header.key || header.label}
                    className="px-5 py-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => header.key && requestSort(header.key)}
                  >
                    <div className="flex items-center gap-2">
                      {header.label}
                      {header.key && (
                        <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {sortConfig.key === header.key ? (
                            sortConfig.direction === "asc" ? (
                              <FaSortUp className="w-3.5 h-3.5" />
                            ) : (
                              <FaSortDown className="w-3.5 h-3.5" />
                            )
                          ) : (
                            <FaSort className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {currentReports.length > 0 ? (
                currentReports.map((item, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors group"
                    onClick={() => handleView(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="px-5 py-4 text-gray-700 font-medium">{item.report_name}</td>
                    <td className="px-5 py-4 text-gray-700">{categories[item.category_id]}</td>
                    <td className="px-5 py-4 text-gray-600">{new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-5 py-4 text-gray-600">{new Date(item.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-5 py-4">
                      {item.report_file && (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                          {item.report_file.endsWith(".pdf") ? (
                            <span className="text-blue-600 font-medium text-sm">PDF</span>
                          ) : (
                            <img
                              src={`${process.env.REACT_APP_API_URL}/cso_files/${item.category_name}/${item.report_file}`}
                              alt="Report"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                          statusColors[item.status.toLowerCase()] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(item);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                      <svg 
                        className="w-16 h-16 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600 font-medium mt-2">No matching reports found</p>
                      <p className="text-sm text-gray-500 max-w-xs text-center">
                        Try adjusting your filters or search terms to find what you're looking for
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
          <div className="text-gray-600 font-medium">
            Showing {indexOfFirstReport + 1} to {Math.min(indexOfLastReport, filteredReports.length)} of {filteredReports.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2.5 rounded-xl font-medium ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              } transition-all focus:outline-none focus:ring-2 focus:ring-blue-200`}
            >
              Previous
            </button>
            <span className="text-gray-600 font-medium px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2.5 rounded-xl font-medium ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              } transition-all focus:outline-none focus:ring-2 focus:ring-blue-200`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EachCso;