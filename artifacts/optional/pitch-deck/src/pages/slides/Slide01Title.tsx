const base = import.meta.env.BASE_URL;

export default function Slide01Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <img
        src={`${base}hero-title.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Hero background"
        style={{ opacity: 0.45 }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,20,0.85) 0%, rgba(124,58,237,0.15) 50%, rgba(10,10,20,0.9) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 50%, rgba(124,58,237,0.12) 0%, transparent 60%)" }} />

      <div className="relative h-full flex flex-col justify-center px-[8vw]">
        <div className="mb-[2vh]">
          <div
            className="inline-block px-[1.2vw] py-[0.5vh] rounded-full text-[1.1vw] font-bold tracking-[0.18em] uppercase mb-[3vh]"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa", fontFamily: "DM Sans, sans-serif" }}
          >
            Agent 4 Buildathon Submission
          </div>
        </div>

        <h1
          className="font-bold tracking-tight leading-none mb-[2vh]"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "7.5vw", color: "#f0eeff", letterSpacing: "-0.03em" }}
        >
          Verbitra
        </h1>

        <p
          className="font-bold mb-[1.5vh]"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2.8vw", color: "#f59e0b", letterSpacing: "-0.01em" }}
        >
          Memorize exact text. Word for word.
        </p>

        <p
          style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#8b87b0", fontWeight: 300, maxWidth: "40vw", lineHeight: 1.6 }}
        >
          Pre-launch mobile build for verbatim recall: deadline-driven, AI-assisted, and precision-scored.
        </p>

        <div className="flex gap-[3vw] mt-[6vh]" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "3vh" }}>
          <div>
            <div className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff" }}>Active Recall</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#8b87b0", fontWeight: 300 }}>Not passive review</div>
          </div>
          <div>
            <div className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff" }}>Deadline-Driven</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#8b87b0", fontWeight: 300 }}>Your pace, automated</div>
          </div>
          <div>
            <div className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff" }}>Word for Word</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#8b87b0", fontWeight: 300 }}>Nothing approximated</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[4vh] right-[6vw]">
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#3a3660", fontWeight: 300 }}>2026</div>
      </div>
    </div>
  );
}
