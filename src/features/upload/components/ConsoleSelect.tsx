import { CONSOLES } from "../types";
import type { ConsoleId } from "../types";


interface Props {
  value: ConsoleId | "";
  onChange: (value: ConsoleId) => void;
}

export function ConsoleSelect({ value, onChange }: Props) {
  return (
    <div className="field">
      <label className="field-label">Console</label>
      <select
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value as ConsoleId)}
      >
        <option value="">Select console...</option>
        {CONSOLES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
