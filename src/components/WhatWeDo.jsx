import React, { useState } from 'react';
import { homeData } from '../data/homeData';

export default function WhatWeDo() {
  const { whatWeDo } = homeData;
  const [activeServiceId, setActiveServiceId] = useState(whatWeDo.services[0].id);

  const activeService = whatWeDo.services.find((s) => s.id === activeServiceId) || whatWeDo.services[0];

  return (
    <section id="services" className="what-we-do-section" aria-label="What We Do">
      <div className="what-we-do-container">
        <div className="what-we-do-header">
          <h2 className="what-we-do-title">
            {whatWeDo.heading}
          </h2>
          <p className="what-we-do-subtitle">
            {whatWeDo.subheading.split('\n').map((line, idx, arr) => (
              <React.Fragment key={idx}>
                {line}
                {idx < arr.length - 1 && <br className="what-we-do-desktop-br" />}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="what-we-do-content">
          {/* Service Selector Tabs */}
          <div className="services-tab-list">
            {whatWeDo.services.map((service) => (
              <button
                key={service.id}
                className={`service-tab-item ${activeServiceId === service.id ? 'active' : ''}`}
                onClick={() => setActiveServiceId(service.id)}
                id={`tab-${service.id}`}
                type="button"
              >
                {service.name}
              </button>
            ))}
          </div>

          {/* Showcase Area: Center Image + Top-Right Description */}
          <div className="service-showcase-group">
            <div className="service-preview-visual">
              {whatWeDo.services.map((service) => (
                <img
                  key={service.id}
                  src={service.image}
                  alt={service.name}
                  width={service.width || 583}
                  height={service.height || 359}
                  className={`service-showcase-img ${activeServiceId === service.id ? 'active' : ''}`}
                  loading="eager"
                />
              ))}
            </div>

            {/* Right Description Text */}
            <div className="service-description-column">
              <p>
                {activeService.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
