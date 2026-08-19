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
      ${icon("coffee")}
    </div>
    <div class="brand-copy">
      <p class="brand-name">Cafe Horizon</p>
      <span class="brand-tagline">CLB Sinh Viên</span>
    </div>
  </div>

  <nav class="sidebar-nav">
    ${navigationMarkup}
  </nav>

  <div class="sidebar-bottom cafe-sidebar-art" aria-hidden="true">
    <div class="cup-illustration">${icon("coffee")}</div>
    <div class="leaf-row">${icon("leaf")}${icon("leaf")}</div>
    <span></span>
    <p>Cùng nhau xây dựng<br />tiệm café của sinh viên!</p>
  </div>
`;
