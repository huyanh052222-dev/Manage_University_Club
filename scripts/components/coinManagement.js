import { formatNumber } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderCoinManagement = (groups) => `
  <div class="coin-admin-intro">
    <span>${icon("wallet")}</span>
    <p>Chỉ tài khoản admin hệ thống có quyền thay đổi số dư coin của các nhóm.</p>
  </div>

  <form class="coin-adjust-form" data-coin-form>
    <label class="coin-form-field">
      <span>Chọn nhóm</span>
      <select name="groupId" data-coin-group>
        ${groups.map((group) => `<option value="${group.id}">${group.name} · ${group.code}</option>`).join("")}
      </select>
    </label>

    <div class="coin-balance-preview">
      <span>Số dư hiện tại</span>
      <strong data-coin-balance>${formatNumber(groups[0]?.balance ?? 0)} coin</strong>
    </div>

    <fieldset class="coin-operation">
      <legend>Loại điều chỉnh</legend>
      <label class="coin-operation-option add">
        <input type="radio" name="direction" value="add" checked />
        <span>${icon("plus")} Cộng coin</span>
      </label>
      <label class="coin-operation-option subtract">
        <input type="radio" name="direction" value="subtract" />
        <span>${icon("minus")} Trừ coin</span>
      </label>
    </fieldset>

    <label class="coin-form-field">
      <span>Số coin</span>
      <div class="coin-amount-input">
        <input name="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="Ví dụ: 500" required />
        <b>coin</b>
      </div>
    </label>

    <label class="coin-form-field">
      <span>Lý do điều chỉnh</span>
      <textarea name="reason" rows="2" placeholder="Ví dụ: Thưởng hoàn thành nhiệm vụ"></textarea>
    </label>

    <p class="coin-form-error" data-coin-error aria-live="polite"></p>
    <button class="primary-button coin-submit" type="submit">${icon("checkCircle")} Xác nhận điều chỉnh</button>
  </form>
`;
