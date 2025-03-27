import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const LetterManagement = () => {
  const [letters, setLetters] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', type: 'Meeting', file: null });

  // Handle input field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('JWT token not found in localStorage');
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.id;
    if (!userId) {
      console.error('User ID not found in decoded token');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('type', form.type);
      formData.append('createdBy', userId); // Attach the decoded userId (foreign key)

      if (form.file) formData.append('file', form.file);

      const response = await axios.post('${process.env.REACT_APP_API_URL}/api/letter/letters', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Update state with the newly added letter
      setLetters([...letters, response.data.letter]);

      // Show success message using SweetAlert
      Swal.fire({
        title: 'Success!',
        text: 'Letter created successfully.',
        icon: 'success',
        confirmButtonText: 'Okay',
      });

      // Clear the form
      setForm({ title: '', content: '', type: 'Meeting', file: null });
    } catch (error) {
      console.error('Error creating letter:', error);

      // Show error message using SweetAlert
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    }
  };

  // Fetch letters when the component mounts


  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Letter Management</h2>

      {/* Form to create a letter */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Content"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Meeting">Meeting</option>
          <option value="Announcement">Announcement</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.png"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
        >
          Create Letter
        </button>
      </form>

      {/* List of existing letters */}
 
    </div>
  );
};

export default LetterManagement;
