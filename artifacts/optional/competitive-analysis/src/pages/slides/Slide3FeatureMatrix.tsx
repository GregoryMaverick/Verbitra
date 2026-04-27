export default function Slide3FeatureMatrix() {
  const rows = [
    { feature: "Paste any text — instant setup", mbh: true, ll: false, st: true, mc: true, mfy: true, mms: false, anki: false, us: true },
    { feature: "AI generates activities from text", mbh: false, ll: false, st: false, mc: false, mfy: true, mms: false, anki: false, us: true },
    { feature: "Deadline-aware daily plan", mbh: false, ll: false, st: false, mc: false, mfy: false, mms: false, anki: false, us: true },
    { feature: "Progressive deletion method", mbh: false, ll: false, st: false, mc: true, mfy: true, mms: false, anki: false, us: true },
    { feature: "First letter recall", mbh: true, ll: false, st: true, mc: false, mfy: true, mms: false, anki: false, us: true },
    { feature: "Spaced repetition scheduling", mbh: true, ll: false, st: true, mc: false, mfy: true, mms: true, anki: true, us: true },
    { feature: "Verbatim typing / free recall", mbh: true, ll: false, st: true, mc: false, mfy: true, mms: false, anki: false, us: true },
    { feature: "Actor / script mode (mute lines)", mbh: false, ll: true, st: false, mc: true, mfy: false, mms: false, anki: false, us: false },
    { feature: "Paid product — revenue from day 1", mbh: false, ll: true, st: false, mc: true, mfy: false, mms: false, anki: false, us: true },
    { feature: "Mnemonic / acronym generation", mbh: false, ll: false, st: false, mc: false, mfy: false, mms: false, anki: false, us: true },
  ];

  const headers = ["Feature", "MBH", "LineL", "Script", "Memo\nCoach", "Memorify", "Memrise", "Anki", "Ours"];

  const Cell = ({ val, isUs }: { val: boolean; isUs?: boolean }) => (
    <div className="flex justify-center items-center">
      <span
        className="text-[1.5vw] font-body font-bold"
        style={{
          color: val ? (isUs ? "#f59e0b" : "#34d399") : "#3a3660",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {val ? (isUs ? "Y" : "Y") : "-"}
      </span>
    </div>
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 15% 80%, rgba(108,61,232,0.1) 0%, transparent 50%)" }} />

      <div className="relative h-full flex flex-col px-[5vw] py-[5vh]">
        <div className="mb-[2vh]">
          <div className="font-display text-[1.2vw] tracking-[0.18em] uppercase mb-[0.8vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
            Feature Comparison
          </div>
          <h2 className="font-display font-bold text-[3.2vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
            The Feature Matrix
          </h2>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid text-[1.15vw] mb-[1vh] font-body font-semibold" style={{ gridTemplateColumns: "3fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.2fr", gap: "0 0.5vw", fontFamily: "DM Sans, sans-serif" }}>
            {headers.map((h, i) => (
              <div key={i} className="flex justify-center items-center text-center" style={{ color: i === headers.length - 1 ? "#f59e0b" : i === 0 ? "#8b87b0" : "#6b6890" }}>
                {h}
              </div>
            ))}
          </div>
          <div className="w-full h-[0.15vh] mb-[1vh]" style={{ background: "#2a2650" }} />

          {rows.map((r, i) => (
            <div
              key={i}
              className="grid py-[0.9vh] font-body"
              style={{
                gridTemplateColumns: "3fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.2fr",
                gap: "0 0.5vw",
                borderBottom: "1px solid #1a1730",
                background: i % 2 === 0 ? "rgba(108,61,232,0.03)" : "transparent",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              <div className="text-[1.25vw] font-medium" style={{ color: "#c4bef0" }}>{r.feature}</div>
              <Cell val={r.mbh} />
              <Cell val={r.ll} />
              <Cell val={r.st} />
              <Cell val={r.mc} />
              <Cell val={r.mfy} />
              <Cell val={r.mms} />
              <Cell val={r.anki} />
              <Cell val={r.us} isUs />
            </div>
          ))}
        </div>

        <div className="mt-[2vh] flex gap-[2vw] text-[1.15vw] font-body" style={{ fontFamily: "DM Sans, sans-serif" }}>
          <div className="flex items-center gap-[0.5vw]">
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>Y</span>
            <span style={{ color: "#8b87b0" }}>= Our product</span>
          </div>
          <div className="flex items-center gap-[0.5vw]">
            <span style={{ color: "#34d399", fontWeight: 700 }}>Y</span>
            <span style={{ color: "#8b87b0" }}>= Competitor has it</span>
          </div>
          <div className="flex items-center gap-[0.5vw]">
            <span style={{ color: "#3a3660", fontWeight: 700 }}>-</span>
            <span style={{ color: "#8b87b0" }}>= Not offered</span>
          </div>
          <div className="ml-auto" style={{ color: "#a78bfa" }}>
            MBH = Memorize By Heart | LineL = LineLearner | Script = Scripture Typer
          </div>
        </div>
      </div>
    </div>
  );
}
