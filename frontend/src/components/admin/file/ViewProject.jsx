import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import Swal from "sweetalert2"; // Import SweetAlert2 for error handling

const ViewProject = () => {
  const { id } = useParams(); // Get the project ID from the URL
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project details from the API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        const result = await response.json();
        setProject(result);
      } catch (error) {
        setError(error.message);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || "Failed to fetch project details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-4 text-center">Project not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        {/* Project Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{project.title}</h1>

        {/* Project Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-600">{project.description}</p>
        </div>

        {/* Project Files */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.files && project.files.split(",").map((file, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <a
                  href={`${process.env.REACT_APP_API_URL}/${file}`} // Link to the file
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {file} {index + 1}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Project Metadata */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Created At</h2>
            <p className="text-gray-600">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProject;