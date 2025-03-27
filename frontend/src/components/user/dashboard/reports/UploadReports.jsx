import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import axios from "axios";

const UploadReports = () => {
  const [formData, setFormData] = useState({
    report_name: "",
    description: "",
    category_id: "",
    report_file: null,
  });
  const [reportCategories, setReportCategories] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [hasSetData, setHasSetData] = useState(false); 
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch report categories and user's report history on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const meResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          credentials: "include",
        });
        if (meResponse.status === 401) {
          navigate("/user/login");
          return; // Stop execution after redirection
        }
        const meResult = await meResponse.json();
        if (!meResponse.ok) {
          throw new Error(`${meResponse.statusText}`, navigate("/user/login"));
              
          }

        const { id } = meResult;
        if (!id) {
          throw new Error("Invalid token: id not found.");
        }

        // Fetch report categories
        const categoriesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reportCategory/category?user_id=${id}`, // Pass user_id
          { credentials: "include" } // Include cookies if needed
        );
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResponse.ok) {
       
        setReportCategories(categoriesResult);
      }
        const reportsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/report/user/${id}`,
          {
            credentials: "include", // Include cookies in the request
          }
        );
        const reportsResult = await reportsResponse.json();
        if (reportsResponse.ok) {
        setUserReports(reportsResult.data || []);
      }
    }catch (error) {
            if (error.response?.status === 401) {
              navigate("/user/login");
            } else {
              Swal.fire("Error!", error.message, "error");
            }
          } finally {
            setLoading(false);
          }
    };

    fetchData();
  }, []);

  // Get the expire_date for a given category from reportCategories
  const getCategoryExpireDate = (categoryId) => {
    const category = reportCategories.find(
      (cat) => cat.id.toString() === categoryId.toString()
    );
    return category ? category.expire_date : null;
  };

  // Check if the user has already submitted a report for the selected category
  // with the same expire_date as defined in reportCategories.
  const isReportAlreadySubmitted = (categoryId) => {
    const categoryExpireDate = getCategoryExpireDate(categoryId);
    if (!categoryExpireDate) {
      return false;
    }
    return userReports.some(
      (report) =>
        report.category_id === categoryId &&
        report.expire_date === categoryExpireDate
    );
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "report_file") {
      setFormData({ ...formData, report_file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setHasSetData(true); // Enable the Update Report button when data is entered
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);

    const meResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
      credentials: "include", // Include cookies in the request
    });
    if (meResponse.status === 401) {
      navigate("/user/login");
      return; // Stop execution after redirection
    }
    const meResult = await meResponse.json();
    if (!meResponse.ok) {
      throw new Error(meResult.message, `${meResult.statusText}` || "Failed to fetch user details.");
      // throw new Error(`${meResult.statusText}`);

    }

    const { registrationId, id } = meResult;
    if (!registrationId) {
      throw new Error("Invalid token: id not found.");
    }

    // Check if a report for the selected category with the current expire_date already exists.
    if (isReportAlreadySubmitted(formData.category_id)) {
      setLoading(false); // Re-enable the button if a duplicate report is detected
      setIsSubmitting(false);

      await Swal.fire({
        icon: "error",
        title: "Duplicate Submission",
        text:
          "A report for the selected category with the current expiration date has already been submitted. Please edit the existing report or choose another category.",
        confirmButtonText: "OK",
      });
      navigate("/user/work_report");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("registration_id", registrationId);
    formDataObj.append("report_name", formData.report_name);
    formDataObj.append("description", formData.description);
    formDataObj.append("category_id", formData.category_id);
    formDataObj.append("user_id", id);

    if (formData.report_file) {
      formDataObj.append("report_file", formData.report_file);
    } else {
      setLoading(false);
      setIsSubmitting(false);

      console.error("No file selected");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/report/upload`, {
        method: "POST",
        body: formDataObj,
      });
      const result = await response.json();
      if (result.success) {
        // Show SweetAlert for success
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Report uploaded successfully!",
          showConfirmButton: false,
          timer: 1500,
        });

        // Optionally update local userReports state with the new report.
        // Assuming result.data contains the new report's expire_date.
        if (result.data && result.data.expire_date) {
          setUserReports([
            ...userReports,
            { category_id: formData.category_id, expire_date: result.data.expire_date },
          ]);
        }

        // Reset the form
        setFormData({
          report_name: "",
          description: "",
          category_id: "",
          report_file: null,
        });

        navigate("/user/work_report");
      } else {
        console.error("Upload failed:", result.message);
        throw new Error(result.message || `${result.statusText}`);

      }
    } catch (error) {
      console.error("Error submitting report:", error);
      // setError(error.message); 
    if (error.message.includes("401") || error.response?.status === 401) {
        navigate("/user/login");
        return;
      } 
      await Swal.fire({
        icon: "error",
        title: "error",
        text: error || "This report has already been submitted. Please update the previous report or wait until the submission period expires.",
        confirmButtonText: "OK",
      });
      navigate("/user/work_report");
      return;
    

    } finally {
      setLoading(false); // Re-enable the button once the request is done
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-screen bg-gray-100 p-2 font-serif">

      <div className="bg-white p-3 md:p-4 lg:p-10 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-gray-500 mb-10 text-center font-serif">
          Upload New Report
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="report_name" className="block text-gray-600 font-medium mb-2">
                Report Name
              </label>
              <input
                type="text"
                id="report_name"
                name="report_name"
                value={formData.report_name || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter report name"
                required
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-gray-700">
                Report Type
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ""}
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
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="report_file" className="block text-gray-600 font-medium mb-2">
                Upload File
              </label>
              <input
                type="file"
                id="report_file"
                name="report_file"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-600 font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter a brief description"
                rows="4"
                required
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-40 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasSetData || isSubmitting} // Disable the button if no data is entered or during submission
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-blue-300 mr-2"></span>
                UPLOADING...
              </>
            ) : (
              "Upload Report"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadReports;