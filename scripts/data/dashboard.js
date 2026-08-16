export const navigationItems = [
  { id: "overview", label: "Tổng quan", icon: "grid" },
  { id: "groups", label: "Nhóm của tôi", icon: "users" },
  { id: "missions", label: "Nhiệm vụ & Sự kiện", icon: "calendarCheck" },
  { id: "market", label: "Thị trường tài nguyên", icon: "rocket" },
  { id: "ranking", label: "Bảng xếp hạng", icon: "award" },
  { id: "transactions", label: "Lịch sử giao dịch", icon: "wallet" },
  { id: "notifications", label: "Thông báo", icon: "bell" },
  { id: "help", label: "Hướng dẫn", icon: "helpCircle" },
];

export const currentUser = {
  name: "Nguyễn Minh Anh",
  initials: "MA",
  role: "Quản trị viên",
  colors: ["#8f765f", "#283756"],
};

export const club = {
  name: "TechNova",
  code: "Nhóm 03",
  status: "Đang hoạt động",
  slogan: "Innovate Today, Lead Tomorrow",
  field: "Công nghệ · Giáo dục",
  level: "Lv. 4 · Startup tiềm năng",
  xp: 750,
  xpTarget: 1000,
  seasonGoal: "Top 3 bảng xếp hạng chung cuộc",
  memberCount: 7,
  memberLimit: 10,
  foundedAt: "01/06/2024",
  startingFund: 1000,
};

export const finance = {
  currentFund: 12450,
  change: 2150,
  changePercent: 20,
  weeklyFlow: 1250,
  income: 3200,
  expense: 1950,
  updatedAt: "10:30 · 20/05/2024",
};

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
  "Nhóm TechNova vừa nhận thêm 100 XP.",
  "Nhiệm vụ Báo cáo tuần sắp đến hạn.",
  "Workshop Kỹ năng thuyết trình đã mở đăng ký.",
];
