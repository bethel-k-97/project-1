async function loadStats() {
  try {
    const data = await api.get('/admin/stats');
    const s = data.stats;
    document.getElementById('stat-cars').textContent = s.totalCars;
    document.getElementById('stat-bookings').textContent = s.totalBookings;
    document.getElementById('stat-users').textContent = s.totalUsers;
    document.getElementById('stat-revenue').textContent = UI.formatPrice(s.totalRevenue);
  } catch (error) {
    UI.toast(error.message, 'error');
  }
}

async function loadAdminBookings() {
  const tbody = document.getElementById('admin-bookings-body');
  try {
    const data = await api.get('/admin/bookings');
    tbody.innerHTML = data.bookings.map((b) => `
      <tr>
        <td>${b.user?.name}<br><small class="text-muted">${b.user?.email}</small></td>
        <td>${b.car?.name}</td>
        <td>${UI.formatDate(b.pickupDate)} - ${UI.formatDate(b.returnDate)}</td>
        <td>${UI.formatPrice(b.totalPrice)}</td>
        <td>
          <select class="form-control status-select" data-id="${b._id}" style="padding:0.375rem">
            ${['pending','confirmed','active','completed','cancelled'].map((s) =>
              `<option value="${s}" ${b.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        try {
          await api.put(`/admin/bookings/${sel.dataset.id}/status`, { status: sel.value });
          UI.toast('Status updated', 'success');
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
  }
}

async function loadAdminCars() {
  const tbody = document.getElementById('admin-cars-body');
  try {
    const data = await api.get('/cars?limit=100');
    tbody.innerHTML = data.cars.map((c) => `
      <tr>
        <td>${c.name}</td>
        <td>${c.type}</td>
        <td>${UI.formatPrice(c.pricePerDay)}</td>
        <td>${c.available ? '✓' : '✗'}</td>
        <td>${UI.renderStars(c.rating)}</td>
        <td>
          <button class="btn btn-sm btn-outline edit-car" data-id="${c._id}" style="color:var(--primary);border-color:var(--border)">Edit</button>
          <button class="btn btn-sm btn-outline delete-car" data-id="${c._id}" style="color:var(--danger);border-color:var(--danger)">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.delete-car').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this car?')) return;
        try {
          await api.delete(`/admin/cars/${btn.dataset.id}`);
          UI.toast('Car deleted', 'success');
          loadAdminCars();
          loadStats();
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });
    });

    tbody.querySelectorAll('.edit-car').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const car = data.cars.find((c) => c._id === btn.dataset.id);
        if (!car) return;
        document.getElementById('car-id').value = car._id;
        document.getElementById('car-name').value = car.name;
        document.getElementById('car-brand').value = car.brand;
        document.getElementById('car-type').value = car.type;
        document.getElementById('car-price').value = car.pricePerDay;
        document.getElementById('car-image').value = car.image;
        document.getElementById('car-description').value = car.description;
        document.getElementById('car-available').checked = car.available;
        document.getElementById('car-featured').checked = car.featured;
        document.getElementById('car-form-title').textContent = 'Edit Car';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
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
  if (!Auth.requireAdmin()) return;

  initTabs();
  UI.showLoading();
  await Promise.all([loadStats(), loadAdminBookings(), loadAdminCars()]);
  UI.hideLoading();

  document.getElementById('car-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const carId = document.getElementById('car-id').value;
    const payload = {
      name: document.getElementById('car-name').value.trim(),
      brand: document.getElementById('car-brand').value.trim(),
      type: document.getElementById('car-type').value,
      pricePerDay: Number(document.getElementById('car-price').value),
      image: document.getElementById('car-image').value.trim(),
      description: document.getElementById('car-description').value.trim(),
      available: document.getElementById('car-available').checked,
      featured: document.getElementById('car-featured').checked,
      seats: 5,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      features: ['Air Conditioning', 'Bluetooth'],
      location: 'Bishoftu, Ethiopia',
    };

    try {
      UI.showLoading();
      if (carId) {
        await api.put(`/admin/cars/${carId}`, payload);
        UI.toast('Car updated', 'success');
      } else {
        await api.post('/admin/cars', payload);
        UI.toast('Car created', 'success');
      }
      e.target.reset();
      document.getElementById('car-id').value = '';
      document.getElementById('car-form-title').textContent = 'Add New Car';
      loadAdminCars();
      loadStats();
    } catch (error) {
      UI.toast(error.message, 'error');
    } finally {
      UI.hideLoading();
    }
  });

  document.getElementById('reset-car-form')?.addEventListener('click', () => {
    document.getElementById('car-form').reset();
    document.getElementById('car-id').value = '';
    document.getElementById('car-form-title').textContent = 'Add New Car';
  });
});
