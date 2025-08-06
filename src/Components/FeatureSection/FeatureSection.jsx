// src/Components/FeatureSection/FeatureSection.jsx
import React from "react";
import { motion } from "framer-motion";

export default function FeatureSection({
  title,
  text,
  imgSrc,
  imgAlt,
  reverse = false,
  highlightColor = "blue-700",
  factIcon,
  factText,
  snapClass = "",
  minHeight = "",
}) {
  const layout = reverse ? "md:flex-row-reverse" : "md:flex-row";

  return (
    <section className={`${snapClass} ${minHeight} flex items-center justify-center bg-white`}>
      <div className={`max-w-screen-xl w-full flex flex-col ${layout} items-center gap-12 px-6`}>
        
        {/* Image */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false }}
        >
          <img
            src={imgSrc}
            alt={imgAlt}
            loading="lazy"
            className="rounded-xl shadow-lg w-full h-auto max-w-md mx-auto md:mx-0"
          />
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, x: reverse ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: false }}
        >
          <h2 className={`text-3xl sm:text-4xl font-bold text-${highlightColor} mb-4`}>
            {title}
          </h2>
          <p className="text-lg text-gray-700 mb-6">{text}</p>
          {factText && (
            <div
              className={`bg-${highlightColor}-50 border-l-4 border-${highlightColor}-400 text-${highlightColor}-800 p-4 rounded-md shadow-sm text-sm`}
            >
              {factIcon} <strong>Fact:</strong> {factText}
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}
