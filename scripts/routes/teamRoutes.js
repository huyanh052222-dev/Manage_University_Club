export const TEAM_IDS = Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"]);

export const TEAM_ROUTE_TOKENS = Object.freeze({
  A: "zzhaSdhdaskMZkasdojASDU00129",
  B: "zzhaSdhdbskMZkasdojASDV00821",
  C: "zzhbSdhdaskNZkasdojASDU00492",
  D: "zzhaSdhdaSkMZkbsdojASDU00714",
  E: "zzhaSdhdaskMZkbsdojBSDU00387",
  F: "zzhaSdhdbskNZkasdojASDU00953",
  G: "zzhbSdhdaSkMZkasdojASDV00640",
  H: "zzhaSdhdaskNZkbsdojBSDU00276",
});

const normalizeTeamId = (value) => {
  const teamId = String(value || "").trim().toUpperCase();
  return TEAM_IDS.includes(teamId) ? teamId : "";
};

export const getTeamIdFromLocation = ({ search = "", pathname = "", fallback = "A" } = {}) => {
  let decodedPathname = String(pathname);
  try {
    decodedPathname = decodeURIComponent(decodedPathname);
  } catch {
    // Giữ pathname gốc nếu chuỗi percent-encoding không hợp lệ.
  }

  const pathMatch = decodedPathname.match(/^\/cafe\/([^/]+)\/?$/);
  const pathTeamId = Object.entries(TEAM_ROUTE_TOKENS)
    .find(([, token]) => token === pathMatch?.[1])?.[0];
  if (pathTeamId) return pathTeamId;

  const queryTeamId = normalizeTeamId(new URLSearchParams(search).get("team"));
  if (queryTeamId) return queryTeamId;

  return normalizeTeamId(fallback) || "A";
};

export const getTeamLandingPath = (teamId) => {
  const resolvedTeamId = normalizeTeamId(teamId) || "A";
  return `/cafe/${TEAM_ROUTE_TOKENS[resolvedTeamId]}`;
};
