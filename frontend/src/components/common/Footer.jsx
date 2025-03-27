// Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt
} from "react-icons/fa";

const Footer = () => {
  const links = [
    {
      title: "Company",
      items: [
        { name: "About Us", path: "/about" },
        { name: "Services", path: "/services" },
        { name: "CSAs", path: "/csas" },
        { name: "News", path: "/news" },
      ]
    },
    {
      title: "Support",
      items: [
        { name: "FAQ", path: "/faq" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms", path: "/terms" },
        { name: "Contact", path: "/contact" },
      ]
    }
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/logo3.png"
                alt="Logo"
                className="w-10 h-10 rounded-lg shadow-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bishoftu Finance
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Empowering financial transparency and community development through 
              innovative governance solutions.
            </p>
          </div>

          {links.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Contact
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                <span className="text-gray-600 dark:text-gray-400">
                  Bishoftu, Oromia, Ethiopia
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <a href="mailto:info@example.com" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  csos@bishoftu.gov
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhoneAlt className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <a href="tel:+2510000000" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  +251 000 0000
                </a>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <a href="#" className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                <FaFacebook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                <FaTwitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                <FaInstagram className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                <FaLinkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Bishoftu Finance Office. All rights reserved.
            <br />
            Developed by{" "}
            <a 
              href="https://dagmawiamare.netlify.app" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              korean international organization (KVO)
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;