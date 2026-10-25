import React, { useRef, useState, useEffect } from 'react';
import { homeData } from '../data/homeData';

export default function FeaturedProjects({ onViewAll, onProjectClick }) {
  const { projects } = homeData;
  const trackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(25);

  const handleScroll = () => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const percentage = Math.min(100, Math.max(20, (scrollLeft / maxScroll) * 80 + 20));
        setScrollProgress(percentage);
      }
    }
  };

  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollProjects = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (project) => {
    if (onProjectClick) {
      onProjectClick(project);
    } else if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <section id="portfolio" className="projects-section" aria-label="Featured Projects">
      {/* Header Container */}
      <div className="section-container">
        <div className="projects-header-row">
          <div className="projects-title-block">
            <h2 className="projects-main-title">
              {projects.heading}
            </h2>
            <p className="projects-subtext">
              {projects.subheading.split('\n').map((line, idx, arr) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < arr.length - 1 && <br className="projects-desktop-br" />}
                </React.Fragment>
              ))}
            </p>
          </div>

          <div className="projects-slider-arrows">
            <button
              type="button"
              className="slider-nav-btn"
              onClick={() => scrollProjects('left')}
              aria-label="Previous project slide"
              id="projects-prev-slide"
            >
              <img src={projects.prevIcon} alt="Previous" />
            </button>
            <button
              type="button"
              className="slider-nav-btn"
              onClick={() => scrollProjects('right')}
              aria-label="Next project slide"
              id="projects-next-slide"
            >
              <img src={projects.nextIcon} alt="Next" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Project Cards Track - 10px starting space, 0 end space */}
      <div className="projects-scroll-track" ref={trackRef}>
        {projects.items.map((project) => (
          <div
            key={project.id}
            className="project-slide-card"
            style={{
              width: `${project.width}px`
            }}
            onClick={() => handleCardClick(project)}
            role="button"
            tabIndex={0}
            aria-label={`View ${project.title}`}
          >
            <img
              src={project.image}
              alt={project.title}
              width={project.width}
              height={project.height}
              style={{
                width: `${project.width}px`,
                height: `${project.height}px`,
                objectFit: 'cover'
              }}
              loading="lazy"
            />
            <div className="project-card-footer">
              <h3 className="project-card-title">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar Container */}
      <div className="section-container">
        <div className="projects-bottom-bar">
          <div className="projects-progress-track">
            <div
              className="projects-progress-thumb"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <button
            type="button"
            className="projects-view-all-btn"
            onClick={onViewAll}
            id="view-all-projects-btn"
          >
            <span>View all projects</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
