import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaEye,
  FaCommentDots,
  FaArrowLeft,
  FaTrash,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { BarLoader } from "react-spinners";

const ShowReport = () => {
  const navigate = useNavigate();
  const report = useLoaderData();
  const [showFile, setShowFile] = useState(false);
  const [comments, setComment] = useState({ comment: "", comment_file: null });
  const [commentData, setCommentData] = useState([]);
  const [categories, setCategories] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusSuccessMessage, setStatusSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [loading, setLoading] = useState(true);

  const [authors, setAuthorName] = useState("");
  const [registration_id, setRegistrationId] = useState();

  const [showAll, setShowAll] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [formData, setFormData] = useState({ status: report?.status });
  const [formExpireDate, setFormExpireDate] = useState({
    expire_date: report?.expire_date
      ? new Date(report.expire_date).toISOString().split("T")[0]
      : "",
  });
  const visibleComments = showAll ? commentData : commentData.slice(0, 3);

  // useEffect(() => {
  //   if (report?.id) {
  //     const fetchComments = async () => {
  //       const meResponse = await axios.get("${process.env.REACT_APP_API_URL}/api/staff/me", {
  //         withCredentials: true,
  //       });
    
  //       if (!meResponse.data || !meResponse.data.success) {
  //         navigate("/login");
  //         return;
  //       }
    
  //       const {id, registrationId } = meResponse.data;
  //       setRegistrationId(registrationId);

  //       try {
  //         const response = await fetch(
  //           `${process.env.REACT_APP_API_URL}/api/comments/comment/${report.id}`
  //         );
  //         if (!response.ok) throw new Error(`Error: ${response.status}`);
  //         const data = await response.json();
  //         setCommentData(data.comments || []);
  //         setLoading(false);

  //       } catch (error) {
  //         console.error("Error fetching comments:", error);
  //         setLoading(false);

  //       }
  //     };
  //     fetchComments();
  //   }
  // }, [report?.id]);

  useEffect(() => {
    if (report?.id) {
      const fetchComments = async () => {
        try {
          const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
            withCredentials: true,
          });
  
          if (!meResponse.data?.success) {
            navigate("/login");
            return;
          }
  
          const { id, registrationId } = meResponse.data;
          setRegistrationId(registrationId);
  
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/comments/comment/${report.id}`
          );
          if (!response.ok) throw new Error(`Error: ${response.status}`);
          const data = await response.json();
          setCommentData(data.comments || []);
          setLoading(false);
        } catch (error) {
          if (error.response?.status === 401) {
            navigate("/login");
          } else {
            console.error("Error fetching comments:", error);
          }
          setLoading(false);
        }
      };
      fetchComments();
    }
  }, [report?.id]);
  const handleChange = (e) => {
    const { name, files, value } = e.target;
    setComment((prev) => ({
      ...prev,
      [name]: name === "comment_file" ? files[0] : value,
    }));
  };
  const handleChangeStatus = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleChangeExpireDate = (e) => {
    const { name, value } = e.target;
    setFormExpireDate((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reportCategory/${report.category_id}`
        );
        if (!response.ok) throw new Error("Failed to fetch category");
        const data = await response.json();
        setCategories(data.category_name);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching category:", error);
        setLoading(false);

      }
    };
    fetchCategory();
  }, [report.category_id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
      withCredentials: true,
    });

    if (!meResponse.data || !meResponse.data.success) {
      navigate("/login");
      return;
    }

    const { id } = meResponse.data;
    const { registrationId } = meResponse.data;
    setRegistrationId(registrationId);
    try {
      const staffResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${id}`
      );
      if (!staffResponse.ok) throw new Error(`Error: ${staffResponse.status}`);
      const staffData = await staffResponse.json();

      const name = staffData.name || staffData[0]?.name;
      if (!name) throw new Error("Staff name not found");
      setAuthorName(name);
      const formData = new FormData();
      formData.append("comment", comments.comment);
      formData.append("comment_file", comments.comment_file);
      formData.append("report_id", report.id);
      formData.append("registration_id", report.registration_id);
      formData.append("author", name);
      formData.append("author_id", registrationId);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/comments`, {
        method: "POST",
        body: formData,
      });
      if (!meResponse.data || !meResponse.data.success) {
        navigate("/login");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit comment");
      }

      const newResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/comments/comment/${report.id}`
      );
      const newData = await newResponse.json();
      setCommentData(newData.comments || []);
    
      setSuccessMessage("Comment submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setComment({ comment: "", comment_file: null });
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "Failed to submit comment");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleDownload = () => {
    const fileUrl = `${process.env.REACT_APP_API_URL}/cso_files/${report.category_name}/${report.report_file}`;
    fetch(fileUrl)
      .then((response) => response.blob())
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
        setError("Failed to download file");
      });
  };
  const handleSubmitStatus = async (e) => {
    e.preventDefault();
    const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
      withCredentials: true,
    });

    if (!meResponse.data || !meResponse.data.success) {
      navigate("/login");
      return;
    }

    const { registrationId } = meResponse.data;

    const formDataToSend = new FormData();
    formDataToSend.append("status", formData.status);
    formDataToSend.append("author_id", registrationId);
    formDataToSend.append("registration_id", report.registration_id);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/report/status/${report.id}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update report");
      }

      setStatusSuccessMessage("Report status updated successfully!");
      setTimeout(() => {
        setStatusSuccessMessage("");
        // Optionally refresh data or navigate
      }, 5000);
    } catch (error) {
      console.error("Error updating report status:", error);
      setStatusError("Failed to update report status. Please try again.");
      setTimeout(() => {
        setStatusError("");
        // Optionally refresh data or navigate
      }, 2000);
    }
  };
  const handleSubmitExpireDate = async (e) => {
    e.preventDefault();

    const meResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
      withCredentials: true,
    });

    if (!meResponse.data || !meResponse.data.success) {
      navigate("/login");
      return;
    }

    const { registrationId } = meResponse.data;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/report/expire_date/${report.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expire_date: formExpireDate.expire_date,
            author_id: registrationId,
            registration_id: report.registration_id,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update expire date.");
      }

      setStatusSuccessMessage("Expire date updated successfully!");
      setTimeout(() => setStatusSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error updating expire date:", error);
      setStatusError(error.message || "Failed to update expire date.");
      setTimeout(() => setStatusError(""), 5000);
    }
  };
  const handleDeleteComment = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/comments/${id}`, {
          withCredentials: true,
        });
  
        if (response.status === 200) {
          // Update the correct state: commentData
          setCommentData((prevComments) => 
            prevComments.filter((comment) => comment.id !== id)
          );
  
          Swal.fire('Deleted!', 'Your comment has been deleted.', 'success');
        } else {
          Swal.fire('Error!', 'Something went wrong with the deletion.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', `Failed to delete comment: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Report not found!</p>
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() =>
              navigate(`/admin/each_cso/${report.registration_id}`)
            }
            className="flex items-center space-x-2 lg:px-6 lg:py-3 px-3 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-md border border-gray-200 hover:shadow-lg"
            aria-label="Back to CSO"
          >
            <FaArrowLeft size={20} className="text-blue-600" />
            <span className="font-medium">Back to Organization</span>
          </button>
          <h1 className="text-xl lg:text-4xl p-4 font-bold font-[Poppins] text-gray-900 tracking-tight">
            {report.report_name}
          </h1>
        </div>

        {/* Report Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          {statusError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {statusError}
            </div>
          )}
          {statusSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              {statusSuccessMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleSubmitStatus}>
                <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Update Status
                </h3>
                <select
                  name="status"
                  onChange={handleChangeStatus}
                  value={formData.status || report.status}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="new">New</option>
                  <option value="inprogress">Inprogress</option>
                  <option value="approve">Approved</option>
                  <option value="reject">Rejected</option>
                </select>
                <button
                  type="submit"
                  className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Update Status
                </button>
              </form>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleSubmitExpireDate}>
                <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Update Expire Date
                </h3>
                <input
                  type="date"
                  name="expire_date"
                  value={formExpireDate.expire_date}
                  onChange={handleChangeExpireDate}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Update Expire Date
                </button>
              </form>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                Submitted
              </h3>
              <p className="text-gray-900 font-medium">
                {new Date(report.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                Last Updated
              </h3>
              <p className="text-gray-900 font-medium">
                {new Date(report.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                Category
              </h3>
              {/* <p className="text-gray-900 font-medium">{categories}</p> */}
              <p className="text-gray-700 font-medium">{report.category_name}</p>

            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                Expire Date
              </h3>
              <p
                className={`text-gray-900 font-medium ${
                  new Date(report.expire_date) < new Date()
                    ? "text-red-600" // Expired
                    : new Date(report.expire_date) <
                      new Date(new Date().setDate(new Date().getDate() + 3))
                    ? "text-yellow-600" // Expiring in less than 3 days
                    : "text-green-600" // Not expired
                }`}
              >
                {new Date(report.expire_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="md:col-span-2 xl:col-span-4 pt-6">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  Summary
                </h3>
                <p className="text-gray-700 leading-relaxed font-[Inter] text-lg">
                  {report.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* File Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={() => setShowFile(!showFile)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              aria-label={showFile ? "Hide File" : "View File"}
            >
              <FaEye size={18} />
              <span>{showFile ? "Hide File" : "View File"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              aria-label="Download File"
            >
              <FaDownload size={18} />
              <span>Download File</span>
            </button>
            <a
              href={`${process.env.REACT_APP_API_URL}/cso_files/${report.category_name}/${report.report_file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
              aria-label="Open in New Tab"
            >
              <FaExternalLinkAlt size={18} />
              <span>Open in New Tab</span>
            </a>
          </div>

          {showFile && (
            <div className="mt-6">
              <embed
                src={`${process.env.REACT_APP_API_URL}/cso_files/${report.category_name}/${report.report_file}`}
                type="application/pdf"
                className="w-full min-h-[500px] rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <FaCommentDots size={24} />
            <span>Comments ({commentData.length})</span>
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

<div className="space-y-6 mb-8">
  {commentData.length > 0 ? (
    <>
      {visibleComments.map((comment) => (
        <div
          key={comment.id}
          className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-semibold text-gray-800">
                {comment.author}
              </span>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(comment.commented_time).toLocaleString()}
              </span>
            </div>
            {/* Optionally, you can add the delete button to the right */}
            {registration_id === comment.author_id && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="px-3 py-1.5 text-sm rounded-md transition-colors text-red-400 ml-2 self-start"
              >
                <FaTrash className="inline mr-1" /> Delete
              </button>
            )}
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
                {expandedComments[comment.id] ? "Read Less" : "Read More"}
              </button>
            )}
          </p>
          {comment.comment_file && comment.comment_file !== "null" && (
            <a
              href={`${process.env.REACT_APP_API_URL}/comments/${comment.comment_file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              View attached file
            </a>
          )}
        </div>
      ))}
      {commentData.length > 3 && (
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


          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="border-t pt-6">
            <div className="mb-6">
              <textarea
                name="comment"
                value={comments.comment}
                onChange={handleChange}
                placeholder="Write your comment..."
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows="4"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="file"
                name="comment_file"
                onChange={handleChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Post Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShowReport;
