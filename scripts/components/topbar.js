import { finance } from "../data/dashboard.js";
import { getCafeWeekContext } from "../utils/cafeWeek.js?v=monday-cycle";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";
import { renderWeeklyCostPopover } from "./weeklyCosts.js?v=profit-salary";
import { renderWeeklyProfitPopover } from "./weeklyProfit.js?v=monday-cycle";
import { getTeamLandingUrl } from "../routes/teamRoutes.js?v=cafe-visit";

const formatSignedCoin = (amount) => {
  if (amount === 0) return "0 coin";
  return `${amount > 0 ? "+" : "−"}${formatNumber(Math.abs(amount))} coin`;
};

export const renderTopbar = ({ isVisiting = false, originTeamId = "", localStaticServer = false } = {}) => {
  const returnRankingUrl = originTeamId
    ? `${getTeamLandingUrl(originTeamId, { localStaticServer })}#ranking`
    : "#ranking";
  const weekContext = getCafeWeekContext();
  const hasSettlement = finance.settlementStatus === "settled";
  const settlementDisplay = hasSettlement ? formatSignedCoin(finance.weeklyFlow) : "Chờ kết toán";
  return `
  <div class="topbar-heading">
    <button class="menu-button" type="button" data-action="toggle-sidebar" aria-label="Mở thanh điều hướng">
      ${icon("menu")}
    </button>
    <div class="week-context">
      <span class="week-icon">${icon("calendarCheck")}</span>
      <div>
        <h1 class="topbar-title">${weekContext.title}</h1>
        <span class="topbar-date">${weekContext.subtitle}</span>
      </div>
    </div>
  </div>

  ${isVisiting ? `
  <div class="visitor-finance-lock" aria-label="Dữ liệu tài chính đã khóa trong chế độ ghé thăm">
    <span>${icon("lock")}</span>
    <div><strong>Tài chính được bảo mật</strong><small>Chế độ ghé thăm không hiển thị doanh thu, chi phí hay số dư.</small></div>
  </div>
  ` : `
  <div class="top-finance" aria-label="Tổng hợp tài chính tuần">
    <div class="top-finance-item"><span>${icon("wallet")}</span><div><small>Tiền mặt</small><strong>${formatNumber(finance.currentFund)} coin</strong></div></div>
    <div class="top-finance-item positive"><span>${icon("trendingUp")}</span><div><small>Doanh thu tuần</small><strong>${formatSignedCoin(finance.income)}</strong></div></div>
    <div class="top-finance-item negative weekly-cost-container">
      <button
        class="weekly-cost-trigger"
        type="button"
        data-action="weekly-costs"
        aria-label="Chi phí tuần ${formatSignedCoin(-finance.expense)}. Xem bảng dự toán chi tiết"
      >
        <span class="weekly-cost-trigger-icon">${icon("arrowDown")}</span>
        <span class="weekly-cost-trigger-copy"><small>Chi phí tuần</small><strong>${formatSignedCoin(-finance.expense)}</strong></span>
      </button>
      ${renderWeeklyCostPopover()}
    </div>
    <div class="top-finance-item profit weekly-profit-container ${hasSettlement ? (finance.weeklyFlow < 0 ? "is-negative" : "is-positive") : "is-pending"}">
      <button
        class="weekly-profit-trigger"
        type="button"
        data-action="weekly-profit"
        aria-label="Lợi nhuận kết toán ${settlementDisplay}. Xem chi tiết kỳ kết toán"
      >
        <span class="weekly-profit-trigger-icon">${icon("coffee")}</span>
        <span class="weekly-profit-trigger-copy"><small>Lợi nhuận kết toán</small><strong>${settlementDisplay}</strong></span>
      </button>
      ${renderWeeklyProfitPopover()}
    </div>
  </div>
  `}

  <div class="topbar-actions">
    ${isVisiting ? `
      <div class="visitor-topbar-group">
        ${originTeamId ? `
          <a class="visitor-topbar-return-btn" href="${returnRankingUrl}" title="Quay về Bảng xếp hạng quán của bạn">
            ${icon("award")} <span>Quay về BXH</span>
          </a>
        ` : ""}
        <span class="visitor-mode-badge">${icon("eye")} Đang ghé thăm</span>
      </div>
    ` : `<button class="notification-button" type="button" data-action="show-notifications" aria-label="Xem thông báo">
      ${icon("bell")}
      <span class="notification-dot"></span>
    </button>`}
  </div>
`;
};
