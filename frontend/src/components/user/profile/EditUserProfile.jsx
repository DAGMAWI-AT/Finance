import React, { useState } from "react";

const EditUserProfile = ({ profileData, onUpdate }) => {
  const [imageFile, setImageFile] = useState(profileData.logo);
  const [formData, setFormData] = useState(profileData);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const updatedData = new FormData();
      updatedData.append("csoName", formData.csoName);

      if (imageFile instanceof File) {
        updatedData.append("logo", imageFile);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/cso/update/${profileData.id}`,
        {
          method: "PATCH",
          body: updatedData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        onUpdate({ ...profileData, logo: result.logoUrl, csoName: formData.csoName });
      } else {
        setErrorMessage(result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("An error occurred while updating the profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center">
        <img
          src={
            imageFile instanceof File
              ? URL.createObjectURL(imageFile)
              : `${process.env.REACT_APP_API_URL}/${imageFile}`
          }
          alt="Profile"
          className="w-28 h-28 rounded-full border-2 border-gray-300 object-cover"
        />
        <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded mt-2">
          Change Picture
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">Name</label>
        <input
          type="text"
          name="csoName"
          value={formData.csoName}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {successMessage && (
        <div className="text-green-600 bg-green-100 p-3 rounded-md mt-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="text-red-600 bg-red-100 p-3 rounded-md mt-4">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditUserProfile;