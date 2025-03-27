import React, { useState } from "react";
import "./Blog.css";
import { Link, useNavigate } from "react-router-dom";
import { dataBlog } from "../data";
const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      image: "/Ethiopia.jpg",
      date: "March 15, 2022",
      author: "Admin",
      title: "The Security Risks of Changing Package Owners",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 2,
      image: "/Ethiopia.jpg",
      date: "March 17, 2022",
      author: "Smith",
      title: "Tips to Protecting Your Business and Family",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 3,
      image: "/Ethiopia.jpg",
      date: "March 19, 2022",
      author: "John",
      title: "Protect Your Workplace from Cyber Attacks",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 4,
      image: "/Ethiopia.jpg",
      date: "March 15, 2022",
      author: "Admin",
      title: "Here are the 5 most telling signs of micromanagement",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 5,
      image: "/Ethiopia.jpg",
      date: "March 17, 2022",
      author: "Smith",
      title: "I Used The Web For A Day On A 50 MB Budget",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 6,
      image: "/Ethiopia.jpg",
      date: "March 15, 2022",
      author: "Admin",
      title: "The Security Risks of Changing Package Owners",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 7,
      image: "/Ethiopia.jpg",
      date: "March 17, 2022",
      author: "Smith",
      title: "Tips to Protecting Your Business and Family",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 8,
      image: "/Ethiopia.jpg",
      date: "March 19, 2022",
      author: "John",
      title: "Protect Your Workplace from Cyber Attacks",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 9,
      image: "/Ethiopia.jpg",
      date: "March 15, 2022",
      author: "Admin",
      title: "Here are the 5 most telling signs of micromanagement",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 10,
      image: "/Ethiopia.jpg",
      date: "March 17, 2022",
      author: "Smith",
      title: "I Used The Web For A Day On A 50 MB Budget",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 11,
      image: "/Ethiopia.jpg",
      date: "March 15, 2022",
      author: "Admin",
      title: "The Security Risks of Changing Package Owners",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 12,
      image: "/Ethiopia.jpg",
      date: "March 17, 2022",
      author: "Smith",
      title: "Tips to Protecting Your Business and Family",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 13,
      image: "/Ethiopia.jpg",
      date: "March 19, 2022",
      author: "John",
      title: "Protect Your Workplace from Cyber Attacks",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 14,
      image: "/Ethiopia.jpg",
      date: "March 15, 2022",
      author: "Admin",
      title: "Here are the 5 most telling signs of micromanagement",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
    {
      id: 15,
      image: "/Ethiopia.jpg",
      date: "March 17, 2022",
      author: "Smith",
      title: "I Used The Web For A Day On A 50 MB Budget",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
      link: "/news/blogdetails",
    },
  ];

  const navigate=useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Calculate the posts to display on the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = dataBlog.slice(indexOfFirstPost, indexOfLastPost);

  // Calculate the total number of pages
  const totalPages = Math.ceil(dataBlog.length / postsPerPage);

  // Set the number of pages to display at once (for example, 3 pages at a time)
  const pageLimit = 3;

  // Calculate the range of pages to display
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Handle page change
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDetail=()=>{
    navigate(`/news/blogdetails/${dataBlog.id}`);
    
  }
  return (
    <>
      <div class="blog-area ptb-80">
        <div class="container">
          <div class=" flex flex-wrap  justify-start pr-0 pl-0 lg:pr-16 lg:pl-16">
            {currentPosts.map((post) => (
              <div key={post.id} className="col-lg-4 col-md-6 flex flex-wrap">
                <div className="single-blog-post">
                  <div className="blog-image">
                    <Link to={post.link}>
                      <img
                        alt={post.title}
                        loading="lazy"
                        width="860"
                        height="700"
                        src={post.image}
                      />
                    </Link>
                    <div className="date flex">
                      {/* Your SVG icon for date */}
                      {post.date}
                    </div>
                  </div>
                  <div className="blog-post-content">
                    <h3>
                    <Link to={`/news/blogdetails/${post.id}`}>{post.title}</Link>
                    {/* <button onClick={handleDetail}>{post.title}</button> */}

                    </h3>
                    <span>
                      By <a href="/blog/#">{post.author}</a>
                    </span>
                    <p>{post.description}</p>
                    <Link className="read-more-btn" to={post.link}>
                      Read More {/* Your arrow icon */}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-lg-12 col-md-12 justify-center">
            <div className="pagination-area">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                  </li>
                  {startPage > 1 && (
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => changePage(1)}
                      >
                        1
                      </button>
                    </li>
                  )}

                  {pageNumbers.map((pageNumber) => (
                    <li
                      key={pageNumber}
                      className={`page-item ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => changePage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  ))}

                  {endPage < totalPages && (
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => changePage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </li>
                  )}
                  <li
                    className={`page-item ${
                      currentPage === Math.ceil(dataBlog.length / postsPerPage)
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={nextPage}
                      disabled={
                        currentPage ===
                        Math.ceil(dataBlog.length / postsPerPage)
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
