const API_BASE = '/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('bettycar_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = { ...options, headers };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Handle 403 Forbidden - admin access denied
      if (response.status === 403) {
        UI.toast('Admin access required', 'error');
        window.location.href = '/dashboard.html';
        throw new Error('Admin access required');
      }
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        localStorage.removeItem('bettycar_token');
        localStorage.removeItem('bettycar_user');
        window.location.href = '/login.html';
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient();
window.api = api;
