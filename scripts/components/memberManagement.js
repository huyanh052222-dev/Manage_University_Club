import { members } from "../data/dashboard.js";
import { formatNumber, getActivityColor } from "../utils/format.js";
import { icon } from "./icons.js";

const totals = {
  contribution: members.reduce((sum, member) => sum + member.contribution, 0),
  tasks: members.reduce((sum, member) => sum + member.tasksCompleted, 0),
  hours: members.reduce((sum, member) => sum + member.workHours, 0),
  activity: Math.round(members.reduce((sum, member) => sum + member.activity, 0) / members.length),
};

const normalized = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const sortMembers = (list, sortBy) => [...list].sort((a, b) => {
  if (sortBy === "activity") return b.activity - a.activity;
  if (sortBy === "tasks") return b.tasksCompleted - a.tasksCompleted;
  if (sortBy === "hours") return b.workHours - a.workHours;
  return b.contribution - a.contribution;
});

const renderMemberRow = (member, rank) => `
  <article class="contribution-row" data-member-row="${member.id}">
    <div class="contribution-person" data-label="Thành viên">
      <span class="member-rank">${String(rank).padStart(2, "0")}</span>
      <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
      <div class="member-copy">
        <div class="member-name">
          <span>${member.name}</span>
          ${member.leader ? '<span class="leader-badge">Leader</span>' : ""}
        </div>
        <span class="member-role">${member.role} · ${member.lastContribution}</span>
      </div>
    </div>
    <div class="contribution-number" data-label="Đóng góp">
      <strong>${formatNumber(member.contribution)} <small class="coin-unit">coin</small></strong>
      <span class="trend ${member.trend >= 0 ? "up" : "down"}">${member.trend >= 0 ? "+" : ""}${member.trend}% tuần này</span>
    </div>
    <div class="contribution-number" data-label="Nhiệm vụ">
      <strong>${member.tasksCompleted}</strong>
      <span>đã hoàn thành</span>
    </div>
    <div class="contribution-number" data-label="Thời gian">
      <strong>${member.workHours}</strong>
      <span>giờ hoạt động</span>
    </div>
    <div class="contribution-number" data-label="XP">
      <strong>${formatNumber(member.xp)}</strong>
      <span>kinh nghiệm</span>
    </div>
    <div class="activity-cell" data-label="Hoạt động">
      <div class="activity-heading">
        <strong style="color:${getActivityColor(member.activity)}">${member.activity}%</strong>
        <span>${member.activity >= 70 ? "Tích cực" : member.activity >= 50 ? "Cần theo dõi" : "Cần hỗ trợ"}</span>
      </div>
      <div class="progress-track" role="progressbar" aria-label="Mức độ hoạt động của ${member.name}" aria-valuenow="${member.activity}" aria-valuemin="0" aria-valuemax="100">
        <span class="progress-value" style="--progress:${member.activity}%;--bar:${getActivityColor(member.activity)};--bar-glow:${getActivityColor(member.activity)}"></span>
      </div>
    </div>
    <button class="detail-button" type="button" data-action="member-details" data-member-id="${member.id}" aria-label="Xem chi tiết đóng góp của ${member.name}">
      ${icon("eye")} <span>Chi tiết</span>
    </button>
  </article>
`;

export const renderContributionRows = ({ query = "", sortBy = "contribution" } = {}) => {
  const keyword = normalized(query.trim());
  const filtered = members.filter((member) => normalized(`${member.name} ${member.role}`).includes(keyword));
  const sorted = sortMembers(filtered, sortBy);

  if (!sorted.length) {
    return `<div class="empty-contributions">${icon("search")}<strong>Không tìm thấy thành viên</strong><span>Thử tìm bằng tên hoặc vai trò khác.</span></div>`;
  }

  return sorted.map((member, index) => renderMemberRow(member, index + 1)).join("");
};

