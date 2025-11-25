// src/conversion/midasToDigico.ts
import type { MidasSession } from "../consoles/midas/types";
import type {
  DigicoSession,
  DigicoChannel,
  DigicoEQBand,
  DigicoDynamics,
} from "../consoles/digico/types";
import { parseMidasFreq } from "../consoles/midas/utils";

function emptyDynamics(): DigicoDynamics {
  return {
    threshold: null,
    knee: null,
    ratio: null,
    attack: null,
    release: null,
    hold: null,
    gain: null,
    range: null,
  };
}

// Convert a parsed MidasSession into a DigicoSession-shaped object.
// This won't be a real .session SQLite DB yet, but it's a clean,
// DiGiCo-style model we can later store into a DB if needed.
export function midasToDigicoSession(midas: MidasSession): DigicoSession {
  const snapshotId = 10000; // arbitrary snapshot ID for now

  const channels: DigicoChannel[] = midas.channels.map((mCh) => {
    const channelNumber = mCh.index; // Midas index -> DiGiCo channelNumber
    const name = mCh.name || `Ch ${channelNumber}`;
    const preampGain = mCh.preampGain ?? null;

    const eqBands: DigicoEQBand[] = mCh.eqBands.map((b) => ({
      band: b.band, // 1..4
      gain: b.gain,
      frequencyHz: parseMidasFreq(b.freq),
      q: b.q,
      bandType: 0, // placeholder; could map PEQ/shelf/etc. later
    }));

    const comp: DigicoDynamics = {
      ...emptyDynamics(),
      threshold: mCh.comp.threshold,
      ratio: mCh.comp.ratio,
      gain: mCh.comp.gain,
      attack: mCh.comp.attack,
      hold: mCh.comp.hold,
      release: mCh.comp.release,
      // knee + range left null for now
    };

    const gate: DigicoDynamics = {
      ...emptyDynamics(),
      threshold: mCh.gate.threshold,
      range: mCh.gate.range,
      attack: mCh.gate.attack,
      hold: mCh.gate.hold,
      release: mCh.gate.release,
    };

    return {
      channelNumber,
      name,
      preampGain,
      eqBands,
      comp,
      gate,
    };
  });

  return {
    snapshotId,
    channels: channels.sort((a, b) => a.channelNumber - b.channelNumber),
  };
}
