import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiChevronLeft,
  FiDownload,
  FiEdit,
  FiClock,
  FiUser,
  FiFileText,
  FiCalendar,
  FiLock,
  FiUnlock,
  FiMessageSquare,
  FiTrash2,
  FiSend,
  FiChevronUp,
  FiChevronDown,
  FiMaximize,
  FiMinimize,
  FiType,
  FiCopy,
  FiXCircle,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";
import { FaBarsProgress } from "react-icons/fa6";

const MAX_COMMENT_PREVIEW_LENGTH = 150;
const INITIAL_COMMENTS_TO_SHOW = 3;
const MAX_PREVIEW_LENGTH = 500; // Adjust as needed

const StatusBadge = ({ status }) => {
  const statusStyles = {
    approve: "bg-green-100 text-green-800",
    reject: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    new: "bg-blue-100 text-blue-800",
    inprogress: "bg-yellow-200 text-yellow-900",
    close: "bg-red-200 text-red-900",
    open: "bg-green-200 text-green-900",

    default: "bg-gray-100 text-gray-800",
  };

  const statusText = {
    approve: "Approved",
    reject: "Rejected",
    pending: "Pending",
    new: "New",
    inprogress: "In Progress",
    default: status,
  };

  const style = statusStyles[status.toLowerCase()] || statusStyles.default;
  const text = statusText[status.toLowerCase()] || statusText.default;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {text}
    </span>
  );
};

