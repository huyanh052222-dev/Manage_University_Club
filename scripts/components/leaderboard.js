import { club, leaderboardTeams } from "../data/dashboard.js";
import { getTeamLandingUrl } from "../routes/teamRoutes.js?v=cafe-visit";
import { escapeHtml, formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";
import { renderReputationStars } from "./cafeHero.js";

export const renderLeaderboardView = ({
  isVisiting = false,
  currentTeamId = "A",
  localStaticServer = false,
} = {}) => {
  const maxPts = leaderboardTeams.length > 0 && leaderboardTeams[0].pts > 0
    ? leaderboardTeams[0].pts
    : 1;

  const currentTeam = leaderboardTeams.find(
    (t) => String(t.id).toUpperCase() === String(currentTeamId).toUpperCase(),
  );

  const currentRank = currentTeam
    ? leaderboardTeams.findIndex((t) => String(t.id) === String(currentTeam.id)) + 1
    : club.ranking || 0;

  const rankBadgeText = currentRank === 1
    ? "🥇 Quán quân hiện tại"
    : currentRank === 2
      ? "🥈 Á quân hiện tại"
      : currentRank === 3
        ? "🥉 Hạng ba hiện tại"
        : currentRank > 0
          ? `Hạng ${currentRank} / ${leaderboardTeams.length || 8}`
          : "Đang cập nhật thứ hạng";

  return `
    <section class="management-view leaderboard-view" aria-labelledby="leaderboard-view-title">
      <header class="management-heading">
        <div>
          <button class="back-link" type="button" data-action="back-overview">${icon("arrowLeft")} Quay lại tổng quan</button>
          <h2 id="leaderboard-view-title">Bảng xếp hạng các quán</h2>
          <p>Thành tích điểm coin và thứ tự xếp hạng của 8 quán café sinh viên.</p>
        </div>
      </header>

      <div class="leaderboard-callout">
        <span class="leaderboard-callout-icon">${icon("award")}</span>
        <div class="leaderboard-callout-copy">
          <strong>${escapeHtml(club.name)} · ${rankBadgeText}</strong>
          <p>Đang có <b>${formatNumber(currentTeam?.pts ?? club.startingFund ?? 0)} coin</b> trong quỹ. Bảng xếp hạng cập nhật tự động từ hệ thống.</p>
        </div>
      </div>

      <section class="panel leaderboard-panel" aria-label="Bảng xếp hạng chi tiết">
        <header class="leaderboard-panel-header">
          <div>
            <h3>Bảng xếp hạng CLB</h3>
            <span>8 quán café sinh viên thi đua</span>
          </div>
          <span class="leaderboard-live-tag"><i></i> Đồng bộ dữ liệu</span>
        </header>

        <div class="leaderboard-table-wrap">
          <div class="lb-header" aria-hidden="true">
            <span>Hạng</span>
            <span>Quán café</span>
            <span>Uy tín</span>
            <span>Số coin</span>
            <span>Thao tác</span>
          </div>

          <div class="lb-list">
            ${leaderboardTeams.length ? leaderboardTeams.map((team, index) => {
              const rank = index + 1;
              const rankClass = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "";
              const rankIcon = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
              const barWidth = Math.max(6, Math.min(100, Math.round(((team.pts || 0) / maxPts) * 100)));
              const isCurrentTeam = String(team.id).toUpperCase() === String(currentTeamId).toUpperCase();
              const teamUrl = getTeamLandingUrl(team.id, { localStaticServer });
              const currentTagText = isVisiting ? "Quán đang ghé" : "Quán của bạn";

              return `
                <article class="lb-row${isCurrentTeam ? " is-current-team" : ""}" data-team-id="${escapeHtml(team.id)}">
                  <div class="lb-rank ${rankClass}" aria-label="Hạng ${rank}">
                    <span class="lb-rank-badge">${rankIcon}</span>
                  </div>

                  <div class="lb-team">
                    <span class="lb-avatar" style="background-color:${escapeHtml(team.bg || "#f4ece2")};color:${escapeHtml(team.color || "#76533c")}" aria-hidden="true">
                      ${escapeHtml(team.icon || team.name.charAt(0))}
                    </span>
                    <div class="lb-team-info">
                      <div class="lb-team-name-row">
                        <strong class="lb-team-name">${escapeHtml(team.name)}</strong>
                        ${isCurrentTeam ? `<span class="lb-current-badge">${currentTagText}</span>` : ""}
                      </div>
                      <small class="lb-team-meta">Nhóm ${escapeHtml(team.id)}</small>
                    </div>
                  </div>

                  <div class="lb-reputation" aria-label="Uy tín ${team.reputation} sao">
                    <span class="stars">${renderReputationStars(team.reputation)}</span>
                  </div>

                  <div class="lb-pts-col">
                    <strong class="lb-pts">${Number(team.pts || 0).toLocaleString("vi-VN")} <small>coin</small></strong>
                    <div class="lb-bar-wrap" aria-hidden="true">
                      <span class="lb-bar" style="width:${barWidth}%;background:${escapeHtml(team.color || "var(--brown)")}"></span>
                    </div>
                  </div>

                  <div class="lb-action-col">
                    ${isCurrentTeam ? `
                      <span class="lb-current-pill">Đang mở</span>
                    ` : `
                      <a class="lb-visit-link" href="${teamUrl}">
                        Ghé thăm ${icon("arrowRight")}
                      </a>
                    `}
                  </div>
                </article>
              `;
            }).join("") : `
              <div class="lb-empty">
                <span class="lb-empty-icon">${icon("award")}</span>
                <strong>Chưa có dữ liệu bảng xếp hạng</strong>
                <p>Đang tải hoặc kiểm tra kết nối với hệ thống.</p>
              </div>
            `}
          </div>
        </div>
      </section>
    </section>
  `;
};
