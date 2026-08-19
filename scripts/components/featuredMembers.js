import { members } from "../data/dashboard.js";
import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderFeaturedMembers = () => `
  <section class="cafe-panel featured-members" id="groups" aria-labelledby="featured-title">
    <header class="cafe-panel-header">
      <span class="section-icon gold">${icon("award")}</span>
      <div><h2 id="featured-title">Thành viên nổi bật</h2><p>Top 5 đóng góp tuần</p></div>
    </header>
    <div class="featured-list">
      ${members.slice(0, 5).map((member, index) => `
        <article class="featured-row">
          <span class="rank-badge rank-${index + 1}">${index + 1}</span>
          <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
          <div><strong>${member.name}</strong><span>${member.leader ? "Leader" : index % 2 ? "Developer" : "Designer"}</span></div>
          <b>+${formatNumber(member.contribution)} <small>coin</small></b>
        </article>`).join("")}
    </div>
    <button class="cafe-panel-link" type="button" data-action="manage-members">Xem tất cả thành viên ${icon("arrowRight")}</button>
  </section>
`;
