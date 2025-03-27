import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaBars,
} from "react-icons/fa";
import "./Navbar.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = ({ darkMode, toggleDarkMode, toggleSidebar }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Toggle profile menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Close profile menu
  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  // Fetch notifications from the server
  const fetchNotifications = async () => {
    try {
      const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        withCredentials: true,
      });
      if (!meResponse.data.success) {
        throw new Error("Failed to get user details");
      }
      const { registrationId } = meResponse.data;
      if (!registrationId) {
        console.error("Invalid : registrationId not found");
        return;
      }

      // Fetch notifications
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/notifications/notification/${registrationId}`
      );
      const notificationsData = await response.json();
      // Default to an empty array if data is not an array
        // Filter notifications where the author is not the logged-in user
        const filteredNotifications = notificationsData.filter((notif) => {
          return notif.author_id !== registrationId;
        });
      console.log(notificationsData);
      setNotifications(filteredNotifications);
      console.log(filteredNotifications);

      const unread = filteredNotifications.filter((notif) => !notif.read).length;
      setUnreadCount(unread);
      // setUnreadCount(notificationsData.filter((notif) => !notif.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]); // Set to empty array on error
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationWrapper = document.querySelector('.notification-wrapper');
      if (notificationWrapper && !notificationWrapper.contains(event.target)) {
        setShowNotifications(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Toggle the notification dropdown
  const toggleNotificationDropdown = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark a notification as read
  // const markAsRead = async (id) => {
  //   try {
  //     await axios.put(`${process.env.REACT_APP_API_URL}/api/notifications/read/${id}`);
  //     fetchNotifications(); // Refresh the notification list
  //   } catch (error) {
  //     console.error("Error marking notification as read:", error);
  //   }
  // };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/notifications/read/${id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      fetchNotifications(); // Refresh the notification list
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/logout`);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/user/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // View report details
  const viewReportDetails = async (report_id) => {
  try {
      navigate(`/user/view_submitted/${report_id}`);
    } catch (error) {
      console.error("Error fetching report details:", error);
    }
  };

  return (
    <nav className={`navbar ${darkMode ? "dark" : "light"}`}>
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars className="hamburger-icon" />
        </button>
      </div>

      <div className="navbar-center">
        <div className="search-bar p-7 flex items-center border rounded-full px-1 py-1 w-full max-w-md border-gray-300 focus-within:border-blue-500">
          <FaSearch className="text-gray-400 text-lg m-2" />
          <input
            type="text"
            placeholder="Search"
            className="px-2 py-1 mr-1 mb-1 rounded-full border text-black border-gray-300 focus:outline-none focus:border-none text-sm w-full"
          />
        </div>
      </div>

      <div className="navbar-right">
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        <div className="notification-wrapper">
          <FaBell
            className="icon"
            onClick={toggleNotificationDropdown}
            title="View Notifications"
          />
          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount}</span>
          )}
          {showNotifications && (
            <div className="notifications-dropdown">
              {notifications.filter((notif) => !notif.read).length > 0 ? (
                <ul>
                  {notifications
                    .filter((notif) => !notif.read) // Show only unread notifications
                    .map((notif) => (
                      <li key={notif.id} className="unread">
                        {notif.notification_message}
                        <p>{new Date(notif.timestamp).toLocaleString()}</p>
                        <button
                          onClick={() => {
                            viewReportDetails(notif.report_id);
                            markAsRead(notif.id);
                            setShowNotifications(false); // Add this line to close dropdown

                          }}
                          className="px-2 py-0 bg-green-600 rounded text-white text-sm"
                        >
                          View
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <p>No unread notifications</p>
              )}
            </div>
          )}
        </div>
        <div className="profile-menu">
          <FaUserCircle
            className="icon user-icon"
            onClick={toggleProfileMenu}
          />
          {isProfileMenuOpen && (
            <div className="dropdown-menu" onMouseLeave={closeProfileMenu}>
              <ul>
                <li onClick={closeProfileMenu}>
                  <Link to="/user/view_user_prifile">Profile</Link>
                </li>
                <li onClick={closeProfileMenu}>
                  <Link to="/user/edit_user_password">Update Password</Link>
                </li>
                <li onClick={handleLogout}>Log Out</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
