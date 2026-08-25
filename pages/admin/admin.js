import { supabase } from "../../scripts/supabase/supabase.js";
import { isAdminAuthenticated, logoutAdmin } from "../../scripts/services/authService.js";
import { getCafeWeekKey, getNextCafeWeekStart } from "../../scripts/utils/cafeWeek.js?v=cafe-cycle";
import { adminLoginUrl } from "./adminRoutes.js";

document.addEventListener("DOMContentLoaded", async function () {
    if (!isAdminAuthenticated()) {
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
    document.querySelectorAll(".admin-sidebar .nav-link").forEach((link) => link.addEventListener("click", closeSidebar));

    // Lấy dữ liệu team từ Supabase
    async function getTeams() {
        const { data, error } = await supabase.from("teams").select("*").order("points", { ascending: false });
        if (error) {
            console.error("Lỗi khi lấy dữ liệu team:", error);
            return [];
        }
        // Đổi tên cột 'points' thành 'pts' để tương thích với code hiện tại
        return data.map((team) => ({ ...team, pts: team.points }));
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

    const addPointsBtn = document.getElementById("addPointsBtn");
    if (addPointsBtn)
        addPointsBtn.addEventListener("click", async function () {
            const teamId = document.getElementById("teamSelect").value;
            const pointsToAdd = parseInt(document.getElementById("pointsToAdd").value, 10);
            const addPointsBtn = this;

            if (!teamId || isNaN(pointsToAdd)) {
                alert("Vui lòng chọn đội và nhập số coin hợp lệ.");
                return;
            }

            addPointsBtn.disabled = true;
            addPointsBtn.textContent = "Đang cập nhật...";

            // Gọi RPC function để cập nhật điểm (an toàn hơn)
            // Giả sử bạn có một function `add_points_to_team(team_id_in text, points_to_add integer)`
            const { error } = await supabase.rpc("add_points_to_team", {
                team_id_in: teamId,
                points_to_add: pointsToAdd,
            });

            addPointsBtn.disabled = false;
            addPointsBtn.textContent = "Cộng điểm";

            if (error) {
                console.error("Lỗi khi cập nhật điểm:", error);
                alert(`Đã xảy ra lỗi khi cập nhật điểm: ${error.message}`);
            } else {
                // Tải lại bảng xếp hạng từ database
                await renderLeaderboardAdmin();
                document.getElementById("pointsToAdd").value = "";
                alert(`Đã cộng thành công ${pointsToAdd} điểm.`);
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
                weeklyDeductionStatus.textContent = "Chi phí bắt đầu tính từ ngày mở bán 30/08/2026.";
            }
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
            weeklyDeductionStatus.textContent = wasDeducted
                ? "Đã kết toán tuần cũ và áp dụng 200 coin cố định + 20 coin/nhân viên cho tuần mới."
                : "Chi phí tuần hiện tại đã được áp dụng.";
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
    startWeeklyCountdown();
});
