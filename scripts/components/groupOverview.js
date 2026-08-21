import { groups, members } from "../data/dashboard.js";
import { icon } from "./icons.js";

const membersOf = (groupId) => members.filter((member) => member.groupId === groupId);

const renderAvatarStack = (group) => {
  const groupMembers = membersOf(group.id);
  const visibleMembers = groupMembers.slice(0, 4);
  const remaining = groupMembers.length - visibleMembers.length;

  return `
    <div class="group-avatar-stack" aria-label="${groupMembers.length} thành viên của ${group.name}">
      ${visibleMembers.map((member) => `
        <span class="avatar" title="${member.name}" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
      `).join("")}
      ${remaining > 0 ? `<span class="avatar-more">+${remaining}</span>` : ""}
    </div>`;
};

export const renderGroupOverview = () => `
  <section class="cafe-panel group-overview" id="group-overview" aria-labelledby="group-overview-title">
    <header class="cafe-panel-header">
      <span class="section-icon gold">${icon("users")}</span>
      <div>
        <h2 id="group-overview-title">Quản lý các nhóm</h2>
        <p>${groups.length} nhóm · ${members.length} thành viên</p>
      </div>
    </header>
    <div class="group-overview-list">
      ${groups.map((group) => `
        <article class="group-overview-row" data-overview-group="${group.id}">
          <span class="group-mark" style="--group-a:${group.colors[0]};--group-b:${group.colors[1]}">${group.initials}</span>
          <div class="group-overview-copy">
            <strong>${group.name}</strong>
            <span>${group.code} · ${group.memberCount} thành viên</span>
          </div>
          ${renderAvatarStack(group)}
        </article>`).join("")}
    </div>
    <button class="cafe-panel-link" type="button" data-action="manage-members">Xem danh sách thành viên ${icon("arrowRight")}</button>
  </section>
`;
