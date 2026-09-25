import { getAllCafeWeeks } from "../utils/cafeWeek.js?v=monday-cycle";
import { formatNumber } from "../utils/format.js";
import { supabase } from "../supabase/supabase.js";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

const formatSignedCoin = (amount) => {
  if (amount === 0) return "0 coin";
  return `${amount > 0 ? "+" : "−"}${formatNumber(Math.abs(amount))} coin`;
};

const sanitizeFilenamePart = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

export const isTransactionInWeek = (transaction, week) => {
  if (!week || !transaction) return false;

  // Nếu giao dịch được gán rõ vào kỳ kết toán trễ
  if (transaction.settlementPeriodStart) {
    return transaction.settlementPeriodStart === week.periodStartKey;
  }

  // Nếu không ghi kỳ, tính theo thời điểm phát sinh occurred_at
  const occurredAt = new Date(transaction.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) return false;

  return occurredAt >= week.periodStart && occurredAt < week.periodEnd;
};

export const getReportWeekOptions = (now = new Date(), transactions = []) => {
  const allWeeks = getAllCafeWeeks(now);

  const weekOptions = allWeeks.map((week) => {
    const weekTransactions = transactions.filter((tx) => isTransactionInWeek(tx, week));
    const income = weekTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = weekTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      id: week.periodStartKey,
      weekNumber: week.week,
      title: week.title,
      subtitle: week.displayRange,
      periodStartKey: week.periodStartKey,
      periodEndKey: week.periodEndKey,
      isCurrent: week.isCurrent,
      isCompleted: week.isCompleted,
      statusLabel: week.isCurrent ? "Đang diễn ra" : "Đã hoàn tất",
      transactionCount: weekTransactions.length,
      income,
      expense,
      profit: income - expense,
      periodStart: week.periodStart,
      periodEnd: week.periodEnd,
    };
  });

  const totalIncome = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const allOption = {
    id: "all",
    weekNumber: 0,
    title: "Tất cả các tuần",
    subtitle: "Toàn bộ lịch sử biến động từ ngày mở bán đến nay",
    periodStartKey: "",
    periodEndKey: "",
    isCurrent: false,
    isCompleted: false,
    statusLabel: "Toàn kỳ",
    transactionCount: transactions.length,
    income: totalIncome,
    expense: totalExpense,
    profit: totalIncome - totalExpense,
  };

  return [allOption, ...weekOptions];
};

export const filterTransactionsByWeekOption = (transactions, weekOptionId, weekOptions) => {
  if (weekOptionId === "all") {
    return [...transactions];
  }
  const selectedOption = weekOptions.find((opt) => opt.id === weekOptionId);
  if (!selectedOption) return [];

  return transactions.filter((tx) => isTransactionInWeek(tx, selectedOption));
};

