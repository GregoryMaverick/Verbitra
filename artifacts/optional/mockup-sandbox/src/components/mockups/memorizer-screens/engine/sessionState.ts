import { WordToken } from "./tokenizer";

export type WordStatus = "hidden" | "revealed" | "correct" | "hinted" | "wrong" | "active";
export type Phase = "P1" | "P2" | "P3";

export interface WordState {
  token: WordToken;
  status: WordStatus;
  hintCharsRevealed: number;
  input: string;
  shakeKey: number;
}

export interface SessionState {
  phase: Phase;
  wordStates: WordState[];
  focusIndex: number;
  done: boolean;
  textTitle: string;
}

export function buildInitialWordStates(
  tokens: WordToken[],
  phase: Phase,
  shownIndices: Set<number>
): WordState[] {
  return tokens.map(token => {
    if (token.isPunct) {
      return { token, status: "revealed" as WordStatus, hintCharsRevealed: 0, input: "", shakeKey: 0 };
    }
    if (phase === "P1") {
      return { token, status: "hidden" as WordStatus, hintCharsRevealed: 0, input: "", shakeKey: 0 };
    }
    if (phase === "P2" && shownIndices.has(token.index)) {
      return { token, status: "revealed" as WordStatus, hintCharsRevealed: 0, input: "", shakeKey: 0 };
    }
    return { token, status: "hidden" as WordStatus, hintCharsRevealed: 0, input: "", shakeKey: 0 };
  });
}

export function buildInitialSession(
  tokens: WordToken[],
  phase: Phase,
  textTitle: string,
  shownIndices: Set<number> = new Set()
): SessionState {
  const wordStates = buildInitialWordStates(tokens, phase, shownIndices);
  const focusIndex = phase === "P1"
    ? (tokens.find(t => !t.isPunct)?.index ?? 0)
    : (tokens.find(t => !t.isPunct && !shownIndices.has(t.index))?.index ?? 0);

  return {
    phase,
    wordStates,
    focusIndex,
    done: false,
    textTitle,
  };
}

export type SessionAction =
  | { type: "ADVANCE_WORD" }
  | { type: "SUBMIT_WORD"; payload: { index: number; input: string } }
  | { type: "REQUEST_HINT"; payload: { index: number } }
  | { type: "UPDATE_INPUT"; payload: { index: number; input: string } }
  | { type: "END_SESSION" };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "ADVANCE_WORD": {
      if (state.phase !== "P1") return state;
      const ws = [...state.wordStates];
      const curIdx = state.focusIndex;
      if (ws[curIdx]) {
        ws[curIdx] = { ...ws[curIdx], status: "correct" };
      }
      const next = ws.findIndex((w, i) => i > curIdx && !w.token.isPunct && w.status !== "correct");
      if (next === -1) {
        return { ...state, wordStates: ws, done: true };
      }
      return { ...state, wordStates: ws, focusIndex: next };
    }

    case "SUBMIT_WORD": {
      const { index, input } = action.payload;
      const ws = [...state.wordStates];
      const wordState = ws[index];
      if (!wordState || wordState.token.isPunct) return state;

      const normalized = input.trim().toLowerCase().replace(/[^a-z0-9'''-]/g, "");
      const isCorrect = normalized === wordState.token.matchKey;
      const wasHinted = wordState.hintCharsRevealed > 0;

      ws[index] = {
        ...wordState,
        input,
        status: isCorrect ? (wasHinted ? "hinted" : "correct") : "wrong",
        shakeKey: isCorrect ? wordState.shakeKey : wordState.shakeKey + 1,
      };

      if (isCorrect) {
        const next = ws.findIndex((w, i) => i > index && !w.token.isPunct && w.status === "hidden");
        const allDone = ws.every(w => w.token.isPunct || w.status === "correct" || w.status === "hinted" || w.status === "revealed");
        return {
          ...state,
          wordStates: ws,
          focusIndex: next !== -1 ? next : state.focusIndex,
          done: allDone,
        };
      }

      return { ...state, wordStates: ws };
    }

    case "REQUEST_HINT": {
      const { index } = action.payload;
      const ws = [...state.wordStates];
      const wordState = ws[index];
      if (!wordState || wordState.token.isPunct) return state;

      const maxChars = wordState.token.matchKey.length;
      const revealed = Math.min(wordState.hintCharsRevealed + 1, maxChars);
      ws[index] = { ...wordState, hintCharsRevealed: revealed, status: "active" };
      return { ...state, wordStates: ws };
    }

    case "UPDATE_INPUT": {
      const { index, input } = action.payload;
      const ws = [...state.wordStates];
      if (!ws[index] || ws[index].token.isPunct) return state;
      ws[index] = { ...ws[index], input, status: "active" };
      return { ...state, wordStates: ws };
    }

    case "END_SESSION":
      return { ...state, done: true };

    default:
      return state;
  }
}
