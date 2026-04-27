export default function Slide08BusinessModel() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 60%)" }} />

      <div className="relative h-full flex flex-col px-[7vw] py-[5vh]">
        <div className="mb-[3.5vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.8vh" }}>
            Business Model
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.4vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Free to start. Pay to unlock more.
          </h2>
        </div>

        <div className="flex gap-[3vw] flex-1">
          {/* FREE TIER */}
          <div
            className="flex-1 rounded-[1vw] p-[2.2vw] flex flex-col"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#8b87b0", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Free</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.6vw", color: "#f0eeff", fontWeight: 800, marginBottom: "0.3vh" }}>$0</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#5a5680", fontWeight: 300, marginBottom: "2.5vh" }}>Forever</div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.4vh" }}>
              {[
                "Up to 3 texts",
                "Up to 100 words per text",
                "All 3 practice phases",
                "Deadline calculator",
                "Push notification reminders",
                "Camera OCR — photograph any text",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.8vw", alignItems: "flex-start" }}>
                  <div style={{ width: "0.3vw", height: "0.3vw", borderRadius: "50%", background: "#5a5680", flexShrink: 0, marginTop: "0.7vh" }} />
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#5a5680", fontWeight: 300, marginTop: "2vh", paddingTop: "1.5vh", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              Grow the user base. Build the habit.
            </div>
          </div>

          {/* PRO TIER */}
          <div
            className="flex-1 rounded-[1vw] p-[2.2vw] flex flex-col"
            style={{ background: "rgba(124,58,237,0.12)", border: "2px solid rgba(124,58,237,0.5)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1vh" }}>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Pro</div>
              <div
                className="rounded-full px-[0.8vw] py-[0.3vh]"
                style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.5)" }}
              >
                <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#a78bfa", fontWeight: 600 }}>Primary revenue</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.8vw", marginBottom: "0.3vh" }}>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.6vw", color: "#f0eeff", fontWeight: 800 }}>$9.99</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#a78bfa", fontWeight: 300 }}>/month</div>
            </div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#a78bfa", fontWeight: 300, marginBottom: "2.5vh" }}>
              or $79.99/year — save 33%
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.4vh" }}>
              {[
                "Everything in Free",
                "Unlimited texts (Free: 3)",
                "Up to 500 words per text",
                "AI mnemonic hooks — custom memory devices",
                "AI acronym generation",
                "Cloud sync across devices",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.8vw", alignItems: "flex-start" }}>
                  <div style={{ width: "0.3vw", height: "0.3vw", borderRadius: "50%", background: "#a78bfa", flexShrink: 0, marginTop: "0.7vh" }} />
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#a78bfa", fontWeight: 400, marginTop: "2vh", paddingTop: "1.5vh", borderTop: "1px solid rgba(124,58,237,0.3)" }}>
              Users with high urgency convert here.
            </div>
          </div>

          {/* UNIT ECONOMICS */}
          <div style={{ width: "22vw", display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            <div
              className="rounded-[0.8vw] p-[1.5vw]"
              style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2vw", color: "#f59e0b", fontWeight: 700, marginBottom: "0.5vh" }}>Why it converts</div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.15vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.55 }}>
                Users hit the word limit on their first real text. The upgrade moment is natural and high-intent.
              </p>
            </div>
            <div
              className="rounded-[0.8vw] p-[1.5vw]"
              style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2vw", color: "#22c55e", fontWeight: 700, marginBottom: "0.5vh" }}>Annual LTV</div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.15vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.55 }}>
                $79.99/yr per Pro user. Exam cycles repeat — same user returns next semester.
              </p>
            </div>
            <div
              className="rounded-[0.8vw] p-[1.5vw]"
              style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2vw", color: "#a78bfa", fontWeight: 700, marginBottom: "0.5vh" }}>Payment</div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.15vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.55 }}>
                RevenueCat — App Store and Google Play billing. Live and ready for submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
