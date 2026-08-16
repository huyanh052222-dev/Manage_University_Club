import { taskTabs, tasks } from "../data/dashboard.js";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderTabs = (activeTab = "all") => taskTabs
  .map(
    (tab) => `
      <button class="tab${tab.id === activeTab ? " active" : ""}" type="button" role="tab" aria-selected="${tab.id === activeTab}" data-tab="${tab.id}">
        ${tab.label}
      </button>`,
  )
  .join("");

export const renderTasks = (activeTab = "all") => {
  const filteredTasks = activeTab === "all" ? tasks : tasks.filter((task) => task.category === activeTab);

  if (!filteredTasks.length) {
    return '<div class="alert">Chưa có nhiệm vụ trong nhóm này.</div>';
  }

  return filteredTasks
    .map(
      (task) => `
        <article class="task-card" style="--task-color:${task.color}" data-task-id="${task.id}">
          <div class="task-main">
            <div class="task-icon">${icon(task.icon)}</div>
            <div class="task-copy">
              <h3 class="task-name">${task.name}</h3>
              <span class="task-type">${task.type}</span>
              <span class="task-description">${task.description}</span>
              ${task.progress !== undefined ? `
                <div class="task-progress">
                  <span>Tiến độ nhóm</span>
                  <div class="progress-track" role="progressbar" aria-label="Tiến độ ${task.name}" aria-valuenow="${task.progress}" aria-valuemin="0" aria-valuemax="100">
                    <span class="progress-value" style="--progress:${task.progress}%;--bar:var(--green);--bar-glow:var(--green)"></span>
                  </div>
                  <span>${task.progress}%</span>
                </div>` : ""}
            </div>
          </div>
          <div class="task-reward">
            <span>+${formatNumber(task.reward)} <i class="coin">N</i></span>
            <small>+${task.xp} XP</small>
          </div>
          <div class="task-action">
            <button class="status-button" type="button" data-action="task" data-task-id="${task.id}">${task.status}</button>
            <span class="task-deadline">${task.deadlineLabel}: ${task.deadline}</span>
          </div>
        </article>`,
    )
    .join("");
};

export const renderTasksPanel = () => `
  <section class="panel tasks-panel" id="missions" aria-labelledby="tasks-title">
    <header class="panel-header tasks-header">
      <div class="tasks-heading-wrap">
        <div class="tasks-title-line">
          <h2 class="panel-title" id="tasks-title">Nhiệm vụ & Sự kiện</h2>
          <button class="text-link" type="button" data-action="all-tasks">Xem tất cả ${icon("arrowRight")}</button>
        </div>
        <div class="tabs" role="tablist" aria-label="Lọc nhiệm vụ" data-tabs>
          ${renderTabs()}
        </div>
      </div>
    </header>
    <div class="task-list" data-task-list>${renderTasks()}</div>
  </section>
`;
