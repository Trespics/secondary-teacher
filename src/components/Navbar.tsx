// components/Navbar.tsx
import React, { useState } from 'react';
import './styles/Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">
            <span className="logo-text">Teacher's &nbsp; Portal</span>
          </a>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-links">
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/library" className="nav-link">Library</a></li>
            {/* <li><a href="/features" className="nav-link">Features</a></li> */}
            <li><a href="/contact" className="nav-link">Contact Us</a></li>
          </ul>
          <div className="navbar-buttons">
            <a href="/login" className="btn btn-outline">Login</a>
            {/* <a href="#signup" className="btn btn-primary">Sign Up Free</a> */}
          </div>
        </div>

        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;