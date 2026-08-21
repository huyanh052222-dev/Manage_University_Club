import { cafeStats, groups, members } from "../data/dashboard.js";
import { icon } from "./icons.js";

const renderMeta = (meta) => meta.map(([label, value], index) => `<span>${label}<b class="${index ? "negative-text" : "positive-text"}">${value}</b></span>`).join("");

const absentMembers = 2;
const resolvedStats = cafeStats.map((stat) => stat.id === "staff" ? {
  ...stat,
  value: String(members.length),
  total: `/ ${groups.length * 8}`,
  note: `thành viên · ${groups.length} nhóm`,
  meta: [["Đi làm", String(members.length - absentMembers)], ["Vắng mặt", String(absentMembers)]],
} : stat);

export const renderCafeStats = () => `
  <section class="cafe-stats" aria-label="Chỉ số vận hành">
    ${resolvedStats.map((stat) => `
      <article class="cafe-stat-card" style="--stat-accent:${stat.color}">
        <span class="cafe-stat-icon">${icon(stat.icon)}</span>
        <div class="cafe-stat-main">
          <h3>${stat.label}</h3>
          <strong>${stat.value} <small>${stat.total}</small></strong>
          <span>${stat.note}</span>
        </div>
        ${stat.meta ? `<div class="cafe-stat-meta">${renderMeta(stat.meta)}</div>` : `
          <div class="cafe-stat-progress">
            <div class="progress-track"><span class="progress-value" style="--progress:${stat.progress}%;--bar:${stat.color}"></span></div>
          </div>`}
      </article>`).join("")}
  </section>
`;
