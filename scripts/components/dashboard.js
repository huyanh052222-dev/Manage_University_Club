import { renderCafeHero } from "./cafeHero.js";
import { renderCafeStats } from "./cafeStats.js";
import { renderGroupOverview } from "./groupOverview.js";
import { renderHotTasks } from "./hotTasks.js";
import { renderCafeTip } from "./cafeTip.js";
import { renderTransactionLog } from "./transactionLog.js";

export const renderDashboard = () => `
  <div class="cafe-dashboard">
    ${renderCafeHero()}
    ${renderCafeStats()}
    <div class="cafe-detail-grid">
      ${renderGroupOverview()}
      ${renderHotTasks()}
      ${renderTransactionLog()}
    </div>
    ${renderCafeTip()}
  </div>
`;
