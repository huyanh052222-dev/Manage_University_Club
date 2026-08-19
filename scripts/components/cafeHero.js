import { club } from "../data/dashboard.js";
import { percentage } from "../utils/format.js";
import { icon } from "./icons.js";

export const renderCafeHero = () => {
  const xpProgress = percentage(club.xp, club.xpTarget);

  return `
    <section class="cafe-hero panel" id="overview" aria-labelledby="cafe-name">
      <div class="cafe-hero-photo">
        <img src="./assets/images/cafe-horizon-hero.jpg" alt="Không gian ngoài trời của Cafe Horizon" />
        <span class="hero-status"><i></i> Đang mở cửa</span>
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
          <div><span>Uy tín quán</span><strong class="stars" aria-label="4,5 trên 5 sao">★★★★<i>★</i></strong></div>
          <div><span>Xếp hạng CLB</span><strong>${club.ranking}</strong></div>
          <div><span>Khách hàng hài lòng</span><strong class="satisfaction">${icon("smile")} ${club.satisfaction}%</strong></div>
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
