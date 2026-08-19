export const navigationItems = [
  { id: "overview", label: "Tổng quan", icon: "home" },
  { id: "operations", label: "Vận hành quán", icon: "coffee" },
  { id: "groups", label: "Nhân sự", icon: "users" },
  { id: "missions", label: "Nhiệm vụ", icon: "target" },
  { id: "events", label: "Sự kiện", icon: "calendarCheck" },
  { id: "upgrades", label: "Nâng cấp quán", icon: "store" },
  { id: "finance", label: "Tài chính", icon: "wallet" },
  { id: "ranking", label: "Bảng xếp hạng", icon: "award" },
  { id: "weekly-report", label: "Báo cáo tuần", icon: "fileText" },
];

export const currentUser = {
  name: "TechNova",
  initials: "TN",
  role: "Quản lý nhóm",
  colors: ["#c18a61", "#5b3825"],
};

export const club = {
  name: "Cafe Horizon",
  code: "Quán 03",
  status: "Đang hoạt động",
  slogan: "Cùng nhau tạo nên khoảng trời riêng",
  field: "Quán café của CLB Sinh Viên",
  xp: 2350,
  xpTarget: 3000,
  seasonGoal: "Top 3 quán café sinh viên xuất sắc",
  memberCount: 8,
  memberLimit: 10,
  foundedAt: "01/06/2024",
  startingFund: 20000,
  reputation: 4.5,
  ranking: "#3 / 24",
  satisfaction: 87,
};

export const finance = {
  currentFund: 20000,
  change: 2500,
  changePercent: 12,
  weeklyFlow: 2500,
  income: 5200,
  expense: 2700,
  updatedAt: "09:30 · 19/08/2026",
};

export const cafeStats = [
  { id: "staff", label: "Nhân sự", value: "8", total: "/ 10", note: "nhân viên", meta: [["Đi làm", "7"], ["Vắng mặt", "1"]], icon: "users", color: "#d47b55" },
  { id: "orders", label: "Đơn hàng tuần", value: "23", total: "", note: "hoàn thành", meta: [["Hoàn thành", "23"], ["Đang xử lý", "4"]], icon: "receipt", color: "#6ca65d" },
  { id: "energy", label: "Năng lượng nhóm", value: "82", total: "/ 100", note: "Nhiệt huyết", progress: 82, icon: "zap", color: "#e5a13c" },
  { id: "reputation", label: "Danh tiếng", value: "740", total: "/ 1000", note: "Danh tiếng quán", progress: 74, icon: "star", color: "#8c68c5" },
];

export const weeklyCashFlow = {
  labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  income: [1.2, 3.4, 4.0, 2.5, 5.4, 3.8, 4.0],
  expense: [-0.2, -0.1, -0.4, -3.0, -1.6, -0.9, -1.8],
  profit: [0.5, 1.8, 2.1, 0.2, 2.3, 1.1, 2.0],
  totalIncome: 12850,
  totalExpense: 7650,
  totalProfit: 5200,
};

export const hotTasks = [
  { id: "ai-workshop", title: "[Workshop AI] Xây dựng mô hình ML", description: "Tổ chức workshop cho sinh viên toàn trường", reward: 800, due: "25/08", icon: "calendarCheck", tone: "purple" },
  { id: "hackathon", title: "[Hackathon 48h] Challenge", description: "Tham gia cuộc thi lập trình hackathon", reward: 1200, due: "28/08", icon: "target", tone: "blue" },
  { id: "monthly-report", title: "[Báo cáo tháng 8]", description: "Tổng kết hoạt động và tài chính tháng", reward: 300, due: "30/08", icon: "fileText", tone: "gold" },
  { id: "social-content", title: "[Content Social] Tuần 19", description: "Đăng bài truyền thông cho quán", reward: 200, due: "24/08", icon: "heart", tone: "coral" },
];

