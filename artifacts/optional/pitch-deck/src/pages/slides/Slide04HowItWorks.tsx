export default function Slide04HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 70%, rgba(124,58,237,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.05) 0%, transparent 40%)" }} />

      <div className="relative h-full flex flex-col px-[7vw] py-[5vh]">
        <div className="mb-[3vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.8vh" }}>
            How It Works
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.4vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Three phases. One method.
          </h2>
        </div>

        <div className="flex gap-[2.5vw] flex-1">
          <div className="flex-1 flex flex-col" style={{ border: "1px solid rgba(59,130,246,0.2)", borderRadius: "1vw", overflow: "hidden" }}>
            <div className="p-[1.8vw]" style={{ background: "rgba(59,130,246,0.08)", borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#60a5fa", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5vh" }}>Phase 1</div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2.2vw", color: "#f0eeff", fontWeight: 800 }}>Read</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#60a5fa", fontWeight: 400, marginTop: "0.3vh" }}>Foundation</div>
            </div>
            <div className="p-[1.8vw] flex-1 flex flex-col gap-[1.5vh]">
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#60a5fa", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Full text displayed — read it at your own pace</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#60a5fa", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Text-to-speech read-along at adjustable pace</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#60a5fa", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>AI mnemonic devices and acronyms generated from your text</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#60a5fa", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Advance when ready — no forced timers</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col" style={{ border: "1px solid rgba(245,158,11,0.2)", borderRadius: "1vw", overflow: "hidden" }}>
            <div className="p-[1.8vw]" style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5vh" }}>Phase 2</div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2.2vw", color: "#f0eeff", fontWeight: 800 }}>Scaffold</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#f59e0b", fontWeight: 400, marginTop: "0.3vh" }}>Progressive</div>
            </div>
            <div className="p-[1.8vw] flex-1 flex flex-col gap-[1.5vh]">
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#f59e0b", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>First-letter cues: only initial letters shown</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#f59e0b", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Progressive word deletion across sessions</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#f59e0b", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Guided typing with live word-by-word feedback</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#f59e0b", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Scaffolding removed automatically as mastery increases</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col" style={{ border: "1px solid rgba(34,197,94,0.2)", borderRadius: "1vw", overflow: "hidden" }}>
            <div className="p-[1.8vw]" style={{ background: "rgba(34,197,94,0.08)", borderBottom: "1px solid rgba(34,197,94,0.15)" }}>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#22c55e", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5vh" }}>Phase 3</div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2.2vw", color: "#f0eeff", fontWeight: 800 }}>Remember</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#22c55e", fontWeight: 400, marginTop: "0.3vh" }}>Mastery</div>
            </div>
            <div className="p-[1.8vw] flex-1 flex flex-col gap-[1.5vh]">
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#22c55e", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Type the full text from memory — zero hints</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#22c55e", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Precision scoring — every word counted</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#22c55e", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Auto-advance: hit the target score, phase advances</p>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
                <div style={{ width: "0.3vw", borderRadius: "0.2vw", background: "#22c55e", flexShrink: 0, marginTop: "0.5vh", height: "100%" }} />
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>Confidence for the moment it matters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
