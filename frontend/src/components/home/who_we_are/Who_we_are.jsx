// WhoWeAre.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';

const WhoWeAre = () => {
  const [videoState, setVideoState] = useState({
    playing: false,
    played: 0,
  });

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Empowering Communities Through Financial Excellence
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            As Bishoftu's premier financial governance institution, we champion
            transparency and accountability in public finance management. Our
            innovative solutions and collaborative approach drive sustainable
            community development.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105">
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-xl"
        >
          {!videoState.playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-blue-600/30 to-purple-600/30">
              <button
                onClick={() => setVideoState({ ...videoState, playing: true })}
                className="p-6 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all animate-pulse"
              >
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          )}
          
          {videoState.playing && (
            <YouTube
              videoId="KmXlYV3orfU"
              opts={opts}
              className="absolute inset-0 w-full h-full"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAre;