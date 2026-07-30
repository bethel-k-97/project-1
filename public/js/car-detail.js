let car = null;
let isFavorite = false;

async function loadCarDetail() {
  const carId = UI.getQueryParam('id');
  if (!carId) {
    window.location.href = '/rental.html';
    return;
  }

  try {
    UI.showLoading();
    const data = await api.get(`/cars/${carId}`);
    car = data.car;
    renderCarDetail();

    if (Auth.isLoggedIn()) {
      const favData = await api.get(`/favorites/check/${carId}`);
      isFavorite = favData.isFavorite;
      updateFavoriteBtn();
    }

    loadReviews(carId);
  } catch (error) {
    UI.toast(error.message, 'error');
    setTimeout(() => { window.location.href = '/rental.html'; }, 2000);
  } finally {
    UI.hideLoading();
  }
}

function renderCarDetail() {
  document.title = `${car.name} - Betty Car`;
  document.getElementById('car-detail-content').innerHTML = `
    <div class="car-detail-layout">
      <div>
        <div class="car-gallery-main">
          <img src="${car.image}" alt="${car.name}">
        </div>
        <div class="mt-3">
          <h1 style="font-size:1.75rem;font-weight:800;color:var(--primary)">${car.name}</h1>
          <p class="text-muted">${car.brand} · ${car.type} · ${car.location}</p>
          <div class="car-rating mt-1">${UI.renderStars(car.rating)} (${car.reviewCount} reviews)</div>
          <p class="mt-2" style="line-height:1.7">${car.description}</p>
          <div class="car-specs">
            <div class="spec-item"><strong>${car.seats}</strong><span>Seats</span></div>
            <div class="spec-item"><strong>${car.transmission}</strong><span>Transmission</span></div>
            <div class="spec-item"><strong>${car.fuelType}</strong><span>Fuel Type</span></div>
            <div class="spec-item"><strong>${car.available ? 'Yes' : 'No'}</strong><span>Available</span></div>
          </div>
          <h3 style="font-weight:700;margin-bottom:0.5rem">Features</h3>
          <div class="features-list">
            ${(car.features || []).map((f) => `<span class="feature-tag">${f}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="booking-panel" id="book">
        <h3>Book This Car</h3>
        <p class="car-price mb-2">${UI.formatPrice(car.pricePerDay)} <span>/day</span></p>
        ${!car.available ? '<p style="color:var(--danger);font-weight:600;margin-bottom:1rem">Currently unavailable</p>' : ''}
        <form id="booking-form">
          <div class="form-group mb-2">
            <label for="pickup-date">Pickup Date</label>
            <input type="date" id="pickup-date" class="form-control" required>
          </div>
          <div class="form-group mb-2">
            <label for="return-date">Return Date</label>
            <input type="date" id="return-date" class="form-control" required>
          </div>
          <div class="form-group mb-2">
            <label for="pickup-location">Pickup Location</label>
            <input type="text" id="pickup-location" class="form-control" placeholder="Bishoftu, Ethiopia" required>
          </div>
          <div class="booking-total">
            <span>Total</span>
            <strong id="booking-total">${UI.formatPrice(0)}</strong>
          </div>
          <button type="submit" class="btn btn-primary btn-block" ${!car.available ? 'disabled' : ''}>Confirm Booking</button>
          <button type="button" id="favorite-toggle" class="btn btn-outline btn-block mt-1" style="color:var(--primary);border-color:var(--border)">
            ${isFavorite ? '♥ Saved to Favorites' : '♡ Add to Favorites'}
          </button>
        </form>
      </div>
    </div>
  `;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('pickup-date').min = today;
  document.getElementById('return-date').min = today;

  document.getElementById('pickup-date').addEventListener('change', updateBookingTotal);
  document.getElementById('return-date').addEventListener('change', updateBookingTotal);
  document.getElementById('booking-form').addEventListener('submit', handleBooking);
  document.getElementById('favorite-toggle')?.addEventListener('click', handleFavoriteToggle);
}

function updateBookingTotal() {
  const pickup = document.getElementById('pickup-date').value;
  const ret = document.getElementById('return-date').value;
  const days = UI.calculateDays(pickup, ret);
  const total = days * car.pricePerDay;
  document.getElementById('booking-total').textContent = UI.formatPrice(total);
}

async function handleBooking(e) {
  e.preventDefault();

  if (!Auth.isLoggedIn()) {
    UI.toast('Please sign in to book a car', 'warning');
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }

  const pickupDate = document.getElementById('pickup-date').value;
  const returnDate = document.getElementById('return-date').value;
  const pickupLocation = document.getElementById('pickup-location').value.trim();

  try {
    UI.showLoading();
    const data = await api.post('/bookings', {
      carId: car._id,
      pickupDate,
      returnDate,
      pickupLocation,
    });
    UI.toast(data.message, 'success');
    // Redirect to payment page instead of dashboard
    setTimeout(() => { window.location.href = `/booking-confirmation.html?bookingId=${data.booking._id}`; }, 1500);
  } catch (error) {
    UI.toast(error.message, 'error');
  } finally {
    UI.hideLoading();
  }
}

async function handleFavoriteToggle() {
  if (!Auth.isLoggedIn()) {
    UI.toast('Please sign in to save favorites', 'warning');
    return;
  }

  try {
    if (isFavorite) {
      await api.delete(`/favorites/${car._id}`);
      isFavorite = false;
      UI.toast('Removed from favorites', 'success');
    } else {
      await api.post('/favorites', { carId: car._id });
      isFavorite = true;
      UI.toast('Added to favorites', 'success');
    }
    updateFavoriteBtn();
  } catch (error) {
    UI.toast(error.message, 'error');
  }
}

function updateFavoriteBtn() {
  const btn = document.getElementById('favorite-toggle');
  if (btn) {
    btn.textContent = isFavorite ? '♥ Saved to Favorites' : '♡ Add to Favorites';
  }
}

async function loadReviews(carId) {
  try {
    const data = await api.get(`/reviews/car/${carId}`);
    const container = document.getElementById('reviews-list');

    let reviewForm = '';
    if (Auth.isLoggedIn()) {
      reviewForm = `
        <form id="review-form" class="review-form content-card" style="margin-bottom:1.5rem">
          <h3 style="font-weight:700;margin-bottom:1rem;color:var(--primary)">Write a Review</h3>
          <div class="form-group mb-2">
            <label for="review-rating">Rating</label>
            <select id="review-rating" class="form-control" required>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          <div class="form-group mb-2">
            <label for="review-comment">Your Review</label>
            <textarea id="review-comment" class="form-control" rows="3" required placeholder="Share your experience..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Submit Review</button>
        </form>`;
    }

    const reviewsHtml = data.reviews.length
      ? data.reviews.map((r) => `
        <div class="review-card">
          <div class="review-header">
            <strong>${r.user?.name || 'User'}</strong>
            <span class="review-stars">${UI.renderStars(r.rating)}</span>
          </div>
          <p>${r.comment}</p>
          <small class="text-muted">${UI.formatDate(r.createdAt)}</small>
        </div>
      `).join('')
      : '<p class="text-muted">No reviews yet. Be the first to review!</p>';

    container.innerHTML = reviewForm + reviewsHtml;

    document.getElementById('review-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.post('/reviews', {
          carId,
          rating: document.getElementById('review-rating').value,
          comment: document.getElementById('review-comment').value.trim(),
        });
        UI.toast('Review submitted!', 'success');
        loadReviews(carId);
        loadCarDetail();
      } catch (error) {
        UI.toast(error.message, 'error');
      }
    });
  } catch { /* ignore */ }
}

document.addEventListener('DOMContentLoaded', loadCarDetail);
