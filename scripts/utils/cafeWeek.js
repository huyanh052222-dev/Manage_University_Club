const OPENING_DATE = Object.freeze({ year: 2026, month: 7, day: 30 });
const FIRST_REVENUE_WEEK_START = Object.freeze({ year: 2026, month: 7, day: 31 });
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

const createLocalFirstRevenueWeekStart = () => new Date(
  FIRST_REVENUE_WEEK_START.year,
  FIRST_REVENUE_WEEK_START.month,
  FIRST_REVENUE_WEEK_START.day,
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
  const firstWeekStart = createLocalFirstRevenueWeekStart();
  if (today < firstWeekStart) return null;

  const todayUtc = toUtcDateOnly({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate() });
  const firstWeekUtc = toUtcDateOnly(FIRST_REVENUE_WEEK_START);
  const elapsedDays = Math.floor((todayUtc - firstWeekUtc) / DAY_IN_MILLISECONDS);
  const elapsedWeeks = Math.floor(elapsedDays / 7);
  const weekStart = createLocalFirstRevenueWeekStart();
  weekStart.setDate(weekStart.getDate() + (elapsedWeeks * 7));
  return weekStart;
};

export const getCafeWeekKey = (now = new Date()) => {
  const weekStart = getCafeWeekStart(now);
  return weekStart ? formatDateKey(weekStart) : null;
};

export const getNextCafeWeekStart = (now = new Date()) => {
  const weekStart = getCafeWeekStart(now);
  if (!weekStart) return createLocalFirstRevenueWeekStart();

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  return nextWeekStart;
};

// Lợi nhuận chỉ được chốt sau khi một tuần doanh thu đã kết thúc.
// Ví dụ Thứ Hai 14/09 sẽ chốt kỳ 07/09 (bao gồm hết Chủ nhật 13/09).
export const getLastCompletedCafeWeek = (now = new Date()) => {
  const currentWeekStart = getCafeWeekStart(now);
  const firstWeekStart = createLocalFirstRevenueWeekStart();
  if (!currentWeekStart || currentWeekStart <= firstWeekStart) return null;

  const periodStart = new Date(currentWeekStart);
  periodStart.setDate(periodStart.getDate() - 7);

  return {
    periodStart,
    periodEnd: new Date(currentWeekStart),
    periodStartKey: formatDateKey(periodStart),
    periodEndKey: formatDateKey(currentWeekStart),
  };
};

// Danh sách các kỳ đã đóng để Admin đối soát hoặc soạn bản điều chỉnh trễ.
export const getCompletedCafeWeeks = (now = new Date(), limit = 8) => {
  const latestCompletedWeek = getLastCompletedCafeWeek(now);
  const firstWeekStart = createLocalFirstRevenueWeekStart();
  const maximum = Math.max(0, Math.floor(Number(limit) || 0));
  if (!latestCompletedWeek || maximum === 0) return [];

  const periods = [];
  let periodEnd = new Date(latestCompletedWeek.periodEnd);
  while (periodEnd > firstWeekStart && periods.length < maximum) {
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);
    periods.push({
      periodStart,
      periodEnd: new Date(periodEnd),
      periodStartKey: formatDateKey(periodStart),
      periodEndKey: formatDateKey(periodEnd),
    });
    periodEnd = periodStart;
  }
  return periods;
};

export const getCafeWeekContext = (now = new Date()) => {
  const today = toUtcDateOnly({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() });
  const openingDay = toUtcDateOnly(OPENING_DATE);
  const firstWeekDay = toUtcDateOnly(FIRST_REVENUE_WEEK_START);
  const daysUntilOpening = Math.floor((today - openingDay) / DAY_IN_MILLISECONDS);

  if (daysUntilOpening < 0) {
    const remainingDays = Math.abs(daysUntilOpening);
    return {
      week: 1,
      day: 0,
      hasOpened: false,
      title: "Tuần 1",
      subtitle: `Mở bán ${formatOpeningDate()} · Còn ${remainingDays} ngày`,
    };
  }

  if (today < firstWeekDay) {
    return {
      week: 1,
      day: 0,
      hasOpened: true,
      title: "Tuần 1",
      subtitle: "Ngày mở bán · Kỳ doanh thu bắt đầu Thứ Hai 31/08/2026",
    };
  }

  const elapsedDays = Math.floor((today - firstWeekDay) / DAY_IN_MILLISECONDS);
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
