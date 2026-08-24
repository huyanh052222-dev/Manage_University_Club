import { renderCafePage } from "./pages/cafePage.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Không tìm thấy điểm mount #app.");
}

appRoot.innerHTML = renderCafePage();

await import("./app.js?v=20260824-merge");
