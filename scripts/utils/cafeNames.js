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

export const resolveCafeName = (team, fallback = "Cafe Horizon") => {
  const storedName = String(team?.name ?? "").trim();
  const replacement = legacyCafeNames[team?.id];

  if (replacement && (!storedName || storedName === replacement.previous)) {
    return replacement.current;
  }

  return storedName || fallback;
};
