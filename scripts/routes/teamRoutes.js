export const TEAM_IDS = Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"]);

const normalizeTeamId = (value) => {
  const teamId = String(value || "").trim().toUpperCase();
  return TEAM_IDS.includes(teamId) ? teamId : "";
};

export const getTeamIdFromLocation = ({ search = "", pathname = "", fallback = "A" } = {}) => {
  const pathMatch = String(pathname).match(/^\/cafe\/([a-h])\/?$/i);
  const pathTeamId = normalizeTeamId(pathMatch?.[1]);
  if (pathTeamId) return pathTeamId;

  const queryTeamId = normalizeTeamId(new URLSearchParams(search).get("team"));
  if (queryTeamId) return queryTeamId;

  return normalizeTeamId(fallback) || "A";
};

export const getTeamLandingPath = (teamId) => {
  const resolvedTeamId = normalizeTeamId(teamId) || "A";
  return `/cafe/${resolvedTeamId.toLowerCase()}`;
};
