import React, { useState } from 'react'
import { useNavigate } from 'react-router';

const Meeting = () => {
        // Initial state for hero contents
        const [heroContents, setHeroContents] = useState([
          {
            id: 1,
            title: "meeting 1",
            text: "meeting text 1",
            date:"10/10/2025"
          },
          {
            id: 2,
            title: "meeting 2",
            text: "meeting text 2",
            date:"10/10/2025"
          },
          {
            id: 3,
            title: "Meeting 3",
            text: "meeting text 3",
            date:"10/10/2025"
          },
          // Add more items for testing pagination
        ]);
      
        const [currentPage, setCurrentPage] = useState(1);
        const itemsPerPage = 5;
        const navigate= useNavigate();
        // Pagination logic
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = heroContents.slice(indexOfFirstItem, indexOfLastItem);
      
        const totalPages = Math.ceil(heroContents.length / itemsPerPage);
      
        // Add Hero Content
        const addMeetingContent = () => {
          navigate("/admin/web_content/add_meeting_content");
        };
      
        // Edit Hero Content
        const editMeetingContent = (id) => {
         navigate("/admin/web_content/update_meeting_content"); 
        };
      
        // View Hero Content
        const viewMeetingContent = (id) => {
          navigate("/admin/web_content/view_meeting_content")
        };
      
        // Delete Hero Content
        const deleteMeetingContent = (id) => {
          const filteredContents = heroContents.filter((content) => content.id !== id);
          setHeroContents(filteredContents);
        };
      
        // Handle Pagination
        const nextPage = () => {
          if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
          }
        };
      
        const previousPage = () => {
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        };
      
        return (
          <div className="min-h-screen bg-gray-100 p-2 md:p-4 lg:p-6 font-serif">
            <div className="bg-white p-3 md:p-4 lg:p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl lg:text-2xl font-bold font-serif text-gray-400">
                  Meeting Schedule
                </h1>
                <button
                  onClick={addMeetingContent}
                  className="bg-green-500 text-white px-2 py-1 lg:px-4 lg:py-2 rounded hover:bg-green-600 ml-auto"
                >
                  Add Meeting
                </button>
              </div>
      
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Id</th>
                      <th className="border border-gray-300 px-4 py-2">Title</th>
                      <th className="border border-gray-300 px-4 py-2">Text</th>
                      <th className="border border-gray-300 px-4 py-2">date</th>

                      <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((content, index) => (
                      <tr key={content.id} className="text-center border">
                        <td className="border-b border-gray-300 px-4 py-2">
                          {indexOfFirstItem + index + 1}
                        </td>
                      
                        <td className="border-b border-gray-300 px-4 py-2">
                          {content.title}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2">
                          {content.text}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2">
                          {content.date}
                        </td>
                        <td className="flex border-gray-300 px-4 py-2 space-x-2">
                          <button
                            onClick={() => viewMeetingContent(content.id)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => editMeetingContent(content.id)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMeetingContent(content.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
      
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 lg:px-4 lg:py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>
                <p className="text-gray-700">
                   {currentPage} of {totalPages}
                </p>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 lg:px-4 lg:py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      };

export default Meeting
