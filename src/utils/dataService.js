import { supabase } from './supabase';
import { portfolioData } from '../data/portfolioData';
import { shopData } from '../data/shopData';

const LOCAL_PORTFOLIO_KEY = 'iora_admin_local_portfolio';
const LOCAL_SHOP_KEY = 'iora_admin_local_shop';

// Helpers for localStorage fallback when offline / unauthenticated
const getLocalItems = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalItems = (key, items) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore
  }
};

// ============================================================================
// AUTH & ADMIN STATUS
// ============================================================================
export async function getCurrentAdmin() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { user: null, isAdmin: false };

    // Check admin_users table
    const { data: adminRows, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = !adminError && !!adminRows;
    return { user, isAdmin, role: adminRows?.role || 'user' };
  } catch (err) {
    console.warn('Error checking admin status:', err);
    return { user: null, isAdmin: false };
  }
}

export async function claimFirstAdmin() {
  try {
    const { data, error } = await supabase.rpc('claim_first_admin');
    return { success: !error && !!data, error };
  } catch (err) {
    return { success: false, error: err };
  }
}

// ============================================================================
// STORAGE UPLOADS
// ============================================================================
/**
 * Uploads an image file to Supabase Storage bucket ('portfolio' or 'shop')
 * Returns public URL string
 */
