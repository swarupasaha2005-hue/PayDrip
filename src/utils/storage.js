/**
 * Centralized localStorage utilities to keep Context files clean
 * and satisfy React Fast Refresh 'PascalCase components only' rule.
 */

export function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Error loading ${key} from localStorage:`, error);
    return fallback;
  }
}

export function saveLS(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

export function clearLS(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
