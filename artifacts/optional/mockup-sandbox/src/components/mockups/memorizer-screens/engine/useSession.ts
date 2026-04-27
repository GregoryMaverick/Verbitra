import { useReducer, useCallback } from "react";
import { tokenize, WordToken } from "./tokenizer";
import { sessionReducer, buildInitialSession, SessionState, Phase } from "./sessionState";
import { calculateScore, SessionScore, evaluateAdvancement, PhaseHistory } from "./scoring";

export interface UseSessionOptions {
  text: string;
  textTitle: string;
  phase: Phase;
  shownIndices?: Set<number>;
  history?: PhaseHistory[];
}

export interface UseSessionReturn {
  state: SessionState;
  tokens: WordToken[];
  advanceWord: () => void;
  submitWord: (index: number, input: string) => void;
  requestHint: (index: number) => void;
  updateInput: (index: number, input: string) => void;
  endSession: () => void;
  score: SessionScore;
  nextPhase: Phase;
}

export function useSession({
  text,
  textTitle,
  phase,
  shownIndices = new Set(),
  history = [],
}: UseSessionOptions): UseSessionReturn {
  const tokens = tokenize(text);
  const [state, dispatch] = useReducer(
    sessionReducer,
    undefined,
    () => buildInitialSession(tokens, phase, textTitle, shownIndices)
  );

  const advanceWord = useCallback(() => dispatch({ type: "ADVANCE_WORD" }), []);
  const submitWord = useCallback((index: number, input: string) =>
    dispatch({ type: "SUBMIT_WORD", payload: { index, input } }), []);
  const requestHint = useCallback((index: number) =>
    dispatch({ type: "REQUEST_HINT", payload: { index } }), []);
  const updateInput = useCallback((index: number, input: string) =>
    dispatch({ type: "UPDATE_INPUT", payload: { index, input } }), []);
  const endSession = useCallback(() => dispatch({ type: "END_SESSION" }), []);

  const score = calculateScore(state.wordStates);
  const sessionHistory: PhaseHistory[] = [...history, { phase, score: score.score }];
  const nextPhase = evaluateAdvancement(phase, sessionHistory);

  return { state, tokens, advanceWord, submitWord, requestHint, updateInput, endSession, score, nextPhase };
}
