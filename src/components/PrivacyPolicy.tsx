import React from 'react';
import './styles/PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
  // Get current date for effective date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="policy-container">
      <div className="document-wrapper">
        {/* Header Section */}
        <div className="document-header">
          <div className="header-line"></div>
          <h1>PRIVACY POLICY</h1>
          <div className="document-id">
            <span className="id-label">Document ID:</span> PP-CBC-2024-001
          </div>
          <div className="effective-date">
            <span className="date-label">Effective Date:</span> {currentDate}
          </div>
          <div className="last-updated">
            <span className="update-label">Last Updated:</span> {currentDate}
          </div>
          <div className="header-line bottom"></div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <p className="welcome-text">
            Welcome to <span className="platform-name">[Insert System Name]</span>. We are committed to 
            protecting the privacy and security of our users, especially our students, teachers, and parents. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
            you visit our platform.
          </p>
          <p className="emphasis-text">
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy 
            policy, please do not access the Platform.
          </p>
        </div>

        {/* Section 1 */}
        <div className="policy-section">
          <h2>1. WHO WE ARE</h2>
          <p>
            <span className="platform-name">[Insert System Name]</span> (referred to as "we", "us", or "our") 
            is an eLearning platform designed specifically to support the Competency-Based Curriculum (CBC) 
            by connecting teachers and students through digital resources.
          </p>
          <div className="section-divider"></div>
        </div>

        {/* Section 2 */}
        <div className="policy-section">
          <h2>2. INFORMATION WE COLLECT</h2>
          <p>We collect information from you when you register on the Platform, upload materials, or interact with the content. The information we collect may include:</p>
          
          <h3>a. Personal Data</h3>
          <ul>
            <li><strong>For Teachers:</strong> Full Name, Professional ID Number (optional), Email Address, Phone Number, Subjects Taught, Grade Levels, and School Affiliation.</li>
            <li><strong>For Students:</strong> Full Name, Grade/Class Level, Admission Number (optional), and Parent/Guardian Email (for consent purposes).</li>
            <li><strong>For Parents/Guardians:</strong> Full Name, Email Address, Phone Number, and Relation to the student.</li>
          </ul>

          <h3>b. Derivative Data</h3>
          <p>Our servers automatically collect information when you access the Platform, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Platform.</p>

          <h3>c. Financial Data</h3>
          <p>If you purchase a subscription or access premium features, we may collect payment data (such as credit card number or bank account details) via our secure payment processors. We do not store your financial data on our servers.</p>

          <h3>d. Data from Teachers (Uploaded Content)</h3>
          <p>Teachers may upload documents, PDFs, videos, and lesson plans. These materials may contain metadata (e.g., the author's name, creation date).</p>
          <div className="section-divider"></div>
        </div>

        {/* Section 3 */}
        <div className="policy-section">
          <h2>3. HOW WE COLLECT INFORMATION</h2>
          <p>We collect information:</p>
          <ul>
            <li><strong>Directly from you</strong> when you fill out registration forms.</li>
            <li><strong>Automatically</strong> as you navigate the site (cookies, log files).</li>
            <li><strong>From Teachers</strong> regarding student performance and submissions.</li>
          </ul>
          <div className="section-divider"></div>
        </div>

        {/* Section 4 */}
        <div className="policy-section">
          <h2>4. HOW WE USE YOUR INFORMATION</h2>
          <p>Having accurate information about you permits us to provide a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
          <ul>
            <li><strong>Facilitate account creation</strong> and logon process for both Teachers and Students.</li>
            <li><strong>Deliver educational content</strong> (e.g., sending uploaded reading materials to the appropriate student grade levels).</li>
            <li><strong>Manage user roles</strong> (ensuring teachers can only edit their own content, and students can only view assigned content).</li>
            <li><strong>Track academic progress</strong> (quizzes, assignments).</li>
            <li><strong>Respond to customer service requests</strong> and administrative support.</li>
            <li><strong>Send administrative information</strong> (updates, security alerts, support messages).</li>
            <li><strong>Protect our Platform</strong> from unauthorized access and illegal activity.</li>
          </ul>
          <div className="section-divider"></div>
        </div>

        {/* Continue with remaining sections... */}
        {/* Section 5-12 would follow the same pattern */}
        
        {/* Section 13 - Contact */}
        <div className="policy-section">
          <h2>13. CONTACT US</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
          <div className="contact-info">
            <p><strong>[Insert System Name]</strong></p>
            <p>Email: [Insert Support Email Address]</p>
            <p>Phone: [Insert Phone Number]</p>
            <p>Address: [Insert Physical Address]</p>
          </div>
        </div>

        {/* Footer */}
        <div className="document-footer">
          <div className="footer-line"></div>
          <p className="copyright">© {new Date().getFullYear()} [Insert System Name]. All rights reserved.</p>
          <p className="document-reference">Document Reference: PP-CBC-{new Date().getFullYear()}-001</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;