export async function uploadImageToStorage(bucketName, file) {
  if (!file) throw new Error('No file provided');

  // Sanitize filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileExt = cleanName.split('.').pop();
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${uniqueName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.warn(`Storage upload to ${bucketName} failed:`, uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Storage upload error:', err);
    throw err;
  }
}

// Converts File to Base64 data URL for local offline preview
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// ============================================================================
// PORTFOLIO PROJECTS
// ============================================================================
export async function getPortfolioProjects() {
  try {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    const localItems = getLocalItems(LOCAL_PORTFOLIO_KEY);

    if (!error && data && data.length > 0) {
      // Merge with any local preview items not yet in DB
      const combined = [...data, ...localItems.filter(l => !data.some(d => d.id === l.id))];
      return combined.map(normalizePortfolioItem);
    }

    // If Supabase table is empty, return local preview items + default static items
    if (localItems.length > 0) {
      return [...localItems.map(normalizePortfolioItem), ...portfolioData.projects.map(normalizePortfolioItem)];
    }

    return portfolioData.projects.map(normalizePortfolioItem);
  } catch (err) {
    console.warn('Failed to load portfolio from Supabase, using defaults:', err);
    const localItems = getLocalItems(LOCAL_PORTFOLIO_KEY);
    return [...localItems.map(normalizePortfolioItem), ...portfolioData.projects.map(normalizePortfolioItem)];
  }
}

function normalizePortfolioItem(item) {
  return {
    id: item.id || `proj-${Math.random()}`,
    title: item.title || 'Untitled Project',
    subtitle: item.subtitle || '',
    category: item.category || 'Residential',
    image: item.image_url || item.image || '/assets/images/99b73684e59b.jpg',
    image_url: item.image_url || item.image || '/assets/images/99b73684e59b.jpg',
    aspectRatio: item.aspect_ratio || item.aspectRatio || 0.667,
    displayOrder: item.display_order ?? item.displayOrder ?? 0,
    isPublished: item.is_published ?? item.isPublished ?? true,
    theIdeaTitle: item.the_idea_title || item.theIdeaTitle || '',
    theIdeaDescription: item.the_idea_description || item.theIdeaDescription || '',
    specifications: item.specifications || [],
    galleryImages: item.gallery_images || item.galleryImages || []
  };
}

export async function createPortfolioProject(projectData) {
  const payload = {
    title: projectData.title,
    subtitle: projectData.subtitle || '',
    category: projectData.category || 'Residential',
    image_url: projectData.image_url || projectData.image,
    aspect_ratio: projectData.aspect_ratio || 0.667,
    display_order: projectData.display_order || 0,
    is_published: projectData.is_published ?? true,
    the_idea_title: projectData.the_idea_title || '',
    the_idea_description: projectData.the_idea_description || '',
    specifications: projectData.specifications || [],
    gallery_images: projectData.gallery_images || []
  };

  try {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { data: normalizePortfolioItem(data), error: null };
  } catch (err) {
    console.warn('Supabase insert failed, saving to local preview storage:', err);
    // Fallback to local storage so user flow is never blocked
    const fallbackItem = {
      ...payload,
      id: `local-proj-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const local = getLocalItems(LOCAL_PORTFOLIO_KEY);
    local.unshift(fallbackItem);
    setLocalItems(LOCAL_PORTFOLIO_KEY, local);
    return { data: normalizePortfolioItem(fallbackItem), error: err, isLocal: true };
  }
}

export async function deletePortfolioProject(id) {
  try {
    // Delete from local if exists
    const local = getLocalItems(LOCAL_PORTFOLIO_KEY);
    setLocalItems(LOCAL_PORTFOLIO_KEY, local.filter(i => i.id !== id));

    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);

    return { error };
  } catch (err) {
    return { error: err };
  }
}

export async function togglePortfolioPublished(id, currentStatus) {
  try {
    const { error } = await supabase
      .from('portfolio_projects')
      .update({ is_published: !currentStatus })
      .eq('id', id);

    return { error };
  } catch (err) {
    return { error: err };
  }
}

// ============================================================================
// SHOP PRODUCTS
// ============================================================================
export async function getShopProducts() {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    const localItems = getLocalItems(LOCAL_SHOP_KEY);

    if (!error && data && data.length > 0) {
      const combined = [...data, ...localItems.filter(l => !data.some(d => d.id === l.id))];
      return combined.map(normalizeShopProduct);
    }

    if (localItems.length > 0) {
      return [...localItems.map(normalizeShopProduct), ...shopData.products.map(normalizeShopProduct)];
    }

    return shopData.products.map(normalizeShopProduct);
  } catch (err) {
    console.warn('Failed to load shop products from Supabase, using defaults:', err);
    const localItems = getLocalItems(LOCAL_SHOP_KEY);
    return [...localItems.map(normalizeShopProduct), ...shopData.products.map(normalizeShopProduct)];
  }
}

function normalizeShopProduct(item) {
  return {
    id: item.id || `prod-${Math.random()}`,
    name: item.name || 'Untitled Product',
    category: item.category || 'Bedroom',
    tag: item.tag || `${item.category || 'Bespoke'} · Custom interior`,
    price: item.price || 'Price on request',
    image: item.image_url || item.image || '/assets/images/99b73684e59b.jpg',
    image_url: item.image_url || item.image || '/assets/images/99b73684e59b.jpg',
    description: item.description || '',
    dimensions: item.dimensions || '',
    material: item.material || '',
    finishes: item.finishes || [
      { name: 'Wood finish', color: 'rgba(168, 131, 95, 1)' },
      { name: 'Neutral finish', color: 'rgba(206, 194, 175, 1)' },
      { name: 'Stone finish', color: 'rgba(119, 115, 108, 1)' }
    ],
    configurations: item.configurations || [],
    displayOrder: item.display_order ?? item.displayOrder ?? 0,
    isPublished: item.is_published ?? item.isPublished ?? true
  };
}

export async function createShopProduct(productData) {
  const payload = {
    name: productData.name,
    category: productData.category || 'Bedroom',
    tag: productData.tag || `${productData.category} · Collection`,
    price: productData.price || 'Price on request',
    image_url: productData.image_url || productData.image,
    description: productData.description || '',
    dimensions: productData.dimensions || '',
    material: productData.material || '',
    finishes: productData.finishes || [
      { name: 'Natural Oak', color: 'rgba(168, 131, 95, 1)' },
      { name: 'Muted Sand', color: 'rgba(206, 194, 175, 1)' },
      { name: 'Slate Gray', color: 'rgba(119, 115, 108, 1)' }
    ],
    configurations: productData.configurations || [],
    display_order: productData.display_order || 0,
    is_published: productData.is_published ?? true
  };

  try {
    const { data, error } = await supabase
      .from('shop_products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { data: normalizeShopProduct(data), error: null };
  } catch (err) {
    console.warn('Supabase shop insert failed, saving to local preview storage:', err);
    const fallbackItem = {
      ...payload,
      id: `local-prod-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const local = getLocalItems(LOCAL_SHOP_KEY);
    local.unshift(fallbackItem);
    setLocalItems(LOCAL_SHOP_KEY, local);
    return { data: normalizeShopProduct(fallbackItem), error: err, isLocal: true };
  }
}

export async function deleteShopProduct(id) {
  try {
    const local = getLocalItems(LOCAL_SHOP_KEY);
    setLocalItems(LOCAL_SHOP_KEY, local.filter(i => i.id !== id));

    const { error } = await supabase
      .from('shop_products')
      .delete()
      .eq('id', id);

    return { error };
  } catch (err) {
    return { error: err };
  }
}

export async function toggleShopPublished(id, currentStatus) {
  try {
    const { error } = await supabase
      .from('shop_products')
      .update({ is_published: !currentStatus })
      .eq('id', id);

    return { error };
  } catch (err) {
    return { error: err };
  }
}

// ============================================================================
// SEED DEFAULT DATA TO SUPABASE
// ============================================================================
export async function seedDefaultsToSupabase() {
  const results = { portfolioCount: 0, shopCount: 0, errors: [] };

  try {
    // 1. Seed portfolio projects
    const portfolioPayload = portfolioData.projects.map((p, index) => ({
      title: p.title,
      subtitle: p.subtitle,
      category: p.category,
      image_url: p.image,
      aspect_ratio: p.aspectRatio || 0.667,
      display_order: index,
      is_published: true
    }));

    const { data: pData, error: pError } = await supabase
      .from('portfolio_projects')
      .insert(portfolioPayload)
      .select();

    if (pError) results.errors.push(`Portfolio: ${pError.message}`);
    else results.portfolioCount = pData?.length || 0;

    // 2. Seed shop products
    const shopPayload = shopData.products.map((p, index) => ({
      name: p.name,
      category: p.category,
      tag: p.tag,
      price: p.price,
      image_url: p.image,
      finishes: p.finishes || [],
      display_order: index,
      is_published: true
    }));

    const { data: sData, error: sError } = await supabase
      .from('shop_products')
      .insert(shopPayload)
      .select();

    if (sError) results.errors.push(`Shop: ${sError.message}`);
    else results.shopCount = sData?.length || 0;

    return results;
  } catch (err) {
    results.errors.push(err.message);
    return results;
  }
}

// ============================================================================
// QUOTE REQUESTS / LEADS
// ============================================================================
const LOCAL_QUOTES_KEY = 'iora_quote_requests';

export async function saveQuoteRequest(quoteData) {
  try {
    const payload = {
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone,
      project_type: quoteData.project_type || quoteData.projectType,
      description: quoteData.description || ''
    };

    // Save locally as fallback
    const localQuotes = getLocalItems(LOCAL_QUOTES_KEY);
    setLocalItems(LOCAL_QUOTES_KEY, [
      { id: Date.now().toString(), ...payload, created_at: new Date().toISOString() },
      ...localQuotes
    ]);

    const { data, error } = await supabase
      .from('quote_requests')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase quote insert skipped (table may not exist yet):', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Error saving quote request to Supabase:', err);
    return { success: false, error: err };
  }
}

export async function getQuoteRequests() {
  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to load quote requests from Supabase, returning local:', err);
    return getLocalItems(LOCAL_QUOTES_KEY);
  }
}
