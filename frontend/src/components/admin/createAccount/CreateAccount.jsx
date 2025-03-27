import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const CreateAccount = () => {
  const [registrationId, setRegistrationId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const [error, setError] = useState();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
      withCredentials: true,
  });

  if (!meResponse.data || !meResponse.data.success) {
      navigate("/login");
      return;
  }

    // Validate if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        // "http://localhost:8000/user/createAccount",
        // const response = await axios.get("https://finance-office.onrender.com/user/createAccount",
        `${process.env.REACT_APP_API_URL}/api/users/createAccount`,


        {
          registrationId,
          password,
        },
        {
          withCredentials: true,
      }
      );

      if (response.data?.success) {
        // Clear input fields
        setRegistrationId("");
        setPassword("");
        setConfirmPassword(""); // Clear confirmation password

        // Set success message
        setMessage("Account created successfully!");

        // Navigate after 3 seconds
        setTimeout(() => {
          setMessage(""); // Clear message
          navigate("/admin/dashboard");
        }, 3000);
      } else {
        setMessage(response.data?.message || "Account creation failed.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating account.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="bg-white m-6 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-center text-2xl font-bold mb-6">
          Create User Account For Registered CSOs
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Registration ID:
            </label>
            <input
              type="text"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <button
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            type="submit"
            disabled={loading} // Disable button during loading
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center font-medium ${message.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
              }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;
