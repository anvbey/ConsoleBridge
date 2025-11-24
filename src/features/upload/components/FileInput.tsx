// src/features/upload/components/FileInput.tsx
import React from "react";

interface Props {
  onFileSelected: (file: File) => void;
}

export function FileInput({ onFileSelected }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="field">
      <label className="field-label">Session file</label>
      <input
        className="field-input"
        type="file"
        onChange={handleChange}
      />
    </div>
  );
}
