import { cafeStats } from "../data/dashboard.js";
import { icon } from "./icons.js";

const renderMeta = (meta) => meta.map(([label, value], index) => `<span>${label}<b class="${index ? "negative-text" : "positive-text"}">${value}</b></span>`).join("");

export const renderCafeStats = () => `
  <section class="cafe-stats" aria-label="Chỉ số vận hành">
    ${cafeStats.map((stat) => `
      <article class="cafe-stat-card${stat.isDeveloping ? " development-feature" : ""}" style="--stat-accent:${stat.color}" ${stat.isDeveloping ? 'tabindex="0" role="button" data-development-feature="Danh tiếng quán đang được phát triển." data-development-message="Tính năng đang phát triển" aria-label="Danh tiếng quán: 0, tính năng đang phát triển"' : ""}>
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
