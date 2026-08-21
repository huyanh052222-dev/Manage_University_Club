import { club, members } from "../data/dashboard.js";
import { icon } from "./icons.js";

const normalized = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const renderMemberCards = ({ query = "" } = {}) => {
  const keyword = normalized(query.trim());
  const filtered = members.filter((member) => normalized(`${member.name} ${member.role}`).includes(keyword));

  if (!filtered.length) {
    return `<div class="empty-members">${icon("search")}<strong>Không tìm thấy thành viên</strong><span>Thử tìm bằng tên hoặc vai trò khác.</span></div>`;
  }

  return filtered.map((member) => `
    <article class="member-directory-card" data-member-card="${member.id}">
      <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
      <div>
        <strong>${member.name}</strong>
        <span>${member.role}</span>
      </div>
    </article>
  `).join("");
};

export const renderMemberDirectory = () => `
  <section class="management-view" aria-labelledby="management-title">
    <header class="management-heading">
      <div>
        <button class="back-link" type="button" data-action="back-overview">${icon("arrowLeft")} Quay lại tổng quan</button>
        <h2 id="management-title">Danh sách thành viên</h2>
        <p>Những người hiện có trong ${club.name}.</p>
      </div>
    </header>

    <div class="member-account-note">
      <span>${icon("users")}</span>
      <div>
        <strong>Thành viên không có tài khoản đăng nhập</strong>
        <p>Đây chỉ là hồ sơ hiển thị trong nhóm. Hệ thống chỉ sử dụng một tài khoản admin.</p>
      </div>
    </div>

    <section class="panel member-directory" aria-labelledby="member-directory-title">
      <header class="member-directory-toolbar">
        <div>
          <h3 id="member-directory-title">Thành viên ${club.name}</h3>
          <span><b data-member-result-count>${members.length}</b> thành viên</span>
        </div>
        <label class="search-field">
          ${icon("search")}
          <span class="sr-only">Tìm thành viên</span>
          <input type="search" placeholder="Tìm theo tên, vai trò..." data-member-search />
        </label>
      </header>
      <div class="member-directory-grid" data-member-cards>${renderMemberCards()}</div>
    </section>
  </section>
`;
