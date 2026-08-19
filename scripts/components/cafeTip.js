import { icon } from "./icons.js";

export const renderCafeTip = () => `
  <section class="cafe-tip" aria-label="Mẹo vận hành">
    <span>${icon("coffee")}</span>
    <p><strong>Mẹo nhỏ:</strong> Hoàn thành nhiệm vụ và tham gia sự kiện để nhận thêm tiền thưởng và nâng cao danh tiếng quán!</p>
    <i>${icon("leaf")}</i>
  </section>
`;
