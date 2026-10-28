import React from 'react';
import { Phone, Mail } from 'lucide-react';
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

          {/* Contact Details */}
          <div className="footer-contact-col">
            <div className="footer-contact-item">
              <Phone size={14} className="footer-contact-icon" />
              <div className="footer-phones-row">
                <a
                  href={`tel:${footer.phoneRaw || footer.phone.replace(/\s+/g, '')}`}
                  className="footer-contact-link"
                  aria-label={`Call iORA at ${footer.phone}`}
                >
                  <span>{footer.phone}</span>
                </a>
                {footer.phoneSecondary && (
                  <>
                    <span className="footer-phone-divider">/</span>
                    <a
                      href={`tel:${footer.phoneSecondaryRaw || footer.phoneSecondary.replace(/\s+/g, '')}`}
                      className="footer-contact-link"
                      aria-label={`Call iORA at ${footer.phoneSecondary}`}
                    >
                      <span>{footer.phoneSecondary}</span>
                    </a>
                  </>
                )}
              </div>
            </div>
            <a
              href={`mailto:${footer.email}`}
              className="footer-contact-link"
              aria-label={`Email iORA at ${footer.email}`}
            >
              <Mail size={14} className="footer-contact-icon" />
              <span>{footer.email}</span>
            </a>
          </div>

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
