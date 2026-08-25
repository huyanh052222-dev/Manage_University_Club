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

const decodePathname = (pathname) => {
  try {
    return decodeURIComponent(String(pathname || "/"));
  } catch {
    return String(pathname || "/");
  }
};

const getTeamIdFromPathname = (pathname) => {
  const decodedPathname = decodePathname(pathname);
  const pathMatch = decodedPathname.match(/^\/cafe\/([^/]+)\/?$/);
  return Object.entries(TEAM_ROUTE_TOKENS)
    .find(([, token]) => token === pathMatch?.[1])?.[0] || "";
};

export const isSupportedLandingPath = (pathname = "/") => {
  const decodedPathname = decodePathname(pathname);
  const isIndexPath = decodedPathname === "/"
    || decodedPathname === "/index.html"
    || decodedPathname.endsWith("/index.html");
  return isIndexPath || Boolean(getTeamIdFromPathname(decodedPathname));
};

export const getTeamIdFromLocation = ({ pathname = "", fallback = "A" } = {}) => {
  const pathTeamId = getTeamIdFromPathname(pathname);
  if (pathTeamId) return pathTeamId;

  return normalizeTeamId(fallback) || "A";
};

export const getTeamLandingPath = (teamId) => {
  const resolvedTeamId = normalizeTeamId(teamId) || "A";
  return `/cafe/${TEAM_ROUTE_TOKENS[resolvedTeamId]}`;
};
