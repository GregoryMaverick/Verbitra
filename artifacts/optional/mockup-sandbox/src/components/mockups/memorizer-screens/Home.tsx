import { useState } from "react";
import { T, geist, lora } from "./_tokens";
import { DataProvider, useTexts, useData, formatNextSessionLabel } from "./data";
import type { VerbitraText } from "./data";

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

function PhaseStep({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[...Array(total)].map((_, i) => (
          <div key={i} style={{
            width: i < current ? 20 : 14,
            height: 4,
            borderRadius: 2,
            background: i < current ? color : T.border,
            transition: "width 0.2s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: geist }}>
        Phase {current} of {total}
      </span>
    </div>
  );
}

function phaseColor(phase: number, total: number): string {
  if (phase >= total) return T.correct;
  if (phase === 2) return T.hint;
  return T.primary;
}

function recallColor(pct: number): string {
  if (pct >= 80) return T.correct;
  if (pct >= 60) return T.hint;
  return T.wrong;
}

function TextCard({ text, onDelete }: { text: VerbitraText; onDelete: (id: string) => void }) {
  const color = phaseColor(text.currentPhase, text.totalPhases);
  const recall = text.lastRecallPct ?? 0;
  const rColor = recallColor(recall);
  const daysLeft = text.deadlineConfig?.daysUntil ?? 0;

  let nextLabel = "Now";
  let nextTime = "";
  if (text.nextSessionDate) {
    const formatted = formatNextSessionLabel(text.nextSessionDate);
    nextLabel = formatted.label;
    nextTime = formatted.time;
  }

  const preview = text.content.slice(0, 60).replace(/\n/g, " ") + (text.content.length > 60 ? "…" : "");

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: geist, lineHeight: 1.3, flex: 1, marginRight: 8 }}>{preview}</div>
        <button
          onClick={() => onDelete(text.id)}
          style={{ background: "none", border: "none", color: T.tertiary, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0 }}
          title="Delete"
        >×</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <PhaseStep current={text.currentPhase} total={text.totalPhases} color={color} />
        {text.lastRecallPct !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: rColor, fontFamily: geist, lineHeight: 1 }}>{recall}%</div>
            <div style={{ fontSize: 10, color: T.tertiary, fontFamily: geist, marginTop: 1 }}>recalled last time</div>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: T.border, marginBottom: 10 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Next session</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
            {nextLabel} {nextTime && <span style={{ fontWeight: 400, color: T.secondary }}>· {nextTime}</span>}
          </div>
        </div>
        {text.deadlineConfig && (
          <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 10px" }}>
            <div style={{ fontSize: 10, color: T.tertiary, textAlign: "center" }}>{daysLeft} days</div>
            <div style={{ fontSize: 10, color: T.tertiary, textAlign: "center" }}>left</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DemoCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{ background: T.surface, border: `1.5px dashed ${T.primary}55`, borderRadius: 14, padding: "16px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.primary + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 14 }}>✦</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: geist }}>Try a demo — Miranda rights</div>
          <div style={{ fontSize: 11, color: T.tertiary, fontFamily: geist }}>67 words · ~5 min to try</div>
        </div>
      </div>
      <div style={{ fontFamily: lora, fontSize: 12, color: T.secondary, lineHeight: 1.65, marginBottom: 12, padding: "10px 12px", background: T.surface2, borderRadius: 8, borderLeft: `2px solid ${T.primary}` }}>
        "You have the right to remain silent. Anything you say can and will be used against you in a court of law..."
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ flex: 1, background: T.primary, border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontFamily: geist, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Start demo
        </button>
        <button
          onClick={onDismiss}
          style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.secondary, fontFamily: geist, fontSize: 13, cursor: "pointer" }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

function AddTextModal({ onAdd, onClose }: { onAdd: (content: string, deadline: string | null) => void; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [deadline, setDeadline] = useState("");
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const valid = wordCount > 0 && wordCount <= 500;

  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "flex-end", zIndex: 100,
    }}>
      <div style={{ background: T.surface, borderRadius: "20px 20px 0 0", width: "100%", padding: "20px 20px 32px", fontFamily: geist }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Add text</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.secondary, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your text here (max 500 words)…"
          style={{
            width: "100%", minHeight: 120, background: T.bg, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "12px 14px", color: T.text, fontFamily: "inherit",
            fontSize: 14, resize: "none", boxSizing: "border-box", outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 14px" }}>
          <span style={{ fontSize: 12, color: wordCount > 500 ? T.wrong : T.tertiary }}>{wordCount}/500 words</span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: T.tertiary, display: "block", marginBottom: 6 }}>Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{
              width: "100%", background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px 14px", color: T.text,
              fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", outline: "none",
            }}
          />
        </div>
        <button
          disabled={!valid}
          onClick={() => { onAdd(content, deadline || null); onClose(); }}
          style={{
            width: "100%", background: valid ? T.primary : T.border, border: "none",
            borderRadius: 14, padding: "14px", color: valid ? "#fff" : T.tertiary,
            fontFamily: geist, fontSize: 15, fontWeight: 700, cursor: valid ? "pointer" : "default",
          }}
        >
          Save text
        </button>
      </div>
    </div>
  );
}

function HomeContent() {
  const texts = useTexts();
  const { addText, deleteText } = useData();
  const [showDemo, setShowDemo] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist, position: "relative" }}>
      <StatusBar />

      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: T.primary, textTransform: "uppercase", marginBottom: 2 }}>Verbitra</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.03em" }}>Your texts</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{ background: T.primary, border: "none", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 4v10M4 9h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 0" }}>
        {showDemo && <DemoCard onDismiss={() => setShowDemo(false)} />}

        {texts.length === 0 && !showDemo && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.tertiary, fontSize: 14 }}>
            No texts yet. Tap + to add your first text.
          </div>
        )}

        {texts.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, marginTop: 4 }}>
              In progress · {texts.length} {texts.length === 1 ? "text" : "texts"}
            </div>
            {texts.map((text) => (
              <TextCard key={text.id} text={text} onDelete={deleteText} />
            ))}
          </>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 0 24px", display: "flex", justifyContent: "space-around" }}>
        {[
          { icon: "⊞", label: "Home", active: true },
          { icon: "+", label: "Add", active: false, primary: true },
          { icon: "◎", label: "Settings", active: false },
        ].map(({ icon, label, active, primary }) => (
          <div
            key={label}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
            onClick={primary ? () => setShowAdd(true) : undefined}
          >
            {primary ? (
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -12, cursor: "pointer" }}>
                <span style={{ fontSize: 22, color: "#fff", fontWeight: 300 }}>+</span>
              </div>
            ) : (
              <span style={{ fontSize: 22, color: active ? T.primary : T.tertiary }}>{icon}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 500, color: active ? T.primary : T.tertiary, fontFamily: geist }}>{label}</span>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddTextModal
          onAdd={(content, deadline) => addText(content, deadline)}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

export function Home() {
  return (
    <DataProvider>
      <HomeContent />
    </DataProvider>
  );
}
