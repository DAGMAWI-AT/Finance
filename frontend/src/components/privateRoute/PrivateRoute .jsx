// import React, { useState, useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import axios from "axios";

// const PrivateRoute = ({ element, roleRequired }) => {
//   const [loading, setLoading] = useState(true);
//   const [redirectPath, setRedirectPath] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await axios.get("${process.env.REACT_APP_API_URL}/api/users/me", {
//           withCredentials: true,
//         });

//         if (response.data.success) {
//           const { role } = response.data;
//           // If the user's role doesn't match, redirect them to their dashboard
//           if (role !== roleRequired) {
//             setRedirectPath(role === "admin" || role ===  "sup_admin" ? "/admin/dashboard" : "/user/dashboard");
//           }
//         } else {
//           setRedirectPath("/user/login");
//         }
//       } catch (error) {
//         console.error("Authentication check error:", error);
//         setRedirectPath("/user/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [roleRequired]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-200">
//         <p className="text-xl font-bold">Loading...</p>
//       </div>
//     );
//   }

//   if (redirectPath) {
//     return <Navigate to={redirectPath} />;
//   }

//   return element;
// };

// export default PrivateRoute;

// import React, { useState, useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import axios from "axios";

// const PrivateRoute = ({ element, roleRequired }) => {
//   const [loading, setLoading] = useState(true);
//   const [redirectPath, setRedirectPath] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await axios.get("${process.env.REACT_APP_API_URL}/api/users/me", {
//           withCredentials: true,
//         });

//         if (response.data.success) {
//           const { role } = response.data;

//           if (role !== roleRequired) {
//             // Redirect users to their respective dashboard
//             if (role === "admin" || role === "sup_admin") {
//               setRedirectPath("/admin/dashboard");
//             } else if (role === "cso") {
//               setRedirectPath("/user/dashboard");
//             } else {
//               setRedirectPath("/");
//             }
//           }
//         } else {
//           // If not authenticated, redirect to the correct login page
//           handleLoginRedirect(roleRequired);
//         }
//       } catch (error) {
//         console.error("Authentication check error:", error);
//         handleLoginRedirect(roleRequired);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [roleRequired]);

//   // Function to handle login redirection for expired sessions
//   const handleLoginRedirect = (role) => {
//     if (role === "admin" || role === "sup_admin") {
//       setRedirectPath("/login"); // Shared login for admin & sup_admin
//     } else if (role === "cso") {
//       setRedirectPath("/user/login"); // Default user login
//     }else{
//       setRedirectPath("/"); // Default user login
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-200">
//         <p className="text-xl font-bold">Loading...</p>
//       </div>
//     );
//   }

//   if (redirectPath) {
//     return <Navigate to={redirectPath} />;
//   }

//   return element;
// };

// export default PrivateRoute;

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { BarLoader } from "react-spinners";

const PrivateRoute = ({ element, roleRequired }) => {
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          withCredentials: true,
        });

        if (response.data.success) {
          const { role } = response.data;

          // Check if the user's role is in the roleRequired array
          if (!roleRequired.includes(role)) {
            setRedirectPath("/404"); // Or you can redirect to a specific page
          }
        } else {
          handleLoginRedirect(roleRequired);
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        handleLoginRedirect(roleRequired);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [roleRequired]);

  const handleLoginRedirect = (role) => {
    if (roleRequired.includes("admin") || roleRequired.includes("sup_admin")) {
      setRedirectPath("/login"); // Redirect admin/sup_admin to login page
    } else {
      setRedirectPath("/user/login"); // Redirect other users to their login page
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  return element;
};

export default PrivateRoute;
