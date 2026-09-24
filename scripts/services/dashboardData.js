import { DEFAULT_CAFE_REPUTATION, MAX_CAFE_REPUTATION, cafeStats, club, finance, leaderboardTeams, members, orders, transactionLogs, weeklyCoinSummary } from "../data/dashboard.js";
import { getTeamIdFromLocation } from "../routes/teamRoutes.js?v=cafe-visit";
import { getCafeWeekStart, getLastCompletedCafeWeek, getNextCafeWeekStart } from "../utils/cafeWeek.js?v=monday-cycle";
import { resolveCafeName, TEAM_THEMES } from "../utils/cafeNames.js?v=the-vortex-the-ora";
import { supabase } from "../supabase/supabase.js";
import { getWeeklyCostEstimate, isManagerRole } from "./weeklyCosts.js";
import { createWeeklyOrders } from "./weeklyOrders.js?v=reputation-rewards";

const memberPalettes = [
    ["#936d55", "#2e3b5c"],
    ["#66827a", "#293955"],
    ["#976a79", "#313b62"],
    ["#48778b", "#2a395c"],
    ["#a27565", "#40364f"],
    ["#65799b", "#2d3857"],
];

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
const timeFormatter = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });

const numberOrZero = (value) => {
    const resolved = Number(value);
    return Number.isFinite(resolved) ? resolved : 0;
};

const numberOrDefault = (value, fallback) => {
    const resolved = Number(value);
    return Number.isFinite(resolved) ? resolved : fallback;
};

const clamp = (value, minimum, maximum) => Math.min(Math.max(numberOrZero(value), minimum), maximum);

const getInitials = (name) =>
    String(name ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "TV";

const getTeamId = () => {
    const defaultTeamId = document.querySelector("#app")?.dataset.teamId || "A";
    return getTeamIdFromLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        fallback: defaultTeamId,
    });
};

const updateStat = (statId, values) => {
    const stat = cafeStats.find((item) => item.id === statId);
    if (stat) Object.assign(stat, values);
};

const resetSharedData = (teamId) => {
    members.splice(0, members.length);
    orders.splice(0, orders.length, ...createWeeklyOrders(new Date(), teamId));
    transactionLogs.splice(0, transactionLogs.length);
    leaderboardTeams.splice(0, leaderboardTeams.length);
    Object.assign(weeklyCoinSummary, {
        totalIncome: 0,
        totalExpense: 0,
        totalProfit: 0,
        incomeCount: 0,
        expenseCount: 0,
    });
    Object.assign(club, {
        name: "Cafe Horizon",
        code: "Nhóm chưa xác định",
        xp: 0,
        xpTarget: 0,
        memberCount: 0,
        memberLimit: 0,
        startingFund: 0,
        reputation: DEFAULT_CAFE_REPUTATION,
        ranking: 0,
        totalTeams: 8,
        satisfaction: 0,
    });
    Object.assign(finance, {
        currentFund: 0,
        change: 0,
        changePercent: 0,
        weeklyFlow: 0,
        income: 0,
        expense: 0,
        settledIncome: 0,
        settledExpense: 0,
        settledMemberCount: 0,
        settlementPeriodStart: "",
        settlementPeriodEnd: "",
        settledAt: "",
        settlementStatus: "not_due",
        expectedSettlementPeriodStart: "",
        expectedSettlementPeriodEnd: "",
        updatedAt: "Chưa có dữ liệu",
    });
    updateStat("staff", {
        value: "0",
        total: "",
        meta: [
            ["Quản lý", "0", "neutral"],
            ["Nhân viên", "0", "positive"],
        ],
    });
    updateStat("orders", {
        value: String(orders.length),
        total: "",
        note: "đơn trong tuần",
        meta: null,
    });
    updateStat("energy", { value: "0", progress: 0 });
    updateStat("reputation", {
        value: String(DEFAULT_CAFE_REPUTATION),
        total: `/ ${MAX_CAFE_REPUTATION} sao`,
        progress: (DEFAULT_CAFE_REPUTATION / MAX_CAFE_REPUTATION) * 100,
        note: "Mức khởi đầu",
        isDeveloping: false,
    });
};

const isSameLocalDate = (left, right) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();

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
        reason: transaction.reason?.trim() || "",
        settlementPeriodStart: transaction.settlement_period_start || "",
        group: club.name,
        amount,
        date: getTransactionDateLabel(occurredAt),
        time: occurredAt && !Number.isNaN(new Date(occurredAt).getTime()) ? timeFormatter.format(new Date(occurredAt)) : "--:--",
        occurredAt,
        icon: transaction.icon || iconByType[resolvedType] || "receipt",
    };
};

