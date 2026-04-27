export default function Slide6WhiteSpace() {
  const gaps = [
    {
      title: "No one auto-generates activities from pasted text",
      detail: "Every app requires manual card creation or content entry. Anki, Quizlet, MemoCoach — all demand setup. The core job (paste text, get a plan) is unserved.",
      kano: "Delighter today — Basic tomorrow",
      color: "#6c3de8",
    },
    {
      title: "No app has deadline intelligence",
      detail: "None of the 7 competitors ask 'when is your deadline?' and build a reverse-engineered daily plan. All are session-based, not deadline-driven.",
      kano: "Delighter today — Basic tomorrow",
      color: "#f59e0b",
    },
    {
      title: "Verbatim + AI generation in one product",
      detail: "Apps with AI (Memorify, Memrise) focus on language or concepts. Apps with verbatim (MBH, Scripture Typer) have no AI generation. No product combines both.",
      kano: "Uncontested white space",
      color: "#10b981",
    },
    {
      title: "High-stakes exam takers are underserved",
      detail: "No competitor markets directly to medical board, bar exam, or CPA candidates. These users spend $1,000s on prep and have the highest willingness to pay in the category.",
      kano: "Distribution gap — same product, better targeting",
      color: "#ec4899",
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 30%, rgba(108,61,232,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(245,158,11,0.06) 0%, transparent 40%)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5.5vh]">
        <div className="mb-[3vh]">
          <div className="font-display text-[1.2vw] tracking-[0.18em] uppercase mb-[0.8vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
            Market Gaps
          </div>
          <h2 className="font-display font-bold text-[3.2vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
            Where No One Is Playing
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-[2vw] flex-1 overflow-hidden">
          {gaps.map((g, i) => (
            <div
              key={i}
              className="rounded-[1vw] p-[2.2vw] flex flex-col"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${g.color}33` }}
            >
              <div className="flex items-start gap-[1vw] mb-[1.5vh]">
                <div className="w-[0.4vw] rounded-full mt-[0.5vh] flex-shrink-0" style={{ background: g.color, height: "100%" }} />
                <h3 className="font-display font-bold text-[1.6vw] leading-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
                  {g.title}
                </h3>
              </div>
              <p className="flex-1 text-[1.3vw] font-body leading-relaxed mb-[1.5vh]" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
                {g.detail}
              </p>
              <div className="inline-flex rounded-full px-[1vw] py-[0.5vh] text-[1.1vw] font-body font-semibold self-start" style={{ background: `${g.color}22`, color: g.color, border: `1px solid ${g.color}55`, fontFamily: "DM Sans, sans-serif" }}>
                {g.kano}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
