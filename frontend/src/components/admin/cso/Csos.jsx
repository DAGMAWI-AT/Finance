import React, { useEffect, useState } from "react";
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaThLarge,
  FaList,
  FaUserAlt,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";
import { BarLoader, ClipLoader } from "react-spinners";

const Csos = () => {
  const navigate = useNavigate();

  const [csos, setCsos] = useState([]);
  const [, setFilter] = useState("alphabet"); //filter
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [displayMode, setDisplayMode] = useState("gallery");
  const [currentPage, setCurrentPage] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // new error state
  const itemsPerPage = 6;
  const location = useLocation();

  // Scroll to top on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOffline = () => {
      setError("No internet connection. Please check your connection.");
    };

    const handleOnline = () => {
      setError(null);
      // Optionally, you can re-fetch data when connection is restored
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cso/get`);
        if (response.ok) {
          const data = await response.json();
          setCsos(data || []);
        } else {
          setError(`Failed to fetch profile data. Status: ${response.status}`);
          // console.error("Failed to fetch profile data. Response:", response.status);
        }
      } catch (error) {
        setError("Error fetching profile data. Please check your internet connection.");
        // console.error("Error fetching profile data:", error);
      }finally {
        setLoading(false);
      }
    };

    // Only fetch if online
    if (navigator.onLine) {
      fetchProfileData();
    } else {
      setLoading(false);
      setError("No internet connection. Please check your connection.");
    }
  }, []);

  // const handleClick = (id) => {
  //   navigate(`/admin/each_cso/${id}`);
  // };
  const handleClick = (id) => {
    navigate(`/admin/cso_submission/${id}`);
  };
  const handleSortChange = (order) => {
    setFilter(order);
    setCsos((prev) =>
      [...prev].sort((a, b) => {
        if (order === "asc") return a.csoName.localeCompare(b.csoName);
        if (order === "desc") return b.csoName.localeCompare(a.csoName);
        return 0;
      })
    );
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredCsos = csos
    .filter((cso) =>
      cso.csoName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((cso) => {
      const startDate = dateFilter.start ? new Date(dateFilter.start) : new Date(0);
      const endDate = dateFilter.end ? new Date(dateFilter.end) : new Date();
      const csoDate = new Date(cso.date);
      return csoDate >= startDate && csoDate <= endDate;
    });

  const toggleDisplayMode = () => {
    setDisplayMode((prev) => (prev === "gallery" ? "list" : "gallery"));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCsos.length / itemsPerPage);
  const currentItems = filteredCsos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <BarLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  
  return (
    <div className="p-2 lg:p-8 md:p-6 mx-auto max-w-6xl bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-4xl lg:text-4x1 p-2 lg:p-4 md:p-4 font-thin text-gray-600 mb-6 text-center">
        Civic Society Organizations
      </h2>

      {/* Filters */}
      <div className="flex border-2 p-2 sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 lg:space-x-4 md:space-x-3">
          <label className="text-gray-600 font-semibold">
            <div className="flex mt-4 lg:mt-0 md:mt-0 space-x-2 items-center">
              <button
                onClick={() => handleSortChange("asc")}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <FaSortAlphaDown className="text-lg text-gray-700" />
              </button>
              <button
                onClick={() => handleSortChange("desc")}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <FaSortAlphaUp className="text-lg text-gray-700" />
              </button>
            </div>
          </label>
        </div>
        <div className="flex items-center space-x-1 lg:space-x-4">
          <input
            type="date"
            name="start"
            value={dateFilter.start}
            onChange={handleDateFilterChange}
            className="p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200 w-14 lg:w-36 md:w-36"
          />
          <span>to</span>
          <input
            type="date"
            name="end"
            value={dateFilter.end}
            onChange={handleDateFilterChange}
            className="p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200 w-14 lg:w-36 md:w-36"
          />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search"
          className="px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200 w-20 lg:w-36 md:3-36"
        />
      </div>

      {/* Display Mode Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleDisplayMode}
          className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition"
        >
          {displayMode === "gallery" ? (
            <FaList className="text-gray-700" />
          ) : (
            <FaThLarge className="text-gray-700" />
          )}
        </button>
      </div>

      {/* CSOs */}
      <div
        className={`${
          displayMode === "gallery"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            : "flex flex-col space-y-4"
        }`}
      >
        {currentItems.length > 0 ? (
          currentItems.map((cso) => (
            <div
              key={cso.registrationId}
              className={`relative bg-white border border-gray-300 rounded-lg shadow-md p-4 hover:shadow-lg transition transform hover:scale-105 ${
                displayMode === "list" ? "flex items-center space-x-4" : ""
              }`}
              onClick={() => handleClick(cso.id)}
            >
              {cso.notifications > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cso.notifications}
                </span>
              )}
              <div
                className={
                  displayMode === "list"
                    ? "w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
                    : "w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center bg-gray-100"
                }
              >
                {!imgError[cso.registrationId] && cso.logo ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}/${cso.logo}`}
                    alt="CSO logo"
                    onError={() =>
                      setImgError((prev) => ({
                        ...prev,
                        [cso.registrationId]: true,
                      }))
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserAlt className="text-gray-400 text-2xl" />
                )}
              </div>

              <div
                className={`${
                  displayMode === "list" ? "flex-1" : "text-center"
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  {cso.csoName}
                </h3>
                <p className="text-sm text-gray-500">
                  Registered: {new Date(cso.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No organizations found. please refresh again.
            {error && <p className="error-text text-center text-red-400">{error}</p>}

          </p>
          
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Csos;
