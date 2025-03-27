import React from 'react';

const PrintableID = React.forwardRef(({ beneficiary }, ref) => {
    const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div ref={ref} className="p-8 print:p-0">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-[380px] h-[600px] relative print:shadow-none">
        {/* ID Header */}
        <div className="bg-blue-800 text-white p-4 text-center">
          <h2 className="text-xl font-bold">Beneficiary ID Card</h2>
          <p className="text-sm">Government Welfare Program</p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Photo and Basic Info */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={`${process.env.REACT_APP_API_URL}/photoFiles/${beneficiary.photo}`}
              alt={beneficiary.fullName}
              className="w-24 h-24 rounded-full border-4 border-blue-100"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-800">{beneficiary.fullName}</h3>
              <p className="text-gray-600 text-sm">ID: {beneficiary.id}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Date of Registration:</span>
              <span className="text-gray-800">{formatDate(beneficiary.createdAt)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Phone:</span>
              <span className="text-gray-800">{beneficiary.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-800">{beneficiary.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Kebele:</span>
              <span className="text-gray-800">{beneficiary.kebele}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">House No:</span>
              <span className="text-gray-800">{beneficiary.houseNo}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Location:</span>
              <span className="text-gray-800">{beneficiary.location}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Wereda:</span>
              <span className="text-gray-800">{beneficiary.wereda}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Kfleketema:</span>
              <span className="text-gray-800">{beneficiary.kfleketema}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">School:</span>
              <span className="text-gray-800">{beneficiary.school}</span>
            </div>
          </div>

          {/* Security Features */}
          <div className="mt-6 text-center">
            <div className="h-12 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              <span className="relative top-3 text-white text-sm font-bold">
                OFFICIAL DOCUMENT
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Valid until: {formatDate(new Date().setFullYear(new Date().getFullYear() + 2))}
            </p>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-10 z-10">
          <div className="pattern-dots pattern-blue-500 pattern-bg-white 
            pattern-size-4 pattern-opacity-20 w-full h-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold rotate-45">VALID</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintableID; // Must have default export