export const fetchWeekSettlement = async (teamId, periodStartKey) => {
  if (!teamId || !periodStartKey || periodStartKey === "all") return null;
  try {
    const { data, error } = await supabase
      .from("weekly_financial_settlements")
      .select("income, expense, profit, member_count, period_start, period_end, settled_at")
      .eq("team_id", teamId)
      .eq("period_start", periodStartKey)
      .maybeSingle();

    if (error) {
      console.warn("Lỗi khi tải kết toán kỳ:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Không thể tải kết toán kỳ:", err);
    return null;
  }
};

export const buildFinancialReportCsv = ({
  clubName = "Cafe Horizon",
  teamCode = "Nhóm",
  teamId = "A",
  weekOption,
  transactions = [],
  settlement = null,
  currentBalance = 0,
  exportedAt = new Date(),
}) => {
  const rows = [];

  // UTF-8 BOM
  const BOM = "\uFEFF";

  rows.push([escapeCsvCell("BÁO CÁO TÀI CHÍNH VÀ NHẬT KÝ BIẾN ĐỘNG COIN")]);
  rows.push([escapeCsvCell("HỆ THỐNG VẬN HÀNH QUÁN CAFÉ SINH VIÊN - CAFE HORIZON")]);
  rows.push([]);

  // Thông tin chung
  rows.push([escapeCsvCell("THÔNG TIN QUÁN & PHÂN MỤC BÁO CÁO")]);
  rows.push([escapeCsvCell("Tên quán"), escapeCsvCell(clubName)]);
  rows.push([escapeCsvCell("Mã nhóm"), escapeCsvCell(`${teamCode} (ID: ${teamId})`)]);
  rows.push([escapeCsvCell("Phân mục tuần"), escapeCsvCell(`${weekOption.title} (${weekOption.subtitle})`)]);
  rows.push([escapeCsvCell("Trạng thái kỳ"), escapeCsvCell(weekOption.statusLabel)]);
  rows.push([escapeCsvCell("Thời gian xuất báo cáo"), escapeCsvCell(dateTimeFormatter.format(exportedAt))]);
  rows.push([escapeCsvCell("Số dư tài khoản hiện tại"), escapeCsvCell(`${formatNumber(currentBalance)} coin`)]);
  rows.push([]);

  // Tổng hợp tài chính kỳ
  rows.push([escapeCsvCell("--- TỔNG KẾT TÀI CHÍNH TRONG KỲ ---")]);
  rows.push([
    escapeCsvCell("Chỉ số"),
    escapeCsvCell("Số coin"),
    escapeCsvCell("Ghi chú / Chi tiết"),
  ]);

  const totalIncome = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const incomeCount = transactions.filter((tx) => tx.amount > 0).length;
  const expenseCount = transactions.filter((tx) => tx.amount < 0).length;
  const netFlow = totalIncome - totalExpense;

  rows.push([
    escapeCsvCell("Tổng coin vào (Doanh thu)"),
    escapeCsvCell(formatSignedCoin(totalIncome)),
    escapeCsvCell(`${incomeCount} giao dịch phát sinh`),
  ]);
  rows.push([
    escapeCsvCell("Tổng coin ra (Chi phí)"),
    escapeCsvCell(formatSignedCoin(-totalExpense)),
    escapeCsvCell(`${expenseCount} giao dịch phát sinh`),
  ]);
  rows.push([
    escapeCsvCell("Biến động ròng trong kỳ"),
    escapeCsvCell(formatSignedCoin(netFlow)),
    escapeCsvCell(netFlow >= 0 ? "Thặng dư dương" : "Thâm hụt"),
  ]);

  if (settlement) {
    rows.push([
      escapeCsvCell("Kết toán chính thức (Đã chốt)"),
      escapeCsvCell(`Doanh thu: ${formatNumber(settlement.income)} | Chi phí: ${formatNumber(settlement.expense)} | Lợi nhuận: ${formatSignedCoin(settlement.profit)}`),
      escapeCsvCell(`Đã chốt ngày ${shortDateFormatter.format(new Date(settlement.settled_at))} (${settlement.member_count} nhân sự)`),
    ]);
  } else if (weekOption.id !== "all") {
    rows.push([
      escapeCsvCell("Trạng thái chốt kỳ"),
      escapeCsvCell(weekOption.isCurrent ? "Đang diễn ra" : "Chờ kết toán chính thức"),
      escapeCsvCell(weekOption.isCurrent ? "Kỳ hiện tại chưa đến hạn chốt sổ" : "Admin chưa chốt sổ kỳ này"),
    ]);
  }
  rows.push([]);

  // Bảng chi tiết giao dịch
  rows.push([escapeCsvCell("--- DANH SÁCH CHI TIẾT CÁC GIAO DỊCH TRONG KỲ ---")]);
  rows.push([
    escapeCsvCell("STT"),
    escapeCsvCell("Thời gian phát sinh"),
    escapeCsvCell("Mã giao dịch"),
    escapeCsvCell("Loại biến động"),
    escapeCsvCell("Biến động (Coin)"),
    escapeCsvCell("Tiêu đề giao dịch"),
    escapeCsvCell("Lý do / Nội dung chi tiết"),
    escapeCsvCell("Kỳ kết toán ghi nhận"),
  ]);

  if (transactions.length === 0) {
    rows.push([
      escapeCsvCell("—"),
      escapeCsvCell("—"),
      escapeCsvCell("—"),
      escapeCsvCell("Không có giao dịch"),
      escapeCsvCell("0 coin"),
      escapeCsvCell("Không có dữ liệu biến động số dư trong tuần đã chọn"),
      escapeCsvCell(""),
      escapeCsvCell(""),
    ]);
  } else {
    // Sắp xếp theo thứ tự xảy ra (mới nhất lên trước hoặc từ cũ đến mới, cho báo cáo tài chính thì từ cũ đến mới hoặc mới nhất đều được, chuẩn nhất là từ mới nhất hoặc từ cũ đến mới)
    // Sắp xếp thời gian giảm dần (mới nhất lên đầu)
    const sorted = [...transactions].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

    const typeLabels = {
      income: "Coin vào",
      expense: "Coin ra",
      adjustment: "Admin điều chỉnh",
    };

    sorted.forEach((tx, idx) => {
      const txTime = tx.occurredAt && !Number.isNaN(new Date(tx.occurredAt).getTime())
        ? shortDateFormatter.format(new Date(tx.occurredAt))
        : tx.date || "Chưa rõ ngày";

      rows.push([
        escapeCsvCell(idx + 1),
        escapeCsvCell(txTime),
        escapeCsvCell(tx.id || "—"),
        escapeCsvCell(typeLabels[tx.type] || "Biến động"),
        escapeCsvCell(formatSignedCoin(tx.amount)),
        escapeCsvCell(tx.title || "Giao dịch"),
        escapeCsvCell(tx.reason || ""),
        escapeCsvCell(tx.settlementPeriodStart ? `Kỳ trễ ${tx.settlementPeriodStart}` : "Kỳ phát sinh"),
      ]);
    });

    // Dòng tổng kết
    rows.push([
      escapeCsvCell("Tổng kết"),
      escapeCsvCell(`Tổng ${transactions.length} giao dịch`),
      escapeCsvCell(""),
      escapeCsvCell("Tổng dòng tiền"),
      escapeCsvCell(formatSignedCoin(netFlow)),
      escapeCsvCell(`Vào: ${formatSignedCoin(totalIncome)} | Ra: ${formatSignedCoin(-totalExpense)}`),
      escapeCsvCell(""),
      escapeCsvCell(""),
    ]);
  }

  const csvString = BOM + rows.map((row) => row.join(",")).join("\r\n");
  return csvString;
};

export const downloadReportFile = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const createReportFilename = ({ clubName = "Cafe", weekOption, date = new Date() }) => {
  const safeClub = sanitizeFilenamePart(clubName) || "Cafe";
  const safeWeek = weekOption.id === "all"
    ? "Tat_Ca_Cac_Tuan"
    : `Tuan_${weekOption.weekNumber || sanitizeFilenamePart(weekOption.title)}`;
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `Bao_Cao_Tai_Chinh_${safeClub}_${safeWeek}_${dateStr}.csv`;
};
