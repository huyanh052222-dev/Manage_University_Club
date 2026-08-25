import { icon } from "./icons.js";

export const renderCafeTip = () => `
  <section class="cafe-tip" aria-label="Mẹo vận hành">
    <span>${icon("coffee")}</span>
    <p><strong>Mẹo nhỏ:</strong> Hoàn thành đơn hàng để nhận coin; mọi biến động sẽ được ghi lại trong nhật ký của nhóm.</p>
    <i>${icon("leaf")}</i>
  </section>
`;
