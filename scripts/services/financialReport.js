import { getAllCafeWeeks } from "../utils/cafeWeek.js?v=monday-cycle";
import { formatNumber } from "../utils/format.js";
import { members, teamSettlements } from "../data/dashboard.js";
import { getWeeklyCostEstimate } from "./weeklyCosts.js";
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
    if (transaction.settlementPeriodStart === week.periodStartKey) return true;
    if (week.week === 1 && (transaction.settlementPeriodStart === "2026-08-30" || transaction.settlementPeriodStart === "2026-08-31")) {
      return true;
    }
    return false;
  }

  // Nếu không ghi kỳ, tính theo thời điểm phát sinh occurred_at
  const occurredAt = new Date(transaction.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) return false;

  return occurredAt >= week.periodStart && occurredAt < week.periodEnd;
};

export const findSettlementForWeek = (settlements, week) => {
  if (!Array.isArray(settlements) || !week) return null;
  return settlements.find((s) => {
    if (s.period_start === week.periodStartKey) return true;
    if (week.week === 1 && (s.period_start === "2026-08-30" || s.period_start === "2026-08-31")) return true;
    return false;
  }) || null;
};

export const getReportWeekOptions = (
  now = new Date(),
  transactions = [],
  settlements = teamSettlements,
  memberList = members,
) => {
  const allWeeks = getAllCafeWeeks(now);
  const costEstimate = getWeeklyCostEstimate(memberList);

  const weekOptions = allWeeks.map((week) => {
    const weekTransactions = transactions.filter((tx) => isTransactionInWeek(tx, week));
    const settlement = findSettlementForWeek(settlements, week);

    // Tính doanh thu: ưu tiên số liệu kết toán chính thức hoặc tổng transaction income
    const txIncome = weekTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const income = settlement ? Math.max(Number(settlement.income) || 0, txIncome) : txIncome;

    // Tính chi phí:
    // 1. Phí vận hành tuần (200 coin cố định + 20 × số nhân sự)
    // 2. Các khoản trừ phụ thủ công (nếu có trong coin_transactions)
    const hasOperatingCostTx = weekTransactions.some(
      (tx) => tx.amount < 0 && (tx.title?.toLowerCase().includes("vận hành") || tx.title?.toLowerCase().includes("van hanh"))
    );
    const manualExpense = weekTransactions
      .filter((tx) => tx.amount < 0 && !(tx.title?.toLowerCase().includes("vận hành") || tx.title?.toLowerCase().includes("van hanh")))
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    let operatingCost = 0;
    let isEstimated = false;

    if (settlement && Number(settlement.expense) > 0) {
      operatingCost = Number(settlement.expense);
      isEstimated = false;
    } else {
      // Tuần hiện tại hoặc tuần chưa chốt kết toán: dùng định mức chi phí tuần
      operatingCost = costEstimate.total;
      isEstimated = true;
    }

    const totalExpense = operatingCost + manualExpense;
    const profit = income - totalExpense;

    return {
      id: week.periodStartKey,
      weekNumber: week.week,
      title: week.title,
      subtitle: week.displayRange,
      periodStartKey: week.periodStartKey,
      periodEndKey: week.periodEndKey,
      isCurrent: week.isCurrent,
      isCompleted: week.isCompleted,
      isEstimated,
      statusLabel: week.isCurrent ? "Đang diễn ra" : (settlement ? "Đã chốt kỳ" : "Chờ kết toán"),
      transactionCount: weekTransactions.length,
      income,
      expense: totalExpense,
      operatingCost,
      manualExpense,
      profit,
      periodStart: week.periodStart,
      periodEnd: week.periodEnd,
      settlement,
      hasOperatingCostTx,
    };
  });

  const totalIncome = weekOptions.reduce((sum, opt) => sum + opt.income, 0);
  const totalExpense = weekOptions.reduce((sum, opt) => sum + opt.expense, 0);

  const allOption = {
    id: "all",
    weekNumber: 0,
    title: "Tất cả các tuần",
    subtitle: "Toàn bộ lịch sử biến động từ ngày mở bán đến nay",
    periodStartKey: "",
    periodEndKey: "",
    isCurrent: false,
    isCompleted: false,
    isEstimated: false,
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

  const localMatch = teamSettlements.find((s) => {
    if (s.period_start === periodStartKey) return true;
    if (periodStartKey === "2026-08-31" && (s.period_start === "2026-08-30" || s.period_start === "2026-08-31")) return true;
    return false;
  });
  if (localMatch) return localMatch;

  try {
    const { data, error } = await supabase
      .from("weekly_financial_settlements")
      .select("income, expense, profit, member_count, period_start, period_end, settled_at")
      .eq("team_id", teamId)
      .in("period_start", [periodStartKey, "2026-08-30"])
      .order("period_start", { ascending: false })
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
  memberList = members,
}) => {
  const rows = [];
  const costEstimate = getWeeklyCostEstimate(memberList);

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

  // Xác định rõ Doanh thu, Chi phí vận hành, Các khoản khác
  const txIncome = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const income = weekOption.income || (settlement ? Math.max(Number(settlement.income) || 0, txIncome) : txIncome);

  const hasOperatingCostTx = transactions.some(
    (tx) => tx.amount < 0 && (tx.title?.toLowerCase().includes("vận hành") || tx.title?.toLowerCase().includes("van hanh"))
  );
  const manualExpense = transactions
    .filter((tx) => tx.amount < 0 && !(tx.title?.toLowerCase().includes("vận hành") || tx.title?.toLowerCase().includes("van hanh")))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  let operatingCost = 0;
  if (weekOption.id === "all") {
    operatingCost = weekOption.expense - manualExpense;
  } else if (settlement && Number(settlement.expense) > 0) {
    operatingCost = Number(settlement.expense);
  } else {
    operatingCost = weekOption.operatingCost || costEstimate.total;
  }

  const totalExpense = operatingCost + manualExpense;
  const netProfit = income - totalExpense;

  // Bảng tổng kết tài chính kỳ
  rows.push([escapeCsvCell("--- TỔNG KẾT TÀI CHÍNH TRONG KỲ ---")]);
  rows.push([
    escapeCsvCell("Chỉ số"),
    escapeCsvCell("Số coin"),
    escapeCsvCell("Ghi chú / Chi tiết"),
  ]);

  rows.push([
    escapeCsvCell("Tổng coin vào (Doanh thu)"),
    escapeCsvCell(formatSignedCoin(income)),
    escapeCsvCell(`${transactions.filter((tx) => tx.amount > 0).length} giao dịch phát sinh`),
  ]);
  rows.push([
    escapeCsvCell("Chi phí vận hành tuần"),
    escapeCsvCell(formatSignedCoin(-operatingCost)),
    escapeCsvCell(settlement
      ? `Đã chốt kết toán (200 coin cố định + 20 × ${settlement.member_count} nhân sự)`
      : `Dự toán tuần (200 coin cố định + 20 × ${costEstimate.staffCount} nhân sự)`),
  ]);
  if (manualExpense > 0) {
    rows.push([
      escapeCsvCell("Các khoản trừ khác trong kỳ"),
      escapeCsvCell(formatSignedCoin(-manualExpense)),
      escapeCsvCell("Các khoản trừ ngoài phí vận hành định kỳ"),
    ]);
  }
  rows.push([
    escapeCsvCell("Tổng chi phí trong kỳ"),
    escapeCsvCell(formatSignedCoin(-totalExpense)),
    escapeCsvCell(hasOperatingCostTx ? "Đã bao gồm dòng trừ trong sổ cái" : "Gồm phí vận hành và các khoản trừ"),
  ]);
  rows.push([
    escapeCsvCell("Lợi nhuận ròng trong kỳ"),
    escapeCsvCell(formatSignedCoin(netProfit)),
    escapeCsvCell(netProfit >= 0 ? "Thặng dư dương (+)" : "Thâm hụt âm (−)"),
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

  const typeLabels = {
    income: "Coin vào",
    expense: "Coin ra",
    adjustment: "Admin điều chỉnh",
  };

  const detailedItems = [];

  // 1. Thêm các giao dịch thực tế trong sổ cái
  transactions.forEach((tx) => {
    const txTime = tx.occurredAt && !Number.isNaN(new Date(tx.occurredAt).getTime())
      ? shortDateFormatter.format(new Date(tx.occurredAt))
      : tx.date || "Chưa rõ ngày";

    detailedItems.push({
      time: txTime,
      occurredAt: tx.occurredAt ? new Date(tx.occurredAt) : new Date(0),
      id: tx.id || "—",
      type: typeLabels[tx.type] || "Biến động",
      amountFormatted: formatSignedCoin(tx.amount),
      title: tx.title || "Giao dịch",
      reason: tx.reason || "",
      period: tx.settlementPeriodStart ? `Kỳ trễ ${tx.settlementPeriodStart}` : "Kỳ phát sinh",
    });
  });

  // 2. Nếu tuần này chưa có dòng "Phí vận hành tuần" trong coin_transactions, bổ sung dòng chi phí vận hành
  if (!hasOperatingCostTx && operatingCost > 0 && weekOption.id !== "all") {
    const settleDate = settlement?.settled_at
      ? shortDateFormatter.format(new Date(settlement.settled_at))
      : (weekOption.periodEnd ? shortDateFormatter.format(weekOption.periodEnd) : shortDateFormatter.format(exportedAt));

    detailedItems.push({
      time: settleDate,
      occurredAt: settlement?.settled_at ? new Date(settlement.settled_at) : (weekOption.periodEnd || new Date()),
      id: settlement?.id || "OPERATING-FEE",
      type: "Coin ra (Chi phí)",
      amountFormatted: formatSignedCoin(-operatingCost),
      title: settlement ? "Phí vận hành tuần (Đã kết toán)" : "Dự toán chi phí vận hành tuần",
      reason: settlement
        ? `Chi phí cố định 200 coin + 20 coin × ${settlement.member_count} nhân sự`
        : `Chi phí cố định 200 coin + 20 coin × ${costEstimate.staffCount} nhân sự`,
      period: weekOption.title,
    });
  }

  if (detailedItems.length === 0) {
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
    // Sắp xếp thời gian giảm dần (mới nhất lên đầu)
    detailedItems.sort((a, b) => b.occurredAt - a.occurredAt);

    detailedItems.forEach((item, idx) => {
      rows.push([
        escapeCsvCell(idx + 1),
        escapeCsvCell(item.time),
        escapeCsvCell(item.id),
        escapeCsvCell(item.type),
        escapeCsvCell(item.amountFormatted),
        escapeCsvCell(item.title),
        escapeCsvCell(item.reason),
        escapeCsvCell(item.period),
      ]);
    });

    // Dòng tổng kết
    rows.push([
      escapeCsvCell("Tổng kết"),
      escapeCsvCell(`Tổng ${detailedItems.length} mục`),
      escapeCsvCell(""),
      escapeCsvCell("Dòng tiền ròng"),
      escapeCsvCell(formatSignedCoin(netProfit)),
      escapeCsvCell(`Vào: ${formatSignedCoin(income)} | Ra: ${formatSignedCoin(-totalExpense)}`),
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
