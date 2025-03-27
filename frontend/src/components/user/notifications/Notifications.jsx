import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'read', 'unread'
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const notificationsPerPage = 10;

  // Fetch notifications from the backend using registrationId from /me endpoint
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // First, get user details from /api/users/me
        const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          withCredentials: true,
        });
        if (!meResponse.data.success) {
          throw new Error("Failed to get user details");
        }
        const { registrationId } = meResponse.data;

        // Then, fetch notifications using registrationId from backend
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/notifications/notification/${registrationId}`,
          { method: "GET", credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: Expected an array");
        }

        // Filter out notifications authored by the current user
        const filteredData = data.filter(
          (notif) => notif.author_id !== registrationId
        );
        setNotifications(filteredData);
        setFilteredNotifications(filteredData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications based on search, date range, and status
  useEffect(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter((notification) =>
        notification.notification_message
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((notification) => {
        const notificationDate = new Date(notification.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return notificationDate >= start && notificationDate <= end;
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((notification) =>
        statusFilter === "read"
          ? notification.read === 1
          : notification.read !== 1
      );
    }

    // Sort notifications (latest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }, [notifications, searchTerm, startDate, endDate, statusFilter]);

  // Pagination
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = Array.isArray(filteredNotifications)
    ? filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification)
    : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Mark notification as read and navigate to report details
  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/notifications/read/${id}`,
        {},
        { withCredentials: true } // No need for Authorization header since cookie is used
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: 1 } : notification
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const viewReportDetails = async (report_id) => {
    try {
      navigate(`/user/view_submitted/${report_id}`);
    } catch (error) {
      console.error("Error fetching report details:", error);
    }
  };

  // Delete notification with confirmation
  const handleDeleteNotification = async (id) => {
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
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/notifications/${id}`, {
          withCredentials: true,
        });
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
        Swal.fire("Deleted!", "Your notification has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error!", "Failed to delete notification.", "error");
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Notifications</h1>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-60 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentNotifications.map((notification) => (
              <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {notification.notification_message}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {notification.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(notification.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      notification.read === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {notification.read === 1 ? "Read" : "Unread"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => {
                      handleMarkAsRead(notification.id);
                      viewReportDetails(notification.report_id);
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    disabled={notification.read === 0}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      notification.read === 0
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({
          length: Math.ceil(filteredNotifications.length / notificationsPerPage),
        }).map((_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
