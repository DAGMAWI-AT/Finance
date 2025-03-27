import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { BarLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Forms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);

      // Clear the message after a few seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
  }, [location.state]);
  // Fetch forms from the backend API
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/form/all/Form`,
          {
            credentials: "include", // Include cookies for authentication
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load forms");
        }

        const data = await response.json();
        setForms(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  // Handle search functionality
  const filteredForms = forms.filter((form) =>
    form.form_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sorting
  const sortedForms = [...filteredForms].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  // Handle sort column
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle delete form
  const handleDelete = async (formId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${forms.formId}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/form/${formId}`,
          {
            method: "DELETE",
            credentials: "include", // Include cookies for authentication
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete form");
        }

        setForms(forms.filter((form) => form.id !== formId)); // Remove the deleted form from the state
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Handle view form
  const handleView = (formId) => {
    navigate(`/admin/view_form/${formId}`);
  };

  // Handle edit form
  const handleEdit = (formId) => {
    navigate(`/admin/edit_form/${formId}`);
  };

  // Handle create form
  const handleCreateForm = () => {
    navigate("/admin/create_form");
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentForms = sortedForms.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Change items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-green-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <button
          onClick={handleCreateForm}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Form
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search forms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-48 p-2 border rounded-md text-lg"
        />
      </div>

      {/* Forms Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-left">
          <thead>
            <tr className="text-gray-500 bg-gray-200">
              <th className="py-2 px-4 border-b">#</th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("form_name")}
              >
                <div className="flex items-center">
                  Form Name
                  {sortConfig.key === "form_name" ? (
                    sortConfig.direction === "asc" ? (
                      <FaSortUp className="ml-2" />
                    ) : (
                      <FaSortDown className="ml-2" />
                    )
                  ) : (
                    <FaSort className="ml-2" />
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("expires_at")}
              >
                <div className="flex items-center">
                  Expires At
                  {sortConfig.key === "expires_at" &&
                    (sortConfig.direction === "asc" ? (
                      <FaSortUp className="ml-2" />
                    ) : (
                      <FaSortDown className="ml-2" />
                    ))}
                </div>
              </th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentForms.map((form, index) => (
              <tr
                key={form.id}
                className="hover:bg-gray-50 text-left text-gray-700"
              >
                <td className="py-2 px-4 border-b">
                  {indexOfFirstItem + index + 1}
                </td>
                <td className="py-2 px-4 border-b">{form.form_name}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(form.expires_at).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(form.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(form.id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center">
          <span className="mr-2">Show:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-2 border rounded-md"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">First</span>
              <FiChevronLeft className="h-5 w-5" />
              <FiChevronLeft className="h-5 w-5 -ml-3" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Previous</span>
              <FiChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === pageNum
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Last</span>
              <FiChevronRight className="h-5 w-5" />
              <FiChevronRight className="h-5 w-5 -ml-3" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Forms;
