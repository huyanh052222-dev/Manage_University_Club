import { groups, members } from "../data/dashboard.js";
import { formatNumber } from "../utils/format.js";
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

const renderGroupSection = (group, groupMembers) => `
  <article class="personnel-group-card" data-group-card="${group.id}">
    <header class="personnel-group-header">
      <span class="group-mark" style="--group-a:${group.colors[0]};--group-b:${group.colors[1]}">${group.initials}</span>
      <div>
        <h3>${group.name}</h3>
        <p>${group.code} · ${group.focus}</p>
      </div>
      <div class="personnel-group-meta">
        <strong>${groupMembers.length} thành viên</strong>
        <span>${formatNumber(group.balance)} coin</span>
      </div>
    </header>
    <div class="group-directory-members">${groupMembers.map(renderMemberRow).join("")}</div>
  </article>
`;

export const renderMemberGroups = ({ query = "" } = {}) => {
  const keyword = normalized(query.trim());
  const sections = groups.flatMap((group) => {
    const groupMatches = normalized(`${group.name} ${group.code} ${group.focus}`).includes(keyword);
    const groupMembers = members.filter((member) => {
      if (member.groupId !== group.id) return false;
      return groupMatches || normalized(`${member.name} ${member.role}`).includes(keyword);
    });

    return groupMembers.length ? [renderGroupSection(group, groupMembers)] : [];
  });

  if (!sections.length) {
    return `<div class="empty-members">${icon("search")}<strong>Không tìm thấy thành viên hoặc nhóm</strong><span>Thử tìm bằng tên nhóm, tên thành viên hoặc vai trò khác.</span></div>`;
  }

  return sections.join("");
};

export const renderMemberDirectory = () => `
  <section class="management-view" aria-labelledby="management-title">
    <header class="management-heading">
      <div>
        <button class="back-link" type="button" data-action="back-overview">${icon("arrowLeft")} Quay lại tổng quan</button>
        <h2 id="management-title">Nhân sự các nhóm</h2>
        <p>Trang tổng quát danh sách thành viên được phân chia rõ theo từng nhóm.</p>
      </div>
    </header>

    <div class="member-account-note">
      <span>${icon("users")}</span>
      <div>
        <strong>${groups.length} nhóm · ${members.length} hồ sơ thành viên</strong>
        <p>Mỗi nhóm có từ 5–8 người. Thành viên chỉ là hồ sơ hiển thị và không có tài khoản đăng nhập.</p>
      </div>
    </div>

    <section class="panel member-directory" aria-labelledby="member-directory-title">
      <header class="member-directory-toolbar">
        <div>
          <h3 id="member-directory-title">Tất cả nhóm</h3>
          <span><b data-group-result-count>${groups.length}</b> nhóm · <b data-member-result-count>${members.length}</b> thành viên</span>
        </div>
        <label class="search-field">
          ${icon("search")}
          <span class="sr-only">Tìm nhóm hoặc thành viên</span>
          <input type="search" placeholder="Tìm nhóm, thành viên, vai trò..." data-member-search />
        </label>
      </header>
      <div class="member-groups-grid" data-member-groups>${renderMemberGroups()}</div>
    </section>
  </section>
`;
