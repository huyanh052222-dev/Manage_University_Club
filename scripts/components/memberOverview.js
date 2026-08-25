import { club, members } from "../data/dashboard.js";
import { icon } from "./icons.js";

export const renderMemberOverview = () => `
  <section class="cafe-panel member-overview" id="member-overview" aria-labelledby="member-overview-title">
    <header class="cafe-panel-header">
      <span class="section-icon gold">${icon("users")}</span>
      <div>
        <h2 id="member-overview-title">Quản lý thành viên</h2>
        <p>${members.length} thành viên của ${club.name}</p>
      </div>
    </header>
    <div class="member-overview-list">
      ${members.slice(0, 4).map((member) => `
        <article class="member-overview-row" data-overview-member="${member.id}">
          <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
          <div class="member-overview-copy">
            <strong>${member.name}</strong>
            <span>${member.role}</span>
          </div>
        </article>`).join("")}
    </div>
    <button class="cafe-panel-link" type="button" data-action="manage-members">Xem danh sách thành viên ${icon("arrowRight")}</button>
  </section>
`;