export const renderMemberDetail = (member) => `
  <div class="member-detail-head">
    <span class="avatar" style="--avatar-a:${member.colors[0]};--avatar-b:${member.colors[1]}">${member.initials}</span>
    <div><strong>${member.name}</strong><span>${member.role} · Hoạt động ${member.activity}%</span></div>
  </div>
  <p>Phân bổ ${formatNumber(member.contribution)} coin đóng góp trong tuần:</p>
  <ul class="detail-breakdown">
    <li><span>Nhiệm vụ nhóm</span><strong>${formatNumber(member.breakdown.missions)} <small class="coin-unit">coin</small></strong></li>
    <li><span>Sự kiện CLB</span><strong>${formatNumber(member.breakdown.events)} <small class="coin-unit">coin</small></strong></li>
    <li><span>Hỗ trợ thành viên</span><strong>${formatNumber(member.breakdown.support)} <small class="coin-unit">coin</small></strong></li>
    <li><span>Thưởng chủ động</span><strong>${formatNumber(member.breakdown.bonus)} <small class="coin-unit">coin</small></strong></li>
  </ul>
`;

export const renderMemberManagement = () => `
  <section class="management-view" aria-labelledby="management-title">
    <header class="management-heading">
      <div>
        <button class="back-link" type="button" data-action="back-overview">${icon("arrowLeft")} Quay lại tổng quan</button>
        <h2 id="management-title">Theo dõi đóng góp thành viên</h2>
        <p>Xem mức độ tham gia và hiệu quả đóng góp của từng thành viên tại Cafe Horizon.</p>
      </div>
      <div class="management-actions">
        <button class="secondary-button" type="button" data-action="export-contributions">${icon("download")} Xuất báo cáo</button>
        <button class="primary-button" type="button" data-action="add-member">${icon("plus")} Mời thành viên</button>
      </div>
    </header>

    <div class="management-stats">
      <article class="management-stat" style="--stat-color:#a765ff">
        <span class="stat-icon">${icon("users")}</span>
        <div><span>Thành viên hoạt động</span><strong>${members.length} / 10</strong><small>Tất cả đã cập nhật tuần này</small></div>
      </article>
      <article class="management-stat" style="--stat-color:#f6c84d">
        <span class="stat-icon">${icon("wallet")}</span>
        <div><span>Tổng đóng góp tuần</span><strong>${formatNumber(totals.contribution)} <small class="coin-unit">coin</small></strong><small class="positive">+9,4% so với tuần trước</small></div>
      </article>
      <article class="management-stat" style="--stat-color:#5d8cff">
        <span class="stat-icon">${icon("checkCircle")}</span>
        <div><span>Nhiệm vụ hoàn thành</span><strong>${totals.tasks}</strong><small>${totals.hours} giờ hoạt động</small></div>
      </article>
      <article class="management-stat" style="--stat-color:#40d9c3">
        <span class="stat-icon">${icon("trendingUp")}</span>
        <div><span>Hoạt động trung bình</span><strong>${totals.activity}%</strong><small>4 thành viên trên 70%</small></div>
      </article>
    </div>

    <section class="panel contribution-panel" aria-labelledby="contribution-title">
      <header class="contribution-toolbar">
        <div>
          <h3 id="contribution-title">Chi tiết đóng góp</h3>
          <span><b data-member-result-count>${members.length}</b> thành viên · Dữ liệu minh họa</span>
        </div>
        <div class="management-filters">
          <label class="search-field">
            ${icon("search")}
            <span class="sr-only">Tìm thành viên</span>
            <input type="search" placeholder="Tìm theo tên, vai trò..." data-member-search />
          </label>
          <label class="select-field">
            <span class="sr-only">Sắp xếp danh sách</span>
            <select data-member-sort>
              <option value="contribution">Đóng góp cao nhất</option>
              <option value="activity">Hoạt động cao nhất</option>
              <option value="tasks">Nhiệm vụ nhiều nhất</option>
              <option value="hours">Thời gian nhiều nhất</option>
            </select>
          </label>
        </div>
      </header>

      <div class="contribution-table">
        <div class="contribution-table-head" aria-hidden="true">
          <span>Thành viên</span><span>Đóng góp</span><span>Nhiệm vụ</span><span>Thời gian</span><span>XP</span><span>Hoạt động</span><span></span>
        </div>
        <div data-contribution-rows>${renderContributionRows()}</div>
      </div>
    </section>
  </section>
`;
