import { orders } from "../data/dashboard.js";
import { summarizeWeeklyOrders } from "../services/weeklyOrders.js?v=weekly-cafe-orders";
import { escapeHtml, formatNumber } from "../utils/format.js";
import {
  formatOrderDeadline,
  getOrderDeadlineStatus,
  getOrderStatusLabel,
  normalizeOrderSourceUrl,
} from "../utils/order.js";
import { icon } from "./icons.js";

const renderOrder = (order) => `
  <button class="hot-task-row order-row" type="button" data-action="view-order" data-order-id="${escapeHtml(order.id)}">
    <span class="task-tone ${escapeHtml(order.tone || "purple")}">${icon(order.icon || "receipt")}</span>
    <span class="order-row-copy">
      <strong>${escapeHtml(order.title)}</strong>
      <span>${escapeHtml(order.description)}</span>
    </span>
    <span class="order-row-meta">
      <b>+${formatNumber(order.reward)} coin</b>
      <small>Hạn: <em>${escapeHtml(formatOrderDeadline(order.deadline, { short: true }))}</em></small>
    </span>
  </button>
`;

export const renderOrders = () => `
  <section class="cafe-panel orders-panel" id="orders" aria-labelledby="orders-title">
    <header class="cafe-panel-header">
      <span class="section-icon coral">${icon("receipt")}</span>
      <div><h2 id="orders-title">Đơn hàng</h2><p>10 đơn chung cho 8 quán · 200 coin/đơn</p></div>
    </header>
    <div class="order-allocation" aria-label="Phân bổ 10 đơn hàng tuần">
      ${summarizeWeeklyOrders(orders).map((item) => `
        <span>${escapeHtml(item.title)} <b>×${item.quantity}</b></span>
      `).join("")}
    </div>
    <div class="hot-task-list order-list">
      ${orders.map(renderOrder).join("")}
    </div>
    <button class="cafe-panel-link" type="button" data-action="all-orders">Xem tất cả đơn hàng ${icon("arrowRight")}</button>
  </section>
`;

export const renderOrderDetail = (order) => {
  const sourceUrl = normalizeOrderSourceUrl(order.sourceUrl);
  const isPlaceholderSource = sourceUrl === "#";
  const requirementLines = String(order.requirements || "Chưa có yêu cầu chi tiết.")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return `
    <div class="order-detail">
      <div class="order-detail-heading">
        <span class="task-tone ${escapeHtml(order.tone || "purple")}">${icon(order.icon || "receipt")}</span>
        <div>
          <span class="order-status">${escapeHtml(getOrderStatusLabel(order.status))}</span>
          <p>${escapeHtml(order.description)}</p>
        </div>
      </div>

      <section class="order-requirement" aria-labelledby="order-requirement-title">
        <h3 id="order-requirement-title">Yêu cầu chính</h3>
        <ul>${requirementLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      </section>

      <div class="order-detail-grid">
        <section>
          <span>${icon("clock")} Deadline</span>
          <strong>${escapeHtml(formatOrderDeadline(order.deadline))}</strong>
          <small>${escapeHtml(getOrderDeadlineStatus(order.deadline))}</small>
        </section>
        <section>
          <span>${icon("wallet")} Mức thưởng</span>
          <strong class="positive-text">+${formatNumber(order.reward)} coin</strong>
          <small>Ghi vào số dư khi hoàn thành</small>
        </section>
      </div>

      <div class="order-detail-actions">
        <a
          class="primary-button order-source-link"
          href="${escapeHtml(sourceUrl)}"
          ${isPlaceholderSource ? 'data-action="order-source"' : 'target="_blank" rel="noopener noreferrer"'}
        >${icon("arrowRight")} Mở nguồn đơn hàng</a>
        <button
          class="primary-button order-complete-button"
          type="button"
          disabled
          title="Chức năng hoàn thành đơn hàng đang được phát triển"
        >${icon("checkCircle")} Hoàn thành đơn hàng</button>
      </div>
    </div>
  `;
};
