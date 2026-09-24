const legacyCafeNames = {
  A: {
    previous: "Nguyễn Văn Bảo",
    current: "The Vortex Coffee",
  },
  F: {
    previous: "Nguyễn Quốc Quỳnh",
    current: "The Ora café",
  },
};

export const TEAM_THEMES = Object.freeze({
  A: { icon: "🔥", color: "#FF5533", bg: "#FFE8E4" },
  B: { icon: "⚡", color: "#FFCC00", bg: "#FFF8E1" },
  C: { icon: "🌊", color: "#22C4A0", bg: "#E8FBF5" },
  D: { icon: "💜", color: "#7C5CFC", bg: "#F0EBFF" },
  E: { icon: "🍊", color: "#FF8C42", bg: "#FFF3EC" },
  F: { icon: "🌸", color: "#E83E8C", bg: "#FFE8F4" },
  G: { icon: "🍃", color: "#3A9E6C", bg: "#E8FBF0" },
  H: { icon: "🌙", color: "#5A6FCF", bg: "#EEF0FF" },
});

export const resolveCafeName = (team, fallback = "Cafe Horizon") => {
  const storedName = String(team?.name ?? "").trim();
  const replacement = legacyCafeNames[team?.id];

  if (replacement && (!storedName || storedName === replacement.previous)) {
    return replacement.current;
  }

  return storedName || fallback;
};

