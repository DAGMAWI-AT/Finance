import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaExternalLinkAlt,
  FaComment,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const ViewWorkReport = () => {
  const { id } = useParams(); // Get the report ID from the URL
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [showFile, setShowFile] = useState(false);
  const [categories, setCategories] = useState({});
  const [comments, setComments] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const visibleComments = showAll ? comments : comments.slice(0, 3);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // First, check authentication and get user details
        const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          withCredentials: true, // Include credentials for session-based authentication
        });
    
        if (!meResponse.data.success) {
          navigate("/user/login");
          return;
        }
    
        const { id: userId } = meResponse.data; // Get userId from the response
    
        // Fetch the report details by id
        const reportResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/report/byId/${id}`, {
          credentials: "include", // Include cookies in the request
        });
    
        if (!reportResponse.ok) {
          throw new Error(`${reportResponse.statusText}`);
        }
    
        const reportData = await reportResponse.json();
    
        // Check if the report belongs to the authenticated user
        if (reportData.user_id !== userId ) {
          navigate("/user/unauthorized");
          return;
        }
       
        
        setReport(reportData);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching report:", error);
        setError(error.message); 
      }
    };
    fetchReport();
  }, [id, navigate]);

  // Fetch category details once report is loaded
  useEffect(() => {
    const fetchCategory = async () => {
      if (!report?.category_id) return;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reportCategory/${report.category_id}`, {
          credentials: "include", // Include cookies in the request
        });
        if (!response.ok) throw new Error("Failed to fetch category");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [report]);

  // Fetch comments for the report
  useEffect(() => {
    const fetchComments = async () => {
      if (!report?.id) return;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/comments/comment/${report.id}`, {
          credentials: "include", // Include cookies in the request
        });
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [report]);

  const handleDownload = () => {
    const fileUrl = `${process.env.REACT_APP_API_URL}/cso_files/${report.category_name}/${report.report_file}`;
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        return response.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = report.report_file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Download error:", error);
        alert("Failed to download the file. Please try again later.");
      });
  };

  const statusColors = {
    approve: "text-green-500",
    reject: "text-red-500",
    pending: "text-yellow-500",
    inprogress: "text-blue-500",
    "in progress": "text-blue-500",
    new: "text-gray-500",
  };

  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <p className="text-gray-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <p className="text-gray-600 text-lg">Report not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-6">
      {/* Header */}
      <header className="">
        <div className="container mx-auto px-4 flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/user/work_report")}
            className="flex items-center space-x-2 lg:px-6 lg:py-3 px-3 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-md border border-gray-200 hover:shadow-lg"
          >
            <FaArrowLeft size={20} className="text-blue-600" />
            <span>Back</span>
          </button>
          <h1 className="font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            View Report
          </h1>
        </div>
      </header>

      {/* Report Details Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Report Name */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Report Name
            </h2>
            <p className="text-gray-600 mt-2">{report.report_name}</p>
          </div>

          {/* Response Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Response
            </h2>
            <p
              className={`mt-2 font-medium ${
                statusColors[report.status] || "text-gray-500"
              }`}
            >
              {report.status}
            </p>
          </div>

          {/* Expire Date */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Expire Date
            </h2>
            <p
              className={`mt-2 ${
                new Date(report.expire_date) < new Date()
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {new Date(report.expire_date).toLocaleString()}
            </p>
          </div>

          {/* Submitted Date */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Submitted Date
            </h2>
            <p className="text-gray-600 mt-2">
              {new Date(report.created_at).toLocaleString()}
            </p>
          </div>

          {/* Report Category */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Report Category
            </h2>
            <p className="text-gray-600 mt-2">{categories.category_name}</p>
          </div>

          {/* Updated Date */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Updated Date
            </h2>
            <p className="text-gray-600 mt-2">
              {new Date(report.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Summary
          </h2>
          <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200 max-h-40 overflow-y-auto">
            <p className="text-gray-700">{report.description}</p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2 mb-4">
          <FaComment size={20} />
          <span>Comments ({comments.length})</span>
        </h2>
        <div className="space-y-4">
          {comments.length > 0 ? (
            <>
              {visibleComments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-4 border-indigo-500 pl-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {comment.author}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        {new Date(comment.commented_time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    {expandedComments[comment.id]
                      ? comment.comment
                      : comment.comment.slice(0, 200)}
                    {comment.comment.length > 200 && (
                      <button
                        onClick={() => toggleExpand(comment.id)}
                        className="text-indigo-600 hover:underline ml-2"
                      >
                        {expandedComments[comment.id]
                          ? "Read Less"
                          : "Read More"}
                      </button>
                    )}
                  </p>
                </div>
              ))}
              {comments.length > 3 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-indigo-600 mt-2 hover:underline"
                >
                  {showAll ? "Show Less" : "Show More"}
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500">No comments yet</p>
          )}
        </div>
      </div>

      {/* File Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">File</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowFile(!showFile)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaEye size={18} />
            <span>{showFile ? "Hide File" : "View File"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaDownload size={18} />
            <span>Download</span>
          </button>
          <a
            href={`${process.env.REACT_APP_API_URL}/cso_files/${report.category_name}/${report.report_file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <FaExternalLinkAlt size={18} />
            <span>Open in New Tab</span>
          </a>
        </div>

        {/* File Preview */}
        {showFile && (
          <div className="mt-6 border rounded-lg overflow-hidden shadow">
            <embed
              src={`${process.env.REACT_APP_API_URL}/cso_files/${report.category_name}/${report.report_file}`}
              type="application/pdf"
              width="100%"
              height="500px"
              onError={(e) => {
                console.error("Failed to load the file", e);
                alert("The file could not be loaded. Please try again later.");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewWorkReport;