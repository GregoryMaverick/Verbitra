export default function Slide5PositioningMap() {
  const points = [
    { label: "Anki", x: 18, y: 75, color: "#3b82f6", note: "Max SR rigor, min setup ease" },
    { label: "Memrise", x: 45, y: 15, color: "#10b981", note: "Easy + language only" },
    { label: "Quizlet", x: 55, y: 22, color: "#8b5cf6", note: "Easy but not verbatim" },
    { label: "LineLearner", x: 25, y: 82, color: "#ec4899", note: "Actors only, complex" },
    { label: "Scripture Typer", x: 35, y: 65, color: "#f97316", note: "Religious niche, good UX" },
    { label: "MemoCoach", x: 42, y: 58, color: "#eab308", note: "Good verbatim, iOS only" },
    { label: "Memorize By Heart", x: 55, y: 55, color: "#a78bfa", note: "Best verbatim overall" },
    { label: "Memorify", x: 60, y: 48, color: "#06b6d4", note: "AI gen, growing" },
    { label: "US", x: 82, y: 82, color: "#f59e0b", isUs: true, note: "AI-generated + deadline-aware" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(108,61,232,0.07) 0%, transparent 70%)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="mb-[2vh]">
          <div className="font-display text-[1.2vw] tracking-[0.18em] uppercase mb-[0.8vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
            Positioning Map
          </div>
          <h2 className="font-display font-bold text-[3.2vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
            Where Everyone Sits
          </h2>
        </div>

        <div className="flex flex-1 gap-[4vw] overflow-hidden">
          <div className="flex-1 relative" style={{ border: "1px solid #2a2650", borderRadius: "0.8vw" }}>
            <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.01)" }} />

            <div className="absolute left-[2vw] top-[50%] -translate-y-1/2 -translate-x-full font-display font-bold text-[1.1vw] tracking-wide uppercase" style={{ color: "#8b87b0", fontFamily: "Syne, sans-serif", writingMode: "vertical-rl", transform: "translateX(-120%) translateY(-50%) rotate(180deg)" }}>
              Verbatim Focus
            </div>
            <div className="absolute bottom-[1.5vh] left-[50%] -translate-x-1/2 font-display font-bold text-[1.1vw] tracking-wide uppercase" style={{ color: "#8b87b0", fontFamily: "Syne, sans-serif" }}>
              Setup Ease + AI Generation
            </div>

            <div className="absolute left-0 right-0 top-[50%] h-[1px]" style={{ background: "#2a2650" }} />
            <div className="absolute top-0 bottom-0 left-[50%] w-[1px]" style={{ background: "#2a2650" }} />

            <div className="absolute top-[3vh] left-[2vw] text-[1vw] font-body" style={{ color: "#3a3660", fontFamily: "DM Sans, sans-serif" }}>High verbatim</div>
            <div className="absolute bottom-[5vh] left-[2vw] text-[1vw] font-body" style={{ color: "#3a3660", fontFamily: "DM Sans, sans-serif" }}>Low verbatim</div>
            <div className="absolute top-[3vh] right-[2vw] text-[1vw] font-body" style={{ color: "#3a3660", fontFamily: "DM Sans, sans-serif" }}>Easy + AI</div>
            <div className="absolute top-[3vh] left-[48%] text-[1vw] font-body" style={{ color: "#3a3660", fontFamily: "DM Sans, sans-serif" }}>Hard / manual</div>

            {points.map((p, i) => (
              <div
                key={i}
                className="absolute"
                style={{ left: `${p.x}%`, top: `${100 - p.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div
                  className="rounded-full flex items-center justify-center font-display font-bold"
                  style={{
                    width: p.isUs ? "3.5vw" : "2.5vw",
                    height: p.isUs ? "3.5vw" : "2.5vw",
                    background: p.isUs ? p.color : `${p.color}22`,
                    border: `2px solid ${p.color}`,
                    fontSize: p.isUs ? "1vw" : "0.9vw",
                    color: p.isUs ? "#0a0a14" : p.color,
                    fontFamily: "Syne, sans-serif",
                    boxShadow: p.isUs ? `0 0 2vw ${p.color}66` : "none",
                  }}
                >
                  {p.isUs ? "US" : p.label.substring(0, 2)}
                </div>
                <div
                  className="absolute whitespace-nowrap text-[0.95vw] font-body"
                  style={{
                    top: "110%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: p.isUs ? "#f59e0b" : "#8b87b0",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: p.isUs ? 600 : 300,
                  }}
                >
                  {p.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-center gap-[2vh]" style={{ width: "22vw" }}>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="font-display font-bold text-[1.4vw] mb-[1vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>Our Position</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.5 }}>
                Top-right quadrant: High verbatim focus AND easiest setup via AI generation. No competitor sits here.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(108,61,232,0.1)", border: "1px solid rgba(108,61,232,0.3)" }}>
              <div className="font-display font-bold text-[1.4vw] mb-[1vh]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>The Gap</div>
              <p className="text-[1.2vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.5 }}>
                Every competitor either demands manual setup OR lacks verbatim recall depth. None have a deadline-driven daily plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
