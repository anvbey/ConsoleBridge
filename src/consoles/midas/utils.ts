// Parse Midas/X32-style frequency like "124.7", "1k97", "10k02" into Hz
export function parseMidasFreq(freq: string): number {
  const trimmed = freq.trim();
  if (!trimmed) return 1000;

  const kIndex = trimmed.toLowerCase().indexOf("k");
  if (kIndex >= 0) {
    const left = trimmed.slice(0, kIndex); // "1"
    const right = trimmed.slice(kIndex + 1); // "97" or "02"

    const base = parseFloat(left || "0");
    const frac = right ? parseFloat(right) / 100 : 0;

    const hz = (base + (isNaN(frac) ? 0 : frac)) * 1000;
    return isNaN(hz) ? 1000 : hz;
  }

  const hz = parseFloat(trimmed);
  if (!isNaN(hz)) return hz;

  return 1000;
}
