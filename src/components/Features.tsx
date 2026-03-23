// components/Features.tsx
import React from 'react';
import './styles/Features.css';
import { FaFileAlt, FaChartBar, FaStar, FaBook, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <FaFileAlt />,
    title: 'Upload Notes',
    description: 'Easily upload and organize your teaching materials. Share notes with students instantly.'
  },
  {
    icon: <FaChartBar />,
    title: 'Create Assignments',
    description: 'Design engaging assignments with rich text, attachments, and deadlines.'
  },
  {
    icon: <FaStar />,
    title: 'Award Marks',
    description: 'Efficient grading system with customizable rubrics and instant feedback.'
  },
  {
    icon: <FaBook />,
    title: 'Library Management',
    description: 'Access and organize all your teaching resources in one central location.'
  },
  {
    icon: <FaCalendarAlt />,
    title: 'Lesson Planning',
    description: 'Plan your lessons ahead with our intuitive scheduling tools.'
  },
  {
    icon: <FaChartLine />,
    title: 'Progress Tracking',
    description: 'Monitor student performance with detailed analytics and reports.'
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="features">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            Everything You Need to
            <span className="highlight"> Succeed</span>
          </h2>
          <p className="features-subtitle">
            Powerful tools designed to make teaching more efficient and effective
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;