import { supabase } from './supabase';
import { portfolioData } from '../data/portfolioData';
import { shopData } from '../data/shopData';

const LOCAL_PORTFOLIO_KEY = 'iora_admin_local_portfolio';
const LOCAL_SHOP_KEY = 'iora_admin_local_shop';
const LOCAL_PORTFOLIO_DELETED_KEY = 'iora_admin_deleted_portfolio';
const LOCAL_SHOP_DELETED_KEY = 'iora_admin_deleted_shop';
const LOCAL_PORTFOLIO_OVERRIDES_KEY = 'iora_admin_overrides_portfolio';
const LOCAL_SHOP_OVERRIDES_KEY = 'iora_admin_overrides_shop';

// Valid UUID format checker (prevents PostgreSQL "invalid input syntax for type uuid" error)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUuid = (str) => typeof str === 'string' && UUID_REGEX.test(str);

// Helpers for localStorage fallback when offline / unauthenticated
const getLocalItems = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getLocalObject = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
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
  const deleted = new Set(getLocalItems(LOCAL_PORTFOLIO_DELETED_KEY));
  const overrides = getLocalObject(LOCAL_PORTFOLIO_OVERRIDES_KEY);
  const localItems = getLocalItems(LOCAL_PORTFOLIO_KEY);

  const applyOverridesAndFilter = (list) => {
    return list
      .filter((item) => !deleted.has(item.id))
      .map((item) => {
        const itemOverride = overrides[item.id];
        return normalizePortfolioItem(itemOverride ? { ...item, ...itemOverride } : item);
      });
  };

  try {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Merge with any local preview items not yet in DB
      const combined = [...data, ...localItems.filter((l) => !data.some((d) => d.id === l.id))];
      return applyOverridesAndFilter(combined);
    }

    // If Supabase table is empty, return local preview items + default static items
    if (localItems.length > 0) {
      const combined = [...localItems, ...portfolioData.projects.filter((p) => !localItems.some((l) => l.id === p.id))];
      return applyOverridesAndFilter(combined);
    }

    return applyOverridesAndFilter(portfolioData.projects);
  } catch (err) {
    console.warn('Failed to load portfolio from Supabase, using defaults:', err);
    const combined = [...localItems, ...portfolioData.projects.filter((p) => !localItems.some((l) => l.id === p.id))];
    return applyOverridesAndFilter(combined);
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

export async function updatePortfolioProject(id, updates) {
  try {
    // 1. Update in local items if present
    const local = getLocalItems(LOCAL_PORTFOLIO_KEY);
    const existingIndex = local.findIndex((i) => i.id === id);
    if (existingIndex >= 0) {
      local[existingIndex] = { ...local[existingIndex], ...updates };
      setLocalItems(LOCAL_PORTFOLIO_KEY, local);
    } else {
      // Record override for static or external items
      const overrides = getLocalObject(LOCAL_PORTFOLIO_OVERRIDES_KEY);
      setLocalItems(LOCAL_PORTFOLIO_OVERRIDES_KEY, {
        ...overrides,
        [id]: { ...(overrides[id] || {}), ...updates }
      });
    }

    // 2. If valid UUID, update in Supabase
    if (isUuid(id)) {
      const payload = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.image_url !== undefined) payload.image_url = updates.image_url;
      else if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.display_order !== undefined) payload.display_order = updates.display_order;
      else if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
      if (updates.is_published !== undefined) payload.is_published = updates.is_published;
      else if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;

      const { data, error } = await supabase
        .from('portfolio_projects')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) console.warn('Supabase portfolio update warning:', error);
      return { data: data ? normalizePortfolioItem(data) : updates, error: null };
    }

    return { data: updates, error: null };
  } catch (err) {
    console.error('Update portfolio project error:', err);
    return { data: updates, error: null };
  }
}

