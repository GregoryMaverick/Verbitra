import { useState, useRef, useCallback, useEffect } from "react";
import { T, geist, lora } from "./_tokens";
import { useSession } from "./engine/useSession";
import { Phase } from "./engine/sessionState";
import { SessionScore } from "./engine/scoring";

const DEMO_TEXT = `You have the right to remain silent. Anything you say can and will be used against you in a court of law. You have the right to an attorney. If you cannot afford an attorney, one will be appointed for you.`;
const DEMO_TITLE = "Miranda Rights";

const PHASE_LABELS: Record<Phase, string> = {
  P1: "P1 · Exposure",
  P2: "P2 · Guided Typing",
  P3: "P3 · Free Recall",
};

const KEY_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["⇧","Z","X","C","V","B","N","M","⌫"],
  ["123","Space","return"],
];

interface PracticeProps {
  phase?: Phase;
  shownIndices?: Set<number>;
  onComplete?: (score: SessionScore, nextPhase: Phase) => void;
}

const PHASE_HINT_COLOR: Record<Phase, string> = {
  P1: T.primary,
  P2: T.hint,
  P3: T.wrong,
};

export function Practice({
  phase = "P2",
  shownIndices,
  onComplete,
}: PracticeProps) {
  const defaultShown = shownIndices ?? (phase === "P2"
    ? new Set(Array.from({ length: 22 }, (_, i) => i))
    : new Set<number>());

  const { state, advanceWord, submitWord, requestHint, updateInput, endSession, score, nextPhase } =
    useSession({
      text: DEMO_TEXT,
      textTitle: DEMO_TITLE,
      phase,
      shownIndices: defaultShown,
    });

  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phaseColor = PHASE_HINT_COLOR[phase];

  const focusedWord = state.wordStates[state.focusIndex];

  const handleKeyPress = useCallback((key: string) => {
    if (phase === "P1") {
      advanceWord();
      return;
    }
    if (key === "⌫") {
      const next = currentInput.slice(0, -1);
      setCurrentInput(next);
      updateInput(state.focusIndex, next);
    } else if (key === "Space") {
      const next = currentInput + " ";
      setCurrentInput(next);
      updateInput(state.focusIndex, next);
    } else if (key === "return") {
      if (currentInput.trim()) {
        submitWord(state.focusIndex, currentInput);
        setCurrentInput("");
      }
    } else if (!["⇧","123"].includes(key)) {
      const next = currentInput + key.toLowerCase();
      setCurrentInput(next);
      updateInput(state.focusIndex, next);
    }
  }, [phase, currentInput, state.focusIndex, advanceWord, submitWord, updateInput]);

  const handleHintPress = useCallback((index: number) => {
    holdTimerRef.current = setTimeout(() => {
      requestHint(index);
    }, 500);
  }, [requestHint]);

  const handleHintRelease = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.done && onComplete) {
      onComplete(score, nextPhase);
    }
  }, [state.done]);

  useEffect(() => {
    const ws = state.wordStates[state.focusIndex];
    if (ws && !ws.token.isPunct && ws.status !== "correct" && ws.status !== "hinted") {
      setCurrentInput(ws.input || "");
    }
  }, [state.focusIndex]);

  const contentWords = state.wordStates.filter(ws => !ws.token.isPunct);
  const revealedCount = contentWords.filter(ws => ws.status === "correct" || ws.status === "hinted" || ws.status === "revealed").length;
  const totalWords = contentWords.length;

  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <div style={{ padding: "50px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: phaseColor + "1A", border: `1px solid ${phaseColor}44`, borderRadius: 8, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: phaseColor }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: phaseColor, letterSpacing: "0.04em" }}>{PHASE_LABELS[phase]}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{score.score}%</div>
            <div style={{ fontSize: 10, color: T.tertiary }}>{revealedCount}/{totalWords} done</div>
          </div>
          <button
            onClick={endSession}
            style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", color: T.secondary, fontSize: 12, fontFamily: geist, cursor: "pointer" }}>
            Exit
          </button>
        </div>
      </div>

      <div style={{ height: 2, background: T.surface, margin: "0 20px" }}>
        <div style={{ height: "100%", width: `${(revealedCount / totalWords) * 100}%`, background: phaseColor, borderRadius: 1, transition: "width 200ms ease" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 10px" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            {DEMO_TITLE} —{" "}
            {phase === "P1" ? "Read along" : phase === "P2" ? "Type the blanks" : "Type from memory"}
          </div>
          <div style={{ fontFamily: lora, fontSize: 16, lineHeight: 2.2, color: T.text, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0 4px" }}>
            {state.wordStates.map((ws, i) => {
              if (ws.token.isPunct) {
                return <span key={i} style={{ color: T.secondary, marginLeft: -4 }}>{ws.token.original}</span>;
              }

              const isFocused = i === state.focusIndex && !state.done;

              if (phase === "P1") {
                return (
                  <span
                    key={i}
                    onClick={advanceWord}
                    style={{
                      cursor: "pointer",
                      color: ws.status === "correct" ? T.correct : isFocused ? T.primary : T.secondary,
                      fontWeight: isFocused ? 700 : 400,
                      background: isFocused ? T.primary + "20" : "transparent",
                      borderRadius: 4,
                      padding: "0 2px",
                      transition: "all 150ms ease-out",
                    }}>
                    {ws.token.original}
                  </span>
                );
              }

              if (ws.status === "revealed" || ws.status === "correct") {
                return (
                  <span key={i} style={{ color: ws.status === "correct" ? T.correct : T.text }}>
                    {ws.token.original}
                  </span>
                );
              }

              if (ws.status === "hinted") {
                return (
                  <span key={i} style={{ color: T.hint, fontWeight: 600 }}>
                    {ws.token.original}
                  </span>
                );
              }

              if (ws.status === "wrong") {
                return (
                  <span
                    key={`wrong-${ws.shakeKey}-${i}`}
                    style={{
                      display: "inline-block",
                      background: T.wrong + "20",
                      border: `1.5px solid ${T.wrong}88`,
                      borderRadius: 4,
                      padding: "1px 6px",
                      color: T.wrong,
                      animation: "shake 100ms ease-in-out",
                      fontFamily: lora,
                    }}>
                    {ws.input || "_".repeat(ws.token.matchKey.length)}
                  </span>
                );
              }

              const hintedText = ws.hintCharsRevealed > 0
                ? ws.token.matchKey.slice(0, ws.hintCharsRevealed) + "_".repeat(Math.max(0, ws.token.matchKey.length - ws.hintCharsRevealed))
                : "_".repeat(ws.token.matchKey.length);

              const showingHint = ws.hintCharsRevealed > 0;

              return (
                <span
                  key={i}
                  onMouseDown={() => handleHintPress(i)}
                  onMouseUp={handleHintRelease}
                  onTouchStart={() => handleHintPress(i)}
                  onTouchEnd={handleHintRelease}
                  style={{ position: "relative", display: "inline-block" }}>
                  <span style={{
                    display: "inline-block",
                    background: isFocused
                      ? T.primary + "20"
                      : showingHint
                        ? T.hint + "15"
                        : T.surface2,
                    border: `1.5px solid ${isFocused ? T.primary : showingHint ? T.hint + "88" : T.border}`,
                    borderRadius: 4,
                    padding: "1px 8px",
                    color: isFocused
                      ? T.primary
                      : showingHint
                        ? T.hint
                        : T.secondary,
                    minWidth: ws.token.matchKey.length * 9 + 8,
                    letterSpacing: "0.12em",
                    fontFamily: lora,
                    boxShadow: isFocused ? `0 0 8px ${T.primary}44` : showingHint ? `0 0 8px ${T.hint}44` : "none",
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}>
                    {isFocused && currentInput
                      ? currentInput
                      : showingHint
                        ? hintedText
                        : "_".repeat(ws.token.matchKey.length)}
                  </span>
                  {!isFocused && !showingHint && (
                    <span style={{
                      position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)",
                      background: T.hint, color: "#000", fontSize: 9, fontFamily: geist, fontWeight: 700,
                      padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap", letterSpacing: "0.04em",
                      opacity: 0.7,
                    }}>hold</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {phase !== "P1" && (
          <div style={{ background: T.hint + "10", border: `1px solid ${T.hint}33`, borderRadius: 10, padding: "9px 12px", marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke={T.hint} strokeWidth="1.2"/>
              <path d="M7 6v4M7 4.5v.5" stroke={T.hint} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 12, color: T.hint, fontFamily: geist }}>Long-press any blank to reveal a hint</span>
          </div>
        )}

        {phase === "P1" && (
          <div style={{ background: T.primary + "10", border: `1px solid ${T.primary}33`, borderRadius: 10, padding: "9px 12px", marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke={T.primary} strokeWidth="1.2"/>
              <path d="M7 6v4M7 4.5v.5" stroke={T.primary} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 12, color: T.primary, fontFamily: geist }}>Tap each word to read along and advance</span>
          </div>
        )}

        {state.done && (
          <div style={{ background: T.correct + "15", border: `1px solid ${T.correct}44`, borderRadius: 10, padding: "12px 16px", marginTop: 10, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.correct }}>Session complete!</div>
            <div style={{ fontSize: 12, color: T.secondary, marginTop: 4 }}>Score: {score.score}%</div>
          </div>
        )}
      </div>

      {!state.done && (
        <div style={{ background: T.surface2, borderTop: `1px solid ${T.border}`, padding: "8px 6px 28px" }}>
          {phase !== "P1" && focusedWord && (
            <div style={{ padding: "4px 10px 8px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: T.tertiary }}>Typing:</span>
              <span style={{ fontSize: 13, color: T.primary, fontFamily: lora, fontWeight: 600 }}>
                {currentInput || "…"}
              </span>
            </div>
          )}
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 5 }}>
              {row.map((key) => {
                const isSpecial = ["⇧","⌫","123","return"].includes(key);
                const isSpace = key === "Space";
                return (
                  <div
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    style={{
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      width: isSpace ? 160 : isSpecial ? 42 : 34,
                      height: 42,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      userSelect: "none",
                    }}>
                    <span style={{ fontSize: isSpecial ? 11 : 15, color: isSpecial ? T.secondary : T.text, fontFamily: geist, fontWeight: isSpecial ? 500 : 400 }}>
                      {key}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>

      <input
        ref={inputRef}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        value={currentInput}
        readOnly
      />
    </div>
  );
}
