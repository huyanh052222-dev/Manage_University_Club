import { WEEKLY_ORDER_TOTAL, createWeeklyOrders } from "../services/weeklyOrders.js?v=order-summary-stat";

export const DEFAULT_CAFE_REPUTATION = 1;
export const MAX_CAFE_REPUTATION = 5;

export const navigationItems = [
  { id: "overview", label: "Tổng quan", icon: "home" },
  { id: "personnel", label: "Nhân sự", icon: "users" },
  { id: "events", label: "Sự kiện", icon: "calendarCheck" },
  { id: "ranking", label: "Bảng xếp hạng", icon: "award" },
];

export const club = {
  name: "Cafe Horizon",
  code: "Quán 03",
  status: "Đang hoạt động",
  slogan: "Cùng nhau tạo nên khoảng trời riêng",
  field: "Quán café của CLB Sinh Viên",
  xp: 0,
  xpTarget: 0,
  seasonGoal: "Top 3 quán café sinh viên xuất sắc",
  memberCount: 0,
  memberLimit: 0,
  foundedAt: "01/06/2026",
  startingFund: 0,
  reputation: DEFAULT_CAFE_REPUTATION,
  ranking: 0,
  satisfaction: 0,
};

export const finance = {
  currentFund: 0,
  change: 0,
  changePercent: 0,
  weeklyFlow: 0,
  income: 0,
  expense: 0,
  settledIncome: 0,
  settledExpense: 0,
  settledMemberCount: 0,
  settlementPeriodStart: "",
  settlementPeriodEnd: "",
  settledAt: "",
  updatedAt: "Chưa có dữ liệu",
};

export const groups = [
  { id: "cafe-horizon", name: "Cafe Horizon", initials: "CH", code: "Nhóm 03", focus: "Vận hành quán café", balance: 20000, memberCount: 8, colors: ["#b37850", "#6b4934"] },
  { id: "creative-lab", name: "Creative Lab", initials: "CL", code: "Nhóm 01", focus: "Thiết kế & truyền thông", balance: 14600, memberCount: 7, colors: ["#9470a8", "#55426d"] },
  { id: "green-corner", name: "Green Corner", initials: "GC", code: "Nhóm 07", focus: "Môi trường & cộng đồng", balance: 9850, memberCount: 6, colors: ["#729272", "#3f6753"] },
  { id: "nova-makers", name: "Nova Makers", initials: "NM", code: "Nhóm 12", focus: "Công nghệ & sáng tạo", balance: 18200, memberCount: 5, colors: ["#617fa6", "#3d526e"] },
];

export const cafeStats = [
  { id: "staff", label: "Nhân sự", value: "0", total: "", note: "thành viên", meta: [["Quản lý", "0", "neutral"], ["Nhân viên", "0", "positive"]], icon: "users", color: "#d47b55" },
  { id: "orders", label: "Đơn hàng tuần", value: String(WEEKLY_ORDER_TOTAL), total: "", note: "đơn trong tuần", icon: "receipt", color: "#6ca65d" },
  { id: "energy", label: "Năng lượng nhóm", value: "0", total: "/ 100", note: "Nhiệt huyết", progress: 0, icon: "zap", color: "#e5a13c" },
  { id: "reputation", label: "Uy tín quán", value: String(DEFAULT_CAFE_REPUTATION), total: `/ ${MAX_CAFE_REPUTATION} sao`, note: "Mức khởi đầu", progress: 20, icon: "star", color: "#8c68c5", isLocked: true },
];

export const weeklyCoinSummary = {
  totalIncome: 0,
  totalExpense: 0,
  totalProfit: 0,
};

export const transactionLogs = [];

export const orders = createWeeklyOrders();

export const resources = [
  { id: "people", label: "Nhân lực", value: 7, total: 10, unit: "", icon: "user", color: "#5d8cff" },
  { id: "time", label: "Thời gian", value: 84, total: 100, unit: "giờ", icon: "clock", color: "#40d9c3" },
  { id: "energy", label: "Năng lượng", value: 60, total: 100, unit: "", icon: "zap", color: "#f6c84d" },
  { id: "reputation", label: "Uy tín", value: 320, total: 500, unit: "", icon: "sparkles", color: "#a765ff" },
];

export const members = [];

export const taskTabs = [
  { id: "all", label: "Tất cả" },
  { id: "team", label: "Nhiệm vụ nhóm" },
  { id: "event", label: "Sự kiện CLB" },
  { id: "personal", label: "Nhiệm vụ cá nhân" },
];

export const tasks = [
  {
    id: "presentation-workshop",
    category: "event",
    name: "Workshop: Kỹ năng thuyết trình",
    type: "Sự kiện CLB",
    description: "Tham gia workshop và hoàn thành bài tập thực hành",
    reward: 500,
    xp: 100,
    status: "Tham gia",
    deadlineLabel: "Hạn chót",
    deadline: "25/05/2024",
    icon: "sparkles",
    color: "#a45cff",
  },
  {
    id: "study-app",
    category: "team",
    name: "Dự án nhóm: Ứng dụng học tập",
    type: "Nhiệm vụ nhóm",
    description: "Phát triển prototype và trình bày ý tưởng",
    reward: 800,
    xp: 150,
    status: "Đang thực hiện",
    deadlineLabel: "Hạn chót",
    deadline: "30/05/2024",
    progress: 60,
    icon: "clipboard",
    color: "#5d8cff",
  },
  {
    id: "volunteer",
    category: "event",
    name: "Hoạt động: Tình nguyện cuối tuần",
    type: "Sự kiện CLB",
    description: "Tham gia hoạt động tình nguyện tại mái ấm",
    reward: 300,
    xp: 50,
    status: "Sắp diễn ra",
    deadlineLabel: "Thời gian",
    deadline: "26/05/2024",
    icon: "award",
    color: "#f6b84d",
  },
  {
    id: "weekly-report",
    category: "team",
    name: "Báo cáo tuần",
    type: "Nhiệm vụ nhóm",
    description: "Nộp báo cáo hoạt động của nhóm trong tuần",
    reward: 200,
    xp: 30,
    status: "Sắp đến hạn",
    deadlineLabel: "Hạn chót",
    deadline: "22/05/2024",
    icon: "heart",
    color: "#ff6f7d",
  },
];

export const demoNotifications = [
  "Chào mừng bạn đến với hệ thống Coffee Shop!"
];
