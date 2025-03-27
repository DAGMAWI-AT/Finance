import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const EditUserPassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("New passwords don't match");
    }

    try {
      const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        withCredentials: true,
      });

      if (!meResponse.data.success) {
        navigate("/user/login");
        return;
      }
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/update-password`, // Ensure the correct path
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess("Password updated successfully!");
        setTimeout(() => navigate("/user/dashboard"), 2000); // Redirect after 2 seconds
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength="8"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default EditUserPassword;
