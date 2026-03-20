import React, { useState, useEffect } from 'react';
import './styles/Hero.css';

interface Slide {
  id: number;
  url: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Teacher helping students in classroom'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Students studying together'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Teaching materials and books'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Modern classroom with technology'
  }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Content Side */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-text">Welcome to Teacher's Portal</span>
          </div>
          
          <h1 className="hero-title">
            Empowering Teachers,
            <span className="hero-title-highlight"> Inspiring Students</span>
          </h1>
          
          <p className="hero-description">
            Streamline your teaching workflow with our comprehensive portal. 
            Upload notes, create assignments, and track student progress all in one place.
          </p>
          
          <div className="hero-cta">
            <a href="/login" className="cta-button cta-primary">
              Get Started
              <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#learn-more" className="cta-button cta-secondary">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Active Teachers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">800+</span>
              <span className="stat-label">Happy Students</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">10+</span>
              <span className="stat-label">Schools</span>
            </div>
          </div>
        </div>

        {/* Slider Side */}
        <div className="hero-slider-wrapper">
          <div className="slider-container">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slider-slide ${index === currentSlide ? 'active' : ''}`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                }}
              >
                <div className="slide-image-wrapper">
                  <img 
                    src={slide.url} 
                    alt={slide.alt}
                    className="slide-image"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="slide-overlay"></div>
                </div>
                
                {/* Slide Caption */}
                <div className="slide-caption">
                  <p className="caption-text">{slide.alt}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            className="slider-arrow slider-arrow-prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button 
            className="slider-arrow slider-arrow-next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              >
                <span className="dot-progress"></span>
              </button>
            ))}
          </div>

          {/* Slide Counter */}
          <div className="slider-counter">
            <span className="counter-current">{String(currentSlide + 1).padStart(2, '0')}</span>
            <span className="counter-separator">/</span>
            <span className="counter-total">{String(slides.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="hero-decoration">
        <div className="decoration-circle decoration-circle-1"></div>
        <div className="decoration-circle decoration-circle-2"></div>
        <div className="decoration-circle decoration-circle-3"></div>
      </div>
    </section>
  );
};

export default Hero;