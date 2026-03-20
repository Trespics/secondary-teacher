import React, { useState } from 'react';
import './styles/Footer.css';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaArrowUp,
  FaHeart
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const response = await fetch('http://localhost:5000/api/public/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      console.error('Newsletter error:', error);
    }
  };

  return (
    <footer id="contact" className="footer">
      {/* Wave Decoration */}
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="footer-container">
        {/* Back to Top Button */}
        <button 
          className="back-to-top" 
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>

        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section brand-section">
            <h3 className="footer-logo">
            Trespics
            </h3>
            <p className="footer-description">
              Empowering educators with modern tools for better learning outcomes. 
              Join thousands of teachers who trust our platform.
            </p>
            
            {/* Newsletter Signup */}
            <div className="newsletter">
              <h5 className="newsletter-title">Subscribe to our newsletter</h5>
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
                  placeholder="Enter your email" 
                  className="newsletter-input"
                  aria-label="Email for newsletter"
                  disabled={status === 'loading'}
                  required
                />
                <button type="submit" className="newsletter-button" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>

            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">
              <span className="title-underline">Quick Links</span>
            </h4>
            <ul className="footer-links">
              <li><a href="#library"><span className="link-arrow">→</span> Library</a></li>
              {/* <li><a href="#features"><span className="link-arrow">→</span> Features</a></li> */}
              {/* <li><a href="#pricing"><span className="link-arrow">→</span> Pricing</a></li> */}
              <li><a href="/about"><span className="link-arrow">→</span> About Us</a></li>
              {/* <li><a href="#blog"><span className="link-arrow">→</span> Blog</a></li> */}
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h4 className="footer-title">
              <span className="title-underline">Support</span>
            </h4>
            <ul className="footer-links">
              <li><a href="/contact"><span className="link-arrow">→</span> Help Center</a></li>
              {/* <li><a href="#faq"><span className="link-arrow">→</span> FAQ</a></li> */}
              <li><a href="/privacy-policy"><span className="link-arrow">→</span> Privacy Policy</a></li>
              <li><a href="/terms-of-service"><span className="link-arrow">→</span> Terms of Service</a></li>
              {/* <li><a href="#cookies"><span className="link-arrow">→</span> Cookie Policy</a></li> */}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-section">
            <h4 className="footer-title">
              <span className="title-underline">Contact Us</span>
            </h4>
            <ul className="contact-info">
              <li>
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-detail">
                  <span className="contact-label">Email</span>
                  <a href="mailto:info@eduportal.com">info@eduportal.com</a>
                </div>
              </li>
              <li>
                <div className="contact-icon">
                  <FaPhone />
                </div>
                <div className="contact-detail">
                  <span className="contact-label">Phone</span>
                  <a href="tel:+15551234567">+1 (555) 123-4567</a>
                </div>
              </li>
              <li>
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="contact-detail">
                  <span className="contact-label">Office</span>
                  <span>123 Education St, CA 94105</span>
                </div>
              </li>
            </ul>

            {/* Business Hours */}
            {/* <div className="business-hours">
              <h5 className="hours-title">Business Hours</h5>
              <p className="hours-text">Mon - Fri: 9:00 AM - 6:00 PM</p>
              <p className="hours-text">Sat - Sun: Closed</p>
            </div> */}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} Trespics. 
              <span className="copyright-highlight"> All rights reserved.</span>
            </p>
            
            {/* <div className="bottom-links">
              <a href="#sitemap">Sitemap</a>
              <span className="separator">|</span>
              <a href="#accessibility">Accessibility</a>
              <span className="separator">|</span>
              <a href="#cookies">Cookies</a>
            </div> */}

            <p className="made-with">
              Made with <FaHeart className="heart-icon" /> for educators worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="footer-pattern"></div>
    </footer>
  );
};

export default Footer;