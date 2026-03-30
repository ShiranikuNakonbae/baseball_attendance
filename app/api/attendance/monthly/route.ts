import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { TEAM } from "@/lib/config";
export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month"); // e.g. "2026-03"
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  // Get all keys matching this month
  const keys = await redis.keys(`attendance:${month}-*`);
  if (!keys.length) return NextResponse.json({ csv: "" });

  // Fetch all days in parallel
  const entries = await Promise.all(
    keys.map(async (key) => {
      const date = key.replace("attendance:", "");
      const data = ((await redis.hgetall(key)) ?? {}) as Record<string, string>;
      return { date, data };
    }),
  );

  // Sort by date
  entries.sort((a, b) => a.date.localeCompare(b.date));

  // Build CSV
  const allMembers = [
    ...TEAM.coaches.map((m) => ({ ...m, role: "Coach" })),
    ...TEAM.athletes.map((m) => ({ ...m, role: "Athlete" })),
  ];

  const rows = [["Date", "Name", "Role", "Status"]];
  entries.forEach(({ date, data }) => {
    allMembers.forEach((m) => {
      rows.push([date, m.name, m.role, data[m.id] ?? "not filled"]);
    });
  });

  const csv = rows.map((r) => r.join(",")).join("\n");
  return NextResponse.json({ csv, days: entries.length });
}
