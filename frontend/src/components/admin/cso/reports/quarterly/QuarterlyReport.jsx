// QuarterlyReport.jsx
import React from "react";
import { useParams } from "react-router-dom";
// import { allreport } from "../../cso/each/EachCso"; // Adjust the path as needed
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

const QuarterlyReport = () => {
  const { id } = useParams(); // Get ID from URL
  const quarterly_report = allreport.find(
    (report) => report.id === parseInt(id) && report.type === "quarterly"
  ); // Find the matching quarterly report

  if (!quarterly_report) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Report Not Found
          </h1>
          <p className="text-gray-600">
            No quarterly report found with ID: {id}. Please check the URL or
            contact support.
          </p>
        </div>
      </div>
    );
  }

  // Construct the file URLs
  const viewUrl = `https://drive.google.com/viewerng/viewer?url=${encodeURIComponent(
    `https://yourserver.com/reports/${quarterly_report.reportFile}`
  )}`;
  const downloadUrl = `https://yourserver.com/reports/${quarterly_report.reportFile}`;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Quarterly Report Details
        </h1>
        <p className="text-gray-600">Report ID: {quarterly_report.id}</p>
        <p className="text-gray-600 mt-2">Name: {quarterly_report.name}</p>
        <p className="text-gray-600 mt-2">Type: {quarterly_report.type}</p>
        <p className="text-gray-600 mt-2">Date: {quarterly_report.date}</p>
        <p className="text-gray-600 mt-4">Additional details:</p>
        <p className="text-gray-600 mt-2">Status: {quarterly_report.status}</p>
        <p className="text-gray-600 mt-2">Comments: {quarterly_report.comment}</p>
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
    </div>
  );
};

export default QuarterlyReport;
