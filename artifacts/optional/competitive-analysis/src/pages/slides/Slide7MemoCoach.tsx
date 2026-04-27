export default function Slide7MemoCoach() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 0%, rgba(234,179,8,0.1) 0%, transparent 50%)" }} />
      <div className="absolute top-0 left-0 w-full h-[0.5vh]" style={{ background: "linear-gradient(90deg, #eab308, transparent)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="flex items-start justify-between mb-[2.5vh]">
          <div>
            <div className="font-display text-[1.1vw] tracking-[0.18em] uppercase mb-[0.6vh]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>
              Competitor 05 — Best Progressive Method
            </div>
            <h2 className="font-display font-black text-[4vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
              MemoCoach
            </h2>
            <p className="text-[1.4vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
              "The fastest way to memorize any text — by progressively hiding words"
            </p>
          </div>
          <div className="flex gap-[1.5vw] mt-[0.5vh]">
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>1K+</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>downloads/month</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>4.6</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>2,300+ ratings (iOS)</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>iOS</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>only — no Android</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2vw] flex-1 overflow-hidden">
          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>Goal + UVP</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Verbatim memorisation via progressive word hiding — start with all words visible, gradually blank more until none remain. Smart, simple, effective. Especially strong for actors and ADHD learners.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>Problem Solved</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Rote repetition is mindless — it doesn't build memory. MemoCoach forces effortful recall by hiding words progressively. Users praised this explicitly for overcoming ADHD-related memorisation barriers.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>Activities</div>
              <div className="space-y-[0.5vh]">
                {[
                  "Progressive word hiding (core activity)",
                  "Line-by-line learning (actor mode, Pro)",
                  "10+ memorization methods (Pro)",
                  "PDF / TXT / RTF import",
                  "Autoscroll with speed control",
                  "Long-press to temporarily reveal words",
                  "Folder organisation for multiple texts",
                ].map((t, i) => (
                  <div key={i} className="flex gap-[0.7vw] text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span style={{ color: "#eab308" }}>—</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#eab308", fontFamily: "Syne, sans-serif" }}>User Flow</div>
              <div className="space-y-[0.4vh]">
                {["Import text (paste, PDF, or file)", "Highlight own lines (actor mode)", "Read full text aloud a few times", "Press 'hide' to blank random words", "Read again — fill in hidden words mentally", "Increase hiding until nothing is visible"].map((s, i) => (
                  <div key={i} className="flex gap-[0.7vw] items-start text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "#eab308" }}>{i + 1}.</span>
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
                  { label: "Platform", them: "iOS only — Android excluded (40%+ market)", us: "iOS + Android from day one" },
                  { label: "AI", them: "No AI — all manual", us: "AI selects and generates activities" },
                  { label: "Deadline", them: "Session-based, no plan", us: "Deadline-to-day plan auto-built" },
                  { label: "Free tier", them: "One method only — feels crippled", us: "Meaningful free tier (low-cost activities)" },
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
                Progressive deletion is our best activity — we build it in. MemoCoach proves it works. We add AI, deadline awareness, and Android to clean up the gap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
