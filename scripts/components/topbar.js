import { finance } from "../data/dashboard.js";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderTopbar = () => `
  <div class="topbar-heading">
    <button class="menu-button" type="button" data-action="toggle-sidebar" aria-label="Mở thanh điều hướng">
      ${icon("menu")}
    </button>
    <div class="week-context">
      <span class="week-icon">${icon("calendarCheck")}</span>
      <div>
        <h1 class="topbar-title">Tuần 18</h1>
        <span class="topbar-date">Ngày 3 / 7 · Mùa xuân 2024</span>
      </div>
    </div>
  </div>

  <div class="top-finance" aria-label="Tổng hợp tài chính tuần">
    <button class="top-finance-item admin-coin-entry" type="button" data-action="manage-group-coins" aria-label="Điều chỉnh coin của các nhóm"><span>${icon("wallet")}</span><div><small>Tiền mặt · Điều chỉnh</small><strong>${formatNumber(finance.currentFund)} coin</strong></div></button>
    <div class="top-finance-item positive"><span>${icon("trendingUp")}</span><div><small>Doanh thu tuần</small><strong>+${formatNumber(finance.income)} coin</strong></div></div>
    <div class="top-finance-item negative"><span>${icon("arrowDown")}</span><div><small>Chi phí tuần</small><strong>-${formatNumber(finance.expense)} coin</strong></div></div>
    <div class="top-finance-item profit"><span>${icon("coffee")}</span><div><small>Lợi nhuận tuần</small><strong>+${formatNumber(finance.weeklyFlow)} coin</strong></div></div>
  </div>

  <div class="topbar-actions">
    <button class="notification-button" type="button" data-action="show-notifications" aria-label="Xem thông báo">
      ${icon("bell")}
      <span class="notification-dot"></span>
    </button>
  </div>
`;
