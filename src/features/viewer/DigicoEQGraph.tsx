import React from "react";
import type { DigicoSession } from "../../consoles/digico/types";
import { EQGraph } from "./EQGraph";
import type { EQBandPoint } from "./EQGraph";

interface Props {
  session: DigicoSession;
  selectedChannel: number | null;
}

export function DigicoEQGraph({ session, selectedChannel }: Props) {
  if (!selectedChannel) return null;

  const ch = session.channels.find(
    (c) => c.channelNumber === selectedChannel
  );
  if (!ch) return null;

  const bands: EQBandPoint[] = ch.eqBands.map((b) => ({
    freqHz: b.frequencyHz,
    gainDb: b.gain,
    q: b.q,
    label: `Band ${b.band}`,
  }));

  return (
    <EQGraph
      bands={bands}
      title={`DiGiCo EQ – Ch ${ch.channelNumber} ${ch.name || ""}`}
    />
  );
}
