import { useEffect, useState, type ReactNode } from "react";

const C = {
  bg: "#0a0a0a",
  surface: "#141414",
  surface2: "#1a1a1a",
  border: "#262626",
  text: "#f5f5f5",
  secondary: "#a3a3a3",
  tertiary: "#525252",
  accent: "#22c55e",
  accentDim: "rgba(34,197,94,0.1)",
  warn: "#f59e0b",
  warnDim: "rgba(245,158,11,0.1)",
  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.1)",
  orange: "#f97316",
  orangeDim: "rgba(249,115,22,0.1)",
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.1)",
  red: "#ef4444",
};

const font = '"Inter", system-ui, -apple-system, sans-serif';

const FOUNDATION = [
  { id: "vision", label: "F1. Vision & Problem" },
  { id: "audience", label: "F2. Audience & Personas" },
  { id: "jtbd", label: "F3. Jobs to Be Done" },
  { id: "competitive", label: "F4. Competitive Landscape" },
  { id: "business", label: "F5. Business Model" },
  { id: "principles", label: "F6. Product Principles" },
  { id: "scope", label: "F7. Scope & Deferred" },
  { id: "metrics", label: "F8. Success Metrics" },
  { id: "lean-canvas", label: "F9. Lean Canvas" },
  { id: "platform", label: "F10. Platform Architecture" },
];

const FLOW = [
  { id: "core-flow", label: "0. Core User Flow" },
  { id: "opening", label: "1. Opening & Onboarding" },
  { id: "input", label: "2. Input Methods" },
  { id: "deadline", label: "3. Deadline Calculator" },
  { id: "detection", label: "4. Content Detection" },
  { id: "phases", label: "5. The 3 Phases" },
  { id: "curriculum", label: "6. Daily Curriculum" },
  { id: "advancement", label: "7. Phase Advancement" },
  { id: "mastery", label: "8. Mastery & Scoring" },
];

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────

function Tag({ color, children }: { color: string; children: string }) {
  const m: Record<string, [string, string]> = {
    green: [C.accentDim, C.accent], orange: [C.orangeDim, C.orange],
    blue: [C.blueDim, C.blue], yellow: [C.warnDim, C.warn],
    purple: [C.purpleDim, C.purple], red: ["rgba(239,68,68,0.1)", C.red],
    grey: ["rgba(255,255,255,0.05)", C.tertiary],
  };
  const [bg, fg] = m[color] || m.grey;
  return (
    <span style={{ background: bg, color: fg, border: `1px solid ${fg}33`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.03em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function SectionLabel({ id, children }: { id: string; children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>{id}</span>
      <span style={{ fontSize: 11, color: C.tertiary }}>{children}</span>
    </div>
  );
}

function H2({ children }: { children: string }) {
  return <h2 style={{ fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em", color: C.text, marginBottom: 8, lineHeight: 1.2 }}>{children}</h2>;
}

function Lead({ children }: { children: string }) {
  return <p style={{ fontSize: 16, color: C.secondary, lineHeight: 1.75, marginBottom: 32, maxWidth: 680 }}>{children}</p>;
}

function Card({ children, accent, style }: { children: React.ReactNode; accent?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${accent ? accent + "40" : C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children, tag, tagColor }: { children: ReactNode; tag?: string; tagColor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
      <h3 style={{ fontWeight: 600, fontSize: 15, color: C.text, letterSpacing: "-0.01em" }}>{children}</h3>
      {tag && <Tag color={tagColor || "grey"}>{tag}</Tag>}
    </div>
  );
}

function Ul({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: C.secondary, fontSize: 14, lineHeight: 1.7, paddingLeft: 16, position: "relative", marginBottom: 2 }}>
          <span style={{ position: "absolute", left: 0, color: C.tertiary }}>—</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Note({ children, color = "grey" }: { children: React.ReactNode; color?: string }) {
  const m: Record<string, [string, string]> = {
    green: [C.accentDim, C.accent], orange: [C.orangeDim, C.orange],
    blue: [C.blueDim, C.blue], yellow: [C.warnDim, C.warn],
    purple: [C.purpleDim, C.purple], red: ["rgba(239,68,68,0.1)", C.red],
    grey: ["rgba(255,255,255,0.04)", C.tertiary],
  };
  const [bg, fg] = m[color];
  return (
    <div style={{ background: bg, border: `1px solid ${fg}33`, borderRadius: 8, padding: "12px 16px", marginTop: 12 }}>
      <p style={{ fontSize: 13, color: fg, lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}

function Tech({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#0d0d0d", border: `1px solid #1f1f1f`, borderRadius: 8, padding: "14px 18px", marginTop: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.tertiary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Technical implementation</div>
      <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: C.secondary, lineHeight: 1.8, marginTop: 10, overflowX: "auto" }}>
      {children.split("\n").map((line, i) => <div key={i}>{line || "\u00A0"}</div>)}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "48px 0" }} />;
}

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function PhaseChip({ phase, label }: { phase: 1 | 2 | 3; label: string }) {
  const colors: Record<number, [string, string]> = {
    1: [C.blueDim, C.blue], 2: [C.warnDim, C.warn], 3: [C.accentDim, C.accent],
  };
  const [bg, fg] = colors[phase];
  return (
    <span style={{ background: bg, color: fg, border: `1px solid ${fg}44`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      Phase {phase} · {label}
    </span>
  );
}

// ─── FOUNDATION SECTIONS ─────────────────────────────────────────────────────

function Vision() {
  return (
    <section id="vision">
      <SectionLabel id="F1">The why behind the product</SectionLabel>
      <H2>Vision & Problem Statement</H2>
      <Lead>Existing memorization tools are built for recognition — you see a card and decide if you know it. Verbatim recall is a completely different cognitive task. No tool is built for it.</Lead>

      <Card accent={C.accent}>
        <CardTitle>The core problem</CardTitle>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 12 }}>
          People have material they need to remember — notes, definitions, lists, key concepts — but they don't know how to study it effectively.
        </p>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 12 }}>
          So they do what feels natural: they re-read it. Maybe highlight it. Maybe read it again the night before.
        </p>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 0 }}>
          It doesn't work. Re-reading creates the illusion of knowing without building real memory. The result: they forget, they blank, they underperform — despite putting in the time.
        </p>
        <Note color="green">The insight: recognition ≠ recall. Re-reading makes text feel familiar. It does not mean you can produce it — word for word, under pressure, when it counts.</Note>
      </Card>

      <Grid2>
        <Card>
          <CardTitle>What existing tools fail at</CardTitle>
          <Ul items={[
            "Anki: flashcard-based, tests recognition. No deadline. No verbatim scoring. No path from \"familiar\" to \"exact.\"",
            "Memrise: gamified vocabulary. Not designed for passages, statutes, scripts, or anything longer than a word or phrase.",
            "Re-reading: the worst study method for recall. Creates fluency illusion — it feels like you know it, but recognition is not recall.",
            "Highlighting: same problem. Passive. No retrieval. No production.",
          ]} />
        </Card>
        <Card>
          <CardTitle>The product vision</CardTitle>
          <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, marginBottom: 10 }}>
            A tool where you paste any text, set a deadline, and the app builds a tailored session plan that takes you from first exposure to verbatim recall — with precision scoring and automatic phase advancement.
          </p>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontStyle: "italic", color: C.text, lineHeight: 1.6 }}>
              "Paste any text. Set your deadline. Remember it word for word."
            </div>
          </div>
        </Card>
      </Grid2>

      <Card>
        <CardTitle>Why now</CardTitle>
        <Ul items={[
          "LLM APIs make mnemonic generation cheap and instant — previously required a human memory coach",
          "Text-to-speech quality is good enough for natural read-along (Web Speech API, browser-native, free)",
          "PDF and OCR parsing has matured client-side — no server infrastructure needed for input processing",
          "The verbatim recall use case is not niche: every professional certification, every actor, every preacher, every student with an oral exam faces this exact problem",
        ]} />
      </Card>
    </section>
  );
}

