export const navigationItems = [
  { id: "overview", label: "Tổng quan", icon: "home" },
  { id: "operations", label: "Vận hành quán", icon: "coffee" },
  { id: "personnel", label: "Nhân sự", icon: "users" },
  { id: "missions", label: "Nhiệm vụ", icon: "target" },
  { id: "events", label: "Sự kiện", icon: "calendarCheck" },
  { id: "upgrades", label: "Nâng cấp quán", icon: "store" },
  { id: "finance", label: "Quản lý coin", icon: "wallet" },
  { id: "ranking", label: "Bảng xếp hạng", icon: "award" },
  { id: "weekly-report", label: "Báo cáo tuần", icon: "fileText" },
];

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

export const groups = [
  { id: "cafe-horizon", name: "Cafe Horizon", initials: "CH", code: "Nhóm 03", focus: "Vận hành quán café", balance: 20000, memberCount: 8, colors: ["#b37850", "#6b4934"] },
  { id: "creative-lab", name: "Creative Lab", initials: "CL", code: "Nhóm 01", focus: "Thiết kế & truyền thông", balance: 14600, memberCount: 7, colors: ["#9470a8", "#55426d"] },
  { id: "green-corner", name: "Green Corner", initials: "GC", code: "Nhóm 07", focus: "Môi trường & cộng đồng", balance: 9850, memberCount: 6, colors: ["#729272", "#3f6753"] },
  { id: "nova-makers", name: "Nova Makers", initials: "NM", code: "Nhóm 12", focus: "Công nghệ & sáng tạo", balance: 18200, memberCount: 5, colors: ["#617fa6", "#3d526e"] },
];

export const cafeStats = [
  { id: "staff", label: "Nhân sự", value: "8", total: "/ 10", note: "nhân viên", meta: [["Đi làm", "7"], ["Vắng mặt", "1"]], icon: "users", color: "#d47b55" },
  { id: "orders", label: "Đơn hàng tuần", value: "23", total: "", note: "hoàn thành", meta: [["Hoàn thành", "23"], ["Đang xử lý", "4"]], icon: "receipt", color: "#6ca65d" },
  { id: "energy", label: "Năng lượng nhóm", value: "82", total: "/ 100", note: "Nhiệt huyết", progress: 82, icon: "zap", color: "#e5a13c" },
  { id: "reputation", label: "Danh tiếng", value: "740", total: "/ 1000", note: "Danh tiếng quán", progress: 74, icon: "star", color: "#8c68c5" },
];

export const weeklyCoinSummary = {
  totalIncome: 12850,
  totalExpense: 7650,
  totalProfit: 5200,
};

export const transactionLogs = [
  { id: 1, type: "adjustment", title: "Admin cộng coin", group: "Creative Lab", amount: 500, date: "Hôm nay", time: "10:32", icon: "wallet" },
  { id: 2, type: "income", title: "Hoàn thành Workshop AI", group: "Cafe Horizon", amount: 800, date: "Hôm nay", time: "09:15", icon: "trendingUp" },
  { id: 3, type: "expense", title: "Chi phí nguyên liệu tuần", group: "Cafe Horizon", amount: -350, date: "Hôm qua", time: "16:40", icon: "arrowDown" },
  { id: 4, type: "income", title: "Thưởng Hackathon 48h", group: "Nova Makers", amount: 1200, date: "Hôm qua", time: "14:10", icon: "trophy" },
  { id: 5, type: "expense", title: "Chi phí sự kiện cộng đồng", group: "Green Corner", amount: -300, date: "19/08", time: "11:25", icon: "receipt" },
  { id: 6, type: "adjustment", title: "Admin trừ coin", group: "Cafe Horizon", amount: -200, date: "19/08", time: "08:45", icon: "wallet" },
];

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
  { id: 1, name: "Nguyễn Minh Anh", initials: "MA", role: "Trưởng nhóm", colors: ["#936d55", "#2e3b5c"] },
  { id: 2, name: "Trần Hoàng Nam", initials: "HN", role: "Phó nhóm", colors: ["#66827a", "#293955"] },
  { id: 3, name: "Lê Minh Châu", initials: "MC", role: "Thành viên", colors: ["#976a79", "#313b62"] },
  { id: 4, name: "Phạm Gia Bảo", initials: "GB", role: "Thành viên", colors: ["#48778b", "#2a395c"] },
  { id: 5, name: "Vũ Khánh Linh", initials: "KL", role: "Thành viên", colors: ["#a27565", "#40364f"] },
  { id: 6, name: "Đỗ Trung Kiên", initials: "TK", role: "Thành viên", colors: ["#65799b", "#2d3857"] },
  { id: 7, name: "Ngô Bảo Trâm", initials: "BT", role: "Thành viên", colors: ["#8a657e", "#333553"] },
  { id: 8, name: "Hoàng Thu Hà", initials: "TH", role: "Thành viên", colors: ["#bd8d67", "#725647"] },
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
