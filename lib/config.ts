export type Member = { id: string; name: string };

export const TEAM: { coaches: Member[]; athletes: Member[] } = {
  coaches: [
    { id: "coach-dafiq", name: "Coach Dafiq" },
    { id: "coach-fajar", name: "Coach Fajar" },
    { id: "coach-apuy", name: "Coach Apuy" },
    { id: "coach-rafi", name: "Coach Rafi" },
  ],
  athletes: [
    { id: "shaka", name: "Arshaka" },
    { id: "aksara", name: "Aksara" },
    { id: "sabi", name: "Sabiyan" },
    { id: "hisyam", name: "Hisyam" },
    { id: "dio", name: "Dio" },
    { id: "juna", name: "Juna" },
    { id: "rafka", name: "Rafka" },
    { id: "keinan", name: "Keinan" },
    { id: "keenan", name: "Keenan" },
    { id: "habibie", name: "Habibie" },
    { id: "zen", name: "Zen" },
  ],
};
