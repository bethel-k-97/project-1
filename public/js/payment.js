document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  if (!Auth.requireAuth()) return;

  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');

  if (!bookingId) {
    UI.toast('No booking ID provided', 'error');
    window.location.href = '/dashboard.html';
    return;
  }

  // Load booking details
  await loadBookingDetails(bookingId);

  // Handle payment method selection
  const paymentMethodSelect = document.getElementById('payment-method');
  const paymentMethodInfo = document.getElementById('payment-method-info');
  const paymentInfoText = document.getElementById('payment-info-text');

  const paymentInfoMessages = {
    stripe: 'You will be redirected to Stripe\'s secure payment page to complete your card payment.',
    chapa: 'You will be redirected to Chapa\'s payment gateway to complete your mobile money payment.',
    bank_transfer: 'Please transfer the amount to our bank account. Details will be provided after confirmation.',
    cash: 'You will pay the full amount when picking up the car. Please bring exact change if possible.',
  };

  paymentMethodSelect.addEventListener('change', () => {
    const selectedMethod = paymentMethodSelect.value;
    if (selectedMethod && paymentInfoMessages[selectedMethod]) {
      paymentMethodInfo.style.display = 'block';
      paymentInfoText.textContent = paymentInfoMessages[selectedMethod];
    } else {
      paymentMethodInfo.style.display = 'none';
    }
  });

  // Handle payment form submission
  const paymentForm = document.getElementById('payment-form');
  const payButton = document.getElementById('pay-button');
  const btnText = payButton.querySelector('.btn-text');
  const btnLoader = payButton.querySelector('.btn-loader');

  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const paymentMethod = paymentMethodSelect.value;
    const terms = document.getElementById('terms').checked;

    if (!paymentMethod) {
      UI.toast('Please select a payment method', 'error');
      return;
    }

    if (!terms) {
      UI.toast('Please agree to the terms and conditions', 'error');
      return;
    }

    // Show loading state
    payButton.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    UI.showLoading();

    try {
      const response = await api.post('/payment/initiate', {
        bookingId,
        paymentMethod,
      });

      if (response.success) {
        UI.toast('Payment processed successfully!', 'success');
        window.location.href = `/payment-success.html?bookingId=${bookingId}`;
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error) {
      UI.toast(error.message || 'Payment processing failed', 'error');
      window.location.href = `/payment-failed.html?bookingId=${bookingId}`;
    } finally {
      // Reset button state
      payButton.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      UI.hideLoading();
    }
  });
});

async function loadBookingDetails(bookingId) {
  try {
    UI.showLoading();
    const data = await api.get(`/payment/booking/${bookingId}`);
    const booking = data.booking;

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      UI.toast('This booking has already been paid', 'info');
      window.location.href = `/payment-success.html?bookingId=${bookingId}`;
      return;
    }

    // Display booking details
    const bookingDetails = document.getElementById('booking-details');
    bookingDetails.innerHTML = `
      <div class="booking-summary-card">
        <div class="car-info">
          <img src="${booking.car.image}" alt="${booking.car.name}" class="car-thumbnail">
          <div class="car-details">
            <h3>${booking.car.name}</h3>
            <p class="car-brand">${booking.car.brand} · ${booking.car.type}</p>
          </div>
        </div>
        
        <div class="booking-info">
          <div class="info-row">
            <span class="label">Pickup Date:</span>
            <span class="value">${UI.formatDate(booking.pickupDate)}</span>
          </div>
          <div class="info-row">
            <span class="label">Return Date:</span>
            <span class="value">${UI.formatDate(booking.returnDate)}</span>
          </div>
          <div class="info-row">
            <span class="label">Pickup Location:</span>
            <span class="value">${booking.pickupLocation}</span>
          </div>
          <div class="info-row">
            <span class="label">Duration:</span>
            <span class="value">${booking.totalDays} day(s)</span>
          </div>
        </div>

        <div class="payment-summary">
          <div class="summary-row">
            <span class="label">Price per Day:</span>
            <span class="value">${UI.formatPrice(booking.pricePerDay)}</span>
          </div>
          <div class="summary-row">
            <span class="label">Total Days:</span>
            <span class="value">${booking.totalDays}</span>
          </div>
          <div class="summary-row total">
            <span class="label">Total Amount:</span>
            <span class="value">${UI.formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    UI.toast(error.message || 'Failed to load booking details', 'error');
    document.getElementById('booking-details').innerHTML = `
      <div class="error-message">
        <p>Unable to load booking details.</p>
        <a href="/dashboard.html" class="btn btn-outline">Return to Dashboard</a>
      </div>
    `;
  } finally {
    UI.hideLoading();
  }
}
