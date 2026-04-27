export default function Slide06Market() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 70% 30%, rgba(245,158,11,0.07) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(124,58,237,0.07) 0%, transparent 50%)" }} />

      <div className="relative h-full flex flex-col px-[7vw] py-[5vh]">
        <div className="mb-[4vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.8vh" }}>
            Market Opportunity
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.4vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Every professional certification. Every performer. Every devotee.
          </h2>
        </div>

        <div className="flex gap-[2vw] mb-[3vh]">
          <div
            className="flex-1 rounded-[1vw] p-[2vw]"
            style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)" }}
          >
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f97316", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Tier 1 — High-Stakes Exams</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.35vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6, marginBottom: "1.5vh" }}>Medical boards, bar exams, CPA, Series 7, nursing licensure, pharmacy boards. Candidates who spend thousands on preparation and have the highest willingness to pay in the category.</p>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5vw", color: "#f97316", fontWeight: 700 }}>Primary monetisation target</div>
          </div>

          <div
            className="flex-1 rounded-[1vw] p-[2vw]"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)" }}
          >
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#60a5fa", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Tier 2 — Students</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.35vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6, marginBottom: "1.5vh" }}>University and secondary students with mandatory memorization requirements — definitions, statutes, oral exams, competitive speaking. Highest frequency of any group. Multiple exam cycles per year.</p>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5vw", color: "#60a5fa", fontWeight: 700 }}>High-frequency acquisition channel</div>
          </div>

          <div
            className="flex-1 rounded-[1vw] p-[2vw]"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Tier 3 — Performers</div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.35vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6, marginBottom: "1.5vh" }}>Actors, keynote speakers, preachers, pastors, religious communities learning scripture and liturgy. Distinct verbatim recall need — every word exact, for a specific performance moment.</p>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5vw", color: "#a78bfa", fontWeight: 700 }}>Enthusiast and niche communities</div>
          </div>
        </div>

        <div
          className="rounded-[0.8vw] p-[1.8vw] flex items-center gap-[2vw]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#c4bef0", fontWeight: 300, lineHeight: 1.6 }}>
              The launch sweet spot: university students moving toward professional exams — pre-med to MCAT, law students to bar exam, finance to CFA. Student frequency plus professional-level urgency gives the clearest first wedge.
            </p>
          </div>
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "-0.02em" }}>Every professional cert.</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "-0.02em" }}>Every actor. Every devotee.</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#5a5680", fontWeight: 300, marginTop: "0.5vh" }}>One product. Same job.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
