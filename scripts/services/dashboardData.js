import {
  cafeStats,
  club,
  createDemoOrder,
  finance,
  members,
  orders,
  transactionLogs,
  weeklyCoinSummary,
} from "../data/dashboard.js";
import { getTeamIdFromLocation } from "../routes/teamRoutes.js";
import { getCafeWeekStart, getNextCafeWeekStart } from "../utils/cafeWeek.js?v=cafe-cycle";
import { supabase } from "../supabase/supabase.js";
import { getWeeklyCostEstimate } from "./weeklyCosts.js";

const memberPalettes = [
  ["#936d55", "#2e3b5c"],
  ["#66827a", "#293955"],
  ["#976a79", "#313b62"],
  ["#48778b", "#2a395c"],
  ["#a27565", "#40364f"],
  ["#65799b", "#2d3857"],
];

const orderTones = ["purple", "blue", "gold", "coral"];
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
const timeFormatter = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });

const numberOrZero = (value) => {
  const resolved = Number(value);
  return Number.isFinite(resolved) ? resolved : 0;
};

const clamp = (value, minimum, maximum) => Math.min(Math.max(numberOrZero(value), minimum), maximum);

const getInitials = (name) => String(name ?? "")
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .slice(-2)
  .map((part) => part.charAt(0).toUpperCase())
  .join("") || "TV";

const getTeamId = () => {
  const defaultTeamId = document.querySelector("#app")?.dataset.teamId || "A";
  return getTeamIdFromLocation({
    search: window.location.search,
    pathname: window.location.pathname,
    fallback: defaultTeamId,
  });
};

const updateStat = (statId, values) => {
  const stat = cafeStats.find((item) => item.id === statId);
  if (stat) Object.assign(stat, values);
};

const resetSharedData = () => {
  members.splice(0, members.length);
  orders.splice(0, orders.length, createDemoOrder());
  transactionLogs.splice(0, transactionLogs.length);
  Object.assign(weeklyCoinSummary, {
    totalIncome: 0,
    totalExpense: 0,
    totalProfit: 0,
  });
  Object.assign(club, {
    name: "Cafe Horizon",
    code: "Nhóm chưa xác định",
    xp: 0,
    xpTarget: 0,
    memberCount: 0,
    memberLimit: 0,
    startingFund: 0,
    reputation: 0,
    ranking: 0,
    satisfaction: 0,
  });
  Object.assign(finance, {
    currentFund: 0,
    change: 0,
    changePercent: 0,
    weeklyFlow: 0,
    income: 0,
    expense: 0,
    updatedAt: "Chưa có dữ liệu",
  });
  updateStat("staff", { value: "0", total: "", meta: [["Đi làm", "0"], ["Vắng mặt", "0"]] });
  updateStat("orders", { value: "0", meta: [["Hoàn thành", "0"], ["Đang xử lý", "0"]] });
  updateStat("energy", { value: "0", progress: 0 });
  updateStat("reputation", { value: "0", progress: 0, note: "Đang phát triển", isDeveloping: true });
};

const normalizeOrder = (order, index) => ({
  id: order.id,
  title: order.title || "Đơn hàng chưa đặt tên",
  description: order.description || order.summary || "Chưa có mô tả đơn hàng.",
  requirements: order.requirements || "Chưa có yêu cầu chi tiết.",
  sourceUrl: order.source_url || order.sourceUrl || "#",
  reward: Math.max(0, numberOrZero(order.reward ?? order.reward_coin ?? order.points)),
  deadline: order.deadline,
  status: String(order.status || "available").toLowerCase(),
  completionPercent: clamp(order.demo_progress ?? order.completion_percent, 0, 100),
  completedMembers: 0,
  totalMembers: 0,
  progressMode: String(order.progress_mode || "live").toLowerCase(),
  icon: order.icon || "code",
  tone: order.tone || orderTones[index % orderTones.length],
  isDemo: false,
});

