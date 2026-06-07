async function loadBookings() {
  const container = document.getElementById('bookings-list');
  try {
    const data = await api.get('/bookings/my');
    if (!data.bookings.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No bookings yet</h3>
          <p>Start exploring our fleet and book your first ride.</p>
          <a href="/rental.html" class="btn btn-primary mt-2">Browse Cars</a>
        </div>`;
      return;
    }

    container.innerHTML = data.bookings.map((b) => `
      <div class="booking-card">
        <img src="${b.car?.image || ''}" alt="${b.car?.name || 'Car'}">
        <div>
          <h3 style="font-weight:700;color:var(--primary)">${b.car?.name || 'Car'}</h3>
          <p class="text-muted">${b.car?.brand} · ${b.car?.type}</p>
          <p><strong>Pickup:</strong> ${UI.formatDate(b.pickupDate)} · ${b.pickupLocation}</p>
          <p><strong>Return:</strong> ${UI.formatDate(b.returnDate)} · ${b.totalDays} day(s)</p>
          <p><strong>Total:</strong> ${UI.formatPrice(b.totalPrice)}</p>
        </div>
        <div style="text-align:right">
          ${UI.statusBadge(b.status)}
          ${!['completed', 'cancelled'].includes(b.status) ? `<button class="btn btn-sm btn-outline mt-1 cancel-booking" data-id="${b._id}" style="color:var(--danger);border-color:var(--danger)">Cancel</button>` : ''}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.cancel-booking').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Cancel this booking?')) return;
        try {
          await api.put(`/bookings/${btn.dataset.id}/cancel`);
          UI.toast('Booking cancelled', 'success');
          loadBookings();
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });
    });
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><p>${error.message}</p></div>`;
  }
}

async function loadFavorites() {
  const container = document.getElementById('favorites-list');
  try {
    const data = await api.get('/favorites');
    if (!data.favorites.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No favorites yet</h3>
          <p>Save cars you love for quick access later.</p>
          <a href="/rental.html" class="btn btn-primary mt-2">Browse Cars</a>
        </div>`;
      return;
    }
    container.innerHTML = `<div class="car-grid">${data.favorites.map((car) => renderCarCard(car, { showFavorite: false })).join('')}</div>`;
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><p>${error.message}</p></div>`;
  }
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  document.getElementById('dashboard-greeting').textContent = `Welcome back, ${user.name}`;

  initTabs();
  UI.showLoading();
  await Promise.all([loadBookings(), loadFavorites()]);
  UI.hideLoading();

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api.put('/auth/profile', {
        name: e.target.name.value.trim(),
        phone: e.target.phone.value.trim(),
      });
      Auth.saveSession(Auth.getToken(), data.user);
      UI.toast('Profile updated', 'success');
      document.getElementById('dashboard-greeting').textContent = `Welcome back, ${data.user.name}`;
    } catch (error) {
      UI.toast(error.message, 'error');
    }
  });

  if (user) {
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
  }
});
