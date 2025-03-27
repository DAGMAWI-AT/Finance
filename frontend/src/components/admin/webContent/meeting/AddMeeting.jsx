import React, { useState } from 'react'

const AddMeeting = () => {
        const [title, setTitle] = useState("");
        const [text, setText] = useState("");
        const [date, setDate] = useState("");


        // For storing image preview URL
    
      
    
        const handleSubmit = (e) => {
            e.preventDefault();
            // Here you would typically send the form data to your server or API
            console.log("Hero Content Added:", { title, text, date });
    
            // Reset form after submission
            setTitle("");
            setText("");
            setDate("");
        };
    
        return (
            <div className="bg-gray-100 p-2 md:p-4 lg:p-6  flex justify-center items-center font-serif">
                <div className="bg-white p-3 md:p-4 lg:p-6  rounded-lg shadow-lg w-full max-w-4xl">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-500 text-center mb-8">
                        Add Meeting Schedule
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
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="image"
                                    onChange={(e) => setDate(e.target.value)}
                                    className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                           
                    
                        </div>
    
                        <div className="mt-6">
                            <label
                                className="text-lg font-semibold text-gray-700 mb-2 block"
                                htmlFor="description"
                            >
                                Text
                            </label>
                            <textarea
                                id="description"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter a meeting text"
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
                                Add Meeting
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

export default AddMeeting
