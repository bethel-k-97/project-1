// Basic form validation and success message for Betty Car website

document.addEventListener('DOMContentLoaded', function () {
  // Sign In form
  const signinForm = document.querySelector('.signin-form');
  if (signinForm) {
    signinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = signinForm.email.value.trim();
      const password = signinForm.password.value.trim();
      if (!email || !password) {
        alert('Please fill in both email and password.');
        return;
      }
      alert('Sign in successful! (Demo only)');
      signinForm.reset();
    });
  }

  // Contact form
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }
      alert('Thank you for contacting us! (Demo only)');
      contactForm.reset();
    });
  }

  // --- Rental Page Interactivity ---
  // Car type filter
  const filterForm = document.querySelector('.filters form');
  const carCards = document.querySelectorAll('.car-card');
  if (filterForm && carCards.length) {
    filterForm.addEventListener('change', function () {
      const checked = Array.from(filterForm.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      carCards.forEach(card => {
        const type = card.querySelector('h3').textContent.trim();
        if (checked.length === 0 || checked.includes(type)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // --- Price Calculation for Rental Form ---
  const pricePerDay = {
    'Sedan': 2000,
    'SUV': 3500,
    'Luxury': 7000,
    'Van': 4000,
    'Pickup': 3000,
    'Minivan': 3800,
    'Convertible': 6000,
    'Truck': 5000,
    'Electric': 2500,
    'Compact': 1800
  };
  function calculateDays(start, end) {
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 0;
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  }
  const rentalForm = document.querySelector('.rental-form');
  const totalPriceEl = document.getElementById('total-price');
  if (rentalForm && totalPriceEl) {
    function updateTotalPrice() {
      const carType = rentalForm['car-type'].value;
      const pickupDate = rentalForm['pickup-date'].value;
      const returnDate = rentalForm['return-date'].value;
      const days = calculateDays(pickupDate, returnDate);
      const price = pricePerDay[carType] || 0;
      const total = days > 0 ? days * price : 0;
      totalPriceEl.textContent = `Total Price: ${total.toLocaleString()} ETB`;
    }
    rentalForm['car-type'].addEventListener('change', updateTotalPrice);
    rentalForm['pickup-date'].addEventListener('change', updateTotalPrice);
    rentalForm['return-date'].addEventListener('change', updateTotalPrice);
    // Also update on page load
    updateTotalPrice();
  }

  // Rental form submission
  if (rentalForm) {
    rentalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const carType = rentalForm['car-type'].value;
      const pickupDate = rentalForm['pickup-date'].value;
      const returnDate = rentalForm['return-date'].value;
      const pickupLocation = rentalForm['pickup-location'].value.trim();
      if (!carType || !pickupDate || !returnDate || !pickupLocation) {
        alert('Please fill in all fields to book your car.');
        return;
      }
      const days = calculateDays(pickupDate, returnDate);
      const price = pricePerDay[carType] || 0;
      const total = days > 0 ? days * price : 0;
      alert(`Booking Confirmed!\nCar: ${carType}\nPickup: ${pickupDate} at ${pickupLocation}\nReturn: ${returnDate}\nTotal Price: ${total.toLocaleString()} ETB`);
      rentalForm.reset();
      totalPriceEl.textContent = 'Total Price: 0 ETB';
    });
  }

  // --- Home Page Cars Modal ---
  const seeMoreBtn = document.getElementById('see-more-cars');
  const carsModal = document.getElementById('cars-modal');
  const closeCarsModal = document.getElementById('close-cars-modal');
  if (seeMoreBtn && carsModal && closeCarsModal) {
    seeMoreBtn.addEventListener('click', function () {
      carsModal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    });
    closeCarsModal.addEventListener('click', function () {
      carsModal.style.display = 'none';
      document.body.style.overflow = '';
    });
    // Close modal when clicking outside modal-content
    carsModal.addEventListener('click', function (e) {
      if (e.target === carsModal) {
        carsModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  // --- Sign In Page Interactivity ---
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.innerHTML = '<i class="fa fa-eye-slash"></i>';
      } else {
        passwordInput.type = 'password';
        togglePassword.innerHTML = '<i class="fa fa-eye"></i>';
      }
    });
  }
  const googleSignin = document.getElementById('google-signin');
  if (googleSignin) {
    googleSignin.addEventListener('click', function (e) {
      e.preventDefault();
      alert('Google sign-in is a demo feature!');
    });
  }
}); 