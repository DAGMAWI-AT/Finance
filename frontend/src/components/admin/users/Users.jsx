import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

// Constants
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50];
const TABLE_COLUMNS = [
  { key: 'registrationId', label: 'Registration ID' },
  { key: 'name', label: 'Name' },
  { key: 'userId', label: 'User ID' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
];

// Helper Components
const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-sm 
    ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {status}
  </span>
);

const SortIndicator = ({ direction }) => (
  <span className="ml-2">
    {direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
  </span>
);

// Main Component
const Users = () => {
  const [errorMessage, setError] = useState("");

  const [state, setState] = useState({
    users: [],
    filteredUsers: [],
    searchTerm: '',
    selectedRows: [],
    currentPage: 1,
    itemsPerPage: 10,
    loading: true,
    statusFilter: "all",
    sortConfig: { key: null, direction: 'asc' },
    showEditUserForm: false,
    selectedUser: null,
    formData: {
      registrationId: '',
      name: '',
      userId: '',
      email: '',
      password: '',
      role: 'cso',
      status: 'active'
    },
  });

  const navigate = useNavigate();
  // Memoized derived values
  const { 
    users,
    filteredUsers,
    searchTerm,
    selectedRows,
    currentPage,
    itemsPerPage,
    loading,
    statusFilter,
    sortConfig,
    showEditUserForm,
    selectedUser,
    formData,
  } = state;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredUsers.length / itemsPerPage),
    [filteredUsers.length, itemsPerPage]
  );

  // Data fetching
  const fetchUsers = async () => {
    try {
      const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
        withCredentials: true,
      });

      if (!meResponse.data || !meResponse.data.success) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/users`, { withCredentials: true });
      setState(prev => ({ ...prev, users: response.data, loading: false }));
    } catch (err) {
      handleError(err);
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtering and sorting
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = Object.keys(user).some(key =>
        String(user[key]).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setState(prev => ({
      ...prev,
      filteredUsers: sorted,
      currentPage: 1
    }));
  }, [users, searchTerm, statusFilter, sortConfig]);

  // Handlers
  const requestSort = useCallback(key => {
    setState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
      }
    }));
  }, []);

  const handleSelectionChange = useCallback((id) => {
    setState(prev => ({
      ...prev,
      selectedRows: prev.selectedRows.includes(id)
        ? prev.selectedRows.filter(selectedId => selectedId !== id)
        : [...prev.selectedRows, id]
    }));
  }, []);

  const handleBulkSelection = useCallback((shouldSelect) => {
    setState(prev => ({
      ...prev,
      selectedRows: shouldSelect 
        ? [...new Set([...prev.selectedRows, ...paginatedUsers.map(u => u.id)])]
        : prev.selectedRows.filter(id => !paginatedUsers.some(u => u.id === id))
    }));
  }, [paginatedUsers]);

  // Export functionality
  const exportData = useCallback((format) => {
    const selectedData = filteredUsers.filter(user => selectedRows.includes(user.id));
    
    if (selectedData.length === 0) {
      Swal.fire('No Selection', 'Please select users to export.', 'warning');
      return;
    }

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(selectedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, "users.xlsx");
    } else {
      const doc = new jsPDF();
      doc.autoTable({
        head: [TABLE_COLUMNS.map(col => col.label)],
        body: selectedData.map(user => TABLE_COLUMNS.map(col => user[col.key]))
      });
      doc.save("users.pdf");
    }
  }, [filteredUsers, selectedRows]);

  // CRUD Operations
  const handleUpdateUser = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/update/${selectedUser.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to update user");

      const updatedUser = await response.json();
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => user.id === updatedUser.id ? updatedUser : user),
        showEditUserForm: false
      }));
      await fetchUsers()
      showSuccess('User updated successfully.');
    } catch (err) {
      handleError(err.message);
    }
  }, [selectedUser, formData]);

  const handleDeleteUser = useCallback(async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (isConfirmed) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/users/remove/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        setState(prev => ({
          ...prev,
          users: prev.users.filter(user => user.id !== id),
          filteredUsers: prev.filteredUsers.filter(user => user.id !== id)
        }));
        showSuccess('User deleted successfully.');
      } catch (err) {
        handleError(err.message);
      }
    }
  }, []);

  // Helper functions
  const handleError = (error) => {
    console.error("Error:", error); // Logs error for debugging
  
    // If error is an Axios error and response exists
    if (error?.response?.status === 401) {
      navigate("/login");
    } else {
      const errorMessage =
        error?.response?.data?.message || error?.message || "An unknown error occurred";
  
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        timer: 3000, // Auto-dismiss after 3 seconds
      });
  
      if (typeof setError === "function") {
        setError(errorMessage); // Store the error message in state
      }
    }
  };
  
  
  

  const showSuccess = useCallback((message) => {
    Swal.fire('Success!', message, 'success');
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>

        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search users..."
            className="p-2 border rounded flex-grow"
            value={searchTerm}
            onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
          
          <select
            value={statusFilter}
            onChange={e => setState(prev => ({ ...prev, statusFilter: e.target.value }))}
            className="p-2 border rounded"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => navigate("/admin/create_userAccount")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 whitespace-nowrap"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Export Controls */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => exportData('excel')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export to Excel
        </button>
        <button
          onClick={() => exportData('pdf')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Export to PDF
        </button>
      </div>
     
      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={paginatedUsers.every(u => selectedRows.includes(u.id))}
                  onChange={e => handleBulkSelection(e.target.checked)}
                />
              </th>
              {TABLE_COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-sm font-medium uppercase whitespace-nowrap text-gray-700 tracking-wider cursor-pointer"
                  onClick={() => requestSort(key)}
                >
                  <div className="flex items-center">
                    {label}
                    {sortConfig.key === key && (
                      <SortIndicator direction={sortConfig.direction} />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-800">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleSelectionChange(user.id)}
                  />
                </td>
                {TABLE_COLUMNS.map(({ key }) => (
                  <td key={key} className="px-4 py-3 text-gray-600">
                    {key === 'status' ? (
                      <StatusBadge status={user[key]} />
                    ) : (
                      user[key] || '-'
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => setState(prev => ({
                      ...prev,
                      selectedUser: user,
                      formData: user,
                      showEditUserForm: true
                    }))}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {errorMessage && <p className="error-text text-center text-red-400">{errorMessage}</p>}

      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <select 
            value={itemsPerPage}
            onChange={e => setState(prev => ({
              ...prev,
              itemsPerPage: Number(e.target.value),
              currentPage: 1
            }))}
            className="p-1 border rounded"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>show</span>
        </div>
        
        <span>
          Page {currentPage} of {totalPages}
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => setState(prev => ({ 
              ...prev, 
              currentPage: Math.max(1, prev.currentPage - 1) 
            }))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Previous
          </button>
          <button
            onClick={() => setState(prev => ({
              ...prev,
              currentPage: Math.min(totalPages, prev.currentPage + 1)
            }))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Status</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.status}
                    onChange={e => setState(prev => ({
                      ...prev,
                      formData: { ...prev.formData, status: e.target.value }
                    }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, showEditUserForm: false }))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Prop Types
StatusBadge.propTypes = {
  status: PropTypes.oneOf(['active', 'inactive']).isRequired
};

SortIndicator.propTypes = {
  direction: PropTypes.oneOf(['asc', 'desc']).isRequired
};

export default Users;