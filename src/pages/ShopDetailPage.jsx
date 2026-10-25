import React, { useState, useEffect } from 'react';
import { shopDetailData } from '../data/shopDetailData';
import CtaBanner from '../components/CtaBanner';

export default function ShopDetailPage({ onNavigate, onOpenConsultation, selectedProduct }) {
  const {
    header: defaultHeader,
    shareIcon,
    configurations: defaultConfigurations,
    seller,
    whatsappAction,
    productDetails: defaultProductDetails,
    reviews
  } = shopDetailData;

  // 1. Resolve active product from props or persistent storage (persists on page refresh)
  const activeProduct = selectedProduct || (() => {
    try {
      const saved =
        sessionStorage.getItem('iora_selected_product') ||
        localStorage.getItem('iora_selected_product');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Keep storage in sync whenever selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      try {
        sessionStorage.setItem('iora_selected_product', JSON.stringify(selectedProduct));
        localStorage.setItem('iora_selected_product', JSON.stringify(selectedProduct));
      } catch {
        // ignore
      }
    }
  }, [selectedProduct]);

  // 2. Determine configurations for sets (e.g. Full Bedroom Set) vs standalone items
  const isSet =
    (activeProduct && Array.isArray(activeProduct.configurations) && activeProduct.configurations.length > 0) ||
    (!activeProduct || activeProduct.name?.toLowerCase().includes('bedroom set'));

  const availableConfigs = isSet
    ? activeProduct?.configurations && activeProduct.configurations.length > 0
      ? activeProduct.configurations
      : defaultConfigurations
    : null;

  const [selectedConfigId, setSelectedConfigId] = useState(
    availableConfigs ? availableConfigs[0].id : 'main'
  );
  const [copiedShare, setCopiedShare] = useState(false);

  // Selected sub-configuration if available
  const selectedConfig = availableConfigs
    ? availableConfigs.find((c) => c.id === selectedConfigId) || availableConfigs[0]
    : null;

  // Active product display values
  const activeName = selectedConfig?.name || activeProduct?.name || defaultHeader.title;
  const activePrice = selectedConfig?.price || activeProduct?.price || 'Rs. 49,990';
  const activeImage =
    selectedConfig?.mainHeroImage ||
    selectedConfig?.image ||
    activeProduct?.image ||
    activeProduct?.image_url ||
    defaultConfigurations[0].mainHeroImage;
  const activeSubtitle =
    activeProduct?.tag
      ? `${activeProduct.tag} · ${activeProduct.category || 'Collection'}`
      : defaultHeader.subtitle;
  const activeSize =
    selectedConfig?.size ||
    activeProduct?.dimensions ||
    'Custom specifications upon request';
  const activeHeight = selectedConfig?.height || 'Standard';
  const activeMaterial =
    selectedConfig?.material ||
    activeProduct?.material ||
    'Solid wood & engineered board';
  const activeDescription =
    selectedConfig?.description ||
    activeProduct?.description ||
    'A complete architectural furniture solution designed for modern living. Fuses precision craftsmanship, spatial balance, and enduring materials.';
  const activeFinishes = activeProduct?.finishes || [];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  const handleWhatsAppEnquiry = () => {
    const text = `Hello iORA, I would like to enquire about the ${activeName} (${activePrice}) from your shop catalog.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuoteConsultation = () => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${activeName} (${activePrice})`
      });
    }
  };

  return (
    <div className="shop-detail-page">
      <div className="section-container shop-detail-container">
        {/* Back Link */}
        <div className="shop-detail-nav-row">
          <button
            className="shop-detail-back-btn"
            onClick={() => onNavigate('shop')}
            id="back-to-shop-btn"
          >
            &larr; Back to Shop
          </button>
        </div>

        {/* 1. Title Section */}
        <div className="shop-detail-header-block">
          <h1 className="shop-detail-main-title">{activeName}</h1>
          <p className="shop-detail-subtitle">{activeSubtitle}</p>
        </div>

        {/* 2. Main Display (Left Image + Right Details) */}
        <div className="shop-detail-main-display">
          {/* Main Hero Image Frame */}
          <div className="shop-detail-image-box">
            <img
              src={activeImage}
              alt={activeName}
              className="shop-detail-active-img"
              loading="eager"
            />
            {/* Share Button */}
            <button
              className="shop-detail-share-btn"
              onClick={handleShare}
              title="Share this product"
              aria-label="Share this product"
              id="shop-share-product-btn"
            >
              <img src={shareIcon} alt="Share" />
            </button>
            {copiedShare && (
              <div className="shop-share-toast">Link copied to clipboard!</div>
            )}
          </div>

          {/* Product Details Panel */}
          <div className="shop-detail-info-panel">
            {/* Title & Price */}
            <div className="shop-detail-price-box">
              <h2 className="shop-detail-item-title">{activeName}</h2>
              <div className="shop-detail-item-price">{activePrice}</div>
            </div>

            {/* Quick Specs */}
            <div className="shop-detail-quick-specs">
              <div className="quick-spec-row">
                <span className="spec-label">Size</span>
                <span className="spec-value">{activeSize}</span>
              </div>
              <div className="quick-spec-row">
                <span className="spec-label">Category / Height</span>
                <span className="spec-value">{activeProduct?.category || activeHeight}</span>
              </div>
              <div className="quick-spec-row">
                <span className="spec-label">Material</span>
                <span className="spec-value">{activeMaterial}</span>
              </div>
            </div>

            {/* Available Finishes (if present) */}
            {activeFinishes.length > 0 && (
              <div className="shop-detail-finishes-box" style={{ margin: '1rem 0' }}>
                <span className="spec-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                  Available Finishes
                </span>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  {activeFinishes.map((finish) => (
                    <span
                      key={finish.name}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: finish.color,
                        border: '2px solid rgba(255,255,255,0.4)',
                        display: 'inline-block'
                      }}
                      title={finish.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="shop-detail-desc-box">
              <h3 className="desc-heading">Description</h3>
              <p className="desc-content">{activeDescription}</p>
            </div>

            {/* Sold by / Production Unit Card */}
            <div className="shop-detail-seller-card">
              <div className="seller-logo-frame">
                <img src={seller.logo} alt={seller.name} />
              </div>
              <div className="seller-meta-col">
                <div className="seller-sub">{seller.label}</div>
                <div className="seller-name">{seller.name}</div>
              </div>
              <div className="seller-rating">{seller.rating}</div>
            </div>

            {/* WhatsApp Enquiry Button */}
            <button
              className="shop-detail-whatsapp-btn"
              onClick={handleWhatsAppEnquiry}
              id="shop-whatsapp-enquire-btn"
            >
              <img src={whatsappAction.icon} alt="" aria-hidden="true" />
              <span>{whatsappAction.text}</span>
            </button>
          </div>
        </div>

        {/* 3. Individual Items Selection Section (For sets with configurations) */}
        {availableConfigs && availableConfigs.length > 1 && (
          <section className="individual-items-section" aria-label="Select Individual Items">
            <h2 className="individual-items-heading">Select Individual Items</h2>

            <div className="individual-cards-grid">
              {availableConfigs.map((item) => {
                const isSelected = selectedConfigId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`individual-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedConfigId(item.id)}
                    role="button"
                    tabIndex={0}
                    id={`item-card-${item.id}`}
                  >
                    <div className="item-card-image-wrap">
                      <img src={item.image || item.image_url} alt={item.name} loading="lazy" />
                    </div>

                    <div className="item-card-meta">
                      <h3 className="item-card-title">{item.name}</h3>
                      <div className="item-card-price">{item.price}</div>
                    </div>

                    <button
                      className={`item-select-btn ${isSelected ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConfigId(item.id);
                      }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Product Details (Overview & Specifications side by side) */}
        <section className="product-details-accordion-section" aria-label="Product Details and Specifications">
          <div className="details-section-header">
            <h2 className="details-section-title">{defaultProductDetails.title}</h2>
            <p className="details-section-sub">{defaultProductDetails.subtitle}</p>
          </div>

          <div className="details-cards-grid">
            {/* Overview Card */}
            <div className="product-overview-card">
              <h3 className="card-block-title">{defaultProductDetails.overviewTitle}</h3>
              <div className="card-paragraphs">
                <p>{activeDescription}</p>
                <p>
                  Before ordering, confirm dimensions, finish, delivery timeline, warranty, and installation requirements with our design team.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges-row">
                {defaultProductDetails.badges.map((badge) => (
                  <span key={badge} className="trust-badge-pill">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Specifications Card */}
            <div className="product-specifications-card">
              <h3 className="card-block-title">{defaultProductDetails.specificationsTitle}</h3>
              <div className="specs-table-list">
                <div className="spec-table-row">
                  <span className="spec-table-label">Category</span>
                  <span className="spec-table-val">{activeProduct?.category || 'Furniture & Interior'}</span>
                </div>
                <div className="spec-table-row">
                  <span className="spec-table-label">Size</span>
                  <span className="spec-table-val">{activeSize}</span>
                </div>
                <div className="spec-table-row">
                  <span className="spec-table-label">Material</span>
                  <span className="spec-table-val">{activeMaterial}</span>
                </div>
                <div className="spec-table-row">
                  <span className="spec-table-label">Price</span>
                  <span className="spec-table-val">{activePrice}</span>
                </div>
                <div className="spec-table-row">
                  <span className="spec-table-label">Assembly</span>
                  <span className="spec-table-val">Confirm before order</span>
                </div>
                <div className="spec-table-row">
                  <span className="spec-table-label">Finish</span>
                  <span className="spec-table-val">
                    {activeFinishes.length > 0
                      ? activeFinishes.map((f) => f.name).join(', ')
                      : 'Confirm before order'}
                  </span>
                </div>
                <div className="spec-table-row">
                  <span className="spec-table-label">Delivery</span>
                  <span className="spec-table-val">Confirm before order</span>
                </div>
              </div>

              {/* Trust Note */}
              <div className="trust-note-box">
                <div className="trust-note-header">{defaultProductDetails.trustNoteTitle}</div>
                <p className="trust-note-text">{defaultProductDetails.trustNoteText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Reviews Section */}
        <section className="shop-reviews-section" aria-label="Customer Reviews">
          <div className="reviews-card-container">
            <div className="reviews-card-header">
              <h3 className="card-block-title">{reviews.title}</h3>
              <span className="reviews-count-tag">{reviews.countText}</span>
            </div>

            <div className="reviews-empty-state">
              <h4 className="empty-state-title">{reviews.emptyTitle}</h4>
              <p className="empty-state-desc">{reviews.emptyText}</p>
            </div>
          </div>
        </section>
      </div>

      {/* 6. CTA Banner */}
      <CtaBanner onOpenConsultation={handleQuoteConsultation} />
    </div>
  );
}
