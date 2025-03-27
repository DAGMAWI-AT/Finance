import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewAllForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/form/application/app`, {
          withCredentials: true,
        });

        setForms(response.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to load forms');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (loading) return <div className="text-center p-8">Loading forms...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Application Forms</h2>

      {forms.length === 0 ? (
        <p className="text-center text-gray-600">No forms found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Form Name</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Created At</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id} className="text-center">
                <td className="border border-gray-300 p-2">{form.form_name}</td>
                <td className="border border-gray-300 p-2">{form.status}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(form.created_at).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => navigate(`/form/${form.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAllForms;
