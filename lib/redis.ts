import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const getTodayKey = () => {
  // Uses UTC+7 (WIB) for Indonesia
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const date = now.toISOString().split("T")[0];
  return `attendance:${date}`;
};
