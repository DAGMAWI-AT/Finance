import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import axios from "axios";

// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Redirect to login page if unauthorized
//       window.location.href = "/user/login";
//     }
//     return Promise.reject(error);
//   }
// );
const UpdateReports = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  // const [successMessage, setSuccessMessage] = useState("");
  const [defaultFileName, setDefaultFileName] = useState("");
  const [reportCategories, setReportCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [originalFormData, setOriginalFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track form changes
  useEffect(() => {
    const changesExist =
      formData.report_name !== originalFormData.report_name ||
      formData.description !== originalFormData.description ||
      formData.category_id !== originalFormData.category_id ||
      (formData.report_file && formData.report_file.name !== defaultFileName);

    setHasChanges(changesExist);
  }, [formData, originalFormData, defaultFileName]);

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/me`,
          {
            withCredentials: true, // Include credentials for session-based authentication
          }
        );

        if (!meResponse.data.success) {
          navigate("/user/login");
          return;
        }

        setLoggedInUserId(meResponse.data.id); // Set user ID from response
      } catch (err) {
        navigate("/user/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch report and categories data
  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUserId) return;
  
      try {
        setLoading(true);
        setError(null);
  
        // Fetch the report details
        const reportResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/report/byId/${id}`,
          { credentials: "include" }
        );
        const reportData = await reportResponse.json();
  
        if (!reportResponse.ok) {
          throw new Error(reportData.message || "Failed to fetch report");
        }
  
        // Check authorization
        if (reportData.user_id !== loggedInUserId) {
          throw new Error("You are not authorized to edit this report");
        }
  
        // Get the original category ID from the report
        const originalCategoryId = reportData.category_id;
  
        // Fetch user's own categories
        const categoriesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reportCategory/category?user_id=${loggedInUserId}`,
          { credentials: "include" }
        );
        let userCategories = await categoriesResponse.json();
  
        // Ensure userCategories is an array
        if (!Array.isArray(userCategories)) {
          userCategories = [];
        }
  
        // Check if any category has expired
        const isExpired = userCategories.some(
          (cat) => new Date(cat.expire_date) < new Date()
        );
  
        if (isExpired || userCategories.length === 0) {
          throw new Error("Your report category has expired or is invalid.");
        }
  
        // Fetch the original category details (even if not in user's categories)
        const originalCategoryResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reportCategory/${originalCategoryId}`,
          { credentials: "include" }
        );
        const originalCategory = originalCategoryResponse.ok
          ? await originalCategoryResponse.json()
          : null;
  
        // Combine categories: user's categories + original category (if different)
        const combinedCategories = [
          ...(originalCategory ? [originalCategory] : []),
          ...userCategories,
        ].filter(
          (cat, index, self) => index === self.findIndex((t) => t.id === cat.id)
        );
  
        // Set initial form data
        const initialFormData = {
          report_name: reportData.report_name,
          description: reportData.description,
          category_id: reportData.category_id,
        };
  
        setFormData(initialFormData);
        setOriginalFormData(initialFormData);
        setDefaultFileName(reportData.report_file);
        setReportCategories(combinedCategories);
      } catch (error) {
        setError(error.message);
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: error.message,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        navigate("/user/work_report");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, loggedInUserId, navigate]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, report_file: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate category expiration
      const categoryResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/reportCategory/${formData.category_id}`,
        { credentials: "include" }
      );

      if (!categoryResponse.ok) {
        throw new Error("Invalid category selected");
      }

      const categoryData = await categoryResponse.json();
      if (new Date(categoryData.expire_date) < new Date()) {
        throw new Error("Expired category cannot be used");
      }

      // Prepare and send form data
      const formDataToSend = new FormData();
      formDataToSend.append("report_name", formData.report_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.category_id);
      if (formData.report_file) {
        formDataToSend.append("report_file", formData.report_file);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/report/${id}`, {
        method: "PUT",
        body: formDataToSend,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Update originalFormData to reflect the new state
      setOriginalFormData({
        report_name: formData.report_name,
        description: formData.description,
        category_id: formData.category_id,
      });

      // Reset the file input
      setFormData((prev) => ({ ...prev, report_file: null }));
      setDefaultFileName(formData.report_file?.name || defaultFileName);

      // Show success message and redirect
      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Report updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/user/work_report");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-serif">
      <div className="bg-white p-3 md:p-4 lg:p-10 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-gray-500 mb-10 text-center">
          Update Report
        </h1>
        {/* {successMessage && (
          <div className="mb-4 text-green-700 bg-green-200 p-3 rounded-lg">
            {successMessage}
          </div>
        )} */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-600 font-medium">
                Report Name
              </label>
              <input
                type="text"
                name="report_name"
                value={formData.report_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium">
                Report Type
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              >
                <option value="" disabled>
                  Select Report Type
                </option>
                {reportCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                    {category.user_id !== loggedInUserId && " (Original)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-600 font-medium">PDF File</label>
              <input
                type="file"
                name="report_file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              {formData.report_file ? (
                <p className="text-gray-500 text-sm mt-1">
                  {formData.report_file.name}
                </p>
              ) : (
                defaultFileName && (
                  <p className="text-gray-500 text-sm mt-1">
                    Existing File: {defaultFileName}
                  </p>
                )
              )}
            </div>
            <div>
              <label className="block text-gray-600 font-medium">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                rows="4"
                required
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            className="w-40 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasChanges || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-blue-300 mr-2"></span>
                Updating...
              </>
            ) : (
              "Update Report"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateReports;