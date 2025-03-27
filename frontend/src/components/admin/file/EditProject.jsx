import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ title: "", description: "", files: [] });
  const [newFiles, setNewFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${id}`);
        if (!response.ok) throw new Error("Failed to fetch project");
        const result = await response.json();
        
        setProject({
          ...result,
          files: result.files ? result.files.split(",") : []
        });
      } catch (error) {
        setError(error.message);
        Swal.fire({ icon: "error", title: "Oops...", text: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewFiles([...e.target.files]);
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = project.files[index];
    setRemovedFiles(prev => [...prev, fileToRemove]);
    setProject(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    formData.append("title", project.title);
    formData.append("description", project.description);
    formData.append("removedFiles", JSON.stringify(removedFiles));

    // Add new files if any
    newFiles.forEach(file => formData.append("files", file));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/update/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update project");

      Swal.fire({ icon: "success", title: "Success!", text: "Project updated!" });
      navigate("/admin/listpp");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Project</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Title
              <input
                type="text"
                name="title"
                value={project.title}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg mt-1"
                required
              />
            </label>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Description
              <textarea
                name="description"
                value={project.description}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg mt-1 h-32"
                required
              />
            </label>
          </div>

          {/* Existing Files */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Files</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.files.map((file, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                  <a
                    href={`${process.env.REACT_APP_API_URL}/uploads/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate"
                  >
                    {file}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Upload New Files
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full p-3 border rounded-lg mt-1"
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;