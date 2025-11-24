import type {
  MidasSession,
  MidasChannel,
  MidasEQBand,
  MidasComp,
  MidasGate,
} from "./types";

function defaultComp(): MidasComp {
  return {
    threshold: null,
    ratio: null,
    gain: null,
    attack: null,
    hold: null,
    release: null,
  };
}

function defaultGate(): MidasGate {
  return {
    threshold: null,
    range: null,
    attack: null,
    hold: null,
    release: null,
  };
}

// Parse Midas scene file text into our MidasSession model
export function parseMidasText(text: string): MidasSession {
  const lines = text.split(/\r?\n/);

  // headamp index -> gain
  const headampGains: Record<number, number> = {};

  // channel index -> channel object
  const channels = new Map<number, MidasChannel>();

  const getChannel = (index: number): MidasChannel => {
    let ch = channels.get(index);
    if (!ch) {
      ch = {
        index,
        name: "",
        preampGain: null,
        eqBands: [],
        comp: defaultComp(),
        gate: defaultGate(),
      };
      channels.set(index, ch);
    }
    return ch;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // --- headamp lines ---
    if (line.startsWith("/headamp/")) {
      // Example: /headamp/000 +16.5 OFF
      const parts = line.split(/\s+/);
      const path = parts[0]; // /headamp/000
      const gainToken = parts[1]; // +16.5

      const pathParts = path.split("/");
      // ["", "headamp", "000"]
      const idxStr = pathParts[2];
      const idx = parseInt(idxStr, 10);
      if (!Number.isNaN(idx) && gainToken) {
        const gain = parseFloat(gainToken.replace("+", ""));
        if (!Number.isNaN(gain)) {
          headampGains[idx] = gain;
        }
      }
      continue;
    }

    // --- channel lines ---
    if (!line.startsWith("/ch/")) continue;

    const firstSpaceIdx = line.indexOf(" ");
    const pathPart = firstSpaceIdx === -1 ? line : line.slice(0, firstSpaceIdx);
    const rest = firstSpaceIdx === -1 ? "" : line.slice(firstSpaceIdx + 1).trim();

    const pathSegments = pathPart.split("/");
    // ["", "ch", "01", "config"] or ["", "ch", "01", "eq", "1"]
    const chIdxStr = pathSegments[2];
    const section = pathSegments[3] ?? "";
    const extra = pathSegments[4]; // eq band index etc.

    const chIndex = parseInt(chIdxStr, 10);
    if (Number.isNaN(chIndex)) continue;
    const ch = getChannel(chIndex);

    // Split rest into tokens
    const tokens = rest.length > 0 ? rest.split(/\s+/) : [];

    // --- handle sections ---
    switch (section) {
      case "config": {
        // /ch/01/config "Test" 1 YE 1
        const nameMatch = line.match(/"(.*)"/);
        if (nameMatch) {
          ch.name = nameMatch[1];
        }
        break;
      }

      case "eq": {
        // /ch/01/eq/1 PEQ 124.7 +0.00 2.0
        const bandStr = extra;
        if (!bandStr) break;
        const bandIndex = parseInt(bandStr, 10);
        if (Number.isNaN(bandIndex)) break;

        const [mode, freq, gainToken, qToken] = tokens;
        if (!mode || !freq || !gainToken || !qToken) break;

        const gain = parseFloat(gainToken.replace("+", ""));
        const q = parseFloat(qToken);

        const band: MidasEQBand = {
          band: bandIndex,
          mode,
          freq, // keep raw string
          gain: Number.isNaN(gain) ? 0 : gain,
          q: Number.isNaN(q) ? 0 : q,
        };

        // replace or insert band in ch.eqBands
        const existingIndex = ch.eqBands.findIndex((b) => b.band === bandIndex);
        if (existingIndex >= 0) {
          ch.eqBands[existingIndex] = band;
        } else {
          ch.eqBands.push(band);
        }

        break;
      }

      case "dyn": {
        // /ch/01/dyn ON COMP PEAK LOG -26.0 5.0 1 9.00 60 0.45  703 POST 0 65 OFF
        // tokens:
        // 0: ON
        // 1: COMP
        // 2: PEAK
        // 3: LOG
        // 4: -26.0 (thr)
        // 5: 5.0   (ratio)
        // 6: 1     (ignored)
        // 7: 9.00  (gain)
        // 8: 60    (attack)
        // 9: 0.45  (hold)
        // 10: 703  (release)
        if (tokens.length >= 11 && tokens[1] === "COMP") {
          const threshold = parseFloat(tokens[4]);
          const ratio = parseFloat(tokens[5]);
          const gain = parseFloat(tokens[7]);
          const attack = parseFloat(tokens[8]);
          const hold = parseFloat(tokens[9]);
          const release = parseFloat(tokens[10]);

          ch.comp = {
            threshold: Number.isNaN(threshold) ? null : threshold,
            ratio: Number.isNaN(ratio) ? null : ratio,
            gain: Number.isNaN(gain) ? null : gain,
            attack: Number.isNaN(attack) ? null : attack,
            hold: Number.isNaN(hold) ? null : hold,
            release: Number.isNaN(release) ? null : release,
          };
        }
        break;
      }

      case "gate": {
        // /ch/01/gate ON GATE -60.0 43.0 33 1.42  28 0
        // tokens:
        // 0: ON
        // 1: GATE
        // 2: -60.0  (thr)
        // 3: 43.0   (range)
        // 4: 33     (attack)
        // 5: 1.42   (hold)
        // 6: 28     (release)
        if (tokens.length >= 7 && tokens[1] === "GATE") {
          const threshold = parseFloat(tokens[2]);
          const range = parseFloat(tokens[3]);
          const attack = parseFloat(tokens[4]);
          const hold = parseFloat(tokens[5]);
          const release = parseFloat(tokens[6]);

          ch.gate = {
            threshold: Number.isNaN(threshold) ? null : threshold,
            range: Number.isNaN(range) ? null : range,
            attack: Number.isNaN(attack) ? null : attack,
            hold: Number.isNaN(hold) ? null : hold,
            release: Number.isNaN(release) ? null : release,
          };
        }
        break;
      }

      default:
        // ignore for now (mix, grp, automix, etc.)
        break;
    }
  }

  // Attach headamp gains -> preamp
  for (const [idx, ch] of channels) {
    const headIdx = idx - 1; // /headamp/000 => ch 1
    if (headampGains[headIdx] !== undefined) {
      ch.preampGain = headampGains[headIdx];
    }
  }

  // Return sorted by channel index
  return {
    channels: Array.from(channels.values()).sort(
      (a, b) => a.index - b.index
    ),
  };
}
