import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const getTodayKey = () => {
  // "en-CA" gives YYYY-MM-DD format
  const date = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  return `attendance:${date}`;
};
