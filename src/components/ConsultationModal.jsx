import React, { useState } from 'react';

function ConsultationModalContent({ onClose, prefillData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: prefillData?.productName || '',
    description: prefillData?.productName ? `Inquiring regarding: ${prefillData.productName}` : ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div
      className="quote-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-heading"
    >
      {/* Blurred Reference Interior Backdrop */}
      <div className="quote-modal-dimmed-backdrop" />

      {/* Modal Dialog Card */}
      <div
        className="quote-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Interior Inspiration Sidebar */}
        <aside className="quote-modal-sidebar">
          <div className="quote-sidebar-shading" />

          {/* Top Label */}
          <div className="quote-sidebar-top">
            <span className="quote-service-category">INTERIOR DESIGN QUOTE</span>
          </div>

          {/* Bottom Promise Content */}
          <div className="quote-sidebar-bottom">
            <div className="quote-editorial-rule" />
            <h2 className="quote-promise-heading">
              Get a Quote for<br />Your Dream Space.
            </h2>
            <p className="quote-promise-desc">
              Share your project details and we'll provide a tailored quote for your interior design needs.
            </p>

            <div className="quote-benefit-badge">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/66755db60501d8e2b627950fdc7a97338a38727d?placeholderIfAbsent=true"
                alt=""
                aria-hidden="true"
                className="quote-benefit-check"
              />
              <span className="quote-benefit-text">Fast turnaround. No hidden fees.</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Quote Request Form */}
        <div className="quote-modal-content">
          {/* Close Button */}
          <button
            className="quote-modal-close-btn"
            onClick={onClose}
            aria-label="Close quote modal"
            id="quote-modal-close-btn"
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/2c01a657c86c097863f89f1dd0063fb223e2429d?placeholderIfAbsent=true"
              alt=""
              aria-hidden="true"
            />
          </button>

          {submitted ? (
            <div className="quote-submitted-success">
              <div className="success-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#88001B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="success-title">Thank You, {formData.name || 'valued client'}</h3>
              <p className="success-message">
                Your consultation and quote request has been received. Our senior design team will review your specifications and contact you within 24 hours.
              </p>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="quote-content-header">
                <h3 id="quote-modal-heading" className="quote-heading">
                  Get a Quote for<br />Your Project
                </h3>
                <p className="quote-subtitle">
                  Tell us about your interior design needs. We'll provide a detailed estimate based on your requirements.
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="quote-form-body">
                {/* 1. Full Name */}
                <div className="quote-form-field">
                  <label htmlFor="quote-fullname" className="quote-field-label">
                    Full name
                  </label>
                  <input
                    id="quote-fullname"
                    type="text"
                    required
                    placeholder="Your full name"
                    className="quote-field-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* 2 & 3. Contact Details (Email & Phone side-by-side) */}
                <div className="quote-contact-fields-row">
                  <div className="quote-form-field">
                    <label htmlFor="quote-email" className="quote-field-label">
                      Email address
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="quote-field-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="quote-form-field">
                    <label htmlFor="quote-phone" className="quote-field-label">
                      Phone number
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      required
                      placeholder="Your phone number"
                      className="quote-field-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* 4. Project Type (Select dropdown with chevron) */}
                <div className="quote-form-field">
                  <label htmlFor="quote-project-type" className="quote-field-label">
                    Project type
                  </label>
                  <div className="quote-select-wrapper">
                    <select
                      id="quote-project-type"
                      className="quote-field-select"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        Select your project type (e.g. Living Room, Kitchen)
                      </option>
                      <option value="Full Bedroom Set">Full Bedroom Set</option>
                      <option value="Modular Kitchen">Modular Kitchen</option>
                      <option value="Living Room">Living Room</option>
                      <option value="Full Home Turnkey Interior">Full Home Turnkey Interior</option>
                      <option value="Executive Office Space">Executive Office Space</option>
                      <option value="Retail & Commercial Boutique">Retail & Commercial Boutique</option>
                      <option value="Architectural Construction">Architectural Construction</option>
                      <option value="Custom Furniture Collection">Custom Furniture Collection</option>
                    </select>
                    <img
                      src="https://api.builder.io/api/v1/image/assets/TEMP/d0b9bf8f68bbeeeca5da6879089dc466552b4b69?placeholderIfAbsent=true"
                      alt=""
                      aria-hidden="true"
                      className="quote-select-chevron"
                    />
                  </div>
                </div>

                {/* 5. Project Description (Optional) */}
                <div className="quote-form-field">
                  <label htmlFor="quote-description" className="quote-field-label">
                    Project description<span className="quote-label-optional"> · Optional</span>
                  </label>
                  <textarea
                    id="quote-description"
                    rows="3"
                    className="quote-field-textarea"
                    placeholder="Describe your vision, style preferences, and any specific requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* 6. Submit Button & Privacy Reassurance */}
                <div className="quote-submit-block">
                  <button
                    type="submit"
                    className="quote-submit-btn"
                    id="quote-submit-btn"
                  >
                    Get a Quote
                  </button>

                  <div className="quote-privacy-reassurance">
                    <img
                      src="https://api.builder.io/api/v1/image/assets/TEMP/f45e717dd6716b6416a1a4700fd95f67d11fdbd9?placeholderIfAbsent=true"
                      alt=""
                      aria-hidden="true"
                      className="quote-privacy-lock"
                    />
                    <span className="quote-privacy-text">
                      Your details stay private and are only used to discuss your project.
                    </span>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConsultationModal({ isOpen, onClose, prefillData }) {
  if (!isOpen) return null;

  return (
    <ConsultationModalContent
      key={prefillData?.productName || 'new-consultation'}
      onClose={onClose}
      prefillData={prefillData}
    />
  );
}
