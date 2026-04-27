export default function Slide03Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)" }} />

      <div className="relative h-full flex flex-col justify-center px-[7vw] py-[5vh]">
        <div className="mb-[4vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1vh" }}>
            The Solution
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.8vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5vh" }}>
            Paste it. Set your deadline.
          </h2>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.8vw", color: "#7c3aed", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "3vh" }}>
            Train until the words come from memory.
          </h2>
        </div>

        <div className="flex gap-[2vw] items-center mb-[4vh]">
          <div
            className="flex-1 rounded-[1vw] p-[2vw] text-center"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#60a5fa", fontWeight: 700, marginBottom: "0.8vh" }}>Phase 1</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.8vw", color: "#f0eeff", fontWeight: 700, marginBottom: "1vh" }}>Read</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.6 }}>
              Full text displayed. Text-to-speech read-along. Foundation before active recall.
            </p>
          </div>

          <div style={{ color: "#3a3660", fontSize: "2vw", fontWeight: 300 }}>→</div>

          <div
            className="flex-1 rounded-[1vw] p-[2vw] text-center"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#f59e0b", fontWeight: 700, marginBottom: "0.8vh" }}>Phase 2</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.8vw", color: "#f0eeff", fontWeight: 700, marginBottom: "1vh" }}>Scaffold</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.6 }}>
              First-letter cues, progressive deletion, guided typing. Scaffolding removed session by session.
            </p>
          </div>

          <div style={{ color: "#3a3660", fontSize: "2vw", fontWeight: 300 }}>→</div>

          <div
            className="flex-1 rounded-[1vw] p-[2vw] text-center"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#22c55e", fontWeight: 700, marginBottom: "0.8vh" }}>Phase 3</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.8vw", color: "#f0eeff", fontWeight: 700, marginBottom: "1vh" }}>Remember</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.6 }}>
              Full recall. Zero hints. Precision scoring. This is where mastery lives.
            </p>
          </div>
        </div>

        <div className="flex gap-[2vw]">
          <div
            className="flex-1 rounded-[0.8vw] p-[1.5vw]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff", fontWeight: 700, marginBottom: "0.5vh" }}>Deadline Intelligence</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.5 }}>Set a date. Get a reverse-engineered daily plan.</p>
          </div>
          <div
            className="flex-1 rounded-[0.8vw] p-[1.5vw]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff", fontWeight: 700, marginBottom: "0.5vh" }}>AI Mnemonic Generation</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.5 }}>Memory hooks and acronyms generated from your text, instantly.</p>
          </div>
          <div
            className="flex-1 rounded-[0.8vw] p-[1.5vw]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff", fontWeight: 700, marginBottom: "0.5vh" }}>Precision Scoring</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.5 }}>Every word counted. Auto-advance on mastery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