export async function deletePortfolioProject(id) {
  try {
    // 1. Mark as deleted locally so static and local items never reappear
    const deleted = getLocalItems(LOCAL_PORTFOLIO_DELETED_KEY);
    if (!deleted.includes(id)) {
      setLocalItems(LOCAL_PORTFOLIO_DELETED_KEY, [...deleted, id]);
    }

    // 2. Remove from local items
    const local = getLocalItems(LOCAL_PORTFOLIO_KEY);
    setLocalItems(LOCAL_PORTFOLIO_KEY, local.filter((i) => i.id !== id));

    // 3. Remove overrides
    const overrides = getLocalObject(LOCAL_PORTFOLIO_OVERRIDES_KEY);
    if (overrides[id]) {
      const newOverrides = { ...overrides };
      delete newOverrides[id];
      setLocalItems(LOCAL_PORTFOLIO_OVERRIDES_KEY, newOverrides);
    }

    // 4. If valid UUID, delete from Supabase
    if (isUuid(id)) {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id);

      if (error) console.warn('Supabase portfolio delete warning:', error);
    }

    return { error: null };
  } catch (err) {
    console.error('Delete portfolio project error:', err);
    return { error: null };
  }
}

export async function togglePortfolioPublished(id, currentStatus) {
  try {
    const newStatus = !currentStatus;
    const local = getLocalItems(LOCAL_PORTFOLIO_KEY);
    setLocalItems(LOCAL_PORTFOLIO_KEY, local.map((i) => i.id === id ? { ...i, is_published: newStatus, isPublished: newStatus } : i));

    const overrides = getLocalObject(LOCAL_PORTFOLIO_OVERRIDES_KEY);
    setLocalItems(LOCAL_PORTFOLIO_OVERRIDES_KEY, {
      ...overrides,
      [id]: { ...(overrides[id] || {}), is_published: newStatus, isPublished: newStatus }
    });

    if (isUuid(id)) {
      await supabase
        .from('portfolio_projects')
        .update({ is_published: newStatus })
        .eq('id', id);
    }

    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

// ============================================================================
// SHOP PRODUCTS
// ============================================================================
export async function getShopProducts() {
  const deleted = new Set(getLocalItems(LOCAL_SHOP_DELETED_KEY));
  const overrides = getLocalObject(LOCAL_SHOP_OVERRIDES_KEY);
  const localItems = getLocalItems(LOCAL_SHOP_KEY);

  const applyOverridesAndFilter = (list) => {
    return list
      .filter((item) => !deleted.has(item.id))
      .map((item) => {
        const itemOverride = overrides[item.id];
        return normalizeShopProduct(itemOverride ? { ...item, ...itemOverride } : item);
      });
  };

  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const combined = [...data, ...localItems.filter((l) => !data.some((d) => d.id === l.id))];
      return applyOverridesAndFilter(combined);
    }

    if (localItems.length > 0) {
      const combined = [...localItems, ...shopData.products.filter((p) => !localItems.some((l) => l.id === p.id))];
      return applyOverridesAndFilter(combined);
    }

    return applyOverridesAndFilter(shopData.products);
  } catch (err) {
    console.warn('Failed to load shop products from Supabase, using defaults:', err);
    const combined = [...localItems, ...shopData.products.filter((p) => !localItems.some((l) => l.id === p.id))];
    return applyOverridesAndFilter(combined);
  }
}

function normalizeShopProduct(item) {
  const items = Array.isArray(item.individual_items)
    ? item.individual_items
    : Array.isArray(item.individualItems)
    ? item.individualItems
    : Array.isArray(item.configurations)
    ? item.configurations
    : [];

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
    configurations: items,
    individual_items: items,
    individualItems: items,
    displayOrder: item.display_order ?? item.displayOrder ?? 0,
    isPublished: item.is_published ?? item.isPublished ?? true
  };
}

