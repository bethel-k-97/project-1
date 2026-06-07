const UI = {
  showLoading() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
  },

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  toast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  formatPrice(amount) {
    return `${Number(amount).toLocaleString()} ETB`;
  },

  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  },

  statusBadge(status) {
    return `<span class="status-badge status-${status}">${status}</span>`;
  },

  renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '½';
    for (let i = full + half; i < 5; i++) stars += '☆';
    return stars;
  },

  calculateDays(start, end) {
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 0;
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all elements with fade-in-section class
    document.querySelectorAll('.fade-in-section').forEach((el) => observer.observe(el));

    // Observe feature cards with staggered delay
    document.querySelectorAll('.feature-card').forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(el);
    });

    // Observe stat cards with staggered delay
    document.querySelectorAll('.stat-card').forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(el);
    });

    return observer;
  },
};

window.UI = UI;

// Initialize scroll animations on DOM load
document.addEventListener('DOMContentLoaded', () => {
  UI.initScrollAnimations();
});
