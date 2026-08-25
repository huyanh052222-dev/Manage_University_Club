const deadlineFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const shortDeadlineFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const resolveDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatOrderDeadline = (value, { short = false } = {}) => {
  const deadline = resolveDate(value);
  if (!deadline) return "Chưa đặt hạn";
  return (short ? shortDeadlineFormatter : deadlineFormatter).format(deadline);
};

export const getOrderDeadlineStatus = (value, now = new Date()) => {
  const deadline = resolveDate(value);
  if (!deadline) return "Chưa đặt thời hạn";

  const remaining = deadline.getTime() - now.getTime();
  if (remaining <= 0) return "Đã hết hạn";

  const remainingDays = Math.ceil(remaining / DAY_IN_MILLISECONDS);
  if (remainingDays === 1) return "Còn khoảng 1 ngày";
  return `Còn ${remainingDays} ngày`;
};

export const getOrderStatusLabel = (status) => ({
  available: "Đang mở",
  pending: "Đang xử lý",
  completed: "Đã hoàn thành",
  expired: "Đã hết hạn",
}[String(status || "").toLowerCase()] || "Đang mở");

export const normalizeOrderSourceUrl = (value) => {
  const sourceUrl = String(value || "#").trim();
  if (sourceUrl === "#") return "#";

  try {
    const parsedUrl = new URL(sourceUrl, window.location.href);
    return ["http:", "https:"].includes(parsedUrl.protocol) ? parsedUrl.href : "#";
  } catch {
    return "#";
  }
};
