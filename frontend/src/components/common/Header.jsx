import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBars } from "react-icons/fa";
import { navLinks } from "./../data";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bgColor = getComputedStyle(entry.target).backgroundColor;
            setIsDarkBackground(isColorDark(bgColor));
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    const firstSection = document.querySelector("#hero-section");
    if (firstSection) observer.observe(firstSection);

    return () => {
      if (firstSection) observer.unobserve(firstSection);
    };
  }, []);

  const isColorDark = (rgbColor) => {
    const [r, g, b] = rgbColor.match(/\d+/g).map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance <= 0.5;
  };

  const textColor = isScrolled || !isDarkBackground ? "text-gray-500" : "text-gray-800";
  const iconColor = isScrolled || !isDarkBackground ? "text-gray-700" : "text-gray-300";

  const menuButtonHover = isScrolled
    ? "hover:bg-gray-100"
    : isDarkBackground
    ? "hover:bg-white/20"
    : "hover:bg-gray-900/20";

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white bg-opacity-90 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center">
            <img src="/logo3.png" alt="Company Logo" className="h-12" />
          </Link>
          <span className={`text-xl font-bold ${textColor}`}>Bishoftu Finance</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 relative">
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.path;
            return (
              <div key={index} className="relative">
                <Link
                  to={link.path}
                  className={`font-medium text-lg relative ${
                    location.pathname === link.path
                      ? "text-blue-500 font-semibold"
                      : "text-gray-400 hover:text-gray-500"
                  }`}                >
                  {link.text}
                </Link>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 bottom-[-4px] h-[2px] bg-blue-500 w-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden p-2 rounded-full transition-colors ${menuButtonHover}`}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <FaTimes className={`w-5 h-5 ${iconColor}`} />
          ) : (
            <FaBars className={`w-5 h-5 ${iconColor}`} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
              closed: { x: "100%", transition: { duration: 0.3 } },
            }}
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg md:hidden"
          >
            <div className="p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close Menu"
              >
                <FaTimes className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <ul className="flex flex-col space-y-4 p-4">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={index} className="relative">
                    <Link
                      to={link.path}
                      className={`font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.text}
                    </Link>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicatorMobile"
                        className="absolute left-0 bottom-[-2px] h-[2px] bg-blue-500 w-full"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
