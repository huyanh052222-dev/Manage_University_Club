// import {
//   getCafeVisitUrl,
//   getNextVisitTeamId,
//   getTeamLandingUrl,
// } from "../routes/teamRoutes.js?v=cafe-visit";
// import { icon } from "./icons.js";

// export const renderCafeVisitCard = ({
//   currentTeamId,
//   originTeamId,
//   isVisiting,
//   localStaticServer,
// }) => {
//   const visitOriginTeamId = isVisiting ? originTeamId : currentTeamId;
//   const nextTeamId = getNextVisitTeamId(currentTeamId, isVisiting ? originTeamId : "");
//   const nextCafeUrl = getCafeVisitUrl(nextTeamId, visitOriginTeamId, { localStaticServer });
//   const originCafeUrl = isVisiting
//     ? getTeamLandingUrl(originTeamId, { localStaticServer })
//     : "";

//   return `
//     <section class="cafe-visit-card" aria-labelledby="cafe-visit-title">
//       <span class="cafe-visit-icon">${icon("store")}</span>
//       <div class="cafe-visit-copy">
//         <strong id="cafe-visit-title">Khám phá không gian khác</strong>
//         <p>${isVisiting ? "Tiếp tục ghé quán kế tiếp hoặc quay về quán chính." : "Xem thành viên, đánh giá và đơn hàng của quán kế tiếp."}</p>
//       </div>
//       <a class="cafe-visit-link" href="${nextCafeUrl}" data-cafe-visit-link>
//         ${icon("eye")} Ghé thăm quán khác
//       </a>
//       ${isVisiting ? `
//         <a class="cafe-return-link" href="${originCafeUrl}" data-cafe-return-link>
//           ${icon("arrowLeft")} Quay về quán chính
//         </a>
//       ` : ""}
//     </section>
//   `;
// };
