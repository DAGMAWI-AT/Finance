import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const FormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/form`, {
          withCredentials: true,
        });

        const processedForms = response.data.map((form) => ({
          ...form,
          isExpired: new Date(form.expires_at) < new Date(),
          canEdit: new Date(form.expires_at) > new Date(), // Derive is_editable from expires_at
          user_submission: form.user_submission || null, // Ensure user_submission exists
        }));

        setForms(processedForms);
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to load forms");
        if (error.response?.status === 401) navigate("/user/login");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [navigate]);

  const handleFormAction = (form) => {
    const isSubmissionClosed =
      form.isExpired &&
      (form.user_submission?.update_permission === "close" ||
        form.user_submission?.update_permission === null ||
        Object.keys(form.user_submission?.update_permission || {}).length === 0);

    if (isSubmissionClosed) {
      navigate(`/user/form/view/${form.id}`);
    } else if (form.user_submission) {
      navigate(`/user/form/${form.id}`);
    } else {
      navigate(`/user/form/${form.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-600">Available Forms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((form) => {
          const isSubmissionClosed =
            form.isExpired &&
            (form.user_submission?.update_permission === "close" ||
              form.user_submission?.update_permission === null ||
              Object.keys(form.user_submission?.update_permission || {}).length === 0);

          const hasSubmission = !!form.user_submission;

          return (
            <div key={form.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-700">{form.form_name}</h3>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    form.isExpired
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {form.isExpired ? "Closed" : "Active"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Deadline: {new Date(form.expires_at).toLocaleString()}
              </p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleFormAction(form)}
                  className={`px-4 py-2 rounded ${
                    isSubmissionClosed
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : hasSubmission
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                  disabled={isSubmissionClosed}
                >
                  {isSubmissionClosed
                    ? "View Submission"
                    : hasSubmission
                    ? "Edit Submission"
                    : "Start Submission"}
                </button>
                {form.user_submission && (
                  <span className="text-sm text-gray-500">
                    Last updated:{" "}
                    {new Date(form.user_submission.submitted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormList;