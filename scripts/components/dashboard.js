import { renderCafeHero } from "./cafeHero.js?v=monday-cycle";
import { renderCafeStats } from "./cafeStats.js?v=order-summary-stat";
import { renderMemberOverview } from "./memberOverview.js?v=cafe-visit";
import { renderOrders } from "./orders.js?v=reputation-rewards";
import { renderCafeTip } from "./cafeTip.js?v=orders";
import { renderTransactionLog } from "./transactionLog.js?v=export-report-v1";
import { icon } from "./icons.js";
import { club } from "../data/dashboard.js";
import { getTeamLandingUrl } from "../routes/teamRoutes.js?v=cafe-visit";
import { escapeHtml } from "../utils/format.js";

export const renderDashboard = ({
  isVisiting = false,
  originTeamId = "",
  localStaticServer = false,
  visitSource = "",
} = {}) => {
  const returnRankingUrl = originTeamId
    ? `${getTeamLandingUrl(originTeamId, { localStaticServer })}#ranking`
    : "#ranking";

  return `
  <div class="cafe-dashboard${isVisiting ? " visitor-dashboard" : ""}">
    ${isVisiting ? `
      <section class="visitor-notice" aria-label="Thông báo chế độ ghé thăm">
        <div class="visitor-notice-main">
          <span class="visitor-notice-icon">${icon("eye")}</span>
          <div>
            <strong>Chế độ ghé thăm</strong>
            <p>Bạn đang xem bản giới thiệu công khai của <b>${escapeHtml(club.name)}</b>. Dữ liệu tài chính và các thao tác quản trị đã được khóa.</p>
          </div>
        </div>
        <div class="visitor-notice-actions">
          <a class="visitor-return-btn visitor-return-ranking-btn" href="${returnRankingUrl}">
            ${icon("arrowLeft")} Quay về Bảng xếp hạng
          </a>
        </div>
      </section>
    ` : ""}
    ${renderCafeHero({ isVisiting })}
    ${isVisiting ? "" : renderCafeStats()}
    <div class="cafe-detail-grid${isVisiting ? " visitor-detail-grid" : ""}">
      ${renderMemberOverview({ isVisiting })}
      ${renderOrders()}
      ${isVisiting ? "" : renderTransactionLog()}
    </div>
    ${isVisiting ? "" : renderCafeTip()}
  </div>
`;
};
