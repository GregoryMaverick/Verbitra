export default function Slide5MBH() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 20%, rgba(167,139,250,0.1) 0%, transparent 50%)" }} />
      <div className="absolute top-0 left-0 w-full h-[0.5vh]" style={{ background: "linear-gradient(90deg, #a78bfa, transparent)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="flex items-start justify-between mb-[2.5vh]">
          <div>
            <div className="font-display text-[1.1vw] tracking-[0.18em] uppercase mb-[0.6vh]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
              Competitor 03 — Closest Direct
            </div>
            <h2 className="font-display font-black text-[3.5vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
              Memorize By Heart
            </h2>
            <p className="text-[1.4vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
              "The most feature-rich verbatim memorisation app available"
            </p>
          </div>
          <div className="flex gap-[1.5vw] mt-[0.5vh]">
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>Millions</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>texts memorized</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>4.7</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>App Store rating</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>~$3</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>Premium/month</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2vw] flex-1 overflow-hidden">
          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>Goal + UVP</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Verbatim memorisation of any text via a structured 3-phase system: build familiarity, strengthen recall, test from memory. Broadest activity set of any verbatim app.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>Problem Solved</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Re-reading and rote repetition don't work. MBH gives users structured progressive exercises that build actual recall rather than familiarity.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>Activities</div>
              <div className="space-y-[0.5vh]">
                {["Progressive word removal (tap-to-reveal)", "Fill-in-the-blank (key word blanking)", "First letter of each word", "Sentence unscramble", "Multiple-choice quizzes", "Full text typing from memory", "Text-to-speech audio reading", "Spaced repetition review scheduling"].map((t, i) => (
                  <div key={i} className="flex gap-[0.7vw] text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span style={{ color: "#a78bfa" }}>—</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>User Flow</div>
              <div className="space-y-[0.4vh]">
                {["Paste text or download from library", "Phase 1: Read + listen (familiarity)", "Phase 2: Fill blanks + unscramble (strengthen)", "Phase 3: Type from memory (test)", "SR scheduling sends review reminders"].map((s, i) => (
                  <div key={i} className="flex gap-[0.7vw] items-start text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "#a78bfa" }}>{i + 1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(108,61,232,0.1)", border: "1px solid rgba(108,61,232,0.35)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>vs Our App</div>
              <div className="space-y-[1vh]">
                {[
                  { label: "AI generation", them: "None — user selects exercises manually", us: "AI generates the right activities for the text type" },
                  { label: "Deadline", them: "No deadline awareness", us: "Daily plan built around user's deadline" },
                  { label: "Activity choice", them: "User decides what to do each session", us: "App decides — removes the 'what should I do' burden" },
                  { label: "Reliability", them: "Data loss bugs reported repeatedly", us: "Cloud-first, stability as a feature" },
                ].map((r, i) => (
                  <div key={i} className="text-[1.1vw] font-body" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    <span className="font-semibold" style={{ color: "#a78bfa" }}>{r.label}: </span>
                    <span style={{ color: "#ef4444" }}>{r.them}</span>
                    <span style={{ color: "#8b87b0" }}> vs </span>
                    <span style={{ color: "#34d399" }}>{r.us}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[0.8vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>Our Opportunity</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.55 }}>
                MBH has the right activities but makes users manage themselves. We remove that decision entirely — the app tells you exactly what to do today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
