import { NextRequest, NextResponse } from "next/server";
import { redis, getUpcomingWeekend } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date)
    return NextResponse.json({ error: "date required" }, { status: 400 });
  const data = await redis.hgetall(`attendance:${date}`);
  return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
  const { id, status, date } = await req.json();
  if (!id || !date || !["present", "absent"].includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Server-side lock check
  const { isLocked } = getUpcomingWeekend();
  if (isLocked) {
    return NextResponse.json(
      { error: "Submissions are locked" },
      { status: 403 },
    );
  }

  const key = `attendance:${date}`;
  await redis.hset(key, { [id]: status });
  await redis.expire(key, 60 * 60 * 24 * 60); // keep 60 days
  const data = await redis.hgetall(key);
  return NextResponse.json(data ?? {});
}
