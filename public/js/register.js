document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const toggleBtn = document.getElementById('toggle-password');

  toggleBtn?.addEventListener('click', () => {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
    toggleBtn.textContent = input.type === 'password' ? '👁' : '🙈';
  });

  if (Auth.isLoggedIn()) {
    window.location.href = '/dashboard.html';
    return;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirm = form.confirmPassword.value;

    if (password !== confirm) {
      UI.toast('Passwords do not match', 'error');
      return;
    }

    try {
      UI.showLoading();
      const data = await api.post('/auth/register', { name, email, phone, password });
      Auth.saveSession(data.token, data.user);
      UI.toast('Welcome to Betty Car!', 'success');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 800);
    } catch (error) {
      UI.toast(error.message, 'error');
    } finally {
      UI.hideLoading();
    }
  });
});
