import { useState } from "react";
import { ConsoleSelect } from "./components/ConsoleSelect";
import { FileInput } from "./components/FileInput";
import { RawViewer } from "../viewer/RawViewer";
import { MidasPreview } from "../viewer/MidasPreview";
import { MidasEQGraph } from "../viewer/MidasEQGraph";
import { DigicoPreview } from "../viewer/DigicoPreview";
import { DigicoEQGraph } from "../viewer/DigicoEQGraph";
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
  const [midasSelectedCh, setMidasSelectedCh] = useState<number | null>(null);

  const [digicoSession, setDigicoSession] = useState<DigicoSession | null>(null);
  const [digicoSelectedCh, setDigicoSelectedCh] = useState<number | null>(null);

  const handleFileSelected = async (selected: File) => {
    setFile(selected);
    setError(null);
    setContent(null);

    setMidasPreview(null);
    setMidasSelectedCh(null);
    setDigicoSession(null);
    setDigicoSelectedCh(null);

    try {
      // MIDAS text scene
      if (consoleId === "MIDAS") {
        const text = await readFileAsText(selected);
        setContent(text);

        const parsed = parseMidasText(text);
        setMidasPreview(parsed);

        // Optional: select first channel by default
        if (parsed.channels.length > 0) {
          setMidasSelectedCh(parsed.channels[0].index);
        }
        return;
      }

      // DiGiCo .session (SQLite)
      if (consoleId === "DIGICO") {
        const db = await openDigicoDbFromFile(selected);
        const session = parseDigicoSession(db);
        setDigicoSession(session);

        // Optional: select first channel by default
        if (session.channels.length > 0) {
          setDigicoSelectedCh(session.channels[0].channelNumber);
        }
        return;
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
        {/* Raw viewer is useful for Midas text files */}
        <RawViewer consoleId={consoleId} file={file} content={content} />

        {consoleId === "MIDAS" && midasPreview && (
          <>
            <MidasPreview
              preview={midasPreview}
              selectedChannel={midasSelectedCh}
              onSelectChannel={setMidasSelectedCh}
            />
            <MidasEQGraph
              preview={midasPreview}
              selectedChannel={midasSelectedCh}
            />
          </>
        )}

        {consoleId === "DIGICO" && digicoSession && (
          <>
            <DigicoPreview
              session={digicoSession}
              selectedChannel={digicoSelectedCh}
              onSelectChannel={setDigicoSelectedCh}
            />
            <DigicoEQGraph
              session={digicoSession}
              selectedChannel={digicoSelectedCh}
            />
          </>
        )}
      </section>
    </div>
  );
}
