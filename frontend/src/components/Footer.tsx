import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Sooru.AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;