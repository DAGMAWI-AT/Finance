import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import { BarLoader } from "react-spinners";
import Swal from "sweetalert2";

// Set up Axios interceptor to handle 401 errors globally
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Redirect to login page if unauthorized
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

const Category = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if the user is authenticated
        const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
          withCredentials: true,
        });

        if (!meResponse.data || !meResponse.data.success) {
          navigate("/login");
          return;
        }

        // Fetch report categories
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reportCategory/cat`, {
          withCredentials: true,
        });

        if (response.data) {
          setData(response.data); // Assuming response.data is an array
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleEdit = (id) => {
    navigate(`/admin/report_category/edit_category/${id}`);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to remove this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/reportCategory/${id}`,
            { Credentials: "include" }
          );

          if (response.data) {
            setData((prevData) => prevData.filter((item) => item.id !== id));
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "The report category has been deleted.",
              confirmButtonColor: "#3085d6",
            });
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Failed to delete the category.",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  const handleAddReportCategory = () => {
    navigate("/admin/report_category/category");
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return data;

    return data.filter(
      (item) =>
        item.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expire_date.includes(searchQuery)
    );
  };

  const filteredData = handleSearch();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-700">Report Category</h2>
          <div className="flex items-center mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search by name or date"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="ml-4 px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              onClick={handleAddReportCategory}
            >
              + Upload
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expire Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {index + 1 + (currentPage - 1) * itemsPerPage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {row.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {new Date(row.expire_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => handleEdit(row.id)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        onClick={() => handleDelete(row.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-6">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
            </span>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;