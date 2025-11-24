// src/intermediate/model.ts
export type ConsoleId = "MIDAS" | "DIGICO";

export interface IntermediateEQBand {
  index: number;
  type: "bell" | "low_shelf" | "high_shelf" | "hp" | "lp";
  freqHz: number;
  gainDb: number;
  q: number;
  enabled: boolean;
}

export interface IntermediateComp {
  enabled: boolean;
  thresholdDb: number;
  ratio: number;
  attackMs: number;
  releaseMs: number;
}

export interface IntermediateGate {
  enabled: boolean;
  thresholdDb: number;
  rangeDb: number;
  attackMs: number;
  releaseMs: number;
}

export interface IntermediateRouting {
  input: number | null;
  outputBus: string | null;
  pan: number; // -1 to 1
}

export interface IntermediateSend {
  busName: string;
  levelDb: number;
  enabled: boolean;
}

export interface IntermediateChannel {
  id: number;
  name: string;
  type: "mono" | "stereo";
  eq: {
    enabled: boolean;
    bands: IntermediateEQBand[];
  };
  comp: IntermediateComp;
  gate: IntermediateGate;
  routing: IntermediateRouting;
  sends: IntermediateSend[];
}

export interface IntermediateSession {
  sourceConsole: ConsoleId;
  channels: IntermediateChannel[];
  // later: snapshots, buses, etc.
}
