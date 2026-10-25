import React, { useState } from 'react';
import { homeData } from '../data/homeData';

export default function CustomCollections({ onOpenConsultation, onShopClick }) {
  const { collections } = homeData;
  const [activeCategory, setActiveCategory] = useState(collections.categories[0]);

  const handleHotspotClick = (hotspot) => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: hotspot.name.replace('\n', ' '),
        price: `₹ ${Number(hotspot.price).toLocaleString('en-IN')}`
      });
    } else if (onShopClick) {
      onShopClick();
    }
  };

  const handleCardClick = (item) => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: item.title,
        price: item.price
      });
    } else if (onShopClick) {
      onShopClick();
    }
  };

  return (
    <section id="shop" className="collections-section" aria-label="Custom Collections">
      <div className="section-container">
        {/* Section Header */}
        <div className="collections-header">
          <h2 className="collections-title">
            {collections.heading}
          </h2>
          <p className="collections-subtitle">
            {collections.subheading.split('\n').map((line, idx, arr) => (
              <React.Fragment key={idx}>
                {line}
                {idx < arr.length - 1 && <br className="collections-desktop-br" />}
              </React.Fragment>
            ))}
          </p>
          <button
            type="button"
            className="collections-shop-btn"
            onClick={onShopClick || onOpenConsultation}
            id="collections-shop-now-btn"
          >
            {collections.buttonText}
          </button>
        </div>

        {/* Filter Categories Bar */}
        <div className="collections-filter-row">
          <h3 className="collections-filter-title">
            {collections.categoryTitle}
          </h3>

          <div className="collections-tag-list">
            {collections.categories.map((category, idx) => (
              <button
                key={`${category}-${idx}`}
                type="button"
                className={`collection-tag-item ${activeCategory === category && idx === 0 ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
                id={`filter-${category.toLowerCase().replace(/\s+/g, '-')}-${idx}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Row Bento Grid */}
        <div className="collections-bento-grid">
          {/* Row 1: Top Row (Hero + Tall) */}
          <div className="collections-grid-row-top">
            {/* Top Left: Wide Hero Card with Hotspots */}
            <div className="collection-card-hero">
              <img
                src={collections.heroItem.image}
                alt={collections.heroItem.title}
                className="collection-card-img"
                loading="lazy"
              />

              {/* Hotspots */}
              {collections.heroItem.hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className={`hotspot-wrapper ${hotspot.id}`}
                  style={{
                    top: hotspot.position.top,
                    left: hotspot.position.left
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotClick(hotspot);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Enquire about ${hotspot.name.replace('\n', ' ')}`}
                >
                  <div className="hotspot-pin-group">
                    <div className="hotspot-pin-dot" />
                    <div className="hotspot-pin-line" />
                  </div>
                  <div className="hotspot-glass-card">
                    <div className="hotspot-card-title">
                      {hotspot.name.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i === 0 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="hotspot-card-price">
                      <span className="currency-symbol">₹</span>
                      <span className="price-number">{hotspot.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Right: Tall Card */}
            <div
              className="collection-card-item collection-card-top-tall"
              onClick={() => handleCardClick(collections.topTall)}
              role="button"
              tabIndex={0}
              aria-label={`Enquire about ${collections.topTall.title}`}
            >
              <img
                src={collections.topTall.image}
                alt={collections.topTall.title}
                className="collection-card-img"
                loading="lazy"
              />

              {/* Hotspots */}
              {collections.topTall.hotspots && collections.topTall.hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className={`hotspot-wrapper ${hotspot.id}`}
                  style={{
                    top: hotspot.position.top,
                    left: hotspot.position.left
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotClick(hotspot);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Enquire about ${hotspot.name.replace('\n', ' ')}`}
                >
                  <div className="hotspot-pin-group">
                    <div className="hotspot-pin-dot" />
                    <div className="hotspot-pin-line" />
                  </div>
                  <div className="hotspot-glass-card">
                    <div className="hotspot-card-title">
                      {hotspot.name.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i === 0 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="hotspot-card-price">
                      <span className="currency-symbol">₹</span>
                      <span className="price-number">{hotspot.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Bottom Row (3 Equal Cards) */}
          <div className="collections-grid-row-bottom">
            {collections.bottomRow.map((item) => (
              <div
                key={item.id}
                className="collection-card-item collection-card-bottom"
                onClick={() => handleCardClick(item)}
                role="button"
                tabIndex={0}
                aria-label={`Enquire about ${item.title}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="collection-card-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
