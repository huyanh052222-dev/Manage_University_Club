import { renderAnnouncement } from "./announcement.js";
import { renderFinancePanel } from "./financePanel.js";
import { renderMembersPanel } from "./membersPanel.js";
import { renderOverviewCard } from "./overviewCard.js";
import { renderTasksPanel } from "./tasksPanel.js";

export const renderDashboard = () => `
  <div class="dashboard-grid">
    <div class="dashboard-column">
      ${renderOverviewCard()}
      ${renderMembersPanel()}
    </div>
    <div class="dashboard-column">
      ${renderFinancePanel()}
      ${renderTasksPanel()}
    </div>
    ${renderAnnouncement()}
  </div>
`;
