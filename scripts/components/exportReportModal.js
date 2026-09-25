import { club, finance, members, teamSettlements, transactionLogs } from "../data/dashboard.js";
import { getReportWeekOptions } from "../services/financialReport.js?v=export-log-v2";
import { escapeHtml, formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

const formatSignedCoin = (amount) => {
  if (amount === 0) return "0 coin";
  return `${amount > 0 ? "+" : "−"}${formatNumber(Math.abs(amount))} coin`;
};

export const renderExportReportModal = (defaultSelectedWeekId = null) => {
  const weekOptions = getReportWeekOptions(new Date(), transactionLogs, teamSettlements, members);

  // Mặc định chọn tuần hiện tại nếu có, hoặc tuần đầu tiên trong danh sách
  const currentWeekOption = weekOptions.find((opt) => opt.isCurrent) || weekOptions[1] || weekOptions[0];
  const activeId = defaultSelectedWeekId || currentWeekOption?.id || "all";

  const renderOptionCard = (opt) => {
    const isChecked = opt.id === activeId;
    const netClass = opt.profit > 0 ? "positive-text" : opt.profit < 0 ? "negative-text" : "";

    return `
      <label class="report-week-option ${isChecked ? "is-selected" : ""}" data-week-id="${escapeHtml(opt.id)}">
        <input
          type="radio"
          name="reportWeekSelection"
          value="${escapeHtml(opt.id)}"
          ${isChecked ? "checked" : ""}
          class="report-week-radio"
        />
        <div class="report-week-content">
          <div class="report-week-header">
            <span class="report-week-title">
              <strong>${escapeHtml(opt.title)}</strong>
              ${opt.isCurrent ? '<span class="report-badge current">Hiện tại</span>' : ""}
              ${opt.id === "all" ? '<span class="report-badge all">Toàn bộ</span>' : ""}
              ${!opt.isCurrent && opt.id !== "all" && opt.settlement ? '<span class="report-badge completed">Đã chốt kỳ</span>' : ""}
              ${!opt.isCurrent && opt.id !== "all" && !opt.settlement ? '<span class="report-badge pending">Chờ kết toán</span>' : ""}
            </span>
            <small class="report-week-range">${escapeHtml(opt.subtitle)}</small>
          </div>
          <div class="report-week-stats">
            <span class="report-stat-item"><i class="report-stat-dot"></i> <b>${opt.transactionCount}</b> giao dịch</span>
            <span class="report-stat-item positive-text" title="Tổng doanh thu">+${formatNumber(opt.income)}</span>
            <span class="report-stat-item negative-text" title="Tổng chi phí vận hành & các khoản trừ">−${formatNumber(opt.expense)}${opt.isEstimated ? ' <small style="font-size:6px;opacity:0.8">(dự kiến)</small>' : ""}</span>
            <span class="report-stat-item ${netClass}" title="Biến động ròng / Lợi nhuận">Ròng: <b>${formatSignedCoin(opt.profit)}</b></span>
          </div>
        </div>
      </label>
    `;
  };

  return `
    <div class="export-report-modal" data-export-report-modal>
      <div class="export-report-intro">
        <div class="export-report-target">
          <span class="export-target-icon">${icon("store")}</span>
          <div>
            <strong>${escapeHtml(club.name)}</strong>
            <p>Mã nhóm: ${escapeHtml(club.code)} · Số dư hiện tại: <b>${formatNumber(finance.currentFund)} coin</b></p>
          </div>
        </div>
        <p class="export-instruction">
          Chọn phân mục tuần bạn muốn trích xuất số liệu. File tải về (.csv chuẩn UTF-8) sẽ bao gồm bảng tổng kết doanh thu, chi phí vận hành (cố định + lương nhân sự) và chi tiết toàn bộ các giao dịch của quán trong kỳ đó.
        </p>
      </div>

      <div class="export-week-selector" role="radiogroup" aria-label="Phân mục tuần cần xuất báo cáo">
        <h4 class="export-section-title">${icon("calendarCheck")} Chọn phân mục tuần xuất báo cáo:</h4>
        <div class="report-week-list">
          ${weekOptions.map(renderOptionCard).join("")}
        </div>
      </div>

      <div class="export-file-format-info">
        <span>${icon("fileText")}</span>
        <div>
          <strong>Định dạng file xuất: Microsoft Excel / CSV (.csv)</strong>
          <small>Hỗ trợ font tiếng Việt UTF-8 BOM, mở xem trực tiếp trên Excel, Google Sheets, LibreOffice mà không lỗi font.</small>
        </div>
      </div>

      <div class="export-modal-actions">
        <button class="btn-cancel" type="button" data-action="close-modal">
          Đóng
        </button>
        <button class="btn-download-report" type="button" data-action="submit-download-report">
          ${icon("download")} Tải về file báo cáo (.csv)
        </button>
      </div>
    </div>
  `;
};
