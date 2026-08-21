import { club, members } from "../data/dashboard.js";
import { icon } from "./icons.js";

export const renderGroupMembers = () => `
  <section class="cafe-panel group-members" id="groups" aria-labelledby="group-members-title">
    <header class="cafe-panel-header">
      <span class="section-icon gold">${icon("users")}</span>
      <div>
        <h2 id="group-members-title">Thành viên nhóm</h2>
        <p>${members.length} thành viên của ${club.name}</p>
      </div>
    </header>
    <div class="group-member-list">
      ${members.slice(0, 5).map((member) => `
        <article class="group-member-row">
          <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
          <div>
            <strong>${member.name}</strong>
            <span>${member.role}</span>
          </div>
        </article>`).join("")}
    </div>
    <button class="cafe-panel-link" type="button" data-action="manage-members">Xem danh sách thành viên ${icon("arrowRight")}</button>
  </section>
`;