const hydrateCoinLedger = (transactions, { weekStart, weekEnd, settlement, completedWeek, weeklyExpense = 0 }) => {
    transactionLogs.splice(0, transactionLogs.length, ...transactions);
    const weeklyTransactions = transactions.filter((transaction) => {
        const occurredAt = new Date(transaction.occurredAt);
        return weekStart && !Number.isNaN(occurredAt.getTime()) && occurredAt >= weekStart && occurredAt < weekEnd;
    });
    const totalIncome = transactions.filter((transaction) => transaction.amount > 0).reduce((total, transaction) => total + transaction.amount, 0);
    const totalExpense = transactions.filter((transaction) => transaction.amount < 0).reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
    const incomeCount = transactions.filter((transaction) => transaction.amount > 0).length;
    const expenseCount = transactions.filter((transaction) => transaction.amount < 0).length;
    const weeklyRevenue = weeklyTransactions
        .filter((transaction) => transaction.type === "income" && transaction.amount > 0 && !transaction.settlementPeriodStart)
        .reduce((total, transaction) => total + transaction.amount, 0);
    const hasExpectedSettlement = Boolean(
        completedWeek
        && settlement?.period_start === completedWeek.periodStartKey
        && settlement?.period_end === completedWeek.periodEndKey,
    );

    Object.assign(weeklyCoinSummary, {
        totalIncome,
        totalExpense,
        totalProfit: totalIncome - totalExpense,
        incomeCount,
        expenseCount,
    });
    Object.assign(finance, {
        income: weeklyRevenue,
        expense: weeklyExpense,
        weeklyFlow: hasExpectedSettlement ? numberOrZero(settlement?.profit) : 0,
        settledIncome: hasExpectedSettlement ? numberOrZero(settlement?.income) : 0,
        settledExpense: hasExpectedSettlement ? numberOrZero(settlement?.expense) : 0,
        settledMemberCount: hasExpectedSettlement ? numberOrZero(settlement?.member_count) : 0,
        settlementPeriodStart: hasExpectedSettlement ? settlement?.period_start || "" : "",
        settlementPeriodEnd: hasExpectedSettlement ? settlement?.period_end || "" : "",
        settledAt: hasExpectedSettlement ? settlement?.settled_at || "" : "",
        settlementStatus: !completedWeek ? "not_due" : hasExpectedSettlement ? "settled" : "overdue",
        expectedSettlementPeriodStart: completedWeek?.periodStartKey || "",
        expectedSettlementPeriodEnd: completedWeek?.periodEndKey || "",
    });
};

const normalizeMember = (member, index) => ({
    id: member.id,
    name: member.name || "Thành viên chưa đặt tên",
    initials: getInitials(member.name),
    role: isManagerRole(member.role) ? "Quản lý" : "Nhân viên",
    roleCode: member.role || "staff",
    status: member.attendance_status || member.status || "",
    colors: memberPalettes[index % memberPalettes.length],
});

