import { getCafeWeekKey, getNextCafeWeekStart } from "../utils/cafeWeek.js?v=cafe-cycle";

export const WEEKLY_ORDER_TOTAL = 10;
export const ORDER_REWARD = 200;

const ORDER_DEADLINE_DAYS = 7;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export const menuOrderCatalog = Object.freeze([
  {
    id: "ca-phe-den",
    title: "Cà phê đen",
    description: "Pha một ly cà phê đen đậm vị, đúng định lượng của quán.",
    requirements: [
      "Chuẩn bị 01 ly cà phê đen theo công thức tiêu chuẩn.",
      "Kiểm tra hương vị, nhiệt độ và hình thức ly trước khi phục vụ.",
      "Hoàn thiện đơn trong thời gian quy định và xác nhận với người phụ trách.",
    ],
    icon: "coffee",
    tone: "gold",
  },
  {
    id: "ca-phe-sua",
    title: "Cà phê sữa",
    description: "Hoàn thiện một ly cà phê sữa có độ ngọt và độ đậm cân bằng.",
    requirements: [
      "Chuẩn bị 01 ly cà phê sữa theo đúng định lượng cà phê và sữa.",
      "Khuấy đều, giữ màu sắc đồng nhất và trình bày sạch sẽ.",
      "Đối chiếu đơn trước khi bàn giao cho khách.",
    ],
    icon: "coffee",
    tone: "coral",
  },
  {
    id: "bac-siu",
    title: "Bạc Sỉu",
    description: "Pha một ly Bạc Sỉu thơm nhẹ, ưu tiên vị sữa và hậu vị cà phê.",
    requirements: [
      "Chuẩn bị 01 ly Bạc Sỉu với tỷ lệ sữa nhiều hơn cà phê.",
      "Bảo đảm thức uống hòa quyện, không tách lớp ngoài yêu cầu trình bày.",
      "Kiểm tra miệng ly và khu vực phục vụ trước khi hoàn thành.",
    ],
    icon: "coffee",
    tone: "purple",
  },
  {
    id: "tra-sua",
    title: "Trà sữa",
    description: "Chuẩn bị một ly trà sữa cân bằng vị trà, sữa và độ ngọt.",
    requirements: [
      "Chuẩn bị 01 ly trà sữa theo công thức và mức ngọt tiêu chuẩn.",
      "Lắc hoặc khuấy đều để hỗn hợp đồng nhất trước khi đóng nắp.",
      "Kiểm tra đúng món, đúng ly và vệ sinh khu vực pha chế.",
    ],
    icon: "receipt",
    tone: "blue",
  },
]);

const hashText = (value) => {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createSeededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const getWeekIdentity = (now) => {
  const activeWeekKey = getCafeWeekKey(now);
  if (activeWeekKey) return activeWeekKey;

  const openingDate = getNextCafeWeekStart(now);
  const year = openingDate.getFullYear();
  const month = String(openingDate.getMonth() + 1).padStart(2, "0");
  const day = String(openingDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeeklyDeadline = (now) => {
  const createdAt = now instanceof Date ? now : new Date(now);
  return new Date(createdAt.getTime() + (ORDER_DEADLINE_DAYS * DAY_IN_MILLISECONDS)).toISOString();
};

const shuffle = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

export const createWeeklyOrders = (now = new Date()) => {
  const weekKey = getWeekIdentity(now);
  const random = createSeededRandom(hashText(`cafe-orders:${weekKey}`));
  const quantities = menuOrderCatalog.map(() => 1);

  for (let index = menuOrderCatalog.length; index < WEEKLY_ORDER_TOTAL; index += 1) {
    quantities[Math.floor(random() * quantities.length)] += 1;
  }

  const deadline = getWeeklyDeadline(now);
  const generatedOrders = menuOrderCatalog.flatMap((item, catalogIndex) => Array.from(
    { length: quantities[catalogIndex] },
    (_, itemIndex) => ({
      id: `${weekKey}-${item.id}-${itemIndex + 1}`,
      menuItemId: item.id,
      title: item.title,
      description: item.description,
      requirements: item.requirements.join("\n"),
      sourceUrl: "#",
      reward: ORDER_REWARD,
      deadline,
      status: "available",
      icon: item.icon,
      tone: item.tone,
      weekKey,
      isDemo: true,
    }),
  ));

  return shuffle(generatedOrders, random);
};

export const summarizeWeeklyOrders = (weeklyOrders) => menuOrderCatalog.map((item) => ({
  id: item.id,
  title: item.title,
  quantity: weeklyOrders.filter((order) => order.menuItemId === item.id).length,
}));
