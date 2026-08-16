const numberFormatter = new Intl.NumberFormat("vi-VN");

export const formatNumber = (value) => numberFormatter.format(value);

export const getActivityColor = (activity) => {
  if (activity >= 90) return "var(--green)";
  if (activity >= 70) return "var(--orange)";
  return "var(--red)";
};

export const percentage = (value, total) => Math.round((value / total) * 100);
