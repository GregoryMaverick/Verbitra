export default function Slide4UserComplaints() {
  const complaints = [
    {
      app: "Anki",
      color: "#3b82f6",
      complaints: [
        "Have to create every card manually — hours of setup before any learning",
        "No deadline intelligence — no way to say 'I have 10 days, structure my plan'",
        "Steep learning curve; SRS algorithm intimidates non-technical users",
      ],
      opportunity: "Users want auto-generation. Setup is the biggest drop-off point.",
    },
    {
      app: "Memorize By Heart",
      color: "#8b5cf6",
      complaints: [
        "App deleted all my texts twice — data loss is a recurring complaint",
        "Can't scan multiple pages into the same memorization at once",
        "Sentence scramble UI broken: can't scroll when dragging an item",
      ],
      opportunity: "Strong concept, poor reliability. A stable product wins here.",
    },
    {
      app: "Memrise",
      color: "#10b981",
      complaints: [
        "Language learning only — cannot paste custom text or study notes",
        "Price jumped from $5 to $40/yr — users feel blindsided",
        "No verbatim mode — teaches vocabulary, not exact phrasing",
      ],
      opportunity: "Memrise is a language app cosplaying as a study tool. Not a real competitor for our core job.",
    },
    {
      app: "MemoCoach",
      color: "#f59e0b",
      complaints: [
        "iOS only — Android users locked out entirely",
        "Free tier has only one memorization method — feels crippled",
        "No AI generation — all content must be manually typed or imported",
      ],
      opportunity: "iOS-only is a 40%+ market miss. Android + AI generation wins.",
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 90% 10%, rgba(245,158,11,0.08) 0%, transparent 45%)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5.5vh]">
        <div className="mb-[2.5vh]">
          <div className="font-display text-[1.2vw] tracking-[0.18em] uppercase mb-[0.8vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
            Voice of the Market
          </div>
          <h2 className="font-display font-bold text-[3.2vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
            What Users Are Complaining About
          </h2>
          <p className="text-[1.4vw] font-body mt-[0.8vh]" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
            Sourced from App Store reviews, Google Play reviews, and community forums
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[2vw] flex-1 overflow-hidden">
          {complaints.map((item, i) => (
            <div
              key={i}
              className="rounded-[1vw] p-[2vw] flex flex-col"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)` }}
            >
              <div className="flex items-center gap-[0.8vw] mb-[1.5vh]">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full" style={{ background: item.color }} />
                <span className="font-display font-bold text-[1.5vw]" style={{ color: item.color, fontFamily: "Syne, sans-serif" }}>
                  {item.app}
                </span>
              </div>
              <div className="flex-1 space-y-[0.8vh] mb-[1.5vh]">
                {item.complaints.map((c, j) => (
                  <div key={j} className="flex gap-[0.8vw] text-[1.25vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                    <span style={{ color: "#ef4444", flexShrink: 0 }}>x</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[0.5vw] px-[1vw] py-[0.8vh] text-[1.15vw] font-body font-medium" style={{ background: "rgba(108,61,232,0.15)", color: "#a78bfa", border: "1px solid rgba(108,61,232,0.3)", fontFamily: "DM Sans, sans-serif" }}>
                {item.opportunity}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
