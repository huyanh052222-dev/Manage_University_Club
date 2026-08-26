import { finance } from "../data/dashboard.js";

const numberOrZero = (value) => {
  const resolved = Number(value);
  return Number.isFinite(resolved) ? resolved : 0;
};

export const getWeeklyProfitBreakdown = () => {
  const income = Math.max(0, numberOrZero(finance.settledIncome));
  const expense = Math.max(0, numberOrZero(finance.settledExpense));

  return {
    income,
    expense,
    profit: numberOrZero(finance.weeklyFlow),
    paidStaffCount: Math.max(0, numberOrZero(finance.settledMemberCount)),
    periodStart: finance.settlementPeriodStart,
    periodEnd: finance.settlementPeriodEnd,
    settledAt: finance.settledAt,
    hasSettlement: Boolean(finance.settledAt || finance.settlementPeriodStart),
  };
};
