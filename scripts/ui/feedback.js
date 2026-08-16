import { icon } from "../components/icons.js";

const toastRegion = () => document.querySelector("#toast-region");
const modalRoot = () => document.querySelector("#modal-root");

export const showToast = (message) => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${icon("sparkles")}<span>${message}</span>`;
  toastRegion().append(toast);

  window.setTimeout(() => {
    toast.classList.add("removing");
    window.setTimeout(() => toast.remove(), 220);
  }, 2600);
};

export const closeModal = () => {
  modalRoot().replaceChildren();
};

export const showModal = ({ title, content }) => {
  modalRoot().innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header class="modal-header">
          <h2 id="modal-title">${title}</h2>
          <button class="icon-button" type="button" data-action="close-modal" aria-label="Đóng hộp thoại">${icon("x")}</button>
        </header>
        <div class="modal-body">${content}</div>
      </section>
    </div>`;

  modalRoot().querySelector(".icon-button")?.focus();
};
