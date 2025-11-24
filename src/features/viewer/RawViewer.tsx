// // # for phase 1: preview raw file

//  # future:
//     # midas/parser.ts
//     # digico/parser.ts
// src/features/viewer/RawViewer.tsx
import type { ConsoleId } from "../upload/types";

interface Props {
  consoleId: ConsoleId | "";
  file: File | null;
  content: string | null;
}

export function RawViewer({ consoleId, file, content }: Props) {
  if (!file || !content) {
    return null;
  }

  const sizeKb = (file.size / 1024).toFixed(1);
  const preview = content.length > 5000 ? content.slice(0, 5000) + "\n\n...[truncated]..." : content;

  return (
    <div className="raw-viewer">
      <h2>Session Preview</h2>

      <div className="raw-meta">
        <div><strong>Console:</strong> {consoleId || "Unknown"}</div>
        <div><strong>File name:</strong> {file.name}</div>
        <div><strong>File type:</strong> {file.type || "n/a"}</div>
        <div><strong>File size:</strong> {sizeKb} KB</div>
      </div>

      <h3>Raw content</h3>
      <pre className="raw-content">{preview}</pre>
    </div>
  );
}
