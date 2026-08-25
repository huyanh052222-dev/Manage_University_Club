import { club, transactionLogs, weeklyCoinSummary } from "../data/dashboard.js";
import { escapeHtml, formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

const transactionLabel = {
  income: "Coin vào",
  expense: "Coin ra",
  adjustment: "Admin điều chỉnh",
};

const formatSignedCoin = (amount) => {
  if (amount === 0) return "0 coin";
  return `${amount > 0 ? "+" : "−"}${formatNumber(Math.abs(amount))} coin`;
};

const renderTransaction = (transaction) => `
  <article class="transaction-log-row ${transaction.type}">
    <span class="transaction-log-icon">${icon(transaction.icon)}</span>
    <div class="transaction-log-copy">
      <div><strong>${escapeHtml(transaction.title)}</strong><span class="transaction-kind">${transactionLabel[transaction.type] || "Biến động"}</span></div>
      <small>${escapeHtml(transaction.group)} · ${escapeHtml(transaction.time)}</small>
    </div>
    <div class="transaction-log-value">
      <strong>${formatSignedCoin(transaction.amount)}</strong>
      <time>${escapeHtml(transaction.date)}</time>
    </div>
  </article>
`;

const renderEmptyLog = () => `
  <div class="transaction-log-empty">
    <span>${icon("receipt")}</span>
    <strong>Chưa có biến động số dư</strong>
    <p>Nhật ký sẽ xuất hiện khi nhóm được cộng hoặc trừ coin.</p>
  </div>
`;

const getNetSummaryClass = () => weeklyCoinSummary.totalProfit > 0
  ? "positive-text"
  : weeklyCoinSummary.totalProfit < 0
    ? "negative-text"
    : "";

export const renderTransactionLog = () => `
  <section class="cafe-panel transaction-log" aria-labelledby="transaction-log-title">
    <header class="cafe-panel-header transaction-log-header">
      <div class="transaction-log-title">
        <span class="section-icon green">${icon("receipt")}</span>
        <div><h2 id="transaction-log-title">Nhật ký coin</h2><p>Biến động số dư của ${escapeHtml(club.name)}</p></div>
      </div>
      <span class="log-live"><i></i> Đồng bộ Supabase</span>
    </header>

    <div class="transaction-log-list ${transactionLogs.length ? "" : "empty"}">
      ${transactionLogs.length ? transactionLogs.slice(0, 4).map(renderTransaction).join("") : renderEmptyLog()}
    </div>

    <div class="transaction-summary" aria-label="Tổng kết coin trong tuần">
      <div><span>Tổng coin vào</span><strong class="positive-text">${formatSignedCoin(weeklyCoinSummary.totalIncome)}</strong></div>
      <div><span>Tổng coin ra</span><strong class="negative-text">${formatSignedCoin(-weeklyCoinSummary.totalExpense)}</strong></div>
      <div><span>Thay đổi ròng</span><strong class="${getNetSummaryClass()}">${formatSignedCoin(weeklyCoinSummary.totalProfit)}</strong></div>
    </div>
  </section>
`;
