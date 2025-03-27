import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkedAlt,
  FaHome,
  FaTypo3,
  FaFilePdf,
  FaFileImage,
  FaSave,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CsoRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "cso",
    status: "active",
    sector: "",
  });
  const [showCustomSector, setShowCustomSector] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filePreviews, setFilePreviews] = useState({
    logo: null,
    tin_certificate: null,
    registration_certificate: null,
  });

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.csoName?.trim()) newErrors.csoName = "CSO name is required";
    if (!formData.repName?.trim())
      newErrors.repName = "Representative name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.sector?.trim()) newErrors.sector = "Sector is required";
    if (showCustomSector && !formData.customSector?.trim()) newErrors.customSector = "Custom sector is required";
    if (!formData.location?.trim()) newErrors.location = "Location is required";
    if (!formData.office?.trim()) newErrors.office = "Office is required";
    if (!formData.logo) newErrors.logo = "Logo is required";
    if (!formData.tin_certificate)
      newErrors.tin_certificate = "tin is required";
    if (!formData.registration_certificate)
      newErrors.registration_certificate =
        "registration certificate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // if (name === "sector") {
    //   setShowCustomSector(value === "Other");
    // }
    if (name === "sector" && value === "Other") {
      setShowCustomSector(true); // Show custom sector input when "Other" is selected
    } else if (name === "sector") {
      setShowCustomSector(false); // Hide custom sector input for other options
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      // Validate file types
      if (name === "logo") {
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
          toast.error("Only JPEG, PNG, or GIF images are allowed for logo");
          return;
        }
      } else {
        const validTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!validTypes.includes(file.type)) {
          toast.error("Only JPEG, PNG, or PDF files are allowed");
          return;
        }
      }

      setFormData((prev) => ({ ...prev, [name]: file }));

      // Create preview for images
      if (file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreviews((prev) => ({ ...prev, [name]: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  const removeFile = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setFilePreviews((prev) => ({ ...prev, [fieldName]: null }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("csoName", formData.csoName);
    formDataObj.append("repName", formData.repName);
    formDataObj.append(
      "sector",
      showCustomSector ? formData.customSector : formData.sector
    ); // Use custom sector if "Other" is selected
    formDataObj.append("email", formData.email);
    formDataObj.append("phone", formData.phone);
    formDataObj.append("location", formData.location);
    formDataObj.append("office", formData.office);
    formDataObj.append("status", formData.status);
    formDataObj.append("logo", formData.logo);
    formDataObj.append("tin_certificate", formData.tin_certificate);
    formDataObj.append(
      "registration_certificate",
      formData.registration_certificate
    );
    formDataObj.append("role", formData.role); // Use custom sector if "Other" is selected

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cso/register`,
        formDataObj,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("CSO registered successfully!");
        setTimeout(() => navigate("/admin/cso_list"), 100);
      }
    } catch (err) {
      console.error("Error registering CSO:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to register CSO. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">
              Register New Civic Society Organization
            </h2>
            <p className="text-blue-100">
              Fill in the details below to register a new CSO
            </p>
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
                    value={formData.csoName || ""}
                    onChange={handleChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.csoName ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    value={formData.repName || ""}
                    onChange={handleChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.repName ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.repName && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.repName}
                  </p>
                )}
              </div>

              {/* Sector */}
              <div className="relative">
                <label className="block text-gray-600 font-medium mb-2">
                  Sector
                </label>
                <FaTypo3 className="absolute left-3 top-10 text-blue-800" />
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Sector</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {showCustomSector && (
                <div className="relative">
                  <label className="block text-gray-600 font-medium mb-2">
                    Custom Sector
                  </label>
                  <input
                    type="text"
                    name="customSector"
                    value={formData.customSector}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
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
                    value={formData.email || ""}
                    onChange={handleChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    value={formData.location || ""}
                    onChange={handleChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    value={formData.office || ""}
                    onChange={handleChange}
                    className={`pl-10 w-full px-3 py-2 border ${
                      errors.office ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.office && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.office}
                  </p>
                )}
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Logo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Logo <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                  {filePreviews.logo ? (
                    <div className="relative w-full">
                      <img
                        src={filePreviews.logo}
                        alt="Logo preview"
                        className="w-full h-32 object-contain mb-2 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile("logo")}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="cursor-pointer text-center">
                        <input
                          type="file"
                          name="logo"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <FaFileImage className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload logo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, or GIF (Max 5MB)
                          </p>
                        </div>
                      </label>
                    </>
                  )}
                </div>
                {errors.logo && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.logo}
                  </p>
                )}
              </div>

              {/* TIN Certificate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  TIN Certificate <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                  {filePreviews.tin_certificate ? (
                    <div className="relative w-full">
                      {filePreviews.tin_certificate.includes("data:image") ? (
                        <img
                          src={filePreviews.tin_certificate}
                          alt="TIN certificate preview"
                          className="w-full h-32 object-contain mb-2 rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center p-4">
                          <FaFilePdf className="w-8 h-8 text-red-500 mb-2" />
                          <p className="text-sm text-gray-600 truncate w-full text-center">
                            {formData.tin_certificate.name}
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile("tin_certificate")}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="cursor-pointer text-center">
                        <input
                          type="file"
                          name="tin_certificate"
                          accept="image/*, application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <FaFilePdf className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            {formData.tin_certificate instanceof File ? (
                              <span className="text-green-600 font-medium">
                                {formData.tin_certificate.name}
                              </span>
                            ) : (
                              "Click to upload TIN certificate"
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, or PNG (Max 5MB)
                          </p>
                        </div>
                      </label>
                    </>
                  )}
                </div>
                {errors.tin_certificate && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.tin_certificate}
                  </p>
                )}
              </div>

              {/* Registration Certificate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Registration Certificate{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                  {filePreviews.registration_certificate ? (
                    <div className="relative w-full">
                      {filePreviews.registration_certificate.includes(
                        "data:image"
                      ) ? (
                        <img
                          src={filePreviews.registration_certificate}
                          alt="Registration certificate preview"
                          className="w-full h-32 object-contain mb-2 rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center p-4">
                          <FaFilePdf className="w-8 h-8 text-red-500 mb-2" />
                          <p className="text-sm text-gray-600 truncate w-full text-center">
                            {formData.registration_certificate.name}
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile("registration_certificate")}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="cursor-pointer text-center">
                        <input
                          type="file"
                          name="registration_certificate"
                          accept="image/*, application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <FaFilePdf className="w-8 h-8 text-gray-400 mb-2" />
                          {formData.registration_certificate instanceof File ? (
                            <span className="text-green-600 font-medium">
                              {formData.registration_certificate.name}
                            </span>
                          ) : (
                            "Click to upload registration certificate"
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, or PNG (Max 5MB)
                          </p>
                        </div>
                      </label>
                    </>
                  )}
                </div>
                {errors.registration_certificate && (
                  <p className="text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" /> {errors.registration_certificate}
                  </p>
                )}
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
                    Registering...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Register CSO
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

export default CsoRegister;