export const loadDashboardData = async ({ visitorMode = false } = {}) => {
    const teamId = getTeamId();
    resetSharedData(teamId);
    const currentWeekStart = getCafeWeekStart();
    const currentWeekEnd = getNextCafeWeekStart();
    const completedWeek = getLastCompletedCafeWeek();

    // Lấy cả các kỳ trước để nhật ký vẫn hiện khoản cộng tay đã được khôi phục.
    // Phần tổng hợp tuần tiếp tục được lọc theo currentWeekStart/currentWeekEnd trong hydrateCoinLedger.
    const transactionQuery = visitorMode
        ? Promise.resolve({ data: [], error: null })
        : supabase
            .from("coin_transactions")
            .select("*")
            .eq("team_id", teamId)
            .order("occurred_at", { ascending: false })
            .limit(1000);
    const settlementQuery = visitorMode
        ? Promise.resolve({ data: null, error: null })
        : supabase
            .from("weekly_financial_settlements")
            .select("income, expense, profit, member_count, period_start, period_end, settled_at")
            .eq("team_id", teamId)
            .order("period_start", { ascending: false })
            .limit(1)
            .maybeSingle();
    const teamColumns = visitorMode
        ? "id, name, reputation"
        : "*";

    const allTeamsQuery = supabase
        .from("teams")
        .select("*")
        .order("points", { ascending: false });

    try {
        const [teamResult, memberResult, transactionResult, settlementResult, allTeamsResult] = await Promise.all([
            supabase.from("teams").select(teamColumns).eq("id", teamId).maybeSingle(),
            supabase.from("members").select("*").eq("team_id", teamId).order("name", { ascending: true }),
            transactionQuery,
            settlementQuery,
            allTeamsQuery,
        ]);

        if (allTeamsResult.error) {
            console.warn("Lỗi khi tải bảng xếp hạng:", allTeamsResult.error);
        }

        const resolvedAllTeams = (allTeamsResult.data || []).map((t) => {
            const theme = TEAM_THEMES[t.id] || {};
            return {
                ...t,
                name: resolveCafeName(t),
                pts: numberOrZero(t.points),
                icon: t.icon || theme.icon || t.name?.charAt(0) || "☕",
                color: t.color || theme.color || "#76533c",
                bg: t.bg || theme.bg || "#f4ece2",
                reputation: clamp(
                    numberOrDefault(t.reputation, DEFAULT_CAFE_REPUTATION),
                    DEFAULT_CAFE_REPUTATION,
                    MAX_CAFE_REPUTATION,
                ),
            };
        });
        leaderboardTeams.splice(0, leaderboardTeams.length, ...resolvedAllTeams);

        const currentRankIndex = resolvedAllTeams.findIndex((t) => String(t.id) === String(teamId));
        if (currentRankIndex >= 0) {
            club.ranking = currentRankIndex + 1;
            club.totalTeams = resolvedAllTeams.length;
        }

        const team = teamResult.data;
        const resolvedMembers = (memberResult.data || [])
            .sort((left, right) => {
                const roleOrder = Number(isManagerRole(right.role)) - Number(isManagerRole(left.role));
                return roleOrder || String(left.name || "").localeCompare(String(right.name || ""), "vi");
            })
            .map(normalizeMember);
        members.splice(0, members.length, ...resolvedMembers);
        club.memberCount = resolvedMembers.length;

        const databaseReputation = team
            ? clamp(
                numberOrDefault(team.reputation, DEFAULT_CAFE_REPUTATION),
                DEFAULT_CAFE_REPUTATION,
                MAX_CAFE_REPUTATION,
            )
            : DEFAULT_CAFE_REPUTATION;
        const reputation = databaseReputation;

        if (team) {
            Object.assign(club, {
                name: resolveCafeName(team, club.name),
                code: `Nhóm ${team.id || teamId}`,
                memberLimit: numberOrZero(team.member_limit),
            });
            if (!visitorMode) {
                Object.assign(club, {
                    xp: numberOrZero(team.xp),
                    xpTarget: numberOrZero(team.xp_target),
                    startingFund: numberOrZero(team.points),
                });
                Object.assign(finance, {
                    currentFund: numberOrZero(team.points),
                    updatedAt: team.updated_at || "Chưa có dữ liệu cập nhật",
                });

                const energy = clamp(team.energy, 0, 100);
                updateStat("energy", { value: String(energy), progress: energy });
            }
        }

        club.reputation = reputation;
        updateStat("reputation", {
            value: String(reputation),
            total: `/ ${MAX_CAFE_REPUTATION} sao`,
            progress: (reputation / MAX_CAFE_REPUTATION) * 100,
            note: reputation === DEFAULT_CAFE_REPUTATION ? "Mức khởi đầu" : "Uy tín hiện tại",
            isDeveloping: false,
        });

        orders.splice(0, orders.length, ...createWeeklyOrders(new Date(), teamId, club.reputation));

        const resolvedTransactions = (transactionResult.data || []).map(normalizeTransaction);
        const weeklyCost = getWeeklyCostEstimate(resolvedMembers);
        if (!visitorMode) {
            hydrateCoinLedger(resolvedTransactions, {
                weekStart: currentWeekStart,
                weekEnd: currentWeekEnd,
                settlement: settlementResult.data,
                completedWeek,
                weeklyExpense: weeklyCost.total,
            });
        }

        updateStat("orders", {
            value: String(orders.length),
            total: "",
            note: "đơn trong tuần",
            meta: null,
        });

        updateStat("staff", {
            value: String(resolvedMembers.length),
            total: club.memberLimit > 0 ? `/ ${club.memberLimit}` : "",
            meta: [
                ["Quản lý", String(weeklyCost.managerCount), "neutral"],
                ["Nhân viên", String(weeklyCost.staffCount), "positive"],
            ],
        });

        return {
            teamId,
            connected: !teamResult.error && !memberResult.error && !transactionResult.error,
            teamFound: Boolean(team),
            ordersConnected: true,
            ledgerConnected: visitorMode || !transactionResult.error,
            settlementConnected: visitorMode || !settlementResult.error,
            visitorMode,
        };
    } catch {
        return { teamId, connected: false, teamFound: false };
    }
};
