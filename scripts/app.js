import { renderDashboard } from "./components/dashboard.js";
import { renderContributionRows, renderMemberDetail, renderMemberManagement } from "./components/memberManagement.js";
import { renderSidebar } from "./components/sidebar.js";
import { renderTopbar } from "./components/topbar.js";
import { demoNotifications, members } from "./data/dashboard.js";
import { closeModal, showModal, showToast } from "./ui/feedback.js";

const elements = {
  sidebar: document.querySelector("#sidebar"),
  topbar: document.querySelector("#topbar"),
  dashboard: document.querySelector("#dashboard"),
  modalRoot: document.querySelector("#modal-root"),
};

const renderApp = () => {
  elements.sidebar.innerHTML = renderSidebar();
  elements.topbar.innerHTML = renderTopbar();
  renderCurrentView();
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
  document.title = `${title} | Cafe Horizon`;
};

const renderOverviewView = () => {
  elements.dashboard.innerHTML = renderDashboard();
  setPageHeading("Tuần 18", "Ngày 3 / 7 · Mùa xuân 2024");
};

const renderManagementView = () => {
  elements.dashboard.innerHTML = renderMemberManagement();
  setPageHeading("Nhân sự", "Theo dõi đóng góp tuần này");
  updateActiveNavigation(document.querySelector('[data-nav-id="groups"]'));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const renderCurrentView = () => {
  if (window.location.hash === "#member-management") {
    renderManagementView();
    return;
  }
  renderOverviewView();
};

const navigateToManagement = () => {
  if (window.location.hash !== "#member-management") {
    window.history.pushState({ view: "member-management" }, "", "#member-management");
  }
  renderManagementView();
};

const navigateToOverview = (targetHash = "#groups") => {
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
  "add-member": "Đã tạo lời mời thành viên mẫu.",
  "all-tasks": "Bạn đang xem toàn bộ nhiệm vụ hiện có.",
};

const refreshContributionRows = () => {
  const rowsContainer = document.querySelector("[data-contribution-rows]");
  if (!rowsContainer) return;

  const query = document.querySelector("[data-member-search]")?.value ?? "";
  const sortBy = document.querySelector("[data-member-sort]")?.value ?? "contribution";
  rowsContainer.innerHTML = renderContributionRows({ query, sortBy });
  const resultCount = rowsContainer.querySelectorAll("[data-member-row]").length;
  const resultLabel = document.querySelector("[data-member-result-count]");
  if (resultLabel) resultLabel.textContent = String(resultCount);
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

  if (action === "show-profile") {
    showModal({
      title: "Tài khoản cá nhân",
      content: "<p>TechNova · Quản lý nhóm</p><p>Tài khoản đang quản lý Cafe Horizon. Thông tin hiện dùng dữ liệu minh họa.</p>",
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

  if (action === "manage-members") {
    navigateToManagement();
    return;
  }

  if (action === "back-overview") {
    navigateToOverview();
    return;
  }

  if (action === "export-contributions") {
    showToast("Đã chuẩn bị báo cáo đóng góp tuần (dữ liệu demo).");
    return;
  }

  if (action === "member-details") {
    const member = members.find((item) => item.id === Number(actionElement.dataset.memberId));
    if (!member) return;
    showModal({ title: "Chi tiết đóng góp", content: renderMemberDetail(member) });
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
    const dashboardTargets = new Set(["#overview", "#groups", "#missions"]);
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

  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;

  if (actionElement.classList.contains("modal-backdrop") && event.target !== actionElement) return;
  handleAction(actionElement);
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-member-search]")) refreshContributionRows();
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-member-sort]")) refreshContributionRows();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
    closeModal();
  }
});

window.addEventListener("popstate", renderCurrentView);

renderApp();
