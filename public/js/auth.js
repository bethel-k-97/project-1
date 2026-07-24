const AUTH_KEY = 'bettycar_token';
const USER_KEY = 'bettycar_user';

const Auth = {
  getToken() {
    return localStorage.getItem(AUTH_KEY);
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  saveSession(token, user) {
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/login.html';
  },

  requireAuth(redirect = '/login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = `${redirect}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return false;
    }
    return true;
  },

  requireAdmin() {
    // Only check if logged in - backend handles actual authorization
    if (!this.requireAuth()) return false;
    return true;
  },

  async refreshUser() {
    if (!this.isLoggedIn()) return null;
    try {
      const data = await api.get('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));
      return data.user;
    } catch {
      this.logout();
      return null;
    }
  },
};

window.Auth = Auth;
