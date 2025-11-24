export interface DigicoEQBand {
  band: number;        // 1..4
  gain: number;
  frequencyHz: number;
  q: number;
  bandType: number;
}

export interface DigicoDynamics {
  threshold: number | null;
  knee: number | null;
  ratio: number | null;
  attack: number | null;
  release: number | null;
  hold: number | null;
  gain: number | null;
  range: number | null;
}

export interface DigicoChannel {
  channelNumber: number;
  name: string;
  preampGain: number | null;
  eqBands: DigicoEQBand[];
  comp: DigicoDynamics;
  gate: DigicoDynamics;
}

export interface DigicoSession {
  snapshotId: number;
  channels: DigicoChannel[];
}
