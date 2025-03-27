import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaEye, FaTrash, FaUserAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BeneficiaryList = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/beneficiaries`
        );
        setBeneficiaries(response.data.data);
        setFilteredBeneficiaries(response.data.data);
      } catch (error) {
        console.error("Error fetching beneficiaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, []);

  // Automatically filter beneficiaries when searchTerm, startDate, or endDate changes
  useEffect(() => {
    handleSearch();
  }, [searchTerm, startDate, endDate]);

  const handleSearch = () => {
    let filtered = beneficiaries.filter((beneficiary) => {
      const matchName = beneficiary.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchDate =
        (!startDate ||
          new Date(beneficiary.createdAt) >= new Date(startDate)) &&
        (!endDate || new Date(beneficiary.createdAt) <= new Date(endDate));
      return matchName && matchDate;
    });
    setFilteredBeneficiaries(filtered);
  };

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
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/beneficiaries/${id}`);
        setBeneficiaries(
          beneficiaries.filter((beneficiary) => beneficiary.id !== id)
        );
        setFilteredBeneficiaries(
          filteredBeneficiaries.filter((beneficiary) => beneficiary.id !== id)
        );
        Swal.fire("Deleted!", "The beneficiary has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting beneficiary:", error);
        Swal.fire("Error!", "Failed to delete beneficiary.", "error");
      }
    }
  };

  const handleView = (id) => {
    navigate(`/admin/view_beneficiary/${id}`);
  };

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredBeneficiaries].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredBeneficiaries(sorted);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredBeneficiaries.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const exportToPDF = () => {
    const selectedBeneficiaries = beneficiaries.filter((beneficiary) =>
      selectedRows.includes(beneficiary.id)
    );

    const doc = new jsPDF();
    doc.autoTable({
      head: [["Photo", "Full Name", "Phone", "Email", "Registration Date"]],
      body: selectedBeneficiaries.map((beneficiary) => [
        beneficiary.photo,
        beneficiary.fullName,
        beneficiary.phone,
        beneficiary.email,
        beneficiary.createdAt,
      ]),
    });
    doc.save("beneficiaries.pdf");
  };

  const exportToExcel = () => {
    const selectedBeneficiaries = beneficiaries.filter((beneficiary) =>
      selectedRows.includes(beneficiary.id)
    );

    const worksheet = XLSX.utils.json_to_sheet(selectedBeneficiaries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Beneficiaries");
    XLSX.writeFile(workbook, "beneficiaries.xlsx");
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Beneficiary List</h2>
        <Link
          to="/admin/add_beneficiary"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Beneficiary
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <div className="flex gap-2 my-1 p-1">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            disabled={selectedRows.length === 0}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${
              selectedRows.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Export to PDF
          </button>
          <button
            onClick={exportToExcel}
            disabled={selectedRows.length === 0}
            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
              selectedRows.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Export to Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="whitespace-nowrap">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredBeneficiaries.length}
                  onChange={() => {
                    if (selectedRows.length === filteredBeneficiaries.length) {
                      setSelectedRows([]);
                    } else {
                      setSelectedRows(
                        filteredBeneficiaries.map(
                          (beneficiary) => beneficiary.id
                        )
                      );
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("fullName")}
              >
                Full Name{" "}
                {sortConfig.key === "fullName" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("phone")}
              >
                Phone{" "}
                {sortConfig.key === "phone" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig.key === "email" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Registration Date{" "}
                {sortConfig.key === "createdAt" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((beneficiary) => (
              <tr key={beneficiary.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(beneficiary.id)}
                    onChange={() => handleRowSelect(beneficiary.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {" "}
                  {!imgError[beneficiary.id] && beneficiary.photo ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL}/photoFiles/${beneficiary.photo}`}
                      alt=""
                      onError={() =>
                        setImgError((prev) => ({
                          ...prev,
                          [beneficiary.id]: true,
                        }))
                      }
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  ) : (
                    <FaUserAlt className="w-12 h-12 text-blue-400 p-2 rounded-full bg-gray-100" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {beneficiary.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {beneficiary.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {beneficiary.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(beneficiary.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <Link
                    to={`/admin/edit_beneficiary/${beneficiary.id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(beneficiary.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handleView(beneficiary.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastRow >= filteredBeneficiaries.length}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </div>
  );
};

export default BeneficiaryList;
