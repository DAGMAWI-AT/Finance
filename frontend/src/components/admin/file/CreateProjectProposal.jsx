import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CreateProjectProposal = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    title: "",
    description: "",
    files: [],
  });
  const fileInputRef = useRef(null); // Ref for file input
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, files });
  };

  // Submit Form Data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.user_id || !formData.title || !formData.description) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all required fields!",
      });
      return;
    }

    // Prepare form data
    const formDataToSend = new FormData();
    formDataToSend.append("user_id", formData.user_id);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);

    formData.files.forEach((file) => {
      formDataToSend.append("files", file);
    });

    // Debugging: Inspect FormData contents
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch("${process.env.REACT_APP_API_URL}/api/projects/create", {
        method: "POST",
        body: formDataToSend,
      });

      console.log("Response status:", response.status); // Debugging

      const result = await response.json();
      console.log("Response result:", result); // Debugging

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: result.message || "Your data has been saved successfully.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Reset form fields
        setFormData({
          user_id: "",
          title: "",
          description: "",
          files: [],
        });

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Navigate to /admin/dashboard after success
        navigate("/admin/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: result.error || "Error submitting form!",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error); // Debugging
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-5">
        Create Project / Proposal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="user_id" className="block text-gray-700 font-medium">
            User ID:
          </label>
          <input
            type="text"
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your user ID"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium">
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project title"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project description"
          ></textarea>
        </div>
        <div>
          <label htmlFor="files" className="block text-gray-700 font-medium">
            Upload Files:
          </label>
          <input
            type="file"
            id="files"
            name="files"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef} // Ref for file input
            className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Create Project
        </button>
      </form>
    </div>
  );
};

export default CreateProjectProposal;