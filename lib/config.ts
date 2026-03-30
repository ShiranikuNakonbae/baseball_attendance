export type Member = { id: string; name: string };

export const TEAM: {
  coaches: Member[];
  athletes_minor: Member[];
  athletes_tball: Member[];
} = {
  coaches: [
    { id: "coach-dafiq", name: "Coach Dafiq" },
    { id: "coach-fajar", name: "Coach Fajar" },
    { id: "coach-apuy", name: "Coach Apuy" },
    { id: "coach-iki", name: "Coach Iki" },
  ],
  athletes_minor: [
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
    { id: "luna", name: "Luna" },
    { id: "ghazi", name: "Ghazi" },
  ],
  athletes_tball: [
    { id: "caca", name: "Caca" },
    { id: "tisha", name: "Tisha" },
    { id: "djalu", name: "Djalu" },
    { id: "saga", name: "Saga" },
    { id: "hawa", name: "Hawa" },
    { id: "hilya", name: "Hilya" },
    { id: "alif", name: "Alif" },
    { id: "reiner", name: "Reiner" },
  ],
};
