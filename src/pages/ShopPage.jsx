import React, { useState } from 'react';
import { shopData } from '../data/shopData';
import CtaBanner from '../components/CtaBanner';

export default function ShopPage({ onOpenConsultation, onNavigate }) {
  const { header, categories, products } = shopData;
  const [activeCategory, setActiveCategory] = useState('All collections');

  const rawFilteredProducts =
    activeCategory === 'All collections'
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Deduplicate products so each unique piece appears only once
  const filteredProducts = [];
  const seenProducts = new Set();
  for (const product of rawFilteredProducts) {
    const key = product.image || product.name;
    if (!seenProducts.has(key)) {
      seenProducts.add(key);
      filteredProducts.push(product);
    }
  }

  const handleViewDetails = (product) => {
    if (onNavigate) {
      onNavigate('shop-details', product);
    }
  };

  return (
    <div className="shop-page">
      {/* 1. Collection Catalog Section */}
      <section className="shop-catalog-section" aria-label="Product Catalog">
        <div className="section-container">
          {/* Catalog Title */}
          <div className="shop-heading-row">
            <h1 className="shop-catalog-title">{header.title}</h1>
          </div>

          {/* Categories Filter Tabs */}
          <div className="shop-filter-bar">
            <div className="shop-categories-list" role="tablist">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isSelected}
                    className={`shop-category-tab ${isSelected ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                    id={`shop-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="shop-products-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="shop-product-card">
                {/* Product Photograph */}
                <div
                  className="shop-product-image-frame"
                  onClick={() => handleViewDetails(product)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${product.name}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                  <div className="shop-product-image-overlay">
                    <span className="shop-overlay-tag">{product.category}</span>
                  </div>
                </div>

                {/* Product Information */}
                <div className="shop-product-info">
                  <span className="shop-product-tag">{product.tag}</span>
                  <h2 className="shop-product-name">{product.name}</h2>

                  {/* Price Row */}
                  <div className="shop-price-finishes-row">
                    <span className="shop-product-price">{product.price}</span>
                    <button
                      type="button"
                      className="shop-price-view-btn"
                      onClick={() => handleViewDetails(product)}
                      id={`view-details-${product.id}`}
                      aria-label={`View details for ${product.name}`}
                    >
                      View details ↗
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CTA Banner */}
      <CtaBanner
        onOpenConsultation={() =>
          onOpenConsultation && onOpenConsultation({ productName: 'Custom Collection Consultation' })
        }
      />
    </div>
  );
}
