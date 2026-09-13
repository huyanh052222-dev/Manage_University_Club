import { supabase } from "../../scripts/supabase/supabase.js";
import { isAdminAuthenticated, logoutAdmin } from "../../scripts/services/authService.js";
import {
    MAX_CAFE_REPUTATION,
    MIN_CAFE_REPUTATION,
    getRegularOrderReward,
    getWeeklyOrderRewardPool,
} from "../../scripts/services/weeklyOrders.js?v=reputation-rewards";
import { getCafeWeekKey, getNextCafeWeekStart } from "../../scripts/utils/cafeWeek.js?v=monday-cycle";
import { resolveCafeName } from "../../scripts/utils/cafeNames.js?v=the-vortex-the-ora";
import { escapeHtml, formatNumber } from "../../scripts/utils/format.js";
import { adminLoginUrl } from "./adminRoutes.js";

document.addEventListener("DOMContentLoaded", async function () {
    if (!(await isAdminAuthenticated())) {
        window.location.replace(adminLoginUrl);
        return;
    }

    const menuButton = document.getElementById("adminMenuButton");
    const sidebarOverlay = document.getElementById("adminSidebarOverlay");
    const closeSidebar = () => {
        document.body.classList.remove("admin-sidebar-open");
        menuButton?.setAttribute("aria-expanded", "false");
    };
    const toggleSidebar = () => {
        const isOpen = document.body.classList.toggle("admin-sidebar-open");
        menuButton?.setAttribute("aria-expanded", String(isOpen));
    };

    menuButton?.addEventListener("click", toggleSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);

    const adminNavLinks = [...document.querySelectorAll(".admin-sidebar .nav-link[data-tab-target]")];
    const adminTabPanes = [...document.querySelectorAll(".tab-pane")];
    const activateAdminTab = (tabId, { updateHistory = true } = {}) => {
        const resolvedTabId = adminTabPanes.some((pane) => pane.id === tabId)
            ? tabId
            : "leaderboard-management";

        adminNavLinks.forEach((link) => {
            const isActive = link.dataset.tabTarget === resolvedTabId;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
        adminTabPanes.forEach((pane) => {
            pane.hidden = pane.id !== resolvedTabId;
        });

        if (updateHistory && window.location.hash !== `#${resolvedTabId}`) {
            window.history.replaceState({ adminTab: resolvedTabId }, "", `#${resolvedTabId}`);
        }
        closeSidebar();
    };

    adminNavLinks.forEach((link) => link.addEventListener("click", (event) => {
        event.preventDefault();
        activateAdminTab(link.dataset.tabTarget);
    }));
    activateAdminTab(window.location.hash.slice(1), { updateHistory: false });

    // Lấy dữ liệu team từ Supabase
    async function getTeams() {
        const { data, error } = await supabase.from("teams").select("*").order("points", { ascending: false });
        if (error) {
            console.error("Lỗi khi lấy dữ liệu team:", error);
            return [];
        }
        // Đổi tên cột 'points' thành 'pts' để tương thích với code hiện tại
        return data.map((team) => ({ ...team, name: resolveCafeName(team), pts: team.points }));
    }

    async function renderLeaderboardAdmin() {
        const teams = await getTeams();
        const leaderboardContainer = document.getElementById("leaderboard-admin");
        const teamSelect = document.getElementById("teamSelect");

        if (!leaderboardContainer || !teamSelect) return;

        leaderboardContainer.className = "leaderboard-box";
        const leaderboardList = leaderboardContainer.querySelector(".lb-list");
        if (!leaderboardList) return;

        // Dữ liệu đã được sắp xếp từ câu query
        // teams.sort((a, b) => b.pts - a.pts);

        leaderboardList.innerHTML = teams
            .map((team, index) => {
                const maxPts = teams.length > 0 && teams[0].pts > 0 ? teams[0].pts : 1; // Tránh chia cho 0
                const barWidth = Math.round((team.pts / maxPts) * 100);
                const rankClass = index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "";
                const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1;

                return `
            <div class="lb-row">
                <div class="lb-rank ${rankClass}">${rankIcon}</div>
                <div class="lb-team">
                    <div class="lb-avatar" style="background-color: ${team.bg}; color: ${team.color};">${team.icon || team.name.charAt(0)}</div>
                    <div class="lb-team-name">${team.name}</div>
                </div>
                <div class="lb-pts">${team.pts.toLocaleString("vi-VN")}</div>
            </div>
        `;
            })
            .join("");

        teamSelect.innerHTML = teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("");
    }

    const clampReputation = (value) => Math.min(
        MAX_CAFE_REPUTATION,
        Math.max(MIN_CAFE_REPUTATION, Math.round(Number(value) || MIN_CAFE_REPUTATION)),
    );
    const renderAdminStars = (reputation) => Array.from(
        { length: MAX_CAFE_REPUTATION },
        (_, index) => `<span class="${index < clampReputation(reputation) ? "active" : ""}" aria-hidden="true">★</span>`,
    ).join("");

    let reputationTeams = [];

    function renderSelectedReputation() {
        const teamSelect = document.getElementById("reputationTeamSelect");
        const starContainer = document.getElementById("reputationStars");
        const rewardPreview = document.getElementById("reputationRewardPreview");
        const decreaseButton = document.getElementById("decreaseReputationBtn");
        const increaseButton = document.getElementById("increaseReputationBtn");
        const team = reputationTeams.find((item) => String(item.id) === teamSelect?.value);

        if (!starContainer || !rewardPreview) return;
        if (!team) {
            starContainer.textContent = "Chưa có dữ liệu";
            starContainer.setAttribute("aria-label", "Chưa có dữ liệu uy tín");
            rewardPreview.innerHTML = "";
            if (decreaseButton) decreaseButton.disabled = true;
            if (increaseButton) increaseButton.disabled = true;
            return;
        }

        const reputation = clampReputation(team.reputation);
        const weeklyPool = getWeeklyOrderRewardPool(reputation);
        const regularOrderReward = getRegularOrderReward(reputation);
        starContainer.innerHTML = renderAdminStars(reputation);
        starContainer.setAttribute("aria-label", `${reputation} trên ${MAX_CAFE_REPUTATION} sao`);
        rewardPreview.innerHTML = `
            <div><span>Doanh thu tối đa / 10 đơn thường</span><strong>${formatNumber(weeklyPool)} coin</strong></div>
            <div><span>Thưởng mỗi đơn thường</span><strong>${formatNumber(regularOrderReward)} coin</strong></div>
        `;
        if (decreaseButton) decreaseButton.disabled = reputation <= MIN_CAFE_REPUTATION;
        if (increaseButton) increaseButton.disabled = reputation >= MAX_CAFE_REPUTATION;
    }

    async function renderReputationAdmin(preferredTeamId = "") {
        const teamSelect = document.getElementById("reputationTeamSelect");
        const reputationList = document.getElementById("reputationAdminList");
        if (!teamSelect || !reputationList) return;

        reputationTeams = await getTeams();
        if (!reputationTeams.length) {
            teamSelect.innerHTML = "";
            reputationList.innerHTML = '<p class="reputation-empty">Chưa tải được danh sách quán.</p>';
            renderSelectedReputation();
            return;
        }

        const preferredId = String(preferredTeamId);
        const currentId = String(teamSelect.value);
        const selectedTeamId = reputationTeams.some((team) => String(team.id) === preferredId)
            ? preferredId
            : reputationTeams.some((team) => String(team.id) === currentId)
                ? currentId
                : String(reputationTeams[0].id);
        teamSelect.innerHTML = reputationTeams
            .map((team) => `<option value="${escapeHtml(team.id)}">${escapeHtml(team.name)}</option>`)
            .join("");
        teamSelect.value = selectedTeamId;

        reputationList.innerHTML = reputationTeams.map((team) => {
            const reputation = clampReputation(team.reputation);
            return `
                <div class="reputation-list-row">
                    <div class="reputation-list-team">
                        <span class="lb-avatar" style="background-color:${escapeHtml(team.bg || "#f4ece2")};color:${escapeHtml(team.color || "#76533c")}">${escapeHtml(team.icon || team.name.charAt(0))}</span>
                        <strong>${escapeHtml(team.name)}</strong>
                    </div>
                    <span class="reputation-list-stars" aria-label="${reputation} sao">${renderAdminStars(reputation)}</span>
                    <span class="reputation-list-reward"><strong>${formatNumber(getRegularOrderReward(reputation))} coin/đơn</strong>${formatNumber(getWeeklyOrderRewardPool(reputation))} coin/10 đơn</span>
                </div>
            `;
        }).join("");

        renderSelectedReputation();
    }

    async function changeSelectedReputation(step, button) {
        const teamSelect = document.getElementById("reputationTeamSelect");
        const team = reputationTeams.find((item) => String(item.id) === teamSelect?.value);
        if (!team) return;

        const currentReputation = clampReputation(team.reputation);
        const nextReputation = clampReputation(currentReputation + step);
        if (nextReputation === currentReputation) return;

        const originalContent = button.innerHTML;
        const reputationButtons = [
            document.getElementById("decreaseReputationBtn"),
            document.getElementById("increaseReputationBtn"),
        ].filter(Boolean);
        reputationButtons.forEach((item) => { item.disabled = true; });
        button.innerHTML = '<span class="button-spinner" role="status" aria-hidden="true"></span> Đang lưu...';

        const { data, error } = await supabase.rpc("update_team_reputation", {
            team_id_in: team.id,
            reputation_in: nextReputation,
        });

        button.innerHTML = originalContent;
        if (error) {
            renderSelectedReputation();
            console.error("Lỗi khi cập nhật sao:", error);
            alert(`Không thể cập nhật sao: ${error.message}`);
            return;
        }

        await renderReputationAdmin(team.id);
        alert(`Đã cập nhật ${team.name} thành ${Number(data) || nextReputation} sao.`);
    }

    document.getElementById("reputationTeamSelect")?.addEventListener("change", renderSelectedReputation);
    document.getElementById("decreaseReputationBtn")?.addEventListener("click", function () {
        void changeSelectedReputation(-1, this);
    });
    document.getElementById("increaseReputationBtn")?.addEventListener("click", function () {
        void changeSelectedReputation(1, this);
    });

    const addPointsBtn = document.getElementById("addPointsBtn");
    if (addPointsBtn)
        addPointsBtn.addEventListener("click", async function () {
            const teamSelect = document.getElementById("teamSelect");
            const pointsInput = document.getElementById("pointsToAdd");
            const reasonInput = document.getElementById("pointsReason");
            const teamId = teamSelect?.value;
            const pointsToAdd = Number(pointsInput?.value);
            const reason = reasonInput?.value.trim() || "";
            const addPointsBtn = this;

            if (!teamId || !Number.isInteger(pointsToAdd) || pointsToAdd === 0) {
                alert("Vui lòng chọn đội và nhập số coin hợp lệ.");
                return;
            }

            if (!reason) {
                alert("Vui lòng nhập lý do cộng hoặc trừ coin.");
                reasonInput?.focus();
                return;
            }

            if (reason.length > 200) {
                alert("Lý do không được dài quá 200 ký tự.");
                reasonInput?.focus();
                return;
            }

            addPointsBtn.disabled = true;
            addPointsBtn.textContent = "Đang cập nhật...";

            // RPC cập nhật số dư và ghi lý do vào sổ cái trong cùng một transaction.
            const { error } = await supabase.rpc("add_points_to_team", {
                team_id_in: teamId,
                points_to_add: pointsToAdd,
                reason_in: reason,
            });

            addPointsBtn.disabled = false;
            addPointsBtn.textContent = "Cộng coin";

            if (error) {
                console.error("Lỗi khi cập nhật coin:", error);
                alert(`Đã xảy ra lỗi khi cập nhật coin: ${error.message}`);
            } else {
                // Tải lại bảng xếp hạng từ database
                await renderLeaderboardAdmin();
                pointsInput.value = "";
                reasonInput.value = "";
                const action = pointsToAdd > 0 ? "cộng" : "trừ";
                alert(`Đã ${action} thành công ${Math.abs(pointsToAdd).toLocaleString("vi-VN")} coin.`);
            }
        });

    // --- XỬ LÝ ĐĂNG XUẤT ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = `<span class="button-spinner" role="status" aria-hidden="true"></span> Đang xuất...`;

            await logoutAdmin();
            window.location.replace(adminLoginUrl);
        });
    }

    const weeklyCountdown = document.getElementById("weeklyCountdown");
    const weeklyDeductionStatus = document.getElementById("weeklyDeductionStatus");
    const weeklyCountdownPanel = document.querySelector(".weekly-countdown");
    const weeklyBaseCost = 200;
    const countdownVisibilityWindow = 2 * 24 * 60 * 60 * 1000;
    let countdownTimer;
    let currentWeekKey = getCafeWeekKey();
    let countdownTarget = getNextCafeWeekStart();

    const getPreviousDateKey = (dateKey) => {
        const date = new Date(`${dateKey}T00:00:00`);
        date.setDate(date.getDate() - 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    async function hasLegacySundayMarker(weekKey) {
        const legacySundayKey = getPreviousDateKey(weekKey);
        const { data, error } = await supabase
            .from("weekly_coin_deductions")
            .select("week_key")
            .eq("week_key", legacySundayKey)
            .maybeSingle();

        if (error) {
            console.error("Không thể kiểm tra mốc tuần cũ:", error);
            return null;
        }

        return Boolean(data);
    }

    function updateCountdown() {
        const remaining = countdownTarget.getTime() - Date.now();
        const shouldShow = remaining > 0 && remaining <= countdownVisibilityWindow;
        if (weeklyCountdownPanel) weeklyCountdownPanel.hidden = !shouldShow;
        if (!shouldShow) return;

        const totalSeconds = Math.floor(remaining / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const countdownParts = [days > 0 ? `${days} ngày` : "", hours > 0 ? `${hours} giờ` : "", minutes > 0 ? `${minutes} phút` : "", seconds > 0 ? `${seconds} giây` : ""].filter(Boolean);

        if (countdownParts.length === 0) {
            weeklyCountdownPanel.hidden = true;
            return;
        }

        weeklyCountdown.textContent = countdownParts.join(" ");
    }

    async function deductWeeklyCoins() {
        const weekKey = getCafeWeekKey();
        if (!weekKey) {
            if (weeklyDeductionStatus) {
                weeklyDeductionStatus.textContent = "Kỳ doanh thu và chi phí bắt đầu từ Thứ Hai 31/08/2026.";
            }
            return false;
        }

        const legacySundayMarker = await hasLegacySundayMarker(weekKey);
        if (legacySundayMarker !== false) {
            if (weeklyDeductionStatus) {
                weeklyDeductionStatus.textContent = legacySundayMarker
                    ? "Đã phát hiện chu kỳ Chủ nhật cũ. Hãy chạy monday_revenue_cycle.sql trước để tránh trừ coin hai lần."
                    : "Không thể kiểm tra chu kỳ database nên đã dừng kết toán để bảo vệ số dư.";
            }
            console.warn("Đã dừng kết toán tự động vì chưa xác nhận được chu kỳ Thứ Hai an toàn.");
            return false;
        }

        const { data: wasDeducted, error } = await supabase.rpc("deduct_weekly_coins", {
            deduction_amount: weeklyBaseCost,
            week_key: weekKey,
        });

        if (error) {
            console.error("Lỗi khi kết toán tuần:", error);
            if (weeklyDeductionStatus) weeklyDeductionStatus.textContent = "Chưa thể kết toán tuần.";
            return false;
        }

        if (weeklyDeductionStatus) {
            weeklyDeductionStatus.textContent = wasDeducted ? "Đã kết toán tuần cũ và áp dụng 200 coin cố định + 20 coin/nhân viên cho tuần mới." : "Chi phí tuần hiện tại đã được áp dụng.";
        }
        await renderLeaderboardAdmin();
        return wasDeducted;
    }

    function startWeeklyCountdown() {
        updateCountdown();
        countdownTimer = window.setInterval(updateCountdown, 1000);
        window.setInterval(async () => {
            const weekKey = getCafeWeekKey();
            if (weekKey !== currentWeekKey) {
                currentWeekKey = weekKey;
                await deductWeeklyCoins();
                countdownTarget = getNextCafeWeekStart();
                updateCountdown();
            }
        }, 30000);
    }

    // Khởi tạo bảng và bộ đếm tuần.
    await deductWeeklyCoins();
    await renderLeaderboardAdmin();
    await renderReputationAdmin();
    startWeeklyCountdown();
});
