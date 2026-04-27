import { useState } from "react";
import { Practice } from "./Practice";
import { Results } from "./Results";
import { Phase } from "./engine/sessionState";
import { SessionScore } from "./engine/scoring";
import { T, geist } from "./_tokens";

type FlowPhase = "practice" | "results";

const PHASES: Phase[] = ["P1", "P2", "P3"];
const PHASE_LABELS: Record<Phase, string> = {
  P1: "P1 Exposure",
  P2: "P2 Guided",
  P3: "P3 Recall",
};

export function PracticeFlow() {
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("practice");
  const [activePhase, setActivePhase] = useState<Phase>("P2");
  const [sessionScore, setSessionScore] = useState<SessionScore | null>(null);
  const [nextPhase, setNextPhase] = useState<Phase>("P2");
  const [key, setKey] = useState(0);

  function handleComplete(score: SessionScore, next: Phase) {
    setSessionScore(score);
    setNextPhase(next);
    setFlowPhase("results");
  }

  function handleHome() {
    setFlowPhase("practice");
    setKey(k => k + 1);
  }

  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px", fontFamily: geist }}>
      <div style={{ marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: T.tertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Phase:</span>
        {PHASES.map(p => (
          <button
            key={p}
            onClick={() => { setActivePhase(p); setFlowPhase("practice"); setKey(k => k + 1); }}
            style={{
              background: activePhase === p ? T.primary : T.surface,
              border: `1px solid ${activePhase === p ? T.primary : T.border}`,
              borderRadius: 8, padding: "4px 12px",
              color: activePhase === p ? "#fff" : T.secondary,
              fontSize: 12, fontFamily: geist, cursor: "pointer",
            }}>
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: `0 0 0 1px ${T.border}, 0 8px 32px rgba(0,0,0,0.6)` }}>
        {flowPhase === "practice" ? (
          <Practice
            key={key}
            phase={activePhase}
            onComplete={handleComplete}
          />
        ) : (
          <Results
            score={sessionScore ?? undefined}
            currentPhase={activePhase}
            nextPhase={nextPhase}
            onHome={handleHome}
          />
        )}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: T.tertiary }}>
        {flowPhase === "practice"
          ? "Complete all words to see Results screen"
          : 'Click "Back to home" to restart'}
      </div>
    </div>
  );
}
