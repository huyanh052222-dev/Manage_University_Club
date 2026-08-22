/* =========================================================
   DATA LAYER
   Cấu trúc dữ liệu được thiết kế để sau này thay bằng
   fetch/subscribe từ Supabase (bảng groups, transactions).
   ========================================================= */
const ICONS = ["☕", "🫖", "🍵", "🧋", "🥐", "🍮", "🫗", "🧁"];
const GROUP_SEED = [
    { name: "Cafe Horizon", coin: 20000, revPast: 5200, tasksDone: 23, repPts: 740 },
    { name: "The Amber Cup", coin: 15400, revPast: 3900, tasksDone: 17, repPts: 610 },
    { name: "Fernweh Coffee", coin: 24200, revPast: 6100, tasksDone: 29, repPts: 860 },
    { name: "Cafe Lumen", coin: 9800, revPast: 2200, tasksDone: 11, repPts: 430 },
    { name: "Rustic Bean", coin: 18650, revPast: 4700, tasksDone: 20, repPts: 705 },
    { name: "Cloud Nine Roastery", coin: 27300, revPast: 6800, tasksDone: 31, repPts: 910 },
    { name: "Cafe Meridian", coin: 12100, revPast: 3100, tasksDone: 14, repPts: 520 },
    { name: "The Copper Kettle", coin: 21050, revPast: 5400, tasksDone: 24, repPts: 780 },
];

const TASK_PRESETS = [
    { id: 1, name: "Hoàn thành thiết kế trang chủ", reward: 150 },
    { id: 2, name: "Sửa lỗi responsive di động", reward: 80 },
    { id: 3, name: "Viết 1 bài blog SEO", reward: 100 },
    { id: 4, name: "Tổ chức workshop nội bộ", reward: 300 },
    { id: 5, name: "Hoàn thành module bài học C cơ bản", reward: 200 },
    { id: 6, name: "Review & QA sản phẩm tuần", reward: 120 },
];

const SUBMISSION_SEED = [
    { id: "submission-1", member: "Nguyễn Văn A", task: "Hoàn thành thiết kế trang chủ", brief: "File PDF đề bài", resource: "File ZIP / link Git / link Vercel" },
    { id: "submission-2", member: "Trần Minh Anh", task: "Sửa lỗi responsive di động", brief: "File PDF đề bài", resource: "Link Git / link Vercel" },
    { id: "submission-3", member: "Lê Hoàng Nam", task: "Viết 1 bài blog SEO", brief: "File PDF đề bài", resource: "Link bài viết / link Git" },
    { id: "submission-4", member: "Phạm Thu Hà", task: "Review & QA sản phẩm tuần", brief: "File PDF đề bài", resource: "File báo cáo / link Git" },
];

const WEEKLY_COST = { luong: 100, nguyenLieu: 50, dienNuoc: 50, matBang: 100, total: 300 };
const REP_STAR_DELTA = { 1: -40, 2: -20, 3: 0, 4: 20, 5: 40 };

let state = {
    week: 18,
    currentGroupId: null,
    currentView: "overview",
    reviewStart: 0,
    submissions: SUBMISSION_SEED.map((submission) => ({ ...submission, rating: 0, note: "", reviewed: false })),
    reviewHistory: [],
    groups: GROUP_SEED.map((g, i) => {
        const id = "g" + (i + 1);
        const txs = [
            { id: id + "-t1", week: 17, type: "nhiem_vu", reason: "Chi phí tuần 17", amount: -300, date: "14/07" },
            { id: id + "-t2", week: 17, type: "chi_phi", reason: "Hoàn thành nhiệm vụ tuần trước", amount: Math.round(g.revPast * 0.6), date: "11/07" },
            { id: id + "-t3", week: 18, type: "nhiem_vu", reason: "Hoàn thành module bài học C cơ bản", amount: 200, date: "18/07" },
            { id: id + "-t4", week: 18, type: "nhiem_vu", reason: "Viết 1 bài blog SEO", amount: 100, date: "17/07" },
        ];
        return {
            id,
            name: g.name,
            icon: ICONS[i % ICONS.length],
            members: 5,
            coin: g.coin,
            tasksDone: g.tasksDone,
            reputationPts: g.repPts,
            lastDeductedWeek: 17,
            transactions: txs,
        };
    }),
};

/* ============== HELPERS ============== */
const fmt = (n) => (n < 0 ? "-" : "") + Math.abs(n).toLocaleString("vi-VN");
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const findGroup = (id) => state.groups.find((g) => g.id === id);

