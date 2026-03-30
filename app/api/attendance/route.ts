import { NextRequest, NextResponse } from "next/server";
import { redis, getTodayKey } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = getTodayKey();
  const data = await redis.hgetall(key);
  return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();
  if (!id || !["present", "absent"].includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const key = getTodayKey();
  await redis.hset(key, { [id]: status });
  await redis.expire(key, 60 * 60 * 24 * 30); // keep 30 days
  const data = await redis.hgetall(key);
  return NextResponse.json(data ?? {});
}
