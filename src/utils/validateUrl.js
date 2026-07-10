const ALLOWED_DOMAINS = [
  "maps.google.com",
  "www.google.com",
  "goo.gl",
  "maps.app.goo.gl",
  "g.co",
];

export function isValidMapUrl(url) {
  if (!url) return true; // Empty value is OK (optional field)
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function isUrlLike(str) {
  if (!str) return false;
  return /^https?:\/\//i.test(str);
}

// XSS prevention: only allow safe URLs in href
export function safeHref(url) {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return "#";
}
