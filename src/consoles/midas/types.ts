// Basic EQ band for Midas channel
export interface MidasEQBand {
  band: number;      // 1–4
  mode: string;      // PEQ, HShv, etc.
  freq: string;      // keep as string for now: "124.7", "1k97"
  gain: number;      // dB
  q: number;
}

// Compressor parameters we care about
export interface MidasComp {
  threshold: number | null;
  ratio: number | null;
  gain: number | null;
  attack: number | null;
  hold: number | null;
  release: number | null;
}

// Gate parameters we care about
export interface MidasGate {
  threshold: number | null;
  range: number | null;
  attack: number | null;
  hold: number | null;
  release: number | null;
}

// One channel in the session
export interface MidasChannel {
  index: number;           // 1,2,3,...
  name: string;            // "Test"
  preampGain: number | null;  // from /headamp/000 etc, in dB
  eqBands: MidasEQBand[];  // up to 4 bands
  comp: MidasComp;
  gate: MidasGate;
}

// Whole session preview
export interface MidasSession {
  channels: MidasChannel[];
}
