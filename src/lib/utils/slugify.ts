export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function generateUniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
