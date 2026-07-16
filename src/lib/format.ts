export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const hours = diff / (60 * 60 * 1000);
  if (hours < 1) return `${Math.max(1, Math.round(diff / 60000))}m ago`;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function hoursUntil(ms: number): number {
  return Math.round((ms - Date.now()) / (60 * 60 * 1000));
}
