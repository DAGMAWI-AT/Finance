import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UpdateHeroContent = () => {
  const { id } = useParams(); // Get the id of the hero content to be updated
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  // Initial state for the form inputs
  const [heroContent, setHeroContent] = useState({
    title: "",
    description: "",
    image: null, // Initially set image to null
    imagePreview: "", // To display the image preview
  });

  // Fetch the hero content based on the id from the URL
  useEffect(() => {
    // Simulating fetching hero content data based on ID
    const content = {
      id,
      title: `Hero Content ${id}`,
      description: `Description for Hero ${id}`,
      image: "https://via.placeholder.com/100", // Use a placeholder image URL
    };

    setHeroContent(content);
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHeroContent({ ...heroContent, [name]: value });
  };

  // Handle image file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroContent({
          ...heroContent,
          image: file,
          imagePreview: reader.result, // Set image preview URL
        });
      };
      reader.readAsDataURL(file); // Read the file as a data URL for preview
    }
  };

  // Handle form submission (updating the hero content)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally, you'd call an API to update the hero content in your database
    alert("Hero content updated successfully!");
    navigate("/admin/web_content/hero_content"); // Redirect to the hero content management page after update
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 lg:p-6 font-serif">
      <div className="bg-white p-3 md:p-4 lg:p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-400 mb-6">
          Update Hero Content
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap lg:flex-nowrap items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="mr-4 flex flex-col w-full lg:w-1/2">
              <label
                htmlFor="title"
                className="block text-gray-600 font-medium"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={heroContent.title}
                onChange={handleChange}
                className="mt-2 p-2 w-full border border-gray-300 rounded"
                required
              />
            </div>
            <div className="flex flex-col w-full lg:w-1/2">
              <label
                htmlFor="image"
                className="block text-gray-600 font-medium"
              >
                Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*" // Accept image files only
                onChange={handleImageChange}
                className="mt-2 p-2 w-full border border-gray-300 rounded"
              />

              {/* Show the previous image if it exists */}
             
            </div>
            {heroContent.image && !heroContent.imagePreview && (
                <div className="mt-4">
                  <img
                    src={heroContent.image}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
              {/* Show the selected image preview */}
              {heroContent.imagePreview && (
                <div className="mt-4">
                  <img
                    src={heroContent.imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-600 font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={heroContent.description}
              onChange={handleChange}
              className="mt-2 p-2 w-full border border-gray-300 rounded"
              rows="4"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/admin/web_content/hero_content")} // Use navigate for cancel action
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateHeroContent;
