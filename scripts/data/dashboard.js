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

export const currentUser = {
  name: "Quản trị viên",
  initials: "AD",
  role: "Admin hệ thống",
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

export const groups = [
  { id: "cafe-horizon", name: "Cafe Horizon", initials: "CH", code: "Nhóm 03", focus: "Vận hành quán café", balance: 20000, memberCount: 8, colors: ["#b37850", "#6b4934"] },
  { id: "creative-lab", name: "Creative Lab", initials: "CL", code: "Nhóm 01", focus: "Thiết kế & truyền thông", balance: 14600, memberCount: 7, colors: ["#9470a8", "#55426d"] },
  { id: "green-corner", name: "Green Corner", initials: "GC", code: "Nhóm 07", focus: "Môi trường & cộng đồng", balance: 9850, memberCount: 6, colors: ["#729272", "#3f6753"] },
  { id: "nova-makers", name: "Nova Makers", initials: "NM", code: "Nhóm 12", focus: "Công nghệ & sáng tạo", balance: 18200, memberCount: 5, colors: ["#617fa6", "#3d526e"] },
];

export const cafeStats = [
  { id: "staff", label: "Nhân sự", value: "26", total: "/ 32", note: "thành viên · 4 nhóm", meta: [["Đi làm", "24"], ["Vắng mặt", "2"]], icon: "users", color: "#d47b55" },
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
  { id: 1, groupId: "cafe-horizon", name: "Nguyễn Minh Anh", initials: "MA", role: "Trưởng nhóm", colors: ["#936d55", "#2e3b5c"] },
  { id: 2, groupId: "cafe-horizon", name: "Trần Hoàng Nam", initials: "HN", role: "Phó nhóm", colors: ["#66827a", "#293955"] },
  { id: 3, groupId: "cafe-horizon", name: "Lê Minh Châu", initials: "MC", role: "Thành viên", colors: ["#976a79", "#313b62"] },
  { id: 4, groupId: "cafe-horizon", name: "Phạm Gia Bảo", initials: "GB", role: "Thành viên", colors: ["#48778b", "#2a395c"] },
  { id: 5, groupId: "cafe-horizon", name: "Vũ Khánh Linh", initials: "KL", role: "Thành viên", colors: ["#a27565", "#40364f"] },
  { id: 6, groupId: "cafe-horizon", name: "Đỗ Trung Kiên", initials: "TK", role: "Thành viên", colors: ["#65799b", "#2d3857"] },
  { id: 7, groupId: "cafe-horizon", name: "Ngô Bảo Trâm", initials: "BT", role: "Thành viên", colors: ["#8a657e", "#333553"] },
  { id: 8, groupId: "cafe-horizon", name: "Hoàng Thu Hà", initials: "TH", role: "Thành viên", colors: ["#bd8d67", "#725647"] },
  { id: 9, groupId: "creative-lab", name: "Phan Đức Anh", initials: "ĐA", role: "Trưởng nhóm", colors: ["#8a6d9d", "#51425f"] },
  { id: 10, groupId: "creative-lab", name: "Nguyễn Thảo Vy", initials: "TV", role: "Phó nhóm", colors: ["#b2788d", "#654457"] },
  { id: 11, groupId: "creative-lab", name: "Bùi Quang Huy", initials: "QH", role: "Thành viên", colors: ["#6e829f", "#41536d"] },
  { id: 12, groupId: "creative-lab", name: "Trịnh Mai Phương", initials: "MP", role: "Thành viên", colors: ["#a8816d", "#665042"] },
  { id: 13, groupId: "creative-lab", name: "Lâm Gia Hân", initials: "GH", role: "Thành viên", colors: ["#9d7187", "#5d4354"] },
  { id: 14, groupId: "creative-lab", name: "Võ Thành Đạt", initials: "TĐ", role: "Thành viên", colors: ["#627f91", "#3d5668"] },
  { id: 15, groupId: "creative-lab", name: "Đặng Khánh Ngọc", initials: "KN", role: "Thành viên", colors: ["#9b7868", "#5e493f"] },
  { id: 16, groupId: "green-corner", name: "Lý Minh Khang", initials: "MK", role: "Trưởng nhóm", colors: ["#6a8b74", "#3f5f4e"] },
  { id: 17, groupId: "green-corner", name: "Phạm Tú Anh", initials: "TA", role: "Phó nhóm", colors: ["#7e9670", "#536546"] },
  { id: 18, groupId: "green-corner", name: "Đoàn Nhật Linh", initials: "NL", role: "Thành viên", colors: ["#729191", "#456263"] },
  { id: 19, groupId: "green-corner", name: "Nguyễn Quốc Bảo", initials: "QB", role: "Thành viên", colors: ["#8b815e", "#60583d"] },
  { id: 20, groupId: "green-corner", name: "Hoàng Diệu My", initials: "DM", role: "Thành viên", colors: ["#78947c", "#4d6650"] },
  { id: 21, groupId: "green-corner", name: "Trần Đức Long", initials: "ĐL", role: "Thành viên", colors: ["#698786", "#415b5a"] },
  { id: 22, groupId: "nova-makers", name: "Đinh Hải Yến", initials: "HY", role: "Trưởng nhóm", colors: ["#6a7fa0", "#3e506f"] },
  { id: 23, groupId: "nova-makers", name: "Tạ Minh Quân", initials: "MQ", role: "Phó nhóm", colors: ["#5d829a", "#38566a"] },
  { id: 24, groupId: "nova-makers", name: "Vương Hà Chi", initials: "HC", role: "Thành viên", colors: ["#7c739a", "#4b4567"] },
  { id: 25, groupId: "nova-makers", name: "Lê Tuấn Vũ", initials: "TV", role: "Thành viên", colors: ["#637b93", "#3c5269"] },
  { id: 26, groupId: "nova-makers", name: "Nguyễn Ngọc Ánh", initials: "NA", role: "Thành viên", colors: ["#887297", "#554561"] },
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
