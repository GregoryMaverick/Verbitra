export default function Slide9Memorify() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 80%, rgba(6,182,212,0.1) 0%, transparent 50%)" }} />
      <div className="absolute top-0 left-0 w-full h-[0.5vh]" style={{ background: "linear-gradient(90deg, #06b6d4, transparent)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="flex items-start justify-between mb-[2.5vh]">
          <div>
            <div className="font-display text-[1.1vw] tracking-[0.18em] uppercase mb-[0.6vh]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>
              Competitor 07 — Closest to Our Feature Set
            </div>
            <h2 className="font-display font-black text-[4vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
              Memorify
            </h2>
            <p className="text-[1.4vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
              "Divide and conquer — personalised plan for memorising any text"
            </p>
          </div>
          <div className="flex gap-[1.5vw] mt-[0.5vh]">
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>10K+</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>downloads</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>4.1</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>316 reviews</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>New</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>still growing</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2vw] flex-1 overflow-hidden">
          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>Goal + UVP</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Paste any text, get a learning plan, practice with adaptive exercises. Combines long-text verbatim memorisation with a full flashcard module and AI flashcard generation. The most similar product to ours that currently exists.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>Problem Solved</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Memorising long texts is overwhelming. Memorify breaks content into chunks and builds a personalised plan — reducing cognitive load and making the task feel manageable.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>Activities</div>
              <div className="space-y-[0.5vh]">
                {[
                  "Multiple choice recall",
                  "Fill-in-the-blank",
                  "Type first letter of each word",
                  "Full word typing (verbatim)",
                  "Cloze deletion",
                  "Tap first letters (newer)",
                  "AI flashcard generation (enter subject)",
                  "Spaced repetition reminders",
                ].map((t, i) => (
                  <div key={i} className="flex gap-[0.7vw] text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span style={{ color: "#06b6d4" }}>—</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#06b6d4", fontFamily: "Syne, sans-serif" }}>User Flow</div>
              <div className="space-y-[0.4vh]">
                {["Paste text or upload PDF/image", "App divides into chunks (divide & conquer)", "Practice with adaptive exercise modes", "Spaced repetition notifies for review", "AI generates flashcards on any subject", "Track mastery progress over time"].map((s, i) => (
                  <div key={i} className="flex gap-[0.7vw] items-start text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "#06b6d4" }}>{i + 1}.</span>
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
                  { label: "Deadline", them: "No deadline awareness at all", us: "Deadline is the core product input" },
                  { label: "Activity selection", them: "User chooses mode each session", us: "App builds daily plan — user just follows" },
                  { label: "Content detection", them: "User manually organises content", us: "AI classifies text type, selects right activities" },
                  { label: "Scale", them: "10K downloads — very early", us: "Opportunity to out-execute fast" },
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
                Memorify is the closest product but is still early and missing deadline intelligence. This is a race — build fast and differentiate on deadline-driven planning before they do.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
