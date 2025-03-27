import React, { useState } from "react";
import "./BlogDetail.css"
import { dataBlog } from "../data";
import { useParams } from "react-router";
import {  LineStyle, ListAltOutlined, Person, TimerOutlined } from "@mui/icons-material";

const BlogDetails = () => {
  const { id } = useParams();
  const currentId = parseInt(id);
  const blog = dataBlog.find((p) => p.id === currentId);
  const currentIndex = dataBlog.findIndex((p) => p.id === currentId);
  const prevBlog = dataBlog[(currentIndex - 1 + dataBlog.length) % dataBlog.length];
  const nextBlog = dataBlog[(currentIndex + 1) % dataBlog.length];

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter blogs based on search query
  const filteredBlogs = dataBlog.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedBlogs = [...dataBlog].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Get the most recent 4 blogs
  const recentBlogs = sortedBlogs.slice(0, 4);
  return (
    <>
      <div className="page-title-area">
        <div className="d-table">
          <div className="d-table-cell">
            <div className="container">
              <h2>Blog Details</h2>
            </div>
          </div>
        </div>

        <div className="shape1">
          <img
            alt="shape"
            loading="lazy"
            width="202"
            height="202"
            decoding="async"
            data-nimg="1"
            src="/shape1.png"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="shape2 rotateme">
          <img
            alt="shape"
            loading="lazy"
            width="22"
            height="22"
            decoding="async"
            data-nimg="1"
            src="/shape2.svg"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="shape3">
          <img
            alt="shape"
            loading="lazy"
            width="28"
            height="28"
            decoding="async"
            data-nimg="1"
            src="/shape3.svg"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="shape4">
          <img
            alt="shape"
            loading="lazy"
            width="21"
            height="20"
            decoding="async"
            data-nimg="1"
            src="/shape4.svg"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="shape5">
          <img
            alt="shape"
            loading="lazy"
            width="182"
            height="146"
            decoding="async"
            data-nimg="1"
            src="/shape5.png"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="shape6 rotateme">
          <img
            alt="shape"
            loading="lazy"
            width="21"
            height="20"
            decoding="async"
            data-nimg="1"
            src="/shape4.svg"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="shape7">
          <img
            alt="shape"
            loading="lazy"
            width="21"
            height="20"
            decoding="async"
            data-nimg="1"
            src="/shape4.svg"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="shape8 rotateme">
          <img
            alt="shape"
            loading="lazy"
            width="22"
            height="22"
            decoding="async"
            data-nimg="1"
            src="/shape2.svg"
            style={{ color: "transparent" }}
          />
        </div>
      </div>


      <div className="blog-details-area lg:p-12 md:p:12">
        <div className="container">
          <div className="flex flex-wrap">
            <div className="lg:w-2/3 md:w-full p-4 lg:p-8 md:p-8">
              <div className="blog-details-desc">
                <div className="article-image">
                  <img
                    alt="image"
                    loading="lazy"
                    width="860"
                    height="700"
                    decoding="async"
                    data-nimg="1"
                    style={{ color: "transparent" }}
                    src={blog.image}
                  />
                </div>
                <div className="article-content">
                  <div className="entry-meta">
                    <ul className="flex space-x-4">
                      <li className="flex items-center space-x-2">
                         <TimerOutlined/>
                        <time>{blog.date}</time>
                      </li>
                      <li className="flex items-center space-x-2">
                          <Person/>
                        <a href="/news/blogdetails/:id" className="text-blue-500 hover:underline">
                          {blog.author}
                        </a>
                      </li>
                    </ul>
                  </div>

                  <h2>{blog.title}</h2>
                  <p>
                    {blog.description}
                  </p>
                  <blockquote>
                    <p>
                      {blog.quetes}
                    </p>
                    <cite>Tom Cruise</cite>
                  </blockquote>
                  <p>
                    Quuntur magni dolores eos qui ratione voluptatem sequi
                    nesciunt. Neque porro quia non numquam eius modi tempora
                    incidunt ut labore et dolore magnam dolor sit amet,
                    consectetur adipisicing.
                  </p>

                  <h3>Four major elements that we offer:</h3>
                  <ul className="features-list">
                    <li>
                     <ListAltOutlined/>
                      Scientific Skills For getting a better result
                    </li>
                  </ul>

                </div>
                <div className="article-footer">
                  <div className="article-tags">
                    <a href="/news/blogdetails/:id">News</a>
                    <a href="/news/blogdetails/:id">About</a>
                    <a href="/news/blogdetails/:id">All CSOs</a>
                    <a href="/news/blogdetails/:id">Service</a>
                    <a href="/news/blogdetails/:id">Contact</a>
                  </div>
                </div>
                <div className="startp-post-navigation">
                  <div className="prev-link-wrapper">
                    <div className="info-prev-link-wrapper">
                      <a href={`/news/blogdetails/${prevBlog.id}`}>
                        <span className="image-prev">
                          <img
                            alt="image"
                            loading="lazy"
                            width="860"
                            height="700"
                            decoding="async"
                            data-nimg="1"
                            style={{ color: "transparent" }}
                            src={prevBlog.image} />
                          <span className="post-nav-title">Prev</span>
                        </span>
                        <span className="prev-link-info-wrapper">
                          <span className="prev-title">{prevBlog.title}
                          </span>
                          <span className="meta-wrapper">
                            <span className="date-post">{nextBlog.date}</span>
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                  <div className="next-link-wrapper">
                    <div className="info-next-link-wrapper">
                      <a href={`/news/blogdetails/${nextBlog.id}`}>
                        <span className="next-link-info-wrapper">
                          <span className="next-title">{nextBlog.title}
                          </span>
                          <span className="meta-wrapper">
                            <span className="date-post">{nextBlog.date}</span>
                          </span>
                        </span>
                        <span className="image-next">
                          <img
                            alt="image"
                            loading="lazy"
                            width="860"
                            height="700"
                            decoding="async"
                            data-nimg="1"
                            style={{ color: "transparent" }}
                            src={nextBlog.image}
                          />
                          <span className="post-nav-title">Next</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="comments-area">
                  <h3 className="comments-title">2 Comments:</h3>
                  <ol className="comment-list">
                    <li className="comment">
                      <article className="comment-body">
                        <footer className="comment-meta">
                          <div className="comment-author vcard">
                            <img
                              alt="image"
                              loading="lazy"
                              width="95"
                              height="95"
                              decoding="async"
                              data-nimg="1"
                              className="avatar"
                              style={{ color: "transparent" }}
                              src="/Ethiopia.jpg"
                            />
                            <b className="fn">John Jones</b>
                            <span className="says">says:</span>
                          </div>
                          <div className="comment-metadata">
                            April 24, 2019 at 10:59 am
                          </div>
                        </footer>
                        <div className="comment-content">
                          <p>
                            Lorem Ipsum has been the industry’s standard dummy
                            text ever since the 1500s, when an unknown printer
                            took a galley of type and scrambled it to make a
                            type specimen.
                          </p>
                        </div>
                        <div className="reply">
                          <a
                            className="comment-reply-link"
                            href="/blog/blog-details/#"
                          >
                            Reply
                          </a>
                        </div>
                      </article>
                      <ol className="children">
                        <li className="comment">
                          <article className="comment-body">
                            <footer className="comment-meta">
                              <div className="comment-author vcard">
                                <img
                                  alt="image"
                                  loading="lazy"
                                  width="95"
                                  height="95"
                                  decoding="async"
                                  data-nimg="1"
                                  className="avatar"
                                  style={{ color: "transparent" }}
                                  src="/Ethiopia.jpg"
                                />
                                <b className="fn">Steven Smith</b>
                                <span className="says">says:</span>
                              </div>
                              <div className="comment-metadata">
                                April 24, 2019 at 10:59 am
                              </div>
                            </footer>
                            <div className="comment-content">
                              <p>
                                Lorem Ipsum has been the industry’s standard
                                dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it
                                to make a type specimen.
                              </p>
                            </div>
                            <div className="reply">
                              <a
                                className="comment-reply-link"
                                href="/blog/blog-details/#"
                              >
                                Reply
                              </a>
                            </div>
                          </article>
                        </li>
                        <ol className="children">
                          <li className="comment">
                            <article className="comment-body">
                              <footer className="comment-meta">
                                <div className="comment-author vcard">
                                  <img
                                    alt="image"
                                    loading="lazy"
                                    width="95"
                                    height="95"
                                    decoding="async"
                                    data-nimg="1"
                                    className="avatar"
                                    style={{ color: "transparent" }}
                                    src="/Ethiopia.jpg"
                                  />
                                  <b className="fn">Sarah Taylor</b>
                                  <span className="says">says:</span>
                                </div>
                                <div className="comment-metadata">
                                  April 24, 2019 at 10:59 am
                                </div>
                              </footer>
                              <div className="comment-content">
                                <p>
                                  Lorem Ipsum has been the industry’s standard
                                  dummy text ever since the 1500s, when an
                                  unknown printer took a galley of type and
                                  scrambled it to make a type specimen.
                                </p>
                              </div>
                              <div className="reply">
                                <a
                                  className="comment-reply-link"
                                  href="/blog/blog-details/#"
                                >
                                  Reply
                                </a>
                              </div>
                            </article>
                          </li>
                        </ol>
                      </ol>
                    </li>
                    <li className="comment">
                      <article className="comment-body">
                        <footer className="comment-meta">
                          <div className="comment-author vcard">
                            <img
                              alt="image"
                              loading="lazy"
                              width="95"
                              height="95"
                              decoding="async"
                              data-nimg="1"
                              className="avatar"
                              style={{ color: "transparent" }}
                              src="/Ethiopia.jpg"
                            />
                            <b className="fn">John Doe</b>
                            <span className="says">says:</span>
                          </div>
                          <div className="comment-metadata">
                            April 24, 2019 at 10:59 am
                          </div>
                        </footer>
                        <div className="comment-content">
                          <p>
                            Lorem Ipsum has been the industry’s standard dummy
                            text ever since the 1500s, when an unknown printer
                            took a galley of type and scrambled it to make a
                            type specimen.
                          </p>
                        </div>
                        <div className="reply">
                          <a
                            className="comment-reply-link"
                            href="/blog/blog-details/#"
                          >
                            Reply
                          </a>
                        </div>
                      </article>
                      <ol className="children">
                        <li className="comment">
                          <article className="comment-body">
                            <footer className="comment-meta">
                              <div className="comment-author vcard">
                                <img
                                  alt="image"
                                  loading="lazy"
                                  width="95"
                                  height="95"
                                  decoding="async"
                                  data-nimg="1"
                                  className="avatar"
                                  style={{ color: "transparent" }}
                                  src="/Ethiopia.jpg"
                                />
                                <b className="fn">James Anderson</b>
                                <span className="says">says:</span>
                              </div>
                              <div className="comment-metadata">
                                April 24, 2019 at 10:59 am
                              </div>
                            </footer>
                            <div className="comment-content">
                              <p>
                                Lorem Ipsum has been the industry’s standard
                                dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it
                                to make a type specimen.
                              </p>
                            </div>
                            <div className="reply">
                              <a
                                className="comment-reply-link"
                                href="/blog/blog-details/#"
                              >
                                Reply
                              </a>
                            </div>
                          </article>
                        </li>
                      </ol>
                    </li>
                  </ol>
                  <div className="comment-respond">
                    <h3 className="comment-reply-title">Leave a Reply</h3>
                    <form className="comment-form">
                      <p className="comment-notes">
                        <span id="email-notes">
                          Your email address will not be published.
                        </span>
                        Required fields are marked
                        <span className="required">*</span>
                      </p>
                      <p className="comment-form-comment">
                        <label>Comment</label>
                        <textarea
                          name="comment"
                          id="comment"
                          cols="45"
                          rows="5"
                          maxlength="65525"
                          placeholder="write this ........"
                          required=""
                        ></textarea>
                      </p>
                      <p className="comment-form-author">
                        <label>
                          Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="author"
                          name="author"
                          required=""
                        />
                      </p>
                      <p className="comment-form-email">
                        <label>
                          Email <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="email"
                          required=""
                        />
                      </p>
                      <p className="comment-form-url">
                        <label>Website</label>
                        <input type="url" id="url" name="url" />
                      </p>
                      <p className="comment-form-cookies-consent">
                        <input
                          type="checkbox"
                          name="comment-cookies-consent"
                          id="comment-cookies-consent"
                          value="yes"
                        />
                        <label for="comment-cookies-consent">
                          Save my name, email, and website in this browser for
                          the next time I comment.
                        </label>
                      </p>

                      <p className="form-submit">
                        <input
                          type="submit"
                          name="submit"
                          id="submit"
                          className="submit w-44"
                          value="Post Comment"
                        />
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3 p-8">
              <div className="widget-area" id="secondary">
                <div className="widget widget_search">
                  <form className="search-form" onSubmit={(e) => {
                    e.preventDefault();
                  }}>
                    <label>
                      <input
                        type="search"
                        className="search-field"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </label>
                    <button type="submit">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </form>
                </div>
                {searchQuery && (
                  <div className="search-results">
                    <h2 className="font-serif text-gray-400">Search Results:</h2>
                    {filteredBlogs.length > 0 ? (
                      <ul>
                        {filteredBlogs.map((blog) => (
                          <li key={blog.id}>
                            <article className="item flex p-2">
                              <a className="thumb" href={`/news/blogdetails/${blog.id}`}>

                                <img src={blog.image} className="max-w-20 h-16 p-2" />
                              </a>
                              <div className="info p-1">
                                <h4 className="title usmall">
                                  <a href={`/news/blogdetails/${blog.id}`}>{blog.title}</a>
                                </h4>
                                <time>{blog.date || "Unknown Date"}</time>

                              </div>
                              <div className="clear"></div>
                            </article>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No blogs found for...</p>
                    )}
                  </div>
                )}

                <div className="widget widget_startp_posts_thumb">
                  <h3 className="widget-title">Recent Posts</h3>
                  {recentBlogs.map((blog) => (
                    <article className="item" key={blog.id}>
                      <a className="thumb" href={`/news/bologdetails/${blog.id}`}>
                        <span
                          className="fullimage cover"
                          role="img"
                          style={{
                            backgroundImage: `url(${blog.image || "/default.jpg"})`,
                          }}
                        ></span>
                      </a>
                      <div className="info">
                        <time>{blog.date || "Unknown Date"}</time>
                        <h4 className="title usmall">
                          <a href={`/news/bologdetails/${blog.id}`}>{blog.title}</a>
                        </h4>
                      </div>
                      <div className="clear"></div>
                    </article>
                  ))}

                </div>
                <div className="widget widget_tag_cloud">
                  <h3 className="widget-title">Tags</h3>
                  <div className="tagcloud">
                    <a href="/blog/">
                      IT <span className="tag-link-count">(3)</span>
                    </a>
                    <a href="/blog/">
                      Spacle <span className="tag-link-count">(3)</span>
                    </a>
                    <a href="/blog/">
                      Rule <span className="tag-link-count">(2)</span>
                    </a>
                    <a href="/blog/">
                      News <span className="tag-link-count">(2)</span>
                    </a>
                    <a href="/blog/">
                      Travel <span className="tag-link-count">(1)</span>
                    </a>
                    <a href="/blog/">
                      Smart <span className="tag-link-count">(1)</span>
                    </a>
                    <a href="/blog/">
                      Meeting <span className="tag-link-count">(1)</span>
                    </a>
                    <a href="/blog/">
                      Tips <span className="tag-link-count">(2)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
