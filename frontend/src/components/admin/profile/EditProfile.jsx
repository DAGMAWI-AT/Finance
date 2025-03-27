import React, { useState } from "react";

const EditUserProfile = ({ profileData, onUpdate }) => {
  const [imageFile, setImageFile] = useState(`${process.env.REACT_APP_API_URL}/staff/${profileData.photo}`);
  const [formData, setFormData] = useState(profileData);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

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
    setSuccessMessage(""); // Reset any previous success message
    setErrorMessage(""); // Reset any previous error message

    try {
      const updatedData = new FormData();
      updatedData.append("name", formData.name); // Ensure the updated name is added

      if (imageFile instanceof File) {
        updatedData.append("photo", imageFile);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/update/${formData.id}`,
        {
          method: "PUT",
          body: updatedData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Profile updated successfully!"); // Show success message
        onUpdate({ ...profileData, photo: result.photoUrl, name: formData.name });
      } else {
        setErrorMessage("Error updating profile: " + result.message); // Show error message
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("An error occurred while updating the profile."); // Show error message
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center">
        <img
          src={imageFile instanceof File ? URL.createObjectURL(imageFile) : imageFile}
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
          name="name" // Ensure the name matches the data model
          value={formData.name} // Bind to formData.name
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {/* Success or Error message display */}
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
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditUserProfile;
