import { icon } from "./icons.js";

export const renderAnnouncement = () => `
  <section class="announcement wide-section" aria-label="Thông báo mùa giải">
    <div class="announcement-copy">
      <div class="megaphone">${icon("megaphone")}</div>
      <p><strong>Startup Survival:</strong> Chỉ những nhóm biết quản lý tài nguyên và duy trì dòng tiền mới có thể tồn tại và phát triển!</p>
    </div>
    <button class="primary-button" type="button" data-action="show-rules">Tìm hiểu thêm về luật chơi ${icon("arrowRight")}</button>
  </section>
`;
