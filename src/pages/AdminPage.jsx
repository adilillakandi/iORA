import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ShoppingBag,
  Search,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  UserCheck,
  Package,
  Sliders,
  Layers
} from 'lucide-react';
import {
  getPortfolioProjects,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  togglePortfolioPublished,
  syncLocalPortfoliosToSupabase,
  getShopProducts,
  createShopProduct,
  updateShopProduct,
  deleteShopProduct,
  toggleShopPublished,
  syncLocalShopToSupabase,
  getNarrativeSlides,
  createNarrativeSlide,
  updateNarrativeSlide,
  deleteNarrativeSlide,
  toggleNarrativeSlidePublished,
  syncLocalNarrativeToSupabase,
  getWhatWeDoServices,
  createWhatWeDoService,
  updateWhatWeDoService,
  deleteWhatWeDoService,
  toggleWhatWeDoServicePublished,
  syncLocalWhatWeDoToSupabase,
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

  // Active section tab: 'portfolio' or 'shop'
  const [activeTab, setActiveTab] = useState('portfolio');

  // Portfolio items state
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('All');
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const portfolioFormRef = useRef(null);

  // New/Edit Portfolio Form
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    subtitle: '',
    category: 'Residential',
    display_order: 0,
    is_published: true,
    the_idea_title: '',
    the_idea_description: '',
    specifications_note: 'Illustrative project narrative and sample specifications. Not verified client details.'
  });
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreviewUrl, setPortfolioPreviewUrl] = useState('');
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false);
  const portfolioFileRef = useRef(null);

  // Specifications state for portfolio project
  const [portfolioSpecs, setPortfolioSpecs] = useState([
    { id: 'spec-1', label: 'AREA', value: '' },
    { id: 'spec-2', label: 'LOCATION', value: '' },
    { id: 'spec-3', label: 'TYPOLOGY', value: '' },
    { id: 'spec-4', label: 'YEAR', value: '' },
    { id: 'spec-5', label: 'SCOPE', value: '' },
    { id: 'spec-6', label: 'PALETTE', value: '' }
  ]);

  // Gallery items state for portfolio project
  const [portfolioGallery, setPortfolioGallery] = useState([]);
  const portfolioGalleryInputRef = useRef(null);

  // Shop items state
  const [shopList, setShopList] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopCategoryFilter, setShopCategoryFilter] = useState('All');
  const [showAddShop, setShowAddShop] = useState(false);
  const [shopSearch, setShopSearch] = useState('');
  const [editingShopId, setEditingShopId] = useState(null);
  const shopFormRef = useRef(null);

  // New/Edit Shop Product Form
  const [newShopProduct, setNewShopProduct] = useState({
    name: '',
    category: 'Bedroom',
    tag: '',
    price: '',
    description: '',
    dimensions: '',
    material: '',
    display_order: 0,
    is_published: true
  });
  const [shopFile, setShopFile] = useState(null);
  const [shopPreviewUrl, setShopPreviewUrl] = useState('');
  const [shopIndividualItems, setShopIndividualItems] = useState([]);
  const [shopSubmitting, setShopSubmitting] = useState(false);
  const shopFileRef = useRef(null);

  // Narrative / Homepage Carousel state
  const [narrativeList, setNarrativeList] = useState([]);
  const [narrativeLoading, setNarrativeLoading] = useState(true);
  const [showAddNarrative, setShowAddNarrative] = useState(false);
  const [narrativeSearch, setNarrativeSearch] = useState('');
  const [editingNarrativeId, setEditingNarrativeId] = useState(null);
  const narrativeFormRef = useRef(null);

  const [newNarrative, setNewNarrative] = useState({
    title: '',
    width: 425,
    height: 350,
    display_order: 0,
    is_published: true
  });
  const [narrativeFile, setNarrativeFile] = useState(null);
  const [narrativePreviewUrl, setNarrativePreviewUrl] = useState('');
  const [narrativeSubmitting, setNarrativeSubmitting] = useState(false);
  const narrativeFileRef = useRef(null);

  // What We Do section state
  const [whatWeDoList, setWhatWeDoList] = useState([]);
  const [whatWeDoLoading, setWhatWeDoLoading] = useState(true);
  const [showAddWhatWeDo, setShowAddWhatWeDo] = useState(false);
  const [whatWeDoSearch, setWhatWeDoSearch] = useState('');
  const [editingWhatWeDoId, setEditingWhatWeDoId] = useState(null);
  const whatWeDoFormRef = useRef(null);

  const [newWhatWeDo, setNewWhatWeDo] = useState({
    name: '',
    description: '',
    width: 583,
    height: 359,
    display_order: 0,
    is_published: true
  });
  const [whatWeDoFile, setWhatWeDoFile] = useState(null);
  const [whatWeDoPreviewUrl, setWhatWeDoPreviewUrl] = useState('');
  const [whatWeDoSubmitting, setWhatWeDoSubmitting] = useState(false);
  const whatWeDoFileRef = useRef(null);

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

  const loadNarrative = async () => {
    setNarrativeLoading(true);
    const items = await getNarrativeSlides();
    setNarrativeList(items);
    setNarrativeLoading(false);
  };

  const loadWhatWeDo = async () => {
    setWhatWeDoLoading(true);
    const items = await getWhatWeDoServices();
    setWhatWeDoList(items);
    setWhatWeDoLoading(false);
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

  // Initial data loading for all sections
  useEffect(() => {
    let isMounted = true;
    if (authStatus.isAuthenticated) {
      // Auto-sync any previously stuck local items to database
      syncLocalPortfoliosToSupabase()
        .then((res) => {
          if (res && res.synced > 0) {
            showToast(`Synced ${res.synced} local portfolio project(s) to database!`);
          }
          if (isMounted) loadPortfolio();
        })
        .catch(() => {
          if (isMounted) loadPortfolio();
        });

      syncLocalShopToSupabase()
        .then((res) => {
          if (res && res.synced > 0) {
            showToast(`Synced ${res.synced} local shop product(s) to database!`);
          }
          if (isMounted) loadShop();
        })
        .catch(() => {
          if (isMounted) loadShop();
        });

      syncLocalNarrativeToSupabase()
        .then((res) => {
          if (res && res.synced > 0) {
            showToast(`Synced ${res.synced} carousel slide(s) to database!`);
          }
          if (isMounted) loadNarrative();
        })
        .catch(() => {
          if (isMounted) loadNarrative();
        });

      syncLocalWhatWeDoToSupabase()
        .then((res) => {
          if (res && res.synced > 0) {
            showToast(`Synced ${res.synced} service(s) to database!`);
          }
          if (isMounted) loadWhatWeDo();
        })
        .catch(() => {
          if (isMounted) loadWhatWeDo();
        });
    }
    return () => {
      isMounted = false;
    };
  }, [authStatus.isAuthenticated]);

  // =========================================================================
  // PORTFOLIO HANDLERS
  // =========================================================================
  const handlePortfolioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortfolioFile(file);
      setPortfolioPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPortfolioSpec = () => {
    setPortfolioSpecs((prev) => [
      ...prev,
      {
        id: `spec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        label: '',
        value: ''
      }
    ]);
  };

  const handleRemovePortfolioSpec = (id) => {
    setPortfolioSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdatePortfolioSpec = (id, fields) => {
    setPortfolioSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...fields } : s))
    );
  };

  const handleAddPortfolioGalleryItem = () => {
    setPortfolioGallery((prev) => [
      ...prev,
      {
        id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        image: '',
        alt: '',
        isUploading: false
      }
    ]);
  };

  const handleRemovePortfolioGalleryItem = (id) => {
    setPortfolioGallery((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdatePortfolioGalleryItem = (id, fields) => {
    setPortfolioGallery((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...fields } : g))
    );
  };

  const handlePortfolioGalleryFileChange = async (id, file) => {
    if (!file) return;
    handleUpdatePortfolioGalleryItem(id, { isUploading: true });
    try {
      let url = '';
      try {
        url = await uploadImageToStorage('portfolio', file);
      } catch {
        url = await fileToBase64(file);
      }
      handleUpdatePortfolioGalleryItem(id, { image: url, isUploading: false });
      showToast('Gallery photograph uploaded!');
    } catch {
      handleUpdatePortfolioGalleryItem(id, { isUploading: false });
      showToast('Failed to upload gallery photograph', 'error');
    }
  };

  const handleMultiGalleryFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    e.target.value = '';
    showToast(`Uploading ${files.length} gallery photograph${files.length > 1 ? 's' : ''}...`);

    for (const file of files) {
      const tempId = `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setPortfolioGallery((prev) => [
        ...prev,
        {
          id: tempId,
          image: '',
          alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          isUploading: true
        }
      ]);

      try {
        let url = '';
        try {
          url = await uploadImageToStorage('portfolio', file);
        } catch {
          url = await fileToBase64(file);
        }
        setPortfolioGallery((prev) =>
          prev.map((g) => (g.id === tempId ? { ...g, image: url, isUploading: false } : g))
        );
      } catch {
        setPortfolioGallery((prev) =>
          prev.map((g) => (g.id === tempId ? { ...g, isUploading: false } : g))
        );
      }
    }
    showToast('Gallery photographs ready!');
  };

  const handleEditPortfolio = (item) => {
    setEditingPortfolioId(item.id);

    // Normalize specs
    let specs = [];
    let note = item.specificationsNote || item.specifications_note || '';
    const rawSpecs = item.specifications;
    if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
      specs = rawSpecs.map((s, idx) => ({
        id: s.id || `spec-${idx}`,
        label: s.label || '',
        value: s.value || ''
      }));
    } else if (rawSpecs && typeof rawSpecs === 'object' && Array.isArray(rawSpecs.items)) {
      specs = rawSpecs.items.map((s, idx) => ({
        id: s.id || `spec-${idx}`,
        label: s.label || '',
        value: s.value || ''
      }));
      if (!note && rawSpecs.note) note = rawSpecs.note;
    } else {
      specs = [
        { id: 'spec-1', label: 'AREA', value: '' },
        { id: 'spec-2', label: 'LOCATION', value: '' },
        { id: 'spec-3', label: 'TYPOLOGY', value: '' },
        { id: 'spec-4', label: 'YEAR', value: '' },
        { id: 'spec-5', label: 'SCOPE', value: '' },
        { id: 'spec-6', label: 'PALETTE', value: '' }
      ];
    }
    setPortfolioSpecs(specs);

    // Normalize gallery
    const rawGallery = item.galleryImages || item.gallery_images || [];
    const galleryItems = Array.isArray(rawGallery)
      ? rawGallery
          .map((g, idx) => ({
            id: g.id || `gal-${Date.now()}-${idx}`,
            image: typeof g === 'string' ? g : (g.image || g.image_url || g.url || ''),
            alt: typeof g === 'string' ? '' : (g.alt || g.caption || ''),
            isUploading: false
          }))
          .filter((g) => Boolean(g.image))
      : [];
    setPortfolioGallery(galleryItems);

    setNewPortfolio({
      title: item.title || '',
      subtitle: item.subtitle || '',
      category: item.category || 'Residential',
      display_order: item.displayOrder ?? 0,
      is_published: item.isPublished ?? true,
      the_idea_title: item.theIdeaTitle || item.the_idea_title || '',
      the_idea_description: item.theIdeaDescription || item.the_idea_description || '',
      specifications_note: note || 'Illustrative project narrative and sample specifications. Not verified client details.'
    });
    setPortfolioPreviewUrl(item.image || item.image_url || '');
    setPortfolioFile(null);
    setShowAddPortfolio(true);
    setTimeout(() => {
      portfolioFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleCancelPortfolio = () => {
    setEditingPortfolioId(null);
    setNewPortfolio({
      title: '',
      subtitle: '',
      category: 'Residential',
      display_order: portfolioList.length + 1,
      is_published: true,
      the_idea_title: '',
      the_idea_description: '',
      specifications_note: 'Illustrative project narrative and sample specifications. Not verified client details.'
    });
    setPortfolioSpecs([
      { id: `spec-${Date.now()}-1`, label: 'AREA', value: '' },
      { id: `spec-${Date.now()}-2`, label: 'LOCATION', value: '' },
      { id: `spec-${Date.now()}-3`, label: 'TYPOLOGY', value: '' },
      { id: `spec-${Date.now()}-4`, label: 'YEAR', value: '' },
      { id: `spec-${Date.now()}-5`, label: 'SCOPE', value: '' },
      { id: `spec-${Date.now()}-6`, label: 'PALETTE', value: '' }
    ]);
    setPortfolioGallery([]);
    setPortfolioFile(null);
    setPortfolioPreviewUrl('');
    setShowAddPortfolio(false);
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    if (!newPortfolio.title.trim()) {
      showToast('Project title is required', 'error');
      return;
    }
    if (!portfolioFile && !portfolioPreviewUrl) {
      showToast('Please select a project photograph to upload', 'error');
      return;
    }

    setPortfolioSubmitting(true);
    try {
      let imageUrl = portfolioPreviewUrl;
      if (portfolioFile) {
        try {
          imageUrl = await uploadImageToStorage('portfolio', portfolioFile);
        } catch {
          imageUrl = await fileToBase64(portfolioFile);
        }
      }

      // Filter valid specifications
      const cleanedSpecs = portfolioSpecs
        .filter((s) => s.label.trim() || s.value.trim())
        .map((s) => ({ label: s.label.trim().toUpperCase(), value: s.value.trim() }));

      // Clean gallery images
      const cleanedGallery = portfolioGallery
        .filter((g) => Boolean(g.image))
        .map((g) => ({
          id: g.id,
          image: g.image,
          alt: g.alt?.trim() || newPortfolio.title.trim()
        }));

      const portfolioPayload = {
        title: newPortfolio.title.trim(),
        subtitle: newPortfolio.subtitle?.trim() || '',
        category: newPortfolio.category,
        display_order: parseInt(newPortfolio.display_order) || 0,
        is_published: Boolean(newPortfolio.is_published),
        image_url: imageUrl,
        the_idea_title: newPortfolio.the_idea_title?.trim() || '',
        the_idea_description: newPortfolio.the_idea_description?.trim() || '',
        specifications: {
          items: cleanedSpecs,
          note: newPortfolio.specifications_note?.trim() || ''
        },
        gallery_images: cleanedGallery
      };

      if (editingPortfolioId) {
        const { error } = await updatePortfolioProject(editingPortfolioId, portfolioPayload);
        if (error) throw error;
        showToast('Portfolio project updated successfully!');
      } else {
        const { error, isLocal } = await createPortfolioProject(portfolioPayload);

        if (isLocal) {
          showToast('Project uploaded and displayed in portfolio!', 'success');
        } else if (error) {
          throw error;
        } else {
          showToast('Portfolio project uploaded successfully!');
        }
      }

      handleCancelPortfolio();
      loadPortfolio();
    } catch (err) {
      showToast(`Error saving project: ${err.message}`, 'error');
    } finally {
      setPortfolioSubmitting(false);
    }
  };

  const handleDeletePortfolio = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    // Optimistic UI removal
    setPortfolioList((prev) => prev.filter((item) => item.id !== id));
    const { error } = await deletePortfolioProject(id);
    if (error) {
      showToast(`Delete failed: ${error.message}`, 'error');
      loadPortfolio();
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
    showToast('Project visibility updated');
  };

  // =========================================================================
  // SHOP HANDLERS
  // =========================================================================
  const handleShopFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setShopFile(file);
      setShopPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddShopIndividualItem = () => {
    setShopIndividualItems((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        price: '',
        image: '',
        dimensions: '',
        material: '',
        description: '',
        isUploading: false
      }
    ]);
  };

  const handleRemoveShopIndividualItem = (id) => {
    setShopIndividualItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateShopIndividualItem = (id, fields) => {
    setShopIndividualItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...fields } : item))
    );
  };

  const handleIndividualItemFileChange = async (id, file) => {
    if (!file) return;
    handleUpdateShopIndividualItem(id, { isUploading: true });
    try {
      let url = '';
      try {
        url = await uploadImageToStorage('shop', file);
      } catch {
        url = await fileToBase64(file);
      }
      handleUpdateShopIndividualItem(id, { image: url, isUploading: false });
      showToast('Item photo attached!');
    } catch {
      handleUpdateShopIndividualItem(id, { isUploading: false });
      showToast('Failed to attach item photo', 'error');
    }
  };

  const handleEditShop = (item) => {
    setEditingShopId(item.id);
    const existingItems =
      item.individual_items || item.individualItems || item.configurations || [];
    setShopIndividualItems(
      Array.isArray(existingItems)
        ? existingItems.map((c, idx) => ({
            id: c.id || `sub-${Date.now()}-${idx}`,
            name: c.name || '',
            price: c.price || '',
            image: c.image || c.image_url || c.mainHeroImage || '',
            dimensions: c.dimensions || c.size || '',
            material: c.material || '',
            description: c.description || '',
            isUploading: false
          }))
        : []
    );
    setNewShopProduct({
      name: item.name,
      category: item.category || 'Bedroom',
      tag: item.tag || '',
      price: item.price || '',
      description: item.description || '',
      dimensions: item.dimensions || '',
      material: item.material || '',
      display_order: item.displayOrder ?? 0,
      is_published: item.isPublished ?? true
    });
    setShopPreviewUrl(item.image);
    setShopFile(null);
    setShowAddShop(true);
    setTimeout(() => {
      shopFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleCancelShop = () => {
    setEditingShopId(null);
    setShopIndividualItems([]);
    setNewShopProduct({
      name: '',
      category: 'Bedroom',
      tag: '',
      price: '',
      description: '',
      dimensions: '',
      material: '',
      display_order: shopList.length + 1,
      is_published: true
    });
    setShopFile(null);
    setShopPreviewUrl('');
    setShowAddShop(false);
  };

  const handleCreateShopProduct = async (e) => {
    e.preventDefault();
    if (!newShopProduct.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!shopFile && !shopPreviewUrl) {
      showToast('Please select a product image to upload', 'error');
      return;
    }

    setShopSubmitting(true);
    try {
      let imageUrl = shopPreviewUrl;
      if (shopFile) {
        try {
          imageUrl = await uploadImageToStorage('shop', shopFile);
        } catch {
          imageUrl = await fileToBase64(shopFile);
        }
      }

      const formattedPrice = newShopProduct.price.trim()
        ? newShopProduct.price.trim().startsWith('₹') ||
          newShopProduct.price.trim().startsWith('Rs') ||
          newShopProduct.price.toLowerCase().includes('price')
          ? newShopProduct.price.trim()
          : `₹ ${newShopProduct.price.trim()}`
        : 'Price on request';

      const tag = newShopProduct.tag.trim()
        ? newShopProduct.tag.trim()
        : `${newShopProduct.category} · Collection`;

      // Clean and normalize individual items
      const cleanedItems = shopIndividualItems
        .filter((it) => (it.name && it.name.trim()) || it.image)
        .map((it, idx) => {
          const rawPrice = it.price ? it.price.trim() : '';
          const formattedItemPrice = rawPrice
            ? rawPrice.startsWith('₹') ||
              rawPrice.startsWith('Rs') ||
              rawPrice.toLowerCase().includes('price') ||
              rawPrice.toLowerCase().includes('included')
              ? rawPrice
              : `₹ ${rawPrice}`
            : 'Price on request';

          return {
            id: it.id || `sub-${Date.now()}-${idx}`,
            name: it.name.trim() || `Component ${idx + 1}`,
            price: formattedItemPrice,
            image: it.image || imageUrl,
            mainHeroImage: it.image || imageUrl,
            dimensions: it.dimensions || '',
            size: it.dimensions || '',
            material: it.material || '',
            description: it.description || ''
          };
        });

      if (editingShopId) {
        const { error } = await updateShopProduct(editingShopId, {
          ...newShopProduct,
          price: formattedPrice,
          tag,
          image_url: imageUrl,
          individual_items: cleanedItems,
          configurations: cleanedItems
        });
        if (error) throw error;
        showToast('Shop product updated successfully!');
      } else {
        const { error, isLocal } = await createShopProduct({
          ...newShopProduct,
          price: formattedPrice,
          tag,
          image_url: imageUrl,
          individual_items: cleanedItems,
          configurations: cleanedItems
        });

        if (isLocal) {
          showToast('Product uploaded and displayed in shop catalog!', 'success');
        } else if (error) {
          throw error;
        } else {
          showToast('Shop product uploaded successfully!');
        }
      }

      handleCancelShop();
      loadShop();
    } catch (err) {
      showToast(`Error saving product: ${err.message}`, 'error');
    } finally {
      setShopSubmitting(false);
    }
  };

  const handleDeleteShop = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the shop?`)) return;
    // Optimistic UI removal
    setShopList((prev) => prev.filter((item) => item.id !== id));
    const { error } = await deleteShopProduct(id);
    if (error) {
      showToast(`Delete failed: ${error.message}`, 'error');
      loadShop();
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
    showToast('Product visibility updated');
  };

  // =========================================================================
  // NARRATIVE CAROUSEL HANDLERS
  // =========================================================================
  const handleNarrativeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNarrativeFile(file);
      setNarrativePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditNarrative = (item) => {
    setEditingNarrativeId(item.id);
    setNewNarrative({
      title: item.title || '',
      width: item.width || 425,
      height: item.height || 350,
      display_order: item.displayOrder ?? 0,
      is_published: item.isPublished ?? true
    });
    setNarrativePreviewUrl(item.image || item.image_url);
    setNarrativeFile(null);
    setShowAddNarrative(true);
    setTimeout(() => {
      narrativeFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleCancelNarrative = () => {
    setEditingNarrativeId(null);
    setNewNarrative({
      title: '',
      width: 425,
      height: 350,
      display_order: narrativeList.length + 1,
      is_published: true
    });
    setNarrativeFile(null);
    setNarrativePreviewUrl('');
    setShowAddNarrative(false);
  };

  const handleCreateNarrative = async (e) => {
    e.preventDefault();
    if (!narrativeFile && !narrativePreviewUrl) {
      showToast('Please select a slide image to upload', 'error');
      return;
    }

    setNarrativeSubmitting(true);
    try {
      let imageUrl = narrativePreviewUrl;
      if (narrativeFile) {
        try {
          imageUrl = await uploadImageToStorage('portfolio', narrativeFile);
        } catch {
          imageUrl = await fileToBase64(narrativeFile);
        }
      }

      if (editingNarrativeId) {
        const { error } = await updateNarrativeSlide(editingNarrativeId, {
          ...newNarrative,
          image_url: imageUrl
        });
        if (error) throw error;
        showToast('Carousel slide updated successfully!');
      } else {
        const { error, isLocal } = await createNarrativeSlide({
          ...newNarrative,
          image_url: imageUrl
        });

        if (isLocal) {
          showToast('Slide saved locally. Please run SQL script to sync globally.', 'warning');
        } else if (error) {
          throw error;
        } else {
          showToast('Carousel slide uploaded and published successfully!');
        }
      }

      handleCancelNarrative();
      loadNarrative();
    } catch (err) {
      showToast(`Error saving slide: ${err.message}`, 'error');
    } finally {
      setNarrativeSubmitting(false);
    }
  };

  const handleDeleteNarrative = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete this slide "${title || 'Untitled'}"?`)) return;
    setNarrativeList((prev) => prev.filter((item) => item.id !== id));
    const { error } = await deleteNarrativeSlide(id);
    if (error) {
      showToast(`Delete failed: ${error.message || error}`, 'error');
      loadNarrative();
    } else {
      showToast('Deleted carousel slide');
      loadNarrative();
    }
  };

  const handleToggleNarrative = async (id, currentStatus) => {
    await toggleNarrativeSlidePublished(id, currentStatus);
    setNarrativeList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPublished: !currentStatus } : item
      )
    );
    showToast('Slide visibility updated');
  };

  // =========================================================================
  // WHAT WE DO SERVICES HANDLERS
  // =========================================================================
  const handleWhatWeDoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setWhatWeDoFile(file);
      setWhatWeDoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditWhatWeDo = (item) => {
    setEditingWhatWeDoId(item.id);
    setNewWhatWeDo({
      name: item.name || '',
      description: item.description || '',
      width: item.width || 583,
      height: item.height || 359,
      display_order: item.displayOrder ?? 0,
      is_published: item.isPublished ?? true
    });
    setWhatWeDoPreviewUrl(item.image || item.image_url);
    setWhatWeDoFile(null);
    setShowAddWhatWeDo(true);
    setTimeout(() => {
      whatWeDoFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleCancelWhatWeDo = () => {
    setEditingWhatWeDoId(null);
    setNewWhatWeDo({
      name: '',
      description: '',
      width: 583,
      height: 359,
      display_order: whatWeDoList.length + 1,
      is_published: true
    });
    setWhatWeDoFile(null);
    setWhatWeDoPreviewUrl('');
    setShowAddWhatWeDo(false);
  };

  const handleCreateWhatWeDo = async (e) => {
    e.preventDefault();
    if (!newWhatWeDo.name.trim()) {
      showToast('Service name is required', 'error');
      return;
    }
    if (!newWhatWeDo.description.trim()) {
      showToast('Service description text is required', 'error');
      return;
    }
    if (!whatWeDoFile && !whatWeDoPreviewUrl) {
      showToast('Please select a photograph for this service', 'error');
      return;
    }

    setWhatWeDoSubmitting(true);
    try {
      let imageUrl = whatWeDoPreviewUrl;
      if (whatWeDoFile) {
        try {
          imageUrl = await uploadImageToStorage('portfolio', whatWeDoFile);
        } catch {
          imageUrl = await fileToBase64(whatWeDoFile);
        }
      }

      if (editingWhatWeDoId) {
        const { error } = await updateWhatWeDoService(editingWhatWeDoId, {
          ...newWhatWeDo,
          image_url: imageUrl
        });
        if (error) throw error;
        showToast('Service updated successfully!');
      } else {
        const { error, isLocal } = await createWhatWeDoService({
          ...newWhatWeDo,
          image_url: imageUrl
        });

        if (isLocal) {
          showToast('Service saved locally. Please run SQL script to sync globally.', 'warning');
        } else if (error) {
          throw error;
        } else {
          showToast('Service created and published successfully!');
        }
      }

      handleCancelWhatWeDo();
      loadWhatWeDo();
    } catch (err) {
      showToast(`Error saving service: ${err.message}`, 'error');
    } finally {
      setWhatWeDoSubmitting(false);
    }
  };

  const handleDeleteWhatWeDo = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from What We Do?`)) return;
    setWhatWeDoList((prev) => prev.filter((item) => item.id !== id));
    const { error } = await deleteWhatWeDoService(id);
    if (error) {
      showToast(`Delete failed: ${error.message || error}`, 'error');
      loadWhatWeDo();
    } else {
      showToast(`Deleted service "${name}"`);
      loadWhatWeDo();
    }
  };

  const handleToggleWhatWeDo = async (id, currentStatus) => {
    await toggleWhatWeDoServicePublished(id, currentStatus);
    setWhatWeDoList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPublished: !currentStatus } : item
      )
    );
    showToast('Service visibility updated');
  };

  // Filtered lists
  const filteredNarrative = narrativeList.filter((item) => {
    if (!narrativeSearch.trim()) return true;
    return (item.title || '').toLowerCase().includes(narrativeSearch.toLowerCase());
  });

  const filteredWhatWeDo = whatWeDoList.filter((item) => {
    if (!whatWeDoSearch.trim()) return true;
    const query = whatWeDoSearch.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query)
    );
  });

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

  // Filtered shop list
  const filteredShop = shopList
    .filter((p) =>
      shopCategoryFilter === 'All'
        ? true
        : p.category?.toLowerCase() === shopCategoryFilter.toLowerCase()
    )
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(shopSearch.toLowerCase()) ||
        p.tag?.toLowerCase().includes(shopSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(shopSearch.toLowerCase())
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
          loadShop();
          loadNarrative();
          loadWhatWeDo();
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
        {/* Navigation Tabs Row */}
        <div className="admin-tabs-row">
          <div className="admin-nav-tabs">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              <ImageIcon size={18} />
              <span>Portfolio ({portfolioList.length})</span>
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              <ShoppingBag size={18} />
              <span>Shop ({shopList.length})</span>
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'narrative' ? 'active' : ''}`}
              onClick={() => setActiveTab('narrative')}
            >
              <Sliders size={18} />
              <span>Carousel ({narrativeList.length})</span>
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'what-we-do' ? 'active' : ''}`}
              onClick={() => setActiveTab('what-we-do')}
            >
              <Layers size={18} />
              <span>What We Do ({whatWeDoList.length})</span>
            </button>
          </div>

          <div className="admin-tab-quick-action">
            {activeTab === 'portfolio' ? (
              <button
                className="admin-primary-btn"
                onClick={() => {
                  if (showAddPortfolio) {
                    handleCancelPortfolio();
                  } else {
                    setEditingPortfolioId(null);
                    setShowAddPortfolio(true);
                  }
                }}
              >
                <Plus size={16} />
                <span>
                  {showAddPortfolio ? 'Cancel Form' : 'Upload Portfolio Project'}
                </span>
              </button>
            ) : activeTab === 'shop' ? (
              <button
                className="admin-primary-btn"
                onClick={() => {
                  if (showAddShop) {
                    handleCancelShop();
                  } else {
                    setEditingShopId(null);
                    setShowAddShop(true);
                  }
                }}
              >
                <Plus size={16} />
                <span>
                  {showAddShop ? 'Cancel Form' : 'Upload Product to Shop'}
                </span>
              </button>
            ) : activeTab === 'narrative' ? (
              <button
                className="admin-primary-btn"
                onClick={() => {
                  if (showAddNarrative) {
                    handleCancelNarrative();
                  } else {
                    setEditingNarrativeId(null);
                    setShowAddNarrative(true);
                  }
                }}
              >
                <Plus size={16} />
                <span>
                  {showAddNarrative ? 'Cancel Form' : 'Add Carousel Slide'}
                </span>
              </button>
            ) : (
              <button
                className="admin-primary-btn"
                onClick={() => {
                  if (showAddWhatWeDo) {
                    handleCancelWhatWeDo();
                  } else {
                    setEditingWhatWeDoId(null);
                    setShowAddWhatWeDo(true);
                  }
                }}
              >
                <Plus size={16} />
                <span>
                  {showAddWhatWeDo ? 'Cancel Form' : 'Add What We Do Service'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 1. PORTFOLIO MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'portfolio' && (
          <div className="admin-view-section">
            {/* Upload / Edit Collapsible Card */}
            {showAddPortfolio && (
              <div className="admin-form-card" ref={portfolioFormRef}>
                <div className="admin-form-header">
                  <div className="admin-form-title-wrap">
                    {editingPortfolioId ? (
                      <Pencil className="admin-icon-gold" size={24} />
                    ) : (
                      <UploadCloud className="admin-icon-gold" size={24} />
                    )}
                    <div>
                      <h2 className="admin-form-heading">
                        {editingPortfolioId ? 'Edit Portfolio Project' : 'Upload New Portfolio Project'}
                      </h2>
                      <p className="admin-form-sub">
                        {editingPortfolioId
                          ? 'Update project details, category, or replace the photograph.'
                          : 'Upload photography for the website portfolio. Uploaded projects immediately display in the portfolio section.'}
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
                          <span>Published (Visible on live portfolio)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* SUBSECTIONS: The Idea, Specifications, Gallery */}
                  <div className="admin-portfolio-subsections">
                    {/* 1. The Idea */}
                    <div className="admin-sub-card">
                      <div className="admin-sub-card-header">
                        <div className="admin-section-subtitle-wrap">
                          <h3 className="admin-sub-card-title">
                            <Layers size={18} />
                            The Idea — Vision & Story
                          </h3>
                          <span className="admin-sub-card-hint">
                            This headline and narrative story are displayed in the primary overview section of the project page under &quot;THE IDEA&quot;.
                          </span>
                        </div>
                      </div>

                      <div className="admin-field-row">
                        <label className="admin-field-label">Idea Headline / Heading</label>
                        <input
                          type="text"
                          placeholder="e.g. Soft light. Earthy tones. A quiet place to unwind."
                          value={newPortfolio.the_idea_title}
                          onChange={(e) =>
                            setNewPortfolio({
                              ...newPortfolio,
                              the_idea_title: e.target.value
                            })
                          }
                          className="admin-input-text"
                        />
                      </div>

                      <div className="admin-field-row">
                        <label className="admin-field-label">Idea Narrative / Story Paragraphs</label>
                        <textarea
                          rows={4}
                          placeholder="e.g. A restful bedroom at The Crest Residence pairs an olive-green upholstered bed with botanical wallpaper and warm wood detailing. Sheer curtains soften the daylight, while layered bedding adds texture and a sense of ease.&#10;&#10;White bedside tables, sculptural lighting and a curved lounge chair complete the space, balancing everyday comfort with understated elegance."
                          value={newPortfolio.the_idea_description}
                          onChange={(e) =>
                            setNewPortfolio({
                              ...newPortfolio,
                              the_idea_description: e.target.value
                            })
                          }
                          className="admin-textarea"
                        />
                        <span className="admin-field-hint" style={{ marginTop: '4px' }}>
                          Separate paragraphs with a blank line. Each paragraph will be formatted with luxury spacing on the project details page.
                        </span>
                      </div>
                    </div>

                    {/* 2. Project at a Glance / Specifications */}
                    <div className="admin-sub-card">
                      <div className="admin-sub-card-header">
                        <div className="admin-section-subtitle-wrap">
                          <h3 className="admin-sub-card-title">
                            <Sliders size={18} />
                            Project at a Glance — Specifications
                            <span className="admin-items-count-badge">
                              {portfolioSpecs.length} {portfolioSpecs.length === 1 ? 'item' : 'items'}
                            </span>
                          </h3>
                          <span className="admin-sub-card-hint">
                            Architectural facts displayed in the project overview grid (e.g. AREA, LOCATION, TYPOLOGY, YEAR, SCOPE, PALETTE). Enter values or add custom rows.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPortfolioSpec}
                          className="admin-add-item-btn"
                        >
                          <Plus size={16} />
                          <span>Add Specification</span>
                        </button>
                      </div>

                      <div className="admin-specs-grid-editor">
                        {portfolioSpecs.map((spec) => (
                          <div key={spec.id} className="admin-spec-item-row">
                            <input
                              type="text"
                              placeholder="LABEL"
                              value={spec.label}
                              onChange={(e) =>
                                handleUpdatePortfolioSpec(spec.id, { label: e.target.value.toUpperCase() })
                              }
                              className="admin-spec-label-input"
                              title="Specification label (e.g. AREA, LOCATION)"
                            />
                            <input
                              type="text"
                              placeholder="Value (e.g. 2,400 sq ft)"
                              value={spec.value}
                              onChange={(e) =>
                                handleUpdatePortfolioSpec(spec.id, { value: e.target.value })
                              }
                              className="admin-spec-value-input"
                              title="Specification value"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePortfolioSpec(spec.id)}
                              className="admin-spec-remove-btn"
                              title="Remove specification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="admin-field-row" style={{ marginTop: '0.5rem' }}>
                        <label className="admin-field-label">Specifications Footnote / Note</label>
                        <input
                          type="text"
                          placeholder="e.g. Illustrative project narrative and sample specifications. Not verified client details."
                          value={newPortfolio.specifications_note}
                          onChange={(e) =>
                            setNewPortfolio({
                              ...newPortfolio,
                              specifications_note: e.target.value
                            })
                          }
                          className="admin-input-text"
                        />
                      </div>
                    </div>

                    {/* 3. Project Gallery Photographs */}
                    <div className="admin-sub-card">
                      <div className="admin-sub-card-header">
                        <div className="admin-section-subtitle-wrap">
                          <h3 className="admin-sub-card-title">
                            <ImageIcon size={18} />
                            Inside the Residence — Gallery Photographs
                            <span className="admin-items-count-badge">
                              {portfolioGallery.length} {portfolioGallery.length === 1 ? 'photo' : 'photos'}
                            </span>
                          </h3>
                          <span className="admin-sub-card-hint">
                            Upload project photography. Photos are automatically formatted into architectural pairs and panoramic centerpieces on the project details page.
                          </span>
                        </div>
                        <div className="admin-gallery-controls-bar">
                          <input
                            type="file"
                            ref={portfolioGalleryInputRef}
                            onChange={handleMultiGalleryFilesSelected}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => portfolioGalleryInputRef.current?.click()}
                            className="admin-gallery-upload-btn"
                          >
                            <UploadCloud size={16} />
                            <span>Upload Photos (Multi-select)</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleAddPortfolioGalleryItem}
                            className="admin-add-item-btn"
                          >
                            <Plus size={16} />
                            <span>Add Photo Card</span>
                          </button>
                        </div>
                      </div>

                      {portfolioGallery.length === 0 ? (
                        <div className="admin-empty-items-box">
                          <ImageIcon size={28} className="admin-empty-icon" />
                          <p>No gallery photographs added yet.</p>
                          <span>
                            Click &quot;Upload Photos&quot; above to select multiple images, or &quot;Add Photo Card&quot; to attach images individually.
                          </span>
                        </div>
                      ) : (
                        <div className="admin-gallery-grid-list">
                          {portfolioGallery.map((item, idx) => (
                            <div key={item.id} className="admin-gallery-card-item">
                              <div className="admin-gallery-thumb-container">
                                {item.image ? (
                                  <>
                                    <img src={item.image} alt={item.alt || `Photo #${idx + 1}`} />
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePortfolioGalleryItem(item.id)}
                                      className="admin-gallery-remove-btn"
                                      title="Remove photograph"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                ) : (
                                  <label
                                    className="admin-item-upload-box"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handlePortfolioGalleryFileChange(item.id, file);
                                      }}
                                      style={{ display: 'none' }}
                                    />
                                    <UploadCloud size={20} className="admin-icon-muted" />
                                    <span style={{ fontSize: '0.72rem', color: '#999', marginTop: '4px' }}>
                                      Choose photo
                                    </span>
                                  </label>
                                )}
                                {item.isUploading && (
                                  <div className="admin-gallery-uploading-overlay">
                                    <RefreshCw size={14} className="spin-animate" />
                                    <span>Uploading...</span>
                                  </div>
                                )}
                              </div>
                              <div className="admin-gallery-caption-box">
                                <input
                                  type="text"
                                  placeholder={`Photo #${idx + 1} caption / alt`}
                                  value={item.alt}
                                  onChange={(e) =>
                                    handleUpdatePortfolioGalleryItem(item.id, { alt: e.target.value })
                                  }
                                  className="admin-gallery-caption-input"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="button"
                      onClick={handleCancelPortfolio}
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
                          <span>Saving Project...</span>
                        </>
                      ) : editingPortfolioId ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Save Changes</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          <span>Upload Project</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-category-pills">
                {['All', 'Residential', 'Commercial', 'Construction', 'Modular Kitchen', 'Turnkey'].map(
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
                        <div className="admin-card-actions">
                          <button
                            onClick={() => handleEditPortfolio(item)}
                            className="admin-edit-btn"
                            title="Edit this project"
                          >
                            <Pencil size={15} />
                          </button>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. SHOP PRODUCTS MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'shop' && (
          <div className="admin-view-section">
            {/* Upload / Edit Collapsible Card */}
            {showAddShop && (
              <div className="admin-form-card" ref={shopFormRef}>
                <div className="admin-form-header">
                  <div className="admin-form-title-wrap">
                    {editingShopId ? (
                      <Pencil className="admin-icon-gold" size={24} />
                    ) : (
                      <ShoppingBag className="admin-icon-gold" size={24} />
                    )}
                    <div>
                      <h2 className="admin-form-heading">
                        {editingShopId ? 'Edit Shop Product' : 'Upload New Shop Product'}
                      </h2>
                      <p className="admin-form-sub">
                        {editingShopId
                          ? 'Update product specifications, pricing, dimensions, or replace the photograph.'
                          : 'Upload custom furniture, millwork, or collection pieces to the shop catalog. Uploaded products immediately appear on the shop page.'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateShopProduct} className="admin-upload-form">
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
                            <img src={shopPreviewUrl} alt="Product Preview" />
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
                        <label className="admin-field-label">Product Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Minimalist Fluted Oak Wardrobe"
                          value={newShopProduct.name}
                          onChange={(e) =>
                            setNewShopProduct({ ...newShopProduct, name: e.target.value })
                          }
                          className="admin-input-text"
                        />
                      </div>

                      <div className="admin-field-two-col">
                        <div>
                          <label className="admin-field-label">Category *</label>
                          <select
                            value={newShopProduct.category}
                            onChange={(e) =>
                              setNewShopProduct({
                                ...newShopProduct,
                                category: e.target.value
                              })
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
                          <label className="admin-field-label">Price (INR or On Request)</label>
                          <input
                            type="text"
                            placeholder="e.g. ₹ 45,000 or Price on request"
                            value={newShopProduct.price}
                            onChange={(e) =>
                              setNewShopProduct({
                                ...newShopProduct,
                                price: e.target.value
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-field-two-col">
                        <div>
                          <label className="admin-field-label">Badge / Sub-tag</label>
                          <input
                            type="text"
                            placeholder="e.g. Bedroom · Custom interior"
                            value={newShopProduct.tag}
                            onChange={(e) =>
                              setNewShopProduct({
                                ...newShopProduct,
                                tag: e.target.value
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Display Order</label>
                          <input
                            type="number"
                            value={newShopProduct.display_order}
                            onChange={(e) =>
                              setNewShopProduct({
                                ...newShopProduct,
                                display_order: parseInt(e.target.value) || 0
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-field-two-col">
                        <div>
                          <label className="admin-field-label">Dimensions / Size</label>
                          <input
                            type="text"
                            placeholder="e.g. 120x210 cm or Custom"
                            value={newShopProduct.dimensions}
                            onChange={(e) =>
                              setNewShopProduct({
                                ...newShopProduct,
                                dimensions: e.target.value
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Material / Finish</label>
                          <input
                            type="text"
                            placeholder="e.g. Solid oak & brass hardware"
                            value={newShopProduct.material}
                            onChange={(e) =>
                              setNewShopProduct({
                                ...newShopProduct,
                                material: e.target.value
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-field-row">
                        <label className="admin-field-label">Description (Optional)</label>
                        <textarea
                          rows={2}
                          placeholder="Brief description of craftsmanship, features and bespoke customization options..."
                          value={newShopProduct.description}
                          onChange={(e) =>
                            setNewShopProduct({
                              ...newShopProduct,
                              description: e.target.value
                            })
                          }
                          className="admin-textarea"
                        />
                      </div>

                      {/* INDIVIDUAL ITEMS BUILDER */}
                      <div className="admin-individual-items-section">
                        <div className="admin-individual-items-header">
                          <div className="admin-section-subtitle-wrap">
                            <h3>
                              Individual Items & Components
                              <span className="admin-items-count-badge">
                                {shopIndividualItems.length}{' '}
                                {shopIndividualItems.length === 1 ? 'item' : 'items'}
                              </span>
                            </h3>
                            <span className="admin-field-hint">
                              Add separate pieces (e.g. Wardrobe, Bed frame, Nightstand, Coffee table) that buyers can inspect or select individually on the product page. Unlimited items can be added.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddShopIndividualItem}
                            className="admin-add-item-btn"
                          >
                            <Plus size={16} />
                            <span>Add Individual Item</span>
                          </button>
                        </div>

                        {shopIndividualItems.length === 0 ? (
                          <div className="admin-empty-items-box">
                            <Package size={28} className="admin-empty-icon" />
                            <p>No individual items added yet.</p>
                            <span>
                              Click &quot;Add Individual Item&quot; to add separate components with their own photos, prices, and specifications.
                            </span>
                          </div>
                        ) : (
                          <div className="admin-individual-items-list">
                            {shopIndividualItems.map((item, idx) => (
                              <div key={item.id} className="admin-individual-item-card">
                                <div className="admin-item-card-top">
                                  <span className="admin-item-num-tag">
                                    <Package size={14} /> Item #{idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveShopIndividualItem(item.id)}
                                    className="admin-item-delete-btn"
                                    title="Remove this item"
                                  >
                                    <Trash2 size={14} />
                                    <span>Remove</span>
                                  </button>
                                </div>

                                <div className="admin-item-card-body">
                                  {/* Item Image Upload */}
                                  <div className="admin-item-image-col">
                                    {item.image ? (
                                      <div className="admin-item-image-preview">
                                        <img
                                          src={item.image}
                                          alt={item.name || `Item ${idx + 1}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdateShopIndividualItem(item.id, {
                                              image: ''
                                            })
                                          }
                                          className="admin-item-img-remove-btn"
                                          title="Remove photo"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="admin-item-upload-box">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) =>
                                            handleIndividualItemFileChange(
                                              item.id,
                                              e.target.files?.[0]
                                            )
                                          }
                                          style={{ display: 'none' }}
                                        />
                                        {item.isUploading ? (
                                          <RefreshCw
                                            size={20}
                                            className="spin-animate"
                                          />
                                        ) : (
                                          <>
                                            <ImageIcon size={22} />
                                            <span>Upload Photo</span>
                                          </>
                                        )}
                                      </label>
                                    )}
                                  </div>

                                  {/* Item Fields */}
                                  <div className="admin-item-fields-col">
                                    <div className="admin-field-two-col">
                                      <div>
                                        <label className="admin-field-label">
                                          Item Name *
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. 4-Door Wardrobe or Bedside Box"
                                          value={item.name}
                                          onChange={(e) =>
                                            handleUpdateShopIndividualItem(item.id, {
                                              name: e.target.value
                                            })
                                          }
                                          className="admin-input-text"
                                        />
                                      </div>
                                      <div>
                                        <label className="admin-field-label">
                                          Item Price
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. ₹ 24,500 or Included"
                                          value={item.price}
                                          onChange={(e) =>
                                            handleUpdateShopIndividualItem(item.id, {
                                              price: e.target.value
                                            })
                                          }
                                          className="admin-input-text"
                                        />
                                      </div>
                                    </div>

                                    <div className="admin-field-two-col">
                                      <div>
                                        <label className="admin-field-label">
                                          Dimensions / Size
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. 120x210 cm"
                                          value={item.dimensions || item.size || ''}
                                          onChange={(e) =>
                                            handleUpdateShopIndividualItem(item.id, {
                                              dimensions: e.target.value,
                                              size: e.target.value
                                            })
                                          }
                                          className="admin-input-text"
                                        />
                                      </div>
                                      <div>
                                        <label className="admin-field-label">
                                          Material / Finish
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="e.g. Natural veneer & brass"
                                          value={item.material || ''}
                                          onChange={(e) =>
                                            handleUpdateShopIndividualItem(item.id, {
                                              material: e.target.value
                                            })
                                          }
                                          className="admin-input-text"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="admin-field-label">
                                        Description (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Brief description of this component..."
                                        value={item.description || ''}
                                        onChange={(e) =>
                                          handleUpdateShopIndividualItem(item.id, {
                                            description: e.target.value
                                          })
                                        }
                                        className="admin-input-text"
                                      />
                                    </div>

                                    {!item.image && (
                                      <div>
                                        <label className="admin-field-label">
                                          Or Image URL
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="https://... or /assets/images/..."
                                          value={item.image || ''}
                                          onChange={(e) =>
                                            handleUpdateShopIndividualItem(item.id, {
                                              image: e.target.value
                                            })
                                          }
                                          className="admin-input-text"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="admin-form-actions">
                        <button
                          type="button"
                          onClick={handleCancelShop}
                          className="admin-cancel-btn"
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
                              <span>Saving...</span>
                            </>
                          ) : editingShopId ? (
                            <>
                              <CheckCircle2 size={16} />
                              <span>Save Changes</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud size={16} />
                              <span>Upload Product to Shop</span>
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
                <span>Loading shop products...</span>
              </div>
            ) : filteredShop.length === 0 ? (
              <div className="admin-empty-box">
                <ShoppingBag size={48} className="admin-icon-muted" />
                <h3>No shop products found</h3>
                <p>Click "Upload Product to Shop" above to add your first product.</p>
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
                        onClick={() =>
                          handleToggleShop(item.id, item.isPublished)
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
                      <div className="admin-card-price-row">
                        <span className="admin-product-price-pill">{item.price}</span>
                        {(item.individual_items?.length > 0 || item.configurations?.length > 0) && (
                          <span className="admin-items-count-indicator">
                            {(item.individual_items || item.configurations).length}{' '}
                            {(item.individual_items || item.configurations).length === 1
                              ? 'component'
                              : 'components'}
                          </span>
                        )}
                      </div>
                      <h3 className="admin-card-title">{item.name}</h3>
                      {item.tag && (
                        <p className="admin-card-subtitle">{item.tag}</p>
                      )}

                      <div className="admin-card-meta-row">
                        <span className="admin-order-tag">Order #{item.displayOrder}</span>
                        <div className="admin-card-actions">
                          <button
                            onClick={() => handleEditShop(item)}
                            className="admin-edit-btn"
                            title="Edit this product"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteShop(item.id, item.name)
                            }
                            className="admin-delete-btn"
                            title="Delete this product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. HOMEPAGE CAROUSEL / NARRATIVE SLIDES MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'narrative' && (
          <div className="admin-view-section">
            {showAddNarrative && (
              <div className="admin-form-card" ref={narrativeFormRef}>
                <div className="admin-form-header">
                  <div className="admin-form-title-wrap">
                    {editingNarrativeId ? (
                      <Pencil className="admin-icon-gold" size={24} />
                    ) : (
                      <UploadCloud className="admin-icon-gold" size={24} />
                    )}
                    <div>
                      <h2 className="admin-form-heading">
                        {editingNarrativeId ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
                      </h2>
                      <p className="admin-form-sub">
                        {editingNarrativeId
                          ? 'Update slide image, title, or display order in the homepage carousel.'
                          : 'Upload photography to be displayed in the infinite gliding carousel on the homepage about section.'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateNarrative} className="admin-upload-form">
                  <div className="admin-form-grid">
                    {/* Image dropzone */}
                    <div className="admin-dropzone-col">
                      <label className="admin-field-label">Slide Photograph *</label>
                      <div
                        className={`admin-dropzone ${narrativePreviewUrl ? 'has-preview' : ''}`}
                        onClick={() => narrativeFileRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={narrativeFileRef}
                          onChange={handleNarrativeFileChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        {narrativePreviewUrl ? (
                          <div className="admin-dropzone-preview">
                            <img src={narrativePreviewUrl} alt="Slide Preview" />
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
                            <span className="admin-dropzone-sub">
                              Recommended ratio 4:3 or landscape photo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="admin-fields-col">
                      <div className="admin-field-group">
                        <label className="admin-field-label">Slide Title / Alt Description</label>
                        <input
                          type="text"
                          value={newNarrative.title}
                          onChange={(e) =>
                            setNewNarrative({ ...newNarrative, title: e.target.value })
                          }
                          placeholder="e.g. Bespoke Architectural Detail"
                          className="admin-input-text"
                        />
                      </div>

                      <div className="admin-fields-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label">Display Width (px)</label>
                          <input
                            type="number"
                            value={newNarrative.width}
                            onChange={(e) =>
                              setNewNarrative({ ...newNarrative, width: Number(e.target.value) || 425 })
                            }
                            placeholder="425"
                            className="admin-input-text"
                          />
                        </div>

                        <div className="admin-field-group">
                          <label className="admin-field-label">Display Height (px)</label>
                          <input
                            type="number"
                            value={newNarrative.height}
                            onChange={(e) =>
                              setNewNarrative({ ...newNarrative, height: Number(e.target.value) || 350 })
                            }
                            placeholder="350"
                            className="admin-input-text"
                          />
                        </div>

                        <div className="admin-field-group">
                          <label className="admin-field-label">Display Order</label>
                          <input
                            type="number"
                            value={newNarrative.display_order}
                            onChange={(e) =>
                              setNewNarrative({
                                ...newNarrative,
                                display_order: Number(e.target.value) || 0
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-form-actions-bar">
                        <button
                          type="button"
                          onClick={handleCancelNarrative}
                          className="admin-secondary-btn"
                          disabled={narrativeSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-submit-btn"
                          disabled={narrativeSubmitting}
                        >
                          {narrativeSubmitting ? (
                            <>
                              <RefreshCw size={16} className="spin-animate" />
                              <span>Saving...</span>
                            </>
                          ) : editingNarrativeId ? (
                            <>
                              <CheckCircle2 size={16} />
                              <span>Save Changes</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud size={16} />
                              <span>Upload Slide</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrap" style={{ maxWidth: '420px', width: '100%' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search slides by title..."
                  value={narrativeSearch}
                  onChange={(e) => setNarrativeSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            {/* Slides Grid */}
            {narrativeLoading ? (
              <div className="admin-loading-box">
                <RefreshCw size={24} className="spin-animate" />
                <span>Loading carousel slides...</span>
              </div>
            ) : filteredNarrative.length === 0 ? (
              <div className="admin-empty-box">
                <Sliders size={48} className="admin-icon-muted" />
                <h3>No carousel slides found</h3>
                <p>Click "Add Carousel Slide" above to upload photos to the homepage carousel.</p>
              </div>
            ) : (
              <div className="admin-items-grid">
                {filteredNarrative.map((item) => (
                  <div key={item.id} className="admin-item-card">
                    <div className="admin-card-thumb-wrap">
                      <img src={item.image || item.image_url} alt={item.title} loading="lazy" />
                      <button
                        className={`admin-status-badge ${
                          item.isPublished ? 'published' : 'draft'
                        }`}
                        onClick={() =>
                          handleToggleNarrative(item.id, item.isPublished)
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
                      <h3 className="admin-card-title">{item.title || 'Architectural Detail'}</h3>
                      <p className="admin-card-subtitle">{item.width} × {item.height} px</p>

                      <div className="admin-card-meta-row">
                        <span className="admin-order-tag">Order #{item.displayOrder}</span>
                        <div className="admin-card-actions">
                          <button
                            onClick={() => handleEditNarrative(item)}
                            className="admin-edit-btn"
                            title="Edit this slide"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteNarrative(item.id, item.title)
                            }
                            className="admin-delete-btn"
                            title="Delete this slide"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. WHAT WE DO SERVICES MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'what-we-do' && (
          <div className="admin-view-section">
            {showAddWhatWeDo && (
              <div className="admin-form-card" ref={whatWeDoFormRef}>
                <div className="admin-form-header">
                  <div className="admin-form-title-wrap">
                    {editingWhatWeDoId ? (
                      <Pencil className="admin-icon-gold" size={24} />
                    ) : (
                      <UploadCloud className="admin-icon-gold" size={24} />
                    )}
                    <div>
                      <h2 className="admin-form-heading">
                        {editingWhatWeDoId ? 'Edit Service' : 'Add New Service to What We Do'}
                      </h2>
                      <p className="admin-form-sub">
                        {editingWhatWeDoId
                          ? 'Update service name, description text, or replace the showcased photograph.'
                          : 'Add a new interior service to the homepage What We Do section. Appears as an interactive tab with showcased photography and description.'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateWhatWeDo} className="admin-upload-form">
                  <div className="admin-form-grid">
                    {/* Image dropzone */}
                    <div className="admin-dropzone-col">
                      <label className="admin-field-label">Service Showcase Photograph *</label>
                      <div
                        className={`admin-dropzone ${whatWeDoPreviewUrl ? 'has-preview' : ''}`}
                        onClick={() => whatWeDoFileRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={whatWeDoFileRef}
                          onChange={handleWhatWeDoFileChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        {whatWeDoPreviewUrl ? (
                          <div className="admin-dropzone-preview">
                            <img src={whatWeDoPreviewUrl} alt="Service Preview" />
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
                            <span className="admin-dropzone-sub">
                              Recommended 583 × 359 px landscape photo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="admin-fields-col">
                      <div className="admin-field-group">
                        <label className="admin-field-label">Service Name (Tab Title) *</label>
                        <input
                          type="text"
                          required
                          value={newWhatWeDo.name}
                          onChange={(e) =>
                            setNewWhatWeDo({ ...newWhatWeDo, name: e.target.value })
                          }
                          placeholder="e.g. Modular Kitchen, Bedroom, Office Space"
                          className="admin-input-text"
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label">Service Description (Homepage Text) *</label>
                        <textarea
                          rows={4}
                          required
                          value={newWhatWeDo.description}
                          onChange={(e) =>
                            setNewWhatWeDo({ ...newWhatWeDo, description: e.target.value })
                          }
                          placeholder="Detailed description of the service displayed on the right side of the What We Do section..."
                          className="admin-textarea"
                        />
                      </div>

                      <div className="admin-fields-row">
                        <div className="admin-field-group">
                          <label className="admin-field-label">Display Order</label>
                          <input
                            type="number"
                            value={newWhatWeDo.display_order}
                            onChange={(e) =>
                              setNewWhatWeDo({
                                ...newWhatWeDo,
                                display_order: Number(e.target.value) || 0
                              })
                            }
                            className="admin-input-text"
                          />
                        </div>
                      </div>

                      <div className="admin-form-actions-bar">
                        <button
                          type="button"
                          onClick={handleCancelWhatWeDo}
                          className="admin-secondary-btn"
                          disabled={whatWeDoSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-submit-btn"
                          disabled={whatWeDoSubmitting}
                        >
                          {whatWeDoSubmitting ? (
                            <>
                              <RefreshCw size={16} className="spin-animate" />
                              <span>Saving...</span>
                            </>
                          ) : editingWhatWeDoId ? (
                            <>
                              <CheckCircle2 size={16} />
                              <span>Save Changes</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud size={16} />
                              <span>Save Service</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrap" style={{ maxWidth: '420px', width: '100%' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search services by name or description..."
                  value={whatWeDoSearch}
                  onChange={(e) => setWhatWeDoSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            {/* Services Grid */}
            {whatWeDoLoading ? (
              <div className="admin-loading-box">
                <RefreshCw size={24} className="spin-animate" />
                <span>Loading services...</span>
              </div>
            ) : filteredWhatWeDo.length === 0 ? (
              <div className="admin-empty-box">
                <Layers size={48} className="admin-icon-muted" />
                <h3>No services found</h3>
                <p>Click "Add Service Item" above to add services to the What We Do section.</p>
              </div>
            ) : (
              <div className="admin-items-grid">
                {filteredWhatWeDo.map((item) => (
                  <div key={item.id} className="admin-item-card">
                    <div className="admin-card-thumb-wrap">
                      <img src={item.image || item.image_url} alt={item.name} loading="lazy" />
                      <button
                        className={`admin-status-badge ${
                          item.isPublished ? 'published' : 'draft'
                        }`}
                        onClick={() =>
                          handleToggleWhatWeDo(item.id, item.isPublished)
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
                      <h3 className="admin-card-title">{item.name}</h3>
                      <p className="admin-card-subtitle" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>

                      <div className="admin-card-meta-row">
                        <span className="admin-order-tag">Order #{item.displayOrder}</span>
                        <div className="admin-card-actions">
                          <button
                            onClick={() => handleEditWhatWeDo(item)}
                            className="admin-edit-btn"
                            title="Edit this service"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteWhatWeDo(item.id, item.name)
                            }
                            className="admin-delete-btn"
                            title="Delete this service"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
