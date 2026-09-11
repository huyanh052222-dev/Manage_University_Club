import { club, navigationItems } from "../data/dashboard.js";
import { renderCafeVisitCard } from "./cafeVisitCard.js?v=cafe-visit";
import { icon } from "./icons.js";

const renderNavigationMarkup = (isVisiting) => navigationItems
  .filter((item) => !isVisiting || ["overview", "personnel"].includes(item.id))
  .map(
    (item, index) => `
      <a class="nav-item${index === 0 ? " active" : ""}" href="#${item.id}" data-nav-id="${item.id}">
        ${icon(item.icon)}
        <span>${item.label}</span>
      </a>`,
  )
  .join("");

export const renderSidebar = (visitContext = {
  currentTeamId: "A",
  originTeamId: "",
  isVisiting: false,
  localStaticServer: false,
}) => `
  <div class="brand">
    <div class="brand-mark" aria-hidden="true">
      ${icon("coffee")}
    </div>
    <div class="brand-copy">
      <p class="brand-name">${club.name}</p>
      <span class="brand-tagline">CLB Sinh Viên</span>
    </div>
  </div>

  <nav class="sidebar-nav">
    ${renderNavigationMarkup(visitContext.isVisiting)}
  </nav>

  ${renderCafeVisitCard(visitContext)}

  <div class="sidebar-bottom cafe-sidebar-art" aria-hidden="true">
    <div class="cup-illustration">${icon("coffee")}</div>
    <div class="leaf-row">${icon("leaf")}${icon("leaf")}</div>
    <span></span>
    <p>Cùng nhau xây dựng<br />tiệm café của sinh viên!</p>
  </div>
`;
