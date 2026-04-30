import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";

const EXPO_URL = import.meta.env.VITE_EXPO_URL ?? "https://expo.dev/accounts/gregorymaverick/projects/verbitra";

const highlights = [
  "Active recall, not passive re-reading",
  "A plan that adapts to your deadline",
  "Word-for-word confidence when it counts",
];

const productProofCards = [
  {
    title: "One home for every text",
    eyebrow: "Dashboard",
    points: [
      "See every text, deadline, and next practice step in one place.",
      "The product pushes you toward the next useful action, not more rereading.",
      "Built for exact recall, not vague familiarity.",
    ],
  },
  {
    title: "Multiple ways to get started",
    eyebrow: "Input",
    points: [
      "Paste notes, capture printed material, or import what you need to learn.",
      "The product is designed for real study material, not toy flashcards.",
      "A deadline turns raw text into a usable plan.",
    ],
  },
  {
    title: "Scaffolded recall that fades",
    eyebrow: "Practice",
    points: [
      "Support drops away across phases instead of disappearing all at once.",
      "You move from meaning, to cues, to full recall.",
      "The aim is performance under pressure, not passive review.",
    ],
  },
  {
    title: "Extra help when time is tight",
    eyebrow: "Mnemonic mode",
    points: [
      "AI mnemonics and acronyms help when the deadline is close.",
      "Short deadlines get a different strategy from long ones.",
      "The product adapts to urgency instead of pretending every study plan is the same.",
    ],
  },
];

const moments = [
  "A closing argument you cannot afford to improvise.",
  "A speech, vow, or prayer that has to land exactly right.",
  "Exam material you need under pressure, not just on paper.",
  "Lines, scripture, case law, or dosage facts that must be ready on demand.",
];

const people = [
  {
    title: "Students",
    body: "Turn definitions, notes, and passages into a daily plan instead of rereading and guessing you're ready.",
  },
  {
    title: "Professionals",
    body: "Walk into court, meetings, or presentations knowing the exact words are there when you need them.",
  },
  {
    title: "Performers",
    body: "Move from full text to no prompts, so you can deliver the lines instead of chasing them.",
  },
  {
    title: "People of faith",
    body: "Carry prayers, verses, and readings with you, without reaching for a phone at the key moment.",
  },
];

const phases = [
  {
    number: "01",
    title: "Read for meaning",
    body: "Start with the full text so the language, structure, and important phrases feel familiar before recall begins.",
  },
  {
    number: "02",
    title: "Recall with scaffolding",
    body: "Move through first letters, guided typing, and progressive deletion so support fades as memory strengthens.",
  },
  {
    number: "03",
    title: "Perform from memory",
    body: "Finish with full recall sessions that prove you know the exact words when there is no prompt left to lean on.",
  },
];

const modes = [
  { label: "Mnemonic", window: "3 days or less", accent: "Urgent help for short deadlines" },
  { label: "Intensive", window: "4 to 7 days", accent: "Daily sessions with tighter spacing" },
  { label: "Standard", window: "8 to 30 days", accent: "Balanced rhythm for steady build-up" },
  { label: "Spaced", window: "31+ days", accent: "Long-range retention with smart timing" },
];

const launchSteps = [
  {
    title: "1. Launch where exact recall already hurts",
    body: "Start with high-stakes exam takers, performers, and speakers who already feel the pain of blanking when the words matter.",
  },
  {
    title: "2. Use short demo content, not generic ads",
    body: "Show one text becoming a deadline-based plan, then a recall session, then a word-for-word result. That is easier to understand than describing spaced practice in the abstract.",
  },
  {
    title: "3. Convert interest into a real beta list",
    body: "Point traffic to a simple waitlist with audience tagging, then invite the most urgent users first after the store submission lands.",
  },
];

