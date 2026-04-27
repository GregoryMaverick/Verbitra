import { T, geist, lora } from "./_tokens";

function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 6px", fontFamily: geist }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0" y="4" width="3" height="8" rx="1" fill={T.secondary} />
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill={T.secondary} />
          <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill={T.text} />
        </svg>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <rect x="0.5" y="0.5" width="16" height="11" rx="2" stroke={T.text} strokeWidth="1.2" />
          <rect x="16.5" y="3.5" width="2" height="5" rx="0.5" fill={T.text} />
          <rect x="2" y="2" width="11" height="8" rx="1" fill={T.text} />
        </svg>
      </div>
    </div>
  );
}

const SCORE_HISTORY = [
  { session: 1, pct: 62, phase: 1 },
  { session: 2, pct: 71, phase: 1 },
  { session: 3, pct: 78, phase: 2 },
  { session: 4, pct: 85, phase: 2 },
];

export function TextDetail() {
  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <StatusBar />

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 20px 12px" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={T.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: T.text, flex: 1 }}>Text Detail</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="1.5" fill={T.secondary} />
            <circle cx="10" cy="4.5" r="1.5" fill={T.secondary} />
            <circle cx="10" cy="15.5" r="1.5" fill={T.secondary} />
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
        <div style={{ fontFamily: geist, fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Text</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16, lineHeight: 1.3 }}>
          USMLE Step 1 — Renal tubular acidosis types
        </div>

        <div style={{
          fontFamily: lora,
          fontSize: 13,
          color: T.secondary,
          lineHeight: 1.75,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
          borderLeft: `3px solid ${T.primary}`,
        }}>
          Type 1 (distal) RTA: failure to acidify urine in the distal tubule; hypokalemia, urine pH &gt; 5.5. Type 2 (proximal) RTA: impaired bicarbonate reabsorption; hypokalemia, associated with Fanconi syndrome. Type 4 RTA: hypoaldosteronism; hyperkalemia, urine pH &lt; 5.5, typically seen in diabetic nephropathy.
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Current Phase</div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            {[
              { n: 1, label: "Read-along", done: true },
              { n: 2, label: "Fill blanks", current: true },
              { n: 3, label: "Recall", done: false },
            ].map((step, i) => (
              <div key={step.n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <div style={{ width: 28, height: 1, background: step.current || step.done ? T.primary : T.border }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: step.done ? T.primary : step.current ? T.primary + "33" : T.surface2,
                    border: `1.5px solid ${step.done || step.current ? T.primary : T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {step.done ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: step.current ? T.primary : T.tertiary }}>{step.n}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: step.current ? T.primary : step.done ? T.text : T.tertiary, fontWeight: step.current ? 600 : 400 }}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 6, background: T.surface2, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
            <div style={{ height: "100%", width: "62%", background: `linear-gradient(90deg, ${T.primary}, ${T.hint})`, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, color: T.tertiary, marginTop: 6 }}>62% through Phase 2</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Score History</div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60, marginBottom: 10 }}>
            {SCORE_HISTORY.map((s) => {
              const color = s.pct >= 80 ? T.correct : s.pct >= 60 ? T.hint : T.wrong;
              return (
                <div key={s.session} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color }}>{s.pct}%</span>
                  <div style={{ width: "100%", height: (s.pct / 100) * 40, background: color + "99", borderRadius: "3px 3px 0 0", minHeight: 6 }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SCORE_HISTORY.map((s) => (
              <div key={s.session} style={{ fontSize: 11, color: T.tertiary }}>
                Session {s.session} · <span style={{ color: T.secondary }}>Phase {s.phase}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Deadline</div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>May 14, 2026</div>
            <div style={{ fontSize: 12, color: T.secondary, marginTop: 2 }}>
              <span style={{ color: T.correct, fontWeight: 600 }}>11 days</span> remaining · Spaced Recall
            </div>
          </div>
          <button style={{
            background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 14px",
            color: T.primary, fontFamily: geist, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Edit
          </button>
        </div>

        <button style={{
          width: "100%", background: T.primary, border: "none", borderRadius: 14, padding: "16px",
          color: "#fff", fontFamily: geist, fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12,
        }}>
          Start session
        </button>

        <div style={{ textAlign: "center", paddingBottom: 12 }}>
          <button style={{ background: "none", border: "none", color: T.wrong, fontSize: 13, fontFamily: geist, cursor: "pointer", opacity: 0.7 }}>
            Delete text
          </button>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 0 24px", display: "flex", justifyContent: "space-around" }}>
        {[
          { icon: "⊞", label: "Home", active: true },
          { icon: "+", label: "Add", active: false, primary: true },
          { icon: "◎", label: "Settings", active: false },
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
