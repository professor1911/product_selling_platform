import { supabase } from "@/integrations/supabase/client";

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Email validation with improved regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
};

// Phone validation (international format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Rate limiting for inquiry submissions
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const checkRateLimit = (identifier: string, maxAttempts: number = 3, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxAttempts) {
    return false;
  }
  
  entry.count++;
  return true;
};

// Session validation utility
export const validateSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { isValid: false, session: null };
  }
  
  // Check if session is expired
  const expiresAt = session.expires_at;
  if (expiresAt && Date.now() / 1000 > expiresAt) {
    return { isValid: false, session: null };
  }
  
  return { isValid: true, session };
};

// Admin action logging utility
export const logAdminAction = async (
  action: string,
  targetTable?: string,
  targetId?: string,
  oldData?: any,
  newData?: any
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.rpc('log_admin_action', {
      action_type: action,
      target_table_name: targetTable || null,
      target_record_id: targetId || null,
      old_data: oldData || null,
      new_data: newData || null
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const setCSRFToken = (token: string) => {
  sessionStorage.setItem('csrf_token', token);
};

export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};

// Content Security Policy helper
export const getCSPNonce = (): string => {
  return crypto.randomUUID();
};