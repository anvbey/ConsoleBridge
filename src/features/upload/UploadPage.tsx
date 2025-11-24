import { useState } from "react";
import { ConsoleSelect } from "./components/ConsoleSelect";
import { FileInput } from "./components/FileInput";
import { RawViewer } from "../viewer/RawViewer";
import { MidasPreview } from "../viewer/MidasPreview";
import { DigicoPreview } from "../viewer/DigicoPreview";
import type { ConsoleId } from "./types";
import { readFileAsText } from "../../shared/utils/file";
import type { MidasSession } from "../../consoles/midas/types";
import { parseMidasText } from "../../consoles/midas/parser";
import type { DigicoSession } from "../../consoles/digico/types";
import { openDigicoDbFromFile } from "../../consoles/digico/openDb";
import { parseDigicoSession } from "../../consoles/digico/parser";

export function UploadPage() {
  const [consoleId, setConsoleId] = useState<ConsoleId | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [midasPreview, setMidasPreview] = useState<MidasSession | null>(null);
  const [digicoSession, setDigicoSession] = useState<DigicoSession | null>(null);

  const handleFileSelected = async (selected: File) => {
    setFile(selected);
    setError(null);
    setContent(null);
    setMidasPreview(null);
    setDigicoSession(null);

    try {
      if (consoleId === "MIDAS") {
        const text = await readFileAsText(selected);
        setContent(text);
        const parsed = parseMidasText(text);
        setMidasPreview(parsed);
      } else if (consoleId === "DIGICO") {
        // For DiGiCo we don’t bother with raw text, it’s binary SQLite.
        const db = await openDigicoDbFromFile(selected);
        const session = parseDigicoSession(db);
        setDigicoSession(session);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to read/parse file");
    }
  };

  return (
    <div className="upload-page">
      <section className="upload-panel">
        <h2>Load Session</h2>
        <ConsoleSelect value={consoleId} onChange={setConsoleId} />
        <FileInput onFileSelected={handleFileSelected} />
        {error && <div className="error">{error}</div>}
      </section>

      <section>
        {/* RawViewer mostly useful for Midas text files */}
        <RawViewer consoleId={consoleId} file={file} content={content} />

        {consoleId === "MIDAS" && midasPreview && (
          <MidasPreview preview={midasPreview} />
        )}

        {consoleId === "DIGICO" && digicoSession && (
          <DigicoPreview session={digicoSession} />
        )}
      </section>
    </div>
  );
}
