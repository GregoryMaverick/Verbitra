import { useEffect } from "react";
import { Link } from "wouter";

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="legal-section">
      <h2 className="legal-h2">{title}</h2>
      <div className="legal-prose">{children}</div>
    </section>
  );
}

export default function Privacy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="landing-root legal-root">
      <header className="site-nav is-scrolled">
        <div className="shell nav-inner">
          <Link className="brand-mark" href="/">
            Verbitra
          </Link>
          <div className="nav-actions">
            <Link className="nav-link" href="/">
              Home
            </Link>
            <a className="button button-dark button-small" href="/">
              Back
            </a>
          </div>
        </div>
      </header>

      <main className="legal-main">
        <section className="section legal-hero">
          <div className="shell">
            <p className="eyebrow">Legal</p>
            <h1 className="display-title legal-title">Privacy Policy</h1>
            <p className="section-body legal-updated">
              <strong>Last updated:</strong> May 1, 2026
            </p>
          </div>
        </section>

        <section className="section legal-body">
          <div className="shell legal-shell">
            <div className="legal-card">
              <p className="legal-lede">
                This Privacy Policy describes how Verbitra ("we", "us", or "our") collects, uses, and protects
                information when you use the Verbitra mobile application (the "App") and the related backend service
                hosted at{" "}
                <a href="https://verbitra-api.onrender.com" target="_blank" rel="noreferrer">
                  https://verbitra-api.onrender.com
                </a>{" "}
                (the "Service").
              </p>
              <p className="legal-lede">
                By using the App, you agree to the collection and use of information in accordance with this policy. If
                you do not agree with this policy, please do not use the App.
              </p>

              <div className="legal-divider" />

              <LegalSection title="1. Information We Collect">
                <h3 className="legal-h3">1.1 Information you provide directly</h3>
                <ul>
                  <li>
                    <strong>Photos and images you capture or upload.</strong> When you use the App's optical character
                    recognition (OCR) feature, you photograph or select images containing text. These images are
                    processed <strong>entirely on your device</strong> using Tesseract.js — they are never uploaded to our servers.
                    Only the extracted text is used within the App.
                  </li>
                  <li>
                    <strong>Text content.</strong> Words, sentences, flashcards, notes, and other study material you
                    create or import inside the App.
                  </li>
                  <li>
                    <strong>Account information (if and when sign-in is available).</strong> If you create an account in
                    a future version of the App, we will collect your email address. We will update this Policy at that
                    time and notify users in the App.
                  </li>
                </ul>

                <h3 className="legal-h3">1.2 Information collected automatically</h3>
                <ul>
                  <li>
                    <strong>Device and technical data.</strong> We collect basic technical information needed to operate
                    the App, such as your device type, operating system version, App version, language, and a randomly
                    generated device or installation identifier. This is used to deliver the Service and to diagnose
                    problems.
                  </li>
                  <li>
                    <strong>Usage and diagnostic data.</strong> We collect anonymous information about how features are
                    used and about crashes or errors so we can fix bugs and improve performance. This data is not tied
                    to your real-world identity.
                  </li>
                  <li>
                    <strong>Log data.</strong> Our Service logs requests it receives, including IP address, timestamp,
                    and the API endpoint called. Logs are kept for a short period for security and debugging purposes.
                  </li>
                </ul>

                <h3 className="legal-h3">1.3 Information we do not collect</h3>
                <ul>
                  <li>We do not collect your precise location.</li>
                  <li>We do not collect contacts, calendar, microphone audio, or SMS data.</li>
                  <li>
                    We do not collect financial information. Any in-app purchases are processed by Google Play and/or
                    RevenueCat and are governed by their respective privacy policies.
                  </li>
                  <li>We do not knowingly collect data from children under 13.</li>
                </ul>
              </LegalSection>

              <LegalSection title="2. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide the App's core features, including OCR text extraction and study tools.</li>
                  <li>Operate, maintain, and improve the Service.</li>
                  <li>Diagnose technical problems and prevent abuse, fraud, and security incidents.</li>
                  <li>
                    Communicate with you about important changes to the Service (only if you have provided contact
                    details).
                  </li>
                </ul>
                <p>
                  We do <strong>not</strong> use your data for advertising or for training third-party AI models without
                  your consent.
                </p>
              </LegalSection>

              <LegalSection title="3. How We Share Your Information">
                <p>We share your information only with the following categories of recipients, and only as needed to operate the App:</p>
                <ul>
                  <li>
                    <strong>Hosting and infrastructure providers</strong> (such as Render and Supabase) which store and
                    serve the data described above on our behalf.
                  </li>
                  <li>
                    <strong>AI service providers</strong> (such as Google Gemini) that process text you submit to generate
                    mnemonics, acronyms, and study aids. Only text content is sent — never images.
                  </li>
                  <li>
                    <strong>Crash and analytics providers</strong>, if integrated, which receive anonymous diagnostic
                    information.
                  </li>
                  <li>
                    <strong>Payment and subscription providers</strong> (Google Play and, if used, RevenueCat) which
                    process purchases. We do not receive your full payment details.
                  </li>
                  <li>
                    <strong>Legal and safety recipients</strong>, where required by applicable law, legal process, or to
                    protect the rights, property, or safety of users or the public.
                  </li>
                </ul>
                <p>We do not sell your personal information.</p>
              </LegalSection>

              <LegalSection title="4. Data Retention">
                <ul>
                  <li>
                    Images captured for OCR are processed entirely on your device and are never uploaded to our
                    servers. They remain in your device's temporary memory only during the OCR process.
                  </li>
                  <li>
                    Text content you create in the App is retained while your installation is active so the App can show
                    it back to you.
                  </li>
                  <li>Diagnostic logs are retained for a short, rolling window (typically 30 days or less).</li>
                </ul>
                <p>
                  You can remove all locally stored content by uninstalling the App. To request deletion of any data we
                  hold on our Service, contact us using the address below.
                </p>
              </LegalSection>

              <LegalSection title="5. Data Security">
                <p>We use industry-standard practices to protect your information:</p>
                <ul>
                  <li>All traffic between the App and our Service is encrypted in transit using HTTPS/TLS.</li>
                  <li>Data stored on our infrastructure providers is protected by their security controls.</li>
                  <li>Access to production systems is limited to the people who need it to operate the Service.</li>
                </ul>
                <p>
                  No method of transmission or storage is 100% secure. We cannot guarantee absolute security, but we
                  work to protect your information using reasonable safeguards.
                </p>
              </LegalSection>

              <LegalSection title="6. Your Rights">
                <p>Depending on where you live, you may have the right to:</p>
                <ul>
                  <li>Access the personal information we hold about you.</li>
                  <li>Correct inaccurate personal information.</li>
                  <li>Request deletion of your personal information.</li>
                  <li>Object to or restrict certain processing.</li>
                  <li>Withdraw consent at any time, where processing is based on consent.</li>
                </ul>
                <p>
                  To exercise any of these rights, email us at the address in Section 9. We will respond within a
                  reasonable time and as required by applicable law.
                </p>
              </LegalSection>

              <LegalSection title="7. Children's Privacy">
                <p>
                  The App is not directed to children under 13, and we do not knowingly collect personal information from
                  children under 13. If you believe a child has provided us with personal information, please contact us
                  and we will delete it.
                </p>
              </LegalSection>

              <LegalSection title="8. International Users">
                <p>
                  The App and Service are operated from the United States. If you use the App from outside the United
                  States, your information may be transferred to, stored, and processed in the United States or other
                  countries where our service providers operate. By using the App you consent to such transfers.
                </p>
              </LegalSection>

              <LegalSection title="9. Contact Us">
                <p>If you have any questions or requests about this Privacy Policy or your data, contact us at:</p>
                <p>
                  <strong>Verbitra</strong>
                  <br />
                  Email:{" "}
                  <a href="mailto:ideasandbets@gmail.com" rel="noreferrer">
                    ideasandbets@gmail.com
                  </a>
                </p>
              </LegalSection>

              <LegalSection title="10. Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. When we do, we will update the "Last updated"
                  date at the top of this page. Material changes will be communicated through the App or our website.
                  Your continued use of the App after a change becomes effective means you accept the updated policy.
                </p>
              </LegalSection>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer legal-footer">
        <div className="shell footer-bottom">
          <p>© 2026 Verbitra</p>
          <p>Privacy policy</p>
          <p>
            <Link href="/">Home</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

