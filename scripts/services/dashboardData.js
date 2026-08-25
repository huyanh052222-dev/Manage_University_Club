import { cafeStats, club, finance, members } from "../data/dashboard.js";
import { supabase } from "../supabase/supabase.js";

const memberPalettes = [
  ["#936d55", "#2e3b5c"],
  ["#66827a", "#293955"],
  ["#976a79", "#313b62"],
  ["#48778b", "#2a395c"],
  ["#a27565", "#40364f"],
  ["#65799b", "#2d3857"],
];

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
  const requestedTeamId = new URLSearchParams(window.location.search).get("team");
  const defaultTeamId = document.querySelector("#app")?.dataset.teamId || "A";
  return String(requestedTeamId || defaultTeamId).trim().toUpperCase();
};

const updateStat = (statId, values) => {
  const stat = cafeStats.find((item) => item.id === statId);
  if (stat) Object.assign(stat, values);
};

const resetSharedData = () => {
  members.splice(0, members.length);
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

  try {
    const [teamResult, memberResult] = await Promise.all([
      supabase.from("teams").select("*").eq("id", teamId).maybeSingle(),
      supabase.from("members").select("*").eq("team_id", teamId).order("name", { ascending: true }),
    ]);

    const team = teamResult.data;
    const resolvedMembers = (memberResult.data || []).map(normalizeMember);
    members.splice(0, members.length, ...resolvedMembers);

    if (team) {
      const income = numberOrZero(team.weekly_income);
      const expense = numberOrZero(team.weekly_expense);
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
        income,
        expense,
        weeklyFlow: income - expense,
        updatedAt: team.updated_at || "Chưa có dữ liệu cập nhật",
      });

      const completedOrders = numberOrZero(team.orders_completed);
      const pendingOrders = numberOrZero(team.orders_pending);
      const energy = clamp(team.energy, 0, 100);
      updateStat("orders", {
        value: String(completedOrders),
        meta: [["Hoàn thành", String(completedOrders)], ["Đang xử lý", String(pendingOrders)]],
      });
      updateStat("energy", { value: String(energy), progress: energy });
    }

    club.memberCount = resolvedMembers.length;
    const attendance = resolveAttendance(resolvedMembers);
    updateStat("staff", {
      value: String(resolvedMembers.length),
      total: club.memberLimit > 0 ? `/ ${club.memberLimit}` : "",
      meta: [["Đi làm", String(attendance.present)], ["Vắng mặt", String(attendance.absent)]],
    });

    return {
      teamId,
      connected: !teamResult.error && !memberResult.error,
      teamFound: Boolean(team),
    };
  } catch {
    return { teamId, connected: false, teamFound: false };
  }
};
