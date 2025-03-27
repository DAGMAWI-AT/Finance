import React, { useState } from "react";

const AddHeroContent = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [imagePreview, setImagePreview] = useState(null); // For storing image preview URL

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file)); // Create a preview URL
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the form data to your server or API
        console.log("Hero Content Added:", { title, description, image });

        // Reset form after submission
        setTitle("");
        setDescription("");
        setImage("");
        setImagePreview(null); // Clear the image preview
    };

    return (
        <div className=" bg-gray-100 p-2 md:p-4 lg:p-6 flex justify-center font-serif items-center">
            <div className="bg-white p-3 md:p-4 lg:p-6 rounded-lg shadow-lg w-full max-w-4xl">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-500 text-center mb-8">
                    Add Hero Content
                </h1>

                <form onSubmit={handleSubmit}>
                    {/* Title and Image Inputs */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Title Input */}
                        <div className="flex flex-col w-full lg:w-1/2">
                            <label
                                className="text-lg font-semibold text-gray-700 mb-2"
                                htmlFor="title"
                            >
                                Title:
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter the title"
                                required
                            />
                        </div>

                        {/* Image Input */}
                        <div className="flex flex-col w-full lg:w-1/2">
                            <label
                                className="text-lg font-semibold text-gray-700 mb-2"
                                htmlFor="image"
                            >
                                Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                onChange={handleImageChange} // Trigger image change handler
                                className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        {imagePreview && (
                        <div className="mt-4 flex justify-center">
                            <img
                                src={imagePreview}
                                alt="Image Preview"
                                className="w-32 h-32 object-cover rounded-md shadow-md"
                            />
                        </div>
                    )}
                    </div>

                    {/* Image Preview */}
                    

                    {/* Description Input */}
                    <div className="mt-6">
                        <label
                            className="text-lg font-semibold text-gray-700 mb-2 block"
                            htmlFor="description"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter a detailed description"
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-8">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none transition duration-200"
                        >
                            Add Hero Content
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHeroContent;
