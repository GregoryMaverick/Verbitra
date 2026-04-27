export default function Slide8LineLearner() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 50%, rgba(236,72,153,0.1) 0%, transparent 50%)" }} />
      <div className="absolute top-0 left-0 w-full h-[0.5vh]" style={{ background: "linear-gradient(90deg, #ec4899, transparent)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="flex items-start justify-between mb-[2.5vh]">
          <div>
            <div className="font-display text-[1.1vw] tracking-[0.18em] uppercase mb-[0.6vh]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>
              Competitor 06 — Actor-Specific
            </div>
            <h2 className="font-display font-black text-[4vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
              LineLearner
            </h2>
            <p className="text-[1.4vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
              "Learn lines the way you learn a song — hear them, mute them, speak them"
            </p>
          </div>
          <div className="flex gap-[1.5vw] mt-[0.5vh]">
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>Niche</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>actor community only</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>$3.99</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>one-time, no sub</div>
            </div>
            <div className="rounded-[0.6vw] px-[1.2vw] py-[0.8vh] text-center" style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)" }}>
              <div className="font-display font-bold text-[1.8vw]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>4.5</div>
              <div className="text-[1vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>App Store rating</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2vw] flex-1 overflow-hidden">
          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>Goal + UVP</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Actors learn their lines by recording the full script (all characters), then muting their own part and speaking along. Audio-first rehearsal. One-time price with no subscriptions — a popular selling point.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>Problem Solved</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Actors need to hear cues from other characters and respond in real time. No other app simulates actual rehearsal — just reading. LineLearner creates an audio rehearsal partner.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div className="rounded-[0.8vw] p-[1.5vw] flex-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>Activities</div>
              <div className="space-y-[0.5vh]">
                {[
                  "Record full script (all characters' lines)",
                  "Mute your own lines for gap practice",
                  "Pitch adjustment — differentiate character voices",
                  "Prompt button — reveal forgotten lines",
                  "Scene and play looping",
                  "Collaborative sharing with cast members",
                  "PDF / Word script import to playlist",
                ].map((t, i) => (
                  <div key={i} className="flex gap-[0.7vw] text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span style={{ color: "#ec4899" }}>—</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-display font-bold text-[1.3vw] mb-[1vh]" style={{ color: "#ec4899", fontFamily: "Syne, sans-serif" }}>User Flow</div>
              <div className="space-y-[0.4vh]">
                {["Upload PDF/Word script", "Assign lines to characters", "Record each character's dialogue", "Set gap size for your own lines", "Listen + speak your part aloud", "Loop weak scenes until solid"].map((s, i) => (
                  <div key={i} className="flex gap-[0.7vw] items-start text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "#ec4899" }}>{i + 1}.</span>
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
                  { label: "Audience", them: "Actors only — recording-based", us: "Anyone — text-based, no recording required" },
                  { label: "Method", them: "Audio rehearsal (auditory learners)", us: "Multiple modalities — visual, typing, recall" },
                  { label: "Deadline", them: "No deadline intelligence", us: "Deadline drives daily plan" },
                  { label: "Setup", them: "Must record all characters (time-intensive)", us: "Paste text — 30 seconds to first activity" },
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
                Not a direct threat — very different method and audience. Audio-based rehearsal is a v2 feature we could add; for now it simply doesn't compete with our core flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
