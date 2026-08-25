import { renderCafeHero } from "./cafeHero.js";
import { renderCafeStats } from "./cafeStats.js";
import { renderMemberOverview } from "./memberOverview.js";
import { renderOrders } from "./orders.js";
import { renderCafeTip } from "./cafeTip.js?v=orders";
import { renderTransactionLog } from "./transactionLog.js";

export const renderDashboard = () => `
  <div class="cafe-dashboard">
    ${renderCafeHero()}
    ${renderCafeStats()}
    <div class="cafe-detail-grid">
      ${renderMemberOverview()}
      ${renderOrders()}
      ${renderTransactionLog()}
    </div>
    ${renderCafeTip()}
  </div>
`;
