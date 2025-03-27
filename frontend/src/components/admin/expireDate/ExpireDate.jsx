import React, { useState } from "react";

const ExpireDate = () => {
  const [data, setData] = useState([
    { id: 1, reportCategory: "Quarterly", expireDate: "2024-12-31" },
    { id: 2, reportCategory: "Yearly", expireDate: "2025-12-31" },
  ]);

  const [categories] = useState(["Quarterly", "Yearly", "Monthly"]); // Example categories

  const handleEdit = (id) => {
    const newCategory = prompt("Enter new report category:", data.find(item => item.id === id)?.reportCategory);
    const newExpireDate = prompt("Enter new expiration date (YYYY-MM-DD):", data.find(item => item.id === id)?.expireDate);
    if (newCategory && newExpireDate) {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id
            ? { ...item, reportCategory: newCategory, expireDate: newExpireDate }
            : item
        )
      );
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setData((prevData) => prevData.filter((item) => item.id !== id));
    }
  };

  const handleAddExpireDate = () => {
    const newCategory = prompt("Enter report category:");
    const newExpireDate = prompt("Enter expiration date (YYYY-MM-DD):");
    if (newCategory && newExpireDate) {
      setData((prevData) => [
        ...prevData,
        {
          id: prevData.length + 1,
          reportCategory: newCategory,
          expireDate: newExpireDate,
        },
      ]);
    }
  };

  return (
    <div className="p-8 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Expiration Dates</h2>
        <button
          className="px-6 py-3 text-base text-white bg-green-600 rounded hover:bg-green-700"
          onClick={handleAddExpireDate}
        >
          Add Expire Date
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300 text-left shadow-2xl shadow-blue-gray-900">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-6 py-4">ID</th>
            <th className="border border-gray-400 px-6 py-4">Report Category</th>
            <th className="border border-gray-400 px-6 py-4">Expire Date</th>
            <th className="border border-gray-400 px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border border-gray-400 px-6 py-4">{row.id}</td>
              <td className="border border-gray-400 px-6 py-4">{row.reportCategory}</td>
              <td className="border border-gray-400 px-6 py-4">{row.expireDate}</td>
              <td className="border border-gray-400 px-6 py-4">
                <button
                  className="mr-4 px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                  onClick={() => handleEdit(row.id)}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpireDate;
