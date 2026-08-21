import { ADMIN_DEMO_ACCOUNT } from "../services/authService.js";
import { icon } from "./icons.js?v=auth";

export const renderLoginPage = () => `
  <main class="auth-landing" aria-labelledby="login-title">
    <section class="auth-visual" aria-label="Giới thiệu hệ thống quản trị Cafe Horizon">
      <img src="./assets/images/cafe-horizon-hero.jpg" alt="Không gian Cafe Horizon" />
      <div class="auth-visual-overlay"></div>
      <header class="auth-brand">
        <span>${icon("coffee")}</span>
        <div><strong>Cafe Horizon</strong><small>Admin Portal</small></div>
      </header>
      <div class="auth-hero-copy">
        <span class="auth-eyebrow">Hệ thống quản trị CLB sinh viên</span>
        <h2>Một nơi để quản lý<br />toàn bộ hoạt động.</h2>
        <p>Theo dõi các nhóm, nhân sự, coin và nhật ký vận hành trong một giao diện thống nhất.</p>
        <div class="auth-feature-list">
          <article><span>${icon("users")}</span><div><strong>4 nhóm</strong><small>26 hồ sơ thành viên</small></div></article>
          <article><span>${icon("wallet")}</span><div><strong>Quản lý coin</strong><small>Cộng, trừ và theo dõi log</small></div></article>
          <article><span>${icon("receipt")}</span><div><strong>Nhật ký rõ ràng</strong><small>Cập nhật hoạt động mới nhất</small></div></article>
        </div>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-mobile-brand">${icon("coffee")}<strong>Cafe Horizon</strong></div>
      <div class="login-card">
        <span class="login-kicker">ADMIN ACCESS</span>
        <h1 id="login-title">Đăng nhập quản trị</h1>
        <p>Chỉ tài khoản admin hệ thống mới có quyền truy cập dashboard.</p>

        <form class="login-form" data-login-form novalidate>
          <div class="login-field">
            <label for="admin-username">Tài khoản</label>
            <div>${icon("user")}<input id="admin-username" name="username" type="text" value="${ADMIN_DEMO_ACCOUNT.username}" autocomplete="username" required /></div>
          </div>

          <div class="login-field">
            <label for="admin-password">Mật khẩu</label>
            <div>
              ${icon("lock")}
              <input id="admin-password" name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu" data-login-password required />
              <button type="button" data-action="toggle-password" aria-label="Hiện mật khẩu">${icon("eye")}</button>
            </div>
          </div>

          <p class="login-error" data-login-error aria-live="polite"></p>
          <button class="login-submit" type="submit">Đăng nhập Admin ${icon("arrowRight")}</button>
        </form>

        <div class="demo-credentials">
          <span>${icon("checkCircle")}</span>
          <div>
            <strong>Tài khoản kiểm thử</strong>
            <p>Tài khoản: <code>${ADMIN_DEMO_ACCOUNT.username}</code> · Mật khẩu: <code>${ADMIN_DEMO_ACCOUNT.password}</code></p>
          </div>
        </div>

        <small class="login-disclaimer">Bản demo frontend · Không sử dụng thông tin nhạy cảm thật.</small>
      </div>
    </section>
  </main>
`;
