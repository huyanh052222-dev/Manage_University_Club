import { getWeeklyCostEstimate } from "../services/weeklyCosts.js";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

const renderCostRows = (items) => items.map((item) => `
  <div class="weekly-cost-row">
    <span>
      <b>${item.label}</b>
      <em>${item.detail}</em>
    </span>
    <strong>${formatNumber(item.amount)} coin</strong>
  </div>
`).join("");

const renderCostTable = (modifier = "") => {
  const estimate = getWeeklyCostEstimate();
  return `
    <div class="weekly-cost-table ${modifier}">
      <header>
        <span>${icon("receipt")}</span>
        <div><b>Dự toán chi phí tuần</b><em>${formatNumber(estimate.fixedCost)} cố định + ${estimate.salaryPerMember} coin × ${estimate.staffCount} nhân viên</em></div>
      </header>
      <div class="weekly-cost-rows">${renderCostRows(estimate.items)}</div>
      <footer><span>Tổng chi dự kiến</span><strong>~${formatNumber(estimate.total)} coin / tuần</strong></footer>
    </div>
  `;
};

export const renderWeeklyCostPopover = () => `
  <div class="weekly-cost-popover" role="tooltip" aria-hidden="true">
    ${renderCostTable("compact")}
  </div>
`;

export const renderWeeklyCostModal = () => renderCostTable("modal-cost-table");
