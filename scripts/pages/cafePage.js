export const renderCafePage = () => `
  <div class="auth-view" id="auth-view"></div>

  <div class="app-shell" id="app-shell" data-page="cafe-horizon" hidden>
    <aside class="sidebar" id="sidebar" aria-label="Điều hướng chính"></aside>
    <button class="sidebar-overlay" type="button" data-action="close-sidebar" aria-label="Đóng thanh điều hướng"></button>

    <main class="main-content">
      <header class="topbar" id="topbar"></header>
      <div class="dashboard" id="dashboard" aria-live="polite"></div>
    </main>
  </div>

  <div class="toast-region" id="toast-region" aria-live="polite"></div>
  <div class="modal-root" id="modal-root"></div>
`;
