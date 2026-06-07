document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const toggleBtn = document.getElementById('toggle-password');

  toggleBtn?.addEventListener('click', () => {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
    toggleBtn.textContent = input.type === 'password' ? '👁' : '🙈';
  });

  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    window.location.href = user.role === 'admin' ? '/admin.html' : '/dashboard.html';
    return;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      UI.showLoading();
      const data = await api.post('/auth/login', { email, password });
      Auth.saveSession(data.token, data.user);
      UI.toast(data.message, 'success');

      const redirect = UI.getQueryParam('redirect') || (data.user.role === 'admin' ? '/admin.html' : '/dashboard.html');
      setTimeout(() => { window.location.href = redirect; }, 800);
    } catch (error) {
      UI.toast(error.message, 'error');
    } finally {
      UI.hideLoading();
    }
  });
});
