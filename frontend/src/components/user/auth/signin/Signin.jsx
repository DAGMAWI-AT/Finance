import React, { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api"
const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    registrationId: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Login request
      await api.post('/api/users/login', formData);
      
      // 2. Fetch user data
      const { data } = await api.get('/api/users/me');
      
      // 3. Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Registration ID"
          value={formData.registrationId}
          onChange={(e) => setFormData({...formData, registrationId: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {message && <div className="error-message">{message}</div>}
      </form>
    </div>
  );
};


export default Signin;
