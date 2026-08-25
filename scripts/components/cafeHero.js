import { club } from "../data/dashboard.js";
import { getCafeWeekContext } from "../utils/cafeWeek.js";
import { percentage } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderCafeHero = () => {
  const xpProgress = percentage(club.xp, club.xpTarget);
  const weekContext = getCafeWeekContext();

  return `
    <section class="cafe-hero panel" id="overview" aria-labelledby="cafe-name">
      <div class="cafe-hero-photo">
        <img src="./assets/images/cafe-horizon-hero.jpg" alt="Không gian ngoài trời của ${club.name}" />
        <span class="hero-status"><i></i> ${weekContext.hasOpened ? "Đang mở cửa" : "Sắp mở bán 30/08"}</span>
      </div>
      <div class="cafe-hero-info">
        <div class="cafe-title-row">
          <span class="cafe-title-icon">${icon("coffee")}</span>
          <div>
            <h2 id="cafe-name">${club.name}</h2>
            <p>${club.field}</p>
          </div>
        </div>
        <div class="cafe-score-grid">
          <button class="cafe-score-item development-feature" type="button" data-development-feature="Uy tín quán đang được phát triển." data-development-message="Tính năng đang phát triển" aria-label="Uy tín quán: 0, tính năng đang phát triển"><span>Uy tín quán</span><strong class="stars">0</strong></button>
          <button class="cafe-score-item development-feature" type="button" data-development-feature="Xếp hạng CLB đang được phát triển." data-development-message="Tính năng đang phát triển" aria-label="Xếp hạng CLB: 0, tính năng đang phát triển"><span>Xếp hạng CLB</span><strong>0 / 0</strong></button>
          <button class="cafe-score-item development-feature" type="button" data-development-feature="Mức độ hài lòng đang được phát triển." data-development-message="Tính năng đang phát triển" aria-label="Khách hàng hài lòng: 0 phần trăm, tính năng đang phát triển"><span>Khách hàng hài lòng</span><strong class="satisfaction">${icon("smile")} 0%</strong></button>
        </div>
        <div class="cafe-xp">
          <div><span>Kinh nghiệm</span><strong>${club.xp.toLocaleString("vi-VN")} / ${club.xpTarget.toLocaleString("vi-VN")} XP</strong></div>
          <div class="progress-track" role="progressbar" aria-label="Kinh nghiệm quán" aria-valuenow="${xpProgress}" aria-valuemin="0" aria-valuemax="100">
            <span class="progress-value" style="--progress:${xpProgress}%"></span>
          </div>
        </div>
      </div>
    </section>
  `;
};
