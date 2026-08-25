const OPENING_DATE = Object.freeze({ year: 2026, month: 7, day: 30 });
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const toUtcDateOnly = ({ year, month, day }) => Date.UTC(year, month, day);

const formatOpeningDate = () => "30/08/2026";

const createLocalOpeningDate = () => new Date(
  OPENING_DATE.year,
  OPENING_DATE.month,
  OPENING_DATE.day,
  0,
  0,
  0,
  0,
);

const getLocalToday = (now = new Date()) => new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  0,
  0,
  0,
  0,
);

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getCafeWeekStart = (now = new Date()) => {
  const today = getLocalToday(now);
  const openingDate = createLocalOpeningDate();
  if (today < openingDate) return null;

  const todayUtc = toUtcDateOnly({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate() });
  const openingUtc = toUtcDateOnly(OPENING_DATE);
  const elapsedDays = Math.floor((todayUtc - openingUtc) / DAY_IN_MILLISECONDS);
  const elapsedWeeks = Math.floor(elapsedDays / 7);
  const weekStart = createLocalOpeningDate();
  weekStart.setDate(weekStart.getDate() + (elapsedWeeks * 7));
  return weekStart;
};

export const getCafeWeekKey = (now = new Date()) => {
  const weekStart = getCafeWeekStart(now);
  return weekStart ? formatDateKey(weekStart) : null;
};

export const getNextCafeWeekStart = (now = new Date()) => {
  const weekStart = getCafeWeekStart(now);
  if (!weekStart) return createLocalOpeningDate();

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  return nextWeekStart;
};

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
