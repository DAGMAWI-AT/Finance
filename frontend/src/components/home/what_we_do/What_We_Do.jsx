// WhatWeDo.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaChartLine, FaHandsHelping } from 'react-icons/fa';

const services = [
  {
    icon: <FaBuilding className="w-12 h-12" />,
    title: 'CSO Governance',
    description: 'Strengthening institutional capacity through comprehensive financial frameworks and policy development',
    link: '/services/cso-governance'
  },
  {
    icon: <FaChartLine className="w-12 h-12" />,
    title: 'Financial Advisory',
    description: 'Expert guidance on fiscal responsibility, budget optimization, and transparent reporting systems',
    link: '/services/financial-advisory'
  },
  {
    icon: <FaHandsHelping className="w-12 h-12" />,
    title: 'Community Development',
    description: 'Sustainable initiatives fostering economic growth and resource management in local communities',
    link: '/services/community-development'
  }
];

const ServiceCard = ({ service, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ delay: index * 0.2 }}
    className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
  >
    <div className="text-blue-600 dark:text-blue-400 mb-6 transition-transform group-hover:-translate-y-2">
      {service.icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
      {service.title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
      {service.description}
    </p>
    <a
      href={service.link}
      className="inline-flex items-center font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
    >
      Discover More
      <svg
        className="w-4 h-4 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    </a>
  </motion.div>
);

const WhatWeDo = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Strategic Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Delivering transformative financial solutions that empower organizations and drive community progress
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;