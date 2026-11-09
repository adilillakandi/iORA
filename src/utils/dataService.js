import { supabase } from './supabase';
import { portfolioData } from '../data/portfolioData';
import { shopData } from '../data/shopData';
import { homeData } from '../data/homeData';

const LOCAL_PORTFOLIO_KEY = 'iora_admin_local_portfolio';
const LOCAL_SHOP_KEY = 'iora_admin_local_shop';
const LOCAL_PORTFOLIO_OVERRIDES_KEY = 'iora_admin_overrides_portfolio';
const LOCAL_SHOP_OVERRIDES_KEY = 'iora_admin_overrides_shop';
const LOCAL_NARRATIVE_SLIDES_KEY = 'iora_admin_local_narrative_slides';
const LOCAL_WHAT_WE_DO_KEY = 'iora_admin_local_what_we_do';

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
  const localItems = getLocalItems(LOCAL_PORTFOLIO_KEY);
  const overrides = getLocalObject(LOCAL_PORTFOLIO_OVERRIDES_KEY);

  const applyOverrides = (list) => {
    return list.map((item) => {
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

    if (!error && Array.isArray(data)) {
      // Merge with any un-synced local preview items
      const unSyncedLocal = localItems.filter((l) => !data.some((d) => d.id === l.id));
      const combined = [...data, ...unSyncedLocal];
      return applyOverrides(combined);
    }

    if (error) {
      console.warn('Supabase portfolio query notice:', error.message);
    }

    // If Supabase table is unreachable/offline, return local preview items
    if (localItems.length > 0) {
      return applyOverrides(localItems);
    }

    return [];
  } catch (err) {
    console.warn('Failed to load portfolio from Supabase:', err);
    return applyOverrides(localItems);
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

export async function syncLocalPortfoliosToSupabase() {
  const local = getLocalItems(LOCAL_PORTFOLIO_KEY);
  if (!local || local.length === 0) return { synced: 0, remainingCount: 0 };

  const remaining = [];
  let synced = 0;

  for (const item of local) {
    try {
      const payload = {
        title: item.title,
        subtitle: item.subtitle || '',
        category: item.category || 'Residential',
        image_url: item.image_url || item.image,
        aspect_ratio: item.aspect_ratio || item.aspectRatio || 0.667,
        display_order: item.display_order ?? item.displayOrder ?? 0,
        is_published: item.is_published ?? item.isPublished ?? true,
        the_idea_title: item.the_idea_title || item.theIdeaTitle || '',
        the_idea_description: item.the_idea_description || item.theIdeaDescription || '',
        specifications: item.specifications || [],
        gallery_images: item.gallery_images || item.galleryImages || []
      };

      const { data, error } = await supabase
        .from('portfolio_projects')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        synced++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  setLocalItems(LOCAL_PORTFOLIO_KEY, remaining);
  return { synced, remainingCount: remaining.length };
}

export async function deletePortfolioProject(id) {
  try {
    // 1. Remove from local items if present
    const local = getLocalItems(LOCAL_PORTFOLIO_KEY);
    setLocalItems(LOCAL_PORTFOLIO_KEY, local.filter((i) => i.id !== id));

    // 2. Remove overrides
    const overrides = getLocalObject(LOCAL_PORTFOLIO_OVERRIDES_KEY);
    if (overrides[id]) {
      const newOverrides = { ...overrides };
      delete newOverrides[id];
      setLocalItems(LOCAL_PORTFOLIO_OVERRIDES_KEY, newOverrides);
    }

    // 3. Delete from Supabase
    if (isUuid(id) || !String(id).startsWith('local-')) {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase portfolio delete warning:', error);
        return { error };
      }
    }

    return { error: null };
  } catch (err) {
    console.error('Delete portfolio project error:', err);
    return { error: err };
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
  const localItems = getLocalItems(LOCAL_SHOP_KEY);
  const overrides = getLocalObject(LOCAL_SHOP_OVERRIDES_KEY);

  const applyOverrides = (list) => {
    return list.map((item) => {
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

    if (!error && Array.isArray(data)) {
      const unSyncedLocal = localItems.filter((l) => !data.some((d) => d.id === l.id));
      const combined = [...data, ...unSyncedLocal];
      return applyOverrides(combined);
    }

    if (error) {
      console.warn('Supabase shop query notice:', error.message);
    }

    if (localItems.length > 0) {
      return applyOverrides(localItems);
    }

    return [];
  } catch (err) {
    console.warn('Failed to load shop products from Supabase:', err);
    return applyOverrides(localItems);
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

export async function syncLocalShopToSupabase() {
  const local = getLocalItems(LOCAL_SHOP_KEY);
  if (!local || local.length === 0) return { synced: 0, remainingCount: 0 };

  const remaining = [];
  let synced = 0;

  for (const item of local) {
    try {
      const payload = {
        name: item.name,
        category: item.category || 'Bedroom',
        tag: item.tag || '',
        price: item.price || '',
        image_url: item.image_url || item.image,
        description: item.description || '',
        dimensions: item.dimensions || '',
        material: item.material || '',
        finishes: item.finishes || [],
        configurations: item.configurations || item.individual_items || [],
        individual_items: item.individual_items || item.configurations || [],
        display_order: item.display_order ?? item.displayOrder ?? 0,
        is_published: item.is_published ?? item.isPublished ?? true
      };

      const { data, error } = await supabase
        .from('shop_products')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        synced++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  setLocalItems(LOCAL_SHOP_KEY, remaining);
  return { synced, remainingCount: remaining.length };
}

export async function deleteShopProduct(id) {
  try {
    // 1. Remove from local items
    const local = getLocalItems(LOCAL_SHOP_KEY);
    setLocalItems(LOCAL_SHOP_KEY, local.filter((i) => i.id !== id));

    // 2. Remove overrides
    const overrides = getLocalObject(LOCAL_SHOP_OVERRIDES_KEY);
    if (overrides[id]) {
      const newOverrides = { ...overrides };
      delete newOverrides[id];
      setLocalItems(LOCAL_SHOP_OVERRIDES_KEY, newOverrides);
    }

    // 3. Delete from Supabase
    if (isUuid(id) || !String(id).startsWith('local-')) {
      const { error } = await supabase
        .from('shop_products')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase shop delete warning:', error);
        return { error };
      }
    }

    return { error: null };
  } catch (err) {
    console.error('Delete shop product error:', err);
    return { error: err };
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

// ============================================================================
// HOMEPAGE CAROUSEL / NARRATIVE SLIDES
// ============================================================================
export function normalizeNarrativeSlide(item) {
  return {
    id: item.id || `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: item.title || 'Architectural Detail',
    image: item.image_url || item.image || '/assets/images/0c8944d15b77.jpg',
    image_url: item.image_url || item.image || '/assets/images/0c8944d15b77.jpg',
    width: Number(item.width) || 425,
    height: Number(item.height) || 350,
    displayOrder: item.display_order ?? item.displayOrder ?? 0,
    isPublished: item.is_published ?? item.isPublished ?? true
  };
}

export async function getNarrativeSlides() {
  const localItems = getLocalItems(LOCAL_NARRATIVE_SLIDES_KEY);

  try {
    const { data, error } = await supabase
      .from('narrative_slides')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const unSyncedLocal = localItems.filter((l) => !data.some((d) => d.id === l.id));
      const combined = [...data, ...unSyncedLocal];
      return combined.map(normalizeNarrativeSlide);
    }

    if (localItems.length > 0) {
      return localItems.map(normalizeNarrativeSlide);
    }

    return (homeData.narrative.slides || []).map(normalizeNarrativeSlide);
  } catch (err) {
    console.warn('Failed to load narrative slides from Supabase:', err);
    if (localItems.length > 0) {
      return localItems.map(normalizeNarrativeSlide);
    }
    return (homeData.narrative.slides || []).map(normalizeNarrativeSlide);
  }
}

export async function createNarrativeSlide(slideData) {
  const payload = {
    title: slideData.title || 'Architectural Detail',
    image_url: slideData.image_url || slideData.image,
    width: Number(slideData.width) || 425,
    height: Number(slideData.height) || 350,
    display_order: Number(slideData.display_order) || 0,
    is_published: slideData.is_published ?? true
  };

  try {
    const { data, error } = await supabase
      .from('narrative_slides')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { data: normalizeNarrativeSlide(data), error: null, isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving slide to local preview storage:', err);
    const fallbackItem = {
      ...payload,
      id: `local-slide-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const local = getLocalItems(LOCAL_NARRATIVE_SLIDES_KEY);
    local.unshift(fallbackItem);
    setLocalItems(LOCAL_NARRATIVE_SLIDES_KEY, local);
    return { data: normalizeNarrativeSlide(fallbackItem), error: err, isLocal: true };
  }
}

export async function updateNarrativeSlide(id, updates) {
  try {
    const local = getLocalItems(LOCAL_NARRATIVE_SLIDES_KEY);
    const existingIndex = local.findIndex((i) => i.id === id);
    if (existingIndex >= 0) {
      local[existingIndex] = { ...local[existingIndex], ...updates };
      setLocalItems(LOCAL_NARRATIVE_SLIDES_KEY, local);
    }

    if (isUuid(id) || !String(id).startsWith('local-')) {
      const payload = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.image_url !== undefined) payload.image_url = updates.image_url;
      else if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.width !== undefined) payload.width = Number(updates.width);
      if (updates.height !== undefined) payload.height = Number(updates.height);
      if (updates.display_order !== undefined) payload.display_order = Number(updates.display_order);
      if (updates.is_published !== undefined) payload.is_published = updates.is_published;

      const { data, error } = await supabase
        .from('narrative_slides')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) console.warn('Supabase narrative slide update warning:', error);
      return { data: data ? normalizeNarrativeSlide(data) : updates, error: null };
    }

    return { data: updates, error: null };
  } catch (err) {
    console.error('Update narrative slide error:', err);
    return { data: updates, error: null };
  }
}

export async function deleteNarrativeSlide(id) {
  try {
    const local = getLocalItems(LOCAL_NARRATIVE_SLIDES_KEY);
    setLocalItems(LOCAL_NARRATIVE_SLIDES_KEY, local.filter((i) => i.id !== id));

    if (isUuid(id) || !String(id).startsWith('local-')) {
      const { error } = await supabase
        .from('narrative_slides')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase slide delete warning:', error);
        return { error };
      }
    }

    return { error: null };
  } catch (err) {
    console.error('Delete narrative slide error:', err);
    return { error: err };
  }
}

export async function toggleNarrativeSlidePublished(id, currentStatus) {
  try {
    const newStatus = !currentStatus;
    const local = getLocalItems(LOCAL_NARRATIVE_SLIDES_KEY);
    setLocalItems(LOCAL_NARRATIVE_SLIDES_KEY, local.map((i) => i.id === id ? { ...i, is_published: newStatus, isPublished: newStatus } : i));

    if (isUuid(id) || !String(id).startsWith('local-')) {
      await supabase
        .from('narrative_slides')
        .update({ is_published: newStatus })
        .eq('id', id);
    }

    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function syncLocalNarrativeToSupabase() {
  const local = getLocalItems(LOCAL_NARRATIVE_SLIDES_KEY);
  if (!local || local.length === 0) return { synced: 0, remainingCount: 0 };

  const remaining = [];
  let synced = 0;

  for (const item of local) {
    try {
      const payload = {
        title: item.title || 'Architectural Detail',
        image_url: item.image_url || item.image,
        width: Number(item.width) || 425,
        height: Number(item.height) || 350,
        display_order: Number(item.display_order ?? item.displayOrder) || 0,
        is_published: item.is_published ?? item.isPublished ?? true
      };

      const { data, error } = await supabase
        .from('narrative_slides')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        synced++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  setLocalItems(LOCAL_NARRATIVE_SLIDES_KEY, remaining);
  return { synced, remainingCount: remaining.length };
}

// ============================================================================
// WHAT WE DO SERVICES
// ============================================================================
export function normalizeWhatWeDoService(item) {
  return {
    id: item.id || `service-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: item.name || 'Custom Service',
    description: item.description || '',
    image: item.image_url || item.image || '/assets/images/fa41ab620455.jpg',
    image_url: item.image_url || item.image || '/assets/images/fa41ab620455.jpg',
    width: Number(item.width) || 583,
    height: Number(item.height) || 359,
    displayOrder: item.display_order ?? item.displayOrder ?? 0,
    isPublished: item.is_published ?? item.isPublished ?? true
  };
}

export async function getWhatWeDoServices() {
  const localItems = getLocalItems(LOCAL_WHAT_WE_DO_KEY);

  try {
    const { data, error } = await supabase
      .from('what_we_do_services')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const unSyncedLocal = localItems.filter((l) => !data.some((d) => d.id === l.id));
      const combined = [...data, ...unSyncedLocal];
      return combined.map(normalizeWhatWeDoService);
    }

    if (localItems.length > 0) {
      return localItems.map(normalizeWhatWeDoService);
    }

    return (homeData.whatWeDo.services || []).map(normalizeWhatWeDoService);
  } catch (err) {
    console.warn('Failed to load what we do services from Supabase:', err);
    if (localItems.length > 0) {
      return localItems.map(normalizeWhatWeDoService);
    }
    return (homeData.whatWeDo.services || []).map(normalizeWhatWeDoService);
  }
}

export async function createWhatWeDoService(serviceData) {
  const payload = {
    name: serviceData.name || 'Untitled Service',
    description: serviceData.description || '',
    image_url: serviceData.image_url || serviceData.image,
    width: Number(serviceData.width) || 583,
    height: Number(serviceData.height) || 359,
    display_order: Number(serviceData.display_order) || 0,
    is_published: serviceData.is_published ?? true
  };

  try {
    const { data, error } = await supabase
      .from('what_we_do_services')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { data: normalizeWhatWeDoService(data), error: null, isLocal: false };
  } catch (err) {
    console.warn('Supabase insert failed, saving service to local storage:', err);
    const fallbackItem = {
      ...payload,
      id: `local-service-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const local = getLocalItems(LOCAL_WHAT_WE_DO_KEY);
    local.unshift(fallbackItem);
    setLocalItems(LOCAL_WHAT_WE_DO_KEY, local);
    return { data: normalizeWhatWeDoService(fallbackItem), error: err, isLocal: true };
  }
}

export async function updateWhatWeDoService(id, updates) {
  try {
    const local = getLocalItems(LOCAL_WHAT_WE_DO_KEY);
    const existingIndex = local.findIndex((i) => i.id === id);
    if (existingIndex >= 0) {
      local[existingIndex] = { ...local[existingIndex], ...updates };
      setLocalItems(LOCAL_WHAT_WE_DO_KEY, local);
    }

    if (isUuid(id) || !String(id).startsWith('local-')) {
      const payload = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.image_url !== undefined) payload.image_url = updates.image_url;
      else if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.width !== undefined) payload.width = Number(updates.width);
      if (updates.height !== undefined) payload.height = Number(updates.height);
      if (updates.display_order !== undefined) payload.display_order = Number(updates.display_order);
      if (updates.is_published !== undefined) payload.is_published = updates.is_published;

      const { data, error } = await supabase
        .from('what_we_do_services')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) console.warn('Supabase what we do update warning:', error);
      return { data: data ? normalizeWhatWeDoService(data) : updates, error: null };
    }

    return { data: updates, error: null };
  } catch (err) {
    console.error('Update what we do error:', err);
    return { data: updates, error: null };
  }
}

export async function deleteWhatWeDoService(id) {
  try {
    const local = getLocalItems(LOCAL_WHAT_WE_DO_KEY);
    setLocalItems(LOCAL_WHAT_WE_DO_KEY, local.filter((i) => i.id !== id));

    if (isUuid(id) || !String(id).startsWith('local-')) {
      const { error } = await supabase
        .from('what_we_do_services')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase service delete warning:', error);
        return { error };
      }
    }

    return { error: null };
  } catch (err) {
    console.error('Delete what we do error:', err);
    return { error: err };
  }
}

export async function toggleWhatWeDoServicePublished(id, currentStatus) {
  try {
    const newStatus = !currentStatus;
    const local = getLocalItems(LOCAL_WHAT_WE_DO_KEY);
    setLocalItems(LOCAL_WHAT_WE_DO_KEY, local.map((i) => i.id === id ? { ...i, is_published: newStatus, isPublished: newStatus } : i));

    if (isUuid(id) || !String(id).startsWith('local-')) {
      await supabase
        .from('what_we_do_services')
        .update({ is_published: newStatus })
        .eq('id', id);
    }

    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function syncLocalWhatWeDoToSupabase() {
  const local = getLocalItems(LOCAL_WHAT_WE_DO_KEY);
  if (!local || local.length === 0) return { synced: 0, remainingCount: 0 };

  const remaining = [];
  let synced = 0;

  for (const item of local) {
    try {
      const payload = {
        name: item.name || 'Untitled Service',
        description: item.description || '',
        image_url: item.image_url || item.image,
        width: Number(item.width) || 583,
        height: Number(item.height) || 359,
        display_order: Number(item.display_order ?? item.displayOrder) || 0,
        is_published: item.is_published ?? item.isPublished ?? true
      };

      const { data, error } = await supabase
        .from('what_we_do_services')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        synced++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  setLocalItems(LOCAL_WHAT_WE_DO_KEY, remaining);
  return { synced, remainingCount: remaining.length };
}
