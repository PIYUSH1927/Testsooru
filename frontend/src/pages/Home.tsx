import React from 'react';
import "./Home.css";
import { useNavbar } from '../components/NavbarContext';
import { useNavigate } from 'react-router-dom';

const HomeContent: React.FC = () => {
  const { isProfileDropdownOpen } = useNavbar();
  const navigate = useNavigate(); 

  const handleGetStarted = () => {
    const isAuthenticated = localStorage.getItem("access_token") !== null;
    
    if (isAuthenticated) {
      navigate('/projects');
    } else {
      navigate('/LoginPage'); 
    }
  };
  
  return (
    <div className="home-container">
      <div className="home-background-gradient"></div>
      <div className="blueprint-left"></div>
      <div className="content-wrapper">
        <div className="hero-section">
          <h1 className="hero-title">SOORU.AI</h1>
          <h2 className="hero-subtitle">Where Vision Meets Precision!</h2>
          <p className="subtitle">
            Democratizing architecture with generative AI— Sooru allows
            anyone to design & plan their new build or renovation project
            in a few simple steps.
          </p>
          
          <button className="get-started-btn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
        
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
      <div 
        className="blueprint-right" 
        style={{ opacity: isProfileDropdownOpen ? 0 : 1, transition: 'opacity 0.3s ease' }}
      ></div>
    </div>
  );
};

export default HomeContent;