const isSameLocalDate = (left, right) => left.getFullYear() === right.getFullYear()
  && left.getMonth() === right.getMonth()
  && left.getDate() === right.getDate();

const getTransactionDateLabel = (value) => {
  const occurredAt = new Date(value);
  if (Number.isNaN(occurredAt.getTime())) return "Chưa rõ ngày";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameLocalDate(occurredAt, today)) return "Hôm nay";
  if (isSameLocalDate(occurredAt, yesterday)) return "Hôm qua";
  return dateFormatter.format(occurredAt);
};

const normalizeTransaction = (transaction) => {
  const amount = numberOrZero(transaction.amount);
  const resolvedType = transaction.type || (amount >= 0 ? "income" : "expense");
  const occurredAt = transaction.occurred_at || transaction.created_at;
  const iconByType = {
    income: "trendingUp",
    expense: "arrowDown",
    adjustment: "wallet",
  };

  return {
    id: transaction.id,
    type: resolvedType,
    title: transaction.title || "Biến động coin",
    group: club.name,
    amount,
    date: getTransactionDateLabel(occurredAt),
    time: occurredAt && !Number.isNaN(new Date(occurredAt).getTime()) ? timeFormatter.format(new Date(occurredAt)) : "--:--",
    occurredAt,
    icon: transaction.icon || iconByType[resolvedType] || "receipt",
  };
};

const hydrateCoinLedger = (transactions, {
  weekStart,
  weekEnd,
  settledProfit = 0,
  weeklyExpense = 0,
}) => {
  transactionLogs.splice(0, transactionLogs.length, ...transactions);
  const weeklyTransactions = transactions.filter((transaction) => {
    const occurredAt = new Date(transaction.occurredAt);
    return weekStart
      && !Number.isNaN(occurredAt.getTime())
      && occurredAt >= weekStart
      && occurredAt < weekEnd;
  });
  const totalIncome = weeklyTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalExpense = weeklyTransactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  const weeklyRevenue = weeklyTransactions
    .filter((transaction) => transaction.type === "income" && transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);

  Object.assign(weeklyCoinSummary, {
    totalIncome,
    totalExpense,
    totalProfit: totalIncome - totalExpense,
  });
  Object.assign(finance, {
    income: weeklyRevenue,
    expense: weeklyExpense,
    weeklyFlow: numberOrZero(settledProfit),
  });
};

const hydrateOrderProgress = ({ allMemberCount, completionRows, completionConnected }) => {
  const totalMembers = Math.max(0, numberOrZero(allMemberCount));

  orders.forEach((order) => {
    const completedMemberIds = new Set(
      completionRows
        .filter((completion) => String(completion.order_id) === String(order.id))
        .map((completion) => completion.member_id),
    );

    order.completedMembers = completedMemberIds.size;
    order.totalMembers = totalMembers;

    if (order.progressMode === "demo" || !completionConnected) return;
    order.completionPercent = totalMembers > 0
      ? clamp(Math.round((completedMemberIds.size / totalMembers) * 100), 0, 100)
      : 0;
  });
};

const normalizeMember = (member, index) => ({
  id: member.id,
  name: member.name || "Thành viên chưa đặt tên",
  initials: getInitials(member.name),
  role: member.role || "Thành viên",
  status: member.attendance_status || member.status || "",
  colors: memberPalettes[index % memberPalettes.length],
});

const resolveAttendance = (resolvedMembers) => {
  const presentStatuses = new Set(["present", "working", "đi làm", "co mat", "có mặt"]);
  const absentStatuses = new Set(["absent", "off", "vắng", "vang mat", "vắng mặt"]);
  let present = 0;
  let absent = 0;

  resolvedMembers.forEach((member) => {
    const status = String(member.status).trim().toLowerCase();
    if (presentStatuses.has(status)) present += 1;
    if (absentStatuses.has(status)) absent += 1;
  });

  return { present, absent };
};

