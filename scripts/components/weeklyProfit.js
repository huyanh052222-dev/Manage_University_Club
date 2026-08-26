import { getWeeklyProfitBreakdown } from "../services/weeklyProfit.js?v=profit-salary";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

const formatSignedCoin = (amount) => {
  if (amount === 0) return "0 coin";
  return `${amount > 0 ? "+" : "−"}${formatNumber(Math.abs(amount))} coin`;
};

const periodFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const formatPeriod = ({ periodStart, periodEnd, hasSettlement }) => {
  if (!hasSettlement) return "Chưa có kỳ kết toán; giá trị tạm thời là 0 coin";
  const start = new Date(`${periodStart}T00:00:00`);
  const end = new Date(`${periodEnd}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Kỳ kết toán gần nhất";
  return `Kỳ ${periodFormatter.format(start)} – ${periodFormatter.format(end)}`;
};

const renderProfitTable = (modifier = "") => {
  const breakdown = getWeeklyProfitBreakdown();
  const resultClass = breakdown.profit > 0 ? "positive-text" : breakdown.profit < 0 ? "negative-text" : "";

  return `
    <div class="weekly-cost-table weekly-profit-table ${modifier}">
      <header>
        <span>${icon("coffee")}</span>
        <div><b>Lợi nhuận kết toán</b><em>${formatPeriod(breakdown)}</em></div>
      </header>
      <div class="weekly-cost-rows">
        <div class="weekly-cost-row">
          <span><b>Doanh thu đã kết toán</b><em>Coin vào trong kỳ đã chốt</em></span>
          <strong class="positive-text">${formatSignedCoin(breakdown.income)}</strong>
        </div>
        <div class="weekly-cost-row">
          <span><b>Chi phí đã kết toán</b><em>200 cố định + 20 coin × ${formatNumber(breakdown.paidStaffCount)} nhân viên; không tính quản lý</em></span>
          <strong class="negative-text">${formatSignedCoin(-breakdown.expense)}</strong>
        </div>
      </div>
      <footer>
        <span>Doanh thu − Chi phí</span>
        <strong class="${resultClass}">${formatNumber(breakdown.income)} − ${formatNumber(breakdown.expense)} = ${formatSignedCoin(breakdown.profit)}</strong>
      </footer>
    </div>
  `;
};

export const renderWeeklyProfitPopover = () => `
  <div class="weekly-cost-popover weekly-profit-popover" role="tooltip" aria-hidden="true">
    ${renderProfitTable("compact")}
  </div>
`;

export const renderWeeklyProfitModal = () => renderProfitTable("modal-cost-table");
