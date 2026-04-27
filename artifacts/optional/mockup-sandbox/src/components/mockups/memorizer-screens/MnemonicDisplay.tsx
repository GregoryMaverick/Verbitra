import { T, geist, lora } from "./_tokens";

const STUB_MNEMONIC = `Think of three stubborn patients who refuse to let acid out:

1. "Distal Dana" — can't lock the door on acid in the far tubule. Her urine stays alkaline (pH > 5.5), and potassium leaks away. Fanconi doesn't visit her.

2. "Proximal Pete" — drops his bicarbonate before he gets home. Same potassium problem. Fanconi loves Pete.

3. "Type 4 Tony" — aldosterone ghosted him. Potassium piles up, urine goes acidic (pH < 5.5). His kidneys belong to a diabetic.

Anchor: D-P-T → Distal, Proximal, Type 4 → pH high, pH high, pH low → K low, K low, K high.`;

export function MnemonicDisplay() {
  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <div style={{ padding: "52px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>9:41</span>
        <div style={{ background: T.wrong + "22", border: `1px solid ${T.wrong}44`, borderRadius: 6, padding: "2px 10px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.wrong }}>3 days left</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.wrong, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Mnemonic Mode
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6 }}>
            Your memory device
          </div>
          <div style={{ fontSize: 13, color: T.secondary, lineHeight: 1.6 }}>
            With 3 days to go, we've generated a memory anchor to help you encode the key structure before your first practice session.
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: T.tertiary, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          Text: RTA types
        </div>

        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "20px",
          marginBottom: 16,
          flex: 1,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 16, right: 16,
            background: T.primary + "22",
            border: `1px solid ${T.primary}44`,
            borderRadius: 6, padding: "2px 8px",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.primary }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.primary }}>AI generated</span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14, marginTop: 2, paddingRight: 80 }}>
            The Three Stubborn Patients
          </div>

          <div style={{ fontFamily: lora, fontSize: 13, color: T.secondary, lineHeight: 1.8 }}>
            {STUB_MNEMONIC.split("\n").map((line, i) => (
              <p key={i} style={{ margin: 0, marginBottom: line === "" ? 8 : 0 }}>
                {line || "\u00A0"}
              </p>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.tertiary, lineHeight: 1.6 }}>
              Read this carefully. Then close your eyes and try to trace the logic. Your first practice session will build on this structure.
            </div>
          </div>
        </div>

        <button style={{
          width: "100%", background: T.primary, border: "none", borderRadius: 14, padding: "16px",
          color: "#fff", fontFamily: geist, fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12,
          flexShrink: 0,
        }}>
          I've read this — start session
        </button>

        <div style={{ textAlign: "center", paddingBottom: 4 }}>
          <button style={{ background: "none", border: "none", color: T.secondary, fontSize: 13, fontFamily: geist, cursor: "pointer" }}>
            Skip mnemonic
          </button>
        </div>
      </div>
    </div>
  );
}
