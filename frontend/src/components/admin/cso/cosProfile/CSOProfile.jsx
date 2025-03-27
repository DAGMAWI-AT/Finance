import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { 
  FaFileAlt, 
  FaDownload, 
  FaChevronDown, 
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaCalendarAlt,
  FaSync,
  FaInfoCircle,
  FaMobileAlt
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

const CSOProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cso/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setProfileData(data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleFileSelection = (event) => {
    setSelectedFile(event.target.value);
  };

  const renderFile = (fileUrl) => {
    if (!fileUrl) return null;

    const fileType = fileUrl.split(".").pop().toLowerCase();

    if (fileType === "pdf") {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-96 rounded-lg shadow-md"
          title="Document Viewer"
        />
      );
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
      return (
        <img
          src={fileUrl}
          alt="Document"
          className="w-full h-auto rounded-lg shadow-md object-contain"
          onError={() => setSelectedFile(null)}
        />
      );
    } else {
      return (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-700">
            Unsupported file type. Please download the file to view it.
          </p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                  src={`${process.env.REACT_APP_API_URL}/${profileData.logo}`}
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
              <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                {profileData.sector}
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
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center ${activeTab === "overview" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <FaInfoCircle className="mr-3" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center ${activeTab === "documents" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <FaFileAlt className="mr-3" />
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeTab === "timeline" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
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
                  icon={<FaSync className="text-green-500" />}
                />
                <StatItem 
                  label="Status" 
                  value={profileData.status} 
                  icon={<div className={`w-3 h-3 rounded-full ${profileData.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>}
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
                      title="Role"
                      value={profileData.role}
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
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Document
                    </label>
                    <div className="relative">
                      <select
                        onChange={handleFileSelection}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Choose a document...</option>
                        <option value={`${process.env.REACT_APP_API_URL}/${profileData.tin_certificate}`}>
                          Tax Identification Certificate
                        </option>
                        <option value={`${process.env.REACT_APP_API_URL}/${profileData.registration_certificate}`}>
                          Registration Certificate
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <FaChevronDown />
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
                        {renderFile(selectedFile)}
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
                          <FaSync />
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
      </div>
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
  <div className="bg-gray-50 rounded-lg p-4">
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

export default CSOProfile;