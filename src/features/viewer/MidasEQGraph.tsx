import React from "react";
import type { MidasSession } from "../../consoles/midas/types";
import { EQGraph, type EQBandPoint } from "./EQGraph";
import { parseMidasFreq } from "../../consoles/midas/utils";

interface Props {
  preview: MidasSession;
  selectedChannel: number | null;
}

export function MidasEQGraph({ preview, selectedChannel }: Props) {
  if (!selectedChannel) return null;

  const ch = preview.channels.find((c) => c.index === selectedChannel);
  if (!ch) return null;

  const bands: EQBandPoint[] = ch.eqBands.map((b) => ({
    freqHz: parseMidasFreq(b.freq),
    gainDb: b.gain,
    q: b.q,
    label: `${b.mode} ${b.band}`,
  }));

  return (
    <EQGraph
      bands={bands}
      title={`Midas EQ – Ch ${ch.index} ${ch.name || ""}`}
    />
  );
}
