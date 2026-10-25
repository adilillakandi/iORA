import React, { useState } from 'react';
import { servicesData } from '../data/servicesData';
import CtaBanner from '../components/CtaBanner';

export default function ServicesPage({ onNavigate, onOpenConsultation }) {
  const { breadcrumb, intro, services } = servicesData;
  const [activeServiceId, setActiveServiceId] = useState('modular-kitchen');

  const currentService =
    services.find((s) => s.id === activeServiceId) || services[0];

  const handleConsultation = () => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${currentService.name} Service Inquiry`
      });
    }
  };

  return (
    <div className="services-page">
      {/* 1. Service Overview Top Section (Light Gray Background) */}
      <section className="services-overview-section" aria-label="Services Overview">
        <div className="section-container">
          {/* Breadcrumb */}
          <nav className="services-breadcrumb" aria-label="Breadcrumb">
            <button
              className="breadcrumb-link"
              onClick={() => onNavigate('home')}
              id="services-breadcrumb-home-btn"
            >
              {breadcrumb.home}
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{breadcrumb.currentPage}</span>
          </nav>

          {/* Page Introduction */}
          <div className="services-intro-block">
            <h1 className="services-page-title">{intro.title}</h1>
            <p className="services-intro-text">{intro.subtitle}</p>
          </div>

          {/* Service Content (Sidebar Nav + Featured Showcase) */}
          <div className="services-content-layout">
            {/* Left Column: Service Navigation List */}
            <aside className="services-sidebar-nav" aria-label="Select Service">
              {services.map((service) => (
                <button
                  key={service.id}
                  className={`service-nav-btn ${activeServiceId === service.id ? 'active' : ''}`}
                  onClick={() => setActiveServiceId(service.id)}
                  id={`service-nav-${service.id}`}
                >
                  {service.name}
                </button>
              ))}
            </aside>

            {/* Right Column: Featured Service Showcase */}
            <div className="featured-service-display">
              <h2 className="featured-service-title">{currentService.title}</h2>
              <p className="featured-service-description">
                {currentService.description}
              </p>

              {/* Main Showcase Image */}
              <div
                className="featured-service-image-wrap"
                onClick={handleConsultation}
                role="button"
                tabIndex={0}
                aria-label={`Enquire about ${currentService.name}`}
              >
                {services.map((service) => (
                  <img
                    key={service.id}
                    src={service.heroImage}
                    alt={service.heroImageAlt}
                    className={`featured-service-img ${activeServiceId === service.id ? 'active' : ''}`}
                    loading="eager"
                  />
                ))}
              </div>

              {/* Image Caption Row */}
              <div className="featured-service-caption-row">
                <span className="caption-philosophy">
                  {currentService.philosophy}
                </span>
                <span className="caption-category">
                  {currentService.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Service Details & Design Considerations (White Background) */}
      <section className="service-details-section" aria-label={`${currentService.name} Details`}>
        <div className="section-container">
          <div className="service-details-layout">
            {/* Left: Inspiration Portrait Image */}
            <div
              className="service-details-image-col"
              onClick={handleConsultation}
              role="button"
              tabIndex={0}
            >
              {services.map((service) => (
                <img
                  key={service.id}
                  src={service.detailImage}
                  alt={service.detailImageAlt}
                  className={`service-detail-img ${activeServiceId === service.id ? 'active' : ''}`}
                  loading="lazy"
                />
              ))}
            </div>

            {/* Right: Design Considerations Column */}
            <div className="service-considerations-col">
              <div className="considerations-header">
                <span className="considerations-eyebrow">
                  {currentService.eyebrow}
                </span>
                <h3
                  className="considerations-title"
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {currentService.sectionTitle}
                </h3>
              </div>

              {/* 3 Detail Blocks with Hairline Top Border */}
              <div className="considerations-list">
                {currentService.considerations.map((item, idx) => (
                  <div key={idx} className="consideration-item">
                    <h4 className="consideration-item-title">{item.title}</h4>
                    <p className="consideration-item-desc">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA Banner */}
      <CtaBanner onOpenConsultation={handleConsultation} />
    </div>
  );
}