export async function createShopProduct(productData) {
  const rawItems = Array.isArray(productData.individual_items)
    ? productData.individual_items
    : Array.isArray(productData.individualItems)
    ? productData.individualItems
    : Array.isArray(productData.configurations)
    ? productData.configurations
    : [];

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
    configurations: rawItems,
    individual_items: rawItems,
    display_order: productData.display_order || 0,
    is_published: productData.is_published ?? true
  };

  try {
    let { data, error } = await supabase
      .from('shop_products')
      .insert([payload])
      .select()
      .single();

    if (error && error.message && (error.message.includes('individual_items') || error.message.includes('configurations'))) {
      const safePayload = { ...payload };
      if (error.message.includes('individual_items')) delete safePayload.individual_items;
      if (error.message.includes('configurations')) delete safePayload.configurations;
      const res = await supabase
        .from('shop_products')
        .insert([safePayload])
        .select()
        .single();
      data = res.data;
      error = res.error;
    }

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

export async function updateShopProduct(id, updates) {
  try {
    // 1. Update in local items if present
    const local = getLocalItems(LOCAL_SHOP_KEY);
    const existingIndex = local.findIndex((i) => i.id === id);
    if (existingIndex >= 0) {
      local[existingIndex] = { ...local[existingIndex], ...updates };
      setLocalItems(LOCAL_SHOP_KEY, local);
    } else {
      // Record override for static or external items
      const overrides = getLocalObject(LOCAL_SHOP_OVERRIDES_KEY);
      setLocalItems(LOCAL_SHOP_OVERRIDES_KEY, {
        ...overrides,
        [id]: { ...(overrides[id] || {}), ...updates }
      });
    }

    // 2. If valid UUID, update in Supabase
    if (isUuid(id)) {
      const payload = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.tag !== undefined) payload.tag = updates.tag;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.image_url !== undefined) payload.image_url = updates.image_url;
      else if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.dimensions !== undefined) payload.dimensions = updates.dimensions;
      if (updates.material !== undefined) payload.material = updates.material;
      if (updates.display_order !== undefined) payload.display_order = updates.display_order;
      else if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
      if (updates.is_published !== undefined) payload.is_published = updates.is_published;
      else if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;

      const items = updates.individual_items ?? updates.individualItems ?? updates.configurations;
      if (items !== undefined) {
        payload.configurations = items;
        payload.individual_items = items;
      }

      let { data, error } = await supabase
        .from('shop_products')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error && error.message && (error.message.includes('individual_items') || error.message.includes('configurations'))) {
        const safePayload = { ...payload };
        if (error.message.includes('individual_items')) delete safePayload.individual_items;
        if (error.message.includes('configurations')) delete safePayload.configurations;
        const res = await supabase
          .from('shop_products')
          .update(safePayload)
          .eq('id', id)
          .select()
          .maybeSingle();
        data = res.data;
        error = res.error;
      }

      if (error) console.warn('Supabase shop update warning:', error);
      return { data: data ? normalizeShopProduct(data) : updates, error: null };
    }

    return { data: updates, error: null };
  } catch (err) {
    console.error('Update shop product error:', err);
    return { data: updates, error: null };
  }
}

export async function deleteShopProduct(id) {
  try {
    // 1. Mark as deleted locally so static and local items never reappear
    const deleted = getLocalItems(LOCAL_SHOP_DELETED_KEY);
    if (!deleted.includes(id)) {
      setLocalItems(LOCAL_SHOP_DELETED_KEY, [...deleted, id]);
    }

    // 2. Remove from local items
    const local = getLocalItems(LOCAL_SHOP_KEY);
    setLocalItems(LOCAL_SHOP_KEY, local.filter((i) => i.id !== id));

    // 3. Remove overrides
    const overrides = getLocalObject(LOCAL_SHOP_OVERRIDES_KEY);
    if (overrides[id]) {
      const newOverrides = { ...overrides };
      delete newOverrides[id];
      setLocalItems(LOCAL_SHOP_OVERRIDES_KEY, newOverrides);
    }

    // 4. If valid UUID, delete from Supabase
    if (isUuid(id)) {
      const { error } = await supabase
        .from('shop_products')
        .delete()
        .eq('id', id);

      if (error) console.warn('Supabase shop delete warning:', error);
    }

    return { error: null };
  } catch (err) {
    console.error('Delete shop product error:', err);
    return { error: null };
  }
}

export async function toggleShopPublished(id, currentStatus) {
  try {
    const newStatus = !currentStatus;
    const local = getLocalItems(LOCAL_SHOP_KEY);
    setLocalItems(LOCAL_SHOP_KEY, local.map((i) => i.id === id ? { ...i, is_published: newStatus, isPublished: newStatus } : i));

    const overrides = getLocalObject(LOCAL_SHOP_OVERRIDES_KEY);
    setLocalItems(LOCAL_SHOP_OVERRIDES_KEY, {
      ...overrides,
      [id]: { ...(overrides[id] || {}), is_published: newStatus, isPublished: newStatus }
    });

    if (isUuid(id)) {
      await supabase
        .from('shop_products')
        .update({ is_published: newStatus })
        .eq('id', id);
    }

    return { error: null };
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
