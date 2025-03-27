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
  FiType,
  FiChevronDown,
  FiChevronUp,
  FiMaximize,
  FiCopy,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    approve: "bg-green-100 text-green-800",
    reject: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    new: "bg-blue-100 text-blue-800",
    inprogress: "bg-yellow-200 text-yellow-900",

    default: "bg-gray-100 text-gray-800",
  };

  const statusText = {
    approve: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    new: "New",
    inprogress: "Inprogress",
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
const MAX_COMMENT_PREVIEW_LENGTH = 150;
const INITIAL_COMMENTS_TO_SHOW = 3;
const MAX_PREVIEW_LENGTH = 200; // Adjust as needed

const ViewSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [textSize, setTextSize] = useState("medium");
  const [numPages, setNumPages] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [needsReadMore, setNeedsReadMore] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsToShow, setCommentsToShow] = useState(
    INITIAL_COMMENTS_TO_SHOW
  );
  const [comments, setComments] = useState([]);
  const [descriptionReady, setDescriptionReady] = useState(false);

  const textSizes = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-lg",
  };

  const descriptionRef = React.useRef(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/form/application/${id}`,
          {
            withCredentials: true,
          }
        );
        setSubmission(response.data);

        // Check if file is an image
        const fileExt = response.data.application_file
          .split(".")
          .pop()
          .toLowerCase();
        setIsImage(["jpg", "jpeg", "png", "gif"].includes(fileExt));
        const commentsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/comments/report/${id}`,
          { withCredentials: true }
        );
        setComments(commentsResponse.data.data || []);
        setLoading(false);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  //   useEffect(() => {
  //     if (descriptionRef.current && submission?.description) {
  //       // Use requestAnimationFrame to ensure layout is complete
  //       requestAnimationFrame(() => {
  //         const needsCollapse =
  //           descriptionRef.current.scrollHeight >
  //           descriptionRef.current.clientHeight;
  //         setNeedsReadMore(needsCollapse);
  //         setDescriptionReady(true);
  //       });
  //     }
  //   }, [submission?.description, textSize]);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
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
  const handleDownload = () => {
    window.open(
      `${process.env.REACT_APP_API_URL}/uploads/${submission.application_file}`,
      "_blank"
    );
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
  const handleEdit = () => {
    if (
      submission.update_permission === "open" &&
      submission.form_id !== null
    ) {
      navigate(`/user/form/${submission.form_id}`);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleViewer = () => {
    setIsViewerOpen(!isViewerOpen);
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const needsToggle = submission?.description?.length > MAX_PREVIEW_LENGTH;

  const displayText = isExpanded
    ? submission?.description
    : submission?.description?.substring(0, MAX_PREVIEW_LENGTH) +
      (needsToggle ? "..." : "");

  //   const toggleDescription = () => {
  //     setIsDescriptionExpanded(!isDescriptionExpanded);
  //   };
  useEffect(() => {
    if (!descriptionRef.current || !submission?.description) return;

    const measure = () => {
      const element = descriptionRef.current;
      // Calculate based on line height
      const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 20;
      const maxHeight = lineHeight * 3; // 3 lines

      setNeedsReadMore(element.scrollHeight > maxHeight + 5); // Add small buffer
      setDescriptionReady(true);
    };

    // Initial measurement
    measure();

    // Additional checks to ensure layout is complete
    const timer1 = setTimeout(measure, 50);
    const timer2 = setTimeout(measure, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [submission?.description, textSize]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
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
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiChevronLeft className="mr-1" /> Back to Submissions
        </button>
      </div>   
       <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1
                className={`text-2xl font-bold text-gray-800 ${textSizes[textSize]}`}
              >
                {submission.form_name}
              </h1>
              <p className={`text-gray-600 mt-1 ${textSizes[textSize]}`}>
                {submission.report_name}
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0 space-x-4">
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
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Submission Details */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-5">
                <h2
                  className={`text-lg font-semibold text-gray-700 mb-4 ${textSizes[textSize]}`}
                >
                  Submission Details
                </h2>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                        <FiFileText />
                      </div>
                      <div className="ml-3 flex-1">
                           <div className="flex justify-between items-start">
                             <p className={`font-medium text-gray-500 ${textSizes[textSize]}`}>
                               Description
                             </p>
                             {/* Optional: Add copy to clipboard button */}
                             <button
                               onClick={() => {
                                 navigator.clipboard.writeText(submission.description || '');
                                 toast.success('Description copied to clipboard');
                               }}
                               className="text-gray-400 hover:text-gray-600 ml-2"
                               title="Copy to clipboard"
                             >
                               <FiCopy className="w-4 h-4" />
                             </button>
                           </div>
                        <div className="whitespace-pre-wrap text-gray-600">
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
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiCalendar />
                    </div>
                    <div className="ml-3">
                      <p
                        className={`font-medium text-gray-500 ${textSizes[textSize]}`}
                      >
                        Expiration Date
                      </p>
                      <p
                        className={`mt-1 text-gray-900 ${textSizes[textSize]}`}
                      >
                        {formatDate(submission.expires_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      {submission.update_permission === "open" ? (
                        <FiUnlock />
                      ) : (
                        <FiLock />
                      )}
                    </div>
                    <div className="ml-3">
                      <p
                        className={`font-medium text-gray-500 ${textSizes[textSize]}`}
                      >
                        Update Permission
                      </p>
                      <p
                        className={`mt-1 text-gray-900 capitalize ${textSizes[textSize]}`}
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
            </div>

            {/* Right Column - Metadata and Actions */}
            <div>
              <div className="bg-gray-50 rounded-lg p-5 h-full">
                <h2
                  className={`text-lg font-semibold text-gray-700 mb-4 ${textSizes[textSize]}`}
                >
                  Metadata
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiUser />
                    </div>
                    <div className="ml-3">
                      <p
                        className={`font-medium text-gray-500 ${textSizes[textSize]}`}
                      >
                        Submitted By
                      </p>
                      <p
                        className={`mt-1 text-gray-900 ${textSizes[textSize]}`}
                      >
                        User ID: {submission.user_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiClock />
                    </div>
                    <div className="ml-3">
                      <p
                        className={`font-medium text-gray-500 ${textSizes[textSize]}`}
                      >
                        Submitted On
                      </p>
                      <p
                        className={`mt-1 text-gray-900 ${textSizes[textSize]}`}
                      >
                        {formatDate(submission.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiClock />
                    </div>
                    <div className="ml-3">
                      <p
                        className={`font-medium text-gray-500 ${textSizes[textSize]}`}
                      >
                        Last Updated
                      </p>
                      <p
                        className={`mt-1 text-gray-900 ${textSizes[textSize]}`}
                      >
                        {formatDate(submission.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleDownload}
                    className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${textSizes[textSize]}`}
                  >
                    <FiDownload className="mr-2" />
                    Download Document
                  </button>

                  {submission.update_permission === "open" &&
                    submission.form_id !== null && (
                      <button
                        onClick={handleEdit}
                        className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${textSizes[textSize]}`}
                      >
                        <FiEdit className="mr-2" />
                        Edit Submission
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* File Preview Section */}
          <div className="mt-6 bg-gray-50 rounded-lg p-5">
            <h2
              className={`text-lg font-semibold text-gray-700 mb-4 ${textSizes[textSize]}`}
            >
              Document Preview
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <p className={`text-gray-500 mb-3 ${textSizes[textSize]}`}>
                File: {submission.application_file}
              </p>

              <div className="flex justify-center mb-4">
                <button
                  onClick={toggleViewer}
                  className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${textSizes[textSize]}`}
                >
                  {isViewerOpen ? "Close Viewer" : "Open Viewer"}
                </button>
              </div>

              {isViewerOpen && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                  {isImage ? (
                    <div className="flex justify-center p-4">
                      <img
                        src={fileUrl}
                        alt="Submission preview"
                        className="max-h-screen max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/500x700?text=Image+not+available";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-screen max-h-[70vh] w-full">
                      <embed
                        //    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        // className="min-h-[500px]"
                        // className="min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
                        className="min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh]"
                      />
                      <p
                        className={`text-center p-4 text-gray-500 ${textSizes[textSize]}`}
                      >
                        If the document doesn't load, please download it to
                        view.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
                            className={`font-medium text-gray-900 ${textSizes[textSize]}`}
                          >
                            {comment.author}
                          </p>
                          <p className={`text-gray-500 ${textSizes[textSize]}`}>
                            {formatDate(comment.commented_time)}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`mt-2 ${textSizes[textSize]} text-gray-700 whitespace-pre-line`}
                      >
                        {displayText}
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleCommentExpand(comment.id)}
                            className="text-blue-600 hover:text-blue-800 ml-2 text-sm"
                          >
                            {isExpanded ? (
                              <span className="flex items-center">
                                <FiChevronUp className="inline mr-1" /> Show
                                less
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <FiChevronDown className="inline mr-1" /> Show
                                more
                              </span>
                            )}
                          </button>
                        )}
                      </div>

                      {comment.comment_file && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleDownload(comment.comment_file)}
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
                        <FiChevronDown className="mr-1" /> Show all comments (
                        {comments.length})
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FiChevronUp className="mr-1" /> Show fewer comments
                      </span>
                    )}
                  </button>
                )}
              </>
            ) : (
              <p className={`text-gray-500 italic ${textSizes[textSize]}`}>
                No comments yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmission;
