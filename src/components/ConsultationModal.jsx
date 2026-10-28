import React, { useState } from 'react';
import { saveQuoteRequest } from '../utils/dataService';

function ConsultationModalContent({ onClose, prefillData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: prefillData?.productName || '',
    description: prefillData?.productName ? `Inquiring regarding: ${prefillData.productName}` : ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const projectType = formData.projectType.trim() || 'General Interior Design';
    const description = formData.description?.trim() || 'No additional details provided.';

    // Construct WhatsApp message
    const message = `*NEW QUOTE REQUEST — iORA INTERIORS*

*Client Name:* ${name}
*Phone Number:* ${phone}
*Email Address:* ${email}
*Project Type:* ${projectType}
*Project Description:* ${description}

Please provide a tailored estimate and consultation details. Thank you!`;

    const url = `https://wa.me/917306201202?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(url);

    // Save quote to Supabase / local storage in background
    saveQuoteRequest({
      name,
      email,
      phone,
      project_type: projectType,
      description
    }).catch(console.warn);

    // Open WhatsApp directly
    window.open(url, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
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
              <div className="success-icon-wrap" style={{ background: 'rgba(37, 211, 102, 0.12)' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="success-title">Opening WhatsApp...</h3>
              <p className="success-message">
                Your quote request for <strong>{formData.projectType || 'Interior Project'}</strong> has been prepared and sent to <strong>+91 73062 01202</strong> on WhatsApp.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '340px', marginTop: '20px' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quote-whatsapp-direct-btn"
                  id="quote-open-whatsapp-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Continue to WhatsApp (7306201202)</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="quote-success-close-btn"
                >
                  Done
                </button>
              </div>
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
