import { renderLoginPage } from "../../scripts/components/loginPage.js?v=admin";
import { isAdminAuthenticated, loginAdmin } from "../../scripts/services/authService.js";
import { adminDashboardUrl } from "./adminRoutes.js";

const loginRoot = document.querySelector("#admin-login-root");

if (!loginRoot) {
  throw new Error("Không tìm thấy điểm mount #admin-login-root.");
}

if (isAdminAuthenticated()) {
  window.location.replace(adminDashboardUrl);
} else {
  loginRoot.innerHTML = renderLoginPage({ assetBase: "" });
  window.requestAnimationFrame(() => document.querySelector("[data-login-password]")?.focus());
}

document.addEventListener("click", (event) => {
  const toggleButton = event.target.closest('[data-action="toggle-password"]');
  if (!toggleButton) return;

  const passwordInput = document.querySelector("[data-login-password]");
  if (!passwordInput) return;

  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  toggleButton.setAttribute("aria-label", shouldShow ? "Ẩn mật khẩu" : "Hiện mật khẩu");
  passwordInput.focus();
});

document.addEventListener("submit", async (event) => {
  if (!event.target.matches("[data-login-form]")) return;
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('[type="submit"]');
  const errorLabel = form.querySelector("[data-login-error]");

  submitButton.disabled = true;
  errorLabel.textContent = "";

  const result = await loginAdmin({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!result.ok) {
    errorLabel.textContent = result.message;
    submitButton.disabled = false;
    form.querySelector("[data-login-password]")?.focus();
    return;
  }

  window.location.replace(adminDashboardUrl);
});
