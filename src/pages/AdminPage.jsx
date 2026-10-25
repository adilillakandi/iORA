import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ShoppingBag,
  Search,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  getPortfolioProjects,
  createPortfolioProject,
  deletePortfolioProject,
  togglePortfolioPublished,
  getShopProducts,
  createShopProduct,
  deleteShopProduct,
  toggleShopPublished,
  uploadImageToStorage,
  fileToBase64
} from '../utils/dataService';

export default function AdminPage({ onNavigate }) {
  // Navigation tabs: 'portfolio' | 'shop'
  const [activeTab, setActiveTab] = useState('portfolio');

  // Portfolio items state
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('All');
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [portfolioSearch, setPortfolioSearch] = useState('');

  // New Portfolio Form
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    subtitle: '',
    category: 'Residential',
    display_order: 0,
    is_published: true
  });
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreviewUrl, setPortfolioPreviewUrl] = useState('');
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false);
  const portfolioFileRef = useRef(null);

  // Shop items state
  const [shopList, setShopList] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopCategoryFilter, setShopCategoryFilter] = useState('All');
  const [showAddShop, setShowAddShop] = useState(false);
  const [shopSearch, setShopSearch] = useState('');

  // New Shop Form
  const [newShop, setNewShop] = useState({
    name: '',
    category: 'Bedroom',
    tag: '',
    price: 'Rs. 49,990',
    description: '',
    dimensions: '',
    material: '',
    display_order: 0,
    is_published: true
  });
  const [shopFile, setShopFile] = useState(null);
  const [shopPreviewUrl, setShopPreviewUrl] = useState('');
  const [shopSubmitting, setShopSubmitting] = useState(false);
  const shopFileRef = useRef(null);

  // Toast / notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPortfolio = async () => {
    setPortfolioLoading(true);
    const items = await getPortfolioProjects();
    setPortfolioList(items);
    setPortfolioLoading(false);
  };

  const loadShop = async () => {
    setShopLoading(true);
    const items = await getShopProducts();
    setShopList(items);
    setShopLoading(false);
  };

  // Initial data loading
  useEffect(() => {
    let isMounted = true;
    getPortfolioProjects().then((items) => {
      if (isMounted) {
        setPortfolioList(items);
        setPortfolioLoading(false);
      }
    });
    getShopProducts().then((items) => {
      if (isMounted) {
        setShopList(items);
        setShopLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Portfolio upload handlers
  const handlePortfolioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortfolioFile(file);
      setPortfolioPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    if (!newPortfolio.title.trim()) {
      showToast('Project title is required', 'error');
      return;
    }
    if (!portfolioFile && !portfolioPreviewUrl) {
      showToast('Please select a project image to upload', 'error');
      return;
    }

    setPortfolioSubmitting(true);
    try {
      let imageUrl = '';
      if (portfolioFile) {
        try {
          imageUrl = await uploadImageToStorage('portfolio', portfolioFile);
        } catch {
          imageUrl = await fileToBase64(portfolioFile);
        }
      } else {
        imageUrl = portfolioPreviewUrl;
      }

      const { error, isLocal } = await createPortfolioProject({
        ...newPortfolio,
        image_url: imageUrl
      });

      if (isLocal) {
        showToast('Project uploaded and displayed in portfolio!', 'success');
      } else if (error) {
        throw error;
      } else {
        showToast('Portfolio project uploaded successfully!');
      }

      // Reset form
      setNewPortfolio({
        title: '',
        subtitle: '',
        category: 'Residential',
        display_order: portfolioList.length + 1,
        is_published: true
      });
      setPortfolioFile(null);
      setPortfolioPreviewUrl('');
      setShowAddPortfolio(false);
      loadPortfolio();
    } catch (err) {
      showToast(`Error creating project: ${err.message}`, 'error');
    } finally {
      setPortfolioSubmitting(false);
    }
  };

  const handleDeletePortfolio = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    const { error } = await deletePortfolioProject(id);
    if (error) {
      showToast(`Delete failed: ${error.message}`, 'error');
    } else {
      showToast(`Deleted "${title}"`);
      loadPortfolio();
    }
  };

  const handleTogglePortfolio = async (id, currentStatus) => {
    await togglePortfolioPublished(id, currentStatus);
    setPortfolioList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPublished: !currentStatus } : item
      )
    );
    showToast(`Project visibility updated`);
  };

  // 2. Shop upload handlers
  const handleShopFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setShopFile(file);
      setShopPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShop.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!shopFile && !shopPreviewUrl) {
      showToast('Please select a product image to upload', 'error');
      return;
    }

    setShopSubmitting(true);
    try {
      let imageUrl = '';
      if (shopFile) {
        try {
          imageUrl = await uploadImageToStorage('shop', shopFile);
        } catch {
          imageUrl = await fileToBase64(shopFile);
        }
      } else {
        imageUrl = shopPreviewUrl;
      }

      const { error, isLocal } = await createShopProduct({
        ...newShop,
        tag: newShop.tag || `${newShop.category} · Collection`,
        image_url: imageUrl
      });

      if (isLocal) {
        showToast('Product added and displayed in shop catalog!', 'success');
      } else if (error) {
        throw error;
      } else {
        showToast('Shop product added successfully!');
      }

      // Reset form
      setNewShop({
        name: '',
        category: 'Bedroom',
        tag: '',
        price: 'Rs. 49,990',
        description: '',
        dimensions: '',
        material: '',
        display_order: shopList.length + 1,
        is_published: true
      });
      setShopFile(null);
      setShopPreviewUrl('');
      setShowAddShop(false);
      loadShop();
    } catch (err) {
      showToast(`Error creating product: ${err.message}`, 'error');
    } finally {
      setShopSubmitting(false);
    }
  };

  const handleDeleteShop = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const { error } = await deleteShopProduct(id);
    if (error) {
      showToast(`Delete failed: ${error.message}`, 'error');
    } else {
      showToast(`Deleted "${name}"`);
      loadShop();
    }
  };

  const handleToggleShop = async (id, currentStatus) => {
    await toggleShopPublished(id, currentStatus);
    setShopList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPublished: !currentStatus } : item
      )
    );
    showToast(`Product visibility updated`);
  };

  // Filtered lists
  const filteredPortfolio = portfolioList
    .filter((p) =>
      portfolioCategoryFilter === 'All'
        ? true
        : p.category.toLowerCase() === portfolioCategoryFilter.toLowerCase()
    )
    .filter(
      (p) =>
        p.title.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(portfolioSearch.toLowerCase())
    );

  const filteredShop = shopList
    .filter((s) =>
      shopCategoryFilter === 'All'
        ? true
        : s.category.toLowerCase() === shopCategoryFilter.toLowerCase()
    )
    .filter(
      (s) =>
        s.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
        s.tag?.toLowerCase().includes(shopSearch.toLowerCase())
    );

  return (
    <div className="iora-admin-portal">
      {/* Toast alert */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand-col">
            <button
              onClick={() => onNavigate('home')}
              className="admin-back-site-btn"
              title="Return to website"
            >
              <ArrowLeft size={16} />
              <span>Website</span>
            </button>
            <div className="admin-brand-divider" />
            <div className="admin-brand-title">
              <span className="brand-accent">iORA</span> Studio Admin
            </div>
          </div>
        </div>
      </header>

      {/* Main Portal Container */}
      <main className="admin-main-container">
        {/* Navigation Tabs */}
        <div className="admin-tabs-row">
          <div className="admin-nav-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              <ImageIcon size={18} />
              <span>Portfolio Projects ({portfolioList.length})</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              <ShoppingBag size={18} />
              <span>Shop Catalog ({shopList.length})</span>
            </button>
          </div>

          <div className="admin-tab-quick-action">
            {activeTab === 'portfolio' && (
              <button
                className="admin-primary-btn"
                onClick={() => setShowAddPortfolio(!showAddPortfolio)}
              >
                <Plus size={16} />
                <span>
                  {showAddPortfolio ? 'Cancel Upload' : 'Upload Portfolio Project'}
                </span>
              </button>
            )}
            {activeTab === 'shop' && (
              <button
                className="admin-primary-btn"
                onClick={() => setShowAddShop(!showAddShop)}
              >
                <Plus size={16} />
                <span>{showAddShop ? 'Cancel Product' : 'Add Shop Product'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: PORTFOLIO MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'portfolio' && (
          <div className="admin-view-section">
            {/* Upload Collapsible Card */}
            {showAddPortfolio && (
              <div className="admin-form-card">
                <div className="admin-form-header">
                  <div className="admin-form-title-wrap">
                    <UploadCloud className="admin-icon-gold" size={24} />
                    <div>
                      <h2 className="admin-form-heading">Upload New Portfolio Project</h2>
                      <p className="admin-form-sub">
                        Upload photography for the website portfolio. Uploaded projects immediately display in the portfolio section.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreatePortfolio} className="admin-upload-form">
                  <div className="admin-form-grid">
                    {/* Image dropzone */}
                    <div className="admin-dropzone-col">
                      <label className="admin-field-label">Project Photograph *</label>
                      <div
                        className={`admin-dropzone ${portfolioPreviewUrl ? 'has-preview' : ''}`}
                        onClick={() => portfolioFileRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={portfolioFileRef}
                          onChange={handlePortfolioFileChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        {portfolioPreviewUrl ? (
                          <div className="admin-dropzone-preview">
                            <img src={portfolioPreviewUrl} alt="Upload Preview" />
                            <div className="admin-dropzone-overlay">
                              <RefreshCw size={20} />
                              <span>Click to change photograph</span>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-dropzone-empty">
                            <UploadCloud size={44} className="admin-icon-muted" />
                            <div className="admin-dropzone-txt">
                              <strong>Click to choose image</strong> or drag and drop
                            </div>
                            <span className="admin-dropzone-hint">
                              JPG, PNG, WebP up to 10MB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="admin-fields-col">
                      <div className="admin-field-row">
                        <label className="admin-field-label">Project Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. The Crest Residence"
                          value={newPortfolio.title}
                          onChange={(e) =>
                            setNewPortfolio({ ...newPortfolio, title: e.target.value })
                          }
                          className="admin-input-text"
                        />
                      </div>

                      <div className="admin-field-row">
                        <label className="admin-field-label">Subtitle / Room Space</label>
                        <input
                          type="text"
                          placeholder="e.g. Master Bedroom Suite or Living Sanctuary"
                          value={newPortfolio.subtitle}
                          onChange={(e) =>
                            setNewPortfolio({ ...newPortfolio, subtitle: e.target.value })
                          }
                          className="admin-input-text"
                        />
                      </div>

                      <div className="admin-field-two-col">
                        <div>
                          <label className="admin-field-label">Category *</label>
                          <select
                            value={newPortfolio.category}
                            onChange={(e) =>
                              setNewPortfolio({
                                ...newPortfolio,
                                category: e.target.value
                              })
                            }
                            className="admin-select"
                          >
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Construction">Construction</option>
                            <option value="Modular Kitchen">Modular Kitchen</option>
                            <option value="Turnkey">Turnkey</option>
                          </select>
                        </div>

                        <div>
                          <label className="admin-field-label">Display Order</label>
                          <input
                            type="number"
                            value={newPortfolio.display_order}
                            onChange={(e) =>
                              setNewPortfolio({
                                ...newPortfolio,
                                display_order: parseInt(e.target.value) || 0
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-publish-row">
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={newPortfolio.is_published}
                            onChange={(e) =>
                              setNewPortfolio({
                                ...newPortfolio,
                                is_published: e.target.checked
                              })
                            }
                          />
                          <span>Publish immediately to website portfolio</span>
                        </label>
                      </div>

                      <div className="admin-form-submit-row">
                        <button
                          type="button"
                          className="admin-cancel-btn"
                          onClick={() => setShowAddPortfolio(false)}
                          disabled={portfolioSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-submit-btn"
                          disabled={portfolioSubmitting}
                        >
                          {portfolioSubmitting ? (
                            <>
                              <RefreshCw size={16} className="spin-animate" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud size={16} />
                              <span>Upload Project</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-category-pills">
                {['All', 'Residential', 'Commercial', 'Construction', 'Modular Kitchen'].map(
                  (cat) => (
                    <button
                      key={cat}
                      className={`admin-cat-pill ${
                        portfolioCategoryFilter === cat ? 'active' : ''
                      }`}
                      onClick={() => setPortfolioCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <div className="admin-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={portfolioSearch}
                  onChange={(e) => setPortfolioSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            {/* Projects Grid */}
            {portfolioLoading ? (
              <div className="admin-loading-box">
                <RefreshCw size={24} className="spin-animate" />
                <span>Loading portfolio items...</span>
              </div>
            ) : filteredPortfolio.length === 0 ? (
              <div className="admin-empty-box">
                <ImageIcon size={48} className="admin-icon-muted" />
                <h3>No portfolio projects found</h3>
                <p>Click "Upload Portfolio Project" above to add your first item.</p>
              </div>
            ) : (
              <div className="admin-items-grid">
                {filteredPortfolio.map((item) => (
                  <div key={item.id} className="admin-item-card">
                    <div className="admin-card-thumb-wrap">
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <span className="admin-card-category-badge">{item.category}</span>
                      <button
                        className={`admin-status-badge ${
                          item.isPublished ? 'published' : 'draft'
                        }`}
                        onClick={() =>
                          handleTogglePortfolio(item.id, item.isPublished)
                        }
                        title="Click to toggle publish status"
                      >
                        {item.isPublished ? (
                          <>
                            <Eye size={12} />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="admin-card-body">
                      <h3 className="admin-card-title">{item.title}</h3>
                      {item.subtitle && (
                        <p className="admin-card-subtitle">{item.subtitle}</p>
                      )}

                      <div className="admin-card-meta-row">
                        <span className="admin-order-tag">Order #{item.displayOrder}</span>
                        <button
                          onClick={() =>
                            handleDeletePortfolio(item.id, item.title)
                          }
                          className="admin-delete-btn"
                          title="Delete this project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SHOP CATALOG MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'shop' && (
          <div className="admin-view-section">
            {/* Upload Collapsible Card */}
            {showAddShop && (
              <div className="admin-form-card">
                <div className="admin-form-header">
                  <div className="admin-form-title-wrap">
                    <ShoppingBag className="admin-icon-gold" size={24} />
                    <div>
                      <h2 className="admin-form-heading">Add New Shop Product</h2>
                      <p className="admin-form-sub">
                        Upload custom furniture or interior piece. Uploaded products immediately display in the website Shop section.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateShop} className="admin-upload-form">
                  <div className="admin-form-grid">
                    {/* Image dropzone */}
                    <div className="admin-dropzone-col">
                      <label className="admin-field-label">Product Photograph *</label>
                      <div
                        className={`admin-dropzone ${shopPreviewUrl ? 'has-preview' : ''}`}
                        onClick={() => shopFileRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={shopFileRef}
                          onChange={handleShopFileChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        {shopPreviewUrl ? (
                          <div className="admin-dropzone-preview">
                            <img src={shopPreviewUrl} alt="Upload Preview" />
                            <div className="admin-dropzone-overlay">
                              <RefreshCw size={20} />
                              <span>Click to change photograph</span>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-dropzone-empty">
                            <UploadCloud size={44} className="admin-icon-muted" />
                            <div className="admin-dropzone-txt">
                              <strong>Click to choose image</strong> or drag and drop
                            </div>
                            <span className="admin-dropzone-hint">
                              JPG, PNG, WebP up to 10MB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="admin-fields-col">
                      <div className="admin-field-row">
                        <label className="admin-field-label">Product Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sculptural-mirror dressing console"
                          value={newShop.name}
                          onChange={(e) =>
                            setNewShop({ ...newShop, name: e.target.value })
                          }
                          className="admin-input-text"
                        />
                      </div>

                      <div className="admin-field-two-col">
                        <div>
                          <label className="admin-field-label">Category *</label>
                          <select
                            value={newShop.category}
                            onChange={(e) =>
                              setNewShop({ ...newShop, category: e.target.value })
                            }
                            className="admin-select"
                          >
                            <option value="Bedroom">Bedroom</option>
                            <option value="Living room">Living room</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Workspace">Workspace</option>
                            <option value="Dining">Dining</option>
                          </select>
                        </div>

                        <div>
                          <label className="admin-field-label">Price *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rs. 49,990 or Price on request"
                            value={newShop.price}
                            onChange={(e) =>
                              setNewShop({ ...newShop, price: e.target.value })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-field-two-col">
                        <div>
                          <label className="admin-field-label">Tag / Collection</label>
                          <input
                            type="text"
                            placeholder="e.g. Bedroom · Custom interior"
                            value={newShop.tag}
                            onChange={(e) =>
                              setNewShop({ ...newShop, tag: e.target.value })
                            }
                            className="admin-input-text"
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Display Order</label>
                          <input
                            type="number"
                            value={newShop.display_order}
                            onChange={(e) =>
                              setNewShop({
                                ...newShop,
                                display_order: parseInt(e.target.value) || 0
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-field-two-col">
                        <div>
                          <label className="admin-field-label">Dimensions</label>
                          <input
                            type="text"
                            placeholder="e.g. 90x200 cm (Bed)"
                            value={newShop.dimensions}
                            onChange={(e) =>
                              setNewShop({ ...newShop, dimensions: e.target.value })
                            }
                            className="admin-input-text"
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Materials</label>
                          <input
                            type="text"
                            placeholder="e.g. Particleboard, Fiberboard"
                            value={newShop.material}
                            onChange={(e) =>
                              setNewShop({ ...newShop, material: e.target.value })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-publish-row">
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={newShop.is_published}
                            onChange={(e) =>
                              setNewShop({
                                ...newShop,
                                is_published: e.target.checked
                              })
                            }
                          />
                          <span>Publish immediately in website shop</span>
                        </label>
                      </div>

                      <div className="admin-form-submit-row">
                        <button
                          type="button"
                          className="admin-cancel-btn"
                          onClick={() => setShowAddShop(false)}
                          disabled={shopSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-submit-btn"
                          disabled={shopSubmitting}
                        >
                          {shopSubmitting ? (
                            <>
                              <RefreshCw size={16} className="spin-animate" />
                              <span>Saving Product...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud size={16} />
                              <span>Add to Catalog</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-category-pills">
                {['All', 'Bedroom', 'Living room', 'Kitchen', 'Workspace', 'Dining'].map(
                  (cat) => (
                    <button
                      key={cat}
                      className={`admin-cat-pill ${
                        shopCategoryFilter === cat ? 'active' : ''
                      }`}
                      onClick={() => setShopCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <div className="admin-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            {/* Products Grid */}
            {shopLoading ? (
              <div className="admin-loading-box">
                <RefreshCw size={24} className="spin-animate" />
                <span>Loading shop catalog...</span>
              </div>
            ) : filteredShop.length === 0 ? (
              <div className="admin-empty-box">
                <ShoppingBag size={48} className="admin-icon-muted" />
                <h3>No shop products found</h3>
                <p>Click "Add Shop Product" above to create your first product.</p>
              </div>
            ) : (
              <div className="admin-items-grid">
                {filteredShop.map((item) => (
                  <div key={item.id} className="admin-item-card">
                    <div className="admin-card-thumb-wrap">
                      <img src={item.image} alt={item.name} loading="lazy" />
                      <span className="admin-card-category-badge">{item.category}</span>
                      <button
                        className={`admin-status-badge ${
                          item.isPublished ? 'published' : 'draft'
                        }`}
                        onClick={() => handleToggleShop(item.id, item.isPublished)}
                        title="Click to toggle publish status"
                      >
                        {item.isPublished ? (
                          <>
                            <Eye size={12} />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="admin-card-body">
                      <div className="admin-card-price-row">
                        <span className="admin-product-price-pill">{item.price}</span>
                      </div>
                      <h3 className="admin-card-title">{item.name}</h3>
                      {item.tag && (
                        <p className="admin-card-subtitle">{item.tag}</p>
                      )}

                      <div className="admin-card-meta-row">
                        <span className="admin-order-tag">Order #{item.displayOrder}</span>
                        <button
                          onClick={() => handleDeleteShop(item.id, item.name)}
                          className="admin-delete-btn"
                          title="Delete this product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
