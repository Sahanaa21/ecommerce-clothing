import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroBanner = () => {
  return (
    <div className="bg-gradient-to-r from-rose-100 via-white to-sky-100 py-12 px-6 shadow-inner">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 items-center gap-10">

        {/* 👩 Her Section */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center md:items-start"
        >
          <img
            src="/images/her-model.png"
            alt="Shop Her"
            className="w-56 h-80 object-cover rounded-2xl shadow-xl hover:scale-105 transition"
          />
          <Link
            to="/?category=Women"
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full font-medium transition"
          >
            💃 Shop Her
          </Link>
        </motion.div>

        {/* 💬 Center Text */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center px-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Style That Speaks You 
          </h1>
          <p className="text-gray-700 text-base md:text-lg max-w-md mx-auto">
            Upload your own designs, preview on real mockups, and wear what you love.
          </p>
        </motion.div>

        {/* 👦 Him Section */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center md:items-end"
        >
          <img
            src="/images/him-model.png"
            alt="Shop Him"
            className="w-56 h-80 object-cover rounded-2xl shadow-xl hover:scale-105 transition"
          />
          <Link
            to="/?category=Men"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition"
          >
            🧥 Shop Him
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default HeroBanner;
