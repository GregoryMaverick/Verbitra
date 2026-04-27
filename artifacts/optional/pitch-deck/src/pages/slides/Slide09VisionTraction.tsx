export default function Slide09VisionTraction() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 60%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(245,158,11,0.06) 0%, transparent 45%)" }} />

      <div className="relative h-full flex flex-col px-[7vw] py-[5vh]">
        <div className="mb-[3vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.8vh" }}>
            Launch Readiness
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.4vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Built today. Clear path to launch.
          </h2>
        </div>

        <div className="flex gap-[3vw] flex-1">
          {/* CURRENT STATE */}
          <div style={{ flex: "0 0 50%" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#22c55e", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5vh" }}>
              Built now
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1vh" }}>
              {[
                "Cross-platform mobile app — iOS + Android via Expo",
                "Full 3-phase learning loop with precision word-by-word scoring",
                "Deadline calculator — reverse-engineered daily practice plan",
                "AI mnemonic generation — hooks and acronyms from any text",
                "Camera OCR — photograph text to import it directly",
                "Spaced repetition engine — session scheduling across phases",
                "Freemium paywall with RevenueCat — $9.99/mo or $79.99/yr",
                "Push notification reminders with per-text control",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[0.6vw] px-[1.2vw] py-[0.9vh] flex items-center gap-[1vw]"
                  style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)" }}
                >
                  <div style={{ width: "0.4vw", height: "0.4vw", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.4 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ROADMAP */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5vh" }}>
              Next launch steps
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              {[
                { q: "Next", text: "Submit to Google Play and convert the live build into a store-install flow" },
                { q: "Then", text: "Replace the placeholder waitlist with a tagged beta list for law, med, and performer audiences" },
                { q: "After", text: "Track activation, return usage, and first paid conversions before expanding channels" },
              ].map(({ q, text }) => (
                <div
                  key={text}
                  className="rounded-[0.8vw] p-[1.5vw] flex items-center gap-[1.5vw]"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <div
                    className="rounded-full flex items-center justify-center font-bold shrink-0"
                    style={{ width: "2.8vw", height: "2.8vw", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.85vw", color: "#a78bfa" }}
                  >
                    {q}
                  </div>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
