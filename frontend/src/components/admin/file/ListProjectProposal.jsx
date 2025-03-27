import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; // Import Font Awesome icons
import Swal from "sweetalert2"; // Import SweetAlert2

const ListProjectProposal = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("${process.env.REACT_APP_API_URL}/api/projects/all");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered and sorted data
  const filteredData = data
    .filter((row) => {
      const matchesSearch = Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesDate =
        (!startDate || new Date(row.created_at) >= new Date(startDate)) &&
        (!endDate || new Date(row.created_at) <= new Date(endDate));
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Handle View action
  const handleView = (id) => {
    navigate(`/admin/view/${id}`); // Navigate to /admin/view/:id
  };

  // Handle Edit action
  const handleEdit = (id) => {
    navigate(`/admin/edit/${id}`); // Navigate to /admin/project/:id
  };

  // Handle Delete action with SweetAlert2
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/delete/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete project");
        }
        // Remove the deleted project from the state
        setData(data.filter((project) => project.id !== id));
        Swal.fire("Deleted!", "The project has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire("Error!", "Failed to delete project.", "error");
      }
    }
  };

  // Handle Add action
  const handleAdd = () => {
    navigate("/admin/project"); // Navigate to /admin/project
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Project List</h1>
      <div className="mt-4 mb-2 justify-end">
        <button
          onClick={handleAdd} // Navigate to /admin/project
          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 justify-end"
        >
          + Add
        </button>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={() => {
            setSearchTerm("");
            setStartDate("");
            setEndDate("");
          }}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Clear Filters
        </button>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th
                className="p-2 border border-gray-300 cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Title {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="p-2 border border-gray-300 cursor-pointer"
                onClick={() => handleSort("description")}
              >
                Description{" "}
                {sortConfig.key === "description" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="p-2 border border-gray-300 cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Date {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-2 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                <td className="p-2 border border-gray-300">{row.title}</td>
                <td className="p-2 border border-gray-300">{row.description}</td>
                <td className="p-2 border border-gray-300">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border border-gray-300">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(row.id)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Button */}

    </div>
  );
};

export default ListProjectProposal;