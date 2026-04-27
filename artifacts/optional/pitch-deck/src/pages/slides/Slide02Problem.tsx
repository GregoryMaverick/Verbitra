export default function Slide02Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.06) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(124,58,237,0.08) 0%, transparent 40%)" }} />

      <div className="relative h-full flex flex-col justify-center px-[7vw] py-[6vh]">
        <div className="mb-[2vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1vh" }}>
            The Problem
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.8vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "4vh" }}>
            The illusion of knowing.
          </h2>
        </div>

        <div className="flex gap-[4vw] flex-1 items-center">
          <div style={{ flex: "0 0 48%" }}>
            <div
              className="rounded-[1vw] p-[2.5vw]"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <p
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#f0eeff", fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.02em", fontStyle: "italic" }}
              >
                "You've read it ten times. You still can't say it from memory."
              </p>
            </div>

            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.7, marginTop: "2.5vh" }}>
              Re-reading creates familiarity — not recall. It builds the illusion of knowing without building real memory.
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.7, marginTop: "1.5vh" }}>
              The result: people forget, blank, and underperform — despite putting in the time.
            </p>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#5a5680", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5vh" }}>
              When it happens
            </div>
            <div className="flex items-center gap-[1vw] py-[1.2vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#c4bef0", fontWeight: 300 }}>Preparing for an exam</span>
            </div>
            <div className="flex items-center gap-[1vw] py-[1.2vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#c4bef0", fontWeight: 300 }}>Memorising lines for a play</span>
            </div>
            <div className="flex items-center gap-[1vw] py-[1.2vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#c4bef0", fontWeight: 300 }}>Committing scripture to memory</span>
            </div>
            <div className="flex items-center gap-[1vw] py-[1.2vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#c4bef0", fontWeight: 300 }}>Learning case law before a hearing</span>
            </div>
            <div className="flex items-center gap-[1vw] py-[1.2vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#c4bef0", fontWeight: 300 }}>Rehearsing a speech</span>
            </div>
            <div className="flex items-center gap-[1vw] py-[1.2vh]">
              <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#c4bef0", fontWeight: 300 }}>Reciting a poem</span>
            </div>

            <div
              className="rounded-[0.8vw] p-[1.5vw] mt-[1vh]"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#a78bfa", fontWeight: 400, lineHeight: 1.5 }}>
                Recognition is not recall. No existing tool is built for verbatim, word-for-word memory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
