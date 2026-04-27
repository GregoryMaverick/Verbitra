import "./fonts.css";

export function ProductSplit() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a14",
        display: "flex",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 10% 80%, rgba(245,158,11,0.06) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      {/* LEFT COLUMN — text */}
      <div style={{
        flex: "0 0 52%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 0 0 7vw",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          padding: "0.4vh 1.1vw",
          borderRadius: "999px",
          background: "rgba(124,58,237,0.18)",
          border: "1px solid rgba(124,58,237,0.38)",
          color: "#a78bfa",
          fontSize: "0.95vw",
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          marginBottom: "3.5vh",
        }}>
          Investor Presentation
        </div>

        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "6.4vw",
          fontWeight: 700,
          color: "#f0eeff",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          margin: "0 0 2vh 0",
        }}>
          Verbitra
        </h1>

        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "2vw",
          fontWeight: 700,
          color: "#f59e0b",
          letterSpacing: "-0.01em",
          margin: "0 0 2vh 0",
        }}>
          Verbatim recall, by your deadline.
        </p>

        <p style={{
          fontSize: "1.3vw",
          color: "#8b87b0",
          fontWeight: 300,
          lineHeight: 1.65,
          maxWidth: "28vw",
          margin: "0 0 5vh 0",
        }}>
          The only app built for verbatim recall —<br />
          deadline-driven, AI-assisted, precision-scored.
        </p>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "3vh",
          display: "flex",
          flexDirection: "column",
          gap: "1.6vh",
        }}>
          {[
            ["Active Recall", "Not passive review"],
            ["Deadline-Driven", "Your pace, automated"],
            ["Word for Word", "Nothing approximated"],
          ].map(([label, sub]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#7c3aed",
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.15vw",
                fontWeight: 600,
                color: "#f0eeff",
              }}>{label}</span>
              <span style={{ fontSize: "1.05vw", color: "#8b87b0", fontWeight: 300 }}>{sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN — phone mockup */}
      <div style={{
        flex: "0 0 48%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Subtle vertical divider */}
        <div style={{
          position: "absolute",
          left: 0, top: "10%", bottom: "10%",
          width: "1px",
          background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.3) 40%, rgba(124,58,237,0.3) 60%, transparent)",
        }} />

        {/* Phone frame */}
        <div style={{
          width: "20vw",
          height: "40vw",
          maxHeight: "82vh",
          background: "#111118",
          borderRadius: "3.5vw",
          border: "1.5px solid rgba(124,58,237,0.35)",
          boxShadow: "0 0 60px rgba(124,58,237,0.18), 0 0 120px rgba(124,58,237,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Notch */}
          <div style={{
            alignSelf: "center",
            marginTop: "1.2vw",
            width: "5vw",
            height: "0.55vw",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "999px",
            flexShrink: 0,
          }} />

          {/* Screen content */}
          <div style={{ flex: 1, padding: "1.2vw 1.4vw", display: "flex", flexDirection: "column", gap: "1.2vw" }}>
            {/* App header */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.7vw", color: "#8b87b0", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>MEMORIZER</div>
              <div style={{ fontSize: "1vw", color: "#f0eeff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginTop: "0.3vw" }}>Miranda Rights</div>
              <div style={{ fontSize: "0.65vw", color: "#8b87b0" }}>67 words · 4 days left</div>
            </div>

            {/* Progress ring placeholder */}
            <div style={{
              alignSelf: "center",
              width: "7vw", height: "7vw",
              borderRadius: "50%",
              background: "conic-gradient(#7c3aed 240deg, rgba(124,58,237,0.15) 240deg)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: "5.4vw", height: "5.4vw",
                borderRadius: "50%",
                background: "#111118",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column",
              }}>
                <div style={{ fontSize: "1.4vw", fontWeight: 700, color: "#f0eeff", fontFamily: "'Space Grotesk', sans-serif" }}>67%</div>
                <div style={{ fontSize: "0.55vw", color: "#8b87b0" }}>mastered</div>
              </div>
            </div>

            {/* Word blocks */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4vw" }}>
              {["You", "have", "the", "right", "___", "remain", "silent.", "Anything", "___", "say", "can", "___"].map((w, i) => (
                <div key={i} style={{
                  padding: "0.2vw 0.5vw",
                  borderRadius: "0.4vw",
                  background: w === "___" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${w === "___" ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`,
                  fontSize: "0.65vw",
                  color: w === "___" ? "#a78bfa" : "#c4c0e0",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Bottom nav hint */}
            <div style={{
              marginTop: "auto",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "0.8vw",
              display: "flex",
              justifyContent: "space-around",
            }}>
              {["▦", "＋", "⚙"].map((icon, i) => (
                <div key={i} style={{ fontSize: "1vw", color: i === 0 ? "#7c3aed" : "#3a3660" }}>{icon}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Glow under phone */}
        <div style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "18vw",
          height: "4vw",
          background: "rgba(124,58,237,0.25)",
          filter: "blur(24px)",
          borderRadius: "50%",
        }} />
      </div>

      {/* Year watermark */}
      <div style={{
        position: "absolute",
        bottom: "4vh",
        right: "4vw",
        fontSize: "1vw",
        color: "#2a2650",
        fontWeight: 300,
      }}>
        2026
      </div>
    </div>
  );
}
