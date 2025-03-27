import React, { useState } from "react";
import axios from "axios";
import "./Signup.css";

const SignUp = () => {
  const [filterType, setFilterType] = useState("CSO"); // "CSO" or "Staff"
  const [filterId, setFilterId] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    status: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [isFetched, setIsFetched] = useState(false);

  const handleFilterChange = (e) => {
    setFilterId(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        filterType === "CSO"
          ? `http://localhost:8000/csos/?id=${filterId}`
          : `http://localhost:8000/staff/?id=${filterId}`;

      const response = await axios.get(endpoint);

      if (response.data) {
        const { id, name, email, status, role } = response.data;

        setFormData({
          id: id || "",
          name: name || "",
          email: email || "",
          status: status || "",
          role: role || "",
          password: "",
          confirmPassword: "",
        });

        setIsFetched(true);
      } else {
        alert("No data found for the provided ID.");
        setIsFetched(false);
      }
    } catch (error) {
      alert("Error fetching data: " + (error.response?.data?.message || error.message));
      setIsFetched(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/userRegister", {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        status: formData.status,
        role: formData.role,
        password: formData.password,
      });

      if (response.status === 201) {
        alert("Account created successfully!");
      }
    } catch (error) {
      alert("An error occurred: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-title">Create Your Account</h2>

        {/* Filtering Form */}
        <form className="filter-form" onSubmit={handleFilterSubmit}>
          <div className="form-group">
            <label htmlFor="filterType">Filter Type</label>
            <select
              id="filterType"
              value={filterType}
              onChange={handleFilterTypeChange}
            >
              <option value="CSO">CSO</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filterId">Enter ID</label>
            <input
              type="text"
              id="filterId"
              value={filterId}
              onChange={handleFilterChange}
              placeholder="Enter ID to fetch details"
              required
            />
          </div>
          <button type="submit" className="filter-button">
            Fetch Details
          </button>
        </form>

        {/* Signup Form */}
        {isFetched && (
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="id">User ID</label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <input
                type="text"
                id="status"
                name="status"
                value={formData.status}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
