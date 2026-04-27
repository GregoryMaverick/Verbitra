import { useState } from "react";
import { T, geist } from "./_tokens";
import { DataProvider, useData, useTexts, formatNextSessionLabel } from "./data";
import { SessionScore } from "./engine/scoring";
import { Phase } from "./engine/sessionState";

const DEFAULT_SCORE: SessionScore = { score: 87, correct: 18, hinted: 2, wrong: 1, total: 21 };
const DEFAULT_PHASE: Phase = "P2";
const PHASE_PROGRESS = 0.62;

const PHASE_LABELS: Record<Phase, string> = {
  P1: "Phase 1 · Exposure",
  P2: "Phase 2 · Guided Typing",
  P3: "Phase 3 · Free Recall",
};

const NEXT_PHASE_LABELS: Record<Phase, string | null> = {
  P1: "Phase 2 · Guided Typing",
  P2: "Phase 3 · Free Recall",
  P3: null,
};

interface ResultsProps {
  score?: SessionScore;
  currentPhase?: Phase;
  nextPhase?: Phase;
  textTitle?: string;
  phaseProgress?: number;
  onHome?: () => void;
  onReviewMissed?: () => void;
}

function ResultsContent({
  score = DEFAULT_SCORE,
  currentPhase = DEFAULT_PHASE,
  nextPhase = DEFAULT_PHASE,
  textTitle = "Miranda Rights",
  phaseProgress = PHASE_PROGRESS,
  onHome,
  onReviewMissed,
}: ResultsProps) {
  const texts = useTexts();
  const { completeSession } = useData();
  const [submitted, setSubmitted] = useState(false);
  const [nextInfo, setNextInfo] = useState<{ label: string; time: string; textTitle: string } | null>(null);

  const didAdvance = nextPhase !== currentPhase;
  const scoreColor = score.score >= 80 ? T.correct : score.score >= 60 ? T.hint : T.wrong;
  const nextPhaseName = NEXT_PHASE_LABELS[currentPhase];

  const wordBlocks = [
    ...Array(score.correct).fill("correct"),
    ...Array(score.hinted).fill("hinted"),
    ...Array(score.wrong + (score.total - score.correct - score.hinted - score.wrong)).fill("wrong"),
  ];

  function handleCompleteSession() {
    if (submitted) return;
    const target = texts[0];
    if (target) {
      completeSession(target.id, score.score, score.correct, score.total, score.hinted);
      const updatedNext = target.nextSessionDate;
      if (updatedNext) {
        const formatted = formatNextSessionLabel(updatedNext);
        setNextInfo({
          label: formatted.label,
          time: formatted.time,
          textTitle: target.content.slice(0, 30) + "…",
        });
      }
    }
    setSubmitted(true);
    onHome?.();
  }

  const displayNext = nextInfo ?? {
    label: "Tomorrow",
    time: "9:00 AM",
    textTitle,
  };

  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <div style={{ padding: "52px 20px 6px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>9:41</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px", gap: 14, overflowY: "auto" }}>
        <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Session complete</div>
          <div style={{ fontSize: 80, fontWeight: 800, color: scoreColor, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 6 }}>{score.score}%</div>
          <div style={{ fontSize: 14, color: T.secondary }}>
            <span style={{ color: scoreColor, fontWeight: 600 }}>{score.correct}</span>
            <span style={{ color: T.tertiary }}> of {score.total} words correct</span>
            {score.hinted > 0 && <span style={{ color: T.tertiary }}> · {score.hinted} hints used</span>}
          </div>
          {didAdvance && (
            <div style={{
              marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6,
              background: T.correct + "15", border: `1px solid ${T.correct}44`,
              borderRadius: 8, padding: "6px 12px",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-7" stroke={T.correct} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 12, color: T.correct, fontWeight: 600 }}>Phase advanced!</span>
            </div>
          )}
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Word accuracy</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {wordBlocks.map((kind, i) => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: 3,
                background: kind === "correct"
                  ? T.correct + "CC"
                  : kind === "hinted"
                    ? T.hint + "AA"
                    : T.wrong + "88",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: T.correct }} />
              <span style={{ fontSize: 12, color: T.secondary }}>Correct ({score.correct})</span>
            </div>
            {score.hinted > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: T.hint }} />
                <span style={{ fontSize: 12, color: T.secondary }}>Hinted ({score.hinted})</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: T.wrong + "88" }} />
              <span style={{ fontSize: 12, color: T.secondary }}>Missed ({score.total - score.correct - score.hinted})</span>
            </div>
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Phase progress</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ background: T.hint + "1A", border: `1px solid ${T.hint}44`, borderRadius: 6, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.hint }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.hint }}>{PHASE_LABELS[currentPhase]}</span>
            </div>
            <span style={{ fontSize: 12, color: T.tertiary }}>{Math.round(phaseProgress * 100)}% complete</span>
          </div>
          <div style={{ height: 8, background: T.surface2, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${phaseProgress * 100}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.hint})`, borderRadius: 4 }} />
          </div>
          {nextPhaseName && !didAdvance && (
            <div style={{ fontSize: 12, color: T.tertiary, marginTop: 8 }}>
              <span style={{ color: T.primary }}>{Math.round((1 - phaseProgress) * 100)}%</span> more to unlock {nextPhaseName}
            </div>
          )}
          {didAdvance && nextPhaseName && (
            <div style={{ fontSize: 12, color: T.correct, marginTop: 8, fontWeight: 600 }}>
              Unlocked: {nextPhaseName}
            </div>
          )}
          {currentPhase === "P3" && (
            <div style={{ fontSize: 12, color: T.correct, marginTop: 8, fontWeight: 600 }}>Mastery achieved!</div>
          )}
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke={T.primary} strokeWidth="1.2" />
              <path d="M8 5v3.5L10 10" stroke={T.primary} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Next session</div>
              <div style={{ fontSize: 12, color: T.tertiary }}>{displayNext.textTitle}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>{displayNext.label}</div>
            {displayNext.time && <div style={{ fontSize: 11, color: T.tertiary }}>{displayNext.time}</div>}
          </div>
        </div>

        <button
          onClick={handleCompleteSession}
          style={{
            background: submitted ? T.correct : T.primary,
            border: "none", borderRadius: 14, padding: "16px",
            color: "#fff", fontFamily: geist, fontSize: 16, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer", transition: "background 0.2s",
          }}
        >
          {submitted ? "Progress saved ✓" : "Back to home"}
        </button>

        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <button
            onClick={onReviewMissed}
            style={{ background: "none", border: "none", color: T.secondary, fontSize: 13, fontFamily: geist, cursor: "pointer", textDecoration: "underline" }}>
            Review missed words
          </button>
        </div>
      </div>
    </div>
  );
}

export function Results(props: ResultsProps = {}) {
  return (
    <DataProvider>
      <ResultsContent {...props} />
    </DataProvider>
  );
}
