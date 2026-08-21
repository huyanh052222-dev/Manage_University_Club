import { finance, groups } from "../data/dashboard.js";

export const getGroups = () => groups.map((group) => ({ ...group }));

export const getGroup = (groupId) => groups.find((group) => group.id === groupId);

export const adjustGroupCoins = ({ groupId, direction, amount }) => {
  const group = getGroup(groupId);
  const coinAmount = Number(amount);

  if (!group || !Number.isInteger(coinAmount) || coinAmount <= 0) {
    return { ok: false, message: "Vui lòng nhập số coin hợp lệ." };
  }

  if (direction === "subtract" && coinAmount > group.balance) {
    return { ok: false, message: `Số dư của ${group.name} không đủ để thực hiện giao dịch.` };
  }

  group.balance += direction === "subtract" ? -coinAmount : coinAmount;

  if (group.id === "cafe-horizon") {
    finance.currentFund = group.balance;
  }

  return { ok: true, group: { ...group }, amount: coinAmount, direction };
};
