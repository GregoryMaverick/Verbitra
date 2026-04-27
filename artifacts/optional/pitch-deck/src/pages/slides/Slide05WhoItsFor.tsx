export default function Slide05WhoItsFor() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 65%)" }} />

      <div className="relative h-full flex flex-col px-[7vw] py-[5vh]">
        <div className="mb-[3vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.8vh" }}>
            Who It's For
          </div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "3.4vw", color: "#f0eeff", fontWeight: 800, letterSpacing: "-0.03em" }}>
            High stakes. Real moments.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-[2vw] flex-1">
          <div
            className="rounded-[1vw] p-[2.2vw] flex flex-col justify-between"
            style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.25)" }}
          >
            <div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f97316", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Medical Students</div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#f0eeff", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.2 }}>Before boards</h3>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.65 }}>Drug mechanisms, diagnostic criteria, clinical definitions — verbatim under exam pressure. USMLE retake costs $1,000+.</p>
            </div>
            <div
              className="rounded-[0.5vw] px-[1vw] py-[0.7vh] self-start mt-[1.5vh]"
              style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}
            >
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#f97316", fontWeight: 600 }}>Highest willingness to pay</span>
            </div>
          </div>

          <div
            className="rounded-[1vw] p-[2.2vw] flex flex-col justify-between"
            style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.25)" }}
          >
            <div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#60a5fa", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Law Students</div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#f0eeff", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.2 }}>Before a hearing</h3>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.65 }}>Statute text, elements of crimes, exact legal standards. Bar exam retake means months of lost income and opportunity.</p>
            </div>
            <div
              className="rounded-[0.5vw] px-[1vw] py-[0.7vh] self-start mt-[1.5vh]"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#60a5fa", fontWeight: 600 }}>Fixed non-negotiable deadline</span>
            </div>
          </div>

          <div
            className="rounded-[1vw] p-[2.2vw] flex flex-col justify-between"
            style={{ background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.25)" }}
          >
            <div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#ec4899", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Actors</div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#f0eeff", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.2 }}>On opening night</h3>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.65 }}>Every word must be exact. Scripts cannot be paraphrased. One wrong word breaks the scene and the audience.</p>
            </div>
            <div
              className="rounded-[0.5vw] px-[1vw] py-[0.7vh] self-start mt-[1.5vh]"
              style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.3)" }}
            >
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#ec4899", fontWeight: 600 }}>True verbatim required</span>
            </div>
          </div>

          <div
            className="rounded-[1vw] p-[2.2vw] flex flex-col justify-between"
            style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)" }}
          >
            <div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#22c55e", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vh" }}>Religious Learners</div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2vw", color: "#f0eeff", fontWeight: 700, marginBottom: "1.5vh", lineHeight: 1.2 }}>Scripture word-perfect</h3>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.65 }}>Quranic verses, scripture passages, liturgical texts, creeds. The congregation notices a wrong word.</p>
            </div>
            <div
              className="rounded-[0.5vw] px-[1vw] py-[0.7vh] self-start mt-[1.5vh]"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#22c55e", fontWeight: 600 }}>Identity and meaning at stake</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
