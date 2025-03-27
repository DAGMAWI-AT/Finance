import React, { useEffect, useState } from 'react';
import "./News.css";
import Blog from './Blog';

const News = () => {
    const [newsArticles] = useState([
        {
            id: 1,
            title: "Civic Society Association",
            description: "All civic society associations have an urgent meeting in Bisofftu.",
            date: "2024-12-08T08:00:00Z",
            author: "Dagmawi",
            image: "https://via.placeholder.com/800x400",
            url: "https://www.example.com/news3"
        },
        {
            id: 2,
            title: "Civic Society Association",
            description: "All civic society associations have an urgent meeting in Bisofftu.",
            date: "2024-12-08T08:00:00Z",
            author: "Dagmawi",
            image: "https://via.placeholder.com/800x400",
            url: "https://www.example.com/news3"
        },
        {
            id: 3,
            title: "Civic Society Association",
            description: "All civic society associations have an urgent meeting in Bisofftu.",
            date: "2024-12-08T08:00:00Z",
            author: "Dagmawi",
            image: "https://via.placeholder.com/800x400",
            url: "https://www.example.com/news3"
        },
        {
            id: 4,
            title: "Civic Society Association",
            description: "All civic society associations have an urgent meeting in Bisofftu.",
            date: "2024-12-08T08:00:00Z",
            author: "Dagmawi",
            image: "https://via.placeholder.com/800x400",
            url: "https://www.example.com/news3"
        },
    ]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Format the date (e.g., '12/11/2024')
    };

    useEffect(() => {
        // Function to generate snowflakes
        const createSnowflakes = () => {
            const snowContainer = document.querySelector('.heros');
            if (snowContainer) {
                const numberOfSnowflakes = 50; // Number of snowflakes to generate

                for (let i = 0; i < numberOfSnowflakes; i++) {
                    const snowflake = document.createElement('div');
                    snowflake.classList.add('snowflake');

                    // Randomize the size and position of each snowflake
                    snowflake.style.left = `${Math.random() * 100}vw`;
                    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`; // Random fall speed
                    snowflake.style.animationDelay = `${Math.random() * 5}s`; // Random delay

                    snowContainer.appendChild(snowflake);
                }
            }
        };

        createSnowflakes(); // Call the function to create snowflakes

        // Clean up snowflakes on component unmount
        return () => {
            const snowContainer = document.querySelector('.heros');
            if (snowContainer) {
                while (snowContainer.firstChild) {
                    snowContainer.removeChild(snowContainer.firstChild);
                }
            }
        };
    }, []); // Empty dependency array means it runs once when the component mounts

    return (
        <>
            <section className="news_hero relative h-[300px] flex items-center justify-center text-center text-white">
                <div className='heros'></div>
                <div className="hero-content mt-10 p-16">
                    <h2 className="mt-20 text-2xl text-gray-400 font-semibold z-10">News of Finance Office</h2>
                    <p className="z-10 text-sm">Finance report for all Civic Society Associations</p>
                    <button className="cta-button rounded-lg px-3 py-4 mt-4 z-10 bg-yellow-500 text-white hover:bg-yellow-600">
                        Contact
                    </button>
                </div>
            </section>

            {/* <div className="container mx-auto px-16 py-16">
                <h1 className="text-4xl font-semibold text-center text-gray-800 mb-6">Latest News</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {newsArticles.map((article) => (
                        <div
                            key={article.id}
                            className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            {article.image ? (
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <div className="bg-gray-300 h-48 flex justify-center items-center">
                                    <p className="text-white text-xl">Image not available</p>
                                </div>
                            )}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h2>
                                <p className="text-gray-700 mb-4">{article.description}</p>
                                <p className="text-sm text-gray-500">
                                    <span>By: {article.author || 'Unknown'}</span> |{' '}
                                    <span>{formatDate(article.date) || 'No Date Available'}</span>
                                </p>
                                <a
                                    href={article.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-4 text-blue-500 hover:underline"
                                >
                                    Read More
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
            <Blog/>
        </>
    );
};

export default News;
