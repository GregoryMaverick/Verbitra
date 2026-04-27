import { Home } from "./Home";
import { Input } from "./Input";
import { Deadline } from "./Deadline";
import { Practice } from "./Practice";
import { Results } from "./Results";
import { Splash } from "./Splash";
import { TextDetail } from "./TextDetail";
import { MnemonicDisplay } from "./MnemonicDisplay";
import { Settings } from "./Settings";
import { T, geist } from "./_tokens";

function Arrow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, flexShrink: 0 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 14h16M16 8l6 6-6 6" stroke={T.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function SideArrow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, flexShrink: 0 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 14h16M16 8l6 6-6 6" stroke={T.hint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
      </svg>
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: `0 0 0 1px ${T.border}, 0 8px 32px rgba(0,0,0,0.6)`, flexShrink: 0 }}>
      {children}
    </div>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, marginTop: 4 }}>
      {children}
    </div>
  );
}

export function FlowBoard() {
  return (
    <div style={{ minWidth: "max-content", background: T.bg, padding: "32px", fontFamily: geist }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Verbitra · All Screens · v1 Mobile</div>
        <div style={{ fontSize: 13, color: T.tertiary }}>10 screens · 390×844 (iPhone 14) · Geist UI · Lora content · #818CF8 primary</div>
      </div>

      <RowLabel>Core add-text loop (screens 1–5)</RowLabel>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 36 }}>
        <Screen><Home /></Screen>
        <Arrow />
        <Screen><Input /></Screen>
        <Arrow />
        <Screen><Deadline /></Screen>
        <Arrow />
        <Screen><Practice /></Screen>
        <Arrow />
        <Screen><Results /></Screen>
      </div>

      <RowLabel>Supporting screens (screens 6–10) — this task adds 6, 7, 8, 10</RowLabel>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 36 }}>
        <Screen><Splash /></Screen>
        <SideArrow />
        <Screen><TextDetail /></Screen>
        <SideArrow />
        <Screen><MnemonicDisplay /></Screen>
        <SideArrow />
        <div style={{
          width: 120, alignSelf: "stretch", flexShrink: 0,
          background: T.surface, border: `1.5px dashed ${T.border}`,
          borderRadius: 20, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "16px 12px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>Screen 9</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.secondary, marginBottom: 4, textAlign: "center" }}>Paywall / Upgrade</div>
          <div style={{ fontSize: 11, color: T.tertiary, textAlign: "center" }}>Task #9 — out of scope here</div>
        </div>
        <SideArrow />
        <Screen><Settings /></Screen>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { label: "1. Home", desc: "Demo tile + in-progress texts (see HomeEmpty for first-time state)" },
          { label: "2. Input", desc: "Paste · Upload file · Camera OCR · word count" },
          { label: "3. Deadline", desc: "May 2026 calendar · Spaced Recall · 13 sessions" },
          { label: "4. Practice", desc: "P2 Guided Typing · hint annotation · keyboard" },
          { label: "5. Results", desc: "87% · word grid · phase progress · next session" },
          { label: "6. Splash", desc: "Branded cold-start · wordmark · fade-in animation · animated loading dots" },
          { label: "7. Text Detail", desc: "Full text (Lora) · phase stepper · score history · deadline · Start session CTA" },
          { label: "8. Mnemonic Display", desc: "AI mnemonic stub · ≤3-day deadline only · I've read this CTA" },
          { label: "9. Paywall", desc: "Out of scope — Task #9" },
          { label: "10. Settings", desc: "Account email · daily reminder time picker · study prefs · version footer" },
        ].map(({ label, desc }) => (
          <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.primary, marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</div>
              <div style={{ fontSize: 11, color: T.tertiary }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
