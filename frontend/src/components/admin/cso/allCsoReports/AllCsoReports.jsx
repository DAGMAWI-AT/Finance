import React, { useCallback, useEffect, useState } from "react";
import { FaEye, FaSearch, FaSort, FaSortDown, FaSortUp, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import Swal from "sweetalert2";

const AllCsoReports = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allReport, setAllReport] = useState([]);
  const [csoNames, setCsoNames] = useState({});
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const reportsPerPage = 5;
  const navigate = useNavigate();

  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    approve: "bg-green-100 text-green-700",
    inprogress: "bg-orange-100 text-orange-700",
    pending: "bg-yellow-100 text-yellow-700",
    reject: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
  };
  // Sorting functionality
  const sortedReports = React.useMemo(() => {
    const sortableReports = [...allReport];
    if (sortConfig.key) {
      sortableReports.sort((a, b) => {
        let aValue, bValue;

        switch(sortConfig.key) {
          case 'csoName':
            aValue = csoNames[a.registration_id]?.toLowerCase() || '';
            bValue = csoNames[b.registration_id]?.toLowerCase() || '';
            break;
          case 'category':
            aValue = categories[a.category_id]?.toLowerCase() || '';
            bValue = categories[b.category_id]?.toLowerCase() || '';
            break;
          case 'created_at':
          case 'updated_at':
            aValue = new Date(a[sortConfig.key]);
            bValue = new Date(b[sortConfig.key]);
            break;
          default:
            aValue = a[sortConfig.key]?.toLowerCase() || '';
            bValue = b[sortConfig.key]?.toLowerCase() || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableReports;
  }, [allReport, sortConfig, csoNames, categories]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Date filtering
  const filteredReports = sortedReports.filter((report) => {
    const reportDate = new Date(report.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const matchesDate = (!start || reportDate >= start) && (!end || reportDate <= end);
    const matchesSearch = (
      (csoNames[report.registration_id] || '').toLowerCase().includes(search.toLowerCase()) ||
      (report.report_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return matchesDate && matchesSearch;
  });
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch reports
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/report`);
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        const reportsArray = Array.isArray(data) ? data : data.reports || [];
        setAllReport(reportsArray);

        // Fetch categories
        const uniqueCategoryIds = [...new Set(reportsArray.map((report) => report.category_id))];
        const categoryData = {};
        await Promise.all(
          uniqueCategoryIds.map(async (catId) => {
            try {
              const resultCat = await fetch(`${process.env.REACT_APP_API_URL}/api/reportCategory/${catId}`);
              if (resultCat.ok) {
                const catData = await resultCat.json();
                categoryData[catId] = catData.category_name || catData[0]?.category_name;
              }
            } catch (error) {
              console.error("Error fetching category for id", catId, error);
            }
          })
        );
        setCategories(categoryData);

        // Fetch CSO names
        const uniqueRegIds = [...new Set(reportsArray.map((report) => report.registration_id))];
        const csoData = {};
        await Promise.all(
          uniqueRegIds.map(async (regId) => {
            try {
              const csoResult = await fetch(`${process.env.REACT_APP_API_URL}/api/cso/res/${regId}`);
              if (csoResult.ok) {
                const csoDataResponse = await csoResult.json();
                // Adjust based on API response structure:
                csoData[regId] = csoDataResponse[0]?.csoName || csoDataResponse.csoName;
              }
            } catch (error) {
              console.error("Error fetching CSO for registration ID:", regId, error);
            }
          })
        );
        setCsoNames(csoData);

      } catch (error) {
        console.error("Error fetching reports:", error.message);
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "Failed to fetch reports. Please try again later.",
        //   confirmButtonColor: "#d33",
        // });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter reports by search query
  // const filteredReports = allReport.filter((item) => {
  //   const csoName = csoNames[item.registration_id] || "";
  //   const reportName = item.report_name || "";
  //   return (
  //     csoName.toLowerCase().includes(search.toLowerCase()) ||
  //     reportName.toLowerCase().includes(search.toLowerCase())
  //   );
  // });

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this report!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/report/${id}`, {
          method: "DELETE",
        });
  
        if (response.ok) {
          Swal.fire("Deleted!", "The report has been deleted.", "success");
          setAllReport((prevReports) => prevReports.filter((item) => item.id !== id));
        } else {
          Swal.fire("Error!", "Failed to delete the report.", "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  }, []);
  
  const handleView = (report) => {
    navigate(`/admin/show_report/${report.id}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-600">CSO Management</h2>
          <div className="w-full md:w-auto space-y-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search CSO or report..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-200 whitespace-nowrap uppercase">
              <tr>
                {[
                  { label: 'CSO Name', key: 'csoName' },
                  { label: 'File Name', key: 'report_name' },
                  { label: 'Category', key: 'category' },
                  { label: 'Submitted', key: 'created_at' },
                  { label: 'Updated', key: 'updated_at' },
                  { label: 'File', key: null },
                  { label: 'Status', key: 'status' },
                  { label: 'Actions', key: null },
                ].map((header) => (
                  <th
                    key={header.label}
                    className="px-5 py-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => header.key && requestSort(header.key)}
                  >
                    <div className="flex items-center gap-2">
                      {header.label}
                      {header.key && (
                        <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {sortConfig.key === header.key ? (
                            sortConfig.direction === 'asc' ? (
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
                  currentReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {csoNames[report.registration_id]}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        {report.report_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {categories[report.category_id]}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(report.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {report.report_file?.endsWith(".pdf") ? (
                            <span className="text-blue-600 font-medium text-sm">PDF</span>
                          ) : (
                            <img
                              src={`${process.env.REACT_APP_API_URL}/cso_files/${report.category_name}/${report.report_file}`}
                              alt="Report preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                            statusColors[report.status.toLowerCase()] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleView(report)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Data"
                          >
                            <FaTrashAlt className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaSearch className="text-3xl text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          No matching reports found
                        </p>
                        <p className="text-sm text-gray-500">
                          Try adjusting your search terms
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
  
          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
            <div className="text-gray-600 text-sm">
              Showing {indexOfFirstReport + 1} to{" "}
              {Math.min(indexOfLastReport, filteredReports.length)} of{" "}
              {filteredReports.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                } transition-all`}
              >
                Previous
              </button>
              <span className="px-4 text-gray-600 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                } transition-all`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AllCsoReports;