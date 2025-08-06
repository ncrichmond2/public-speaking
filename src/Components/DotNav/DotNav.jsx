// src/Components/DotNav/DotNav.jsx
import React, { useEffect, useState } from "react";

export default function DotNav({ sections }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // filter out any nulls just in case
    const elems = sections.filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );
        if (visible[0]) {
          setActive(elems.indexOf(visible[0].target));
        }
      },
      { root: null, threshold: 0.5 }
    );

    elems.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-2 z-50">
      {sections.map((el, i) => (
        <button
          key={i}
          onClick={() =>
            el && el.scrollIntoView({ behavior: "smooth" })
          }
          className={`w-3 h-3 rounded-full transition-colors ${
            i === active
              ? "bg-blue-600"
              : "bg-gray-300 hover:bg-gray-500"
          }`}
          aria-label={`Go to section ${i + 1}`}
        />
      ))}
    </div>
  );
}
