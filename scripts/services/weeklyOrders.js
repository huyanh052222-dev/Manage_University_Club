export const WEEKLY_ORDER_TOTAL = 10;
export const MIN_CAFE_REPUTATION = 1;
export const MAX_CAFE_REPUTATION = 5;
export const BASE_WEEKLY_ORDER_REWARD_POOL = 200;
export const REPUTATION_REWARD_POOL_STEP = 100;

const normalizeReputation = (value) => Math.min(
  MAX_CAFE_REPUTATION,
  Math.max(MIN_CAFE_REPUTATION, Math.round(Number(value) || MIN_CAFE_REPUTATION)),
);

export const getWeeklyOrderRewardPool = (reputation = MIN_CAFE_REPUTATION) => (
  BASE_WEEKLY_ORDER_REWARD_POOL
  + ((normalizeReputation(reputation) - MIN_CAFE_REPUTATION) * REPUTATION_REWARD_POOL_STEP)
);

export const getRegularOrderReward = (reputation = MIN_CAFE_REPUTATION) => (
  getWeeklyOrderRewardPool(reputation) / WEEKLY_ORDER_TOTAL
);

export const WEEKLY_ORDER_REWARD_POOL = getWeeklyOrderRewardPool();
export const ORDER_REWARD = getRegularOrderReward();

export const ORDER_CONTACTS_BY_TEAM = Object.freeze({
  A: Object.freeze({ name: "Huỳnh Thị Thúy Vy", phone: "0394350988" }),
  B: Object.freeze({ name: "Mai Thị Yến Nhi", phone: "0395789435" }),
  C: Object.freeze({ name: "Tống Minh Duy", phone: "0913182030" }),
  D: Object.freeze({ name: "Lê Minh Khang", phone: "0948313971" }),
  E: Object.freeze({ name: "Nguyễn Đăng Dương", phone: "0339744676" }),
  F: Object.freeze({ name: "Lê Hồng Cường", phone: "0368944409" }),
  G: Object.freeze({ name: "Tống Hoàng Phước Sang", phone: "0819813331" }),
  // Liên hệ H dùng URL hồ sơ được giải mã trực tiếp từ QR Zalo người dùng cung cấp.
  H: Object.freeze({ name: "Liên hệ QR thay NPC Hiếu", url: "http://zaloapp.com/qr/p/t22cf13d4l8c" }),
});

export const getOrderContact = (teamId = "A") => ORDER_CONTACTS_BY_TEAM[String(teamId).toUpperCase()]
  || ORDER_CONTACTS_BY_TEAM.A;

export const getOrderSourceUrl = (teamId = "A") => {
  const contact = getOrderContact(teamId);
  return contact.url || `https://zalo.me/${contact.phone}`;
};

const FIRST_ORDER_MONDAY = new Date(2026, 7, 31, 0, 0, 0, 0);

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

const resolveOrderDate = (value) => {
  const resolved = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(resolved.getTime()) ? new Date() : resolved;
};

const formatLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getOrderWeekSchedule = (now = new Date()) => {
  const reference = resolveOrderDate(now);
  let startsAt = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const dayOfWeek = startsAt.getDay();

  // Thứ Hai–thứ Bảy dùng tuần hiện tại; Chủ nhật chuẩn bị cho thứ Hai kế tiếp.
  startsAt.setDate(startsAt.getDate() + (dayOfWeek === 0 ? 1 : 1 - dayOfWeek));
  if (startsAt < FIRST_ORDER_MONDAY) startsAt = new Date(FIRST_ORDER_MONDAY);

  const deadline = new Date(
    startsAt.getFullYear(),
    startsAt.getMonth(),
    startsAt.getDate() + 5,
    23,
    59,
    59,
    999,
  );

  return {
    weekKey: formatLocalDateKey(startsAt),
    startsAt: startsAt.toISOString(),
    deadline: deadline.toISOString(),
  };
};

const shuffle = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

export const createWeeklyOrders = (now = new Date(), teamId = "A", reputation = MIN_CAFE_REPUTATION) => {
  const schedule = getOrderWeekSchedule(now);
  const { weekKey } = schedule;
  const random = createSeededRandom(hashText(`cafe-orders:${weekKey}`));
  const quantities = menuOrderCatalog.map(() => 1);
  const regularOrderReward = getRegularOrderReward(reputation);

  for (let index = menuOrderCatalog.length; index < WEEKLY_ORDER_TOTAL; index += 1) {
    quantities[Math.floor(random() * quantities.length)] += 1;
  }

  const generatedOrders = menuOrderCatalog.flatMap((item, catalogIndex) => Array.from(
    { length: quantities[catalogIndex] },
    (_, itemIndex) => ({
      id: `${weekKey}-${item.id}-${itemIndex + 1}`,
      menuItemId: item.id,
      title: item.title,
      description: item.description,
      requirements: item.requirements.join("\n"),
      sourceUrl: getOrderSourceUrl(teamId),
      reward: regularOrderReward,
      startsAt: schedule.startsAt,
      deadline: schedule.deadline,
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
