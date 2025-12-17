import type { Tables } from "@/types/database";

export type TimeWindow = Tables<"course_time_windows">;

export function generateSlotsFromWindows(
  windows: TimeWindow[],
  options: { days?: number; durationMinutes?: number; from?: Date } = {}
) {
  const now = options.from ?? new Date();
  const days = options.days ?? 14;
  const duration = options.durationMinutes ?? 60;
  const slots: { start: Date; end: Date }[] = [];

  for (let offset = 0; offset < days; offset++) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(now.getDate() + offset);
    const dow = day.getDay();

    const windowsForDay = windows.filter((w) => w.day_of_week === dow);
    for (const w of windowsForDay) {
      const [startHour, startMinute] = w.start_time.split(":").map(Number);
      const [endHour, endMinute] = w.end_time.split(":").map(Number);
      const dayStart = new Date(day);
      dayStart.setHours(startHour, startMinute, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      let current = new Date(dayStart);
      while (current.getTime() + duration * 60000 <= dayEnd.getTime()) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + duration * 60000);
        if (slotStart > new Date()) {
          slots.push({ start: slotStart, end: slotEnd });
        }
        current = new Date(current.getTime() + duration * 60000);
      }
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function formatDateTime(date: Date) {
  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
