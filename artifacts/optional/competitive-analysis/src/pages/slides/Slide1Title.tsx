const base = import.meta.env.BASE_URL;

export default function Slide1Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <img
        src={`${base}hero-bg.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        alt="Background"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,20,0.85) 40%, rgba(108,61,232,0.35) 100%)" }} />

      <div className="relative h-full flex flex-col justify-between px-[7vw] py-[8vh]">
        <div className="flex items-center gap-[1.2vw]">
          <div className="w-[3vw] h-[0.25vh]" style={{ background: "#6c3de8" }} />
          <span className="font-display text-[1.3vw] tracking-[0.22em] uppercase" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
            Competitive Intelligence
          </span>
        </div>

        <div className="max-w-[75vw]">
          <div className="font-display text-[1.4vw] tracking-[0.1em] uppercase mb-[2vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
            Verbitra
          </div>
          <h1 className="font-display font-extrabold leading-[0.92] tracking-tight text-[6.5vw]" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
            Who Are We
          </h1>
          <h1 className="font-display font-extrabold leading-[0.92] tracking-tight text-[6.5vw]" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
            Really
          </h1>
          <h1 className="font-display font-extrabold leading-[0.92] tracking-tight text-[6.5vw]" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
            Competing With?
          </h1>
          <p className="mt-[3vh] text-[1.8vw] max-w-[55vw] leading-snug font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
            A JTBD-led analysis of 7 verbatim memorisation apps — features, pricing, user complaints, and where none of them serve the core job.
          </p>
        </div>

        <div className="flex items-center gap-[2vw]">
          <div className="text-[1.3vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>
            March 2026
          </div>
          <div className="w-[0.15vw] h-[2.5vh]" style={{ background: "#6c3de8" }} />
          <div className="text-[1.3vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif" }}>
            Target: High-Stakes Exam Takers + Students
          </div>
        </div>
      </div>
    </div>
  );
}