const distributionChannels = [
  {
    title: "Niche communities first",
    body: "Reddit, Discord, study groups, campus communities, and performer circles are better first channels than broad paid acquisition.",
  },
  {
    title: "Core message",
    body: '"Memorize exact wording with a deadline-aware recall plan" is more concrete than saying "study smarter."',
  },
  {
    title: "Early proof to collect",
    body: "Waitlist signups, demo-to-signup conversion, and repeat practice sessions are the first signals that matter before scale.",
  },
];

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`fade-in ${visible ? "is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--fade-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-shell" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Get the app"
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function ExpoModal({
  open,
  onClose,
  platform,
}: {
  open: boolean;
  onClose: () => void;
  platform: "ios" | "android";
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header">
        <p className="eyebrow">Try the app</p>
        <h3 className="modal-title">Open the live build on your phone.</h3>
        <p className="modal-copy">
          Two steps, no account, and the QR code works in Expo Go on both iPhone and Android.
        </p>
      </div>

      <div className="modal-steps">
        <div className="modal-step modal-step-accent">
          <span className="modal-step-number">1</span>
          <div>
            <h4>Install Expo Go</h4>
            <p>
              <a href="https://apps.apple.com/app/expo-go/id982107779" target="_blank" rel="noreferrer">
                iPhone App Store
              </a>
              {" · "}
              <a
                href="https://play.google.com/store/apps/details?id=host.exp.exponent"
                target="_blank"
                rel="noreferrer"
              >
                Android Google Play
              </a>
            </p>
          </div>
        </div>

        <div className="modal-step">
          <span className="modal-step-number modal-step-number-muted">2</span>
          <div>
            <h4>Scan the code</h4>
            <p>
              {platform === "ios"
                ? "On iPhone, point the Camera app at the QR code and tap the notification."
                : 'On Android, open Expo Go and use "Scan QR code" inside the app.'}
            </p>
          </div>
        </div>
      </div>

      <div className="qr-panel">
        <QRCodeSVG value={EXPO_URL} size={184} />
      </div>
    </Modal>
  );
}

function Nav({ onTryNow }: { onTryNow: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="shell nav-inner">
        <button className="brand-mark" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Verbitra
        </button>

        <div className="nav-actions">
          <a className="nav-link" href="#process">
            How it works
          </a>
          <a className="nav-link" href="#try">
            Try it
          </a>
          <a className="nav-link" href="#launch">
            Launch plan
          </a>
          <button className="button button-primary button-small" type="button" onClick={onTryNow}>
            Get the app
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onTryNow }: { onTryNow: () => void }) {
  return (
    <section className="hero-section">
      <div className="hero-orb hero-orb-left" aria-hidden="true" />
      <div className="hero-orb hero-orb-right" aria-hidden="true" />
      <div className="shell hero-grid">
        <FadeIn className="hero-copy">
          <p className="eyebrow">Pre-launch mobile build for high-stakes recall</p>
          <h1 className="display-title">Memorize exact text.</h1>
          <p className="hero-lead">
            <strong>Remember it word for word when it matters.</strong> Paste any text, set your deadline,
            and Verbitra builds the practice plan for you.
          </p>

          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={onTryNow}>
              Try the live app
            </button>
            <a className="button button-ghost" href="#process">
              See the method
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={120} className="hero-panel">
          <div className="hero-panel-top">
            <p className="eyebrow eyebrow-soft">Why this is different</p>
            <p className="hero-panel-note">Most study tools reward recognition. Verbitra is built for exact recall under a deadline.</p>
          </div>

          <div className="hero-highlights">
            {highlights.map((item) => (
              <div key={item} className="hero-highlight-item">
                <span className="hero-highlight-dot" aria-hidden="true" />
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="hero-metric-grid">
            <div className="metric-card">
              <span className="metric-value">3</span>
              <span className="metric-label">phases to mastery</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">4</span>
              <span className="metric-label">deadline modes</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">1</span>
              <span className="metric-label">clear daily next step</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="section-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {body ? <p className="section-body">{body}</p> : null}
    </div>
  );
}

function PhoneMockup({
  title,
  eyebrow,
  points,
  delay = 0,
}: {
  title: string;
  eyebrow: string;
  points: string[];
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className="showcase-card">
      <div className="showcase-phone-shell">
        <div className="showcase-notch" aria-hidden="true" />
        <div className="showcase-screen">
          <div className="showcase-proof">
            <span className="showcase-proof-chip">{eyebrow}</span>
            <strong className="showcase-proof-title">{title}</strong>
            <div className="showcase-proof-list">
              {points.map((point) => (
                <div key={point} className="showcase-proof-item">
                  <span aria-hidden="true">•</span>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="showcase-caption">
        <p className="eyebrow eyebrow-soft">{eyebrow}</p>
        <p>{title}</p>
      </div>
    </FadeIn>
  );
}

function Screenshots() {
  return (
    <section className="section section-alt">
      <div className="shell">
        <FadeIn>
          <SectionIntro
            eyebrow="Product proof"
            title="What the live build already proves."
            body="Instead of polished mockups, this section shows the product promises already implemented in the live mobile build."
          />
        </FadeIn>

        <div className="showcase-grid">
          {productProofCards.map((screen, index) => (
            <PhoneMockup
              key={screen.title}
              title={screen.title}
              eyebrow={screen.eyebrow}
              points={screen.points}
              delay={index * 90}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Tension() {
  return (
    <section className="section">
      <div className="shell tension-grid">
        <FadeIn>
          <SectionIntro
            eyebrow="The core problem"
            title="Most people study until the text feels familiar, then discover that familiarity is not recall."
            body="Re-reading feels productive, but it often creates the illusion of knowing. Verbitra shifts the work to active recall, so you can say the words back when it matters."
          />

          <div className="editorial-quote">
            “If you have ever known it at your desk and blanked when it mattered, this is the gap the app closes.”
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="list-panel">
            <p className="eyebrow eyebrow-soft">When it matters</p>
            <div className="editorial-list">
              {moments.map((item) => (
                <div key={item} className="editorial-list-item">
                  <span aria-hidden="true">→</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section section-process" id="process">
      <div className="shell">
        <FadeIn>
          <SectionIntro
            eyebrow="How it works"
            title="Three phases, so you know the words."
            body="The app starts with the full text, removes support step by step, and adjusts the pace to your deadline."
          />
        </FadeIn>

        <div className="phase-grid">
          {phases.map((phase, index) => (
            <FadeIn key={phase.number} delay={index * 110}>
              <article className="phase-card">
                <span className="phase-number">{phase.number}</span>
                <h3>{phase.title}</h3>
                <p>{phase.body}</p>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={180}>
          <div className="mode-band">
            {modes.map((mode) => (
              <div key={mode.label} className="mode-item">
                <p className="mode-name">{mode.label}</p>
                <p className="mode-window">{mode.window}</p>
                <p className="mode-accent">{mode.accent}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function PlatformCTA({ onTryNow }: { onTryNow: (platform: "ios" | "android") => void }) {
  return (
    <section className="section section-cta" id="try">
      <div className="shell cta-grid">
        <FadeIn>
          <SectionIntro
            eyebrow="Try the app"
            title="Try the pre-launch mobile build."
            body="The live build already works in Expo Go while the Play Store submission is next. Open it on your phone, paste your text, set your deadline, and begin."
          />

          <div className="cta-actions">
            <button className="button button-primary" type="button" onClick={() => onTryNow("ios")}>
              Open on iPhone
            </button>
            <button className="button button-dark" type="button" onClick={() => onTryNow("android")}>
              Open on Android
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="cta-side-card">
            <p className="eyebrow eyebrow-soft">What you get</p>
            <ul className="benefit-list">
              <li>One destination for every text, deadline, and next practice step.</li>
              <li>Modes for urgent memorization and longer spaced retention.</li>
              <li>Guided recall activities that lead to word-for-word memory.</li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function WhoItsFor() {
  return (
    <section className="section">
      <div className="shell">
        <FadeIn>
          <SectionIntro
            eyebrow="Who it's for"
            title="For people who take their words seriously."
            body="For anyone who needs the exact words ready: exams, scripture, speeches, performances, and other high-stakes moments."
          />
        </FadeIn>

        <div className="audience-grid">
          <FadeIn className="audience-quote-stack">
            <div className="audience-quote-card">
              <p className="eyebrow eyebrow-soft">The moment</p>
              <p>
                “I do not need to sort-of remember it. I need to know it.”
              </p>
            </div>
            <div className="audience-quote-card muted">
              <p className="eyebrow eyebrow-soft">The promise</p>
              <p>
                Paste any text. Set your deadline. Remember it word for word.
              </p>
            </div>
          </FadeIn>

          <div className="persona-grid">
            {people.map((item, index) => (
              <FadeIn key={item.title} delay={index * 80}>
                <article className="persona-card">
                  <p className="eyebrow eyebrow-soft">{item.title}</p>
                  <p>{item.body}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LaunchPlan() {
  return (
    <section className="section section-alt" id="launch">
      <div className="shell">
        <FadeIn>
          <SectionIntro
            eyebrow="Go-to-market"
            title="A pre-launch distribution plan that fits the product."
            body="No fake traction, no vague virality story. The launch starts with narrow audiences that already have urgent verbatim-recall problems."
          />
        </FadeIn>

        <div className="launch-grid">
          <div className="launch-stack">
            {launchSteps.map((item, index) => (
              <FadeIn key={item.title} delay={index * 90}>
                <article className="launch-card">
                  <p className="eyebrow eyebrow-soft">Launch step</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              </FadeIn>
            ))}
          </div>

          <div className="launch-stack">
            {distributionChannels.map((item, index) => (
              <FadeIn key={item.title} delay={index * 90 + 100}>
                <article className="launch-card launch-card-muted">
                  <p className="eyebrow eyebrow-soft">Distribution detail</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onTryNow }: { onTryNow: () => void }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-copy">
          <p className="eyebrow">Submission-ready story</p>
          <h2 className="section-title">Pre-launch, not pre-product.</h2>
          <p className="section-body">
            The live build already works on mobile, the deck now tells an honest launch story, and the next milestone is a real store launch with a real waitlist behind it.
          </p>
        </div>

        <div className="footer-form-card">
          <div className="editorial-list">
            <div className="editorial-list-item">
              <span aria-hidden="true">→</span>
              <p>Live mobile build available now through Expo Go.</p>
            </div>
            <div className="editorial-list-item">
              <span aria-hidden="true">→</span>
              <p>Focused first audience: exam takers, performers, speakers, and faith communities.</p>
            </div>
            <div className="editorial-list-item">
              <span aria-hidden="true">→</span>
              <p>Next operational step: replace the placeholder launch story with a real waitlist endpoint after store submission.</p>
            </div>
          </div>
          <div className="cta-actions">
            <button className="button button-primary" type="button" onClick={onTryNow}>
              Try the live build
            </button>
            <a className="button button-ghost" href="#launch">
              View launch plan
            </a>
          </div>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© 2026 Verbitra</p>
        <p>Built for people who need the exact words.</p>
        <p>
          <a href="/privacy.html">Privacy</a>
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

  function openModal(nextPlatform: "ios" | "android" = "ios") {
    setPlatform(nextPlatform);
    setModalOpen(true);
  }

  return (
    <div className="landing-root">
      <Nav onTryNow={() => openModal("ios")} />
      <Hero onTryNow={() => openModal("ios")} />
      <Screenshots />
      <Tension />
      <HowItWorks />
      <PlatformCTA onTryNow={openModal} />
      <WhoItsFor />
      <LaunchPlan />
      <Footer onTryNow={() => openModal("ios")} />
      <ExpoModal open={modalOpen} onClose={() => setModalOpen(false)} platform={platform} />
    </div>
  );
}
