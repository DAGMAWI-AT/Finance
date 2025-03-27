import React, { useState } from "react";
import {
  FaCog,
  FaHistory,
  FaDochub,
  FaClipboardList,
  FaHome,
  FaFonticonsFi,
  FaBell,
  FaCommentAlt,
  FaAccessibleIcon,
  FaFolderMinus,
  FaUserAlt,
} from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

import "./Sidebar.css";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";

const Sidebar = ({ darkMode, toggleDarkMode, collapsed }) => {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const location = useLocation();

  const toggleReportsSubmenu = () => {
    setIsReportsOpen(!isReportsOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`user_sidebar ${collapsed ? "collapsed" : ""} ${
        darkMode ? "dark" : "light"
      }`}
    >
      <div className="logo">
        <h2>{collapsed ? "CSO" : "CSOs"}</h2>
      </div>
      <div className="scrollable-menu">
        <ul className="menu">
          <li
            className={`menu-item ${
              isActive("/user/dashboard") ? "active" : ""
            }`}
          >
            <Link to="/user/dashboard" className="flex items-center">
              <FaHome />
              <span>{!collapsed && "Dashboard"}</span>
            </Link>
          </li>

          <li className="menu-item" onClick={toggleReportsSubmenu}>
            <FaFolderMinus />
            <span>{!collapsed && "Reports"}</span>
            {!collapsed &&
              (isReportsOpen ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              ))}
          </li>
          {!collapsed && isReportsOpen && (
            <ul className="submenu">
              <li
                className={`submenu-item ${
                  isActive("/user/work_report") ? "active" : ""
                }`}
              >
                <Link to="/user/work_report" className="flex items-center">
                  <FaClipboardList />
                  <span className="ml-2">Reported</span>
                </Link>
              </li>{" "}
              <li className="submenu-item">
                <FaCommentAlt className="" />
                Comments
              </li>
              <li
                className={`submenu-item ${
                  isActive("/user/notifications") ? "active" : ""
                }`}
              >
                <Link to="/user/notifications" className="flex items-center">
                  <FaBell />
                  <span className="ml-2">Notifications</span>
                </Link>
              </li>{" "}
            </ul>
          )}

          <li className={`menu-item ${isActive("/user/form") ? "active" : ""}`}>
            <Link to="/user/form" className="flex items-center">
              <FaUserAlt />
              <span>{!collapsed && "Form"}</span>
            </Link>
          </li>
          <li className={`menu-item ${isActive("/user/submitted") ? "active" : ""}`}>
            <Link to="/user/submitted" className="flex items-center">
              <FaHistory />
              <span>{!collapsed && "History"}</span>
            </Link>
          </li>
          <li>
            <FaCog />
            <span>{!collapsed && "Settings"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
