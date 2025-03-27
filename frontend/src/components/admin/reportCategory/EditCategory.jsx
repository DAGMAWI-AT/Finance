import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader, PulseLoader } from 'react-spinners';
import Swal from 'sweetalert2';

const EditCategory = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
          withCredentials: true,
        });

        if (!meResponse.data || !meResponse.data.success) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reportCategory/${id}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch category details.');

        const data = await response.json();
        setCategory(data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch category details. Please try again later.',
          confirmButtonColor: '#d33',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, navigate]);

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
        withCredentials: true,
      });

      if (!meResponse.data || !meResponse.data.success) {
        navigate("/login");
        return;
      }

      const formattedExpireDate = formatDate(category.expire_date);
      const payload = {
        category_name: category.category_name,
        expire_date: formattedExpireDate,
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reportCategory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      Swal.fire('Success!', 'Category updated successfully', 'success')
        .then(() => navigate('/admin/report_category'));
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to update category', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-red-500">Category not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
          <h1 className="text-2xl font-bold text-white text-center">Edit Report Category</h1>
        </div>
        <form onSubmit={handleEditCategory} className="p-6">
          <div className="mb-5">
            <label htmlFor="categoryName" className="block text-gray-700 font-medium mb-2">
              Report Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              value={category.category_name || ''}
              onChange={(e) =>
                setCategory((prev) => ({ ...prev, category_name: e.target.value }))
              }
              placeholder="e.g., Yearly, Quarterly, Project Proposal"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              value={formatDate(category.expire_date)}
              onChange={(e) =>
                setCategory((prev) => ({ ...prev, expire_date: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded flex justify-center items-center gap-2 hover:bg-green-600 transition-colors"
            disabled={updating}
          >
            {updating ? <PulseLoader color="#fff" size={8} /> : 'Update Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
