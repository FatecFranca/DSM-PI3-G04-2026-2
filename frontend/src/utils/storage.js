// Safe localStorage wrappers — storage can be unavailable (private mode, quota).

export function loadJSON(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKeys(keys) {
  try {
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}
