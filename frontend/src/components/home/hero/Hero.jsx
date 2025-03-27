// Hero.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Hero = () => {
  const slides = [
    {
      image: "/oromia.webp",
      title: "Bishoftu Finance Office",
      description: "Empowering Civil Society Associations",
    },
    {
      image: "/Ethiopia.jpg",
      title: "Community Development",
      description: "Driving Sustainable Change Through Collaboration",
    },
    {
      image: "/bishoftu.jpg",
      title: "Financial Innovation",
      description: "Building Transparent Financial Systems",
    },
  ];

  // Unified gradient styling
  const overlayGradient = "bg-gradient-to-r from-gray-900/90 via-blue-900/50 to-black/90";
  const textGradient = "bg-gradient-to-r from-blue-400 to-purple-300";
  const navHover = "hover:bg-white/20 hover:backdrop-blur-sm";

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 100 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className={`absolute inset-0 ${overlayGradient}`} />
            <img
              src={slides[currentSlide].image}
              alt=""
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative h-full flex flex-col justify-end pb-12 md:pb-20 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl space-y-4 md:space-y-6"
        >
          <h1 className={`text-4xl md:text-6xl font-bold leading-tight ${textGradient} bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl opacity-95 font-medium">
            {slides[currentSlide].description}
          </p>
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 mt-8 md:mt-12">
          <button
            onClick={prevSlide}
            className={`p-2 md:p-3 rounded-full bg-white/10 transition-all ${navHover}`}
            aria-label="Previous slide"
          >
            <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 md:h-2 w-6 md:w-8 rounded-full transition-all ${
                  index === currentSlide 
                    ? "bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className={`p-2 md:p-3 rounded-full bg-white/10 transition-all ${navHover}`}
            aria-label="Next slide"
          >
            <FiChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        {/* Video Embed */}
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 border-2 border-blue-400/30">
            <iframe
              className="w-56 h-32 md:w-72 md:h-40"
              src="https://www.youtube.com/embed/AdDkHmuYWaY"
              title="About Us"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;