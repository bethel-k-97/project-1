function renderCarCard(car, options = {}) {
  const { showFavorite = true } = options;
  const favBtn = showFavorite && Auth.isLoggedIn()
    ? `<button class="favorite-btn" data-car-id="${car._id}" aria-label="Add to favorites">♡</button>`
    : '';

  return `
    <article class="car-card" data-type="${car.type}">
      <div class="car-card-image">
        <img src="${car.image}" alt="${car.name}" loading="lazy">
        ${car.featured ? '<span class="car-badge">Featured</span>' : ''}
        ${!car.available ? '<span class="car-badge unavailable">Unavailable</span>' : ''}
        ${favBtn}
      </div>
      <div class="car-card-body">
        <h3>${car.name}</h3>
        <p class="text-muted" style="font-size:0.875rem">${car.brand} · ${car.type}</p>
        <div class="car-rating">${UI.renderStars(car.rating || 0)} (${car.reviewCount || 0})</div>
        <div class="car-meta">
          <span>${car.seats} seats</span>
          <span>${car.transmission}</span>
          <span>${car.fuelType}</span>
        </div>
        <div class="car-price">${UI.formatPrice(car.pricePerDay)} <span>/day</span></div>
        <div class="car-card-actions">
          <a href="/car-detail.html?id=${car._id}" class="btn btn-dark btn-sm">View Details</a>
          ${car.available ? `<a href="/car-detail.html?id=${car._id}#book" class="btn btn-primary btn-sm">Book Now</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

async function initHomePage() {
  const featuredGrid = document.getElementById('featured-cars');
  if (!featuredGrid) return;

  try {
    UI.showLoading();
    
    // Load statistics
    try {
      const statsData = await api.get('/cars/stats');
      const s = statsData.stats;
      document.getElementById('stat-cars').textContent = s.totalCars;
      document.getElementById('stat-bookings').textContent = s.totalBookings;
      document.getElementById('stat-users').textContent = s.totalUsers;
      document.getElementById('stat-revenue').textContent = UI.formatPrice(s.totalRevenue);
    } catch (statsError) {
      console.error('Failed to load stats:', statsError);
    }

    // Load featured cars
    const data = await api.get('/cars/featured');
    if (data.cars.length) {
      featuredGrid.innerHTML = data.cars.map((car) => renderCarCard(car)).join('');
    } else {
      const fallback = await api.get('/cars?limit=4');
      featuredGrid.innerHTML = fallback.cars.map((car) => renderCarCard(car)).join('');
    }
  } catch (error) {
    featuredGrid.innerHTML = `<div class="empty-state"><h3>Unable to load cars</h3><p>${error.message}</p></div>`;
  } finally {
    UI.hideLoading();
  }

  document.getElementById('hero-search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const search = e.target.search.value;
    const type = e.target.type.value;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    window.location.href = `/rental.html?${params.toString()}`;
  });
}

document.addEventListener('DOMContentLoaded', initHomePage);
