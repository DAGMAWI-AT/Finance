import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Example news data
export const news = [
  {
    id: 1,
    news: "The Korean Volunteer Organization (KVO) in Ethiopia was founded with the mission to empower communities through sustainable development initiatives focused on education, health, and community service.",
    date: "1/2/2025",
    img:'/kvo.png'
  },
  {
    id: 2,
    news: "The Ethiopian Youth Empowerment Program (EYEP) promotes education, employment, and social skills development among young people in Ethiopia.",
    date: "1/15/2025",
    // img: "/logo192.png",
  },
  // Additional news items as needed
];

function Main() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Function to go to the next news item, wrapping around to the beginning if needed
  const handleNext = () => {
    setCurrentNewsIndex((prevIndex) =>
      prevIndex < news.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePrev = () => {
    setCurrentNewsIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : news.length - 1
    );
  };

  // Set up auto-rotation using useEffect and setInterval
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // 5000ms = 5 seconds, adjust the delay as desired

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const { img, news: newsContent, date } = news[currentNewsIndex];

  return (
    <main
      style={{
        flex: 1,
        padding: "10px",
        background: "#fbf5df",
        border: "2px solid #ddd",
        margin: "4px",
        marginTop:"100px"
      }}
    >
      <section style={{ marginBottom: "20px" }}>
        <h2>News</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #ddd",
            padding: "10px",
            background: "#f0f8ff",
            // width: "95%", // Set fixed width
            height: "300px", // Set fixed height for the container
            overflow: "hidden", 
            marginRight:'10px'// Prevent content from overflowing the container
          }}
        >
          <button onClick={handlePrev}>{"<"}</button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              height: "100%", // Content will stretch to fill the container
              padding: "10px",
            }}
          >
            <Link
              to={`/news/${news[currentNewsIndex].id}`}
              style={{
                display: "flex",
                color: "#333",
                textDecoration: "none",
                alignItems: "center",
                height: "100%",
              }}
            >
              {img && (
                <img
                  src={img}
                  alt="News Image"
                  style={{
                    width: "20%",
                    height: "auto",
                    margin: "10px",
                  }}
                />
              )}
              <h3 style={{ marginLeft: "10px", padding: "20px" }}>
                {newsContent.substring(0, 1000)}...
              </h3>
            </Link>
            <p style={{ fontSize: "0.9em", color: "#555" }}>{date}</p>
          </div>
          <button onClick={handleNext}>{">"}</button>
        </div>
      </section>

      <section style={{ marginBottom: "20px",background:'#f0f8ff', padding:'20px' }}>
        <h2>Meeting Schedule</h2>
        <p>Monday 10PM for this reason</p>
      </section>
    </main>
  );
}

export default Main;
