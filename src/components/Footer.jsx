import React from 'react';
import { homeData } from '../data/homeData';

export default function Footer({ onNavigate, onOpenConsultation }) {
  const { brand, footer } = homeData;

  const handleLinkClick = (id) => {
    if (id === 'contact' && onOpenConsultation) {
      onOpenConsultation();
      return;
    }
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <footer className="site-footer">
      <div className="section-container">
        <div className="footer-nav-row">
          {/* Logo */}
          <div className="footer-logo">
            <a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}>
              <img
                src={brand.logo}
                alt={brand.name}
                width="104"
                height="56"
              />
            </a>
          </div>

          {/* Links */}
          <nav className="footer-site-links" aria-label="Footer Navigation">
            {footer.links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="footer-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.id);
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Row */}
          <div className="footer-social-row">
            {footer.socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-box"
                aria-label={`Follow iORA on ${social.name}`}
              >
                <img src={social.icon} alt={social.name} />
              </a>
            ))}
          </div>
        </div>

        {/* Legal Row */}
        <div className="footer-legal-row">
          <div>{footer.copyright}</div>
          <div>
            <a href="#privacy" className="footer-link">
              {footer.privacyText}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