export const resources = [
  { id: "people", label: "Nhân lực", value: 7, total: 10, unit: "", icon: "user", color: "#5d8cff" },
  { id: "time", label: "Thời gian", value: 84, total: 100, unit: "giờ", icon: "clock", color: "#40d9c3" },
  { id: "energy", label: "Năng lượng", value: 60, total: 100, unit: "", icon: "zap", color: "#f6c84d" },
  { id: "reputation", label: "Uy tín", value: 320, total: 500, unit: "", icon: "sparkles", color: "#a765ff" },
];

export const members = [
  {
    id: 1, name: "Nguyễn Minh Anh", initials: "MA", role: "Trưởng nhóm", leader: true,
    contribution: 450, activity: 100, tasksCompleted: 12, workHours: 18.5, xp: 720, trend: 18,
    lastContribution: "Báo cáo chiến lược · 2 giờ trước", colors: ["#936d55", "#2e3b5c"],
    breakdown: { missions: 220, events: 110, support: 80, bonus: 40 },
  },
  {
    id: 2, name: "Trần Hoàng Nam", initials: "HN", role: "Phó nhóm",
    contribution: 380, activity: 100, tasksCompleted: 10, workHours: 16, xp: 640, trend: 12,
    lastContribution: "Hỗ trợ prototype · 4 giờ trước", colors: ["#66827a", "#293955"],
    breakdown: { missions: 190, events: 80, support: 90, bonus: 20 },
  },
  {
    id: 3, name: "Lê Minh Châu", initials: "MC", role: "Thành viên",
    contribution: 320, activity: 80, tasksCompleted: 9, workHours: 14.5, xp: 560, trend: 8,
    lastContribution: "Workshop thuyết trình · Hôm qua", colors: ["#976a79", "#313b62"],
    breakdown: { missions: 150, events: 100, support: 50, bonus: 20 },
  },
  {
    id: 4, name: "Phạm Gia Bảo", initials: "GB", role: "Thành viên",
    contribution: 280, activity: 70, tasksCompleted: 7, workHours: 12, xp: 490, trend: 5,
    lastContribution: "Kiểm thử ứng dụng · Hôm qua", colors: ["#48778b", "#2a395c"],
    breakdown: { missions: 150, events: 50, support: 70, bonus: 10 },
  },
  {
    id: 5, name: "Vũ Khánh Linh", initials: "KL", role: "Thành viên",
    contribution: 250, activity: 60, tasksCompleted: 6, workHours: 10.5, xp: 420, trend: -3,
    lastContribution: "Thiết kế slide dự án · 2 ngày trước", colors: ["#a27565", "#40364f"],
    breakdown: { missions: 130, events: 60, support: 50, bonus: 10 },
  },
  {
    id: 6, name: "Đỗ Trung Kiên", initials: "TK", role: "Thành viên",
    contribution: 220, activity: 40, tasksCompleted: 5, workHours: 8, xp: 350, trend: -6,
    lastContribution: "Cập nhật tài liệu · 3 ngày trước", colors: ["#65799b", "#2d3857"],
    breakdown: { missions: 110, events: 40, support: 60, bonus: 10 },
  },
  {
    id: 7, name: "Ngô Bảo Trâm", initials: "BT", role: "Thành viên",
    contribution: 190, activity: 30, tasksCompleted: 4, workHours: 6.5, xp: 290, trend: -10,
    lastContribution: "Điểm danh sự kiện · 4 ngày trước", colors: ["#8a657e", "#333553"],
    breakdown: { missions: 80, events: 60, support: 40, bonus: 10 },
  },
  {
    id: 8, name: "Hoàng Thu Hà", initials: "TH", role: "Thành viên",
    contribution: 160, activity: 65, tasksCompleted: 5, workHours: 7.5, xp: 310, trend: 4,
    lastContribution: "Hỗ trợ ca chiều · Hôm qua", colors: ["#bd8d67", "#725647"],
    breakdown: { missions: 70, events: 30, support: 50, bonus: 10 },
  },
];

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
  "Cafe Horizon vừa hoàn thành đơn hàng thứ 23 trong tuần.",
  "Nhiệm vụ Content Social sắp đến hạn.",
  "Doanh thu tuần đã tăng 12% so với tuần trước.",
];
