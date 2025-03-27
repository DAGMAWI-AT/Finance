import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkedAlt,
  FaHome,
  FaFilePdf,
  FaFileWord,
  FaBirthdayCake,
  FaUniversity,
  FaVenusMars
} from 'react-icons/fa';

const EditBeneficiary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    kebele: '',
    location: '',
    wereda: '',
    age: '',
    gender: '',
    school: '',
    kfleketema: '',
    houseNo: '',
    idFile: null,
    photo: null,
  });

 // Separate state for newly selected files
 const [newFiles, setNewFiles] = useState({
  idFile: null,
  photo: null,
});


// Fetch beneficiary data by ID on mount
useEffect(() => {
  const fetchBeneficiary = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/beneficiaries/${id}`);
      const data = await response.json();
      // Set formData with fetched data (including existing file names)
      setFormData(data.data);
    } catch (error) {
      console.error('Error fetching beneficiary:', error);
      setError('Failed to fetch beneficiary data');
    }
  };
  fetchBeneficiary();
}, [id]);

// Handle changes for text and file inputs
const handleChange = (e) => {
  const { name, value, type, files } = e.target;
  if (type === 'file') {
    // For file inputs, update the newFiles state
    setNewFiles((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMessage('');

  const data = new FormData();
  
  // Append text fields from formData
  for (const key in formData) {
    if (key !== 'idFile' && key !== 'photo') {
      data.append(key, formData[key]);
    }
  }

  // Append new files only if selected; otherwise, the backend retains existing filenames
  if (newFiles.idFile) {
    data.append('idFile', newFiles.idFile);
  }
  if (newFiles.photo) {
    data.append('photo', newFiles.photo);
  }
  
  // Debug: Log FormData entries (note: File objects will appear as [object File])
  for (let [key, value] of data.entries()) {
    // console.log(key, value);
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/beneficiaries/${id}`, {
      method: 'PUT',
      body: data,
    });
    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Beneficiary updated successfully.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/admin/beneficiary_list');
      });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update beneficiary');
    }
  } catch (err) {
    console.error('Error updating beneficiary:', err);
    setError(err.message);
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: err.message || 'Failed to update beneficiary. Please try again.',
      confirmButtonText: 'OK',
    });
  }
};


  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          Edit Beneficiary
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Full Name</label>
              <FaUserAlt className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Phone</label>
              <FaPhoneAlt className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
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
                placeholder="Enter email"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                // required
              />
            </div>

            {/* Kebele */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Kebele</label>
              <FaHome className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="kebele"
                value={formData.kebele}
                onChange={handleChange}
                placeholder="Enter kebele"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Location</label>
              <FaMapMarkedAlt className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Wereda */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Wereda</label>
              <FaMapMarkedAlt className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="wereda"
                value={formData.wereda}
                onChange={handleChange}
                placeholder="Enter wereda"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Age */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Age</label>
              <FaBirthdayCake className="absolute left-3 top-10 text-blue-800" />
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                min={0}
                required
              />
            </div>

            {/* Gender */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Gender</label>
              <FaVenusMars className="absolute left-3 top-10 text-blue-800" />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* School (Optional) */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">School (Optional)</label>
              <FaUniversity className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="Enter school (optional)"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Kfleketema */}
            <div className="relative">
              <label className="block text-gray-600 font-medium mb-2">Kfleketema</label>
              <FaMapMarkedAlt className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="kfleketema"
                value={formData.kfleketema}
                onChange={handleChange}
                placeholder="Enter kfleketema"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* House Number */}
            <div className="relative md:col-span-2">
              <label className="block text-gray-600 font-medium mb-2">House Number</label>
              <FaHome className="absolute left-3 top-10 text-blue-800" />
              <input
                type="text"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleChange}
                placeholder="Enter house number"
                className="pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID File */}
            <div className="col-span-1">
              <label className="block text-gray-600 font-medium mb-2">
                <FaFilePdf className="inline mr-2 text-red-500" />
                ID File
              </label>
              {formData.idFile && typeof formData.idFile === 'string' && (
                <a
                  href={`${process.env.REACT_APP_API_URL}/idFiles/${formData.idFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline block mb-2"
                >
                  View Current File
                </a>
              )}
              <input
                type="file"
                name="idFile"
                accept=".pdf,.doc,.docx, image/*"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Photo */}
            <div className="col-span-1">
              <label className="block text-gray-600 font-medium mb-2">
                <FaFileWord className="inline mr-2 text-blue-500" />
                Photo
              </label>
              {formData.photo && typeof formData.photo === 'string' && (
                <a
                  href={`${process.env.REACT_APP_API_URL}/photoFiles/${formData.photo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline block mb-2"
                >
                  View Current Photo
                </a>
              )}
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Update Beneficiary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBeneficiary;
