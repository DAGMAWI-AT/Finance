import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const AdminLayout = () => {
  const location = useLocation();


    const [darkMode, setDarkMode] = useState(false); // Dark mode state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Sidebar collapse state
    const navigate = useNavigate()

    const toggleDarkMode = () => setDarkMode((prevMode) => !prevMode);
    const toggleSidebar = () => setSidebarCollapsed((prevState) => !prevState);
    
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location]);


      const fetchUsers = async () => {
        try {
          const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
            withCredentials: true,
          });
    
          if (!meResponse.data || !meResponse.data.success || !meResponse.data?.success) {
            navigate("/login");
            return;
          }
    
        } catch (err) {
          
        }
      };
      useEffect(() => {
        fetchUsers();
      }, []);
    return (
      // <div className={`user-layout ${darkMode ? "dark" : "light"}`}>
      <div className='user-layout' >
   
      {/* Sidebar */}
        <Sidebar darkMode={darkMode} collapsed={sidebarCollapsed} />
  
        {/* Navbar and Main Content */}
        <div className={`layout-content ${sidebarCollapsed ? "collapsed" : ""}`}>
          <Navbar
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            toggleSidebar={toggleSidebar} // Pass toggleSidebar to Navbar
          />
          <main className="main-content">
            <ToastContainer position="top-right" autoClose={5000} />
            <Outlet />
          </main>
          {/* <Footer/> */}
  
        </div>
      </div>
    );
  };
  
  

export default AdminLayout
