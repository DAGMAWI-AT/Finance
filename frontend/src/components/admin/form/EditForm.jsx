import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";

const EditForm = () => {
  const { id } = useParams(); // Get the form ID from the URL
  const navigate = useNavigate();
  const [form, setForm] = useState({
    form_name: "",
    expires_at: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  

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
        setForm({ ...data, expires_at: new Date(data.expires_at) }); // Convert expires_at to Date object
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      // Verify admin session
      const meResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
        credentials: 'include'
      });

      if (!meResponse.ok) {
        toast.error("Admin access required");
        return;
      }

      // Update form
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/form/edit/${id}`, {
        method: "PUT",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...form,
          expires_at: form.expires_at.toISOString(), // Convert Date to ISO string
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update form");
      }
      // navigate("/admin/forms")
      toast.success('Form updated successfully!')
      setTimeout(() => {
        navigate('/admin/forms');
      }, 100);

      // navigate("/admin/forms"); // Redirect to the forms list after successful update
    } catch (error) {
      toast.error(error.message);

    }finally {
      setSubmitting(false);
    }
  };

  // if (loading) return <div className="text-center p-4">Loading form...</div>;
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-transparent">
          <BarLoader color="#4F46E5" size={50} />
        </div>
      );
    }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
  
        <h1 className="text-2xl font-bold">Edit Form</h1>
        <button
          onClick={() => navigate("/admin/forms")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Forms
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Form Name
            </label>
            <input
              type="text"
              name="form_name"
              value={form.form_name}
              onChange={handleInputChange}
              className="p-2 border rounded-md"
              style={{ width: `${Math.max(form.form_name.length * 10, 230)}px` }} // Dynamic width
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
            Expiration Date
            </label>
            <DatePicker
              selected={form.expires_at}
              onChange={(date) => setForm({ ...form, expires_at: date })}
              showTimeSelect
              dateFormat="Pp"
              minDate={new Date()}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mt-6">
            {/* <button
              type="submit"
              className="w-40 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Update Form
            </button> */}
            <button
          type="submit"
          className="w-40 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </>
          ) : (
            'Update Form'
          )}
        </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditForm;