import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ViewHeroContent = () => {
  const { id } = useParams(); // Get the id of the hero content to view
  const navigate = useNavigate();
  // State to hold the hero content data
  const [heroContent, setHeroContent] = useState(null);

  // Fetch hero content based on the id from the URL
  useEffect(() => {
    // Simulating fetching hero content data based on ID
    const fetchHeroContent = async () => {
      // Simulate API call with the given id
      const content = {
        id,
        title: `Hero Content ${id}`,
        description: `Detailed description for Hero Content ${id}`,
        image: "https://via.placeholder.com/150", // Placeholder image URL
      };

      setHeroContent(content);
    };

    fetchHeroContent();
  }, [id]);

  if (!heroContent) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 mg:p-4 lg:p-6 font-serif">
      <div className="bg-white p-3 md:p-4 lg:p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-400 mb-6 text-center">
          Hero Content Details
        </h1>
        <div className="flex justify-start space-x-4 mb-8">
          <button
            type="button"
            onClick={() => navigate("/admin/web_content/hero_content")} // Use navigate for cancel action
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
        {/* Display the Hero Content */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Title</h2>
          <p className="text-gray-600">{heroContent.title}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Description</h2>
          <p className="text-gray-600">{heroContent.description}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Image</h2>
          <img
            src={heroContent.image}
            alt={heroContent.title}
            className="w-full max-w-xs object-cover rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewHeroContent;
