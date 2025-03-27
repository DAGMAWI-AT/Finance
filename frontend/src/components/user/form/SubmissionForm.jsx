import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";

const SubmissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submission, setSubmission] = useState({
    report_name: "",
    description: "",
    application_file: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setError("Invalid form ID");
          return;
        }

        // Verify user session
        const meResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          credentials: "include",
        });

        if (!meResponse.ok) {
          navigate("/user/login");
          return;
        }

        // Get form data
        const formResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/form/${id}`,
          {
            credentials: "include",
          }
        );

        if (!formResponse.ok)
          throw new Error(`HTTP error! status: ${formResponse.status}: Form not found`);

        const formData = await formResponse.json();

        // Parse form_data if needed
        if (formData.form_data && typeof formData.form_data === "string") {
          formData.form_data = JSON.parse(formData.form_data);
        }

        // Ensure fields array exists
        if (!formData.form_data?.fields) {
          formData.form_data = { fields: [] };
        }

        // Fetch user's submission for this form
        const submissionResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/form/form/application?form_id=${id}`,
          {
            credentials: "include",
          }
        );

        if (!submissionResponse.ok)
          throw new Error(`HTTP error! status: ${submissionResponse.status}`);

        const submissionData = await submissionResponse.json();

        // If the user has already submitted, populate the form fields
        if (submissionData.length > 0) {
          setSubmission({
            report_name: submissionData[0].report_name,
            description: submissionData[0].description,
            application_file: submissionData[0].application_file,
          });
        }

        setForm(formData);
      } catch (error) {
        setError(error.message || "Failed to load form");
        if (error.response?.status === 401) navigate("/user/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!id) {
        throw new Error("Form ID is missing");
      }

      const formData = new FormData();
      formData.append("form_id", id);
      formData.append("report_name", submission.report_name);
      formData.append("description", submission.description);

      // Append the file only if a new file is selected
      if (submission.application_file instanceof File) {
        formData.append("application_file", submission.application_file);
      } else if (submission.application_file) {
        // Retain the existing file if no new file is uploaded
        formData.append("application_file", submission.application_file);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/form/application`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }

      navigate("/user/form");
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "Submission failed. Please try again.");
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-400">
        {error}
        <button
          onClick={() => navigate("/user/form")}
          className="block mt-4 text-blue-600 hover:underline"
        >
          Return to Forms List
        </button>
      </div>
    );
  }

  const isEditable = form?.can_edit && new Date(form.expires_at) > new Date();
  const hasSubmission = !!form?.user_submission;
  const isExpired = new Date(form?.expires_at) < new Date();
  const isSubmissionClosed =
    isExpired &&
    (form?.user_submission?.update_permission === "close" ||
      form?.user_submission?.update_permission === null ||
      Object.keys(form?.user_submission?.update_permission || {}).length === 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{form?.form_name}</h2>
        {isExpired && isSubmissionClosed && (
          <button
            onClick={() => navigate("/user/form")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        )}
      </div>

      {/* Hide the form if update_permission is "close" and it's expired */}
      {isSubmissionClosed ? (
        <div className="space-y-4">
          <div className="bg-yellow-100 p-4 rounded-lg">
            This form is no longer accepting submissions.
            {hasSubmission && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Submission</h3>
                {/* Display submission data */}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Report Name
            </label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              value={submission.report_name}
              onChange={(e) =>
                setSubmission({ ...submission, report_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={submission.description}
              onChange={(e) =>
                setSubmission({ ...submission, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Application File
            </label>
            {submission.application_file &&
            typeof submission.application_file === "string" ? (
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Uploaded file: {submission.application_file}
                </span>
                <input
                  type="file"
                  className="w-full p-2 border rounded-md mt-2"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSubmission({
                        ...submission,
                        application_file: e.target.files[0],
                      });
                    }
                  }}
                />
              </div>
            ) : (
              <input
                type="file"
                required
                className="w-full p-2 border rounded-md"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSubmission({
                      ...submission,
                      application_file: e.target.files[0],
                    });
                  }
                }}
              />
            )}
          </div>

          {isEditable || !isSubmissionClosed ? (
            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
              >
                {hasSubmission ? "Update Submission" : "Submit Form"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              {hasSubmission
                ? "Your submission is final and can no longer be edited"
                : "This form is no longer accepting new submissions"}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default SubmissionForm;