import { T, geist } from "./_tokens";
import { useEffect, useState } from "react";

export function Splash() {
  const [visible, setVisible] = useState(false);
  const [dotPhase, setDotPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotPhase((p) => (p + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: 390, height: 844,
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: geist,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 340px 340px at 50% 42%, ${T.primary}18 0%, transparent 70%)`,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 800ms ease-out",
      }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${T.primary}33, ${T.primaryDeep}66)`,
          border: `1.5px solid ${T.primary}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 32px ${T.primary}44`,
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M9 12h18M9 18h14M9 24h10" stroke={T.primary} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="28" cy="26" r="5" fill={T.primary} />
            <path d="M26 26l1.5 1.5 2.5-2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 34,
            fontWeight: 800,
            color: T.text,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: 8,
          }}>
            Verbitra
          </div>
          <div style={{
            fontSize: 13,
            color: T.primary,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: visible ? 1 : 0,
            transition: "opacity 800ms ease-out 200ms",
          }}>
            Remember word for word
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: 60,
        display: "flex",
        alignItems: "center",
        gap: 6,
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms ease-out 300ms",
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: i === dotPhase ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === dotPhase ? T.primary : T.border,
            transition: "width 300ms ease-out, background 300ms ease-out",
          }} />
        ))}
      </div>
    </div>
  );
}
