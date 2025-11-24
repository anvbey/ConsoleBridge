// src/features/upload/types.ts
export type ConsoleId = "MIDAS" | "DIGICO"; // easy to extend later

export const CONSOLES: { id: ConsoleId; label: string }[] = [
  { id: "MIDAS", label: "Midas" },
  { id: "DIGICO", label: "DiGiCo" },
];
