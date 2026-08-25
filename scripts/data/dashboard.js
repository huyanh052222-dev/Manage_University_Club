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
  foundedAt: "01/06/2024",
  startingFund: 0,
  reputation: 0,
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
  updatedAt: "Chưa có dữ liệu",
};

export const groups = [
  { id: "cafe-horizon", name: "Cafe Horizon", initials: "CH", code: "Nhóm 03", focus: "Vận hành quán café", balance: 20000, memberCount: 8, colors: ["#b37850", "#6b4934"] },
  { id: "creative-lab", name: "Creative Lab", initials: "CL", code: "Nhóm 01", focus: "Thiết kế & truyền thông", balance: 14600, memberCount: 7, colors: ["#9470a8", "#55426d"] },
  { id: "green-corner", name: "Green Corner", initials: "GC", code: "Nhóm 07", focus: "Môi trường & cộng đồng", balance: 9850, memberCount: 6, colors: ["#729272", "#3f6753"] },
  { id: "nova-makers", name: "Nova Makers", initials: "NM", code: "Nhóm 12", focus: "Công nghệ & sáng tạo", balance: 18200, memberCount: 5, colors: ["#617fa6", "#3d526e"] },
];

export const cafeStats = [
  { id: "staff", label: "Nhân sự", value: "0", total: "", note: "nhân viên", meta: [["Đi làm", "0"], ["Vắng mặt", "0"]], icon: "users", color: "#d47b55" },
  { id: "orders", label: "Đơn hàng tuần", value: "0", total: "", note: "hoàn thành", meta: [["Hoàn thành", "0"], ["Đang xử lý", "0"]], icon: "receipt", color: "#6ca65d" },
  { id: "energy", label: "Năng lượng nhóm", value: "0", total: "/ 100", note: "Nhiệt huyết", progress: 0, icon: "zap", color: "#e5a13c" },
  { id: "reputation", label: "Danh tiếng", value: "0", total: "/ 1000", note: "Đang phát triển", progress: 0, icon: "star", color: "#8c68c5", isDeveloping: true },
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
  "Cafe Horizon vừa hoàn thành đơn hàng thứ 23 trong tuần.",
  "Nhiệm vụ Content Social sắp đến hạn.",
  "Doanh thu tuần đã tăng 12% so với tuần trước.",
];
