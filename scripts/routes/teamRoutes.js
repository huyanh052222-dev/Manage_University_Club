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

export const getTeamIdFromPathname = (pathname) => {
  const decodedPathname = decodePathname(pathname);
  const pathMatch = decodedPathname.match(/^\/cafe\/([^/]+)\/?$/);
  return Object.entries(TEAM_ROUTE_TOKENS)
    .find(([, token]) => token === pathMatch?.[1])?.[0] || "";
};

export const getTeamIdFromRouteToken = (token) => Object.entries(TEAM_ROUTE_TOKENS)
  .find(([, routeToken]) => routeToken === String(token || ""))?.[0] || "";

const getSearchParams = (search) => {
  try {
    return new URLSearchParams(String(search || ""));
  } catch {
    return new URLSearchParams();
  }
};

export const isSupportedLandingPath = (pathname = "/") => {
  const decodedPathname = decodePathname(pathname);
  const isIndexPath = decodedPathname === "/"
    || decodedPathname === "/index.html"
    || decodedPathname.endsWith("/index.html");
  return isIndexPath || Boolean(getTeamIdFromPathname(decodedPathname));
};

export const getTeamIdFromLocation = ({ pathname = "", search = "", fallback = "A" } = {}) => {
  const pathTeamId = getTeamIdFromPathname(pathname);
  if (pathTeamId) return pathTeamId;

  const visitTeamId = getTeamIdFromRouteToken(getSearchParams(search).get("visit"));
  if (visitTeamId) return visitTeamId;

  return normalizeTeamId(fallback) || "A";
};

export const getTeamLandingPath = (teamId) => {
  const resolvedTeamId = normalizeTeamId(teamId) || "A";
  return `/cafe/${TEAM_ROUTE_TOKENS[resolvedTeamId]}`;
};

export const getTeamLandingUrl = (teamId, { localStaticServer = false } = {}) => {
  const resolvedTeamId = normalizeTeamId(teamId) || "A";
  if (!localStaticServer) return getTeamLandingPath(resolvedTeamId);

  return `/index.html?visit=${TEAM_ROUTE_TOKENS[resolvedTeamId]}`;
};

export const getCafeVisitContext = ({ pathname = "", search = "", hostname = "", fallback = "A" } = {}) => {
  const currentTeamId = getTeamIdFromLocation({ pathname, search, fallback });
  const searchParams = getSearchParams(search);
  const requestedOriginTeamId = getTeamIdFromRouteToken(searchParams.get("from"));
  const originTeamId = requestedOriginTeamId && requestedOriginTeamId !== currentTeamId
    ? requestedOriginTeamId
    : "";
  const visitSource = searchParams.get("src") || searchParams.get("from_src") || "";

  return {
    currentTeamId,
    originTeamId,
    isVisiting: Boolean(originTeamId),
    visitSource,
    localStaticServer: ["localhost", "127.0.0.1"].includes(hostname),
  };
};

export const getNextVisitTeamId = (currentTeamId, originTeamId = "") => {
  const resolvedCurrentTeamId = normalizeTeamId(currentTeamId) || "A";
  const resolvedOriginTeamId = normalizeTeamId(originTeamId);
  const currentIndex = TEAM_IDS.indexOf(resolvedCurrentTeamId);

  for (let offset = 1; offset <= TEAM_IDS.length; offset += 1) {
    const candidate = TEAM_IDS[(currentIndex + offset) % TEAM_IDS.length];
    if (candidate !== resolvedOriginTeamId) return candidate;
  }

  return resolvedCurrentTeamId;
};

export const getCafeVisitUrl = (targetTeamId, originTeamId, { localStaticServer = false } = {}) => {
  const resolvedTargetTeamId = normalizeTeamId(targetTeamId) || "A";
  const resolvedOriginTeamId = normalizeTeamId(originTeamId) || "A";
  const targetUrl = getTeamLandingUrl(resolvedTargetTeamId, { localStaticServer });
  const separator = targetUrl.includes("?") ? "&" : "?";

  return `${targetUrl}${separator}from=${TEAM_ROUTE_TOKENS[resolvedOriginTeamId]}`;
};
