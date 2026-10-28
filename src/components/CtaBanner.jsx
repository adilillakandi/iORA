import React from 'react';
import { homeData } from '../data/homeData';

export default function CtaBanner({ onOpenConsultation, isStacked = false }) {
  const { ctaBanner } = homeData;

  return (
    <section
      className={`cta-section ${isStacked ? 'stacked-cta' : ''}`}
      aria-label="Call to Action"
      style={isStacked ? { '--step-idx': 5, '--step-z': 6 } : undefined}
    >
      <div
        className="cta-banner-card"
        style={{ backgroundImage: `url(${ctaBanner.bgImage})` }}
      >
        <div className="cta-banner-overlay" />

        <div className="cta-banner-content">
          <h2 className="cta-headline">
            Ready to Transform Your<br />Space?
          </h2>
          <p className="cta-subtitle">
            {ctaBanner.subtitle}
          </p>
          <button
            className="cta-button"
            onClick={onOpenConsultation}
            id="cta-get-quote-btn"
          >
            {ctaBanner.buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}
