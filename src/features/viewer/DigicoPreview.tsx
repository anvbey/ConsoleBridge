import React from "react";
import type { DigicoSession } from "../../consoles/digico/types";

interface Props {
  session: DigicoSession;
}

export function DigicoPreview({ session }: Props) {
  const channels = session.channels ?? [];

  if (channels.length === 0) {
    return (
      <div className="viewer-panel" style={{ marginTop: "1rem" }}>
        <h2>DiGiCo Parsed View</h2>
        <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
          No channels were parsed for this snapshot.
        </p>
      </div>
    );
  }

  return (
    <div className="viewer-panel" style={{ marginTop: "1rem" }}>
      <h2>DiGiCo Parsed View (snapshot {session.snapshotId})</h2>
      <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
        Channels parsed: {channels.length}
      </p>

      <div
        style={{
          maxHeight: 350,
          overflow: "auto",
          borderRadius: "0.5rem",
          border: "1px solid #1e293b",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.78rem",
            minWidth: "900px",
          }}
        >
          <thead>
            <tr style={{ background: "#020617" }}>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>Ch</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>Preamp</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>EQ1</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>EQ2</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>EQ3</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>EQ4</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>Comp</th>
              <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>Gate</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((ch) => {
              const eqByBand = new Map(ch.eqBands.map((b) => [b.band, b]));
              const eqCell = (band: number) => {
                const b = eqByBand.get(band);
                if (!b) return "-";
                return `${b.frequencyHz}Hz ${b.gain}dB Q=${b.q}`;
              };

              const c = ch.comp;
              const g = ch.gate;

              const compText =
                c.threshold === null
                  ? "-"
                  : `Th ${c.threshold} | Rt ${c.ratio} | G ${c.gain} | Atk ${c.attack} | Hold ${c.hold} | Rel ${c.release}`;

              const gateText =
                g.threshold === null
                  ? "-"
                  : `Th ${g.threshold} | Rng ${g.range} | Atk ${g.attack} | Hold ${g.hold} | Rel ${g.release}`;

              const baseCell: React.CSSProperties = {
                padding: "0.35rem 0.6rem",
                borderTop: "1px solid #1e293b",
              };

              return (
                <tr key={ch.channelNumber}>
                  <td style={baseCell}>{ch.channelNumber}</td>
                  <td style={baseCell}>{ch.name || "-"}</td>
                  <td style={baseCell}>{ch.preampGain ?? "-"} dB</td>
                  <td style={baseCell}>{eqCell(1)}</td>
                  <td style={baseCell}>{eqCell(2)}</td>
                  <td style={baseCell}>{eqCell(3)}</td>
                  <td style={baseCell}>{eqCell(4)}</td>
                  <td style={baseCell}>{compText}</td>
                  <td style={baseCell}>{gateText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
