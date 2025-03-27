import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaAd } from 'react-icons/fa';

const UploadCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
      withCredentials: true,
    });

    if (!meResponse.data || !meResponse.data.success) {
      navigate("/login");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reportCategory/upload`,
        {
          category_name: categoryName,
          expire_date: expireDate,
        },{
          credentials: "include", // Include cookies in the request
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Category Added Successfully',
          text: `Name: ${categoryName}\nExpire Date: ${expireDate}`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#4CAF50',
        }).then(() => {
          navigate('/admin/report_category');
        });
        setCategoryName('');
        setExpireDate('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to add category',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while adding the category.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
          <h1 className="text-2xl font-bold text-white text-center">Add Report Category</h1>
        </div>
        <form onSubmit={handleAddCategory} className="p-6">
          <div className="mb-5 relative">
            <label htmlFor="categoryName" className="block text-gray-700 font-medium mb-2">
              Report Category Name
            </label>
            <FaAd className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-800" />
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Yearly, Quarterly, Project Proposal"
              className="w-full pl-10 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="expireDate" className="block text-gray-700 font-medium mb-2">
              Expire Date
            </label>
            <input
              type="date"
              id="expireDate"
              value={expireDate}
              onChange={(e) => setExpireDate(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadCategory;
