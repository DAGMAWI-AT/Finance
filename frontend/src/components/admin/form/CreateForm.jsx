import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from "react-toastify";

const CreateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    form_name: '',
    expires_at: new Date(),
  });
  const [submitting, setSubmitting] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);


    try {
      // Verify admin session first
      const meResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
        credentials: 'include'
      });
      
      if (!meResponse.ok) {
        throw new Error('Admin access required');
      }

      // Submit form
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/form/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form_name: formData.form_name,
          expires_at: formData.expires_at.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create form');
      }

      toast.success('Form created successfully!');
      setFormData({ form_name: '', expires_at: new Date() });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/forms');
      }, 100);

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'An error occurred while creating the form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Form Name</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            value={formData.form_name}
            onChange={(e) => setFormData({ ...formData, form_name: e.target.value })}
            disabled={submitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Expiration Date</label>
          <DatePicker
            selected={formData.expires_at}
            onChange={(date) => setFormData({ ...formData, expires_at: date })}
            showTimeSelect
            dateFormat="Pp"
            minDate={new Date()}
            className="w-full p-2 border rounded"
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
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
              Creating...
            </>
          ) : (
            'Create Form'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateForm;