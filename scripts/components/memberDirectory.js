import { members } from "../data/dashboard.js";
import { icon } from "./icons.js";

const normalized = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const renderMemberRow = (member) => `
  <article class="directory-member-row" data-member-card="${member.id}">
    <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
    <div>
      <strong>${member.name}</strong>
      <span>${member.role}</span>
    </div>
  </article>
`;

export const renderMemberList = ({ query = "" } = {}) => {
  const keyword = normalized(query.trim());
  const filteredMembers = members.filter((member) => normalized(`${member.name} ${member.role}`).includes(keyword));

  if (!filteredMembers.length) {
    return `<div class="empty-members">${icon("search")}<strong>Không tìm thấy thành viên</strong><span>Thử tìm bằng tên thành viên hoặc vai trò khác.</span></div>`;
  }

  return filteredMembers.map(renderMemberRow).join("");
};

export const renderMemberDirectory = () => `
  <section class="management-view" aria-labelledby="management-title">
    <header class="management-heading">
      <div>
        <button class="back-link" type="button" data-action="back-overview">${icon("arrowLeft")} Quay lại tổng quan</button>
        <h2 id="management-title">Quản lý thành viên</h2>
        <p>Danh sách chi tiết thành viên của Cafe Horizon.</p>
      </div>
    </header>

    <div class="member-account-note">
      <span>${icon("users")}</span>
      <div>
        <strong>${members.length} hồ sơ thành viên</strong>
        <p>Quản lý tập trung một danh sách duy nhất; thành viên không được chia theo nhóm.</p>
      </div>
    </div>

    <section class="panel member-directory" aria-labelledby="member-directory-title">
      <header class="member-directory-toolbar">
        <div>
          <h3 id="member-directory-title">Danh sách thành viên</h3>
          <span><b data-member-result-count>${members.length}</b> thành viên</span>
        </div>
        <label class="search-field">
          ${icon("search")}
          <span class="sr-only">Tìm thành viên</span>
          <input type="search" placeholder="Tìm thành viên, vai trò..." data-member-search />
        </label>
      </header>
      <div class="member-directory-list" data-member-list>${renderMemberList()}</div>
    </section>
  </section>
`;
