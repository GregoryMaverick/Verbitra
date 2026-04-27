export default function Slide6ScriptureTyper() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 80%, rgba(249,115,22,0.1) 0%, transparent 50%)" }} />
      <div className="absolute top-0 left-0 w-full h-[0.5vh]" style={{ background: "linear-gradient(90deg, #f97316, transparent)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="flex items-start justify-between mb-[2.5vh]">
          <div>
            <div className="font-display text-[1.1vw] tracking-[0.18em] uppercase mb-[0.6vh]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>
              Competitor 04 — Best UX in category
            </div>
            <h2 className="font-display font-black text-[3.5vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
              Scripture Typer
            </h2>
            <p className="text-[1.4vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
              "The #1 Bible memory app — memorize scripture by typing, listening, and reviewing"
            </p>
          </div>
          <div className="flex gap-[1.5vw] mt-[0.5vh]">
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>2M+</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>users</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>30M+</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>verses memorized</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>4.8</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>20K+ ratings</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2vw] flex-1 overflow-hidden">
          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>Goal + UVP</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Help believers memorize scripture verbatim using 3 cognitive pathways: kinesthetic (typing), visual (flashcards), and auditory (audio recording). Highest-rated verbatim app by a large margin.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>Problem Solved</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                People who want to memorize scripture have no structured way to do it. Reading it repeatedly doesn't produce reliable recall. Typing each word forces active engagement.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>Activities + Techniques</div>
              <div className="space-y-[0.5vh]">
                {[
                  "Type first letter of each word (kinesthetic)",
                  "Animated word emphasis (visual)",
                  "Flashcards per verse",
                  "Audio recording and playback (auditory, Pro)",
                  "Smart review — spaced repetition scheduling",
                  "Group accountability + leaderboards",
                  "Gamification — points, badges, levels",
                ].map((t, i) => (
                  <div key={i} className="flex gap-[0.7vw] text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span style={{ color: "#f97316" }}>—</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#f97316", fontFamily: "Syne, sans-serif" }}>User Flow</div>
              <div className="space-y-[0.4vh]">
                {["Sign up + choose Bible translation", "Add verses from library or manual entry", "Type It — type first letters to learn", "Memorize It — typing + flashcards", "Master It — full recall from blank", "Smart review sends reminders on schedule"].map((s, i) => (
                  <div key={i} className="flex gap-[0.7vw] items-start text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "#f97316" }}>{i + 1}.</span>
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
                  { label: "Content scope", them: "Bible only — locked to scripture", us: "Any text — exams, speeches, scripts, anything" },
                  { label: "UX quality", them: "Excellent — best in class", us: "Match or exceed this standard" },
                  { label: "Deadline", them: "No deadline awareness", us: "Deadline drives the plan" },
                  { label: "AI", them: "AI is a Bible study add-on", us: "AI generates personalised activities" },
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
                Scripture Typer proves the 3-pathway model (type, see, hear) works. We adopt that UX quality and apply it to every text type, not just the Bible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
