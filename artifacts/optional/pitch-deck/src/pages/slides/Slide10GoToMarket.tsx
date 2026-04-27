export default function Slide10GoToMarket() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 25% 20%, rgba(59,130,246,0.08) 0%, transparent 40%), radial-gradient(circle at 78% 72%, rgba(124,58,237,0.08) 0%, transparent 40%)" }} />

      <div className="relative h-full flex flex-col px-[7vw] py-[5vh]">
        <div className="mb-[3vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.8vh" }}>
            Go-To-Market · Why Replit
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.2vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em", maxWidth: "15ch" }}>
            Focused launch first. Broader scale later.
          </h2>
        </div>

        <div className="flex gap-[2.2vw] flex-1">
          <div
            className="flex-1 rounded-[1vw] p-[1.8vw] flex flex-col"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.22)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.45vw", color: "#60a5fa", fontWeight: 700, marginBottom: "1.1vh" }}>
              First audiences
            </div>
            <div style={{ display: "grid", gap: "1.1vh" }}>
              {[
                "Law, medical, nursing, and pharmacy exam takers",
                "Actors, speakers, pastors, and faith communities",
                "Students with oral exams, definitions, and exact wording requirements",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.8vw", alignItems: "flex-start" }}>
                  <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "999px", background: "#60a5fa", marginTop: "0.7vh", flexShrink: 0 }} />
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.55 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex-1 rounded-[1vw] p-[1.8vw] flex flex-col"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}
          >
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.45vw", color: "#f59e0b", fontWeight: 700, marginBottom: "1.1vh" }}>
              Launch channels
            </div>
            <div style={{ display: "grid", gap: "1.1vh" }}>
              {[
                "Short demo posts on TikTok, X, and Instagram Reels showing deadline -> recall plan -> result",
                "Reddit, Discord, and niche study communities where exact recall pain already exists",
                "A real waitlist with audience tags, then beta invites to the highest-intent segments first",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.8vw", alignItems: "flex-start" }}>
                  <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "999px", background: "#f59e0b", marginTop: "0.7vh", flexShrink: 0 }} />
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.55 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: "24vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <div
              className="rounded-[0.9vw] p-[1.5vw]"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.28)" }}
            >
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2vw", color: "#a78bfa", fontWeight: 700, marginBottom: "0.6vh" }}>
                Early proof to collect
              </div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.55 }}>
                Waitlist signups, landing conversion, repeat practice sessions, and first paid conversions after store launch.
              </p>
            </div>

            <div
              className="rounded-[0.9vw] p-[1.5vw]"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.24)" }}
            >
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2vw", color: "#22c55e", fontWeight: 700, marginBottom: "0.6vh" }}>
                Why Replit matters
              </div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.55 }}>
                Multi-artifact workspace: mobile app, API server, landing page, pitch deck, PostgreSQL, RevenueCat integration, and deployment flow in one place.
              </p>
            </div>

            <div
              className="rounded-[0.9vw] p-[1.5vw]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2vw", color: "#f0eeff", fontWeight: 700, marginBottom: "0.6vh" }}>
                Honest stage
              </div>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.55 }}>
                Pre-launch product, not fake traction. The story is: the build is real, the audience is clear, and the distribution plan is specific.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
