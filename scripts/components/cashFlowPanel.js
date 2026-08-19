import { weeklyCashFlow } from "../data/dashboard.js";
import { icon } from "./icons.js";

const toPoints = (values) => values.map((value, index) => {
  const x = 46 + index * 72;
  const y = 112 - value * 13;
  return `${x},${y}`;
}).join(" ");

const formatCoin = (value) => `${value.toLocaleString("vi-VN")} coin`;

export const renderCashFlowPanel = () => `
  <section class="cafe-panel cash-flow" aria-labelledby="cash-flow-title">
    <header class="cafe-panel-header cash-header">
      <div class="cash-title"><span class="section-icon green">${icon("barChart")}</span><h2 id="cash-flow-title">Dòng tiền tuần</h2></div>
      <div class="chart-legend"><span class="income">Thu</span><span class="expense">Chi</span><span class="profit">Lợi nhuận</span></div>
    </header>
    <div class="chart-wrap">
      <svg viewBox="0 0 500 180" role="img" aria-label="Biểu đồ thu, chi và lợi nhuận từ thứ hai đến chủ nhật">
        <defs>
          <linearGradient id="income-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b9d68" stop-opacity=".2"/><stop offset="1" stop-color="#6b9d68" stop-opacity="0"/></linearGradient>
          <linearGradient id="expense-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cc7068" stop-opacity=".18"/><stop offset="1" stop-color="#cc7068" stop-opacity="0"/></linearGradient>
        </defs>
        <g class="chart-grid"><path d="M38 34H486M38 73H486M38 112H486M38 151H486"/></g>
        <polygon class="income-area" points="${toPoints(weeklyCashFlow.income)} 478,151 46,151" />
        <polygon class="expense-area" points="${toPoints(weeklyCashFlow.expense)} 478,151 46,151" />
        <polyline class="line income-line" points="${toPoints(weeklyCashFlow.income)}"/>
        <polyline class="line profit-line" points="${toPoints(weeklyCashFlow.profit)}"/>
        <polyline class="line expense-line" points="${toPoints(weeklyCashFlow.expense)}"/>
        ${weeklyCashFlow.labels.map((label, index) => `<text x="${46 + index * 72}" y="174" text-anchor="middle">${label}</text>`).join("")}
      </svg>
    </div>
    <div class="cash-totals">
      <div><span>Tổng thu</span><strong>${formatCoin(weeklyCashFlow.totalIncome)}</strong></div>
      <div><span>Tổng chi</span><strong class="negative-text">${formatCoin(weeklyCashFlow.totalExpense)}</strong></div>
      <div><span>Lợi nhuận tuần</span><strong>${formatCoin(weeklyCashFlow.totalProfit)}</strong></div>
    </div>
  </section>
`;
