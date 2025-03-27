import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiDownload,
  FiEdit,
  FiEye,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiFileText,
  FiUser,
  FiClock,
  FiLock,
  FiUnlock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiArrowRight,
  FiArrowLeft,
  FiChevronRight,
  FiArrowDown,
  FiArrowUp,
  FiPrinter,
  FiExternalLink,
  FiMessageSquare,
  FiSend,
  FiTrash2,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";
import { BarLoader } from "react-spinners";
import axios from "axios";
import { FaDownload } from "react-icons/fa6";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const CsoSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [cso, setCso] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [availableForms, setAvailableForms] = useState([]);

  // Comment related states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentFile, setCommentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsToShow, setCommentsToShow] = useState(3);
  const INITIAL_COMMENTS_TO_SHOW = 3;

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const fetchApplications = async () => {
    try {
      const [appsRes, csoRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/form/cso/application/${id}`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/api/cso/res/${id}`, {
          withCredentials: true,
        }),
      ]);

      setSubmissions(appsRes.data);
      setCso(csoRes.data || {});

      // Extract unique form names for filter
      const forms = [...new Set(appsRes.data.map((item) => item.form_name))];
      setAvailableForms(forms.filter(Boolean));

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const fetchComments = async (submissionId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/comments/report/${submissionId}`,
        { withCredentials: true }
      );
      setComments(response.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch comments");
    }
  };

  const sortedSubmissions = React.useMemo(() => {
    let sortableItems = [...submissions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [submissions, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredSubmissions = sortedSubmissions.filter((sub) => {
    const matchesSearch =
      sub.report_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.form_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      sub.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesForm = formFilter === "all" || sub.form_name === formFilter;

    const submissionDate = new Date(sub.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const matchesDate =
      (!start || submissionDate >= start) && (!end || submissionDate <= end);

    return matchesSearch && matchesStatus && matchesForm && matchesDate;
  });

  const handleViewSubmission = async (submission) => {
    setSelectedSubmission(submission);
    await fetchComments(submission.id);
  };

  const handleBackToList = () => {
    setSelectedSubmission(null);
  };

  const handleBackToCsoList = () => {
    navigate("/admin/all_cso");
  };

  const handleDownload = (file) => {
    window.open(`${API_BASE_URL}/${file}`, "_blank");
  };

  const handleEdit = (submission) => {
    if (submission.update_permission === "open") {
      navigate(`/edit-submission/${submission.id}`);
    }
  };

  const handleProfile = () => {
    navigate(`/admin/cso_profile/${cso.id}`);
  };

  const handlePreviewFile = (filePath) => {
    setPreviewFile(filePath);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setIsFullScreen(false);
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
      formData.append("report_id", selectedSubmission.id);
      formData.append("comment", newComment);
      if (commentFile) {
        formData.append("comment_file", commentFile);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/comments`,
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
        await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
          withCredentials: true,
        });
        setComments(comments.filter((comment) => comment.id !== commentId));
        toast.success("Comment deleted successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete comment");
      }
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/form/application/${selectedSubmission.id}/status`,
        { status: newStatus },
        {
          withCredentials: true,
        }
      );
      toast.success(`Status updated to ${newStatus}`);
      fetchApplications();
      setSelectedSubmission((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleUpdatePermission = async (newUpdatePermission) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/form/applications/${selectedSubmission.id}`,
        { update_permission: newUpdatePermission },
        {
          withCredentials: true,
        }
      );
      toast.success(`Update permission set to ${newUpdatePermission}`);
      fetchApplications();
      setSelectedSubmission((prev) => ({
        ...prev,
        update_permission: newUpdatePermission,
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update permission");
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

  const statusBadge = (status) => {
    const statusClasses = {
      new: "bg-blue-100 text-blue-800",
      approve: "bg-green-100 text-green-800",
      reject: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      default: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusClasses[status.toLowerCase()] || statusClasses.default
        }`}
      >
        {status}
      </span>
    );
  };

  const renderFilePreview = (fileUrl) => {
    if (!fileUrl) return null;

    const fileExtension = fileUrl.split(".").pop().toLowerCase();
    const fileName = fileUrl.split("/").pop();

    // if (fileExtension === "pdf") {
    //   return (
    //       <iframe
    //         src={`${API_BASE_URL}/uploads/${fileUrl}`}
    //         className="w-full h-full rounded-md shadow-sm border border-gray-200"
    //         title={`PDF Viewer - ${fileName}`}
    //         loading="lazy"
    //       />

    //   );
    // }
    if (fileExtension === 'pdf') {
      return (
        <iframe
        src={`${API_BASE_URL}/uploads/${fileUrl}`}
          className="w-full h-96 rounded-lg shadow-md"
          title="Document Viewer"
        />
      );
    } 
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={`${API_BASE_URL}/uploads/${fileUrl}`}
            alt={`Preview - ${fileName}`}
            className="max-h-full max-w-full rounded-md shadow-sm object-contain border border-gray-200"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "";
              e.target.parentElement.innerHTML = `
                <div class="text-center p-4">
                  <FiAlertCircle class="mx-auto text-red-400 text-3xl mb-2" />
                  <p class="text-red-500">Failed to load image</p>
                </div>
              `;
            }}
          />
          <div className="absolute inset-0 pointer-events-none border-2 border-transparent hover:border-blue-200 transition-all duration-200" />
        </div>
      );
    }

    return (
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 text-center">
        <FiFileText className="mx-auto text-gray-400 text-2xl mb-2" />
        <p className="text-gray-700 text-sm">
          File type not supported for preview. Please download to view.
        </p>
        <button
          onClick={() => handleDownload(fileUrl)}
          className="mt-2 text-blue-600 hover:text-blue-800 flex items-center justify-center text-sm"
        >
          <FiDownload className="mr-1" /> Download File
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader color="#3B82F6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <FiXCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={handleBackToCsoList}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiChevronLeft className="mr-1" /> Back to CSO List
        </button>
      </div>
    );
  }

  // Detail View
  if (selectedSubmission) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <FiChevronLeft className="mr-1" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Submission Details
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedSubmission.report_name}
                </h2>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="text-gray-600">
                    Submitted by: {cso.csoName || `User ${id}`}
                  </span>
                  {statusBadge(selectedSubmission.status)}
                </div>
              </div>
              <div className="mt-3 md:mt-0 flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiPrinter className="mr-2" /> Print
                </button>
                <button
                  onClick={() =>
                    handleDownload(selectedSubmission.application_file)
                  }
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Project Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Form Name"
                    value={selectedSubmission.form_name || "N/A"}
                  />
                  <InfoField
                    label="Description"
                    value={selectedSubmission.description || "No description"}
                  />
                  <InfoField
                    label="Expiration Date"
                    value={formatDate(selectedSubmission.expires_at)}
                  />
                  <InfoField
                    label="Update Permission"
                    value={
                      <div className="flex items-center">
                        {selectedSubmission.update_permission === "open" ? (
                          <FiUnlock className="text-green-500 mr-2" />
                        ) : (
                          <FiLock className="text-red-500 mr-2" />
                        )}
                        <span className="capitalize">
                          {selectedSubmission.update_permission}
                        </span>
                      </div>
                    }
                  />
                </div>
              </div>

              {/* <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Document Preview
                  </h3>
                  {selectedSubmission?.application_file && (
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleFullScreen}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                        title={
                          isFullScreen ? "Exit fullscreen" : "View fullscreen"
                        }
                      >
                        {isFullScreen ? (
                          <FiMinimize size={18} />
                        ) : (
                          <FiMaximize size={18} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(selectedSubmission.application_file)
                        }
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                      >
                        <FiDownload className="mr-1.5" /> Download
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-2 w-full border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-96 bg-gray-50 relative">
                  {selectedSubmission?.application_file ? (
                    <>
                      <div className="p-4">
                        {renderFilePreview(selectedSubmission.application_file)}
                      </div>
                      <p className="text-gray-500 text-sm text-center truncate max-w-full bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
                        {selectedSubmission.application_file.split("/").pop()}
                      </p>
                    </>
                  ) : (
                    <div className="text-center">
                      <FiFileText className="mx-auto text-gray-400 text-4xl mb-3" />
                      <p className="text-gray-500">No document available</p>
                    </div>
                  )}
                </div>
              </div> */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Document Preview
                  </span>
                  <a
                    href={selectedSubmission.application_file}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    <FaDownload className="mr-2" />
                    Download
                    <FiExternalLink className="ml-1" />
                  </a>
                </div>
                <div className="p-4">
                  {renderFilePreview(selectedSubmission.application_file)}
                </div>
              </div>
              {/* Comments Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <FiMessageSquare className="mr-2" /> Comments (
                  {comments.length})
                </h3>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="mb-3">
                    <textarea
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Add your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <input
                        type="file"
                        id="comment-file"
                        onChange={(e) => setCommentFile(e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="comment-file"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <FiFileText className="mr-2" />
                        {commentFile ? commentFile.name : "Attach File"}
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {isSubmitting ? (
                        <>
                          <BarLoader
                            color="#ffffff"
                            width={20}
                            height={2}
                            className="mr-2"
                          />
                          Posting...
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2" /> Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.slice(0, commentsToShow).map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FiUser className="text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {comment.author || "Anonymous"}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.commented_time)}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">
                            {expandedComments[comment.id] ||
                            comment.comment.length <= 200
                              ? comment.comment
                              : `${comment.comment.substring(0, 200)}...`}
                            {comment.comment.length > 200 && (
                              <button
                                onClick={() => toggleCommentExpand(comment.id)}
                                className="text-blue-600 hover:text-blue-800 ml-2 text-sm"
                              >
                                {expandedComments[comment.id]
                                  ? "Show less"
                                  : "Show more"}
                              </button>
                            )}
                          </p>

                          {comment.comment_file && (
                            <div className="mt-2">
                              <button
                                onClick={() =>
                                  handlePreviewFile(comment.comment_file)
                                }
                                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                              >
                                <FiFileText className="mr-1" /> View attached
                                file
                              </button>
                            </div>
                          )}

                          <div className="mt-2 flex space-x-3">
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-800 flex items-center text-sm"
                            >
                              <FiTrash2 className="mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {comments.length > INITIAL_COMMENTS_TO_SHOW && (
                    <button
                      onClick={toggleShowAllComments}
                      className="text-blue-600 hover:text-blue-800 mt-4 flex items-center text-sm"
                    >
                      {commentsToShow === INITIAL_COMMENTS_TO_SHOW
                        ? `Show all ${comments.length} comments`
                        : "Show fewer comments"}
                    </button>
                  )}

                  {comments.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Timeline
                </h3>
                <div className="space-y-4">
                  <TimelineItem
                    icon={<FiCalendar className="text-blue-600" />}
                    title="Created"
                    date={formatDate(selectedSubmission.created_at)}
                  />
                  <TimelineItem
                    icon={<FiClock className="text-purple-600" />}
                    title="Last Updated"
                    date={formatDate(selectedSubmission.updated_at)}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  {selectedSubmission.update_permission === "open" && (
                    <button
                      onClick={() => handleEdit(selectedSubmission)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FiEdit className="mr-2" /> Edit Submission
                    </button>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Update Status
                    </label>
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Update Permission
                    </label>
                    <select
                      value={selectedSubmission.update_permission}
                      onChange={(e) => handleUpdatePermission(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  src={`${API_BASE_URL}/${previewFile}`}
                  className="w-full h-full"
                  title="File Preview"
                />
              </div>
              <div className="bg-gray-100 px-4 py-2 border-t flex justify-end">
                <a
                  href={`${API_BASE_URL}/${previewFile}`}
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
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={handleBackToCsoList}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <FiChevronLeft className="mr-1" />
          </button>
          <div className="flex items-center">
            {cso.logo ? (
              <img
                src={`${API_BASE_URL}/${cso.logo}`}
                alt="CSO Logo"
                className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <FiUser className="text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                CSO Submissions
              </h1>
              <p className="text-gray-600">{cso.csoName || `User ${id}`}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleProfile}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-200 flex items-center"
        >
          <FiUser className="mr-2" /> View Profile
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reports or forms..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Form Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Type
            </label>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Forms</option>
              {availableForms.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "report_name", label: "Report Name" },
                  { key: "form_name", label: "Form Type" },
                  { key: "status", label: "Status" },
                  { key: "created_at", label: "Submitted Date" },
                  { key: null, label: "Actions" },
                ].map((header) => (
                  <th
                    key={header.key || header.label}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => header.key && requestSort(header.key)}
                  >
                    <div className="flex items-center">
                      {header.label}
                      {header.key && (
                        <span className="ml-1">
                          {sortConfig.key === header.key ? (
                            sortConfig.direction === "asc" ? (
                              <FiArrowUp className="w-3 h-3 text-gray-400" />
                            ) : (
                              <FiArrowDown className="w-3 h-3 text-gray-400" />
                            )
                          ) : (
                            <FiArrowRight className="w-3 h-3 text-gray-400 transform rotate-90" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {submission.report_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {submission.form_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="View Details"
                        >
                          <FiEye className="mr-1" /> View
                        </button>
                        {submission.update_permission === "open" && (
                          <button
                            onClick={() => handleEdit(submission)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Edit Submission"
                          >
                            <FiEdit className="mr-1" /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FiFileText className="h-12 w-12 mb-3 text-gray-400" />
                      <p className="text-lg font-medium">
                        No submissions found
                      </p>
                      <p className="text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
              <div className="mb-2 md:mb-0">
                Showing {filteredSubmissions.length} of {submissions.length}{" "}
                submissions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={filteredSubmissions.length <= 10}
                  className={`px-3 py-1 rounded ${
                    filteredSubmissions.length <= 10
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FiChevronLeft />
                </button>
                <span>Page 1 of 1</span>
                <button
                  disabled={filteredSubmissions.length <= 10}
                  className={`px-3 py-1 rounded ${
                    filteredSubmissions.length <= 10
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Components
const InfoField = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const TimelineItem = ({ icon, title, date }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 mt-1 mr-3">{icon}</div>
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  </div>
);

export default CsoSubmission;
