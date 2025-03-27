import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";

const ViewForm = () => {
  const { id } = useParams(); // Get the form ID from the URL
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch form data from the backend API
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/form/${id}`, {
          credentials: "include", // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error("Failed to fetch form");
        }

        const data = await response.json();
        setForm(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  // Handle back button
  const handleBack = () => {
    navigate("/admin/forms");
  };

//   if (loading) return <div className="text-center p-4">Loading form...</div>;
if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-500">Form Details</h1>
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Forms
        </button>
      </div>

      {form && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Information Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Form Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Form Name
                </label>
                <p className="mt-1 p-2 bg-gray-100 rounded-md">{form.form_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expires At
                </label>
                <p className="mt-1 p-2 bg-gray-100 rounded-md">
                  {new Date(form.expires_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Timestamps</h2>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created By
                </label>
                <p className="mt-1 p-2 bg-gray-100 rounded-md">
                    {form.createdBy}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created At
                </label>
                <p className="mt-1 p-2 bg-gray-100 rounded-md">
                  {new Date(form.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Latest Update
                </label>
                <p className="mt-1 p-2 bg-gray-100 rounded-md">
                  {new Date(form.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Fields Card
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="mt-1 p-2 bg-gray-100 rounded-md">
                  {form.description || "No description available"}
                </p>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default ViewForm;