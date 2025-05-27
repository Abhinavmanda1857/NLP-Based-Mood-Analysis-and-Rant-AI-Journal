import React from "react";
import "./RantRedirectButton.css";

const RantRedirectButton = () => {
  const handleRedirect = () => {
    window.open("http://localhost:5173", "_blank");
  };

  return (
    <div
      className="rant-button-wrapper"
      onClick={handleRedirect}
      title="Talk to Rant-AI"
    >
      <svg viewBox="0 0 120 120" className="rant-svg">
        <defs>
          <path
            id="circlePath"
            d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
          />
        </defs>
        <text fill="#fff" fontSize="8" fontWeight="bold">
          <textPath href="#circlePath" startOffset="0%">
            RANT-AI • RANT-AI • RANT-AI •
          </textPath>
        </text>
      </svg>
      <div className="rant-center-icon">🤖</div>
    </div>
  );
};

export default RantRedirectButton;
