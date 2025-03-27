import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
// import { allreport } from "../../cso/each/EachCso"; // Adjust the path if needed
export const allreport = [
  {
    id: 1,
    name: "bishofftu high school",
    type: "yearly",
    date: "2025-10-10",
    status: "pending",  
    reportFile: "0001Bisoftu.pdf",
    updatePermission:"expire, restrict, open",
    comment: "",
  },
  {
    id: 2,
    name: "bishofftu high school",
    type: "quarterly",
    date: "2025-10-20",
    status: "commented",  
    reportFile: "0001Bisoftu.pdf",
    updatePermission:"expire, restrict, open",
    comment: "",
  },
  {
    id: 3,
    name: "bishofftu health care",
    type: "proposal",
    date: "2025-10-20",
    status: "approve",  // Active status
    reportFile: "0001Bisoftu.pdf",
    updatePermission:"expire, restrict, open",
    comment: "",
  },
  // Add more reports as needed
];

const YearlyReport = () => {
  const location = useLocation();
  const { id } = useParams();
  const [comments, setComments] = useState("");
  const [newComment, setNewComment] = useState("");
  const [status, setStatus] = useState("");
  const [updatePermission, setUpdatePermission] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const yearly_report = allreport.find((report) => report.id === parseInt(id));

  useEffect(() => {
    if (yearly_report) {
      setComments(yearly_report.comment || "");
      setStatus(yearly_report.status || "pending");
      setUpdatePermission(yearly_report.updatePermission || "inactive");
    }
  }, [yearly_report]);

  if (!yearly_report) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Report Not Found
          </h1>
          <p className="text-gray-600">
            No report found with ID: {id}. Please check the URL or contact
            support.
          </p>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    const updatedComments = comments
      ? `${comments}, ${newComment.trim()}`
      : newComment.trim();
    setComments(updatedComments);
    setNewComment("");
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handlePermissionChange = (e) => {
    setUpdatePermission(e.target.value);
  };

  const viewUrl = `https://drive.google.com/viewerng/viewer?url=${encodeURIComponent(
    `https://yourserver.com/reports/${yearly_report.reportFile}`
  )}`;
  const downloadUrl = `https://yourserver.com/reports/${yearly_report.reportFile}`;

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 lg:p-6">
      <div className="bg-white p-2 lg:p-6 md:p-4 rounded-lg shadow-lg">
        <div className="ml-4 font-serif">
          <h1 className="text-xl lg:text-3xl font-bold font-serif text-gray-400 mb-4">
            Yearly Report Details
          </h1>
          <p className="text-gray-600">
            <b>Report ID:</b> {yearly_report.id}
          </p>
          <p className="text-gray-600 mt-2">
            <b>Name:</b> {yearly_report.name}
          </p>
          <p className="text-gray-600 mt-2">
            <b>Type:</b> {yearly_report.type}
          </p>
          <p className="text-gray-600 mt-2">
            <b>Date:</b> {yearly_report.date}
          </p>
          <p className="text-gray-600 mt-4">
            Additional details can be displayed here, like:
          </p>
          <p className="text-gray-600 mt-2">
            <b>Status:</b> {status}
          </p>
          <p className="text-gray-600 mt-2">
            <b>Comments:</b> {comments || "No comments yet."}
          </p>
          <div className="text-gray-600 mt-4">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline mr-4"
            >
              View Report File
            </a>
            <a
              href={downloadUrl}
              download
              className="text-blue-500 underline"
            >
              Download Report File
            </a>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h2 className="text-2xl font-bold text-gray-500">Add a Comment</h2>
          <div className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            ></textarea>
            <button
              onClick={handleAddComment}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Submit Comment
            </button>
          </div>

          <div className="flex justify-start gap-8 lg:gap-20 flex-wrap">
            <div className="mb-4 mt-4">
              <label htmlFor="status" className="block text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="w-32 lg:w-40 px-3 py-2 border rounded"
              >
                <option value="approve">Approve</option>
                <option value="pending">Pending</option>
                <option value="commented">Commented</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            <div className="mb-4 mt-4">
              <label htmlFor="update_permission" className="block text-gray-700">
                Update Permission
              </label>
              <select
                id="update_permission"
                value={updatePermission}
                onChange={handlePermissionChange}
                className="w-32 lg:w-40 px-3 py-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expire">Expire</option>
                <option value="denied">Denied to Update</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyReport;
