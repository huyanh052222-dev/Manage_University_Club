import { currentUser } from "../data/dashboard.js";
import { icon } from "./icons.js";

export const renderTopbar = () => `
  <div class="topbar-heading">
    <button class="menu-button" type="button" data-action="toggle-sidebar" aria-label="Mở thanh điều hướng">
      ${icon("menu")}
    </button>
    <div>
      <h1 class="topbar-title">Tổng quan</h1>
      <span class="topbar-date">Chủ nhật, 20 tháng 5</span>
    </div>
  </div>

  <div class="topbar-actions">
    <button class="notification-button" type="button" data-action="show-notifications" aria-label="Xem thông báo">
      ${icon("bell")}
      <span class="notification-dot"></span>
    </button>
    <button class="user-button" type="button" data-action="show-profile" aria-label="Mở thông tin tài khoản">
      <span class="avatar" style="--avatar-a:${currentUser.colors[0]};--avatar-b:${currentUser.colors[1]}">${currentUser.initials}</span>
      <span class="user-meta">
        <span class="user-name">${currentUser.name}</span>
        <span class="role-badge">${currentUser.role}</span>
      </span>
      ${icon("chevronDown")}
    </button>
  </div>
`;
