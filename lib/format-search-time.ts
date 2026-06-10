function startOfDay(ts: number): number {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function formatSearchTime(timestamp: number): string {
  const now = new Date();
  const today = startOfDay(now.getTime());
  const day = startOfDay(timestamp);

  if (day === today) {
    const date = new Date(timestamp);
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
