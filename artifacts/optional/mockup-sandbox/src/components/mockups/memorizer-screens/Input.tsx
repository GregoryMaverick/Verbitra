import { useState } from "react";
import { T, geist, lora } from "./_tokens";
import { DataProvider, useData } from "./data";

const SAMPLE_TEXT = `You have the right to remain silent. Anything you say can and will be used against you in a court of law. You have the right to an attorney. If you cannot afford an attorney, one will be appointed for you.`;

function InputContent() {
  const { addText } = useData();
  const [text, setText] = useState(SAMPLE_TEXT);
  const [saved, setSaved] = useState(false);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isValid = wordCount > 0 && wordCount <= 500;

  function handleNext() {
    if (!isValid) return;
    addText(text, null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 20px 6px" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect x="0" y="4" width="3" height="8" rx="1" fill={T.secondary} />
            <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill={T.secondary} />
            <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill={T.text} />
          </svg>
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button style={{ background: "none", border: "none", color: T.secondary, cursor: "pointer", padding: 0, fontSize: 24, lineHeight: 1 }}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>Add text</div>
          <div style={{ fontSize: 12, color: T.tertiary }}>Paste, upload, or capture</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px", gap: 12, overflow: "hidden" }}>
        <div style={{ position: "relative", flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.tertiary, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Your text</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontFamily: lora, fontSize: 15, color: T.text, lineHeight: 1.75,
                resize: "none", width: "100%", boxSizing: "border-box",
              }}
              placeholder="Paste your text here…"
            />
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${T.surface})`, pointerEvents: "none" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isValid ? T.correct : T.wrong }} />
            <span style={{ fontSize: 13, color: isValid ? T.correct : T.wrong, fontFamily: geist, fontWeight: 600 }}>{wordCount} words</span>
            <span style={{ fontSize: 12, color: T.tertiary }}> / 500 max</span>
          </div>
          <button
            onClick={() => setText("")}
            style={{ background: "none", border: "none", color: T.tertiary, cursor: "pointer", fontSize: 12, fontFamily: geist, textDecoration: "underline" }}>Clear</button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 10px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="5" width="16" height="14" rx="2" stroke={T.secondary} strokeWidth="1.5" />
              <path d="M7 5V4a2 2 0 014 0v1" stroke={T.secondary} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 11h8M7 14h5" stroke={T.secondary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.secondary, fontFamily: geist }}>Upload file</span>
            <span style={{ fontSize: 10, color: T.tertiary, fontFamily: geist }}>PDF, .docx</span>
          </button>
          <button style={{
            flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 10px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2a4 4 0 014 4v1h1a3 3 0 013 3v6a3 3 0 01-3 3H6a3 3 0 01-3-3V10a3 3 0 013-3h1V6a4 4 0 014-4z" stroke={T.secondary} strokeWidth="1.5" />
              <circle cx="11" cy="13" r="2.5" stroke={T.secondary} strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.secondary, fontFamily: geist }}>Camera OCR</span>
            <span style={{ fontSize: 10, color: T.tertiary, fontFamily: geist }}>Scan printed text</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={!isValid}
          style={{
            background: isValid ? (saved ? T.correct : T.primary) : T.border,
            border: "none", borderRadius: 14, padding: "16px",
            color: isValid ? "#fff" : T.tertiary, fontFamily: geist, fontSize: 16, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: isValid ? "pointer" : "default", marginBottom: 24,
            transition: "background 0.2s",
          }}
        >
          {saved ? "Saved ✓" : "Next — set deadline →"}
        </button>
      </div>
    </div>
  );
}

export function Input() {
  return (
    <DataProvider>
      <InputContent />
    </DataProvider>
  );
}
