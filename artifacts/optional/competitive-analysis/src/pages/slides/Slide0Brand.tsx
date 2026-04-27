export default function Slide0Brand() {
  const words = [
    { text: "To", dim: false },
    { text: "be", dim: false },
    { text: "or", dim: false },
    { text: "not", dim: false },
    { text: "to", dim: true },
    { text: "be,", dim: true },
    { text: "that", dim: true },
    { text: "is", dim: true },
    { text: "the", dim: true },
    { text: "question.", dim: true },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "#07070f" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(108,61,232,0.18) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute"
        style={{
          top: "8vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1px",
          height: "6vh",
          background: "linear-gradient(180deg, transparent, #6c3de8)",
        }}
      />

      <div className="relative flex flex-col items-center text-center px-[10vw]">
        <div
          className="font-display text-[1.1vw] tracking-[0.3em] uppercase mb-[3vh]"
          style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif", letterSpacing: "0.35em" }}
        >
          Introducing
        </div>

        <h1
          className="font-display font-black tracking-tight leading-none mb-[2.5vh]"
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "11vw",
            background: "linear-gradient(135deg, #f0eeff 30%, #a78bfa 70%, #6c3de8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Verbitra
        </h1>

        <p
          className="font-body text-[2.1vw] leading-snug mb-[5vh] max-w-[55vw]"
          style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}
        >
          Paste any text. Set your deadline.
          <br />
          <span style={{ color: "#f0eeff", fontWeight: 500 }}>
            Remember it word for word, when it matters.
          </span>
        </p>

        <div
          className="flex items-center gap-[0.8vw] mb-[5vh] px-[2vw] py-[1.2vh] rounded-full"
          style={{ background: "rgba(108,61,232,0.12)", border: "1px solid rgba(108,61,232,0.35)" }}
        >
          {words.map((w, i) => (
            <span
              key={i}
              className="font-body font-medium text-[1.6vw]"
              style={{
                fontFamily: "DM Sans, sans-serif",
                color: w.dim ? "rgba(255,255,255,0.15)" : "#f0eeff",
                textDecoration: w.dim ? "line-through" : "none",
                textDecorationColor: "rgba(108,61,232,0.4)",
              }}
            >
              {w.text}
            </span>
          ))}
          <span
            className="ml-[0.5vw] text-[1.1vw] font-body font-semibold rounded-full px-[0.8vw] py-[0.4vh]"
            style={{
              background: "#6c3de8",
              color: "#fff",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            progressive deletion
          </span>
        </div>

        <div className="flex items-center gap-[3vw]">
          {[
            { label: "Active recall", icon: "◈" },
            { label: "Deadline-driven", icon: "◷" },
            { label: "AI-generated", icon: "◆" },
            { label: "Any text", icon: "◉" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-[0.5vw]">
              <span style={{ color: "#f59e0b", fontSize: "1.2vw" }}>{item.icon}</span>
              <span
                className="font-body text-[1.2vw]"
                style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute"
        style={{
          bottom: "8vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1px",
          height: "6vh",
          background: "linear-gradient(180deg, #6c3de8, transparent)",
        }}
      />

    </div>
  );
}
