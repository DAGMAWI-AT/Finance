import React, { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signin = () => {
  const [registrationId, setRegistrationId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading animation
    setMessage("");

    try {
      const loginResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        { registrationId, email, password },
        { withCredentials: true }
      );

      if (loginResponse.data.success) {
        const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          withCredentials: true,
        });
        if (meResponse.data.success) {
          const { role } = meResponse.data;
          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (role === "cso") {
            navigate("/user/dashboard");
          } else {
            setMessage("Unknown role: " + role);
          }
        } else {
          setMessage("Failed to fetch user details.");
        }
      } else {
        setMessage(loginResponse.data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-800 via-blue-300 to-blue-500">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
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
            <label htmlFor="email" className="block text-gray-600 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-600 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          {/* Button with Loading Animation */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-blue-300 mr-2"></span>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>

          <Link to="/forgot_password" className="block text-center text-blue-500 hover:underline">
            Forgot Password?
          </Link>

          {message && (
            <p className="text-center text-red-500 font-medium mt-4">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signin;
