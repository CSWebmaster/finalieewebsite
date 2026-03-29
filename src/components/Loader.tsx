import React from "react";
import "./loader.css";

const Loader = () => {
  return (
    <div className="loader-wrapper">
      {/* Logo — light-mode version works on white bg */}
      <img
        loading="eager"
        src="http://ieee.socet.edu.in/wp-content/uploads/2025/09/N_Wedge-removebg-preview.png"
        alt="IEEE SOU SB"
        className="loader-logo"
      />

      {/* Three bouncing dots — preserved animation */}
      <div className="dots-container">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="dot"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loader;
