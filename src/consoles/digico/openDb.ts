// src/consoles/digico/openDb.ts
import initSqlJs, { Database } from "sql.js";

// Open a DiGiCo .session file (SQLite) into a sql.js Database
export async function openDigicoDbFromFile(file: File): Promise<Database> {
  const SQL = await initSqlJs({
    // adjust path if needed; this works with vite typically if you copy sql-wasm.wasm
    locateFile: (fileName) => `https://sql.js.org/dist/${fileName}`,
  });

  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));
  return db;
}
