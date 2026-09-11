import { renderCafeHero } from "./cafeHero.js?v=cafe-visit";
import { renderCafeStats } from "./cafeStats.js?v=order-summary-stat";
import { renderMemberOverview } from "./memberOverview.js?v=cafe-visit";
import { renderOrders } from "./orders.js?v=cafe-visit";
import { renderCafeTip } from "./cafeTip.js?v=orders";
import { renderTransactionLog } from "./transactionLog.js?v=coin-reason";
import { icon } from "./icons.js";

export const renderDashboard = ({ isVisiting = false } = {}) => `
  <div class="cafe-dashboard${isVisiting ? " visitor-dashboard" : ""}">
    ${isVisiting ? `
      <section class="visitor-notice" aria-label="Thông báo chế độ ghé thăm">
        <span class="visitor-notice-icon">${icon("eye")}</span>
        <div><strong>Chế độ ghé thăm</strong><p>Bạn đang xem bản giới thiệu công khai. Dữ liệu tài chính và các thao tác quản trị đã được khóa.</p></div>
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
