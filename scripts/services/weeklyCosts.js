import { members } from "../data/dashboard.js";

const WEEKLY_COST_CONFIG = Object.freeze({
  salaryPerMember: 20,
  ingredients: 50,
  utilities: 50,
  rent: 100,
});

const positiveIntegerOrZero = (value) => {
  const resolved = Number(value);
  return Number.isFinite(resolved) && resolved > 0 ? Math.round(resolved) : 0;
};

const normalizedRole = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase();

const managerRoles = new Set([
  "manage",
  "manager",
  "quan ly",
  "quan tri vien",
  "truong nhom",
  "leader",
  "admin",
]);

export const isManagerRole = (memberOrRole) => {
  const role = typeof memberOrRole === "object"
    ? memberOrRole?.roleCode ?? memberOrRole?.role
    : memberOrRole;
  return managerRoles.has(normalizedRole(role));
};

const resolveMemberCounts = (memberSource) => {
  if (!Array.isArray(memberSource)) {
    const staffCount = positiveIntegerOrZero(memberSource);
    return { totalMemberCount: staffCount, staffCount, managerCount: 0 };
  }

  const totalMemberCount = memberSource.length;
  const managerCount = memberSource.filter(isManagerRole).length;
  return {
    totalMemberCount,
    managerCount,
    staffCount: Math.max(0, totalMemberCount - managerCount),
  };
};

export const getWeeklyCostEstimate = (memberSource = members) => {
  const { totalMemberCount, staffCount, managerCount } = resolveMemberCounts(memberSource);
  const salary = WEEKLY_COST_CONFIG.salaryPerMember * staffCount;

  const items = [
    {
      id: "salary",
      label: "Lương nhân viên",
      detail: `${staffCount > 0 ? WEEKLY_COST_CONFIG.salaryPerMember : 0} coin × ${staffCount} nhân viên${managerCount ? ` · Không tính ${managerCount} quản lý` : ""}`,
      amount: salary,
    },
    ...(managerCount ? [{
      id: "manager",
      label: "Quản lý",
      detail: `${managerCount} người · Không tính lương`,
      amount: 0,
    }] : []),
    { id: "ingredients", label: "Nguyên liệu", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.ingredients },
    { id: "utilities", label: "Điện nước", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.utilities },
    { id: "rent", label: "Mặt bằng", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.rent },
  ];

  return {
    totalMemberCount,
    staffCount,
    managerCount,
    fixedCost: WEEKLY_COST_CONFIG.ingredients + WEEKLY_COST_CONFIG.utilities + WEEKLY_COST_CONFIG.rent,
    salaryPerMember: WEEKLY_COST_CONFIG.salaryPerMember,
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  };
};
