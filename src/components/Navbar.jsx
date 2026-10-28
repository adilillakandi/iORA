import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { homeData } from '../data/homeData';

export default function Navbar({ onOpenConsultation, currentPage = 'home', onNavigate, activeSection = 'home' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (id) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    }
  };

  const isLinkActive = (id) => {
    if (id === 'shop') return currentPage === 'shop' || currentPage === 'shop-details';
    if (id === 'services') return currentPage === 'services';
    if (id === 'portfolio') return currentPage === 'portfolio' || currentPage === 'project-detail';
    if (id === 'about') return currentPage === 'about';
    if (id === 'home') return currentPage === 'home' && (activeSection === 'home' || !activeSection);
    if (currentPage === 'home') return activeSection === id;
    return false;
  };

  const headerClass = (currentPage === 'portfolio' || currentPage === 'project-detail' || currentPage === 'services' || currentPage === 'shop' || currentPage === 'shop-details')
    ? 'site-header solid-header'
    : 'site-header';

  return (
    <header className={headerClass}>
      <div className="nav-brand">
        <a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}>
          <img
            src={homeData.brand.logo}
            alt={homeData.brand.name}
            className="nav-brand-logo"
            width="84"
            height="45"
          />
        </a>
      </div>

      <nav className={`nav-center-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {homeData.navLinks.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={`nav-item ${isLinkActive(link.id) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(link.id);
            }}
          >
            {link.label}
          </a>
        ))}
        {/* Mobile menu actions */}
        <div className="nav-mobile-actions">
          <a
            href="tel:+917306201202"
            className="nav-mobile-phone-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Phone size={14} />
            <span>Call: 7306201202</span>
          </a>
          <button
            type="button"
            className="nav-mobile-quote-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenConsultation();
            }}
          >
            Get a Quote
          </button>
        </div>
      </nav>

      <div className="nav-actions-group">
        <a
          href="tel:+917306201202"
          className="nav-phone-link"
          id="nav-phone-link"
          aria-label="Call iORA at 7306201202"
        >
          <Phone size={13} className="nav-phone-icon" />
          <span>7306201202</span>
        </a>

        <button
          type="button"
          className="nav-quote-btn"
          onClick={onOpenConsultation}
          id="nav-quote-btn"
        >
          Get a Quote
        </button>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          id="mobile-menu-toggle"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