export const loadDashboardData = async () => {
  resetSharedData();
  const teamId = getTeamId();
  const currentWeekStart = getCafeWeekStart();
  const currentWeekEnd = getNextCafeWeekStart();

  let transactionQuery = supabase
    .from("coin_transactions")
    .select("*")
    .eq("team_id", teamId)
    .order("occurred_at", { ascending: false });

  if (currentWeekStart) {
    transactionQuery = transactionQuery
      .gte("occurred_at", currentWeekStart.toISOString())
      .lt("occurred_at", currentWeekEnd.toISOString())
      .limit(1000);
  } else {
    transactionQuery = transactionQuery.limit(50);
  }

  try {
    const [teamResult, memberResult, orderResult, transactionResult, allMemberResult, completionResult, settlementResult] = await Promise.all([
      supabase.from("teams").select("*").eq("id", teamId).maybeSingle(),
      supabase.from("members").select("*").eq("team_id", teamId).order("name", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20),
      transactionQuery,
      supabase.from("members").select("id", { count: "exact", head: true }),
      supabase.from("order_completions").select("order_id, member_id"),
      supabase
        .from("weekly_financial_settlements")
        .select("profit, period_start, settled_at")
        .eq("team_id", teamId)
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const team = teamResult.data;
    const resolvedMembers = (memberResult.data || []).map(normalizeMember);
    members.splice(0, members.length, ...resolvedMembers);
    club.memberCount = resolvedMembers.length;

    const resolvedOrders = (orderResult.data || [])
      .filter((order) => order.team_id == null || String(order.team_id).toUpperCase() === teamId)
      .map(normalizeOrder);
    if (resolvedOrders.length > 0) {
      orders.splice(0, orders.length, ...resolvedOrders);
    }
    hydrateOrderProgress({
      allMemberCount: allMemberResult.count,
      completionRows: completionResult.data || [],
      completionConnected: !completionResult.error && !allMemberResult.error,
    });

    if (team) {
      Object.assign(club, {
        name: team.name || club.name,
        code: `Nhóm ${team.id || teamId}`,
        xp: numberOrZero(team.xp),
        xpTarget: numberOrZero(team.xp_target),
        memberLimit: numberOrZero(team.member_limit),
        startingFund: numberOrZero(team.points),
      });
      Object.assign(finance, {
        currentFund: numberOrZero(team.points),
        updatedAt: team.updated_at || "Chưa có dữ liệu cập nhật",
      });

      const energy = clamp(team.energy, 0, 100);
      updateStat("energy", { value: String(energy), progress: energy });
    }

    const resolvedTransactions = (transactionResult.data || []).map(normalizeTransaction);
    const weeklyCost = getWeeklyCostEstimate(resolvedMembers.length);
    hydrateCoinLedger(resolvedTransactions, {
      weekStart: currentWeekStart,
      weekEnd: currentWeekEnd,
      settledProfit: settlementResult.data?.profit,
      weeklyExpense: weeklyCost.total,
    });

    const completedOrders = orders.filter((order) => order.status === "completed").length;
    const pendingOrders = orders.length - completedOrders;
    updateStat("orders", {
      value: String(completedOrders),
      meta: [["Hoàn thành", String(completedOrders)], ["Đang xử lý", String(pendingOrders)]],
    });

    const attendance = resolveAttendance(resolvedMembers);
    updateStat("staff", {
      value: String(resolvedMembers.length),
      total: club.memberLimit > 0 ? `/ ${club.memberLimit}` : "",
      meta: [["Đi làm", String(attendance.present)], ["Vắng mặt", String(attendance.absent)]],
    });

    return {
      teamId,
      connected: !teamResult.error && !memberResult.error && !orderResult.error && !transactionResult.error && !completionResult.error,
      teamFound: Boolean(team),
      ordersConnected: !orderResult.error,
      ledgerConnected: !transactionResult.error,
      settlementConnected: !settlementResult.error,
      progressConnected: !completionResult.error && !allMemberResult.error,
    };
  } catch {
    return { teamId, connected: false, teamFound: false };
  }
};
