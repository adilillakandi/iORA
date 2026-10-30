import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Search,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  UserCheck
} from 'lucide-react';
import {
  getPortfolioProjects,
  createPortfolioProject,
  deletePortfolioProject,
  togglePortfolioPublished,
  uploadImageToStorage,
  fileToBase64
} from '../utils/dataService';
import AdminLoginPage from './AdminLoginPage';
import { checkAdminSession, logoutAdmin } from '../utils/authService';

export default function AdminPage({ onNavigate }) {
  // Authentication state
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    email: null,
    loading: true
  });
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

  // Auth verification check
  useEffect(() => {
    let isMounted = true;
    checkAdminSession().then((session) => {
      if (isMounted) {
        setAuthStatus({
          isAuthenticated: session.isAuthenticated,
          email: session.email,
          loading: false
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthStatus({
      isAuthenticated: false,
      email: null,
      loading: false
    });
    showToast('Signed out of admin portal');
  };

  // Initial data loading
  useEffect(() => {
    let isMounted = true;
    if (authStatus.isAuthenticated) {
      getPortfolioProjects().then((items) => {
        if (isMounted) {
          setPortfolioList(items);
          setPortfolioLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [authStatus.isAuthenticated]);

  // Portfolio upload handlers
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

  // Filtered portfolio list
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

  // Authentication loading screen
  if (authStatus.loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-pulse">
          <RefreshCw size={32} className="spin-animate admin-gold-icon" />
          <p>Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, render the Luxury Admin Login Page
  if (!authStatus.isAuthenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={(user) => {
          setAuthStatus({
            isAuthenticated: true,
            email: user?.email || 'ksidanbasheer@gmail.com',
            loading: false
          });
          loadPortfolio();
          showToast('Welcome back, Administrator');
        }}
        onBackToSite={() => onNavigate('home')}
      />
    );
  }

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

          <div className="admin-topbar-actions">
            <div className="admin-user-badge" title="Authenticated Administrator">
              <UserCheck size={14} className="admin-gold-icon" />
              <span className="admin-user-email">
                {authStatus.email || 'ksidanbasheer@gmail.com'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Sign out of admin session"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Portal Container */}
      <main className="admin-main-container">
        {/* Navigation / Header Row */}
        <div className="admin-tabs-row">
          <div className="admin-nav-tabs">
            <div className="admin-tab-btn active">
              <ImageIcon size={18} />
              <span>Portfolio Projects ({portfolioList.length})</span>
            </div>
          </div>

          <div className="admin-tab-quick-action">
            <button
              className="admin-primary-btn"
              onClick={() => setShowAddPortfolio(!showAddPortfolio)}
            >
              <Plus size={16} />
              <span>
                {showAddPortfolio ? 'Cancel Upload' : 'Upload Portfolio Project'}
              </span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* PORTFOLIO MANAGEMENT */}
        {/* ================================================================= */}
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
                            JPG, PNG, WebP up to 15MB
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
                        placeholder="e.g. Minimalist Villa Horizon"
                        value={newPortfolio.title}
                        onChange={(e) =>
                          setNewPortfolio({ ...newPortfolio, title: e.target.value })
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

                    <div className="admin-field-row">
                      <label className="admin-field-label">Subtitle / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Architectural balance & bespoke wood millwork"
                        value={newPortfolio.subtitle}
                        onChange={(e) =>
                          setNewPortfolio({
                            ...newPortfolio,
                            subtitle: e.target.value
                          })
                        }
                        className="admin-input-text"
                      />
                    </div>

                    <div className="admin-form-actions">
                      <button
                        type="button"
                        onClick={() => setShowAddPortfolio(false)}
                        className="admin-cancel-btn"
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
      </main>
    </div>
  );
}
