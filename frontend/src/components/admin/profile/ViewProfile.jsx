import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditProfile from "./EditProfile";
import {
  FaCalendarAlt,
  FaCircle,
  FaEdit,
  FaEnvelope,
  FaIdCard,
  FaKey,
  FaMobileAlt,
  FaTimes,
  FaUserAlt,
  FaUserTie,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import axios from "axios";
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewStaffProfile = () => {
  // const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError("");
      const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        withCredentials: true,
      });
  
      if (!meResponse.data.success) {
        throw new Error("Failed to get user details");
      }
      const { id } = meResponse.data;
      const response = await axios.get(`${API_BASE_URL}/api/staff/staff/${id}`, {
        withCredentials: true
      });
      
      if (!response.data) {
        throw new Error("Failed to get staff details");
      }
      
      setStaffData(response.data);
      toast.success("Staff profile loaded successfully");
    } catch (err) {
      console.error("Error fetching staff profile:", err);
      setError(err.message);
      toast.error(`Failed to load staff profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleProfileUpdate = async (updatedData) => {
    try {
      setStaffData(updatedData);
      toast.success("Profile updated successfully!");
      await fetchStaffData();
      closeModal();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={150} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load profile</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchStaffData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <FaInfoCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Data</h3>
          <p className="text-sm text-gray-500 mb-6">The requested staff profile could not be found.</p>
          <button
            onClick={fetchStaffData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-800 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8 flex flex-col md:flex-row items-start gap-8 relative">
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(staffData.status)}`}>
                <FaCircle className={`mr-1.5 h-2 w-2 ${staffData.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                {staffData.status}
              </span>
            </div>
            
            {/* Profile Image */}
            <div className="flex-shrink-0 relative group">
              {!imgError && staffData.photo ? (
                <img
                  src={`${API_BASE_URL}/staff/${staffData.photo}`}
                  alt="Staff profile"
                  onError={() => setImgError(true)}
                  className="w-32 h-32 rounded-xl object-cover border-4 border-white/80 shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-300 transition-colors duration-300">
                  <FaUserAlt className="w-16 h-16 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
                </div>
              )}
              <div className="absolute inset-0 rounded-xl border-4 border-transparent group-hover:border-white/30 transition-all duration-300" />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold mb-2 tracking-tight">
                {staffData.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium px-3 py-1 rounded-full">
                  {staffData.position || 'Staff Member'}
                </span>
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium px-3 py-1 rounded-full">
                  {staffData.role.toUpperCase()}
                </span>
              </div>
              
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <InfoBadge 
                  icon={<FaEnvelope className="text-blue-300" />} 
                  label="Email" 
                  value={staffData.email} 
                  lightMode
                />
                <InfoBadge 
                  icon={<FaMobileAlt className="text-green-300" />} 
                  label="Phone" 
                  value={staffData.phone} 
                  lightMode
                />
                <InfoBadge 
                  icon={<FaIdCard className="text-purple-300" />} 
                  label="Registration ID" 
                  value={staffData.registrationId} 
                  lightMode
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard 
                icon={<FaUserTie className="text-indigo-500" />}
                title="Position"
                value={staffData.position || 'Not specified'}
              />
              <DetailCard 
                icon={<FaKey className="text-purple-500" />}
                title="Role"
                value={staffData.role}
              />
              <DetailCard 
                icon={<FaCalendarAlt className="text-blue-500" />}
                title="Registration Date"
                value={new Date(staffData.created_at).toLocaleDateString()}
              />
              <DetailCard 
                icon={<FaCheckCircle className="text-green-500" />}
                title="Last Updated"
                value={new Date(staffData.updated_at).toLocaleDateString()}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
          <div className="p-6 flex justify-end bg-gradient-to-r from-gray-50 to-indigo-50">
            <button
              onClick={openModal}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
         {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </h2>
              <EditProfile
                profileData={staffData}
                onUpdate={handleProfileUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const InfoBadge = ({ icon, label, value, lightMode = false }) => (
  <div className="flex items-start">
    <div className={`flex-shrink-0 mt-1 ${lightMode ? 'text-opacity-90' : ''}`}>
      {icon}
    </div>
    <div className="ml-3">
      <p className={`text-sm font-medium ${lightMode ? 'text-white/80' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className={`text-sm font-semibold ${lightMode ? 'text-white' : 'text-gray-900'}`}>
        {value || 'N/A'}
      </p>
    </div>
  </div>
);

const DetailCard = ({ icon, title, value }) => (
  <div className="bg-gray-50 rounded-xl p-5 h-full hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3">
      <div className="flex-shrink-0 mr-3">
        {icon}
      </div>
      <h4 className="text-lg font-medium text-gray-900">{title}</h4>
    </div>
    <p className="text-gray-700 pl-8">{value || 'Not specified'}</p>
  </div>
);

export default ViewStaffProfile;