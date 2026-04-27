export default function Slide7ActionPlan() {
  const actions = [
    {
      num: "01",
      title: "Lead with the deadline — make it the first screen",
      detail: "No competitor asks 'when is your exam?' upfront. The deadline is our product's founding insight. Put it on the onboarding screen. Use it to generate the plan. It's what separates us from every other app in the category.",
      color: "#6c3de8",
    },
    {
      num: "02",
      title: "Target high-stakes exam communities first",
      detail: "Pre-med, law, CPA, and LSAT forums are small, tight-knit, and desperate for better tools. Post case studies showing pass rates and study hours saved. These communities have the highest willingness to pay and the most powerful word of mouth.",
      color: "#f59e0b",
    },
    {
      num: "03",
      title: "Price against the alternative, not the competition",
      detail: "A USMLE prep course costs $2,000+. A retake costs $1,000+ in fees, lost income, and emotional cost. Our price should be positioned against those numbers, not against Anki (free) or Quizlet ($8/mo). That's how you justify premium pricing with confidence.",
      color: "#10b981",
    },
  ];

  const battlecard = [
    { trigger: "User mentions Anki", trap: "Ask: 'How long did it take you to create all your cards?' They'll tell you hours. Then say: we generate them from your notes in 30 seconds." },
    { trigger: "User mentions Quizlet", trap: "Ask: 'Does Quizlet know your exam date and adjust your daily plan?' It doesn't. We do." },
    { trigger: "User says 'I just re-read my notes'", trap: "That's not a competitor — that's the problem we solve. Lead with the research showing re-reading is the least effective method." },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 70% 30%, rgba(108,61,232,0.08) 0%, transparent 50%)" }} />
      <div className="absolute right-0 top-0 w-[0.4vw] h-full" style={{ background: "linear-gradient(180deg, #f59e0b, #6c3de8)" }} />

      <div className="relative h-full flex gap-[4vw] px-[6vw] py-[5.5vh]">
        <div className="flex-1 flex flex-col">
          <div className="mb-[2.5vh]">
            <div className="font-display text-[1.2vw] tracking-[0.18em] uppercase mb-[0.8vh]" style={{ color: "#f59e0b", fontFamily: "Syne, sans-serif" }}>
              Strategic Recommendations
            </div>
            <h2 className="font-display font-bold text-[3vw] tracking-tight" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
              Top 3 Actions
            </h2>
          </div>

          <div className="flex flex-col gap-[2vh] flex-1 overflow-hidden">
            {actions.map((a, i) => (
              <div
                key={i}
                className="flex gap-[1.5vw] items-start rounded-[0.8vw] p-[1.5vw]"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.06)` }}
              >
                <div
                  className="font-display font-black text-[2.5vw] leading-none flex-shrink-0"
                  style={{ color: a.color, fontFamily: "Syne, sans-serif", opacity: 0.6 }}
                >
                  {a.num}
                </div>
                <div>
                  <div className="font-display font-bold text-[1.4vw] mb-[0.6vh]" style={{ color: "#f0eeff", fontFamily: "Syne, sans-serif" }}>
                    {a.title}
                  </div>
                  <p className="text-[1.15vw] font-body" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.55 }}>
                    {a.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col" style={{ width: "30vw" }}>
          <div className="mb-[2.5vh]">
            <h3 className="font-display font-bold text-[2vw] tracking-tight" style={{ color: "#a78bfa", fontFamily: "Syne, sans-serif" }}>
              Positioning Battlecard
            </h3>
            <p className="text-[1.15vw] font-body mt-[0.5vh]" style={{ color: "#8b87b0", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }}>
              When users bring up competitors
            </p>
          </div>
          <div className="flex flex-col gap-[1.5vh] flex-1 overflow-hidden">
            {battlecard.map((b, i) => (
              <div
                key={i}
                className="rounded-[0.8vw] p-[1.5vw]"
                style={{ background: "rgba(108,61,232,0.08)", border: "1px solid rgba(108,61,232,0.25)" }}
              >
                <div className="font-body font-semibold text-[1.15vw] mb-[0.8vh]" style={{ color: "#a78bfa", fontFamily: "DM Sans, sans-serif" }}>
                  If they mention: {b.trigger}
                </div>
                <p className="text-[1.1vw] font-body" style={{ color: "#c4bef0", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.5 }}>
                  {b.trap}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
