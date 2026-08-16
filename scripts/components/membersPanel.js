import { members } from "../data/dashboard.js";
import { formatNumber, getActivityColor } from "../utils/format.js";
import { icon } from "./icons.js";

const renderMember = (member) => `
  <article class="member-row">
    <div class="member-profile">
      <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
      <div class="member-copy">
        <div class="member-name">
          <span>${member.name}</span>
          ${member.leader ? '<span class="leader-badge">Leader</span>' : ""}
        </div>
        <span class="member-role">${member.role}</span>
      </div>
    </div>
    <div class="member-stat">
      <span>Đóng góp tuần</span>
      <strong>${formatNumber(member.contribution)} <i class="coin">N</i></strong>
    </div>
    <div class="member-activity">
      <span>Hoạt động</span>
      <strong style="color:${getActivityColor(member.activity)}">${member.activity}%</strong>
    </div>
  </article>
`;

export const renderMembersPanel = () => `
  <section class="panel members-panel" id="groups" aria-labelledby="members-title">
    <header class="panel-header">
      <div class="panel-title-row">
        <h2 class="panel-title" id="members-title">Đóng góp thành viên</h2>
        <span class="info-icon" title="Tổng hợp đóng góp trong tuần">i</span>
      </div>
      <button class="text-link" type="button" data-action="manage-members">Quản lý thành viên ${icon("arrowRight")}</button>
    </header>
    <div class="member-list">
      ${members.map(renderMember).join("")}
      <button class="member-add" type="button" data-action="add-member">${icon("plus")} Mời thêm thành viên</button>
    </div>
  </section>
`;
