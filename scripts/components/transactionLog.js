import { transactionLogs, weeklyCoinSummary } from "../data/dashboard.js";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

const transactionLabel = {
  income: "Coin vào",
  expense: "Coin ra",
  adjustment: "Admin điều chỉnh",
};

const formatSignedCoin = (amount) => `${amount > 0 ? "+" : "−"}${formatNumber(Math.abs(amount))} coin`;

const renderTransaction = (transaction) => `
  <article class="transaction-log-row ${transaction.type}">
    <span class="transaction-log-icon">${icon(transaction.icon)}</span>
    <div class="transaction-log-copy">
      <div><strong>${transaction.title}</strong><span class="transaction-kind">${transactionLabel[transaction.type]}</span></div>
      <small>${transaction.group} · ${transaction.time}</small>
    </div>
    <div class="transaction-log-value">
      <strong>${formatSignedCoin(transaction.amount)}</strong>
      <time>${transaction.date}</time>
    </div>
  </article>
`;

export const renderTransactionLog = () => `
  <section class="cafe-panel transaction-log" aria-labelledby="transaction-log-title">
    <header class="cafe-panel-header transaction-log-header">
      <div class="transaction-log-title">
        <span class="section-icon green">${icon("receipt")}</span>
        <div><h2 id="transaction-log-title">Nhật ký coin</h2><p>Hoạt động mới nhất từ các nhóm</p></div>
      </div>
      <span class="log-live"><i></i> Đang cập nhật</span>
    </header>

    <div class="transaction-log-list">
      ${transactionLogs.slice(0, 4).map(renderTransaction).join("")}
    </div>

    <div class="transaction-summary" aria-label="Tổng kết coin trong tuần">
      <div><span>Tổng coin vào</span><strong class="positive-text">+${formatNumber(weeklyCoinSummary.totalIncome)} coin</strong></div>
      <div><span>Tổng coin ra</span><strong class="negative-text">−${formatNumber(weeklyCoinSummary.totalExpense)} coin</strong></div>
      <div><span>Thay đổi ròng</span><strong>+${formatNumber(weeklyCoinSummary.totalProfit)} coin</strong></div>
    </div>
  </section>
`;
