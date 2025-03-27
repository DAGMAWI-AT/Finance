import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaUserAlt,
  FaLock,
  FaBriefcase,
  FaCamera,
  FaUserTag,
  FaKey,
  FaLockOpen,
  FaUnlock,
} from "react-icons/fa";

const StaffRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
    status: "active",
    position: "",
    photo: null,
    password: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "confirmPassword") {
        formDataObj.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/register`, {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "An unexpected error occurred.");
        return;
      }

      const result = await response.json();
      if (result.success) {
        setSuccessMessage("Staff registered successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);

        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "admin",
          status: "active",
          position: "",
          photo: null,
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => navigate("/admin/dashboard"), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("An error occurred while submitting the form.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          Register Staff of Finance Office
        </h2>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-600 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitStaff} encType="multipart/form-data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Staff Name */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Staff Name</label>
              <FaUserAlt className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Email</label>
              <FaEnvelope className="absolute left-3 top-10 text-blue-800" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Phone Number</label>
              <FaPhoneAlt className="absolute left-3 top-10 text-blue-800" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Role */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Role</label>
              <FaUserTag className="absolute left-3 top-10 text-blue-800" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            {/* Status */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Position */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Position</label>
              <FaBriefcase className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">password</label>
              <FaKey className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">confirmPassword</label>
              <FaUnlock className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            {/* Photo */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Photo</label>
              <FaCamera className="absolute left-3 top-10 text-blue-800" />
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Register Staff
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffRegister;
