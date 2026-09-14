import { getWeeklyProfitBreakdown } from "../services/weeklyProfit.js?v=profit-salary";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

const formatSignedCoin = (amount) => {
  if (amount === 0) return "0 coin";
  return `${amount > 0 ? "+" : "−"}${formatNumber(Math.abs(amount))} coin`;
};

const periodFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const formatPeriod = ({ periodStart, periodEnd, expectedPeriodStart, expectedPeriodEnd, hasSettlement }) => {
  const startKey = hasSettlement ? periodStart : expectedPeriodStart;
  const endKey = hasSettlement ? periodEnd : expectedPeriodEnd;
  if (!startKey || !endKey) return "Kỳ đầu tiên sẽ được chốt vào Thứ Hai kế tiếp";
  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Kỳ kết toán gần nhất";
  end.setDate(end.getDate() - 1);
  return `Kỳ ${periodFormatter.format(start)} – ${periodFormatter.format(end)}`;
};

const renderProfitTable = (modifier = "") => {
  const breakdown = getWeeklyProfitBreakdown();
  const awaitingSettlement = !breakdown.hasSettlement;
  const resultClass = breakdown.profit > 0 ? "positive-text" : breakdown.profit < 0 ? "negative-text" : "";

  return `
    <div class="weekly-cost-table weekly-profit-table ${modifier}">
      <header>
        <span>${icon("coffee")}</span>
        <div><b>${awaitingSettlement ? (breakdown.settlementStatus === "overdue" ? "Chờ kết toán trễ" : "Chờ kỳ kết toán") : "Lợi nhuận kết toán"}</b><em>${formatPeriod(breakdown)}</em></div>
      </header>
      <div class="weekly-cost-rows">
        <div class="weekly-cost-row">
          <span><b>Doanh thu đã kết toán</b><em>${awaitingSettlement ? "Admin cần mở trang quản trị để chốt kỳ đã qua" : "Coin vào trong kỳ đã chốt"}</em></span>
          <strong class="${awaitingSettlement ? "" : "positive-text"}">${awaitingSettlement ? "—" : formatSignedCoin(breakdown.income)}</strong>
        </div>
        <div class="weekly-cost-row">
          <span><b>Chi phí đã kết toán</b><em>${awaitingSettlement ? "Chưa dùng dữ liệu tuần đang diễn ra để tránh sai số" : `200 cố định + 20 coin × ${formatNumber(breakdown.paidStaffCount)} nhân viên; không tính quản lý`}</em></span>
          <strong class="${awaitingSettlement ? "" : "negative-text"}">${awaitingSettlement ? "—" : formatSignedCoin(-breakdown.expense)}</strong>
        </div>
      </div>
      <footer>
        <span>${awaitingSettlement ? "Trạng thái" : "Doanh thu − Chi phí"}</span>
        <strong class="${resultClass}">${awaitingSettlement ? "Chưa có số liệu đã chốt" : `${formatNumber(breakdown.income)} − ${formatNumber(breakdown.expense)} = ${formatSignedCoin(breakdown.profit)}`}</strong>
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
