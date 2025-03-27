import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditUserProfile from "./EditUserProfile";
import {
  FaCalendarAlt,
  FaCircle,
  FaEdit,
  FaEnvelope,
  FaFileAlt,
  FaFilePdf,
  FaIdCard,
  FaKey,
  FaMobileAlt,
  FaTimes,
  FaUserAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaInfoCircle,
  FaDownload
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewUserProfile = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviews, setFilePreviews] = useState({
    tin_certificate: null,
    registration_certificate: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const meResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
        withCredentials: true,
      });
      if (!meResponse.data.success) {
        throw new Error("Failed to get user details");
      }
      const { userId } = meResponse.data;
      const response = await axios.get(`${API_BASE_URL}/api/cso/${userId}`, {
        withCredentials: true
      });
      
      const data = response.data;
      setProfileData(data);
      
      // Set file previews
      if (data.tin_certificate) {
        setFilePreviews(prev => ({
          ...prev,
          tin_certificate: `${API_BASE_URL}/${data.tin_certificate}`
        }));
      }
      if (data.registration_certificate) {
        setFilePreviews(prev => ({
          ...prev,
          registration_certificate: `${API_BASE_URL}/${data.registration_certificate}`
        }));
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleProfileUpdate = async (updatedData) => {
    setProfileData(updatedData);
    closeModal();
    await fetchProfileData();
  };

  const handleFileSelection = (event) => {
    setSelectedFile(event.target.value);
  };

  const renderFilePreview = (fileUrl) => {
    if (!fileUrl) return null;
    
    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-96 rounded-lg shadow-md"
          title="Document Viewer"
        />
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return (
        <img
          src={fileUrl}
          alt="Document Preview"
          className="w-full h-auto rounded-lg shadow-md object-contain"
          onError={() => setSelectedFile(null)}
        />
      );
    }
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-700">
          Unsupported file type. Please download the file to view it.
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-4">
        Error: {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center text-gray-500 mt-4">
        No profile data found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              {!imgError && profileData.logo ? (
                <img
                  src={`${API_BASE_URL}/${profileData.logo}`}
                  alt="Organization logo"
                  onError={() => setImgError(true)}
                  className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <FaUserAlt className="w-16 h-16 text-indigo-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileData.csoName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {profileData.sector}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profileData.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {profileData.role.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <InfoBadge 
                  icon={<FaEnvelope className="text-indigo-500" />} 
                  label="Email" 
                  value={profileData.email} 
                />
                <InfoBadge 
                  icon={<FaMobileAlt className="text-green-500" />} 
                  label="Phone" 
                  value={profileData.phone} 
                />
                <InfoBadge 
                  icon={<FaMapMarkerAlt className="text-red-500" />} 
                  label="Location" 
                  value={profileData.location} 
                />
                <InfoBadge 
                  icon={<FaIdCard className="text-purple-500" />} 
                  label="Registration" 
                  value={profileData.registrationId} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Profile Navigation</h2>
              </div>
              <nav className="p-4">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center ${
                    activeTab === "overview" 
                      ? "bg-indigo-50 text-indigo-700 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaInfoCircle className="mr-3" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center ${
                    activeTab === "documents" 
                      ? "bg-indigo-50 text-indigo-700 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaFileAlt className="mr-3" />
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                    activeTab === "timeline" 
                      ? "bg-indigo-50 text-indigo-700 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaCalendarAlt className="mr-3" />
                  Timeline
                </button>
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
              </div>
              <div className="p-6">
                <StatItem 
                  label="Registration Date" 
                  value={new Date(profileData.date).toLocaleDateString()} 
                  icon={<FaCalendarAlt className="text-blue-500" />}
                />
                <StatItem 
                  label="Last Updated" 
                  value={new Date(profileData.updated_at).toLocaleDateString()} 
                  icon={<FaCircle className="text-green-500 text-xs" />}
                />
                <StatItem 
                  label="User Role" 
                  value={profileData.role} 
                  icon={<FaKey className="text-purple-500" />}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            {activeTab === "overview" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Organization Overview</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <DetailCard 
                      icon={<FaUserAlt className="text-indigo-500" />}
                      title="Representative"
                      value={profileData.repName}
                    />
                    <DetailCard 
                      icon={<FaBuilding className="text-blue-500" />}
                      title="Office"
                      value={profileData.office}
                    />
                    <DetailCard 
                      icon={<FaIdCard className="text-purple-500" />}
                      title="Registration ID"
                      value={profileData.registrationId || "N/A"}
                    />
                    <DetailCard 
                      icon={<FaMapMarkerAlt className="text-red-500" />}
                      title="Location"
                      value={profileData.location}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                    <p className="text-gray-700">
                      {profileData.additionalInfo || "No additional information provided."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Organization Documents</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* TIN Certificate Card */}
                    <DocumentCard 
                      title="Tax Identification Certificate"
                      fileUrl={filePreviews.tin_certificate}
                      icon={<FaFilePdf className="text-red-500" />}
                    />
                    
                    {/* Registration Certificate Card */}
                    <DocumentCard 
                      title="Registration Certificate"
                      fileUrl={filePreviews.registration_certificate}
                      icon={<FaFilePdf className="text-red-500" />}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Document to Preview
                    </label>
                    <div className="relative">
                      <select
                        onChange={handleFileSelection}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedFile || ""}
                      >
                        <option value="">Choose a document...</option>
                        {filePreviews.tin_certificate && (
                          <option value={filePreviews.tin_certificate}>
                            Tax Identification Certificate
                          </option>
                        )}
                        {filePreviews.registration_certificate && (
                          <option value={filePreviews.registration_certificate}>
                            Registration Certificate
                          </option>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <FaCircle className="text-xs" />
                      </div>
                    </div>
                  </div>

                  {selectedFile ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Document Preview
                        </span>
                        <a
                          href={selectedFile}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          <FaDownload className="mr-2" />
                          Download
                          <FiExternalLink className="ml-1" />
                        </a>
                      </div>
                      <div className="p-4">
                        {renderFilePreview(selectedFile)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No document selected
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose a document from the dropdown above to preview it here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Organization Timeline</h2>
                </div>
                <div className="p-6">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      <TimelineItem 
                        date={new Date(profileData.date).toLocaleDateString()}
                        title="Registered"
                        description="Organization was officially registered"
                        icon={<div className="bg-green-500 rounded-full p-2 text-white">
                          <FaCalendarAlt />
                        </div>}
                        last={false}
                      />
                      <TimelineItem 
                        date={new Date(profileData.updated_at).toLocaleDateString()}
                        title="Last Updated"
                        description="Profile information was last updated"
                        icon={<div className="bg-blue-500 rounded-full p-2 text-white">
                          <FaCircle />
                        </div>}
                        last={true}
                      />
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
          <div className="p-6 flex justify-end">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes />
            </button>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <FaEdit className="text-indigo-600 mr-2" />
                Edit Profile
              </h2>
              <EditUserProfile
                profileData={profileData}
                onUpdate={handleProfileUpdate}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const InfoBadge = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 mt-1">
      {icon}
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
);

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
    <div className="flex-shrink-0 mr-3">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const DetailCard = ({ icon, title, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 h-full">
    <div className="flex items-center mb-2">
      <div className="flex-shrink-0 mr-3">
        {icon}
      </div>
      <h4 className="text-lg font-medium text-gray-900">{title}</h4>
    </div>
    <p className="text-gray-700">{value || 'Not specified'}</p>
  </div>
);

const TimelineItem = ({ date, title, description, icon, last }) => (
  <li>
    <div className="relative pb-8">
      {!last && (
        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
      )}
      <div className="relative flex space-x-3">
        <div>
          {icon}
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-900 font-medium">
              {title}
            </p>
            <p className="text-sm text-gray-500">
              {description}
            </p>
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time dateTime={date}>{date}</time>
          </div>
        </div>
      </div>
    </div>
  </li>
);

const DocumentCard = ({ title, fileUrl, icon }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow h-full">
    <div className="bg-gray-50 p-4 border-b flex items-center">
      {icon}
      <h4 className="font-medium ml-2">{title}</h4>
    </div>
    <div className="p-4">
      {fileUrl ? (
        <div className="flex flex-col items-center">
          <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
            {fileUrl.endsWith('.pdf') ? (
              <FaFilePdf className="text-red-500 text-4xl" />
            ) : (
              <img 
                src={fileUrl} 
                alt="Document thumbnail" 
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full Document
          </a>
        </div>
      ) : (
        <div className="text-gray-500 py-8 text-center">
          No document uploaded
        </div>
      )}
    </div>
  </div>
);

export default ViewUserProfile;