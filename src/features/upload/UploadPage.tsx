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

import { digicoToMidasText } from "../../conversion/digicoToMidas";
import { midasToDigicoSession } from "../../conversion/midasToDigico";

export function UploadPage() {
  const [consoleId, setConsoleId] = useState<ConsoleId | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [midasPreview, setMidasPreview] = useState<MidasSession | null>(null);
  const [midasSelectedCh, setMidasSelectedCh] = useState<number | null>(null);

  const [digicoSession, setDigicoSession] = useState<DigicoSession | null>(null);
  const [digicoSelectedCh, setDigicoSelectedCh] = useState<number | null>(null);

  const [midasExportText, setMidasExportText] = useState<string | null>(null); // DiGiCo -> Midas
  const [digicoExportJson, setDigicoExportJson] = useState<string | null>(null); // Midas -> DiGiCo

  const handleFileSelected = async (selected: File) => {
    setFile(selected);
    setError(null);
    setContent(null);

    setMidasPreview(null);
    setMidasSelectedCh(null);
    setDigicoSession(null);
    setDigicoSelectedCh(null);
    setMidasExportText(null);
    setDigicoExportJson(null);

    try {
      // ----- MIDAS TEXT -----
      if (consoleId === "MIDAS") {
        const text = await readFileAsText(selected);
        setContent(text);

        const parsed = parseMidasText(text);
        setMidasPreview(parsed);

        if (parsed.channels.length > 0) {
          setMidasSelectedCh(parsed.channels[0].index);
        }
        return;
      }

      // ----- DIGICO SQLITE (.session) -----
      if (consoleId === "DIGICO") {
        const db = await openDigicoDbFromFile(selected);
        const session = parseDigicoSession(db);
        setDigicoSession(session);

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

  // DiGiCo -> Midas text export
  const handleExportDigicoToMidas = () => {
    if (!digicoSession) return;

    const text = digicoToMidasText(digicoSession);
    setMidasExportText(text);

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "digico_to_midas_session.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Midas -> DiGiCo JSON export
  const handleExportMidasToDigico = () => {
    if (!midasPreview) return;

    const session = midasToDigicoSession(midasPreview);
    const json = JSON.stringify(session, null, 2);
    setDigicoExportJson(json);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "midas_to_digico_session.json";
    a.click();
    URL.revokeObjectURL(url);
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
        {/* Raw text only meaningful for Midas text files */}
        <RawViewer consoleId={consoleId} file={file} content={content} />

        {/* MIDAS VIEW + EXPORT TO DIGICO */}
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

            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleExportMidasToDigico}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e5e7eb",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  marginRight: "0.5rem",
                }}
              >
                Export to DiGiCo (JSON)
              </button>
            </div>

            {digicoExportJson && (
              <div className="viewer-panel" style={{ marginTop: "1rem" }}>
                <h2>DiGiCo Export Preview</h2>
                <pre className="raw-content">{digicoExportJson}</pre>
              </div>
            )}
          </>
        )}

        {/* DIGICO VIEW + EXPORT TO MIDAS */}
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

            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleExportDigicoToMidas}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e5e7eb",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Export to Midas (Text)
              </button>
            </div>

            {midasExportText && (
              <div className="viewer-panel" style={{ marginTop: "1rem" }}>
                <h2>Midas Export Preview</h2>
                <pre className="raw-content">{midasExportText}</pre>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
