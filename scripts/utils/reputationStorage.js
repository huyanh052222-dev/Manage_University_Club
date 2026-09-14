export const REPUTATION_STORAGE_KEY = "cafe-reputation-overrides-v1";
export const MIN_STORED_REPUTATION = 1;
export const MAX_STORED_REPUTATION = 5;

const normalizeReputation = (value, fallback = MIN_STORED_REPUTATION) => {
  const resolvedFallback = Math.min(
    MAX_STORED_REPUTATION,
    Math.max(MIN_STORED_REPUTATION, Math.round(Number(fallback) || MIN_STORED_REPUTATION)),
  );
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return resolvedFallback;
  return Math.min(MAX_STORED_REPUTATION, Math.max(MIN_STORED_REPUTATION, Math.round(numericValue)));
};

const getStorage = () => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

const readReputationOverrides = () => {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const parsed = JSON.parse(storage.getItem(REPUTATION_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const getStoredCafeReputation = (teamId, fallback = MIN_STORED_REPUTATION) => {
  const overrides = readReputationOverrides();
  const key = String(teamId || "").trim().toUpperCase();
  return Object.hasOwn(overrides, key)
    ? normalizeReputation(overrides[key], fallback)
    : normalizeReputation(fallback);
};

export const setStoredCafeReputation = (teamId, reputation) => {
  const storage = getStorage();
  const key = String(teamId || "").trim().toUpperCase();
  if (!storage || !key) return false;

  const overrides = readReputationOverrides();
  overrides[key] = normalizeReputation(reputation);

  try {
    storage.setItem(REPUTATION_STORAGE_KEY, JSON.stringify(overrides));
    return true;
  } catch {
    return false;
  }
};
