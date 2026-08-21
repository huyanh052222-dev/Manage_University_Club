import { renderDashboard } from "./components/dashboard.js";
import { renderCoinManagement } from "./components/coinManagement.js";
import { renderMemberCards, renderMemberDirectory } from "./components/memberDirectory.js";
import { renderSidebar } from "./components/sidebar.js";
import { renderTopbar } from "./components/topbar.js";
import { demoNotifications } from "./data/dashboard.js";
import { adjustGroupCoins, getGroup, getGroups } from "./services/coinLedger.js";
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
  elements.dashboard.innerHTML = renderMemberDirectory();
  setPageHeading("Nhân sự", "Danh sách thành viên trong nhóm");
  updateActiveNavigation(document.querySelector('[data-nav-id="groups"]'));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const renderCurrentView = () => {
  if (["#member-list", "#member-management"].includes(window.location.hash)) {
    renderManagementView();
    return;
  }
  renderOverviewView();
};

const navigateToManagement = () => {
  if (window.location.hash !== "#member-list") {
    window.history.pushState({ view: "member-list" }, "", "#member-list");
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
  "all-tasks": "Bạn đang xem toàn bộ nhiệm vụ hiện có.",
};

const refreshMemberCards = () => {
  const cardsContainer = document.querySelector("[data-member-cards]");
  if (!cardsContainer) return;
  const query = document.querySelector("[data-member-search]")?.value ?? "";
  cardsContainer.innerHTML = renderMemberCards({ query });
  const resultCount = cardsContainer.querySelectorAll("[data-member-card]").length;
  const resultLabel = document.querySelector("[data-member-result-count]");
  if (resultLabel) resultLabel.textContent = String(resultCount);
};

const openCoinManagement = () => {
  showModal({ title: "Điều chỉnh coin của nhóm", content: renderCoinManagement(getGroups()) });
};

const refreshSelectedGroupBalance = (groupId) => {
  const group = getGroup(groupId);
  const balance = document.querySelector("[data-coin-balance]");
  if (group && balance) balance.textContent = `${group.balance.toLocaleString("vi-VN")} coin`;
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
      title: "Tài khoản quản trị",
      content: "<p><strong>Quản trị viên · Admin hệ thống</strong></p><p>Đây là tài khoản đăng nhập duy nhất, có quyền điều chỉnh coin của các nhóm. Thành viên chỉ được lưu dưới dạng hồ sơ hiển thị.</p>",
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

  if (action === "manage-group-coins") {
    openCoinManagement();
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
    if (targetHash === "#finance") {
      event.preventDefault();
      openCoinManagement();
      return;
    }
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
  if (event.target.matches("[data-member-search]")) refreshMemberCards();
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-coin-group]")) refreshSelectedGroupBalance(event.target.value);
});

document.addEventListener("submit", (event) => {
  if (!event.target.matches("[data-coin-form]")) return;
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const result = adjustGroupCoins({
    groupId: formData.get("groupId"),
    direction: formData.get("direction"),
    amount: Number(formData.get("amount")),
  });

  const error = form.querySelector("[data-coin-error]");
  if (!result.ok) {
    error.textContent = result.message;
    return;
  }

  elements.topbar.innerHTML = renderTopbar();
  closeModal();
  const verb = result.direction === "add" ? "cộng" : "trừ";
  showToast(`Đã ${verb} ${result.amount.toLocaleString("vi-VN")} coin cho ${result.group.name}. Số dư mới: ${result.group.balance.toLocaleString("vi-VN")} coin.`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
    closeModal();
  }
});

window.addEventListener("popstate", renderCurrentView);

renderApp();
