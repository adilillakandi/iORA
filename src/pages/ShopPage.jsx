import React, { useState, useEffect } from 'react';
import { shopData } from '../data/shopData';
import { getShopProducts } from '../utils/dataService';
import CtaBanner from '../components/CtaBanner';

export default function ShopPage({ onOpenConsultation, onNavigate }) {
  const { header, categories, products: defaultProducts } = shopData;
  const [products, setProducts] = useState(defaultProducts);
  const [activeCategory, setActiveCategory] = useState('All collections');

  useEffect(() => {
    let mounted = true;
    getShopProducts().then((items) => {
      if (mounted && items && items.length > 0) {
        setProducts(items.filter((p) => p.isPublished !== false));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts =
    activeCategory === 'All collections'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleEnquire = (product) => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${product.name} (${product.tag || product.category})`
      });
    }
  };

  const handleViewDetails = (product) => {
    if (onNavigate) {
      onNavigate('shop-details', product);
    } else {
      handleEnquire(product);
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

                  {/* Price and Finishes Row */}
                  <div className="shop-price-finishes-row">
                    <span className="shop-product-price">{product.price}</span>
                    <div className="shop-material-swatches" aria-label="Available finishes">
                      {product.finishes.map((finish) => (
                        <span
                          key={finish.name}
                          className="shop-swatch-circle"
                          style={{ backgroundColor: finish.color }}
                          title={finish.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="shop-actions-row">
                    <button
                      className="shop-enquire-btn"
                      onClick={() => handleEnquire(product)}
                      id={`enquire-btn-${product.id}`}
                    >
                      Enquire now
                    </button>
                    <button
                      className="shop-details-link"
                      onClick={() => handleViewDetails(product)}
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
