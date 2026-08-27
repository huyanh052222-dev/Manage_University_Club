import { renderCafePage } from "./pages/cafePage.js";
import { isSupportedLandingPath } from "./routes/teamRoutes.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Không tìm thấy điểm mount #app.");
}

const isLocalStaticServer = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const isAdminLoginHash = /(?:^#login$|admin\/login\/?$)/i.test(window.location.hash);

if (isAdminLoginHash) {
  window.location.replace(isLocalStaticServer ? "/pages/admin/login.html" : "/admin/login");
} else if (!isSupportedLandingPath(window.location.pathname)) {
  document.title = "Không tìm thấy trang | Cafe Horizon";
  appRoot.innerHTML = `
    <main class="route-not-found">
      <span>404</span>
      <h1>Đường dẫn không hợp lệ</h1>
      <p>Các địa chỉ nhóm dạng /a, /b… đã ngừng hoạt động. Vui lòng sử dụng đường dẫn được cấp cho nhóm.</p>
      <a href="/">Về trang tổng quan</a>
    </main>
  `;
} else {
  appRoot.innerHTML = renderCafePage();

  await import("./app.js?v=20260827-locked-reputation-stat");
}
