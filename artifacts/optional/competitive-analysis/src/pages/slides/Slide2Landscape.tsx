export default function Slide2Landscape() {
  const competitors = [
    { name: "Memorize By Heart", type: "Verbatim", pricing: "Free + ~$3/mo", users: "Millions memorized", rating: "4.7", platform: "iOS + Android" },
    { name: "LineLearner", type: "Actor/Verbatim", pricing: "$3.99 one-time", users: "Niche (actors)", rating: "4.5", platform: "iOS + Android" },
    { name: "Scripture Typer", type: "Religious/Verbatim", pricing: "Free + $9.99 one-time", users: "2M+ believers", rating: "4.8", platform: "iOS + Android" },
    { name: "MemoCoach", type: "Verbatim", pricing: "$8.99–$59.99", users: "1,000+/mo DL", rating: "4.6", platform: "iOS only" },
    { name: "Memorify", type: "Verbatim + Flashcard", pricing: "Freemium", users: "10K+ downloads", rating: "4.1", platform: "iOS + Android" },
    { name: "Memrise", type: "Language Learning", pricing: "Free + $79.99/yr", users: "65M+ users", rating: "4.3", platform: "iOS + Android + Web" },
    { name: "Anki", type: "Flashcard/SR", pricing: "Free (desktop) + $24.99 iOS", users: "10M+ users", rating: "4.6", platform: "All platforms" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 20%, rgba(108,61,232,0.12) 0%, transparent 55%)" }} />
      <div className="absolute top-0 left-0 w-[0.4vw] h-full" style={{ background: "linear-gradient(180deg, #6c3de8, #f59e0b)" }} />

      <div className="relative h-full flex flex-col px-[6vw] py-[6vh]">
        <div className="mb-[3vh]">
          <div className="font-display text-[1.2vw] tracking-[0.18em] uppercase mb-[1vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
            The Field
          </div>
          <h2 className="font-display font-bold text-[3.5vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
            Competitive Landscape
          </h2>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid text-[1.2vw] mb-[1.5vh] font-body font-medium" style={{ gridTemplateColumns: "2fr 1fr 1.4fr 1.4fr 0.8fr 1.5fr", color: "#8b87b0", fontFamily: "DM Sans, sans-serif", gap: "0 2vw" }}>
            <span>Product</span>
            <span>Type</span>
            <span>Pricing</span>
            <span>Scale</span>
            <span>Rating</span>
            <span>Platform</span>
          </div>
          <div className="w-full h-[0.15vh] mb-[1.5vh]" style={{ background: "#2a2650" }} />

          {competitors.map((c, i) => (
            <div
              key={i}
              className="grid py-[1.1vh] font-body text-[1.35vw]"
              style={{
                gridTemplateColumns: "2fr 1fr 1.4fr 1.4fr 0.8fr 1.5fr",
                gap: "0 2vw",
                borderBottom: "1px solid #1e1b3a",
                fontFamily: "DM Sans, sans-serif",
                color: i === 0 ? "#a78bfa" : "#c4bef0",
                fontWeight: i === 0 ? 500 : 300,
              }}
            >
              <span className="font-medium" style={{ color: i === 0 ? "#a78bfa" : "#f0eeff" }}>{c.name}</span>
              <span style={{ color: "#8b87b0" }}>{c.type}</span>
              <span>{c.pricing}</span>
              <span>{c.users}</span>
              <span style={{ color: "#f59e0b" }}>{c.rating}</span>
              <span style={{ color: "#8b87b0" }}>{c.platform}</span>
            </div>
          ))}
        </div>

        <div className="mt-[2vh] flex items-center gap-[1.5vw]">
          <div className="rounded-full px-[1.2vw] py-[0.6vh] text-[1.2vw] font-body font-medium" style={{ background: "rgba(108,61,232,0.2)", color: "#a78bfa", border: "1px solid #6c3de8", fontFamily: "DM Sans, sans-serif" }}>
            7 direct competitors analysed
          </div>
          <div className="rounded-full px-[1.2vw] py-[0.6vh] text-[1.2vw] font-body font-medium" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.4)", fontFamily: "DM Sans, sans-serif" }}>
            Zero charge from day one with AI activity generation
          </div>
        </div>
      </div>
    </div>
  );
}
