import { renderDashboard } from "./components/dashboard.js?v=locked-reputation-stat";
import { renderMemberDirectory, renderMemberList } from "./components/memberDirectory.js";
import { renderOrderDetail } from "./components/orders.js?v=weekly-reward-pool";
import { renderSidebar } from "./components/sidebar.js";
import { renderTopbar } from "./components/topbar.js?v=profit-salary";
import { renderWeeklyCostModal } from "./components/weeklyCosts.js?v=profit-salary";
import { renderWeeklyProfitModal } from "./components/weeklyProfit.js?v=profit-salary";
import { club, demoNotifications, orders } from "./data/dashboard.js";
import { loadDashboardData } from "./services/dashboardData.js?v=weekly-reward-pool";
import { closeModal, showModal, showToast } from "./ui/feedback.js";
import { getCafeWeekContext, getNextCafeWeekStart } from "./utils/cafeWeek.js?v=cafe-cycle";
import { escapeHtml } from "./utils/format.js";

const elements = {
  sidebar: document.querySelector("#sidebar"),
  topbar: document.querySelector("#topbar"),
  dashboard: document.querySelector("#dashboard"),
};

const renderApp = () => {
  elements.sidebar.innerHTML = renderSidebar();
  elements.topbar.innerHTML = renderTopbar();
  renderCurrentView();
};

let cafeWeekRefreshTimer;

const scheduleCafeWeekRefresh = () => {
  window.clearTimeout(cafeWeekRefreshTimer);
  const nextWeekStart = getNextCafeWeekStart();
  const delay = Math.max(1000, nextWeekStart.getTime() - Date.now() + 1000);

  cafeWeekRefreshTimer = window.setTimeout(async () => {
    await loadDashboardData();
    renderApp();
    scheduleCafeWeekRefresh();
  }, Math.min(delay, 2_147_000_000));
};

const closeSidebar = () => document.body.classList.remove("sidebar-open");

const updateActiveNavigation = (target) => {
  document.querySelectorAll("[data-nav-id]").forEach((item) => {
    item.classList.toggle("active", item === target);
  });
};

const setPageHeading = (title, subtitle) => {
  document.querySelector(".topbar-title").textContent = title;
  document.querySelector(".topbar-date").textContent = subtitle;
  document.title = `${title} | ${club.name}`;
};

const renderOverviewView = () => {
  elements.dashboard.innerHTML = renderDashboard();
  const weekContext = getCafeWeekContext();
  setPageHeading(weekContext.title, weekContext.subtitle);
  const requestedSection = window.location.hash.slice(1);
  const activeSection = requestedSection === "overview" ? requestedSection : "overview";
  updateActiveNavigation(document.querySelector(`[data-nav-id="${activeSection}"]`));
};

