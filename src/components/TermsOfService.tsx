import React from 'react';
import './styles/TermsOfService.css';

const TermsOfService: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="terms-container">
      <div className="document-wrapper">
        {/* Header Section */}
        <div className="document-header">
          <div className="header-line"></div>
          <h1>TERMS OF SERVICE</h1>
          <div className="document-id">
            <span className="id-label">Document ID:</span> TOS-CBC-2024-001
          </div>
          <div className="effective-date">
            <span className="date-label">Effective Date:</span> {currentDate}
          </div>
          <div className="last-updated">
            <span className="update-label">Last Updated:</span> {currentDate}
          </div>
          <div className="header-line bottom"></div>
        </div>

        {/* Preliminary Statement */}
        <div className="preliminary-section">
          <p>
            These Terms of Service ("Terms") govern your use of the <span className="platform-name">[Insert System Name]</span> 
            website, application, and services (the "Platform"). The Platform is an online learning management system 
            tailored for the Competency-Based Curriculum (CBC).
          </p>
          <p className="emphasis-text">
            By registering for or using the Platform, you (the "User") agree to be bound by these Terms.
          </p>
          <p>
            If you are registering on behalf of a school or educational institution, you represent that you have 
            the authority to bind that institution to these Terms.
          </p>
        </div>

        {/* Section 1 */}
        <div className="terms-section">
          <h2>1. ACCEPTANCE OF TERMS</h2>
          <p>
            By accessing or using our Platform, you confirm that you have read, understood, and agree to be bound 
            by these Terms. If you do not agree, you may not access or use the Platform.
          </p>
          <div className="section-divider"></div>
        </div>

        {/* Section 2 */}
        <div className="terms-section">
          <h2>2. DESCRIPTION OF SERVICE</h2>
          <p>
            <span className="platform-name">[Insert System Name]</span> provides a digital platform where:
          </p>
          <ul>
            <li><strong>Teachers</strong> can upload, organize, and share CBC reading materials, assignments, and schemes of work.</li>
            <li><strong>Students</strong> can access these materials, submit assignments (if applicable), and track their progress.</li>
          </ul>
          <div className="section-divider"></div>
        </div>

        {/* Section 3 */}
        <div className="terms-section">
          <h2>3. USER ACCOUNTS AND REGISTRATION</h2>
          
          <h3>a. Account Creation</h3>
          <p>To use the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.</p>

          <h3>b. Account Roles</h3>
          <ul>
            <li><strong>Teacher Accounts:</strong> Granted to verified educators. Teachers are responsible for the accuracy and appropriateness of the content they upload.</li>
            <li><strong>Student Accounts:</strong> Created for learners. Students under the age of 18 must have the consent of a parent or legal guardian.</li>
            <li><strong>Parent Accounts:</strong> Allow parents to monitor their child's progress.</li>
          </ul>

          <h3>c. Account Responsibility</h3>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials. You are fully responsible 
            for all activities that occur under your account. You agree to notify us immediately of any unauthorized 
            use of your account.
          </p>
          <div className="section-divider"></div>
        </div>

        {/* Section 4 */}
        <div className="terms-section">
          <h2>4. USER CONDUCT AND CONTENT GUIDELINES</h2>
          
          <h3>a. Teacher-Generated Content</h3>
          <p>
            Teachers retain ownership of the lesson plans and materials they upload. By uploading content, you grant 
            <span className="platform-name"> [Insert System Name]</span> a non-exclusive, royalty-free license to host, 
            store, and distribute that content to the students assigned to you.
          </p>
          <ul>
            <li><strong>Accuracy:</strong> You warrant that your uploaded materials are accurate and suitable for the specified CBC grade level.</li>
            <li><strong>Copyright:</strong> You must own the content you upload or have the necessary permissions to share it. Uploading copyrighted materials (e.g., scanned textbooks) without permission is strictly prohibited.</li>
          </ul>

          <h3>b. Prohibited Activities</h3>
          <p>You agree not to use the Platform to:</p>
          <ul>
            <li>Upload any content that is illegal, harmful, threatening, abusive, or obscene.</li>
            <li>Harass, intimidate, or bully other users (including cyberbullying between students).</li>
            <li>Attempt to gain unauthorized access to another user's account or the Platform's systems.</li>
            <li>Upload files that contain viruses, malware, or corrupted data.</li>
            <li>Use the Platform for any commercial solicitation purposes without our written consent.</li>
          </ul>
          <div className="section-divider"></div>
        </div>

        {/* Continue with remaining sections... */}

        {/* Section 12 - Governing Law */}
        <div className="terms-section">
          <h2>12. GOVERNING LAW</h2>
          <p>
            These Terms shall be governed by and defined following the laws of [Insert Your Country, e.g., Kenya]. 
            <span className="platform-name"> [Insert System Name]</span> and yourself irrevocably consent that the 
            courts of [Insert City/Country] shall have exclusive jurisdiction to resolve any dispute which may arise 
            in connection with these terms.
          </p>
          <div className="section-divider"></div>
        </div>

        {/* Section 14 - Contact */}
        <div className="terms-section">
          <h2>14. CONTACT US</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <div className="contact-info">
            <p><strong>[Insert System Name]</strong></p>
            <p>Email: [Insert Legal/Support Email Address]</p>
            <p>Phone: [Insert Phone Number]</p>
            <p>Address: [Insert Physical Address]</p>
          </div>
        </div>

        {/* Footer */}
        <div className="document-footer">
          <div className="footer-line"></div>
          <p className="copyright">© {new Date().getFullYear()} [Insert System Name]. All rights reserved.</p>
          <p className="document-reference">Document Reference: TOS-CBC-{new Date().getFullYear()}-001</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;