import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-4 text-lg text-gray-700">You do not have permission to view this page.</p>
      <Link
        to="/user/dashboard"
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Go Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