const renderPersonnelView = () => {
  elements.dashboard.innerHTML = renderMemberDirectory();
  setPageHeading("Nhân sự", `Quản lý chi tiết thành viên ${club.name}`);
  updateActiveNavigation(document.querySelector('[data-nav-id="personnel"]'));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const renderCurrentView = () => {
  if (["#personnel", "#member-list", "#member-management"].includes(window.location.hash)) {
    renderPersonnelView();
    return;
  }
  renderOverviewView();
};

const navigateToPersonnel = () => {
  if (window.location.hash !== "#personnel") {
    window.history.pushState({ view: "personnel" }, "", "#personnel");
  }
  renderPersonnelView();
};

const navigateToOverview = (targetHash = "#overview") => {
  window.history.pushState({ view: "overview" }, "", targetHash);
  renderOverviewView();
  const navItem = document.querySelector(`[data-nav-id="${targetHash.slice(1)}"]`);
  if (navItem) updateActiveNavigation(navItem);
  window.requestAnimationFrame(() => document.querySelector(targetHash)?.scrollIntoView({ behavior: "smooth" }));
};

const actionMessages = {
  "edit-club": "Tính năng chỉnh sửa thông tin nhóm đang ở chế độ demo.",
  transactions: "Đã mở khu vực lịch sử giao dịch (demo).",
  "manage-resources": "Khu vực phân bổ tài nguyên sẽ kết nối API ở bước tiếp theo.",
};

const refreshPersonnelDirectory = () => {
  const memberList = document.querySelector("[data-member-list]");
  if (!memberList) return;
  const query = document.querySelector("[data-member-search]")?.value ?? "";
  memberList.innerHTML = renderMemberList({ query });
  const memberCount = memberList.querySelectorAll("[data-member-card]").length;
  const memberLabel = document.querySelector("[data-member-result-count]");
  if (memberLabel) memberLabel.textContent = String(memberCount);
};

const handleAction = (actionElement) => {
  const action = actionElement.dataset.action;
  if (!action) return;

  if (action === "toggle-sidebar") {
    document.body.classList.toggle("sidebar-open");
    return;
  }

  if (action === "close-sidebar") {
    closeSidebar();
    return;
  }

  if (action === "close-modal") {
    closeModal();
    return;
  }

  if (action === "show-notifications") {
    showModal({
      title: "Thông báo mới",
      content: `<ul class="modal-list">${demoNotifications.map((item) => `<li>${item}</li>`).join("")}</ul>`,
    });
    return;
  }

  if (action === "weekly-costs") {
    showModal({
      title: "Chi tiết chi phí hàng tuần",
      content: renderWeeklyCostModal(),
    });
    return;
  }

  if (action === "weekly-profit") {
    showModal({
      title: "Chi tiết lợi nhuận kết toán",
      content: renderWeeklyProfitModal(),
    });
    return;
  }

  if (action === "show-season" || action === "show-rules") {
    showModal({
      title: "Quy tắc vận hành Cafe Horizon",
      content: "<p>Nhóm cần cân bằng nhân sự, đơn hàng, năng lượng và danh tiếng.</p><p>Hoàn thành nhiệm vụ để nhận coin, kinh nghiệm và cải thiện vị trí xếp hạng.</p>",
    });
    return;
  }

  if (action === "view-order") {
    const order = orders.find((item) => String(item.id) === actionElement.dataset.orderId);
    if (!order) {
      showToast("Không tìm thấy đơn hàng này.");
      return;
    }
    showModal({
      title: `Yêu cầu đơn hàng: ${escapeHtml(order.title)}`,
      content: renderOrderDetail(order),
    });
    return;
  }

  if (action === "order-source") {
    showToast("Nguồn đơn hàng đang dùng liên kết # trong bản demo.");
    return;
  }

  if (action === "all-orders") {
    showToast(`Hiện có ${orders.length} đơn hàng khả dụng.`);
    return;
  }

  if (action === "manage-members") {
    navigateToPersonnel();
    return;
  }

  if (action === "back-overview") {
    navigateToOverview();
    return;
  }

  showToast(actionMessages[action] ?? "Tính năng đang được minh họa trong bản demo.");
};

document.addEventListener("click", (event) => {
  const navItem = event.target.closest("[data-nav-id]");
  if (navItem) {
    updateActiveNavigation(navItem);
    closeSidebar();
    const targetHash = navItem.getAttribute("href");
    if (targetHash === "#personnel") {
      event.preventDefault();
      navigateToPersonnel();
      return;
    }
    if (["#events", "#ranking"].includes(targetHash)) {
      event.preventDefault();
      updateActiveNavigation(document.querySelector('[data-nav-id="overview"]'));
      showToast(`${navItem.textContent.trim()} đang được phát triển.`);
      return;
    }
    const dashboardTargets = new Set(["#overview"]);
    if (document.querySelector(".management-view") && dashboardTargets.has(targetHash)) {
      event.preventDefault();
      navigateToOverview(targetHash);
      return;
    }
    if (!document.querySelector(navItem.getAttribute("href"))) {
      event.preventDefault();
      showToast(`Mục “${navItem.textContent.trim()}” đang được phát triển.`);
    }
    return;
  }

  const developmentFeature = event.target.closest("[data-development-feature]");
  if (developmentFeature) {
    showToast(developmentFeature.dataset.developmentFeature || "Tính năng đang được phát triển.");
    return;
  }

  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  if (actionElement.matches("a")) event.preventDefault();
  if (actionElement.classList.contains("modal-backdrop") && event.target !== actionElement) return;
  handleAction(actionElement);
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-member-search]")) refreshPersonnelDirectory();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
    closeModal();
  }
  if (["Enter", " "].includes(event.key) && event.target.matches("[data-development-feature]")) {
    event.preventDefault();
    showToast(event.target.dataset.developmentFeature || "Tính năng đang được phát triển.");
  }
});

window.addEventListener("popstate", () => {
  if (window.location.hash === "#login") {
    window.history.replaceState({ view: "overview" }, "", "#overview");
  }
  renderCurrentView();
});

if (!window.location.hash || window.location.hash === "#login") {
  window.history.replaceState({ view: "overview" }, "", "#overview");
}

await loadDashboardData();
renderApp();
scheduleCafeWeekRefresh();
