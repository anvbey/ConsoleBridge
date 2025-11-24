// src/consoles/digico/types.ts

export interface DigicoEQBand {
  band: number;           // 1–4 (we can map from bandNumber 0–3)
  gain: number;           // dB
  frequencyHz: number;    // Hz
  q: number;
  bandType: number;       // raw bandType for now
}

export interface DigicoDynamics {
  threshold: number | null;
  knee: number | null;
  ratio: number | null;
  attack: number | null;
  release: number | null;
  hold: number | null;
  gain: number | null;
  range: number | null;   // gate range mainly
}

export interface DigicoChannel {
  channelNumber: number;
  name: string;
  preampGain: number | null;   // from Channel.gain
  eqBands: DigicoEQBand[];     // 4 bands (or more later)
  comp: DigicoDynamics;
  gate: DigicoDynamics;
}

export interface DigicoSession {
  snapshotId: number;
  channels: DigicoChannel[];
}
