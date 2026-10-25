import React, { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { getPortfolioProjects } from '../utils/dataService';
import CtaBanner from '../components/CtaBanner';

export default function PortfolioPage({ onOpenConsultation, onNavigate }) {
  const { header, categories, projects: defaultProjects } = portfolioData;
  const [projects, setProjects] = useState(defaultProjects);
  const [activeCategory, setActiveCategory] = useState('All works');

  useEffect(() => {
    let mounted = true;
    getPortfolioProjects().then((items) => {
      if (mounted && items && items.length > 0) {
        setProjects(items.filter((p) => p.isPublished !== false));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = activeCategory === 'All works'
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  const handleProjectClick = (project) => {
    if (onNavigate) {
      onNavigate('project-detail', project);
    } else if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${project.title} (${project.subtitle || project.category})`
      });
    }
  };

  return (
    <div className="portfolio-page">
      {/* 1. Header: Title and Introduction */}
      <section className="portfolio-header-section" aria-label="Portfolio Introduction">
        <div className="section-container">
          <div className="portfolio-title-row">
            <div className="portfolio-title-group">
              <h1 className="portfolio-page-title">
                {header.title}
              </h1>
            </div>

            <div className="portfolio-intro-group">
              <p className="portfolio-intro-text">
                {header.intro}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Project Portfolio Section (Dark Grid) */}
      <section className="portfolio-grid-section" aria-label="Curated Projects">
        <div className="section-container">
          {/* Category Filter Tabs */}
          <div className="portfolio-filter-container">
            <div className="portfolio-tabs-row">
              <div className="portfolio-tabs-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`portfolio-tab-item ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                    id={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="portfolio-filter-divider" />
          </div>

          {/* 2-Column Project Grid */}
          <div className="portfolio-cards-grid">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="portfolio-project-tile"
                onClick={() => handleProjectClick(project)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${project.title}`}
              >
                <div className="portfolio-tile-image-wrap">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                  />
                  <div className="portfolio-tile-hover-overlay">
                    <span className="portfolio-tile-category-badge">{project.category}</span>
                    <span className="portfolio-tile-view-action">Enquire Project &rarr;</span>
                  </div>
                </div>

                <div className="portfolio-tile-meta">
                  <h3 className="portfolio-tile-title">{project.title}</h3>
                  {project.subtitle && (
                    <span className="portfolio-tile-subtitle">{project.subtitle}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CTA Banner */}
      <CtaBanner onOpenConsultation={onOpenConsultation} />
    </div>
  );
}
