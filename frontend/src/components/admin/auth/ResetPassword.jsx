import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state
  const [error, setError] = useState();
  
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setTimeout(() => {
        setError("");
      }, 2000);
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/staff/reset-password/${token}`, { newPassword });
      setMessage(response.data.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Error resetting password.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      {message && <div className="mb-4 text-green-600">{message}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
