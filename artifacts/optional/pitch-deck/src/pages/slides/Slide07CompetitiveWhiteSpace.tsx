export default function Slide07CompetitiveWhiteSpace() {
  const competitors = [
    { label: "Anki", x: 18, y: 75, color: "#3b82f6" },
    { label: "Memrise", x: 60, y: 18, color: "#10b981" },
    { label: "Quizlet", x: 65, y: 25, color: "#8b5cf6" },
    { label: "Mem. By Heart", x: 50, y: 60, color: "#a78bfa" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 80%, rgba(245,158,11,0.07) 0%, transparent 40%), radial-gradient(circle at 20% 20%, rgba(124,58,237,0.07) 0%, transparent 40%)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[5vh]">
        <div className="mb-[2vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.8vh" }}>
            Competitive White Space
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.4vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Positioned where generic study tools fall short.
          </h2>
        </div>

        <div className="flex gap-[3vw] flex-1 overflow-hidden">
          <div className="flex-1 relative" style={{ border: "1px solid #2a2650", borderRadius: "0.8vw", minHeight: 0 }}>
            <div className="absolute inset-0" style={{ background: "rgba(245,158,11,0.04)" }} />

            <div
              className="absolute"
              style={{
                right: "3%",
                top: "3%",
                width: "46%",
                height: "46%",
                background: "rgba(245,158,11,0.06)",
                border: "1px dashed rgba(245,158,11,0.3)",
                borderRadius: "0.5vw",
              }}
            />

            <div
              className="absolute font-bold text-center"
              style={{
                right: "4%",
                top: "4%",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "0.9vw",
                color: "rgba(245,158,11,0.6)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Opportunity
            </div>

            <div className="absolute left-0 right-0 top-[50%] h-[1px]" style={{ background: "#2a2650" }} />
            <div className="absolute top-0 bottom-0 left-[50%] w-[1px]" style={{ background: "#2a2650" }} />

            <div className="absolute top-[3vh] left-[2vw]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.9vw", color: "#3a3660" }}>High verbatim</div>
            <div className="absolute bottom-[4vh] left-[2vw]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.9vw", color: "#3a3660" }}>Low verbatim</div>
            <div className="absolute bottom-[1.5vh] left-[50%] -translate-x-1/2" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "0.95vw", color: "#5a5680", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Setup Ease + AI Generation
            </div>
            <div
              className="absolute"
              style={{
                left: "2vw",
                top: "50%",
                transform: "translateX(-110%) translateY(-50%) rotate(180deg)",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "0.95vw",
                color: "#5a5680",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                writingMode: "vertical-rl",
              }}
            >
              Verbatim Focus
            </div>

            {competitors.map((p, i) => (
              <div
                key={i}
                className="absolute"
                style={{ left: `${p.x}%`, top: `${100 - p.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div
                  className="rounded-full flex items-center justify-center font-bold"
                  style={{
                    width: "2.4vw",
                    height: "2.4vw",
                    background: `${p.color}22`,
                    border: `2px solid ${p.color}`,
                    fontSize: "0.8vw",
                    color: p.color,
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  {p.label.substring(0, 2)}
                </div>
                <div
                  className="absolute whitespace-nowrap"
                  style={{
                    top: "110%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "0.85vw",
                    color: "#5a5680",
                    fontWeight: 400,
                  }}
                >
                  {p.label}
                </div>
              </div>
            ))}

            <div
              className="absolute"
              style={{ left: `82%`, top: `${100 - 84}%`, transform: "translate(-50%, -50%)" }}
            >
              <div
                className="rounded-full flex items-center justify-center font-bold"
                style={{
                  width: "3.5vw",
                  height: "3.5vw",
                  background: "#f59e0b",
                  border: "2px solid #f59e0b",
                  fontSize: "1vw",
                  color: "#0a0a14",
                  fontFamily: "Space Grotesk, sans-serif",
                  boxShadow: "0 0 2vw rgba(245,158,11,0.5)",
                }}
              >
                US
              </div>
              <div
                className="absolute whitespace-nowrap font-bold"
                style={{
                  top: "110%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "0.9vw",
                  color: "#f59e0b",
                  fontWeight: 700,
                }}
              >
                Verbitra
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-[2vh]" style={{ width: "24vw" }}>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f59e0b", fontWeight: 700, marginBottom: "0.8vh" }}>Our Position</div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.5 }}>
                Top-right quadrant: highest verbatim focus AND easiest setup via AI generation. No competitor sits here.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#a78bfa", fontWeight: 700, marginBottom: "0.8vh" }}>The Gap</div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.5 }}>
                Every competitor either demands manual setup OR lacks verbatim depth. None have deadline-driven daily plans.
              </p>
            </div>
            <div className="rounded-[0.8vw] p-[1.5vw]" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#22c55e", fontWeight: 700, marginBottom: "0.8vh" }}>The Moat</div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.5 }}>
                Paste text. Get a plan. Train to mastery. No manual card creation. No configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
