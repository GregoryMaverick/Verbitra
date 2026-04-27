const base = import.meta.env.BASE_URL;

export default function Slide11Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <img
        src={`${base}hero-title.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Background"
        style={{ opacity: 0.3 }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,20,0.9) 0%, rgba(124,58,237,0.2) 50%, rgba(10,10,20,0.92) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 60%)" }} />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-[10vw]">
        <div
          className="inline-block px-[1.5vw] py-[0.6vh] rounded-full text-[1.1vw] font-bold tracking-[0.18em] uppercase mb-[3vh]"
          style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa", fontFamily: "DM Sans, sans-serif" }}
        >
          Verbitra
        </div>

        <h1
          className="font-bold tracking-tight leading-tight mb-[2vh]"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "6vw", color: "#f0eeff", letterSpacing: "-0.03em" }}
        >
          Memorize exact text.
        </h1>
        <h1
          className="font-bold tracking-tight leading-tight mb-[5vh]"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "6vw", color: "#f59e0b", letterSpacing: "-0.03em" }}
        >
          Word for word.
        </h1>

        <p
          style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.7vw", color: "#8b87b0", fontWeight: 300, lineHeight: 1.7, maxWidth: "50vw", marginBottom: "6vh" }}
        >
          Purpose-built for verbatim recall. Live in Expo today. Store launch next.
        </p>

        <div
          className="inline-flex rounded-[1vw] px-[3vw] py-[1.5vh]"
          style={{ background: "rgba(124,58,237,0.2)", border: "2px solid rgba(124,58,237,0.5)" }}
        >
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.6vw", color: "#f0eeff", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Pre-launch build ready now
          </span>
        </div>

        <div className="flex gap-[3vw] mt-[8vh]" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "3vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#5a5680", fontWeight: 300 }}>Available on</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff", fontWeight: 700 }}>iOS and Android</div>
          </div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#5a5680", fontWeight: 300 }}>Built with</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff", fontWeight: 700 }}>Expo — React Native</div>
          </div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#5a5680", fontWeight: 300 }}>Pricing</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.3vw", color: "#f0eeff", fontWeight: 700 }}>Free · $9.99/mo · $79.99/yr</div>
          </div>
        </div>
      </div>
    </div>
  );
}
