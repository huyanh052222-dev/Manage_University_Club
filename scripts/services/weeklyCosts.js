import { club } from "../data/dashboard.js";

const WEEKLY_COST_CONFIG = Object.freeze({
  salaryPerMember: 20,
  fallbackStaffCount: 10,
  ingredients: 50,
  utilities: 50,
  rent: 100,
});

const positiveIntegerOrZero = (value) => {
  const resolved = Number(value);
  return Number.isFinite(resolved) && resolved > 0 ? Math.round(resolved) : 0;
};

export const getWeeklyCostEstimate = () => {
  const staffCount = positiveIntegerOrZero(club.memberLimit)
    || positiveIntegerOrZero(club.memberCount)
    || WEEKLY_COST_CONFIG.fallbackStaffCount;
  const salary = WEEKLY_COST_CONFIG.salaryPerMember * staffCount;

  const items = [
    {
      id: "salary",
      label: "Lương nhân viên",
      detail: `${WEEKLY_COST_CONFIG.salaryPerMember} coin × ${staffCount} người`,
      amount: salary,
    },
    { id: "ingredients", label: "Nguyên liệu", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.ingredients },
    { id: "utilities", label: "Điện nước", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.utilities },
    { id: "rent", label: "Mặt bằng", detail: "Mỗi tuần", amount: WEEKLY_COST_CONFIG.rent },
  ];

  return {
    staffCount,
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  };
};
