import React from 'react';
import "./Home.css";

const HomeContent: React.FC = () => {
  return (
    <div className="home-container">
      <div className="blueprint-left"></div>
      {/* Main Content Container */}
      <div className="content-wrapper">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">SOORU.AI</h1>
          <h2 className="hero-subtitle">Where Vision Meets Precision!</h2>
          <p className="subtitle">
            Democratizing architecture with generative AI— Maket allows
            anyone to design & plan their new build or renovation project
            in a few simple steps.
          </p>
          
          <button className="get-started-btn">Get Started</button>
        </div>
        
        {/* Building Visualization with YouTube Video */}
        <div className="building-visual-container">
          <iframe 
            src="https://www.youtube.com/embed/VPaeZWgt4TI?si=7PfsYS18afDDbr6_" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="blueprint-right"></div>
    </div>
  );
};

export default HomeContent;