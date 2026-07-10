// Generate slug from title: extract alphanumeric chars + short random suffix
export function generateSlug(title) {
  // Extract only letters/numbers, lowercase, spaces to hyphens
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);

  // Short random suffix (4 characters)
  const suffix = Math.random().toString(36).slice(2, 6);

  return base ? `${base}-${suffix}` : suffix;
}
