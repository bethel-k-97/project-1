function renderNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const user = Auth.getUser();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = [
    { href: '/index.html', label: 'Home' },
    { href: '/rental.html', label: 'Rentals' },
    { href: '/about.html', label: 'About' },
    { href: '/contact.html', label: 'Contact' },
    { href: '/terms.html', label: 'Terms' },
  ];

  const authLinks = user
    ? user.role === 'admin'
      ? `<a href="/admin.html" class="btn btn-sm btn-primary">Admin</a>
         <a href="/dashboard.html" class="btn btn-sm btn-outline">Dashboard</a>
         <button class="btn btn-sm btn-outline" id="logout-btn">Logout</button>`
      : `<a href="/dashboard.html" class="btn btn-sm btn-outline">My Account</a>
         <button class="btn btn-sm btn-outline" id="logout-btn">Logout</button>`
    : `<a href="/login.html" class="btn btn-sm btn-outline">Sign In</a>
       <a href="/register.html" class="btn btn-sm btn-primary">Register</a>`;

  nav.innerHTML = `
    <div class="container">
      <a href="/index.html" class="logo">
        <div class="logo-icon">BC</div>
        Betty<span>Car</span>
      </a>
      <div class="nav-links">
        ${navLinks.map((l) => `<a href="${l.href}" class="${currentPage === l.href.replace('/', '') ? 'active' : ''}">${l.label}</a>`).join('')}
      </div>
      <div class="nav-actions">
        ${authLinks}
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu">
      ${navLinks.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}
      ${user ? `<a href="/dashboard.html">My Account</a>${user.role === 'admin' ? '<a href="/admin.html">Admin Panel</a>' : ''}<a href="#" id="mobile-logout">Logout</a>` : '<a href="/login.html">Sign In</a><a href="/register.html">Register</a>'}
    </div>
  `;

  document.getElementById('nav-toggle')?.addEventListener('click', () => {
    document.getElementById('nav-toggle').classList.toggle('active');
    document.getElementById('mobile-menu').classList.toggle('open');
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());
  document.getElementById('mobile-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    Auth.logout();
  });
}

function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/index.html" class="logo">
            <div class="logo-icon">BC</div>
            Betty<span>Car</span>
          </a>
          <p>Premium car rental service in Bishoftu, Ethiopia. Safe, reliable, and affordable transportation for every journey.</p>
          <div class="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">f</a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">in</a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">x</a>
            <a href="https://wa.me/251900000000" target="_blank" rel="noopener" aria-label="WhatsApp">wa</a>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <div class="footer-links">
            <a href="/rental.html">Browse Cars</a>
            <a href="/about.html">About Us</a>
            <a href="/contact.html">Contact</a>
            <a href="/terms.html">Terms & Services</a>
          </div>
        </div>
        <div>
          <h4>Services</h4>
          <div class="footer-links">
            <a href="/rental.html?type=SUV">SUV Rental</a>
            <a href="/rental.html?type=Luxury">Luxury Cars</a>
            <a href="/rental.html?type=Van">Group Travel</a>
            <a href="/rental.html?type=Electric">Electric Cars</a>
          </div>
        </div>
        <div>
          <h4>Contact</h4>
          <div class="footer-links">
            <a href="mailto:info@bettycar.com">info@bettycar.com</a>
            <a href="tel:+251900000000">+251 900 000 000</a>
            <span style="display:block;padding:0.375rem 0;font-size:0.9375rem;color:rgba(255,255,255,0.65)">Bishoftu, Ethiopia</span>
            <span style="display:block;font-size:0.875rem;color:rgba(255,255,255,0.5)">Mon–Sat: 8AM – 6PM</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} Betty Car. All rights reserved.</span>
        <span>Premium Car Rental Platform</span>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
});

window.addEventListener('auth-change', () => {
  renderNavbar();
});

window.renderNavbar = renderNavbar;
window.renderFooter = renderFooter;
