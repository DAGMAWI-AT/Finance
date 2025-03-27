import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiDownload, FiExternalLink, FiArrowLeft, FiPrinter } from 'react-icons/fi';

const ViewBeneficiary = () => {
  const { id } = useParams();
  const [beneficiary, setBeneficiary] = useState(null);
  const [loading, setLoading] = useState(true);
  // printRef is no longer used in this approach

  useEffect(() => {
    const fetchBeneficiary = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/beneficiaries/${id}`);
        setBeneficiary(response.data.data);
      } catch (error) {
        Swal.fire('Error!', 'Failed to fetch beneficiary details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiary();
  }, [id]);

  const isPDF = (url) => url?.toLowerCase().endsWith('.pdf');
  const isImage = (url) => /\.(jpeg|jpg|png|gif)$/i.test(url);

  const FilePreview = ({ url }) => {
    if (!url) return null;

    return (
      <div className="mt-4 border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4 min-h-[300px] flex items-center justify-center">
          {isPDF(url) ? (
            <embed 
              src={url}
              type="application/pdf"
              className="w-full h-96"
              title="ID Document PDF"
            />
          ) : isImage(url) ? (
            <img
              src={url}
              alt="ID Document"
              className="max-w-full max-h-96 object-contain"
            />
          ) : (
            <div className="text-gray-500">
              Unsupported file format. Please download to view.
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-3 border-t flex justify-end gap-3">
          <a
            href={url}
            download
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            <FiDownload className="w-5 h-5" />
            <span>Download</span>
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiExternalLink className="w-5 h-5" />
            <span>Open</span>
          </a>
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    // Prepare the HTML content for printing
    const htmlContent = `
      <html>
        <head>
          <title>Print ID Card</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .id-card { width: 380px; margin: 20px auto; border: 1px solid #ccc; padding: 20px; text-align: center; }
            .id-card img { width: 100px; height: 100px; border-radius: 50%; margin-bottom: 10px; }
            .id-card h3 { margin: 10px 0; font-size: 20px; }
            .id-card p { margin: 5px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="id-card">
            <img src="${process.env.REACT_APP_API_URL}/photoFiles/${beneficiary.photo}" alt="${beneficiary.fullName}" />
            <h3>${beneficiary.fullName}</h3>
            <p><strong>ID:</strong> ${beneficiary.id}</p>
            <p><strong>Phone:</strong> ${beneficiary.phone}</p>
            <p><strong>Email:</strong> ${beneficiary.email}</p>
            <p><strong>Kebele:</strong> ${beneficiary.kebele}</p>
            <p><strong>House No:</strong> ${beneficiary.houseNo}</p>
            <p><strong>Location:</strong> ${beneficiary.location}</p>
            <p><strong>Wereda:</strong> ${beneficiary.wereda}</p>
            <p><strong>Kfleketema:</strong> ${beneficiary.kfleketema}</p>
            <p><strong>School:</strong> ${beneficiary.school}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for this website.');
      return;
    }
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for the content to fully load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    // Fallback in case onload doesn't fire (after 1 second)
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!beneficiary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Beneficiary not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link
          to="/admin/beneficiary_list"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to List</span>
        </Link>
      </div>

      {/* Print Button */}
      <div className="mb-6">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <FiPrinter className="w-5 h-5" />
          Print ID Card
        </button>
      </div>

      {/* Beneficiary Details Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Beneficiary Details</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Personal Details Section */}
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={`${process.env.REACT_APP_API_URL}/photoFiles/${beneficiary.photo}`}
                alt={beneficiary.fullName}
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">{beneficiary.fullName}</h3>
              <p className="text-gray-600">{beneficiary.email}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Personal Information
              </h4>
              {[
                ['Beneficiary ID', beneficiary.beneficiary_id],
                ['Phone', beneficiary.phone],
                ['Kebele', beneficiary.kebele],
                ['House No', beneficiary.houseNo],
                ['Gender', beneficiary.gender],
                ['Age', beneficiary.age],


              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address and Document Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Address Information
              </h4>
              {[
                ['Location', beneficiary.location],
                ['Wereda', beneficiary.wereda],
                ['Kfleketema', beneficiary.kfleketema],
                ['School', beneficiary.school],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* ID Document Section */}
            {beneficiary.idFile && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Identification Document
                </h4>
                <FilePreview url={`${process.env.REACT_APP_API_URL}/idFiles/${beneficiary.idFile}`} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBeneficiary;
