/** First letter of the first and last word of a name, e.g. "Luka Perić" -> "LP". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words.at(0)?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
