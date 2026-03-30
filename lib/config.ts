export type Member = { id: string; name: string };

export const TEAM: { coaches: Member[]; athletes: Member[] } = {
  coaches: [
    { id: "coach-dafiq", name: "Coach Dafiq" },
    { id: "coach-fajar", name: "Coach Fajar" },
    { id: "coach-apuy", name: "Coach Apuy" },
    { id: "coach-rafi", name: "Coach Rafi" },
  ],
  athletes: [
    { id: "player-1", name: "Arshaka" },
    { id: "player-2", name: "Aksara" },
    { id: "player-3", name: "Sabiyan" },
    { id: "player-4", name: "Hisyam" },
    { id: "player-5", name: "Dio" },
    { id: "player-6", name: "Juna" },
    { id: "player-7", name: "Rafka" },
    { id: "player-8", name: "Keinan" },
    { id: "player-9", name: "Keenan" },
    { id: "player-10", name: "Habibie" },
    { id: "player-11", name: "Zen" },
  ],
};
