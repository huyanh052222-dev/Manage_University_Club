import { navigationItems } from "../data/dashboard.js";
import { icon } from "./icons.js";

const navigationMarkup = navigationItems
  .map(
    (item, index) => `
      <a class="nav-item${index === 0 ? " active" : ""}" href="#${item.id}" data-nav-id="${item.id}">
        ${icon(item.icon)}
        <span>${item.label}</span>
      </a>`,
  )
  .join("");

export const renderSidebar = () => `
  <div class="brand">
    <div class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32"><path d="m6 25 9.5-19L26 25M10 18h12"/><circle cx="16" cy="12" r="2.2"/></svg>
    </div>
    <div class="brand-copy">
      <p class="brand-name">NovaHub</p>
      <span class="brand-tagline">Student Innovation Club</span>
    </div>
  </div>

  <nav class="sidebar-nav">
    ${navigationMarkup}
  </nav>

  <div class="sidebar-bottom">
    <section class="season-card" aria-label="Thông tin mùa giải">
      <div class="season-row">
        <div class="season-icon">${icon("trophy")}</div>
        <div>
          <p class="season-title">Mùa giải 2024 · 2025</p>
          <p class="season-subtitle">Giai đoạn: Khởi động · Còn 23 ngày</p>
        </div>
      </div>
      <div class="season-progress"><span></span></div>
      <button class="text-link" type="button" data-action="show-season">
        Xem chi tiết ${icon("arrowRight")}
      </button>
    </section>

    <section class="promo-card" aria-label="Startup Survival">
      <span class="promo-kicker">Startup <strong>Survival</strong></span>
      <p class="promo-copy">Cùng nhóm vượt thử thách, duy trì dòng tiền và phát triển startup của bạn!</p>
    </section>
  </div>
`;