function Audience() {
  return (
    <section id="audience">
      <SectionLabel id="F2">Who this is built for</SectionLabel>
      <H2>Target Audience & Personas</H2>
      <Lead>Derived from three JTBD questions: who performs this job most frequently, with most urgency, and has the worst existing solutions. The ordering below reflects that analysis — not intuition.</Lead>

      <Card accent={C.accent}>
        <CardTitle>The JTBD-derived audience priority</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, marginBottom: 12 }}>
          {[
            { q: "Most frequent", a: "Students — perform this job every exam cycle, multiple times a year. Frequency = habit-forming potential.", color: C.blue },
            { q: "Most urgent + highest WTP", a: "High-stakes exam takers — failing means years of work and money lost. Urgency = willingness to pay and change behaviour.", color: C.accent },
            { q: "Worst existing solutions", a: "Both — Anki requires manual card creation, Quizlet has no deadline intelligence, re-reading is the least effective method known.", color: C.warn },
          ].map((r) => (
            <div key={r.q} style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${r.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{r.q}</div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>{r.a}</div>
            </div>
          ))}
        </div>
        <Note color="green">Sweet spot: university students preparing for professional exams — pre-med → MCAT, law students → bar exam, finance → CFA. They have student frequency AND professional-level urgency and willingness to pay. This is the primary launch audience.</Note>
      </Card>

      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Frequency vs. willingness-to-pay tradeoff</div>
        <Grid2>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 6 }}>Students</div>
            <div style={{ fontSize: 13, color: C.accent, lineHeight: 1.7, marginBottom: 4 }}>✓ Frequent &nbsp; ✓ Easy to reach &nbsp; ✓ Fast feedback loops</div>
            <div style={{ fontSize: 13, color: C.red, lineHeight: 1.7 }}>✗ Low WTP &nbsp; ✗ Seasonal churn after exams &nbsp; ✗ Price-sensitive (Anki/Quizlet are free)</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.orange, marginBottom: 6 }}>High-stakes exam takers</div>
            <div style={{ fontSize: 13, color: C.accent, lineHeight: 1.7, marginBottom: 4 }}>✓ High WTP &nbsp; ✓ High urgency &nbsp; ✓ Tight communities &nbsp; ✓ Credible success stories</div>
            <div style={{ fontSize: 13, color: C.red, lineHeight: 1.7 }}>✗ Smaller total market &nbsp; ✗ Harder to reach &nbsp; ✗ Complex, dense content</div>
          </div>
        </Grid2>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.secondary, lineHeight: 1.65 }}>
          <strong style={{ color: C.text }}>Conclusion:</strong> If charging money from day one, start with high-stakes exam takers. The product mechanics are identical — same job, same text types — but the monetisation path is far more viable.
        </div>
      </div>

      <Card accent={C.orange}>
        <CardTitle tag="Primary — monetisation" tagColor="orange">Persona 1 — The High-Stakes Exam Taker</CardTitle>
        <Grid2>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Who they are</p>
            <Ul items={[
              "Medical students: USMLE Step 1/2/3 — definitions, drug mechanisms, diagnostic criteria",
              "Law students: bar exam — statute text, elements of crimes, exact legal standards",
              "Accounting: CPA exam — regulatory text, GAAP definitions",
              "Other boards: Series 7, pharmacy, nursing licensure, LSAT",
            ]} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Their situation</p>
            <Ul items={[
              "Deadline is fixed and non-negotiable",
              "Cost of failure is catastrophic: USMLE retake = $1,000+, bar retake = months of lost income",
              "Already using Anki — but Anki proves recognition, not verbatim recall",
              "Time is scarce — balancing study with rotations, classes, or work",
              "Highly motivated — willing to pay for something demonstrably better",
            ]} />
          </div>
        </Grid2>
        <Note color="orange">Primary monetisation target. They have the most to lose, the tightest deadlines, and the clearest willingness to pay for a proven tool.</Note>
      </Card>

      <Card accent={C.blue}>
        <CardTitle tag="Primary — volume" tagColor="blue">Persona 2 — The Student</CardTitle>
        <Grid2>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Who they are</p>
            <Ul items={[
              "Secondary and university students: definitions, formulas, vocabulary for exams",
              "Language learners: dialogues, grammar patterns, poetry in a target language",
              "Students with oral exams: passages that must be quoted exactly",
              "Competitive speakers: prepared arguments and memorised passages",
            ]} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Their situation</p>
            <Ul items={[
              "Perform this job multiple times per year — highest frequency of any group",
              "Easier to reach (social, university communities, word of mouth)",
              "Price-sensitive — free tier must be genuinely useful to convert them",
              "Seasonal usage — churn after exam season, return next cycle",
              "Fast feedback loops — results known quickly (pass/fail)",
            ]} />
          </div>
        </Grid2>
        <Note color="blue">Volume and virality audience. Free tier grows this group; paid conversion is lower but the frequency of use builds habit and loyalty over time.</Note>
      </Card>

      <Card>
        <CardTitle tag="Secondary" tagColor="grey">Persona 3 — The Performer</CardTitle>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, marginBottom: 14 }}>
          Not derived from the JTBD frequency/urgency analysis — added as a secondary segment with a distinct verbatim recall need. <strong style={{ color: C.text }}>Important: not all performers need the same thing.</strong>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              who: "Actors",
              need: "True verbatim — every word must be exact. Scripts cannot be paraphrased. One wrong word breaks the scene.",
              usage: "Full script or character's lines. OCR from printed scripts. \"Just my lines\" mode critical.",
              verbatim: "Full text",
              color: C.accent,
            },
            {
              who: "Speakers (keynote, TED-style)",
              need: "Passage-level verbatim only. Best speakers memorise structure and key phrases — not word-for-word scripts. Verbatim recall needed for: the opening line, the closing line, specific crafted phrases.",
              usage: "Paste specific passages (30–150 words), not the full talk. App used for anchor points within a larger presentation.",
              verbatim: "Selected passages",
              color: C.warn,
            },
            {
              who: "Preachers and pastors",
              need: "Passage-level verbatim. The sermon narrative is rarely memorised word-for-word. Scripture quotations within the sermon are — the congregation notices a wrong word. Liturgical texts (creeds, prayers, responsive readings) are exact.",
              usage: "Paste individual scripture verses or liturgical texts. Not the full sermon.",
              verbatim: "Quotations only",
              color: C.blue,
            },
          ].map((p) => (
            <div key={p.who} style={{ background: C.surface2, borderRadius: 8, padding: "14px 16px", borderLeft: `3px solid ${p.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.who}</span>
                <Tag color={p.color === C.accent ? "green" : p.color === C.warn ? "yellow" : "blue"}>{p.verbatim}</Tag>
              </div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.65, marginBottom: 6 }}><strong style={{ color: C.text }}>Need:</strong> {p.need}</div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.65 }}><strong style={{ color: C.text }}>Product use:</strong> {p.usage}</div>
            </div>
          ))}
        </div>
        <Note color="grey">The 500-word limit is actually well-suited to performers — they paste specific passages (opening hooks, scripture verses, key monologues), not entire scripts or sermons. The product serves the passage, not the performance.</Note>
      </Card>
    </section>
  );
}

function JTBD() {
  return (
    <section id="jtbd">
      <SectionLabel id="F3">Framing user motivation</SectionLabel>
      <H2>Jobs to Be Done</H2>
      <Lead>JTBD reframes the question from "what features do users want?" to "what are they trying to accomplish?" — and exposes the emotional stakes of getting it right or wrong.</Lead>

      {[
        {
          trigger: "When I have a high-stakes exam in N days",
          job: "I need to be able to recall specific definitions, statutes, or criteria word-for-word",
          outcome: "So that I pass the test and don't waste months of study and $1,000+ in retake fees",
          color: C.blue,
          emotional: "Fear of failure, financial pressure, professional identity at stake",
        },
        {
          trigger: "When I'm performing in a show, giving a speech, or preaching a sermon",
          job: "I need to have every word of my text memorized so I can deliver it without notes",
          outcome: "So that I appear confident and authoritative — and don't freeze in front of an audience",
          color: C.orange,
          emotional: "Fear of public embarrassment, desire to command the room",
        },
        {
          trigger: "When I'm learning scripture, liturgy, or a poem I want to carry with me",
          job: "I need to internalize text deeply enough to recite it from memory without practice",
          outcome: "So that the text is part of me — I can access it in any moment, without a phone",
          color: C.accent,
          emotional: "Aspiration, identity, spiritual or cultural meaning",
        },
        {
          trigger: "When my deadline is tomorrow",
          job: "I need the fastest possible path to acceptable recall — not long-term retention",
          outcome: "So that I can get through this specific moment",
          color: C.warn,
          emotional: "Panic, desperation, willingness to try anything that might work",
        },
      ].map((j, i) => (
        <Card key={i} accent={j.color}>
          <div style={{ fontSize: 11, fontWeight: 700, color: j.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Job {i + 1}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Trigger", value: j.trigger },
              { label: "Job", value: j.job },
              { label: "Outcome", value: j.outcome },
              { label: "Emotional stakes", value: j.emotional },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: j.color, minWidth: 100, letterSpacing: "0.04em", textTransform: "uppercase", paddingTop: 2 }}>{r.label}</span>
                <span style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Note color="grey">The product must serve job #4 (panic mode) as well as job #1 (planned preparation). The Mnemonic Mode for ≤3-day deadlines is the answer to job #4. Not serving it means losing users at their most motivated moment.</Note>
    </section>
  );
}

function Competitive() {
  return (
    <section id="competitive">
      <SectionLabel id="F4">The landscape</SectionLabel>
      <H2>Competitive Landscape & Differentiation</H2>
      <Lead>The memorization app category is crowded, but the verbatim recall niche is unserved. Every competitor optimises for recognition or vocabulary — not exact, deadline-driven, word-for-word recall.</Lead>

      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: C.secondary }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["Product", "Verbatim scoring", "Deadline-driven", "Long passages", "Content-type aware", "Threat level"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.text, fontWeight: 600, fontSize: 12, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Anki", verbatim: "✗", deadline: "✗", passages: "✗", typeAware: "✗", threat: "Low", threatColor: C.accent },
              { name: "Memrise", verbatim: "✗", deadline: "✗", passages: "✗", typeAware: "Partial", threat: "Low", threatColor: C.accent },
              { name: "Quizlet", verbatim: "Partial", deadline: "✗", passages: "✗", typeAware: "✗", threat: "Low", threatColor: C.accent },
              { name: "Memorify", verbatim: "Partial", deadline: "✗", passages: "✗", typeAware: "✗", threat: "Medium", threatColor: C.warn },
              { name: "This product", verbatim: "✓", deadline: "✓", passages: "✓", typeAware: "✓", threat: "—", threatColor: C.accent },
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i === 4 ? C.accentDim : "transparent" }}>
                <td style={{ padding: "10px 14px", fontWeight: i === 4 ? 700 : 400, color: i === 4 ? C.accent : C.text }}>{r.name}</td>
                <td style={{ padding: "10px 14px", color: r.verbatim === "✓" ? C.accent : r.verbatim === "Partial" ? C.warn : C.tertiary }}>{r.verbatim}</td>
                <td style={{ padding: "10px 14px", color: r.deadline === "✓" ? C.accent : C.tertiary }}>{r.deadline}</td>
                <td style={{ padding: "10px 14px", color: r.passages === "✓" ? C.accent : C.tertiary }}>{r.passages}</td>
                <td style={{ padding: "10px 14px", color: r.typeAware === "✓" ? C.accent : r.typeAware === "Partial" ? C.warn : C.tertiary }}>{r.typeAware}</td>
                <td style={{ padding: "10px 14px" }}><span style={{ color: r.threatColor, fontWeight: 600 }}>{r.threat}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card accent={C.warn}>
        <CardTitle tag="Closest competitor" tagColor="yellow">Memorify — watch closely</CardTitle>
        <Ul items={[
          "Growing fast in the performer / actor niche",
          "Shows text with words blanked out — similar to Progressive Deletion concept",
          "No deadline calculator, no phase system, no content-type detection",
          "Does not score verbatim — no Levenshtein matching, no exact-word feedback",
          "No AI features — mnemonic generation is a clear differentiator",
          "Their growth validates the market — this product goes deeper on the same core need",
        ]} />
      </Card>

      <Card>
        <CardTitle>Our differentiating claims</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { claim: "Deadline-first planning", why: "No other tool calculates a personalised study plan from a deadline. We show the projection in real time — this is the first WOW moment." },
            { claim: "Phase-based progression", why: "Automatically moves users from exposure to scaffold to full recall based on scored performance — not guesswork or manual selection." },
            { claim: "Verbatim scoring", why: "Every word scored word-by-word. Near-match detection. Exact score shown in real time. The user always knows where they actually stand." },
            { claim: "Content-type intelligence", why: "A numbered list needs different activities than a paragraph or a dialogue. No competitor adapts to content structure." },
            { claim: "Short-deadline strategy", why: "For ≤3-day deadlines, we switch to Mnemonic Mode. No other tool acknowledges that spaced repetition is ineffective at 1–3 days." },
          ].map((d, i) => (
            <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${C.accent}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{d.claim}</div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>{d.why}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function Business() {
  return (
    <section id="business">
      <SectionLabel id="F5">How the product makes money</SectionLabel>
      <H2>Business Model</H2>
      <Lead>Freemium. Free tier is genuinely useful — it demonstrates the product works. Paid tier is valuable enough to convert users who have the most to lose.</Lead>

      <Grid2>
        <Card>
          <CardTitle tag="Free" tagColor="grey">Free tier</CardTitle>
          <Ul items={[
            "All 5 content types supported",
            "All activities available (Progressive Deletion, First Letter Recall, Typing from Memory, Sentence Scramble, Acronym Builder)",
            "All 3 phases available",
            "Full deadline calculator and session planning",
            "Gated at: ≤100 words per text entry",
            "Up to 3 active texts simultaneously",
            "No AI mnemonic generation",
          ]} />
          <Note color="grey">100 words is enough for a statute definition, a speech opening paragraph, or a short scripture passage. It proves the product works without unlocking everything.</Note>
        </Card>
        <Card>
          <CardTitle tag="Paid" tagColor="green">Paid tier</CardTitle>
          <Ul items={[
            "Up to 500 words per text entry",
            "Unlimited active texts",
            "AI Mnemonic generation (LLM-powered, delivered in session 1)",
            "PDF upload support",
            "OCR photo capture (up to 5 photos)",
            "Priority session recommendations",
            "Export: share your mastery score card",
          ]} />
          <Note color="green">AI Mnemonic is the key paid hook — it's genuinely useful, clearly AI-powered, and the benefit is immediately tangible.</Note>
        </Card>
      </Grid2>

      <Card accent={C.accent}>
        <CardTitle>Pricing strategy</CardTitle>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, marginBottom: 12 }}>
          <strong style={{ color: C.text }}>Anchor against the cost of failure, not the cost of alternatives.</strong>
        </p>
        <Ul items={[
          "USMLE retake = $1,000+ in fees, plus 6 months of lost time",
          "Bar exam retake = $500–$800 in fees, plus months of lost income",
          "A $10/month subscription that prevents one retake pays for itself 8× over",
          "Do not anchor against Anki ($0/free) or Memrise ($9.99/month) — this is a different category",
          "Anchor against: tutors ($50–$150/hour), prep courses ($500–$2,000), the retake itself",
        ]} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginTop: 16 }}>
          {[
            { label: "Monthly", price: "$9.99", note: "Cancel anytime" },
            { label: "Annual", price: "$79", note: "Save ~34%" },
            { label: "Exam prep (90 day)", price: "$24.99", note: "One-time, exam-focused" },
          ].map((p) => (
            <div key={p.label} style={{ background: C.surface2, borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{p.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.price}</div>
              <div style={{ fontSize: 12, color: C.tertiary }}>{p.note}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Monetisation sequence</CardTitle>
        <Ul items={[
          "Day 1: User pastes their first text, sets deadline, completes Day 1 session — sees the product works",
          "Day 2–3: Free tier limit hit (if text is >100 words) OR AI mnemonic teased at the end of a session",
          "Upgrade prompt: contextual — appears only when a limit is reached or a paid feature is previewed",
          "No upgrade nags on free sessions — the product earns trust before asking for money",
          "Exam prep plan: one-time 90-day purchase targets users with a specific upcoming exam (bar, USMLE, CPA)",
        ]} />
      </Card>
    </section>
  );
}

function Principles() {
  return (
    <section id="principles">
      <SectionLabel id="F6">How we make decisions</SectionLabel>
      <H2>Core Product Principles</H2>
      <Lead>These are the guardrails. When a feature request or design decision is ambiguous, these principles resolve the conflict.</Lead>

      {[
        {
          n: "01",
          title: "Retrieval beats recognition",
          body: "Every activity must require the user to produce text, not just recognise it. If the user can pass an activity by looking at the text and thinking 'yes, that looks right', the activity is passive and should be cut or redesigned. This is why Chunk Repeat was removed — listening to audio is passive. This is why Typing from Memory is the core Phase 3 activity.",
          color: C.accent,
        },
        {
          n: "02",
          title: "The deadline is the product",
          body: "The deadline drives everything — mode selection, session count, activity intensity, phase pacing. A product without a deadline is just another flashcard app. The deadline calculator and its projection are the first WOW moment. We prioritise deadline-aware features above all others.",
          color: C.blue,
        },
        {
          n: "03",
          title: "Silent calibration, no onboarding tests",
          body: "We never ask the user to assess their own knowledge before starting. People are reliably bad at this. Instead, Phase 1 is the calibration — a user who already knows the text will advance in one session. A user starting from zero takes 3–4 sessions. The system detects this automatically.",
          color: C.warn,
        },
        {
          n: "04",
          title: "Make it hard to get stuck, easy to get going",
          body: "Long-press hint reveal, mnemonic support, phase regression when performance drops — all of these exist so the user always has a path forward. Getting completely stuck is the #1 dropout trigger. We would rather give a hint than lose a user. A hint is scaffolding, not cheating.",
          color: C.orange,
        },
        {
          n: "05",
          title: "Content structure shapes the experience",
          body: "A numbered list needs different activities than a speech paragraph. A dialogue needs different activities than a definition. The product adapts to the content — the user does not adapt to the product. This is why content-type detection is a core system, not a tag the user applies.",
          color: C.purple,
        },
        {
          n: "06",
          title: "Different strategy for short-term vs long-term",
          body: "Spaced repetition is ineffective at timescales under 72 hours. For ≤3-day deadlines, we switch to Mnemonic Mode: front-load a memorable hook, then rapid retrieval practice. We don't pretend long-term memory tools work for panic-mode preparation. Honesty about the mechanism is part of the trust model.",
          color: C.red,
        },
      ].map((p) => (
        <div key={p.n} style={{ display: "flex", gap: 20, marginBottom: 16, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: p.color, opacity: 0.4, minWidth: 36, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", lineHeight: 1 }}>{p.n}</div>
          <div style={{ background: C.surface, border: `1px solid ${p.color}33`, borderRadius: 12, padding: "16px 20px", flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 8 }}>{p.title}</div>
            <div style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7 }}>{p.body}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

function Scope() {
  return (
    <section id="scope">
      <SectionLabel id="F7">What we're building and what we're not</SectionLabel>
      <H2>Scope, v1 vs Deferred</H2>
      <Lead>Explicit scope decisions prevent scope creep. Deferred is not rejected — it's not now. Non-goals are explicitly off the table.</Lead>

      <Grid2>
        <Card accent={C.accent}>
          <CardTitle tag="v1 — confirmed" tagColor="green">Building now</CardTitle>
          <Ul items={[
            "Text input: paste, .txt/.docx/.pdf upload, OCR (up to 5 photos)",
            "Deadline calculator with mode detection (Mnemonic / Intensive / Standard / Spaced)",
            "Content type detection: 5 types (Definition, Ordered List, Passage, Dialogue, Long-form)",
            "3-phase progression: Exposure → Scaffold → Full Recall",
            "Activities: Progressive Deletion, First Letter Recall, Typing from Memory, Sentence Scramble, Acronym Builder, TTS Read-along, Highlight Quiz",
            "Long-press hint reveal in Phase 2",
            "AI Mnemonic generation (paid — single LLM call per text)",
            "Spaced repetition scheduling (FSRS-5 algorithm, Phase 3 only)",
            "Word-level Levenshtein scoring with real-time feedback",
            "Multi-text dashboard",
            "Free tier (≤100 words) + paid tier",
            "Language auto-detection (any language)",
          ]} />
        </Card>

        <Card>
          <CardTitle tag="Deferred — v2" tagColor="grey">Building later</CardTitle>
          <Ul items={[
            "Voice recording & playback — user records themselves reciting, compared to target",
            "Teach It Back — user explains the concept in their own words, AI evaluates coverage",
            "Connect the Dots — linking concepts across texts",
            "Social / leaderboards — see how friends are progressing",
            "Collaborative texts — share a text with a study group",
            "Cloud sync across devices — v1 is local storage only",
            "Native mobile app (iOS/Android) — v1 is web-first",
            "Handwriting recognition — OCR for handwritten notes specifically",
            "Live performance mode — teleprompter-style cue view during performance",
          ]} />
        </Card>
      </Grid2>

      <Card accent={C.red}>
        <CardTitle tag="Explicitly excluded" tagColor="red">Non-goals — not building, ever (or until major pivot)</CardTitle>
        <Ul items={[
          "General flashcard mode — this is not an Anki replacement for vocabulary. If you want vocabulary flashcards, use Anki.",
          "Spaced repetition for recognition — we only test recall (production), never recognition (\"do you remember this?\")",
          "AI-generated content — the user brings the text. We never generate what they should memorise.",
          "Social features in v1 — the product earns trust before adding social complexity",
          "Chunk Repeat activity — listening to audio is passive, contradicts the retrieval-beats-recognition principle. Permanently removed.",
          "Diagnostic onboarding test — we don't ask users to assess their own knowledge. Silent calibration is the policy.",
          "AI-evaluated recall — in v1, all scoring is algorithmic (Levenshtein). AI scoring adds latency and cost for marginal benefit.",
        ]} />
        <Note color="red">Non-goals are as important as goals. They prevent the product from drifting toward "another flashcard app" and keep the team focused on the specific, defensible use case.</Note>
      </Card>

      <Card>
        <CardTitle>App name</CardTitle>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, marginBottom: 12 }}>
          The app is named "Verbitra".
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { name: "Verbly", note: "Verbatim + -ly. Clean, distinctive, available." },
            { name: "Recitall", note: "Recite + All. Memorable but spelling is awkward." },
            { name: "Etched", note: "Strong metaphor. \"Etched in memory.\" Not domain-specific." },
            { name: "Verbatim", note: "Descriptive but generic. Poor SEO differentiation." },
          ].map((n) => (
            <div key={n.name} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", flex: "1 1 180px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{n.name}</div>
              <div style={{ fontSize: 12, color: C.tertiary }}>{n.note}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function Metrics() {
  return (
    <section id="metrics">
      <SectionLabel id="F8">How we know it's working</SectionLabel>
      <H2>Success Metrics</H2>
      <Lead>v1 success is defined by engagement and retention — not revenue. If users return and complete sessions, the product is working. Revenue follows.</Lead>

      <Grid2>
        <Card accent={C.accent}>
          <CardTitle>Engagement metrics</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { metric: "Session completion rate", target: "≥ 70%", note: "Sessions started that are completed to end" },
              { metric: "Day 2 return rate", target: "≥ 50%", note: "Users who return the day after first session" },
              { metric: "D7 retention", target: "≥ 35%", note: "Still active 7 days after first session" },
              { metric: "D30 retention", target: "≥ 20%", note: "Still active 30 days after first session" },
            ].map((m) => (
              <div key={m.metric} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: C.surface2, borderRadius: 8, padding: "10px 12px" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{m.metric}</div>
                  <div style={{ fontSize: 12, color: C.tertiary }}>{m.note}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, whiteSpace: "nowrap" }}>{m.target}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card accent={C.blue}>
          <CardTitle>Product effectiveness metrics</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { metric: "Text mastery rate", target: "≥ 30%", note: "% of started texts that reach 'Ready' status" },
              { metric: "Phase 2 advancement rate", target: "≥ 60%", note: "Users who make it from Phase 1 to Phase 2" },
              { metric: "Avg score improvement", target: "+40%", note: "Session 1 score vs session 5 score" },
              { metric: "Mnemonic adoption", target: "≥ 60%", note: "Paid users who use the AI mnemonic in practice" },
            ].map((m) => (
              <div key={m.metric} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: C.surface2, borderRadius: 8, padding: "10px 12px" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{m.metric}</div>
                  <div style={{ fontSize: 12, color: C.tertiary }}>{m.note}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.blue, whiteSpace: "nowrap" }}>{m.target}</span>
              </div>
            ))}
          </div>
        </Card>
      </Grid2>

      <Card>
        <CardTitle>Business metrics (post-launch)</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { metric: "Free → Paid conversion", target: "≥ 5%", note: "Within 30 days of first session. Industry avg is 2–4%." },
            { metric: "Paid churn rate", target: "≤ 8%/month", note: "Exam season = spiky usage, some expected churn after exams" },
            { metric: "ARPU", target: "$8–10/month", note: "Blended average across monthly/annual/exam-prep plans" },
          ].map((m) => (
            <div key={m.metric} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: C.surface2, borderRadius: 8, padding: "10px 12px" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{m.metric}</div>
                <div style={{ fontSize: 12, color: C.tertiary }}>{m.note}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.warn, whiteSpace: "nowrap" }}>{m.target}</span>
            </div>
          ))}
        </div>
        <Note color="grey">v1 does not optimise for revenue. It optimises for trust — prove the product works, collect qualitative feedback from early users, then refine monetisation.</Note>
      </Card>
    </section>
  );
}

function LeanCanvas() {
  const cellBase: React.CSSProperties = {
    background: C.surface,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minHeight: 160,
  };
  const cellOpen: React.CSSProperties = {
    ...cellBase,
    background: "#1c1700",
    borderLeft: `3px solid ${C.warn}`,
  };
  const cellUVP: React.CSSProperties = {
    ...cellBase,
    background: "#0a1a0d",
    borderLeft: `3px solid ${C.accent}`,
    minHeight: 0,
  };
  const cellBottom: React.CSSProperties = {
    ...cellBase,
    minHeight: 110,
  };
  const cellBottomOpen: React.CSSProperties = {
    ...cellBottom,
    background: "#1c1700",
    borderLeft: `3px solid ${C.warn}`,
  };

  const BlockNum = ({ n }: { n: number }) => (
    <span style={{ fontSize: 10, fontWeight: 700, color: C.tertiary, fontFamily: "monospace", marginBottom: 2 }}>
      {String(n).padStart(2, "0")}
    </span>
  );
  const BlockTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
      {children}
    </div>
  );
  const OpenTag = () => (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, background: C.warn + "22", color: C.warn, borderRadius: 4, padding: "2px 6px", marginBottom: 4 }}>
      ⚠ Open question
    </span>
  );
  const Pt = ({ children }: { children: React.ReactNode }) => (
    <p style={{ fontSize: 12, color: C.secondary, lineHeight: 1.65, margin: 0 }}>{children}</p>
  );
  const Li = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6, paddingLeft: 12, position: "relative" }}>
      <span style={{ position: "absolute", left: 0, color: C.tertiary }}>·</span>
      {children}
    </div>
  );
  const Sub = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 8, marginBottom: 2 }}>{children}</div>
  );

  return (
    <section id="lean-canvas">
      <SectionLabel id="F9">Business model at a glance</SectionLabel>
      <H2>Lean Canvas</H2>
      <Lead>Ash Maurya's Lean Canvas applied to Verbitra. Three blocks are marked as open questions — decisions needed before the business model is complete.</Lead>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr auto",
        gridTemplateAreas: `
          "problem solution uvp unfair customer"
          "problem keymetrics uvp unfair channels"
          "cost cost cost revenue revenue"
        `,
        gap: 2,
        background: C.border,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 24,
      }}>

        {/* 01 Problem */}
        <div style={{ ...cellBase, gridArea: "problem", borderLeft: `3px solid ${C.accent}`, minHeight: 0 }}>
          <BlockNum n={1} />
          <BlockTitle>Problem</BlockTitle>
          <Li>People don't know how to study their own material — they re-read, which creates the illusion of knowing without building real memory.</Li>
          <Li>Existing tools (Anki, Quizlet) test recognition, not verbatim production. These are different memory pathways.</Li>
          <Li>No tool adapts a study plan to the user's specific deadline.</Li>
          <Sub>Existing alternatives</Sub>
          <Li>Re-reading / highlighting</Li>
          <Li>Anki — recognition-based, no deadline</Li>
          <Li>Quizlet — no spaced repetition, no deadline intelligence</Li>
          <Li>Memorify — closest, but no verbatim scoring</Li>
        </div>

        {/* 02 Solution */}
        <div style={{ ...cellBase, gridArea: "solution" }}>
          <BlockNum n={2} />
          <BlockTitle>Solution</BlockTitle>
          <Li>Deadline-driven session plan built automatically from any pasted text.</Li>
          <Li>3-phase progression — Exposure → Scaffold → Full Recall — with silent calibration between phases.</Li>
          <Li>Word-level verbatim scoring (Levenshtein) with real-time feedback on every attempt.</Li>
        </div>

        {/* 03 Unique Value Proposition */}
        <div style={{ ...cellUVP, gridArea: "uvp" }}>
          <BlockNum n={3} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Unique Value Proposition</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.accent, lineHeight: 1.5, margin: 0, marginBottom: 8 }}>
            "Paste any text.<br />Set your deadline.<br />Remember it word for word."
          </p>
          <Sub>High-level concept</Sub>
          <Pt>Spaced repetition, but for exact recall — not recognition.</Pt>
          <Sub>Target customer</Sub>
          <Pt>High-stakes exam takers who need definitions, statutes, and criteria memorised exactly — not just recognised — when performance is measured in thousands of dollars.</Pt>
        </div>

        {/* 04 Unfair Advantage */}
        <div style={{ ...cellOpen, gridArea: "unfair" }}>
          <BlockNum n={4} />
          <BlockTitle>Unfair Advantage</BlockTitle>
          <OpenTag />
          <Pt>Cannot be easily copied or bought. Candidates under discussion:</Pt>
          <Li>Deep niche focus on verbatim recall for exam takers — a market Anki actively ignores.</Li>
          <Li>Proprietary signal on which activities work for which content types (builds over time, not available day one).</Li>
          <Li>Founder domain expertise / personal connection to the problem.</Li>
          <Li>First-mover trust in tight exam communities (r/medicalschool, r/lawschool).</Li>
          <Note color="orange">Decision needed: Which of these can we honestly claim as defensible on day one?</Note>
        </div>

        {/* 05 Customer Segments */}
        <div style={{ ...cellBase, gridArea: "customer" }}>
          <BlockNum n={5} />
          <BlockTitle>Customer Segments</BlockTitle>
          <Li><strong style={{ color: C.text }}>Primary — monetisation:</strong> High-stakes exam takers (USMLE, bar, CPA, LSAT). Highest urgency, highest WTP.</Li>
          <Li><strong style={{ color: C.text }}>Primary — volume:</strong> Students preparing for professional exams. Highest frequency of use.</Li>
          <Li><strong style={{ color: C.text }}>Secondary:</strong> Actors learning scripts (full verbatim).</Li>
          <Sub>Early adopters</Sub>
          <Pt>University students in professional exam prep programs (pre-med, pre-law, CFA candidates).</Pt>
        </div>

        {/* 06 Key Metrics */}
        <div style={{ ...cellBase, gridArea: "keymetrics" }}>
          <BlockNum n={6} />
          <BlockTitle>Key Metrics</BlockTitle>
          <Li>Session completion rate ≥ 70%</Li>
          <Li>D7 retention ≥ 35%</Li>
          <Li>Free → Paid conversion ≥ 5%</Li>
          <Li>Text mastery rate ≥ 30%</Li>
          <Sub>OMTM (early)</Sub>
          <Pt>D7 retention — if users return after a week, the product is working.</Pt>
        </div>

        {/* 07 Channels */}
        <div style={{ ...cellOpen, gridArea: "channels" }}>
          <BlockNum n={7} />
          <BlockTitle>Channels</BlockTitle>
          <OpenTag />
          <Pt>Path to customers — options under consideration:</Pt>
          <Li>Reddit communities: r/medicalschool, r/lawschool, r/MCAT</Li>
          <Li>SEO targeting exam prep search queries</Li>
          <Li>App Store optimisation</Li>
          <Li>Product Hunt launch</Li>
          <Li>Partnerships with prep courses / tutoring services</Li>
          <Li>Paid ads (Google, TikTok student targeting)</Li>
          <Note color="orange">Decision needed: Where are we going for first 100 users?</Note>
        </div>

        {/* 08 Cost Structure */}
        <div style={{ ...cellBottomOpen, gridArea: "cost" }}>
          <BlockNum n={8} />
          <BlockTitle>Cost Structure</BlockTitle>
          <OpenTag />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <Sub>Known costs</Sub>
              <Li>AI API (LLM for mnemonics): ~$0.0001/call — low</Li>
              <Li>OCR — Tesseract.js runs client-side (free); cloud fallback ~$0.0015/image</Li>
              <Li>Hosting / infrastructure (Replit, Vercel, or similar)</Li>
            </div>
            <div>
              <Sub>Open questions</Sub>
              <Li>Development: solo build or contractors?</Li>
              <Li>Marketing / customer acquisition budget</Li>
              <Li>Customer support burden at scale</Li>
            </div>
          </div>
          <Note color="orange">Decision needed: Team size and budget ceiling needed to model unit economics.</Note>
        </div>

        {/* 09 Revenue Streams */}
        <div style={{ ...cellBottom, gridArea: "revenue" }}>
          <BlockNum n={9} />
          <BlockTitle>Revenue Streams</BlockTitle>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <Sub>Pricing</Sub>
              <Li>Free tier: ≤100 words, up to 3 texts</Li>
              <Li>Monthly: $9.99/month</Li>
              <Li>Annual: $79/year (~34% saving)</Li>
              <Li>90-day exam prep: $24.99 one-time</Li>
            </div>
            <div>
              <Sub>Unit economics (estimate)</Sub>
              <Li>Gross margin: ~85% (low AI API costs)</Li>
              <Li>LTV (monthly): $9.99 × ~6 months = ~$60</Li>
              <Li>LTV (annual): $79</Li>
              <Li>Anchor: USMLE retake costs $1,000+</Li>
            </div>
          </div>
        </div>

      </div>

      <Card>
        <CardTitle>Open questions — decisions needed</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            {
              n: "04",
              title: "Unfair Advantage",
              q: "Which of the candidate advantages can we honestly claim as defensible on day one? Proprietary data and community trust are future advantages — what's the actual day-one edge?",
            },
            {
              n: "07",
              title: "Channels",
              q: "Where are we going for our first 100 users? Reddit communities are the highest-signal option for exam takers, but requires authentic presence. What's the launch strategy?",
            },
            {
              n: "08",
              title: "Cost Structure",
              q: "Is this a solo build or are there contractors / co-founders? What is the budget ceiling? These determine whether the business is viable at current pricing.",
            },
          ].map((item) => (
            <div key={item.n} style={{ background: "#1c1700", borderRadius: 8, padding: "14px 16px", borderLeft: `3px solid ${C.warn}` }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.tertiary, fontFamily: "monospace" }}>{item.n}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.title}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: C.warn + "22", color: C.warn, borderRadius: 4, padding: "2px 6px" }}>⚠ Open</span>
              </div>
              <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.65, margin: 0 }}>{item.q}</p>
            </div>
          ))}
        </div>
      </Card>

    </section>
  );
}

function PlatformArchitecture() {
  const mobileOnly = [
    { feature: "OCR / camera input", reason: "Requires native camera access via expo-camera and expo-image-picker. Browser camera API works but delivers a significantly worse experience for document scanning." },
    { feature: "Native push notifications", reason: "expo-notifications + APNs (iOS) + FCM (Android). iOS Safari web push is unreliable — patchy support, users rarely grant permission." },
    { feature: "Offline-first storage", reason: "AsyncStorage (mobile) provides reliable offline access. IndexedDB on web works but is not the primary target." },
    { feature: "Haptic feedback", reason: "expo-haptics gives tactile feedback on correct/incorrect answers. Not available on web." },
  ];

  const shared = [
    { area: "Core logic", detail: "All session scheduling, Levenshtein scoring, phase advancement, content detection, and mnemonic generation are platform-agnostic TypeScript — shared 100%." },
    { area: "Screen components", detail: "All 10 screens are built as React Native components. Web renders them via React Native Web. Minor layout adaptation needed for larger screens." },
    { area: "State management", detail: "Zustand or React Context for local app state. Same code on all platforms." },
    { area: "Spaced repetition", detail: "ts-fsrs runs in JavaScript — identical behaviour on iOS, Android, and web." },
    { area: "LLM mnemonic", detail: "API call to GPT-4o-mini or Claude Haiku. Network call — fully platform-agnostic." },
  ];

  return (
    <section id="platform">
      <SectionLabel id="F10">How and where it runs</SectionLabel>
      <H2>Platform Architecture</H2>
      <Lead>Mobile-first: iOS and Android are the primary targets. A web companion ships from the same codebase via React Native Web. One codebase, three platforms — with a small number of deliberate mobile-only features in v1.</Lead>

      <Card accent={C.accent}>
        <CardTitle>Framework decision: Expo (React Native)</CardTitle>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, marginBottom: 14 }}>
          Expo is the standard framework for shipping a React Native app to iOS, Android, and web from a single codebase. It wraps the native platform SDKs (camera, notifications, file system, haptics) behind a unified JavaScript API, removing the need to write Objective-C or Kotlin for standard device features.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {[
            { label: "Navigation", value: "Expo Router (file-based, like Next.js for mobile)" },
            { label: "Camera / OCR", value: "expo-camera + expo-image-picker + Tesseract.js" },
            { label: "Notifications", value: "expo-notifications → APNs (iOS), FCM (Android)" },
            { label: "File upload", value: "expo-document-picker (.docx, PDF)" },
            { label: "Storage", value: "AsyncStorage (mobile), localStorage fallback (web)" },
            { label: "Haptics", value: "expo-haptics — correct/wrong feedback on mobile" },
          ].map((r) => (
            <div key={r.label} style={{ background: C.surface2, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.5 }}>{r.value}</div>
            </div>
          ))}
        </div>
        <Note color="green">Expo Managed Workflow is used in v1 — no custom native modules required. If native Objective-C/Kotlin is ever needed (unlikely for this product), the project can eject to Bare Workflow without a rewrite.</Note>
      </Card>

      <Grid2>
        <Card>
          <CardTitle tag="Primary targets" tagColor="green">iOS + Android</CardTitle>
          <Ul items={[
            "Full feature set — all 10 screens, all 4 input methods, native push notifications",
            "Distributed via App Store (iOS) and Google Play (Android)",
            "Minimum targets: iOS 16+, Android 10+ (API level 29)",
            "Offline-capable — sessions can run without internet; sync on reconnect",
            "Haptic feedback on correct/wrong answers, phase advancement",
            "App Store presence supports discovery by exam takers searching for study tools",
          ]} />
        </Card>
        <Card>
          <CardTitle tag="Web companion" tagColor="grey">React Native Web</CardTitle>
          <Ul items={[
            "Same screen components as mobile, rendered via React Native Web",
            "Reduced feature set in v1: no OCR, no native push, no haptics",
            "Useful for users who want to study at a desktop/laptop",
            "Potential channel for desktop-heavy exam prep communities",
            "Deployed alongside the mobile app — same release cycle",
          ]} />
          <Note color="grey">The web version is a companion, not the primary product. If it requires significant layout work to feel native to the web, that is deferred to v2.</Note>
        </Card>
      </Grid2>

      <Card>
        <CardTitle>Notification strategy — the platform split</CardTitle>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, marginBottom: 16 }}>
          Daily reminders are critical for retention. The delivery method differs by platform.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {[
            {
              platform: "iOS (native)",
              method: "APNs push notification via expo-notifications",
              detail: "Reliable, user-controlled, shown on lock screen. User sets preferred time in Settings. \"Time for today's session — 12 min until you're done.\"",
              color: C.accent,
              verdict: "Primary channel",
            },
            {
              platform: "Android (native)",
              method: "FCM push notification via expo-notifications",
              detail: "Same as iOS. expo-notifications handles both APNs and FCM with the same API — no platform-specific code needed.",
              color: C.accent,
              verdict: "Primary channel",
            },
            {
              platform: "Web",
              method: "Email via transactional email provider (Resend / Postmark)",
              detail: "Browser push notifications work on Chrome/Firefox/Edge desktop, but require user permission (often denied) and are not available on iOS Safari. Email is more reliable and has higher open rates for motivated exam takers.",
              color: C.blue,
              verdict: "Email fallback",
            },
          ].map((n) => (
            <div key={n.platform} style={{ background: C.surface2, borderRadius: 8, padding: "14px 16px", borderLeft: `3px solid ${n.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{n.platform}</span>
                  <span style={{ fontSize: 12, color: C.tertiary, marginLeft: 8 }}>{n.method}</span>
                </div>
                <Tag color={n.color === C.accent ? "green" : "blue"}>{n.verdict}</Tag>
              </div>
              <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, margin: 0 }}>{n.detail}</p>
            </div>
          ))}
        </div>
        <Note color="orange">iOS Safari web push exists but is unreliable pre-iOS 16.4 and requires the user to add the site to their home screen. Not a viable primary notification channel for v1.</Note>
      </Card>

      <Card>
        <CardTitle>What is shared across all platforms</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {shared.map((r) => (
            <div key={r.area} style={{ display: "flex", gap: 14, background: C.surface2, borderRadius: 8, padding: "10px 14px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, minWidth: 140, flexShrink: 0, paddingTop: 1 }}>{r.area}</span>
              <span style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>{r.detail}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle tag="v1 mobile only" tagColor="orange">Mobile-only features in v1</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {mobileOnly.map((r) => (
            <div key={r.feature} style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{r.feature}</div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>{r.reason}</div>
            </div>
          ))}
        </div>
        <Note color="grey">These features can be added to the web companion in v2 if there is sufficient demand. They are not blocked by architecture — only by prioritisation.</Note>
      </Card>

    </section>
  );
}

// ─── FLOW SECTIONS ────────────────────────────────────────────────────────────

function CoreFlow() {
  const steps = [
    {
      n: "01",
      title: "Input",
      color: C.accent,
      body: "Paste text, upload a .docx or PDF, or snap up to 5 photos (OCR). Up to 500 words on the paid tier. The app processes the text immediately.",
      note: "Content analysis runs here — not later.",
    },
    {
      n: "02",
      title: "Content Analysis",
      color: C.accent,
      body: "Runs automatically at input. Detects text type: Definition, Ordered List, Passage, Dialogue, or Long-form. Sets the activity sequence for that text.",
      note: "Rule-based (~80% coverage). LLM fallback for ambiguous cases.",
    },
    {
      n: "03",
      title: "Deadline Calculator",
      color: C.blue,
      body: "User picks their exam or performance date. The app shows the plan: 14 days = 14 sessions of ~15 min each. One of 4 deadline modes is automatically selected.",
      note: "Mode selection is the key branch point in the whole flow.",
    },
    {
      n: "04",
      title: "Start Day 1",
      color: C.warn,
      body: "The mode set by the deadline determines everything about Day 1. ≤3 days → Mnemonic Mode (front-loaded, no SR). 4–7 days → Intensive. 8–30 days → Standard. 31+ days → Spaced.",
      note: "All 4+ day modes begin at Phase 1 (Exposure). ≤3 days skips phases entirely.",
    },
    {
      n: "05",
      title: "Practice",
      color: C.blue,
      body: "Phase-based activities run daily. 10–15 min per session. Long-press any blank for a one-word hint. Activities adapt to the detected content type.",
      note: "Activities: Read-along → Highlight Quiz → Guided Typing → Full Recall.",
    },
    {
      n: "06",
      title: "Adapt",
      color: C.purple,
      body: "Phase advances when performance thresholds are met. For 4+ day modes, SR schedules the next session. Mnemonic Mode follows a fixed front-loaded plan — no SR.",
      note: "Mastered = 95%+ exact match across 3 consecutive sessions.",
    },
  ];

  const modes = [
    {
      label: "≤ 3 days",
      name: "Mnemonic Mode",
      color: C.warn,
      items: [
        "SR is ineffective sub-72 hours — abandon it",
        "AI mnemonic generated as primary scaffold",
        "Front-loaded: Day 1 = heaviest session",
        "No phase progression — go straight to recall",
        "Paid feature only",
      ],
    },
    {
      label: "4–7 days",
      name: "Intensive Mode",
      color: C.orange,
      items: [
        "Skip Phase 1 (Exposure) — time is short",
        "2–3 sessions per day",
        "Phase 2 and Phase 3 only",
        "SR active from Day 1",
        "AI mnemonic offered as optional aid",
      ],
    },
    {
      label: "8–30 days",
      name: "Standard Mode",
      color: C.blue,
      items: [
        "1 session per day, full 3-phase progression",
        "Phase 1 Exposure builds the foundation",
        "Phase 2 Scaffold reinforces with prompts",
        "Phase 3 Full Recall = exam condition",
        "SR schedules review after Phase 3",
      ],
    },
    {
      label: "31+ days",
      name: "Spaced Mode",
      color: C.accent,
      items: [
        "Full 3-phase progression as Standard",
        "SR gaps widen after each mastery milestone",
        "Recall Flash Days: periodic cold recall sessions",
        "Suitable for long-course material",
        "Dashboard tracks multiple texts in parallel",
      ],
    },
  ];

  return (
    <section id="core-flow">
      <SectionLabel id="0">The complete picture</SectionLabel>
      <H2>Core User Flow</H2>
      <Lead>Six steps from text input to mastery. Content analysis runs at Step 1, not mid-flow. The deadline at Step 3 is the key branch point — it determines which of the four modes the user enters.</Lead>

      {/* Step flow */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", gap: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, paddingTop: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.color + "22", border: `2px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.n}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 2, flex: 1, background: C.border, marginTop: 4, minHeight: 16 }} />
              )}
            </div>
            <div style={{ background: C.surface, borderRadius: 10, padding: "14px 16px", marginBottom: 2, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: s.color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.title}</div>
              <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7, margin: 0, marginBottom: 6 }}>{s.body}</p>
              <div style={{ fontSize: 11, color: C.tertiary, fontStyle: "italic" }}>↳ {s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deadline mode branch */}
      <Card>
        <CardTitle>Step 03 branch — deadline modes</CardTitle>
        <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7, marginBottom: 16 }}>
          The deadline date the user enters at Step 3 determines everything that follows. Four modes, four different Day 1 experiences.
        </p>
        <Grid2>
          {modes.map((m) => (
            <div key={m.name} style={{ background: C.surface2, borderRadius: 10, padding: "14px 16px", borderTop: `3px solid ${m.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: m.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 2 }}>{m.name}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {m.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6, paddingLeft: 12, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: m.color }}>·</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Grid2>
      </Card>

      <Note color="green">
        SR (spaced repetition) is not used in Mnemonic Mode. For all 4+ day modes, ts-fsrs drives the review schedule. This distinction runs through the entire system — scheduling, activity selection, curriculum generation, and the "Adapt" step all branch on this.
      </Note>
    </section>
  );
}

function Opening() {
  return (
    <section id="opening">
      <SectionLabel id="1">First impressions matter</SectionLabel>
      <H2>Opening Screen & Onboarding</H2>
      <Lead>The first-time experience should be the product itself — not slides explaining the product. Users who learn by doing activate faster and churn less.</Lead>

      <Card accent={C.accent}>
        <CardTitle>Decision: Guided first-use, no onboarding screens</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {[
            { opt: "Option A — Onboarding slides", verdict: "❌ Skip", note: "3 screens explaining what the app does. Users skip them immediately. Wastes dev time and first seconds of attention." },
            { opt: "Option B — Straight to empty dashboard", verdict: "⚠️ Risky", note: "Clean but cold. A first-time user staring at an empty dashboard with no context doesn't know what to paste or why. High drop-off." },
            { opt: "Option C — Guided first text (recommended)", verdict: "✅ Best", note: "The empty dashboard has a pre-loaded demo tile: 'To be or not to be, that is the question.' User taps it, or pastes their own text. The first session is the onboarding. Contextual tooltips appear at each step. By the time they've finished Day 1, they understand the product — without reading anything about it." },
          ].map((r, i) => (
            <div key={i} style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${i === 2 ? C.accent : i === 1 ? C.warn : C.tertiary}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.opt}</span>
                <span style={{ fontSize: 12, color: C.secondary }}>{r.verdict}</span>
              </div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>{r.note}</div>
            </div>
          ))}
        </div>
      </Card>

      <Grid2>
        <Card>
          <CardTitle tag="First open" tagColor="blue">Guided first-use flow</CardTitle>
          <Ul items={[
            "Dashboard opens with one demo tile: \"To be or not to be, that is the question\" — tappable",
            "\"Add your first text\" button prominent above it",
            "Single tooltip: \"Paste any text you need to remember. Set a deadline. We do the rest.\"",
            "User either taps the demo or adds their own text",
            "Contextual hints at each step (input → deadline → Day 1) — one line each, non-blocking",
            "After completing Day 1: hints dismissed, normal dashboard mode",
          ]} />
        </Card>
        <Card>
          <CardTitle tag="Returning" tagColor="green">Returning user dashboard</CardTitle>
          <Ul items={[
            "\"Due today\" section at top — texts that need a session",
            "Each text: title, phase badge, % mastered, days to deadline",
            "Overdue texts highlighted in amber",
            "Aggregate row: \"3 texts in progress · 1 mastered · Next session: 12 min\"",
            "\"+ Add text\" always visible top right",
          ]} />
        </Card>
      </Grid2>
    </section>
  );
}

function InputMethods() {
  return (
    <section id="input">
      <SectionLabel id="2">Getting content in</SectionLabel>
      <H2>Input Methods</H2>
      <Lead>Four ways to get text in. All lead to the same review editor before continuing. Structure is always preserved — it drives content detection and activity selection.</Lead>

      <Card accent={C.orange} style={{ marginBottom: 20 }}>
        <CardTitle>Content limits</CardTitle>
        <Grid2>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Word limit: 100 words free / 500 words paid</p>
            <Ul items={[
              "100 words: enough for a key definition, short paragraph, or a verse — proves the product works",
              "500 words: enough for a legal statute, full speech, 10–15 definitions, a scripture chapter",
              "Beyond 500 words: product becomes an editor, not a memorisation tool",
              "If user exceeds cap: \"This is too long. Trim to what you need to say word for word, or split into two texts.\"",
            ]} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Photo limit: 5 photos per text entry</p>
            <Ul items={[
              "5 photos covers 3–5 textbook pages",
              "Combined result still subject to word cap",
              "Photos stitched in capture order with --- page break between each",
              "If combined OCR exceeds cap: user shown extracted text and asked to trim",
            ]} />
          </div>
        </Grid2>
      </Card>

      <Card>
        <CardTitle tag="v1" tagColor="green">Paste text</CardTitle>
        <Ul items={[
          "Full-screen text area, word count live (e.g. \"142 / 500 words\")",
          "Language auto-detected — note shown if non-English",
          "User names the text before continuing",
          "\"Continue →\" proceeds to Deadline Calculator",
        ]} />
        <Tech>Word counting via split(/\\s+/). Language detection: franc.js (client-side, ~600KB). No server call needed.</Tech>
      </Card>

      <Card>
        <CardTitle tag="v1" tagColor="green">Upload file (.txt / .docx / .pdf)</CardTitle>
        <Ul items={[
          ".txt — plain text read directly",
          ".docx — parsed client-side with mammoth.js. Headings preserved as section markers.",
          ".pdf — parsed with pdf.js. Text extracted per page. Headings inferred from font size.",
          "Extracted text shown in editor for review — user corrects before continuing",
          "Structure preserved: headings become section titles, lists stay line-by-line",
          "Tables in PDFs: skipped with a user note — \"We skipped a table. Paste that content separately if needed.\"",
        ]} />
        <Note color="yellow">PDF review step is mandatory. PDF extraction is imperfect — multi-column layouts, headers/footers, and tables often extract poorly.</Note>
        <Tech>mammoth.js (.docx, mature, reliable). pdf.js (Mozilla, open source, client-side). No file ever uploaded to server. Heading detection in PDF: font size 20%+ above body average = heading. Both libraries run fully client-side.</Tech>
      </Card>

      <Card>
        <CardTitle tag="v1 / paid" tagColor="yellow">Snap a photo (OCR) — up to 5 photos</CardTitle>
        <Ul items={[
          "Camera or gallery picker — user captures 1–5 photos in sequence",
          "Thumbnail strip shown — user can reorder or delete before processing",
          "OCR runs on all photos, text stitched in order",
          "Uncertain words highlighted in amber: \"3 words flagged — tap to review\"",
          "Mandatory correction step before naming and continuing",
        ]} />
        <Note color="orange">OCR correction is non-negotiable. Practising with wrong words creates false memory — a genuine performance risk.</Note>
        <Tech>Tesseract.js v1 (client-side, free, good for printed text). v2: upgrade to Google Cloud Vision or AWS Textract for handwriting. Tesseract exposes per-word confidence — flag anything below 80%.</Tech>
      </Card>

      <Card>
        <CardTitle>Structure preservation — why it matters</CardTitle>
        <Code>{`Input PDF:
  PHARMACOLOGY — Receptor Types
  1. Alpha-1: Vasoconstriction, mydriasis, urinary retention
  2. Beta-1: Increased heart rate, contractility

Extracted correctly → detected as: Ordered List
  → Activities: Sentence Scramble, Rapid Fire, First Letter Recall per item

Extracted as wall of text → detected as: Long-form passage
  → Wrong activities served`}</Code>
        <Note color="blue">Structure drives activity selection. Losing structure means serving the wrong activities for the content type.</Note>
      </Card>
    </section>
  );
}

function DeadlineSection() {
  return (
    <section id="deadline">
      <SectionLabel id="3">Planning around time</SectionLabel>
      <H2>Deadline Calculator</H2>
      <Lead>After input, the user picks their deadline. The app turns that date into a plan — with a key strategic difference depending on how much time they have.</Lead>

      <Card accent={C.accent}>
        <CardTitle>The calculator display</CardTitle>
        <Ul items={[
          "Date picker → instant projection: \"You have 14 days. That's 14 sessions of ~15 minutes.\"",
          "Word-count estimate: \"At 220 words, you'll be ready by day 11 — 3 days before your deadline.\"",
          "Confidence indicator: On Track / Tight / At Risk — colour-coded",
          "Mode label shown clearly: Mnemonic / Intensive / Standard / Spaced",
        ]} />
        <Tech>All calculation client-side. Session count = days × mode multiplier. Word-length-to-session ratio: ~14 words/minute recall practice speed, empirically adjusted. No AI needed for the projection itself.</Tech>
      </Card>

      <Card>
        <CardTitle tag="≤ 3 days" tagColor="orange">Mnemonic Mode</CardTitle>
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, marginBottom: 12 }}>
          Synaptic consolidation takes 24–48 hours minimum. For ≤3 days, we are not forming long-term memory — we are working with working memory and short-term storage. Spaced repetition is ineffective. Mnemonics work.
        </p>
        <Ul items={[
          "AI mnemonic delivered at the start of session 1",
          "Activities: Acronym Builder → Mnemonic-guided First Letter Recall → Rapid Fire → Typing from Memory",
          "3 sessions/day if deadline is tomorrow, 2/day if 2–3 days away",
          "No Phase 1 — every session is immediate recall practice",
          "No SR scheduling — not enough time",
        ]} />
        <Note color="orange">For ≤3 days, the goal is performing well on one specific occasion. We don't pretend spaced repetition helps here.</Note>
      </Card>

      <Card>
        <CardTitle tag="4–7 days" tagColor="yellow">Intensive Mode</CardTitle>
        <Ul items={[
          "2–3 sessions/day, 4+ hours apart",
          "Phase 1 skipped — start in Phase 2",
          "Mnemonic generated as support in session 1",
          "All sessions are high-effort recall: First Letter Recall → Progressive Deletion → Typing from Memory",
        ]} />
      </Card>

      <Card>
        <CardTitle tag="8–30 days" tagColor="grey">Standard Mode</CardTitle>
        <Ul items={["1 session/day, ~12–15 min", "Full 3-phase journey", "SR schedules older chunks for review on rest days"]} />
      </Card>

      <Card>
        <CardTitle tag="31+ days" tagColor="blue">Spaced Mode</CardTitle>
        <Ul items={[
          "Not every day is a session — gaps widen as mastery increases",
          "\"Recall flash\" days (2 min): type the opening sentence from memory",
          "AI mnemonic delivered day 2–3 — time to truly internalise it",
        ]} />
      </Card>
    </section>
  );
}

function ContentDetection() {
  return (
    <section id="detection">
      <SectionLabel id="4">Understanding what was pasted</SectionLabel>
      <H2>AI Content Detection</H2>
      <Lead>After deadline is set, the app detects text structure to determine which activities to serve. Detection is shown to the user and can be overridden.</Lead>

      <Card accent={C.accent}>
        <CardTitle>Detection + user override</CardTitle>
        <div style={{ background: C.surface2, borderRadius: 8, padding: "14px 16px", marginBottom: 12, fontSize: 13, color: C.secondary }}>
          UI: <em style={{ color: C.text }}>«We detected this as an ordered list. Activities will focus on sequence recall. <span style={{ color: C.accent }}>Not right? Change it.</span>»</em>
        </div>
        <Ul items={[
          "Override: user selects type from dropdown — activity set rebuilds immediately",
          "Override saved to text metadata — applies to all future sessions",
          "Override works per-section for long-form texts with mixed structure",
          "No friction or warning — user knows their content",
        ]} />
        <Tech>
          Two-stage pipeline: (1) Rule-based — numbered lines → ordered list; bullet markers → unordered list; single sentence &lt;40 words with colon → definition; lines starting with SPEAKER: → dialogue; multi-paragraph &gt;200 words → long-form; otherwise → passage. Handles ~80% of cases free and instant.
          (2) LLM — only for ambiguous cases below 70% rule-based confidence. Single call: "Classify as: definition / ordered-list / passage / long-form / dialogue." GPT-4o-mini or Claude Haiku (~$0.0001/call).
        </Tech>
      </Card>

      {[
        { tag: "Type A", color: "blue", label: "Definition / short sentence (&lt;40 words)", ex: "\"Mens rea is the mental element of a person's intention to commit a crime.\"", items: ["No chunking — full definition practised every session", "Phase 2: First Letter Recall, fill-in-blank, Acronym Builder", "Phase 3: Typing from Memory, Rapid Fire", "Typical mastery: 3–5 sessions"] },
        { tag: "Type B", color: "yellow", label: "Ordered list", ex: "\"1. Gather materials. 2. Sterilise equipment. 3. Draw up medication...\"", items: ["Sequence memory is the challenge", "Phase 2: Sentence Scramble (reorder items), Rapid Fire (\"What is step 3?\"), First Letter Recall per item", "Acronym Builder activated automatically", "Unordered lists: same but order doesn't matter"] },
        { tag: "Type C", color: "orange", label: "Passage (40–200 words)", ex: "A legal statute, a medical procedure, a speech paragraph, a scripture verse.", items: ["Chunked into sentence/clause units", "Phase 2: Progressive Deletion (30% → 100% hidden), Sentence Scramble, First Letter Recall", "AI mnemonic for the opening line — hardest part to start from cold"] },
        { tag: "Type D", color: "purple", label: "Dialogue / script", ex: "Actor scripts, Q&A pairs, plays, Socratic dialogues.", items: ["Parsed into speaker/line pairs", "Phase 2: Speaker hidden (who says this?) or line hidden (what does HAMLET say next?)", "Phase 3: \"HAMLET: ___\" prompts — user types the line", "\"Just my lines\" mode for actors — practice only your character"] },
        { tag: "Type E", color: "grey", label: "Long-form text (200+ words)", ex: "A full speech, a play act, multiple legal paragraphs.", items: ["Divided into named sections (~80 words each, or at heading breaks)", "Dashboard shows progress per section: \"Section 3 of 5 — Familiar\"", "Mastery requires all sections individually mastered before combined test"] },
      ].map((t) => (
        <Card key={t.tag}>
          <CardTitle tag={t.tag} tagColor={t.color}><span dangerouslySetInnerHTML={{ __html: t.label }} /></CardTitle>
          <p style={{ fontSize: 14, color: C.secondary, marginBottom: 10, fontStyle: "italic", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t.ex }} />
          <Ul items={t.items} />
        </Card>
      ))}

      <Note color="grey">Mixed content (e.g. a heading + definitions + a list) is handled by detecting type per-section within a long-form text. Each section gets its own activity set.</Note>
    </section>
  );
}

function Phases() {
  return (
    <section id="phases">
      <SectionLabel id="5">The learning structure</SectionLabel>
      <H2>The 3-Phase Learning Journey</H2>
      <Lead>Every text moves through three phases. Pace is set by the deadline. Activities change with each phase. Advancement is automatic — driven by performance scores, not time elapsed.</Lead>

      <Card accent={C.blue}>
        <div style={{ marginBottom: 12 }}><PhaseChip phase={1} label="Exposure" /></div>
        <CardTitle>Getting the text into your head</CardTitle>
        <Ul items={[
          "TTS read-aloud: App reads the text naturally. User reads along.",
          "Highlight quiz (text visible): \"What word comes after 'therefore'?\" — 4-choice tap. Text stays on screen.",
          "Read-aloud yourself: user reads the passage aloud (v2: record and compare)",
          "Duration: 2–5 days (medium), skipped for ≤3-day deadlines",
        ]} />
        <Note color="blue">Phase 1 should feel easy. Confidence at the end of Phase 1 sessions is a feature — it sets the right baseline before the hard work starts.</Note>
        <Tech>TTS: Web Speech API (browser-native, free). Highlight quiz: 3 distractors chosen from other words in the text. Advancement trigger: 70%+ on Highlight Quiz across 3 sessions.</Tech>
      </Card>

      <Card accent={C.warn}>
        <div style={{ marginBottom: 12 }}><PhaseChip phase={2} label="Scaffold" /></div>
        <CardTitle>Building recall with support structures</CardTitle>
        <Ul items={[
          "First Letter Recall: every word shown as first letter + blanks. User types each word.",
          "Progressive Deletion: 30% words hidden → +15% per session. Long-press any blank for 1.5s hint.",
          "Sentence Scramble: word tiles in wrong order, user reconstructs exact sentence.",
          "Acronym Builder: for lists — first letters combined into a memorable word.",
          "AI Mnemonic (paid): LLM-generated hook for hard-to-remember passages.",
        ]} />
        <Note color="yellow">Long-press hint reveal is critical. Getting completely stuck is the #1 dropout trigger. A peek is scaffolding, not cheating.</Note>
        <Tech>Progressive Deletion: words replaced with styled blanks matching word length. Scramble: CSS flex drag/tap. Advancement trigger: 80%+ Typing Recall across 2 consecutive sessions.</Tech>
      </Card>

      <Card accent={C.accent}>
        <div style={{ marginBottom: 12 }}><PhaseChip phase={3} label="Full Recall" /></div>
        <CardTitle>Verbatim from memory — no help</CardTitle>
        <Ul items={[
          "Typing from Memory: blank screen, user types full text. Scored word-by-word in real time.",
          "Progressive Deletion (100% hidden): all words blank, user types sequentially.",
          "Rapid Fire: prompts from text — \"Finish this sentence: 'The defendant must...'\"",
          "SR continues scheduling increasingly spaced reviews until after the deadline.",
        ]} />
        <Note color="green">Phase 3 is the whole product. Everything before it is preparation for this moment.</Note>
        <Tech>Real-time scoring: Levenshtein per word after each spacebar press. Mastery trigger: 95%+ exact match across 3 consecutive full-text sessions. SR: ts-fsrs (FSRS-5 algorithm).</Tech>
      </Card>
    </section>
  );
}

function Curriculum() {
  return (
    <section id="curriculum">
      <SectionLabel id="6">What happens each day</SectionLabel>
      <H2>Daily Curriculum</H2>
      <Lead>The app tells the user exactly what to do each day. No decisions, no planning required. Open → practice → done.</Lead>

      <Card>
        <CardTitle tag="≤ 3 days" tagColor="orange">Mnemonic Mode daily schedule</CardTitle>
        <Code>{`Session 1 (any time):
  → AI Mnemonic delivered first
  → First Letter Recall with mnemonic visible
  → Rapid Fire: each item using the mnemonic

Session 2 (4+ hours later):
  → First Letter Recall WITHOUT mnemonic visible
  → Rapid Fire: no hints

Session 3 (evening):
  → Typing from Memory — full blank recall
  → Score shown immediately`}</Code>
      </Card>

      <Card>
        <CardTitle tag="4–7 days" tagColor="yellow">Intensive Mode daily schedule</CardTitle>
        <Code>{`Morning (10–12 min):   First Letter Recall — warm-up
Midday (10–12 min):    Progressive Deletion at 60–80% hidden
Evening (12–15 min):   Typing from Memory — full blank (hardest, highest benefit)

By day 3+: all three sessions are Phase 3 activities
Minimum 4 hours between sessions enforced`}</Code>
      </Card>

      <Card>
        <CardTitle tag="8–30 days" tagColor="grey">Standard Mode daily schedule</CardTitle>
        <Code>{`Days 1–5 (Phase 1):   TTS read-along + Highlight Quiz — 10 min
Days 6–12 (Phase 2):  1 scaffold activity (AI-selected from weakest areas) — 12–15 min
Days 13–17 (Phase 3): Typing from Memory + Rapid Fire — 15 min
Days 18+ (maintain):  Shorter sessions (8–10 min) on lowest-scoring chunks`}</Code>
        <Tech>Activity selection: lowest-scoring 3 chunks from yesterday's session. Simple sort — no AI needed. SR: ts-fsrs. Phase 3 reviews rescheduled using FSRS-5.</Tech>
      </Card>

      <Card>
        <CardTitle tag="31+ days" tagColor="blue">Spaced Mode daily schedule</CardTitle>
        <Grid2>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Full session days (4–5×/week)</p>
            <Ul items={["Week 1–2: Phase 1 — one section/session", "Week 3–4: Phase 2 — scaffold per section", "Week 5+: Phase 3 — full recall, widening gaps", "AI mnemonic delivered day 2"]} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Recall flash days (2–3×/week)</p>
            <Ul items={["2 minutes only: type opening sentence from memory", "Score tracked — dip below 70% triggers full session next day", "Prevents the comfortable-and-forgetting trap"]} />
          </div>
        </Grid2>
      </Card>
    </section>
  );
}

function Advancement() {
  return (
    <section id="advancement">
      <SectionLabel id="7">How the system reads performance</SectionLabel>
      <H2>Phase Advancement & Silent Calibration</H2>
      <Lead>Users never choose their phase. The system advances them automatically — or holds them. All users start in Phase 1. Those who already know the text move through it in one session.</Lead>

      <Card accent={C.accent}>
        <CardTitle>Advancement thresholds</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 12 }}>
          {[
            { from: "Phase 1 → 2", condition: "70%+ on Highlight Quiz across 3 Phase 1 sessions", color: C.blue },
            { from: "Phase 2 → 3", condition: "80%+ Typing Recall across 2 consecutive sessions", color: C.warn },
            { from: "Phase 3 = Mastered", condition: "95%+ exact match across 3 consecutive full-text sessions", color: C.accent },
          ].map((r) => (
            <div key={r.from} style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${r.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: r.color, marginBottom: 6 }}>{r.from}</div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.55 }}>{r.condition}</div>
            </div>
          ))}
        </div>
        <Tech>Advancement check runs at end of each session. Fast-tracking: 95%+ in session 1 of Phase 1 → immediate Phase 2 advance. Regression: Phase 3 drops below 80% on 2 consecutive sessions → back to Phase 2, no failure framing.</Tech>
      </Card>

      <Grid2>
        <Card>
          <CardTitle>Why silent calibration</CardTitle>
          <Ul items={[
            "No onboarding test — people are bad at self-assessment",
            "Phase 1 IS the calibration: expert users score 95%+ and advance immediately",
            "Beginners need 2–4 sessions before advancing naturally",
            "Speed of advancement is visible and satisfying",
          ]} />
        </Card>
        <Card>
          <CardTitle>When performance drops</CardTitle>
          <Ul items={[
            "Phase 3 below 80% × 2 consecutive → back to Phase 2",
            "App note: \"Some words are slipping. We'll reinforce before testing again.\"",
            "Specific low-scoring chunks prioritised in next session",
            "No failure framing — regression is normal",
          ]} />
        </Card>
      </Grid2>
    </section>
  );
}

function Mastery() {
  return (
    <section id="mastery">
      <SectionLabel id="8">The proof of knowing</SectionLabel>
      <H2>Mastery Measurement & Scoring</H2>
      <Lead>How we know the user actually knows the text — not just thinks they do. Scoring is word-level, precise, transparent, and shown in real time.</Lead>

      <Card>
        <CardTitle>Word-level scoring</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {[
            { label: "Exact match", score: "100%", color: C.accent, ex: "\"photosynthesis\" → \"photosynthesis\"" },
            { label: "Near match (Levenshtein ≤ 2)", score: "80%", color: C.warn, ex: "\"photosinthesis\" → \"photosynthesis\" — counts as correct for advancement" },
            { label: "Wrong word", score: "0%", color: C.red, ex: "\"metabolism\" → \"photosynthesis\"" },
            { label: "Missing word", score: "0%", color: C.red, ex: "User skipped the word entirely" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: C.surface2, borderRadius: 8, padding: "10px 14px" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: s.color, minWidth: 36 }}>{s.score}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: C.tertiary }}>{s.ex}</div>
              </div>
            </div>
          ))}
        </div>
        <Note color="grey">Capitalisation and punctuation ignored. Only word content scored.</Note>
        <Tech>Levenshtein: O(m×n) dynamic programming per word pair. Applied after splitting on whitespace. Near-match threshold ≤2 handles common typos without masking genuine gaps.</Tech>
      </Card>

      <Grid2>
        <Card>
          <CardTitle>Status labels</CardTitle>
          {[
            { label: "Unfamiliar", range: "0–49%", color: C.red },
            { label: "Familiar", range: "50–79%", color: C.warn },
            { label: "Almost There", range: "80–94%", color: C.blue },
            { label: "Mastered", range: "95–100%", color: C.accent },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface2, borderRadius: 6, padding: "8px 12px", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.label}</span>
              <span style={{ fontSize: 12, color: C.tertiary }}>{s.range}</span>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle>Text-level status</CardTitle>
          <Ul items={[
            "Score = weighted average of all chunk scores (recent chunks weighted higher)",
            "\"Ready\" badge = all chunks Mastered",
            "SR continues reviews after Ready — keeps memory alive until deadline",
            "\"Prove it\" — optional final test: blank screen, no hints, full accuracy score",
          ]} />
        </Card>
      </Grid2>

      <Card accent={C.accent}>
        <CardTitle>What \"done\" looks like</CardTitle>
        <Ul items={[
          "Dashboard: green \"Ready\" badge on the text",
          "Summary: \"You practised this text 22 times across 14 days. Final recall score: 97%.\"",
          "Per-chunk breakdown: tap any chunk to see its score history",
          "Future SR reviews still scheduled until the deadline date has passed",
        ]} />
        <Note color="green">\"Ready\" is the beginning of maintenance, not the end of practice. The product's job continues until the deadline.</Note>
      </Card>
    </section>
  );
}

// ─── LAYOUT ──────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("vision");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  function scrollTo(id: string) {
    setActive(id);
    if (isMobile) setNavOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, isMobile ? 120 : 0);
  }

  function NavGroup({ title, items }: { title: string; items: typeof FOUNDATION }) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.tertiary, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px 4px" }}>{title}</div>
        {items.map((s) => (
          <button key={s.id} onClick={() => scrollTo(s.id)}
            style={{
              display: "block", width: "100%", textAlign: "left",
              background: active === s.id ? C.accentDim : "transparent",
              border: "none", borderRadius: 6, padding: "7px 12px",
              fontSize: 12, color: active === s.id ? C.accent : C.secondary,
              cursor: "pointer", fontFamily: font,
              fontWeight: active === s.id ? 600 : 400,
              marginBottom: 1, transition: "all 0.1s",
            }}>
            {s.label}
          </button>
        ))}
      </div>
    );
  }

  const SIDEBAR_W = 224;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font, color: C.text, display: "flex" }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 100,
          background: C.surface, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
        }}>
          <button onClick={() => setNavOpen(o => !o)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: 6, display: "flex", flexDirection: "column", gap: 4,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display: "block", width: 20, height: 2, background: C.text, borderRadius: 2 }} />
            ))}
          </button>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Verbitra</div>
          <div style={{ fontSize: 10, color: C.tertiary, marginLeft: 2 }}>PRD</div>
        </div>
      )}

      {/* Backdrop for mobile nav */}
      {isMobile && navOpen && (
        <div onClick={() => setNavOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.6)",
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: isMobile ? (navOpen ? 0 : -SIDEBAR_W) : 0, bottom: 0,
        width: SIDEBAR_W, background: C.surface, borderRight: `1px solid ${C.border}`,
        padding: "28px 0", overflowY: "auto", zIndex: 70,
        transition: isMobile ? "left 0.22s ease" : undefined,
      }}>
        <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3 }}>Verbitra</div>
          <div style={{ fontSize: 11, color: C.tertiary }}>Product Requirements Document</div>
        </div>
        <div style={{ padding: "0 12px" }}>
          <NavGroup title="Foundation" items={FOUNDATION} />
          <div style={{ height: 1, background: C.border, margin: "8px 0 12px" }} />
          <NavGroup title="Flow & Features" items={FLOW} />
        </div>
        <div style={{ padding: "16px 20px 0", marginTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.tertiary, lineHeight: 1.7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#0d0d0d", border: `1px solid #1f1f1f`, display: "inline-block" }} />
              <span>Technical notes</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: C.accentDim, border: `1px solid ${C.accent}44`, display: "inline-block" }} />
              <span>Key decision</span>
            </div>
          </div>
        </div>
      </aside>

      <main style={{
        marginLeft: isMobile ? 0 : SIDEBAR_W,
        flex: 1,
        padding: isMobile ? "72px 20px 48px" : "64px clamp(32px, 5vw, 80px)",
        maxWidth: isMobile ? "100%" : 900,
        lineHeight: 1.6,
        boxSizing: "border-box",
      }}>
        <div style={{ marginBottom: 64, paddingBottom: 40, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <Tag color="green">PRD</Tag>
            <Tag color="grey">v1</Tag>
            <Tag color="grey">March 2026</Tag>
            <Tag color="blue">19 sections</Tag>
          </div>
          <h1 style={{ fontWeight: 700, fontSize: isMobile ? 28 : 40, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
            Verbitra — Product Requirements Document
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: C.secondary, lineHeight: 1.75, maxWidth: 640 }}>
            Complete PRD: product vision, audience, jobs to be done, competitive landscape, business model, product principles, scope decisions, success metrics — followed by the full feature spec and user flow. Everything a builder needs without asking questions.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
            {[["Foundation", "10 sections"], ["Flow & Features", "9 sections"], ["Tech notes", "Every section"]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{v}</div>
                <div style={{ fontSize: 12, color: C.tertiary }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Foundation */}
        <Vision />
        <Divider />
        <Audience />
        <Divider />
        <JTBD />
        <Divider />
        <Competitive />
        <Divider />
        <Business />
        <Divider />
        <Principles />
        <Divider />
        <Scope />
        <Divider />
        <Metrics />
        <Divider />
        <LeanCanvas />
        <Divider />
        <PlatformArchitecture />
        <Divider />

        {/* Flow & Features */}
        <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
          <Tag color="grey">Flow & Features</Tag>
          <h2 style={{ fontWeight: 700, fontSize: isMobile ? 18 : 22, letterSpacing: "-0.03em", color: C.text, marginTop: 12, marginBottom: 8 }}>User Flow & Feature Specification</h2>
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.7 }}>Detailed interaction design, activity logic, deadline scenarios, content type handling, and scoring — everything the foundation sections define at a strategic level, resolved into specific product behaviour.</p>
        </div>

        <CoreFlow />
        <Divider />
        <Opening />
        <Divider />
        <InputMethods />
        <Divider />
        <DeadlineSection />
        <Divider />
        <ContentDetection />
        <Divider />
        <Phases />
        <Divider />
        <Curriculum />
        <Divider />
        <Advancement />
        <Divider />
        <Mastery />
        <div style={{ height: 80 }} />
      </main>
    </div>
  );
}
