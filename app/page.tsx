"use client";
import { useEffect, useState, useCallback } from "react";
import { TEAM, Member } from "@/lib/config";

type Status = "present" | "absent";
type AttendanceMap = Record<string, Status>;

function MemberRow({
  member,
  status,
  updating,
  onMark,
}: {
  member: Member;
  status: Status | undefined;
  updating: boolean;
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
    </div>
  );
}

export default function Home() {
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  const fetchAttendance = useCallback(async () => {
    const res = await fetch("/api/attendance");
    const data = await res.json();
    setAttendance(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const mark = async (id: string, status: Status) => {
    setUpdating(id);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    setAttendance(data);
    setUpdating(null);
  };

  const downloadCSV = () => {
    const rows = [["Name", "Role", "Status", "Date"]];
    TEAM.coaches.forEach((m) => {
      rows.push([m.name, "Coach", attendance[m.id] ?? "not filled", today]);
    });
    TEAM.athletes.forEach((m) => {
      rows.push([m.name, "Athlete", attendance[m.id] ?? "not filled", today]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allMembers = [...TEAM.coaches, ...TEAM.athletes];
  const filled = allMembers.filter((m) => attendance[m.id]).length;
  const present = allMembers.filter(
    (m) => attendance[m.id] === "present",
  ).length;
  const absent = allMembers.filter((m) => attendance[m.id] === "absent").length;

  const renderSection = (title: string, emoji: string, members: Member[]) => (
    <section className="mb-8">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
        {emoji} {title}
      </h2>
      <div className="space-y-2">
        {members.map((m) => (
          <MemberRow
            key={m.id}
            member={m}
            status={attendance[m.id]}
            updating={updating === m.id}
            onMark={mark}
          />
        ))}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">⚾</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Team Attendance
          </h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            {
              label: "Total",
              value: allMembers.length,
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

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Filled in</span>
            <span>
              {filled} / {allMembers.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${(filled / allMembers.length) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={downloadCSV}
          className="w-full mb-8 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all"
        >
          ⬇ Download Today's Attendance (CSV)
        </button>

        {loading ? (
          <div className="text-center text-gray-300 py-16 text-lg">
            Loading...
          </div>
        ) : (
          <>
            {renderSection("Coaches", "🎯", TEAM.coaches)}
            {renderSection("Athletes", "🏃", TEAM.athletes)}
          </>
        )}

        <p className="text-center text-xs text-gray-300 mt-6">
          Resets automatically every day
        </p>
      </div>
    </main>
  );
}
