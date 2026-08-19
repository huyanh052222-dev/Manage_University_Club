import { renderCafeHero } from "./cafeHero.js";
import { renderCafeStats } from "./cafeStats.js";
import { renderCashFlowPanel } from "./cashFlowPanel.js";
import { renderFeaturedMembers } from "./featuredMembers.js";
import { renderHotTasks } from "./hotTasks.js";
import { renderCafeTip } from "./cafeTip.js";

export const renderDashboard = () => `
  <div class="cafe-dashboard">
    ${renderCafeHero()}
    ${renderCafeStats()}
    <div class="cafe-detail-grid">
      ${renderFeaturedMembers()}
      ${renderHotTasks()}
      ${renderCashFlowPanel()}
    </div>
    ${renderCafeTip()}
  </div>
`;
