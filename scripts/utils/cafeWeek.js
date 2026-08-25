const OPENING_DATE = Object.freeze({ year: 2026, month: 7, day: 30 });
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const toUtcDateOnly = ({ year, month, day }) => Date.UTC(year, month, day);

const formatOpeningDate = () => "30/08/2026";

export const getCafeWeekContext = (now = new Date()) => {
  const today = toUtcDateOnly({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() });
  const openingDay = toUtcDateOnly(OPENING_DATE);
  const elapsedDays = Math.floor((today - openingDay) / DAY_IN_MILLISECONDS);

  if (elapsedDays < 0) {
    const remainingDays = Math.abs(elapsedDays);
    return {
      week: 1,
      day: 0,
      hasOpened: false,
      title: "Tuần 1",
      subtitle: `Mở bán ${formatOpeningDate()} · Còn ${remainingDays} ngày`,
    };
  }

  const week = Math.floor(elapsedDays / 7) + 1;
  const day = (elapsedDays % 7) + 1;
  return {
    week,
    day,
    hasOpened: true,
    title: `Tuần ${week}`,
    subtitle: `Ngày ${day} / 7 · Mở bán từ ${formatOpeningDate()}`,
  };
};
