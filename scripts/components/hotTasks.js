import { hotTasks } from "../data/dashboard.js";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderHotTasks = () => `
  <section class="cafe-panel hot-tasks" id="missions" aria-labelledby="hot-tasks-title">
    <header class="cafe-panel-header">
      <span class="section-icon coral">${icon("flame")}</span>
      <div><h2 id="hot-tasks-title">Nhiệm vụ nóng</h2><p>Các nhiệm vụ ưu tiên</p></div>
    </header>
    <div class="hot-task-list">
      ${hotTasks.map((task) => `
        <article class="hot-task-row">
          <span class="task-tone ${task.tone}">${icon(task.icon)}</span>
          <div><strong>${task.title}</strong><span>${task.description}</span></div>
          <aside><b>+${formatNumber(task.reward)} coin</b><small>Hạn: <em>${task.due}</em></small></aside>
        </article>`).join("")}
    </div>
    <button class="cafe-panel-link" type="button" data-action="all-tasks">Xem tất cả nhiệm vụ ${icon("arrowRight")}</button>
  </section>
`;
