import { T, geist } from "./_tokens";

function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 6px", fontFamily: geist }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0" y="4" width="3" height="8" rx="1" fill={T.secondary} />
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill={T.secondary} />
          <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill={T.text} />
        </svg>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <rect x="0.5" y="0.5" width="16" height="11" rx="2" stroke={T.text} strokeWidth="1.2" />
          <rect x="16.5" y="3.5" width="2" height="5" rx="0.5" fill={T.text} />
          <rect x="2" y="2" width="11" height="8" rx="1" fill={T.text} />
        </svg>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 20px", marginBottom: 6, marginTop: 16 }}>
      {label}
    </div>
  );
}

function SettingRow({
  label, value, valueColor, action, destructive, showChevron = true,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  action?: string;
  destructive?: boolean;
  showChevron?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 20px",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <span style={{ fontSize: 14, color: destructive ? T.wrong : T.text, fontFamily: geist }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {value && (
          <span style={{ fontSize: 14, color: valueColor || T.secondary, fontFamily: geist }}>{value}</span>
        )}
        {action && (
          <span style={{ fontSize: 13, color: T.primary, fontFamily: geist, fontWeight: 600 }}>{action}</span>
        )}
        {showChevron && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke={T.tertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, on }: { label: string; description?: string; on: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 20px",
      borderBottom: `1px solid ${T.border}`,
      gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 14, color: T.text, fontFamily: geist, marginBottom: description ? 2 : 0 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: T.tertiary, fontFamily: geist }}>{description}</div>}
      </div>
      <div style={{
        width: 44, height: 26, borderRadius: 13,
        background: on ? T.primary : T.surface2,
        border: `1px solid ${on ? T.primary : T.border}`,
        position: "relative", flexShrink: 0,
        transition: "background 0.2s",
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 10,
          background: "#fff",
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }} />
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <StatusBar />

      <div style={{ padding: "10px 20px 14px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.03em" }}>Settings</h1>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <SectionHeader label="Account" />
        <div style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
          <SettingRow label="Signed in as" value="alex@example.com" valueColor={T.secondary} showChevron={false} />
          <SettingRow label="Sign out" destructive showChevron={false} action="Sign out" />
        </div>

        <SectionHeader label="Notifications" />
        <div style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
          <ToggleRow label="Daily reminder" description="Get a nudge when a session is due" on={true} />
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: T.text }}>Reminder time</span>
              <span style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>9:00 AM</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
              {["7 AM", "8 AM", "9 AM", "12 PM", "6 PM", "9 PM"].map((t) => (
                <button key={t} style={{
                  flex: 1,
                  padding: "7px 4px",
                  borderRadius: 8,
                  border: t === "9 AM" ? `1.5px solid ${T.primary}` : `1px solid ${T.border}`,
                  background: t === "9 AM" ? T.primary + "22" : T.surface2,
                  color: t === "9 AM" ? T.primary : T.secondary,
                  fontFamily: geist,
                  fontSize: 11,
                  fontWeight: t === "9 AM" ? 700 : 400,
                  cursor: "pointer",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SectionHeader label="Study preferences" />
        <div style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
          <ToggleRow label="Auto-advance to next session" on={false} />
          <ToggleRow label="Haptic feedback" on={true} />
        </div>

        <SectionHeader label="About" />
        <div style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
          <SettingRow label="Privacy policy" showChevron />
          <SettingRow label="Terms of service" showChevron />
          <SettingRow label="Rate Verbitra" showChevron />
        </div>

        <div style={{ padding: "24px 20px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: T.tertiary }}>Verbitra · Version 1.0.0 (build 42)</div>
          <div style={{ fontSize: 11, color: T.border, marginTop: 4 }}>© 2026 Verbitra</div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 0 24px", display: "flex", justifyContent: "space-around" }}>
        {[
          { icon: "⊞", label: "Home", active: false },
          { icon: "+", label: "Add", active: false, primary: true },
          { icon: "◎", label: "Settings", active: true },
        ].map(({ icon, label, active, primary }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {primary ? (
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -12 }}>
                <span style={{ fontSize: 22, color: "#fff", fontWeight: 300 }}>+</span>
              </div>
            ) : (
              <span style={{ fontSize: 22, color: active ? T.primary : T.tertiary }}>{icon}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 500, color: active ? T.primary : T.tertiary, fontFamily: geist }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