const ViewSubmitted = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [commentFile, setCommentFile] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsToShow, setCommentsToShow] = useState(
    INITIAL_COMMENTS_TO_SHOW
  );
  const [textSize, setTextSize] = useState("medium");
  const [previewFile, setPreviewFile] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const needsToggle = submission?.description?.length > MAX_PREVIEW_LENGTH;
  const [cso, setCso] = useState({});

  const displayText = isExpanded
    ? submission?.description
    : submission?.description?.substring(0, MAX_PREVIEW_LENGTH) +
      (needsToggle ? "..." : "");

  const fetchData = async () => {
    try {
      // setLoading(true);

      // Fetch all data in parallel where possible
      const [roleResponse, submissionResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/staff/me`, {
          withCredentials: true,
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/form/application/${id}`, {
          withCredentials: true,
        }),
      ]);

      setUserRole(roleResponse.data.role);
      setSubmission(submissionResponse.data);

      // Immediately extract CSO ID from submission response
      const csoId = submissionResponse.data?.cso_id;
      if (csoId) {
        const csoRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cso/res/${csoId}`,
          { withCredentials: true }
        );
        setCso(csoRes.data);
      }

      // Check file type
      if (submissionResponse.data?.application_file) {
        const fileExt = submissionResponse.data.application_file
          .split(".")
          .pop()
          .toLowerCase();
        setIsImage(["jpg", "jpeg", "png", "gif"].includes(fileExt));
      }

      // Fetch comments
      const commentsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/comments/report/${id}`,
        { withCredentials: true }
      );
      setComments(commentsResponse.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleNewTab = (filePath) => {
    window.open(`${process.env.REACT_APP_API_URL}/uploads/${filePath}`, "_blank");
  };
  const handleDownload = async (filePath) => {
    try {
      const fileUrl = `${process.env.REACT_APP_API_URL}/uploads/${filePath}`;
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const filename = filePath.split("/").pop() || "document";
      const contentType = response.headers.get("content-type");

      // Create temporary download link
      const link = document.createElement("a");
      const blobUrl = URL.createObjectURL(blob);

      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      // Show success notification
      toast.success(`Downloading ${filename}...`, {
        autoClose: 3000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Download failed: ${error.message}`, {
        autoClose: 5000,
      });

      // Fallback to window.open if fetch fails
      window.open(fileUrl, "_blank");
    }
  };
  const handleDownloadComment = async (filePath) => {
    try {
      const fileUrl = `${process.env.REACT_APP_API_URL}/comment/${filePath}`;
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const filename = filePath.split("/").pop() || "document";
      const contentType = response.headers.get("content-type");

      // Create temporary download link
      const link = document.createElement("a");
      const blobUrl = URL.createObjectURL(blob);

      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      // Show success notification
      toast.success(`Downloading ${filename}...`, {
        autoClose: 3000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Download failed: ${error.message}`, {
        autoClose: 5000,
      });

      // Fallback to window.open if fetch fails
      window.open(fileUrl, "_blank");
    }
  };
  const handlePreviewFile = (filePath) => {
    setPreviewFile(filePath);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleCommentExpand = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleShowAllComments = () => {
    setCommentsToShow((prev) =>
      prev === INITIAL_COMMENTS_TO_SHOW
        ? comments.length
        : INITIAL_COMMENTS_TO_SHOW
    );
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("report_id", id);
      formData.append("comment", newComment);
      if (commentFile) {
        formData.append("comment_file", commentFile);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/comments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setComments([response.data.data, ...comments]);
      setNewComment("");
      setCommentFile(null);
      toast.success("Comment added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/comments/${commentId}`, {
          withCredentials: true,
        });
        setComments(comments.filter((comment) => comment.id !== commentId));
        toast.success("Comment deleted successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete comment");
      }
    }
  };
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/form/application/${id}/status`,
        { status: newStatus },
        {
          withCredentials: true,
        }
      );
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };
  const handleUpdatePermission = async (id, newUpdatePermission) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/form/applications/${id}/update_permission`,
        { update_permission: newUpdatePermission },
        {
          withCredentials: true,
        }
      );
      toast.success(`Status updated to ${newUpdatePermission}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case "small":
        return "text-xs";
      case "medium":
        return "text-sm";
      case "large":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="max-w-6xl mx-auto px-4 py-8">
  //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
  //         {error}
  //       </div>
  //       <button
  //         onClick={() => navigate(-1)}
  //         className="flex items-center text-blue-600 hover:text-blue-800"
  //       >
  //         <FiChevronLeft className="mr-1" /> Back to Submissions
  //       </button>
  //     </div>
  //   );
  // }

  if (!submission) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          No submission found
        </div>
      </div>
    );
  }

  const fileUrl = `${process.env.REACT_APP_API_URL}/uploads/${submission.application_file}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Full Screen Viewer */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
            <h3 className="text-lg font-medium">
              {submission.application_file}
            </h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDownload(submission.application_file)}
                className="flex items-center px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
              >
                <FiDownload className="mr-2" /> Download
              </button>
              <button
                onClick={toggleFullScreen}
                className="flex items-center px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                <FiMinimize className="mr-2" /> Exit Full Screen
              </button>
            </div>
          </div>
          <div className="flex-grow flex items-center justify-center p-4">
            {isImage ? (
              <img
                src={fileUrl}
                alt="Document preview"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x700?text=Image+not+available";
                }}
              />
            ) : (
              <embed
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="w-full h-full min-h-screen"
              />
            )}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${
            isFullScreen ? "p-0" : "p-4"
          }`}
        >
          <div
            className={`bg-white rounded-lg ${
              isFullScreen ? "w-full h-full" : "max-w-4xl w-full max-h-screen"
            }`}
          >
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
              <h3 className="font-medium">File Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={toggleFullScreen}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  {isFullScreen ? <FiMinimize /> : <FiMaximize />}
                </button>
                <button
                  onClick={closePreview}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  <FiXCircle />
                </button>
              </div>
            </div>
            <div
              className={`${
                isFullScreen ? "h-[calc(100vh-40px)]" : "h-96"
              } p-4`}
            >
              <iframe
                src={`${process.env.REACT_APP_API_URL}/comment/${previewFile}`}
                className="w-full h-full"
                title="File Preview"
              />
            </div>
            <div className="bg-gray-100 px-4 py-2 border-t flex justify-end">
              <a
                href={`${process.env.REACT_APP_API_URL}/comment/${previewFile}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FiDownload className="mr-2" /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiChevronLeft className="mr-1" /> Back to Submissions
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FiType className="mr-2 text-gray-500" />
            <select
              className="border rounded-lg px-2 py-1 text-sm"
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <StatusBadge status={submission.status} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {submission.form_name}
              </h1>
              <p className="text-gray-600 mt-1">{submission.report_name}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                {/* Status Update Dropdown */}
                <div className="flex items-center">
                  <FaBarsProgress className="mr-2 text-gray-500" />
                  <select
                    className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={submission.status}
                    onChange={(e) =>
                      handleStatusUpdate(submission.id, e.target.value)
                    }
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="inprogress">In Progress</option>
                    <option value="approve">Approved</option>
                    <option value="reject">Rejected</option>
                  </select>
                </div>

                {/* Status Badge */}
                <StatusBadge status={submission.status} />

                {/* Update Permission Dropdown */}
                <div className="flex items-center">
                  <FaBarsProgress className="mr-2 text-gray-500" />
                  <select
                    className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={submission.update_permission}
                    onChange={(e) =>
                      handleUpdatePermission(submission.id, e.target.value)
                    }
                  >
                    <option value="open">Open</option>
                    <option value="close">Closed</option>
                  </select>
                </div>

                {/* Permission Badge */}
                <div className="flex items-center">
                  {submission.update_permission === "open" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Editable
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Submission Details */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Submission Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiFileText />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <p
                          className={`font-medium text-gray-500 ${getTextSizeClass()}`}
                        >
                          Description
                        </p>
                        {/* Optional: Add copy to clipboard button */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              submission.description || ""
                            );
                            toast.success("Description copied to clipboard");
                          }}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                          title="Copy to clipboard"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                      {/* <p
                        className={`mt-1 ${getTextSizeClass()} text-gray-900 whitespace-pre-line`}
                      >
                        {submission.description || "No description provided"}
                      </p> */}
                      <div
                        className={`mt-1 ${getTextSizeClass()} text-gray-900 whitespace-pre-line`}
                      >
                        {displayText || "No description provided"}
                        {needsToggle && (
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-blue-500 hover:text-blue-700 ml-1"
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiCalendar className="text-blue-600"/>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        Expiration Date
                      </p>
                      <p className={`mt-1 ${getTextSizeClass()} text-gray-900`}>
                        {formatDate(submission.expires_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      {submission.update_permission === "open" ? (
                        <FiUnlock className="text-green-500 mr-2" />
                      ) : (
                        <FiLock className="text-red-500 mr-2"/>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        Update Permission
                      </p>
                      <p
                        className={`mt-1 ${getTextSizeClass()} text-gray-900 capitalize`}
                      >
                        {submission.update_permission}
                        {submission.update_permission === "open" && (
                          <span className="ml-2 text-green-600">
                            (Editable)
                          </span>
                        )}
                        {submission.update_permission === "close" && (
                          <span className="ml-2 text-red-600">(Locked)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Preview Section */}
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Document Preview
                  </h2>
                  <button
                    onClick={toggleFullScreen}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {isFullScreen ? (
                      <FiMinimize className="mr-1" />
                    ) : (
                      <FiMaximize className="mr-1" />
                    )}
                    {isFullScreen ? "Exit Full Screen" : "Full Screen"}
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <p className={`text-gray-500 mb-3 ${getTextSizeClass()}`}>
                    File: {submission.application_file}
                  </p>

                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 h-96">
                    {isImage ? (
                      <div className="h-full flex items-center justify-center">
                        <img
                          src={fileUrl}
                          alt="Document preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/500x700?text=Image+not+available";
                          }}
                        />
                      </div>
                    ) : (
                      <embed
                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        type="application/pdf"
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  <div className="flex justify-center mt-4 gap-4">
                    <button
                      onClick={() =>
                        handleDownload(submission.application_file)
                      }
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiDownload className="mr-2" />
                      Download Document
                    </button>
                    <button
                      onClick={() => handleNewTab(submission.application_file)}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiDownload className="mr-2" />
                      New Tab
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Metadata and Comments */}
            <div>
              <div className="bg-gray-50 rounded-lg p-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Metadata
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiUser className="text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        Submitted By
                      </p>
                      <p className={`mt-1 ${getTextSizeClass()} text-gray-900`}>
                        {cso.csoName || `User ID: ${submission.user_id}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiCalendar className="text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        Submitted On
                      </p>
                      <p className={`mt-1 ${getTextSizeClass()} text-gray-900`}>
                        {formatDate(submission.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiClock className="text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        Last Updated
                      </p>
                      <p className={`mt-1 ${getTextSizeClass()} text-gray-900`}>
                        {formatDate(submission.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <FiMessageSquare className="mr-2" /> Comments (
                  {comments.length})
                </h2>

                {/* Comment Form (only for admin/super-admin) */}
                {(userRole === "admin" || userRole === "super_admin") && (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <div className="mb-3">
                      <textarea
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getTextSizeClass()}`}
                        rows="3"
                        placeholder="Add your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        className={`block font-medium text-gray-700 mb-1 ${getTextSizeClass()}`}
                      >
                        Attach File (Optional)
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setCommentFile(e.target.files[0])}
                        className={`block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${getTextSizeClass()}`}
                        disabled={isSubmitting}
                      />
                    </div>
                    <button
                      type="submit"
                      className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      } ${getTextSizeClass()}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Posting..."
                      ) : (
                        <>
                          <FiSend className="mr-2" /> Post Comment
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    <>
                      {comments.slice(0, commentsToShow).map((comment) => {
                        const isExpanded = expandedComments[comment.id];
                        const shouldTruncate =
                          comment.comment.length > MAX_COMMENT_PREVIEW_LENGTH;
                        const displayText =
                          isExpanded || !shouldTruncate
                            ? comment.comment
                            : `${comment.comment.substring(
                                0,
                                MAX_COMMENT_PREVIEW_LENGTH
                              )}...`;

                        return (
                          <div
                            key={comment.id}
                            className="border-b border-gray-200 pb-4 last:border-b-0"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p
                                  className={`font-medium text-gray-900 ${getTextSizeClass()}`}
                                >
                                  {comment.author}
                                </p>
                                <p
                                  className={`text-gray-500 ${getTextSizeClass()}`}
                                >
                                  {formatDate(comment.commented_time)}
                                </p>
                              </div>
                              {(userRole === "admin" ||
                                userRole === "super_admin") && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Delete comment"
                                  disabled={isSubmitting}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              )}
                            </div>

                            <div
                              className={`mt-2 ${getTextSizeClass()} text-gray-700 whitespace-pre-line`}
                            >
                              {displayText}
                              {shouldTruncate && (
                                <button
                                  onClick={() =>
                                    toggleCommentExpand(comment.id)
                                  }
                                  className="text-blue-600 hover:text-blue-800 ml-2 text-sm"
                                >
                                  {isExpanded ? (
                                    <span className="flex items-center">
                                      <FiChevronUp className="inline mr-1" />{" "}
                                      Show less
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      <FiChevronDown className="inline mr-1" />{" "}
                                      Show more
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>

                            {comment.comment_file && (
                              <div className="mt-2 flex space-x-2">
                                <button
                                  onClick={() =>
                                    handlePreviewFile(comment.comment_file)
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                >
                                  <FiMaximize className="mr-1" size={12} />
                                  Preview file
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownloadComment(comment.comment_file)
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                >
                                  <FiDownload className="mr-1" size={12} />
                                  Download
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {comments.length > INITIAL_COMMENTS_TO_SHOW && (
                        <button
                          onClick={toggleShowAllComments}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-4"
                        >
                          {commentsToShow === INITIAL_COMMENTS_TO_SHOW ? (
                            <span className="flex items-center">
                              <FiChevronDown className="mr-1" /> Show all
                              comments ({comments.length})
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FiChevronUp className="mr-1" /> Show fewer
                              comments
                            </span>
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className={`text-gray-500 italic ${getTextSizeClass()}`}>
                      No comments yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmitted;
