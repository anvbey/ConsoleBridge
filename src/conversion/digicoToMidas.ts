// src/conversion/digicoToMidas.ts
import type { DigicoSession } from "../consoles/digico/types";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}

function formatSigned(value: number, digits: number = 1): string {
  const str = value.toFixed(digits);
  return str.startsWith("-") ? str : "+" + str;
}

// Main conversion: DiGiCoSession -> Midas-style text file
export function digicoToMidasText(session: DigicoSession): string {
  const lines: string[] = [];

  lines.push(`# Converted from DiGiCo snapshot ${session.snapshotId}`);
  lines.push(`# Channels: ${session.channels.length}`);
  lines.push("");

  const channels = session.channels;

  for (const ch of channels) {
    const chNumStr = pad2(ch.channelNumber);
    const headIdx = ch.channelNumber - 1;
    const headIdxStr = pad3(headIdx);

    const name = ch.name || `Ch ${ch.channelNumber}`;
    const preamp = ch.preampGain ?? 0;

    // Channel config line
    lines.push(`/ch/${chNumStr}/config "${name}" 1 YE 1`);

    // Headamp / preamp
    lines.push(
      `/headamp/${headIdxStr} ${formatSigned(preamp, 1)} OFF`
    );

    // ----- Gate -----
    const g = ch.gate;
    if (g.threshold != null) {
      const thr = g.threshold.toFixed(1);
      const range = (g.range ?? 0).toFixed(1);
      const attack = (g.attack ?? 0).toFixed(0);
      const hold = (g.hold ?? 0).toFixed(2);
      const rel = (g.release ?? 0).toFixed(0);

      lines.push(
        `/ch/${chNumStr}/gate ON GATE ${thr} ${range} ${attack} ${hold}  ${rel} 0`
      );
    } else {
      // Gate off, basic defaults
      lines.push(
        `/ch/${chNumStr}/gate OFF GATE 0.0 0.0 0 0.00  0 0`
      );
    }

    // ----- Compressor (dyn) -----
    const c = ch.comp;
    if (c.threshold != null) {
      const thr = c.threshold.toFixed(1);
      const ratio = (c.ratio ?? 1).toFixed(1);
      const gain = (c.gain ?? 0).toFixed(2);
      const attack = (c.attack ?? 0).toFixed(0);
      const hold = (c.hold ?? 0).toFixed(2);
      const rel = (c.release ?? 0).toFixed(0);

      lines.push(
        `/ch/${chNumStr}/dyn ON COMP PEAK LOG ${thr} ${ratio} 1 ${gain} ${attack} ${hold}  ${rel} POST 0 65 OFF`
      );
    } else {
      lines.push(
        `/ch/${chNumStr}/dyn OFF COMP PEAK LOG 0.0 1.0 1 0.00 0 0.00  0 POST 0 65 OFF`
      );
    }

    // ----- EQ -----
    lines.push(`/ch/${chNumStr}/eq ON`);

    const bandsSorted = [...ch.eqBands].sort((a, b) => a.band - b.band);

    for (const b of bandsSorted.slice(0, 4)) {
      const bandIdx = b.band; // 1–4
      const mode = "PEQ"; // we could map from bandType later
      const freq = b.frequencyHz.toFixed(1);
      const gain = b.gain.toFixed(2);
      const q = b.q.toFixed(2);

      lines.push(
        `/ch/${chNumStr}/eq/${bandIdx} ${mode} ${freq} ${gain} ${q}`
      );
    }

    lines.push(""); // blank line between channels
  }

  return lines.join("\n");
}