function weeklyFigures(group) {
    const revenue = group.transactions.filter((t) => t.week === state.week && t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = group.transactions.filter((t) => t.week === state.week && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { revenue, expense, profit: revenue - expense };
}
function reputationStars(pts) {
    return Math.max(1, Math.min(5, Math.round((pts / 1000) * 5)));
}
function renderStarsHTML(count, total = 5) {
    let html = '<span class="stars">';
    for (let i = 1; i <= total; i++) html += `<span class="star ${i <= count ? "filled" : ""}">★</span>`;
    return html + "</span>";
}
function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(showToast._tm);
    showToast._tm = setTimeout(() => t.classList.remove("show"), 2200);
}
function addTransaction(group, { type, reason, amount }) {
    group.transactions.unshift({
        id: group.id + "-" + Date.now(),
        week: state.week,
        type,
        reason,
        amount,
        date: new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    });
    group.coin += amount;
}

/* ============== RENDER: TOPBAR / AGGREGATE ============== */
function renderAggregate() {
    const totalCoin = state.groups.reduce((s, g) => s + g.coin, 0);
    let totalRev = 0,
        totalExp = 0;
    state.groups.forEach((g) => {
        const w = weeklyFigures(g);
        totalRev += w.revenue;
        totalExp += w.expense;
    });
    const profit = totalRev - totalExp;
    //   $("#aggStats").innerHTML = `
    //     <div class="stat-card"><div class="icon icon-coin">🪙</div><div class="label">Tổng coin toàn hệ thống</div><div class="value mono">${fmt(totalCoin)}</div></div>
    //     <div class="stat-card"><div class="icon icon-up">↑</div><div class="label">Tổng doanh thu tuần</div><div class="value mono pos">+${fmt(totalRev)}</div></div>
    //     <div class="stat-card"><div class="icon icon-down">↓</div><div class="label">Tổng chi phí tuần</div><div class="value mono neg">-${fmt(totalExp)}</div></div>
    //     <div class="stat-card"><div class="icon icon-profit">Σ</div><div class="label">Lợi nhuận toàn hệ thống</div><div class="value mono ${profit>=0?"pos":"neg"}">${profit>=0?"+":""}${fmt(profit)}</div></div>
    //   `;
    $("#weekLabel").textContent = "Tuần " + state.week;
}

/* ============== RENDER: OVERVIEW GRID ============== */
function renderOverview() {
    $("#groupsGrid").innerHTML = state.groups
        .map((g) => {
            const w = weeklyFigures(g);
            const stars = reputationStars(g.reputationPts);
            return `
      <div class="group-card">
        <div class="group-card-top">
          <div class="group-avatar">${g.icon}</div>
          <div>
            <div class="group-name">${g.name}</div>
            <div class="group-meta">${g.members} thành viên · Nhóm</div>
          </div>
        </div>
        <div>
          <div class="group-coin-label">Coin hiện có</div>
          <div class="group-coin">${fmt(g.coin)}</div>
        </div>
        <div class="badge-row">
          <span class="badge ${w.profit >= 0 ? "badge-green" : "badge-red"}">${w.profit >= 0 ? "+" : ""}${fmt(w.profit)} coin/tuần</span>
          <span class="badge" style="background:var(--purple-soft); color:var(--purple);">${renderStarsHTML(stars)}</span>
        </div>
        <button class="btn btn-outline view-btn" data-open="${g.id}">Xem chi tiết →</button>
      </div>
    `;
        })
        .join("");
    $$("[data-open]").forEach((btn) => btn.addEventListener("click", () => openDetail(btn.dataset.open)));
}

/* ============== RENDER: DETAIL ============== */
function openDetail(id) {
    state.currentGroupId = id;
    switchView("detail");
    renderDetail();
}
function renderDetail() {
    const g = findGroup(state.currentGroupId);
    if (!g) return;
    const w = weeklyFigures(g);
    const stars = reputationStars(g.reputationPts);

    $("#detailAvatar").textContent = g.icon;
    $("#detailName").textContent = g.name;
    $("#detailSub").textContent = `${g.members} thành viên · ${g.tasksDone} nhiệm vụ đã hoàn thành`;
    $("#detailCoin").textContent = fmt(g.coin);

    $("#detailKpis").innerHTML = `
    <div class="stat-card"><div class="icon icon-up">↑</div><div class="label">Doanh thu tuần</div><div class="value mono pos">+${fmt(w.revenue)}</div></div>
    <div class="stat-card"><div class="icon icon-down">↓</div><div class="label">Chi phí tuần</div><div class="value mono neg">-${fmt(w.expense)}</div></div>
    <div class="stat-card"><div class="icon icon-profit">Σ</div><div class="label">Lợi nhuận tuần</div><div class="value mono ${w.profit >= 0 ? "pos" : "neg"}">${w.profit >= 0 ? "+" : ""}${fmt(w.profit)}</div></div>
    <div class="stat-card"><div class="icon" style="background:var(--purple-soft); color:var(--purple);">★</div><div class="label">Danh tiếng</div><div class="value mono">${g.reputationPts}/1000</div></div>
  `;

    renderReviewPanels();
    renderReviewHistory();
}

function renderReviewPanels() {
    const pendingSubmissions = state.submissions.filter((submission) => !submission.reviewed);
    const columns = getReviewColumns();
    const maxStart = Math.max(0, pendingSubmissions.length - columns);
    state.reviewStart = Math.min(state.reviewStart, maxStart);
    const visibleSubmissions = pendingSubmissions.slice(state.reviewStart, state.reviewStart + columns);
    $("#pendingCount").textContent = `${pendingSubmissions.length}`;
    $("#reviewPanels").innerHTML = visibleSubmissions
        .map(
            (submission) => `
        <article class="panel review-panel" data-submission="${submission.id}">
            <h3><span class="panel-icon icon-up">✓</span>Đánh giá bài làm</h3>
            <div><label class="field-label">Tên người nộp</label><div>${submission.member}</div></div>
            <div><label class="field-label">Đề bài</label><div class="link">${submission.brief}</div></div>
            <div><label class="field-label">Bài làm</label><div class="link">${submission.resource}</div></div>
            <div>
                <label class="field-label">Đánh giá bài làm</label>
                <div class="star-picker" role="radiogroup" aria-label="Đánh giá ${submission.member}">
                    ${[1, 2, 3, 4, 5].map((value) => `<button type="button" data-rating="${value}" aria-label="${value} sao" class="${value <= submission.rating ? "active" : ""}">★</button>`).join("")}
                </div>
            </div>
            <div><label class="field-label">Ghi chú chấm điểm</label><textarea data-note placeholder="Nhận xét bài làm">${submission.note}</textarea></div>
            <button class="btn btn-primary save-review" type="button">Lưu đánh giá</button>
        </article>
    `,
        )
        .join("");
    $("#reviewPrev").disabled = state.reviewStart === 0;
    $("#reviewNext").disabled = state.reviewStart + columns >= pendingSubmissions.length;
    $("#reviewPrev").hidden = pendingSubmissions.length <= columns;
    $("#reviewNext").hidden = pendingSubmissions.length <= columns;
}

function getReviewColumns() {
    if (window.matchMedia("(max-width: 830px)").matches) return 1;
    if (window.matchMedia("(max-width: 1100px)").matches) return 2;
    return 3;
}

function removeExpiredReviewHistory() {
    const now = Date.now();
    state.reviewHistory = state.reviewHistory.filter((review) => review.expiresAt > now);
}

function renderReviewHistory() {
    removeExpiredReviewHistory();
    const history = [...state.reviewHistory].sort((a, b) => b.reviewedAt - a.reviewedAt);
    $("#historyCount").textContent = `${history.length} bài`;
    if (history.length === 0) {
        $("#reviewHistoryList").innerHTML = `<div class="empty-note">Chưa có bài nào được chấm.</div>`;
        return;
    }
    $("#reviewHistoryList").innerHTML = history
        .map((t) => {
            return `
            <article class="review-history-card">
                <div class="review-history-card-header">
                    <div><h3>${t.task}</h3><div class="review-history-member">${t.member}</div></div>
                    <div class="review-history-rating">${renderStarsHTML(t.rating)}</div>
                </div>
                <div class="review-history-links">
                    <div><span class="field-label">Đề bài</span><div class="link">${t.brief}</div></div>
                    <div><span class="field-label">Bài làm</span><div class="link">${t.resource}</div></div>
                </div>
                <div><span class="field-label">Ghi chú chấm điểm</span><div class="review-history-note">${t.note || "Không có ghi chú."}</div></div>
                <div class="review-history-meta">Đã chấm ${new Date(t.reviewedAt).toLocaleDateString("vi-VN")} · Tự xóa sau 5 ngày</div>
            </article>
    `;
        })
        .join("");
}

/* ============== ACTIONS ============== */
function deductWeekly(g, week = state.week) {
    addTransaction(g, { type: "chi_phi", reason: `Chi phí tuần ${week} (lương 100 · nguyên liệu 50 · điện nước 50 · mặt bằng 100)`, amount: -WEEKLY_COST.total });
    g.lastDeductedWeek = state.week;
}

function advanceWeek() {
    state.groups.forEach((g) => {
        if (g.lastDeductedWeek !== state.week) deductWeekly(g);
    });
    state.week += 1;
    showToast(`Đã trừ chi phí tuần cho tất cả nhóm · Chuyển sang Tuần ${state.week}`);
    renderAggregate();
    renderOverview();
    if (state.currentView === "detail") renderDetail();
    if (state.currentView === "stats") renderStats();
}

function getWeekKey(date) {
    const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = start.getUTCDay() || 7;
    start.setUTCDate(start.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(start.getUTCFullYear(), 0, 1));
    return `${start.getUTCFullYear()}-${Math.ceil(((start - yearStart) / 86400000 + 1) / 7)}`;
}

let currentWeekKey = getWeekKey(new Date());
function checkForNewWeek() {
    const nextWeekKey = getWeekKey(new Date());
    if (nextWeekKey === currentWeekKey) return;
    currentWeekKey = nextWeekKey;
    advanceWeek();
}

setInterval(checkForNewWeek, 60000);

$("#reviewPrev").addEventListener("click", () => {
    state.reviewStart = Math.max(0, state.reviewStart - 1);
    renderReviewPanels();
});
$("#reviewNext").addEventListener("click", () => {
    state.reviewStart += 1;
    renderReviewPanels();
});
$("#reviewPanels").addEventListener("click", (event) => {
    const panel = event.target.closest("[data-submission]");
    if (!panel) return;
    const submission = state.submissions.find((item) => item.id === panel.dataset.submission);
    if (!submission) return;
    const ratingButton = event.target.closest("[data-rating]");
    if (ratingButton) {
        submission.rating = Number(ratingButton.dataset.rating);
        panel.querySelectorAll("[data-rating]").forEach((button) => button.classList.toggle("active", Number(button.dataset.rating) <= submission.rating));
        return;
    }
    if (!event.target.closest(".save-review")) return;
    submission.note = panel.querySelector("[data-note]").value.trim();
    if (!submission.rating) {
        showToast("Chọn số sao trước khi lưu đánh giá");
        return;
    }
    submission.reviewed = true;
    const reviewedAt = Date.now();
    state.reviewHistory.push({
        ...submission,
        reviewedAt,
        expiresAt: reviewedAt + 5 * 24 * 60 * 60 * 1000,
    });
    showToast(`Đã lưu đánh giá ${submission.rating}★ cho ${submission.member}`);
    renderReviewPanels();
    renderReviewHistory();
});
window.addEventListener("resize", renderReviewPanels);
setInterval(renderReviewHistory, 60000);

$("#backBtn").addEventListener("click", () => switchView("overview"));

/* ============== VIEW SWITCH ============== */
function switchView(view) {
    state.currentView = view;
    $$("section").forEach((s) => s.classList.remove("active"));
    $("#view-" + view).classList.add("active");
    $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    if (view === "overview") renderOverview();
    if (view === "stats") renderStats();
}
$$(".tab-btn").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));

