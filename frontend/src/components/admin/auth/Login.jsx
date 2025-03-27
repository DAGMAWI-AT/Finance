
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [registrationId, setRegistrationId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading animation
    setMessage('');
    setError(null);

    try {
      // Attempt to log in
      const loginResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/staff/login`,
        { registrationId, email, password },
        { withCredentials: true }
      );

      if (loginResponse.data.success) {
        // Fetch user details after successful login
        const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
          withCredentials: true,
        });

        if (meResponse.data.success) {
          const { role } = meResponse.data;
          if (role === 'admin' || role === 'sup_admin') {
            navigate('/admin/dashboard');
          } else {
            setMessage(`Unknown role: ${role}. Please contact support.`);
          }
        } else {
          setMessage('Failed to fetch user details. Please try again.');
        }
      } else {
        setMessage(loginResponse.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        if (error.response.status === 401) {
          setMessage('Invalid credentials. Please check your registration ID, email, and password.');
          setTimeout(() => {
            setMessage("");
          }, 10000);

        } else if (error.response.status === 500) {
          setMessage('Internal server error. Please try again later.');
        } else {
          setMessage(error.response.data.message || 'An unexpected error occurred.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setMessage('No response from the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-semibold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="registrationId" className="block text-gray-600 font-medium mb-1">
              Registration ID
            </label>
            <input
              type="text"
              id="registrationId"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              placeholder="Enter your registration ID"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <Link to="/forgetPassword" className="text-sm text-indigo-600 hover:underline">
              Forgot Password?
            </Link>
            <Link to="/staff/register" className="text-sm text-indigo-600 hover:underline">
              Have Not Account
            </Link>
          </div>
          {message && (
  <div className="relative bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm text-center transition-opacity duration-500">
    {message}
    <div className="absolute left-0 bottom-0 h-1 bg-red-500 animate-[progress_2s_linear_forwards]"></div>
  </div>
)}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-blue-300 mr-2"></span>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;


// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios'; 

// const Login = () => {
//   const navigate = useNavigate();
//   const [registrationId, setRegistrationId] = useState("");
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   axios.defaults.withCredentials = true;


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true); // Start loading animation
//     setMessage("");

//     try {
//       const loginResponse = await axios.post(
//         "${process.env.REACT_APP_API_URL}/api/staff/login",
//         { registrationId, email, password },
//         { withCredentials: true }
//       );

//       if (loginResponse.data.success) {
//         const meResponse = await axios.get("${process.env.REACT_APP_API_URL}/api/staff/me", {
//           withCredentials: true,
//         });

//         if (meResponse.data.success) {
//           const { role } = meResponse.data;
//           if (role === "admin" || "sup_admin") {
//             navigate("/admin/dashboard");
//           } else {
//             setMessage("Unknown role: " + role);
//           }
//         } else {
//           setMessage("Failed to fetch user details.");
//         }
//       } else {
//         console.log(loginResponse.data +"error not have")

//         setMessage(loginResponse.data.message);
//         console.log(loginResponse.data)
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//       setMessage(error.response?.data?.message || "An unexpected error occurred.");
//     } finally {
//       setLoading(false); // Stop loading animation
//     }
//   };
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
//       <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
//         <h2 className="text-4xl font-semibold mb-6 text-center text-gray-800">Login</h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//             <label htmlFor="registrationId" className="block text-gray-600 font-medium mb-1">
//               Registration ID
//             </label>
//             <input
//               type="text"
//               id="registrationId"
//               value={registrationId}
//               onChange={(e) => setRegistrationId(e.target.value)}
//               placeholder="Enter your registration ID"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>
//           <div className="flex items-center justify-between">
//             <Link to="/forgetPassword" className="text-sm text-indigo-600 hover:underline">Forgot Password?</Link>
//             <Link to="/staff/register" className="text-sm text-indigo-600 hover:underline">Have Not Account</Link>

//           </div>
//           {message && <p className="text-sm text-red-600">{message}</p>}
 
//             <button
//             type="submit"
//             disabled={loading}
//             className={`w-full text-white font-bold py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
//               loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
//             }`}
//           >
//           {loading ? (
//               <div className="flex justify-center items-center">
//                 <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-blue-300 mr-2"></span>
//                 Logging in...
//               </div>
//             ) : (
//               "Login"
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;
