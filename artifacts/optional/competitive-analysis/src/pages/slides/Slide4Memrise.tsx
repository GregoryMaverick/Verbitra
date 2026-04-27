export default function Slide4Memrise() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.1) 0%, transparent 50%)" }} />
      <div className="absolute top-0 left-0 w-full h-[0.5vh]" style={{ background: "linear-gradient(90deg, #10b981, transparent)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="flex items-start justify-between mb-[2.5vh]">
          <div>
            <div className="font-display text-[1.1vw] tracking-[0.18em] uppercase mb-[0.6vh]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>
              Competitor 02
            </div>
            <h2 className="font-display font-black text-[4vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
              Memrise
            </h2>
            <p className="text-[1.5vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
              "Learn a language. Not just words."
            </p>
          </div>
          <div className="flex gap-[1.5vw] mt-[0.5vh]">
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>65M+</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>registered users</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>35+</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>languages</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>$79.99</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>per year Pro</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2vw] flex-1 overflow-hidden">
          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>Goal</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Make language learning accessible, enjoyable, and effective through gamification, native speaker video, and AI conversation practice.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>Problem Solved</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Language learning is boring and ineffective. Memrise adds native speaker videos and AI chat to build real conversational confidence, not just vocabulary.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>UVP</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Native speaker video library + AI conversation partner. The only mainstream app that bridges vocabulary to real conversation.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>Techniques</div>
              <div className="space-y-[0.6vh]">
                {["Spaced repetition scheduling", "Native speaker video clips", "AI conversation chatbot (GPT-3)", "Gamification — streaks, points, levels", "Grammar and verb drills (Pro)", "Speed review mode"].map((t, i) => (
                  <div key={i} className="flex gap-[0.7vw] text-[1.15vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span style={{ color: "#10b981" }}>—</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#10b981", fontFamily: "Syne, sans-serif" }}>User Flow</div>
              <div className="space-y-[0.5vh]">
                {["Choose language and level", "Complete structured course modules", "Watch native speaker video clips", "Practice with vocabulary games", "Review with spaced repetition", "Chat with AI language partner (Pro)"].map((s, i) => (
                  <div key={i} className="flex gap-[0.7vw] items-start text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "#10b981" }}>{i + 1}.</span>
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
                  { label: "Content", them: "Fixed language courses only", us: "Any text the user pastes" },
                  { label: "Verbatim", them: "Not a feature — vocab & conversation", us: "Word-for-word core feature" },
                  { label: "Deadline", them: "No deadline — ongoing journey", us: "Deadline-driven daily plan" },
                  { label: "Audience", them: "Language learners", us: "Exam takers, students, speakers" },
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
                Memrise is a language app. It is not a competitor for our core job. The 65M users signal the appetite — but they are a different market entirely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
