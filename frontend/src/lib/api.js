/**
 * src/lib/api.js
 *
 * Minimal fetch wrapper for communicating with the Namma Taxi backend.
 *
 * PHASE 1 — Basic structure only.
 * Phase 2 will add: auth token injection, auto-refresh, retry logic.
 *
 * Usage:
 *   import api from '@/lib/api';
 *   const data = await api.get('/bookings');
 *   const result = await api.post('/quotes', { ... });
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Core request method.
   * @param {string} path   - Relative path (e.g. '/bookings')
   * @param {object} options - fetch options override
   */
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;

    const headers = {
      ...options.headers,
    };

    // Only set application/json if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Inject JWT from localStorage based on route context
    let tokenKey = 'customer_token';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    
    if (pathname.startsWith('/admin')) {
      tokenKey = 'admin_token';
    } else if (pathname.startsWith('/driver')) {
      tokenKey = 'driver_token';
    }

    const tokenKeys = ['customer_token', 'admin_token', 'driver_token'];
    let token = localStorage.getItem(tokenKey);
    
    // Fallback: If no token found for current path, try any available token
    if (!token) {
      for (const key of tokenKeys) {
        const fallbackToken = localStorage.getItem(key);
        if (fallbackToken) {
          token = fallbackToken;
          break;
        }
      }
    }
    
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Global Session Expiration Handler
      if (response.status === 401) {
        console.warn('Session expired or unauthorized. Clearing credentials.');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('driver_token');
        
        // Avoid redirect loop if already on a login page
        const isLoginPage = pathname.includes('/login');
        if (!isLoginPage && typeof window !== 'undefined') {
          // Redirect based on context
          if (pathname.startsWith('/admin')) window.location.href = '/admin/login';
          else if (pathname.startsWith('/driver')) window.location.href = '/driver/login';
          else window.location.href = '/user'; // For customers
        }
      }

      const error = new Error(data?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.code = data?.code;
      error.data = data;
      throw error;
    }

    return data;
  }

  get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  }

  post(path, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(path, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  put(path, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(path, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  patch(path, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(path, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' });
  }

  /**
   * Check backend health.
   * Hits /api/health (not /api/v1/health).
   */
  async health() {
    const healthUrl = BASE_URL.replace('/v1', '/health').replace('/api/v1', '/api/health');
    const response = await fetch(healthUrl);
    return response.json();
  }
}

const api = new ApiClient(BASE_URL);
export default api;
