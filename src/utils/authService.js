import { supabase } from './supabase';

export const ALLOWED_ADMIN_EMAIL = 'ksidanbasheer@gmail.com';
export const ALLOWED_ADMIN_PASSWORD = 'iOra@123321';
const SESSION_KEY = 'iora_admin_auth_session';

/**
 * Validates admin credentials and establishes both client session and Supabase auth session if available.
 * Only 'ksidanbasheer@gmail.com' with password 'iOra@123321' is permitted.
 */
export async function loginAdmin(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Strict check on authorized email
  if (cleanEmail !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    return {
      success: false,
      error: 'Access denied: Only authorized administrator (ksidanbasheer@gmail.com) can log in to this portal.'
    };
  }

  // Strict check on authorized password
  if (password !== ALLOWED_ADMIN_PASSWORD) {
    return {
      success: false,
      error: 'Invalid password. Please check your credentials and try again.'
    };
  }

  // Set local persistent session
  const sessionData = {
    email: ALLOWED_ADMIN_EMAIL,
    role: 'super_admin',
    authenticatedAt: new Date().toISOString()
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (err) {
    console.warn('Storage unavailable for admin session:', err);
  }

  // Attempt Supabase Auth login in the background to activate Supabase RLS and storage tokens
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ALLOWED_ADMIN_EMAIL,
      password: ALLOWED_ADMIN_PASSWORD
    });

    if (error) {
      console.info('Supabase Auth remote check notice:', error.message);
      // If user not yet created in Supabase Auth, try auto sign-up
      if (error.message?.includes('Invalid login credentials') || error.status === 400) {
        supabase.auth.signUp({
          email: ALLOWED_ADMIN_EMAIL,
          password: ALLOWED_ADMIN_PASSWORD,
          options: {
            data: { role: 'admin' }
          }
        }).catch(() => {});
      }
    } else if (data?.user) {
      console.info('Supabase admin session established successfully.');
    }
  } catch (err) {
    console.warn('Supabase remote auth attempt failed (local session active):', err);
  }

  return {
    success: true,
    user: {
      email: ALLOWED_ADMIN_EMAIL,
      role: 'super_admin'
    }
  };
}

/**
 * Signs out the admin, terminating local session and Supabase session.
 */
export async function logoutAdmin() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('Error clearing admin session storage:', err);
  }

  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Error during Supabase signout:', err);
  }

  return { success: true };
}

/**
 * Checks if the current user has a valid active admin session.
 */
export async function checkAdminSession() {
  // 1. Check local / session storage first
  try {
    const rawSession = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed?.email?.toLowerCase() === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
        return {
          isAuthenticated: true,
          email: ALLOWED_ADMIN_EMAIL,
          role: parsed.role || 'super_admin'
        };
      }
    }
  } catch {
    // Ignore JSON error
  }

  // 2. Check Supabase Auth session as secondary source
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email?.toLowerCase() === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      return {
        isAuthenticated: true,
        email: user.email,
        role: 'super_admin'
      };
    }
  } catch {
    // Supabase unavailable or unauthenticated
  }

  return {
    isAuthenticated: false,
    email: null,
    role: null
  };
}
