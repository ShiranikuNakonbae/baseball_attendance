"use client";
import { useEffect, useState, useCallback } from "react";
import { TEAM, Member } from "@/lib/config";

type Status = "present" | "absent";
type AttendanceMap = Record<string, Status>;
type Weekend = {
  saturday: string;
  sunday: string;
  cutoff: string;
  isLocked: boolean;
};

function MemberRow({
  member,
  status,
  updating,
  locked,
  onMark,
}: {
  member: Member;
  status: Status | undefined;
  updating: boolean;
  locked: boolean;
  onMark: (id: string, status: Status) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
        status === "present"
          ? "bg-green-50 border-green-300"
          : status === "absent"
            ? "bg-red-50 border-red-300"
            : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            status === "present"
              ? "bg-green-500"
              : status === "absent"
                ? "bg-red-400"
                : "bg-gray-300"
          }`}
        />
        <span className="font-semibold text-gray-800">{member.name}</span>
      </div>
      {locked ? (
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-lg ${
            status === "present"
              ? "bg-green-100 text-green-600"
              : status === "absent"
                ? "bg-red-100 text-red-500"
                : "bg-gray-100 text-gray-400"
          }`}
        >
          {status ?? "—"}
        </span>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => onMark(member.id, "present")}
            disabled={updating}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
              status === "present"
                ? "bg-green-500 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
            }`}
          >
            ✓ Present
          </button>
          <button
            onClick={() => onMark(member.id, "absent")}
            disabled={updating}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
              status === "absent"
                ? "bg-red-500 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700"
            }`}
          >
            ✗ Absent
          </button>
        </div>
      )}
    </div>
  );
}

function StatGrid({
  total,
  present,
  absent,
}: {
  total: number;
  present: number;
  absent: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        {
          label: "Total",
          value: total,
          color: "text-gray-800",
          bg: "bg-white",
        },
        {
          label: "Present",
          value: present,
          color: "text-green-600",
          bg: "bg-green-50",
        },
        {
          label: "Absent",
          value: absent,
          color: "text-red-500",
          bg: "bg-red-50",
        },
      ].map((s) => (
        <div
          key={s.label}
          className={`${s.bg} rounded-2xl p-4 text-center border border-gray-100`}
        >
          <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [attendance, setAttendance] = useState<{
    saturday: AttendanceMap;
    sunday: AttendanceMap;
  }>({
    saturday: {},
    sunday: {},
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<"saturday" | "sunday">("saturday");
  const [weekend, setWeekend] = useState<Weekend | null>(null);

  // Compute weekend dates client-side
  useEffect(() => {
    const jakarta = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );
    const day = jakarta.getDay();

    const sat = new Date(jakarta);
    if (day === 0) sat.setDate(jakarta.getDate() - 1);
    else if (day === 1) sat.setDate(jakarta.getDate() - 2);
    else if (day < 6) sat.setDate(jakarta.getDate() + (6 - day));

    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);

    const cutoff = new Date(sat);
    cutoff.setDate(sat.getDate() + 2);
    cutoff.setHours(23, 59, 59, 999);

    const isLocked = jakarta.getTime() > cutoff.getTime();

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
    const fmtDisplay = (d: Date) =>
      d.toLocaleDateString("en-US", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        month: "long",
        day: "numeric",
      });

    if (isLocked) {
      sat.setDate(sat.getDate() + 7);
      sun.setDate(sun.getDate() + 7);
      cutoff.setDate(cutoff.getDate() + 7);
      setWeekend({
        saturday: fmt(sat),
        sunday: fmt(sun),
        cutoff: fmtDisplay(cutoff),
        isLocked: false,
      });
    } else {
      setWeekend({
        saturday: fmt(sat),
        sunday: fmt(sun),
        cutoff: fmtDisplay(cutoff),
        isLocked,
      });
    }
  }, []);

  const fetchAll = useCallback(async (sat: string, sun: string) => {
    const [satRes, sunRes] = await Promise.all([
      fetch(`/api/attendance?date=${sat}`, { cache: "no-store" }),
      fetch(`/api/attendance?date=${sun}`, { cache: "no-store" }),
    ]);
    setAttendance({
      saturday: await satRes.json(),
      sunday: await sunRes.json(),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (weekend) fetchAll(weekend.saturday, weekend.sunday);
  }, [weekend, fetchAll]);

  const mark = async (
    id: string,
    status: Status,
    day: "saturday" | "sunday",
  ) => {
    if (!weekend || weekend.isLocked) return;
    const date = weekend[day];
    setUpdating(`${day}-${id}`);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, date }),
    });
    const data = await res.json();
    setAttendance((prev) => ({ ...prev, [day]: data }));
    setUpdating(null);
  };

  const downloadCSV = (day: "saturday" | "sunday") => {
    if (!weekend) return;
    const att = attendance[day];
    const date = weekend[day];
    const rows = [["Name", "Role", "Status", "Date"]];
    TEAM.coaches.forEach((m) =>
      rows.push([m.name, "Coach", att[m.id] ?? "not filled", date]),
    );
    TEAM.athletes.forEach((m) =>
      rows.push([m.name, "Athlete", att[m.id] ?? "not filled", date]),
    );
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  
  const downloadMonthlyCSV = async (monthOffset: number) => {
  if (!weekend) return
  const base = new Date(weekend.saturday + "T00:00:00")
  base.setMonth(base.getMonth() + monthOffset)
  const month = base.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7)
  const monthLabel = base.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const res = await fetch(`/api/attendance/monthly?month=${month}`)
  const { csv, days } = await res.json()
  if (!csv) return alert(`No data found for ${monthLabel}.`)
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `attendance-${month}.csv`
  a.click()
  URL.revokeObjectURL(url)
  alert(`Downloaded ${days} day(s) of data for ${monthLabel}.`)
}

