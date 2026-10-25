import React, { useEffect } from 'react';
import { projectDetailData } from '../data/projectDetailData';
import CtaBanner from '../components/CtaBanner';

export default function ProjectDetailPage({ onNavigate, onOpenConsultation, selectedProject }) {
  const { backButton, category: defaultCategory, title: defaultTitle, heroPanorama, theIdea, specifications, gallery } = projectDetailData;

  // Retrieve active project from props or fallback to storage across page refresh
  const activeProject = selectedProject || (() => {
    try {
      const saved = sessionStorage.getItem('iora_selected_project') || localStorage.getItem('iora_selected_project');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Keep storage in sync whenever selectedProject is passed
  useEffect(() => {
    if (selectedProject) {
      try {
        sessionStorage.setItem('iora_selected_project', JSON.stringify(selectedProject));
        localStorage.setItem('iora_selected_project', JSON.stringify(selectedProject));
      } catch {
        // ignore
      }
    }
  }, [selectedProject]);

  const currentCategory = activeProject?.category
    ? `${activeProject.category.toUpperCase()} / INTERIOR DESIGN`
    : defaultCategory;
  const currentTitle = activeProject?.title || defaultTitle;
  const currentHeroImage = activeProject?.image || activeProject?.image_url || heroPanorama.image;
  const currentHeroAlt = activeProject?.subtitle || activeProject?.title || heroPanorama.alt;

  const handleConsultation = () => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${currentTitle} (Residential / Turnkey Inquiry)`
      });
    }
  };

  return (
    <div className="project-detail-page">
      {/* 1. Project Introduction Header */}
      <section className="detail-intro-section" aria-label="Project Title and Navigation">
        <div className="section-container">
          <div className="detail-heading-block">
            {/* Back Button Action */}
            <button
              className="detail-back-btn"
              onClick={() => onNavigate('portfolio')}
              id="detail-back-to-portfolio-btn"
            >
              <img src={backButton.icon} alt="" aria-hidden="true" />
              <span>{backButton.label}</span>
            </button>

            {/* Title and Category */}
            <div className="detail-title-meta-group">
              <span className="detail-category-label">{currentCategory}</span>
              <h1 className="detail-project-title">{currentTitle}</h1>
            </div>
          </div>
        </div>

        {/* Selected Project Hero Panorama */}
        <div className="detail-hero-panorama-wrap">
          <div className="section-container">
            <div className="panorama-frame">
              <img
                src={currentHeroImage}
                alt={currentHeroAlt}
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Overview and Specifications Section */}
      <section className="detail-specifications-section" aria-label="Project Overview & Specifications">
        <div className="section-container">
          <div className="detail-overview-specs-grid">
            {/* Left: The Idea */}
            <div className="detail-the-idea-column">
              <div className="detail-section-label">{theIdea.sectionLabel}</div>
              <h2 className="detail-idea-heading" style={{ whiteSpace: 'pre-line' }}>
                {theIdea.title}
              </h2>
              {theIdea.paragraphs.map((p, idx) => (
                <p key={idx} className="detail-idea-paragraph">
                  {p}
                </p>
              ))}
            </div>

            {/* Right: Project Facts / Glance */}
            <div className="detail-facts-column">
              <div className="detail-section-label">{specifications.sectionLabel}</div>

              <div className="detail-specs-grid">
                {specifications.items.map((spec) => (
                  <div key={spec.label} className="detail-spec-item">
                    <span className="detail-spec-label">{spec.label}</span>
                    <span className="detail-spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>

              <p className="detail-specs-footnote" style={{ whiteSpace: 'pre-line' }}>
                {specifications.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Inside the Residence Gallery */}
      <section className="detail-residence-gallery-section" aria-label="Inside the Residence Gallery">
        <div className="section-container">
          {/* Pair 1 */}
          <div className="detail-gallery-pair">
            {gallery.pair1.map((item) => (
              <div key={item.id} className="gallery-photo-card" onClick={handleConsultation} role="button" tabIndex={0}>
                <img src={item.image} alt={item.alt} loading="lazy" />
              </div>
            ))}
          </div>

          {/* Center Panorama */}
          <div className="detail-gallery-center-panorama" onClick={handleConsultation} role="button" tabIndex={0}>
            <img
              src={gallery.centerPanorama.image}
              alt={gallery.centerPanorama.alt}
              loading="lazy"
            />
          </div>

          {/* Pair 2 */}
          <div className="detail-gallery-pair">
            {gallery.pair2.map((item) => (
              <div key={item.id} className="gallery-photo-card" onClick={handleConsultation} role="button" tabIndex={0}>
                <img src={item.image} alt={item.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA Banner */}
      <CtaBanner onOpenConsultation={handleConsultation} />
    </div>
  );
}
