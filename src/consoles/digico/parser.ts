// src/consoles/digico/parser.ts
import type { Database } from "sql.js";
import type {
  DigicoSession,
  DigicoChannel,
  DigicoEQBand,
  DigicoDynamics,
} from "./types";

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

// tiny helper to get rows as plain objects
function execToObjects(db: Database, sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const rows: any[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    return rows;
  } finally {
    stmt.free();
  }
}

// pick first non-zero snapshotId for input channels
function getDefaultSnapshotId(db: Database): number {
  const rows = execToObjects(
    db,
    `
    SELECT DISTINCT snapshotId
    FROM Channel
    WHERE snapshotId != 0
      AND type = 0
    ORDER BY snapshotId
    LIMIT 1
    `
  );

  if (rows.length === 0) return 0;
  return Number(rows[0].snapshotId) || 0;
}

// main parse function: db -> DigicoSession
export function parseDigicoSession(db: Database): DigicoSession {
  const snapshotId = getDefaultSnapshotId(db);

  const channelRows = execToObjects(
    db,
    `
    SELECT channelNumber, name, gain
    FROM Channel
    WHERE snapshotId = ?
      AND type = 0
    ORDER BY channelNumber
    `,
    [snapshotId]
  );

  const channels = new Map<number, DigicoChannel>();

  const getChannel = (chNum: number): DigicoChannel => {
    let ch = channels.get(chNum);
    if (!ch) {
      ch = {
        channelNumber: chNum,
        name: "",
        preampGain: null,
        eqBands: [],
        comp: emptyDynamics(),
        gate: emptyDynamics(),
      };
      channels.set(chNum, ch);
    }
    return ch;
  };

  // 1) Names + preamp gain
  for (const row of channelRows) {
    const chNum = Number(row.channelNumber);
    if (Number.isNaN(chNum)) continue;
    const ch = getChannel(chNum);
    ch.name = row.name ?? "";
    ch.preampGain = typeof row.gain === "number" ? row.gain : null;
  }

  // 2) EQ bands
  const eqRows = execToObjects(
    db,
    `
    SELECT channelNumber,
           bandNumber,
           gain,
           frequency,
           qvalue,
           bandType
    FROM EqualiserBand
    WHERE snapshotId = ?
      AND channelType = 0
    ORDER BY channelNumber, bandNumber
    `,
    [snapshotId]
  );

  for (const row of eqRows) {
    const chNum = Number(row.channelNumber);
    const bandNumber = Number(row.bandNumber); // 0..3
    if (Number.isNaN(chNum) || Number.isNaN(bandNumber)) continue;

    const ch = getChannel(chNum);

    const band: DigicoEQBand = {
      band: bandNumber + 1,
      gain: typeof row.gain === "number" ? row.gain : 0,
      frequencyHz: typeof row.frequency === "number" ? row.frequency : 0,
      q: typeof row.qvalue === "number" ? row.qvalue : 0.7,
      bandType: typeof row.bandType === "number" ? row.bandType : 0,
    };

    const idx = ch.eqBands.findIndex((b) => b.band === band.band);
    if (idx >= 0) ch.eqBands[idx] = band;
    else ch.eqBands.push(band);
  }

  // 3) Dynamics: compressor (0) + gate (3)
  const dynRows = execToObjects(
    db,
    `
    SELECT channelNumber,
           processorNumber,
           gain,
           range,
           threashold,
           knee,
           ratio,
           attack,
           release,
           hold
    FROM DynamicProcessor
    WHERE snapshotId = ?
      AND channelType = 0
      AND processorNumber IN (0, 3)
    ORDER BY channelNumber, processorNumber
    `,
    [snapshotId]
  );

  for (const row of dynRows) {
    const chNum = Number(row.channelNumber);
    const procNum = Number(row.processorNumber);
    if (Number.isNaN(chNum) || Number.isNaN(procNum)) continue;

    const ch = getChannel(chNum);

    const dyn: DigicoDynamics = {
      threshold:
        typeof row.threashold === "number" ? row.threashold : null, // note column spelling
      knee: typeof row.knee === "number" ? row.knee : null,
      ratio: typeof row.ratio === "number" ? row.ratio : null,
      attack: typeof row.attack === "number" ? row.attack : null,
      release: typeof row.release === "number" ? row.release : null,
      hold: typeof row.hold === "number" ? row.hold : null,
      gain: typeof row.gain === "number" ? row.gain : null,
      range: typeof row.range === "number" ? row.range : null,
    };

    if (procNum === 0) {
      ch.comp = dyn;
    } else if (procNum === 3) {
      ch.gate = dyn;
    }
  }

  return {
    snapshotId,
    channels: Array.from(channels.values()).sort(
      (a, b) => a.channelNumber - b.channelNumber
    ),
  };
}
