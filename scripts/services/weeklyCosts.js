import { club } from "../data/dashboard.js";

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

export const getWeeklyCostEstimate = (memberCount = club.memberCount) => {
  const staffCount = positiveIntegerOrZero(memberCount);
  const salary = WEEKLY_COST_CONFIG.salaryPerMember * staffCount;

  const items = [
    {
      id: "salary",
      label: "Lương nhân viên",
      detail: `${staffCount > 0 ? WEEKLY_COST_CONFIG.salaryPerMember : 0} coin × ${staffCount} người`,
      amount: salary,
    },
    { id: "ingredients", label: "Nguyên liệu", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.ingredients },
    { id: "utilities", label: "Điện nước", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.utilities },
    { id: "rent", label: "Mặt bằng", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.rent },
  ];

  return {
    staffCount,
    fixedCost: WEEKLY_COST_CONFIG.ingredients + WEEKLY_COST_CONFIG.utilities + WEEKLY_COST_CONFIG.rent,
    salaryPerMember: WEEKLY_COST_CONFIG.salaryPerMember,
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  };
};
