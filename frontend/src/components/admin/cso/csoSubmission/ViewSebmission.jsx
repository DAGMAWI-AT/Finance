import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiChevronLeft, FiDownload, FiEdit, FiClock, FiUser, 
  FiFileText, FiCalendar, FiLock, FiUnlock, FiMessageSquare,
  FiTrash2, FiSend
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const ViewSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user role first
        const roleResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/role`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserRole(roleResponse.data.role);

        // Fetch submission details
        const submissionResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/form/application/${id}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setSubmission(submissionResponse.data);

        // Fetch comments
        const commentsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/comments?report_id=${id}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setComments(commentsResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownload = () => {
    window.open(`${process.env.REACT_APP_API_URL}/uploads/${submission.application_file}`, '_blank');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('report_id', id);
      formData.append('comment', newComment);
      if (commentFile) {
        formData.append('comment_file', commentFile);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/comments`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setComments([...comments, response.data]);
      setNewComment('');
      setCommentFile(null);
      toast.success('Comment added successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/comments/${commentId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setComments(comments.filter(comment => comment.id !== commentId));
        toast.success('Comment deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiChevronLeft className="mr-1" /> Back to Submissions
        </button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          No submission found
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-800">
            {submission.form_name}
          </h1>
          <p className="text-gray-600 mt-1">
            {submission.report_name}
          </p>
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
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {submission.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiCalendar />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Expiration Date</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(submission.expires_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      {submission.update_permission === 'open' ? <FiUnlock /> : <FiLock />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Update Permission</p>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {submission.update_permission}
                        {submission.update_permission === 'open' && (
                          <span className="ml-2 text-green-600">(Editable)</span>
                        )}
                        {submission.update_permission === 'close' && (
                          <span className="ml-2 text-red-600">(Locked)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Preview Section */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Document Preview
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <p className="text-gray-500 mb-3">
                    File: {submission.application_file}
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiDownload className="mr-2" />
                      Download Document
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
                      <FiUser />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Submitted By</p>
                      <p className="mt-1 text-sm text-gray-900">
                        User ID: {submission.user_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiClock />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Submitted On</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(submission.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5">
                      <FiClock />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(submission.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <FiMessageSquare className="mr-2" /> Comments
                </h2>
                
                {/* Comment Form (only for admin/super-admin) */}
                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <div className="mb-3">
                      <textarea
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="3"
                        placeholder="Add your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attach File (Optional)
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setCommentFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiSend className="mr-2" /> Post Comment
                    </button>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{comment.author}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.commented_time)}
                            </p>
                          </div>
                          {(userRole === 'admin' || userRole === 'super_admin') && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete comment"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{comment.comment}</p>
                        {comment.comment_file && (
                          <div className="mt-2">
                            <a
                              href={`${process.env.REACT_APP_API_URL}/uploads/${comment.comment_file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View attached file
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No comments yet</p>
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

export default ViewSubmission;