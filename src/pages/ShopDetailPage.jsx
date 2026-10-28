import React, { useState } from 'react';
import { shopDetailData } from '../data/shopDetailData';
import CtaBanner from '../components/CtaBanner';

export default function ShopDetailPage({ onNavigate, onOpenConsultation, selectedProduct }) {
  const {
    header,
    shareIcon,
    configurations,
    seller,
    whatsappAction,
    productDetails,
    reviews
  } = shopDetailData;

  const [selectedConfigId, setSelectedConfigId] = useState(configurations[0]?.id || 'full-set');
  const [copiedShare, setCopiedShare] = useState(false);

  // Active configuration selected by the user
  const activeConfig =
    configurations.find((c) => c.id === selectedConfigId) || configurations[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const rawImage = activeConfig.mainHeroImage || activeConfig.image || selectedProduct?.image || '';
    const fullImageUrl = rawImage
      ? rawImage.startsWith('http')
        ? rawImage
        : `${window.location.origin}${rawImage}`
      : '';

    const text = fullImageUrl
      ? `Hello iORA, I would like to enquire about the ${activeConfig.name} (${activeConfig.price}) from your shop catalog.\n\nProduct Image: ${fullImageUrl}`
      : `Hello iORA, I would like to enquire about the ${activeConfig.name} (${activeConfig.price}) from your shop catalog.`;

    const url = `https://wa.me/917306201202?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuoteConsultation = () => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${activeConfig.name} (${activeConfig.price})`
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
          <h1 className="shop-detail-main-title">{header.title}</h1>
          <p className="shop-detail-subtitle">{header.subtitle}</p>
        </div>

        {/* 2. Main Display (Left Image + Right Details) */}
        <div className="shop-detail-main-display">
          {/* Main Hero Image Frame */}
          <div className="shop-detail-image-box">
            <img
              src={activeConfig.mainHeroImage || activeConfig.image}
              alt={activeConfig.name}
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
              <h2 className="shop-detail-item-title">{activeConfig.name}</h2>
              <div className="shop-detail-item-price">{activeConfig.price}</div>
            </div>

            {/* Quick Specs */}
            <div className="shop-detail-quick-specs">
              <div className="quick-spec-row">
                <span className="spec-label">Size</span>
                <span className="spec-value">{activeConfig.size}</span>
              </div>
              <div className="quick-spec-row">
                <span className="spec-label">Height</span>
                <span className="spec-value">{activeConfig.height}</span>
              </div>
              <div className="quick-spec-row">
                <span className="spec-label">Material</span>
                <span className="spec-value">{activeConfig.material}</span>
              </div>
            </div>

            {/* Description */}
            <div className="shop-detail-desc-box">
              <h3 className="desc-heading">Description</h3>
              <p className="desc-content">{activeConfig.description}</p>
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

        {/* 3. Individual Items Selection Section */}
        <section className="individual-items-section" aria-label="Select Individual Items">
          <h2 className="individual-items-heading">Select Individual Items</h2>

          <div className="individual-cards-grid">
            {configurations.map((item) => {
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
                    <img src={item.image} alt={item.name} loading="lazy" />
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
