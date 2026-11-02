import React, { useState, useEffect } from 'react';
import { shopDetailData } from '../data/shopDetailData';
import { getShopProducts } from '../utils/dataService';
import CtaBanner from '../components/CtaBanner';

function formatPriceWithRs(rawPrice) {
  if (!rawPrice) return '';
  const priceStr = String(rawPrice).trim();
  if (
    priceStr.toLowerCase().includes('price') ||
    priceStr.toLowerCase().includes('request') ||
    priceStr.toLowerCase().includes('included')
  ) {
    return priceStr;
  }
  // Strip any leading ₹, Rs, Rs., INR, or extra spaces
  const cleanNumber = priceStr.replace(/^(₹|Rs\.?|INR)\s*/i, '').trim();
  return `Rs. ${cleanNumber}`;
}

export default function ShopDetailPage({ onNavigate, onOpenConsultation, selectedProduct }) {
  const {
    shareIcon,
    seller,
    whatsappAction,
    reviews
  } = shopDetailData;

  // 1. Current Product State
  const [currentProduct, setCurrentProduct] = useState(() => {
    if (selectedProduct && (selectedProduct.name || selectedProduct.title)) {
      return selectedProduct;
    }
    try {
      const saved =
        sessionStorage.getItem('iora_selected_product') ||
        localStorage.getItem('iora_selected_product');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      id: 'default-bedroom-set',
      name: shopDetailData.header.title,
      category: 'Bedroom',
      tag: 'Bedroom · Curated Collection',
      price: 'Rs. 49,990',
      image: '/assets/images/d51fda44e364.jpg',
      dimensions: '90x200 cm (Bed)',
      material: 'Particleboard, Fiberboard & Oak veneer',
      description:
        'A complete bedroom solution designed for modern living. Includes a high bed frame, a spacious wardrobe, and a bedside box for optimal storage and comfort.',
      configurations: shopDetailData.configurations
    };
  });

  // Keep current product updated if prop changes
  useEffect(() => {
    if (selectedProduct && (selectedProduct.name || selectedProduct.title)) {
      setCurrentProduct(selectedProduct);
    }
  }, [selectedProduct]);

  // Merge latest database data for this product if available
  useEffect(() => {
    let mounted = true;
    getShopProducts().then((all) => {
      if (!mounted || !all || all.length === 0) return;
      const match = all.find(
        (p) =>
          (currentProduct?.id && p.id === currentProduct.id) ||
          (currentProduct?.name && p.name?.toLowerCase() === currentProduct.name?.toLowerCase())
      );
      if (match) {
        setCurrentProduct((prev) => ({ ...prev, ...match }));
      }
    });
    return () => {
      mounted = false;
    };
  }, [currentProduct?.id, currentProduct?.name]);

  // 2. Build Selectable Individual Items List
  const rawSubItems =
    Array.isArray(currentProduct?.individual_items) && currentProduct.individual_items.length > 0
      ? currentProduct.individual_items
      : Array.isArray(currentProduct?.individualItems) && currentProduct.individualItems.length > 0
        ? currentProduct.individualItems
        : Array.isArray(currentProduct?.configurations) && currentProduct.configurations.length > 0
          ? currentProduct.configurations
          : null;

  let items = [];
  if (rawSubItems && rawSubItems.length > 0) {
    const hasCompleteSet = rawSubItems.some(
      (it) =>
        it.id === 'full-set' ||
        (it.name && it.name.toLowerCase().includes('complete set')) ||
        (it.name && currentProduct.name && it.name.toLowerCase() === currentProduct.name.toLowerCase())
    );

    const subItems = rawSubItems.map((sub, idx) => ({
      id: sub.id || `item-${idx}`,
      name: sub.name || `Component ${idx + 1}`,
      price: sub.price || 'Price on request',
      image: sub.image || sub.image_url || sub.mainHeroImage || currentProduct.image,
      mainHeroImage: sub.mainHeroImage || sub.image || sub.image_url || currentProduct.image,
      size: sub.dimensions || sub.size || currentProduct.dimensions || 'Bespoke Sizing',
      height: sub.height || 'Custom',
      material: sub.material || currentProduct.material || 'Solid Wood & Premium Finishes',
      description: sub.description || `Individual component from the ${currentProduct.name} collection.`
    }));

    if (hasCompleteSet) {
      items = subItems;
    } else {
      const completeSet = {
        id: 'full-set',
        name: `${currentProduct.name} (Complete Set)`,
        price: currentProduct.price,
        image: currentProduct.image || currentProduct.image_url,
        mainHeroImage: currentProduct.image || currentProduct.image_url,
        size: currentProduct.dimensions || 'Full Suite Dimensions',
        height: 'Standard',
        material: currentProduct.material || 'Solid Wood & Premium Finishes',
        description:
          currentProduct.description ||
          'Complete curated collection including all individual components.'
      };
      items = [completeSet, ...subItems];
    }
  } else if (
    !currentProduct?.id ||
    currentProduct.id === 'default-bedroom-set' ||
    currentProduct.id === 'p-1' ||
    (currentProduct.name && currentProduct.name.toLowerCase().includes('bedroom set'))
  ) {
    items = shopDetailData.configurations;
  } else {
    items = [
      {
        id: 'main-piece',
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.image || currentProduct.image_url,
        mainHeroImage: currentProduct.image || currentProduct.image_url,
        size: currentProduct.dimensions || 'Custom Sizing',
        height: 'Custom',
        material: currentProduct.material || 'Solid Wood & Premium Finishes',
        description:
          currentProduct.description ||
          'Designed and crafted to exacting bespoke architectural standards.'
      }
    ];
  }

  // 3. Active Selected Item State
  const resolveInitialId = () => {
    if (selectedProduct?.configId) {
      const found = items.find((i) => i.id === selectedProduct.configId);
      if (found) return found.id;
    }
    return items[0]?.id || 'full-set';
  };

  const [selectedItemId, setSelectedItemId] = useState(resolveInitialId);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync selected item when product or items change
  useEffect(() => {
    if (selectedProduct?.configId) {
      const match = items.find((i) => i.id === selectedProduct.configId);
      if (match) {
        setSelectedItemId(match.id);
        return;
      }
    }
    if (!items.some((i) => i.id === selectedItemId)) {
      setSelectedItemId(items[0]?.id || 'full-set');
    }
  }, [selectedProduct, currentProduct, items]);

  const activeItem = items.find((c) => c.id === selectedItemId) || items[0] || {};

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const rawImage =
      activeItem.mainHeroImage || activeItem.image || currentProduct.image || '';
    const fullImageUrl = rawImage
      ? rawImage.startsWith('http')
        ? rawImage
        : `${window.location.origin}${rawImage}`
      : '';

    const formattedPrice = formatPriceWithRs(activeItem.price);
    const text = `Hello iORA, I would like to enquire about "${activeItem.name}" (${formattedPrice}) from the "${currentProduct.name}" collection.\n\nProduct Link: ${window.location.href}${
      fullImageUrl ? `\n\nImage: ${fullImageUrl}` : ''
    }`;

    const url = `https://wa.me/917306201202?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuoteConsultation = () => {
    if (onOpenConsultation) {
      onOpenConsultation({
        productName: `${currentProduct.name} — ${activeItem.name} (${formatPriceWithRs(activeItem.price)})`
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
            &larr; Back to Shop Catalog
          </button>
        </div>

        {/* 1. Title Section */}
        <div className="shop-detail-header-block">
          {currentProduct.category && (
            <div className="shop-detail-category-tag">
              {currentProduct.category} Collection
            </div>
          )}
          <h1 className="shop-detail-main-title">{currentProduct.name}</h1>
          <p className="shop-detail-subtitle">
            {currentProduct.tag ||
              'Complete your interior with our curated collection. Select individual items or the full package below.'}
          </p>
        </div>

        {/* 2. Main Display (Left Image + Right Details) */}
        <div className="shop-detail-main-display">
          {/* Main Hero Image Frame */}
          <div className="shop-detail-image-box">
            <img
              src={activeItem.mainHeroImage || activeItem.image || currentProduct.image}
              alt={activeItem.name || currentProduct.name}
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
              <h2 className="shop-detail-item-title">{activeItem.name}</h2>
              <div className="shop-detail-item-price">{formatPriceWithRs(activeItem.price)}</div>
            </div>

            <div className="shop-detail-quick-specs">
              <div className="quick-spec-row">
                <span className="spec-label">Size</span>
                <span className="spec-value">
                  {activeItem.size ||
                    activeItem.dimensions ||
                    currentProduct.dimensions ||
                    'Bespoke Sizing'}
                </span>
              </div>
              <div className="quick-spec-row">
                <span className="spec-label">Height / Style</span>
                <span className="spec-value">{activeItem.height || 'Custom'}</span>
              </div>
              <div className="quick-spec-row">
                <span className="spec-label">Material</span>
                <span className="spec-value">
                  {activeItem.material ||
                    currentProduct.material ||
                    'Solid Timber & Custom Hardware'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="shop-detail-desc-box">
              <h3 className="desc-heading">Description</h3>
              <p className="desc-content">
                {activeItem.description ||
                  currentProduct.description ||
                  'Architectural millwork designed and engineered to exacting bespoke standards.'}
              </p>
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
          <div className="individual-items-header-row">
            <div>
              <h2 className="individual-items-heading">Select Individual Items</h2>
            </div>
            <span className="individual-items-count">
              {items.length} {items.length === 1 ? 'Configuration' : 'Configurations'}
            </span>
          </div>

          <div className="individual-cards-grid">
            {items.map((item) => {
              const isSelected = activeItem.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`individual-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedItemId(item.id)}
                  role="button"
                  tabIndex={0}
                  id={`item-card-${item.id}`}
                >
                  <div className="item-card-image-wrap">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    {isSelected && <span className="item-card-active-pill">Active</span>}
                  </div>

                  <div className="item-card-meta">
                    <h3 className="item-card-title">{item.name}</h3>
                    <div className="item-card-price">{formatPriceWithRs(item.price)}</div>
                  </div>

                  <button
                    className={`item-select-btn ${isSelected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                    }}
                  >
                    {isSelected ? 'Selected ✓' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Reviews & Quality Assurance Section */}
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

      {/* 5. CTA Banner */}
      <CtaBanner onOpenConsultation={handleQuoteConsultation} />
    </div>
  );
}
