import { renderCafeHero } from "./cafeHero.js";
import { renderCafeStats } from "./cafeStats.js";
import { renderCashFlowPanel } from "./cashFlowPanel.js";
import { renderGroupMembers } from "./groupMembers.js";
import { renderHotTasks } from "./hotTasks.js";
import { renderCafeTip } from "./cafeTip.js";

export const renderDashboard = () => `
  <div class="cafe-dashboard">
    ${renderCafeHero()}
    ${renderCafeStats()}
    <div class="cafe-detail-grid">
      ${renderGroupMembers()}
      ${renderHotTasks()}
      ${renderCashFlowPanel()}
    </div>
    ${renderCafeTip()}
  </div>
`;
