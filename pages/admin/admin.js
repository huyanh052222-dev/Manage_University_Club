import { supabase } from "../../scripts/supabase/supabase.js";
import { isAdminAuthenticated, logoutAdmin } from "../../scripts/services/authService.js";
import {
    MAX_CAFE_REPUTATION,
    MIN_CAFE_REPUTATION,
    getRegularOrderReward,
    getWeeklyOrderRewardPool,
} from "../../scripts/services/weeklyOrders.js?v=reputation-rewards";
import { getCafeWeekKey, getCompletedCafeWeeks, getLastCompletedCafeWeek, getNextCafeWeekStart } from "../../scripts/utils/cafeWeek.js?v=monday-cycle";
import { resolveCafeName } from "../../scripts/utils/cafeNames.js?v=the-vortex-the-ora";
import { escapeHtml, formatNumber } from "../../scripts/utils/format.js";
import { getStoredCafeReputation, setStoredCafeReputation } from "../../scripts/utils/reputationStorage.js?v=hardcoded-v1";
import { adminLoginUrl } from "./adminRoutes.js";

const adminPeriodFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const formatCompletedWeek = (completedWeek) => {
    if (!completedWeek) return "kỳ đầu tiên";
    const start = new Date(`${completedWeek.periodStartKey}T00:00:00`);
    const end = new Date(`${completedWeek.periodEndKey}T00:00:00`);
    end.setDate(end.getDate() - 1);
    return `kỳ ${adminPeriodFormatter.format(start)}–${adminPeriodFormatter.format(end)}`;
};

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
        return data.map((team) => ({
            ...team,
            name: resolveCafeName(team),
            pts: team.points,
            reputation: getStoredCafeReputation(team.id, team.reputation),
        }));
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

    function changeSelectedReputation(step) {
        const teamSelect = document.getElementById("reputationTeamSelect");
        const team = reputationTeams.find((item) => String(item.id) === teamSelect?.value);
        if (!team) return;

        const currentReputation = clampReputation(team.reputation);
        const nextReputation = clampReputation(currentReputation + step);
        if (nextReputation === currentReputation) return;

        const reputationButtons = [
            document.getElementById("decreaseReputationBtn"),
            document.getElementById("increaseReputationBtn"),
        ].filter(Boolean);
        reputationButtons.forEach((item) => { item.disabled = true; });
        if (!setStoredCafeReputation(team.id, nextReputation)) {
            renderSelectedReputation();
            alert("Trình duyệt không cho phép lưu số sao cục bộ.");
            return;
        }

        team.reputation = nextReputation;
        renderSelectedReputation();
        void renderReputationAdmin(team.id);
        alert(`Đã cập nhật ${team.name} thành ${nextReputation} sao trên trình duyệt này.`);
    }

    document.getElementById("reputationTeamSelect")?.addEventListener("change", renderSelectedReputation);
    document.getElementById("decreaseReputationBtn")?.addEventListener("click", function () {
        changeSelectedReputation(-1);
    });
    document.getElementById("increaseReputationBtn")?.addEventListener("click", function () {
        changeSelectedReputation(1);
    });

    // --- BỔ SUNG DOANH THU KỲ TRỄ ---
    // Coin mới dùng RPC riêng để tăng số dư một lần. Coin vào đã có chỉ được gán kỳ,
    // nhờ đó ví dụ +103 và +93 có thể đi vào kỳ cũ mà không bị cộng trùng.
    let lateSettlementState = {
        periods: [],
        teams: [],
        settlementTeamIdsByPeriod: new Map(),
        settlementStatusKnown: true,
        selectedPeriodStart: "",
        candidates: [],
        selectedCandidateIds: new Set(),
        candidatesError: "",
    };

    const getLateSettlementPeriod = () => lateSettlementState.periods.find(
        (period) => period.periodStartKey === lateSettlementState.selectedPeriodStart,
    );

    const getLateSettlementTeam = () => {
        const teamId = document.getElementById("lateSettlementTeamSelect")?.value;
        return lateSettlementState.teams.find((team) => String(team.id) === String(teamId));
    };

    const getLateSettlementStatus = (period) => {
        if (!lateSettlementState.settlementStatusKnown) {
            return { label: "Chưa kiểm tra", className: "unknown", detail: "Không đọc được bảng kết toán" };
        }
        const settledTeamCount = lateSettlementState.settlementTeamIdsByPeriod.get(period.periodStartKey)?.size || 0;
        const teamCount = lateSettlementState.teams.length;
        if (teamCount > 0 && settledTeamCount >= teamCount) {
            return { label: "Đã chốt", className: "settled", detail: `Đủ ${settledTeamCount}/${teamCount} quán` };
        }
        return { label: "Cần bổ sung", className: "pending", detail: `${settledTeamCount}/${teamCount || "?"} quán đã chốt` };
    };

    const renderLateSettlementPeriodList = () => {
        const periodList = document.getElementById("lateSettlementPeriodList");
        if (!periodList) return;
        if (!lateSettlementState.periods.length) {
            periodList.innerHTML = '<p class="late-period-empty">Chưa có kỳ doanh thu nào hoàn tất để chỉnh.</p>';
            return;
        }
        periodList.innerHTML = lateSettlementState.periods.map((period) => {
            const status = getLateSettlementStatus(period);
            const selected = period.periodStartKey === lateSettlementState.selectedPeriodStart;
            return `
                <button class="late-period-option${selected ? " selected" : ""}" type="button" data-late-period="${escapeHtml(period.periodStartKey)}" aria-pressed="${selected}">
                    <span class="late-period-copy"><strong>${escapeHtml(formatCompletedWeek(period))}</strong><small>${escapeHtml(status.detail)}</small></span>
                    <span class="late-period-status ${status.className}">${escapeHtml(status.label)}</span>
                </button>
            `;
        }).join("");
    };

    const renderLateSettlementForm = () => {
        const selectedPeriodCopy = document.getElementById("lateSettlementSelectedPeriod");
        const teamSelect = document.getElementById("lateSettlementTeamSelect");
        const applyButton = document.getElementById("applyLateSettlementAdjustmentBtn");
        const selectedPeriod = getLateSettlementPeriod();
        if (!selectedPeriodCopy || !teamSelect || !applyButton) return;

        const previousTeamId = teamSelect.value;
        teamSelect.innerHTML = lateSettlementState.teams.map((team) => (
            `<option value="${escapeHtml(String(team.id))}">${escapeHtml(team.name)}</option>`
        )).join("");
        if (lateSettlementState.teams.some((team) => String(team.id) === previousTeamId)) teamSelect.value = previousTeamId;
        if (!selectedPeriod) {
            selectedPeriodCopy.textContent = "Chưa có kỳ nào có thể chỉnh.";
            teamSelect.disabled = true;
            applyButton.disabled = true;
            return;
        }
        const status = getLateSettlementStatus(selectedPeriod);
        selectedPeriodCopy.textContent = `${formatCompletedWeek(selectedPeriod)} · ${status.label}. Khoản mới sẽ tăng số dư và tính vào kỳ này.`;
        teamSelect.disabled = !lateSettlementState.teams.length;
        applyButton.disabled = !lateSettlementState.teams.length;
    };

    const renderLateSettlementCandidates = () => {
        const candidateList = document.getElementById("lateSettlementCandidateList");
        const totalCopy = document.getElementById("lateSettlementCandidateTotal");
        const assignButton = document.getElementById("assignLateSettlementTransactionsBtn");
        if (!candidateList || !totalCopy || !assignButton) return;

        const selectedCandidates = lateSettlementState.candidates.filter((candidate) => lateSettlementState.selectedCandidateIds.has(candidate.id));
        const selectedAmount = selectedCandidates.reduce((total, candidate) => total + Number(candidate.amount || 0), 0);
        totalCopy.textContent = `${formatNumber(selectedAmount)} coin được chọn`;
        assignButton.disabled = selectedCandidates.length === 0;

        if (lateSettlementState.candidatesError) {
            candidateList.innerHTML = `<p class="late-draft-empty">${escapeHtml(lateSettlementState.candidatesError)}</p>`;
            return;
        }
        if (!lateSettlementState.candidates.length) {
            candidateList.innerHTML = '<p class="late-draft-empty">Không có coin vào chưa gán sau kỳ này.</p>';
            return;
        }
        candidateList.innerHTML = lateSettlementState.candidates.map((candidate) => `
            <label class="late-draft-row late-candidate-row">
                <input type="checkbox" data-late-transaction="${escapeHtml(candidate.id)}" ${lateSettlementState.selectedCandidateIds.has(candidate.id) ? "checked" : ""} />
                <span class="late-draft-copy">
                    <strong>${escapeHtml(candidate.title || "Coin vào")}</strong>
                    <small title="${escapeHtml(candidate.reason || "Chưa ghi lý do")}">${escapeHtml(candidate.reason || "Chưa ghi lý do")}</small>
                </span>
                <strong class="late-draft-amount">+${formatNumber(candidate.amount)} coin</strong>
            </label>
        `).join("");
    };

    async function loadLateSettlementCandidates() {
        const selectedPeriod = getLateSettlementPeriod();
        const team = getLateSettlementTeam();
        lateSettlementState.candidates = [];
        lateSettlementState.selectedCandidateIds = new Set();
        lateSettlementState.candidatesError = "";
        if (!selectedPeriod || !team) return;

        const { data, error } = await supabase
            .from("coin_transactions")
            .select("id, title, reason, amount, occurred_at")
            .eq("team_id", team.id)
            .eq("type", "income")
            .gt("amount", 0)
            .is("settlement_period_start", null)
            .gte("occurred_at", `${selectedPeriod.periodEndKey}T00:00:00+07:00`)
            .order("occurred_at", { ascending: false });
        if (error) {
            console.warn("Không thể tải coin vào để gán kỳ trễ:", error);
            lateSettlementState.candidatesError = "Chưa tải được coin vào. Hãy chạy late_settlement_adjustments.sql trước.";
            return;
        }
        lateSettlementState.candidates = data || [];
    }

    async function renderLateSettlementAdmin() {
        const periods = getCompletedCafeWeeks(new Date(), 8);
        const teams = await getTeams();
        let settlementRows = [];
        let settlementStatusKnown = true;
        if (periods.length) {
            const { data, error } = await supabase
                .from("weekly_financial_settlements")
                .select("team_id, period_start")
                .in("period_start", periods.map((period) => period.periodStartKey));
            if (error) {
                console.warn("Không thể tải trạng thái các kỳ kết toán:", error);
                settlementStatusKnown = false;
            } else {
                settlementRows = data || [];
            }
        }
        const settlementTeamIdsByPeriod = new Map();
        settlementRows.forEach((row) => {
            const periodStart = String(row.period_start || "");
            if (!settlementTeamIdsByPeriod.has(periodStart)) settlementTeamIdsByPeriod.set(periodStart, new Set());
            settlementTeamIdsByPeriod.get(periodStart).add(String(row.team_id));
        });
        lateSettlementState = {
            ...lateSettlementState,
            periods,
            teams,
            settlementTeamIdsByPeriod,
            settlementStatusKnown,
            selectedPeriodStart: periods.some((period) => period.periodStartKey === lateSettlementState.selectedPeriodStart)
                ? lateSettlementState.selectedPeriodStart
                : periods[0]?.periodStartKey || "",
        };
        renderLateSettlementPeriodList();
        renderLateSettlementForm();
        await loadLateSettlementCandidates();
        renderLateSettlementCandidates();
    }

    document.getElementById("lateSettlementPeriodList")?.addEventListener("click", async (event) => {
        const periodButton = event.target.closest("[data-late-period]");
        if (!periodButton) return;
        lateSettlementState.selectedPeriodStart = periodButton.dataset.latePeriod || "";
        renderLateSettlementPeriodList();
        renderLateSettlementForm();
        await loadLateSettlementCandidates();
        renderLateSettlementCandidates();
    });

    document.getElementById("lateSettlementTeamSelect")?.addEventListener("change", async () => {
        await loadLateSettlementCandidates();
        renderLateSettlementCandidates();
    });

    document.getElementById("lateSettlementCandidateList")?.addEventListener("change", (event) => {
        const checkbox = event.target.closest("[data-late-transaction]");
        if (!checkbox) return;
        if (checkbox.checked) lateSettlementState.selectedCandidateIds.add(checkbox.dataset.lateTransaction);
        else lateSettlementState.selectedCandidateIds.delete(checkbox.dataset.lateTransaction);
        renderLateSettlementCandidates();
    });

    document.getElementById("applyLateSettlementAdjustmentBtn")?.addEventListener("click", async function () {
        const selectedPeriod = getLateSettlementPeriod();
        const team = getLateSettlementTeam();
        const amountInput = document.getElementById("lateSettlementAmount");
        const reasonInput = document.getElementById("lateSettlementReason");
        const amount = Number(amountInput?.value);
        const reason = reasonInput?.value.trim() || "";
        if (!selectedPeriod || !team || !Number.isInteger(amount) || amount <= 0) {
            alert("Hãy chọn kỳ, quán và nhập số coin dương hợp lệ.");
            return;
        }
        if (!reason || reason.length > 200) {
            alert("Hãy nhập lý do từ 1 đến 200 ký tự.");
            reasonInput?.focus();
            return;
        }
        if (!window.confirm(`Cộng +${formatNumber(amount)} coin cho ${team.name} và tính vào ${formatCompletedWeek(selectedPeriod)}? Số dư và kết toán sẽ được cập nhật.`)) return;

        this.disabled = true;
        this.textContent = "Đang cập nhật...";
        const { error } = await supabase.rpc("add_points_to_late_settlement", {
            team_id_in: team.id,
            period_start_in: selectedPeriod.periodStartKey,
            points_to_add: amount,
            reason_in: reason,
        });
        this.disabled = false;
        this.innerHTML = '<i class="fa-solid fa-coins"></i> Cộng coin và chốt lại kỳ';
        if (error) {
            console.error("Không thể cộng coin kỳ trễ:", error);
            alert(`Không thể cập nhật kỳ trễ: ${error.message}`);
            return;
        }
        amountInput.value = "";
        reasonInput.value = "";
        await renderLeaderboardAdmin();
        await renderLateSettlementAdmin();
        alert(`Đã cộng +${formatNumber(amount)} coin và tính lại ${formatCompletedWeek(selectedPeriod)}.`);
    });

    document.getElementById("assignLateSettlementTransactionsBtn")?.addEventListener("click", async function () {
        const selectedPeriod = getLateSettlementPeriod();
        const team = getLateSettlementTeam();
        const transactionIds = [...lateSettlementState.selectedCandidateIds];
        const selectedAmount = lateSettlementState.candidates
            .filter((candidate) => lateSettlementState.selectedCandidateIds.has(candidate.id))
            .reduce((total, candidate) => total + Number(candidate.amount || 0), 0);
        if (!selectedPeriod || !team || !transactionIds.length) return;
        if (!window.confirm(`Gán ${formatNumber(selectedAmount)} coin đã có vào ${formatCompletedWeek(selectedPeriod)}? Số dư không thay đổi, chỉ tính lại kết toán.`)) return;

        this.disabled = true;
        this.textContent = "Đang gán kỳ...";
        const { error } = await supabase.rpc("assign_income_transactions_to_late_settlement", {
            team_id_in: team.id,
            period_start_in: selectedPeriod.periodStartKey,
            transaction_ids_in: transactionIds,
        });
        this.disabled = false;
        this.innerHTML = '<i class="fa-solid fa-link"></i> Gán coin đã chọn vào kỳ';
        if (error) {
            console.error("Không thể gán coin vào kỳ trễ:", error);
            alert(`Không thể gán coin vào kỳ trễ: ${error.message}`);
            return;
        }
        await renderLateSettlementAdmin();
        alert(`Đã gán ${formatNumber(selectedAmount)} coin vào ${formatCompletedWeek(selectedPeriod)} và tính lại lợi nhuận.`);
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
        const completedWeek = getLastCompletedCafeWeek();
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
            const periodLabel = formatCompletedWeek(completedWeek);
            weeklyDeductionStatus.textContent = wasDeducted
                ? `Đã chốt ${periodLabel} và áp dụng 200 coin cố định + 20 coin/nhân viên cho tuần mới.`
                : "Chi phí tuần hiện tại đã được áp dụng; kỳ trước đã có kết toán.";
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
    await renderLateSettlementAdmin();
    startWeeklyCountdown();
});