/* ============== STATS VIEW ============== */
let profitChartInstance = null;
function renderStats() {
    $("#statsTableBody").innerHTML = state.groups
        .map((g) => {
            const w = weeklyFigures(g);
            const stars = reputationStars(g.reputationPts);
            return `
      <tr>
        <td>${g.icon} ${g.name}</td>
        <td class="mono">${fmt(g.coin)}</td>
        <td class="mono pos">+${fmt(w.revenue)}</td>
        <td class="mono neg">-${fmt(w.expense)}</td>
        <td class="mono ${w.profit >= 0 ? "pos" : "neg"}">${w.profit >= 0 ? "+" : ""}${fmt(w.profit)}</td>
        <td>${g.tasksDone}</td>
        <td>${renderStarsHTML(stars)} <span style="color:var(--text-muted); font-size:11.5px;">(${g.reputationPts}/1000)</span></td>
      </tr>
    `;
        })
        .join("");

    const ctx = document.getElementById("profitChart");
    const labels = state.groups.map((g) => g.name);
    const data = state.groups.map((g) => weeklyFigures(g).profit);
    const colors = data.map((v) => (v >= 0 ? "#4F8F5B" : "#C1503F"));
    if (profitChartInstance) profitChartInstance.destroy();
    profitChartInstance = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets: [{ label: "Lợi nhuận tuần (coin)", data, backgroundColor: colors, borderRadius: 6, maxBarThickness: 46 }] },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: "#8C8171", font: { family: "Inter", size: 11 } } },
                y: { grid: { color: "#E8E0CF" }, ticks: { color: "#8C8171", font: { family: "IBM Plex Mono", size: 11 } } },
            },
        },
    });
}

/* ============== INIT ============== */
function init() {
    // $("#taskPreset").innerHTML += TASK_PRESETS.map((p) => `<option value="${p.id}">${p.name} (+${p.reward})</option>`).join("");
    renderAggregate();
    renderOverview();
}
init();
