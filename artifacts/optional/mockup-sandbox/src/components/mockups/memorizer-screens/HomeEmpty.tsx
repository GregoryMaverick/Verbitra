/**
 * Home screen — first-time empty state
 * No in-progress texts. Demo tile only.
 * Compare with Home.tsx (returning user with active texts).
 */

import { T, geist, lora } from "./_tokens";

function PhaseBadge({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: color + "1A", border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px" }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: geist, letterSpacing: "0.04em" }}>P1 · {label}</span>
    </div>
  );
}

export function HomeEmpty() {
  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 6px" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>9:41</span>
        <div style={{ display: "flex", gap: 5 }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill={T.text} />
          </svg>
        </div>
      </div>

      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: T.primary, textTransform: "uppercase", marginBottom: 2 }}>Verbitra</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.03em" }}>Your texts</h1>
          </div>
          <button style={{ background: T.primary, border: "none", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 4v10M4 9h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 20px 0" }}>
        <div style={{ background: T.surface, border: `1.5px dashed ${T.primary}55`, borderRadius: 14, padding: "16px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.primary + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14 }}>✦</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: geist }}>Try a demo text</div>
              <div style={{ fontSize: 11, color: T.tertiary, fontFamily: geist }}>Miranda rights — 67 words</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <PhaseBadge label="Exposure" color={T.primary} />
            </div>
          </div>
          <div style={{ fontFamily: lora, fontSize: 12, color: T.secondary, lineHeight: 1.65, marginBottom: 12, padding: "10px 12px", background: T.surface2, borderRadius: 8, borderLeft: `2px solid ${T.primary}` }}>
            "You have the right to remain silent. Anything you say can and will be used against you in a court of law..."
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, background: T.primary, border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontFamily: geist, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Start demo
            </button>
            <button style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.secondary, fontFamily: geist, fontSize: 13, cursor: "pointer" }}>
              Dismiss
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ fontSize: 24 }}>📄</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 8 }}>No texts yet</div>
          <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.6, marginBottom: 24 }}>
            Paste any text, set a deadline, and start learning it word for word.
          </div>
          <button style={{ background: T.primary, border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontFamily: geist, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Add your first text
          </button>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 0 24px", display: "flex", justifyContent: "space-around" }}>
        {[
          { icon: "⊞", label: "Home", active: true },
          { icon: "+", label: "Add", primary: true },
          { icon: "◎", label: "Settings" },
        ].map(({ icon, label, active, primary }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {primary ? (
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -12 }}>
                <span style={{ fontSize: 22, color: "#fff", fontWeight: 300 }}>+</span>
              </div>
            ) : (
              <span style={{ fontSize: 22, color: active ? T.primary : T.tertiary }}>{icon}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 500, color: active ? T.primary : T.tertiary, fontFamily: geist }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
