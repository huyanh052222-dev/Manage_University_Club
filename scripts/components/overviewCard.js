import { club } from "../data/dashboard.js";
import { formatNumber, percentage } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderOverviewCard = () => {
  const xpPercent = percentage(club.xp, club.xpTarget);

  return `
    <section class="panel hero-panel" id="overview" aria-labelledby="club-name">
      <div class="club-hero">
        <div class="club-hero-content">
          <div class="club-name-row">
            <h2 class="club-name" id="club-name">${club.name}</h2>
            <button class="icon-button" type="button" data-action="edit-club" aria-label="Chỉnh sửa thông tin nhóm">
              ${icon("edit")}
            </button>
          </div>
          <div class="club-meta">
            <span class="badge">${club.code}</span>
            <span class="badge success">${club.status}</span>
          </div>
          <p class="club-description">Slogan: ${club.slogan}</p>
          <p class="club-description">Lĩnh vực: ${club.field}</p>
        </div>
      </div>

      <div class="club-details">
        <div>
          <span class="level-label">Cấp độ công ty</span>
          <strong class="level-name">${club.level}</strong>
          <div class="progress-line">
            <div class="progress-track" role="progressbar" aria-label="Tiến độ cấp độ" aria-valuenow="${xpPercent}" aria-valuemin="0" aria-valuemax="100">
              <span class="progress-value" style="--progress:${xpPercent}%"></span>
            </div>
            <span class="progress-copy">${formatNumber(club.xp)} / ${formatNumber(club.xpTarget)} XP</span>
          </div>
          <div class="season-goal">
            <span class="section-label">Mục tiêu mùa giải</span>
            <strong>${club.seasonGoal}</strong>
          </div>
        </div>

        <div class="info-box">
          <h3>Thông tin nhóm</h3>
          <div class="info-row"><span>${icon("users")} Thành viên</span><strong>${club.memberCount} / ${club.memberLimit}</strong></div>
          <div class="info-row"><span>${icon("calendarCheck")} Ngày thành lập</span><strong>${club.foundedAt}</strong></div>
          <div class="info-row"><span>${icon("wallet")} Vốn khởi nghiệp</span><strong><i class="coin">N</i> ${formatNumber(club.startingFund)}</strong></div>
          <div class="info-row"><span>${icon("clock")} Tình trạng</span><strong class="success-text">Hoạt động</strong></div>
        </div>
      </div>
    </section>
  `;
};
