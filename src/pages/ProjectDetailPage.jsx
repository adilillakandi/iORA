import React, { useState, useEffect } from 'react';
import { projectDetailData } from '../data/projectDetailData';
import { getPortfolioProjects } from '../utils/dataService';
import CtaBanner from '../components/CtaBanner';

export default function ProjectDetailPage({ onNavigate, onOpenConsultation, selectedProject }) {
  const { backButton, heroPanorama, theIdea: defaultIdea, specifications: defaultSpecs, gallery: defaultGallery } = projectDetailData;

  // Retrieve active project from props or fallback to storage across page refresh
  const initialProject = selectedProject || (() => {
    try {
      const saved = sessionStorage.getItem('iora_selected_project') || localStorage.getItem('iora_selected_project');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const [activeProject, setActiveProject] = useState(initialProject);

  // Sync state whenever selectedProject prop updates
  useEffect(() => {
    if (selectedProject) {
      setActiveProject(selectedProject);
      try {
        sessionStorage.setItem('iora_selected_project', JSON.stringify(selectedProject));
        localStorage.setItem('iora_selected_project', JSON.stringify(selectedProject));
      } catch {
        // ignore
      }
    }
  }, [selectedProject]);

  // Refresh latest project details from database / storage if id is present
  useEffect(() => {
    if (activeProject?.id) {
      let isMounted = true;
      getPortfolioProjects()
        .then((projects) => {
          if (!isMounted) return;
          const found = projects.find((p) => p.id === activeProject.id);
          if (found) {
            setActiveProject(found);
            try {
              sessionStorage.setItem('iora_selected_project', JSON.stringify(found));
              localStorage.setItem('iora_selected_project', JSON.stringify(found));
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [activeProject?.id]);

  // 1. Dynamic Category & Title
  const categoryRaw = activeProject?.category || 'Residential';
  const currentCategory = activeProject
    ? `${categoryRaw.toUpperCase()} / INTERIOR DESIGN`
    : projectDetailData.category;
  const currentTitle = activeProject?.title || projectDetailData.title;
  const currentHeroImage = activeProject?.image || activeProject?.image_url || heroPanorama.image;
  const currentHeroAlt = activeProject?.subtitle || activeProject?.title || heroPanorama.alt;

  // 2. Dynamic The Idea Section
  const ideaTitle = activeProject
    ? (activeProject.theIdeaTitle || activeProject.the_idea_title || '')
    : defaultIdea.title;

  const rawIdeaDesc = activeProject
    ? (activeProject.theIdeaDescription || activeProject.the_idea_description || '')
    : '';

  const ideaParagraphs = activeProject
    ? (rawIdeaDesc
        ? rawIdeaDesc.split(/\n\s*\n|\r\n\s*\r\n|\n/).map((p) => p.trim()).filter(Boolean)
        : (activeProject.subtitle ? [activeProject.subtitle] : []))
    : defaultIdea.paragraphs;

  const hasIdea = Boolean(ideaTitle || ideaParagraphs.length > 0);

  // 3. Dynamic Specifications / Project at a Glance
  let specsList = [];
  let specNote = '';

  if (activeProject) {
    const rawSpecs = activeProject.specifications;
    if (Array.isArray(rawSpecs)) {
      specsList = rawSpecs;
    } else if (rawSpecs && typeof rawSpecs === 'object') {
      specsList = Array.isArray(rawSpecs.items) ? rawSpecs.items : [];
      specNote = rawSpecs.note || '';
    }
    if (!specNote) {
      specNote = activeProject.specificationsNote || activeProject.specifications_note || '';
    }
  } else {
    specsList = defaultSpecs.items;
    specNote = defaultSpecs.note;
  }

  const activeSpecs = specsList.filter((s) => s && (s.label?.trim() || s.value?.trim()));
  const hasSpecs = Boolean(activeSpecs.length > 0 || specNote);

  // 4. Dynamic Gallery Images
  let galleryList = [];
  if (activeProject) {
    const rawGallery = activeProject.galleryImages || activeProject.gallery_images;
    if (Array.isArray(rawGallery) && rawGallery.length > 0) {
      galleryList = rawGallery
        .map((item, idx) => {
          if (typeof item === 'string') {
            return { id: `gal-${idx}`, image: item, alt: activeProject.title || 'Gallery photograph' };
          }
          return {
            id: item.id || `gal-${idx}`,
            image: item.image || item.image_url || item.url || '',
            alt: item.alt || item.caption || activeProject.title || 'Gallery photograph'
          };
        })
        .filter((item) => Boolean(item.image));
    }
  } else {
    galleryList = [
      ...defaultGallery.pair1,
      defaultGallery.centerPanorama,
      ...defaultGallery.pair2
    ];
  }

  const handleConsultation = () => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${currentTitle} (${categoryRaw} / Turnkey Inquiry)`
      });
    }
  };

  // Helper to render dynamic gallery in rhythmic pairs & panoramas
  const renderDynamicGallery = (items) => {
    const elements = [];
    let i = 0;
    while (i < items.length) {
      const remaining = items.length - i;
      if (remaining === 1) {
        const item = items[i];
        elements.push(
          <div
            key={item.id || `pano-${i}`}
            className="detail-gallery-center-panorama"
            onClick={handleConsultation}
            role="button"
            tabIndex={0}
          >
            <img src={item.image} alt={item.alt} loading="lazy" />
          </div>
        );
        i += 1;
      } else if (remaining === 3) {
        const pair = items.slice(i, i + 2);
        const pano = items[i + 2];
        elements.push(
          <div key={`pair-${i}`} className="detail-gallery-pair">
            {pair.map((pItem) => (
              <div
                key={pItem.id}
                className="gallery-photo-card"
                onClick={handleConsultation}
                role="button"
                tabIndex={0}
              >
                <img src={pItem.image} alt={pItem.alt} loading="lazy" />
              </div>
            ))}
          </div>
        );
        elements.push(
          <div
            key={pano.id || `pano-${i + 2}`}
            className="detail-gallery-center-panorama"
            onClick={handleConsultation}
            role="button"
            tabIndex={0}
          >
            <img src={pano.image} alt={pano.alt} loading="lazy" />
          </div>
        );
        i += 3;
      } else {
        const pair = items.slice(i, i + 2);
        elements.push(
          <div key={`pair-${i}`} className="detail-gallery-pair">
            {pair.map((pItem) => (
              <div
                key={pItem.id}
                className="gallery-photo-card"
                onClick={handleConsultation}
                role="button"
                tabIndex={0}
              >
                <img src={pItem.image} alt={pItem.alt} loading="lazy" />
              </div>
            ))}
          </div>
        );
        i += 2;
        if (i < items.length && (i === 2 || (i - 2) % 5 === 0)) {
          const pano = items[i];
          elements.push(
            <div
              key={pano.id || `pano-${i}`}
              className="detail-gallery-center-panorama"
              onClick={handleConsultation}
              role="button"
              tabIndex={0}
            >
              <img src={pano.image} alt={pano.alt} loading="lazy" />
            </div>
          );
          i += 1;
        }
      }
    }
    return elements;
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
      {(hasIdea || hasSpecs) && (
        <section className="detail-specifications-section" aria-label="Project Overview & Specifications">
          <div className="section-container">
            <div
              className="detail-overview-specs-grid"
              style={{
                gridTemplateColumns: hasIdea && hasSpecs ? undefined : '1fr'
              }}
            >
              {/* Left: The Idea */}
              {hasIdea && (
                <div className="detail-the-idea-column">
                  <div className="detail-section-label">THE IDEA</div>
                  {ideaTitle && (
                    <h2 className="detail-idea-heading" style={{ whiteSpace: 'pre-line' }}>
                      {ideaTitle}
                    </h2>
                  )}
                  {ideaParagraphs.map((p, idx) => (
                    <p key={idx} className="detail-idea-paragraph">
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {/* Right: Project Facts / Glance */}
              {hasSpecs && (
                <div className="detail-facts-column">
                  <div className="detail-section-label">PROJECT AT A GLANCE</div>

                  {activeSpecs.length > 0 && (
                    <div className="detail-specs-grid">
                      {activeSpecs.map((spec, idx) => (
                        <div key={spec.label || idx} className="detail-spec-item">
                          <span className="detail-spec-label">{spec.label}</span>
                          <span className="detail-spec-value">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {specNote && (
                    <p className="detail-specs-footnote" style={{ whiteSpace: 'pre-line' }}>
                      {specNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Inside the Residence / Project Gallery */}
      {galleryList.length > 0 && (
        <section className="detail-residence-gallery-section" aria-label="Project Gallery">
          <div className="section-container">
            {renderDynamicGallery(galleryList)}
          </div>
        </section>
      )}

      {/* 4. CTA Banner */}
      <CtaBanner onOpenConsultation={handleConsultation} />
    </div>
  );
}
