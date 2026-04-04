import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const fmt = (d: Date) =>
  d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export const getUpcomingWeekend = () => {
  const jakarta = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  const day = jakarta.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  const sat = new Date(jakarta);
  if (day === 0)
    sat.setDate(jakarta.getDate() - 1); // Sun → last Sat
  else if (day === 1)
    sat.setDate(jakarta.getDate() - 2); // Mon → last Sat
  else if (day < 6) sat.setDate(jakarta.getDate() + (6 - day)); // Tue-Fri → next Sat
  // day === 6: today is Sat, no change

  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);

  const cutoff = new Date(sat);
  cutoff.setDate(sat.getDate() + 2); // Monday
  cutoff.setHours(23, 59, 59, 999);

  const isLocked = jakarta.getTime() > cutoff.getTime();

  // Past Monday cutoff → jump to next weekend, unlocked
  if (isLocked) {
    sat.setDate(sat.getDate() + 7);
    sun.setDate(sun.getDate() + 7);
    cutoff.setDate(cutoff.getDate() + 7);
    return {
      saturday: fmt(sat),
      sunday: fmt(sun),
      cutoff: fmt(cutoff),
      isLocked: false,
    };
  }

  return {
    saturday: fmt(sat),
    sunday: fmt(sun),
    cutoff: fmt(cutoff),
    isLocked,
  };
};
