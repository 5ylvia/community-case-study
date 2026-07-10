// Simple client-side rate limiter
// Enforces a minimum interval per action
const timestamps = {};

export function canPerform(action, minIntervalMs = 2000) {
  const now = Date.now();
  const last = timestamps[action] || 0;
  if (now - last < minIntervalMs) return false;
  timestamps[action] = now;
  return true;
}