const att = attendance[activeDay];
const activeDate = weekend?.[activeDay] ?? "";
const isLocked = weekend?.isLocked ?? false;

  const coachPresent = TEAM.coaches.filter(
    (m) => att[m.id] === "present",
  ).length;
  const coachAbsent = TEAM.coaches.filter((m) => att[m.id] === "absent").length;
  const athPresent = TEAM.athletes.filter(
    (m) => att[m.id] === "present",
  ).length;
  const athAbsent = TEAM.athletes.filter((m) => att[m.id] === "absent").length;

  const allMembers = [...TEAM.coaches, ...TEAM.athletes];
  const totalFilled = allMembers.filter((m) => att[m.id]).length;

  const displayDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-5xl">⚾</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Team Attendance
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Cutoff: {weekend?.cutoff ?? "—"}
          </p>
        </div>

        {/* Locked Banner */}
        {isLocked && (
          <div className="mb-6 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-center text-sm text-yellow-700 font-medium">
            🔒 Submissions are locked. Showing next weekend.
          </div>
        )}

        {/* Day Tabs */}
        <div className="flex rounded-xl bg-gray-200 p-1 mb-6">
          {(["saturday", "sunday"] as const).map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeDay === day
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {day === "saturday" ? "Saturday" : "Sunday"}
              {weekend && (
                <span className="block text-xs font-normal opacity-60">
                  {weekend[day]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Coaches
        </p>
        <StatGrid
          total={TEAM.coaches.length}
          present={coachPresent}
          absent={coachAbsent}
        />

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Athletes
        </p>
        <StatGrid
          total={TEAM.athletes.length}
          present={athPresent}
          absent={athAbsent}
        />

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Filled in</span>
            <span>
              {totalFilled} / {allMembers.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${(totalFilled / allMembers.length) * 100}%` }}
            />
          </div>
        </div>

    {/* Download Buttons */}
        <button
          onClick={() => downloadCSV(activeDay)}
          className="w-full mb-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all"
        >
          ⬇ Download {activeDay === "saturday" ? "Saturday" : "Sunday"}'s
          Attendance (CSV)
        </button>
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => downloadMonthlyCSV(-1)}
            className="flex-1 py-2.5 rounded-xl bg-violet-400 text-white text-sm font-semibold hover:bg-violet-500 transition-all"
          >
            📅 Last Month
          </button>
          <button
            onClick={() => downloadMonthlyCSV(0)}
            className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-all"
          >
            📅 This Month
          </button>
        </div>

        {/* Member Lists */}
        {loading ? (
          <div className="text-center text-gray-300 py-16 text-lg">
            Loading...
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                🎯 Coaches
              </h2>
              <div className="space-y-2">
                {TEAM.coaches.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    status={att[m.id]}
                    locked={isLocked}
                    updating={updating === `${activeDay}-${m.id}`}
                    onMark={(id, s) => mark(id, s, activeDay)}
                  />
                ))}
              </div>
            </section>
            <section className="mb-8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                🏃 Athletes
              </h2>
              <div className="space-y-2">
                {TEAM.athletes.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    status={att[m.id]}
                    locked={isLocked}
                    updating={updating === `${activeDay}-${m.id}`}
                    onMark={(id, s) => mark(id, s, activeDay)}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <p className="text-center text-xs text-gray-300 mt-6">
          Submissions open until Monday midnight
        </p>
      </div>
    </main>
  );
}
}
