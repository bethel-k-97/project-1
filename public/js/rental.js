let currentPage = 1;
let favorites = new Set();

function buildQueryParams() {
  const params = new URLSearchParams();
  params.set('page', currentPage);
  params.set('limit', '9');

  const search = document.getElementById('search-input')?.value.trim();
  const sort = document.getElementById('sort-select')?.value;
  const minPrice = document.getElementById('min-price')?.value;
  const maxPrice = document.getElementById('max-price')?.value;
  const transmission = document.getElementById('transmission-filter')?.value;
  const fuelType = document.getElementById('fuel-filter')?.value;
  const available = document.getElementById('available-only')?.checked;

  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (transmission) params.set('transmission', transmission);
  if (fuelType) params.set('fuelType', fuelType);
  if (available) params.set('available', 'true');

  const types = [...document.querySelectorAll('input[name="type"]:checked')].map((cb) => cb.value);
  if (types.length) params.set('type', types.join(','));

  return params.toString();
}

async function loadCars() {
  const grid = document.getElementById('cars-grid');
  const countEl = document.getElementById('results-count');
  const pagination = document.getElementById('pagination');

  try {
    UI.showLoading();
    grid.innerHTML = '<div class="skeleton"></div>'.repeat(3);

    const data = await api.get(`/cars?${buildQueryParams()}`);

    if (Auth.isLoggedIn()) {
      try {
        const favData = await api.get('/favorites');
        favorites = new Set(favData.favorites.map((c) => c._id));
      } catch { /* ignore */ }
    }

    if (!data.cars.length) {
      grid.innerHTML = '<div class="empty-state"><h3>No cars found</h3><p>Try adjusting your filters.</p></div>';
      countEl.textContent = '0 cars found';
      pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = data.cars.map((car) => renderCarCard(car)).join('');
    countEl.textContent = `${data.total} car${data.total !== 1 ? 's' : ''} found`;

    document.querySelectorAll('.favorite-btn').forEach((btn) => {
      const id = btn.dataset.carId;
      if (favorites.has(id)) {
        btn.classList.add('active');
        btn.textContent = '♥';
      }
      btn.addEventListener('click', () => toggleFavorite(id, btn));
    });

    renderPagination(data.page, data.pages);
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><h3>Error loading cars</h3><p>${error.message}</p></div>`;
  } finally {
    UI.hideLoading();
  }
}

async function toggleFavorite(carId, btn) {
  if (!Auth.isLoggedIn()) {
    UI.toast('Please sign in to save favorites', 'warning');
    return;
  }

  try {
    if (favorites.has(carId)) {
      await api.delete(`/favorites/${carId}`);
      favorites.delete(carId);
      btn.classList.remove('active');
      btn.textContent = '♡';
      UI.toast('Removed from favorites', 'success');
    } else {
      await api.post('/favorites', { carId });
      favorites.add(carId);
      btn.classList.add('active');
      btn.textContent = '♥';
      UI.toast('Added to favorites', 'success');
    }
  } catch (error) {
    UI.toast(error.message, 'error');
  }
}

function renderPagination(page, pages) {
  const pagination = document.getElementById('pagination');
  if (pages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = `<button ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">Prev</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button ${page >= pages ? 'disabled' : ''} data-page="${page + 1}">Next</button>`;
  pagination.innerHTML = html;

  pagination.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      loadCars();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function initFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  if (type) {
    document.querySelectorAll(`input[name="type"][value="${type}"]`).forEach((cb) => {
      cb.checked = true;
    });
  }
  const search = params.get('search');
  if (search && document.getElementById('search-input')) {
    document.getElementById('search-input').value = search;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initFiltersFromUrl();

  document.getElementById('filter-form')?.addEventListener('change', () => {
    currentPage = 1;
    loadCars();
  });

  document.getElementById('search-input')?.addEventListener(
    'input',
    UI.debounce(() => {
      currentPage = 1;
      loadCars();
    })
  );

  document.getElementById('sort-select')?.addEventListener('change', () => {
    currentPage = 1;
    loadCars();
  });

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    document.getElementById('filter-form')?.reset();
    document.getElementById('search-input').value = '';
    currentPage = 1;
    loadCars();
  });

  loadCars();
});
