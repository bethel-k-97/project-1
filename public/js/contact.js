document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    try {
      UI.showLoading();
      const data = await api.post('/contact', { name, email, message });
      UI.toast(data.message, 'success');
      form.reset();
    } catch (error) {
      UI.toast(error.message, 'error');
    } finally {
      UI.hideLoading();
    }
  });
});
