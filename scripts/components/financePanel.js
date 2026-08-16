import { finance, resources } from "../data/dashboard.js";
import { formatNumber, percentage } from "../utils/format.js";
import { icon } from "./icons.js";

const renderResource = (resource) => {
  const percent = percentage(resource.value, resource.total);
  return `
    <article class="resource-card" style="--accent:${resource.color}">
      <div class="resource-label">
        <span class="resource-icon">${icon(resource.icon)}</span>
        <span>${resource.label}</span>
      </div>
      <div class="resource-amount">
        ${formatNumber(resource.value)} / ${formatNumber(resource.total)}
        ${resource.unit ? `<small>${resource.unit}</small>` : ""}
      </div>
      <div class="mini-progress-row">
        <div class="progress-track" role="progressbar" aria-label="${resource.label}" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
          <span class="progress-value" style="--progress:${percent}%;--bar:${resource.color};--bar-glow:${resource.color}"></span>
        </div>
        <span>${percent}%</span>
      </div>
    </article>
  `;
};

export const renderFinancePanel = () => `
  <section class="panel finance-panel" aria-labelledby="finance-title">
    <header class="panel-header">
      <div class="panel-title-row">
        <h2 class="panel-title" id="finance-title">Tài chính của nhóm</h2>
        <span class="info-icon" title="Dữ liệu minh họa">i</span>
      </div>
      <button class="text-link" type="button" data-action="transactions">Lịch sử giao dịch ${icon("arrowRight")}</button>
    </header>

    <div class="finance-content">
      <div class="finance-stats">
        <article class="finance-card">
          <span class="finance-label">Quỹ hiện tại</span>
          <strong class="finance-value">${formatNumber(finance.currentFund)} <i class="coin">N</i></strong>
          <span class="finance-note"><b class="positive">+${formatNumber(finance.change)} (${finance.changePercent}%)</b> so với tuần trước</span>
        </article>
        <article class="finance-card">
          <span class="finance-label">Dòng tiền tuần</span>
          <strong class="finance-value">+${formatNumber(finance.weeklyFlow)} <span class="info-icon">i</span></strong>
          <span class="finance-note">Thu vào: <b class="positive">${formatNumber(finance.income)}</b> &nbsp;·&nbsp; Chi ra: <b class="negative">${formatNumber(finance.expense)}</b></span>
        </article>
      </div>

      <div class="resource-heading">
        <div class="resource-title-wrap">
          <h3>Phân bổ tài nguyên</h3>
          <span>Cập nhật: ${finance.updatedAt}</span>
        </div>
        <button class="text-link" type="button" data-action="manage-resources">Quản lý phân bổ ${icon("arrowRight")}</button>
      </div>

      <div class="resource-grid">
        ${resources.map(renderResource).join("")}
      </div>

      <div class="alert">
        ${icon("alertTriangle")}
        <span>Cảnh báo: Năng lượng của nhóm đang ở mức thấp. Hãy hoàn thành nhiệm vụ để nạp lại!</span>
      </div>
    </div>
  </section>
`;
