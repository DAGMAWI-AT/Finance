import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkedAlt,
  FaHome,
  FaTypo3,
  FaFilePdf,
  FaFileWord,
  FaSave,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EditCSO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    csoName: "",
    repName: "",
    email: "",
    phone: "",
    sector: "",
    location: "",
    office: "",
    role: "cso",
    status: "active",
    tin_certificate: "",
    registration_certificate: "",
  });
  const [showCustomSector, setShowCustomSector] = useState(false);
  const [tinCertificateFile, setTinCertificateFile] = useState(null);
  const [registrationCertificateFile, setRegistrationCertificateFile] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const sectors = [
    "Education",
    "Health",
    "Environment",
    "Agriculture",
    "Human Rights",
    "Women Empowerment",
    "Youth Development",
    "Other",
  ];

  useEffect(() => {
    const fetchCSOData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/cso/${id}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.sector && !sectors.includes(response.data.sector)) {
          setShowCustomSector(true);
        }

        setFormData(response.data);
      } catch (err) {
        console.error("Error fetching CSO data:", err);
        if (err.response?.status === 401) {
          toast.error("Unauthorized access. Please login again.");
          navigate("/login");
        } else {
          toast.error("Failed to fetch CSO data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCSOData();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.csoName.trim()) newErrors.csoName = "CSO name is required";
    if (!formData.repName.trim())
      newErrors.repName = "Representative name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.sector.trim()) newErrors.sector = "Sector is required";
    if (showCustomSector && !formData.customSector?.trim())
      newErrors.customSector = "Custom sector is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.office.trim()) newErrors.office = "Office is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "sector") {
      setShowCustomSector(value === "Other");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e, setFileFunction) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, and PDF files are allowed");
        return;
      }
      setFileFunction(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("csoName", formData.csoName);
    formDataToSend.append("repName", formData.repName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("office", formData.office);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("status", formData.status);

    // Handle sector (use custom sector if "Other" is selected)
    const sectorValue = showCustomSector
      ? formData.customSector
      : formData.sector;
    formDataToSend.append("sector", sectorValue);

    // Append files if they exist
    if (tinCertificateFile)
      formDataToSend.append("tin_certificate", tinCertificateFile);
    if (registrationCertificateFile)
      formDataToSend.append(
        "registration_certificate",
        registrationCertificateFile
      );

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/cso/update/${id}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("CSO updated successfully!");
        setTimeout(() => navigate("/admin/cso_list"), 100);
      }
    } catch (err) {
      console.error("Error updating CSO:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to update CSO. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">
              Edit Civic Society Organization
            </h2>
            <p className="text-blue-100">Update the details below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CSO Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CSO Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUserAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <input
                    type="text"
                    name="csoName"
                    value={formData.csoName}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.csoName ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.csoName && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.csoName}
                  </p>
                )}
              </div>

              {/* Representative Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Representative <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUserAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <input
                    type="text"
                    name="repName"
                    value={formData.repName}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.repName ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.repName && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.repName}
                  </p>
                )}
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sector <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaTypo3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.sector ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select a sector</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.sector && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.sector}
                  </p>
                )}
              </div>

              {/* Custom Sector */}
              {showCustomSector && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Sector <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customSector"
                    value={formData.customSector || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.customSector ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.customSector && (
                    <p className="text-sm text-red-600 flex items-center">
                      <FaExclamationTriangle className="mr-1" />{" "}
                      {errors.customSector}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkedAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.location}
                  </p>
                )}
              </div>

              {/* Office */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Office <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <input
                    type="text"
                    name="office"
                    value={formData.office}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.office ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.office && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.office}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cso">CSO</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TIN Certificate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaFilePdf className="inline mr-2 text-red-500" />
                  TIN Certificate
                </label>
                {formData.tin_certificate && (
                  <a
                    href={`${API_BASE_URL}/${formData.tin_certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-2"
                  >
                    View Current File
                  </a>
                )}
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(e) =>
                        handleFileChange(e, setTinCertificateFile)
                      }
                      className="hidden"
                    />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {tinCertificateFile ? (
                          <span className="text-green-600 font-medium">
                            {tinCertificateFile.name}
                          </span>
                        ) : (
                          "Click to upload new file"
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Registration Certificate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaFileWord className="inline mr-2 text-blue-500" />
                  Registration Certificate
                </label>
                {formData.registration_certificate && (
                  <a
                    href={`${API_BASE_URL}/${formData.registration_certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-2"
                  >
                    View Current File
                  </a>
                )}
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(e) =>
                        handleFileChange(e, setRegistrationCertificateFile)
                      }
                      className="hidden"
                    />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {registrationCertificateFile ? (
                          <span className="text-green-600 font-medium">
                            {registrationCertificateFile.name}
                          </span>
                        ) : (
                          "Click to upload new file"
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/cso_list")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center min-w-32"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Update CSO
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCSO;
