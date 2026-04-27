import { useState } from "react";
import { T, geist } from "./_tokens";
import { DataProvider, useData, calcDeadlineMode } from "./data";

const TODAY_STR = "2026-04-27";
const TODAY_DISPLAY = "Apr 27";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function buildCalendarWeeks(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function DeadlineContent() {
  const { addText } = useData();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4);
  const [selectedDay, setSelectedDay] = useState<number | null>(10);
  const [saved, setSaved] = useState(false);

  const weeks = buildCalendarWeeks(year, month);

  const deadlineStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  const plan = deadlineStr ? calcDeadlineMode(TODAY_STR, deadlineStr, 50) : null;
  const daysUntil = plan?.daysUntil ?? 0;

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  function handleStart() {
    if (!deadlineStr || !plan) return;
    addText(
      "You have the right to remain silent. Anything you say can and will be used against you in a court of law. You have the right to an attorney. If you cannot afford an attorney, one will be appointed for you.",
      deadlineStr,
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const phaseLabels = plan
    ? plan.mode === "spaced"
      ? [
          { label: "Read & listen", days: `Days 1–${Math.ceil(plan.sessionCount / 3)}` },
          { label: "Type from memory", days: `Days ${Math.ceil(plan.sessionCount / 3) + 1}–${Math.ceil(plan.sessionCount * 2 / 3)}` },
          { label: "Recall unaided", days: `Days ${Math.ceil(plan.sessionCount * 2 / 3) + 1}–${plan.sessionCount}` },
        ]
      : [
          { label: "Intensive review", days: `Days 1–${plan.sessionCount}` },
          { label: "Type from memory", days: "All sessions" },
          { label: "Recall unaided", days: "Final session" },
        ]
    : [];

  return (
    <div style={{ width: 390, height: 844, background: T.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: geist }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "52px 20px 6px" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>9:41</span>
      </div>

      <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <button style={{ background: "none", border: "none", color: T.secondary, cursor: "pointer", fontSize: 24 }}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>Set your deadline</div>
          <div style={{ fontSize: 12, color: T.tertiary }}>When do you need to know this?</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 20px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{MONTH_NAMES[month]} {year}</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={prevMonth} style={{ background: "none", border: "none", color: T.secondary, cursor: "pointer", fontSize: 18 }}>‹</button>
              <button onClick={nextMonth} style={{ background: "none", border: "none", color: T.text, cursor: "pointer", fontSize: 18 }}>›</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: T.tertiary, padding: "4px 0", letterSpacing: "0.04em" }}>{d}</div>
            ))}
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                const isSelected = day === selectedDay;
                const isPast = day !== null && `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` <= TODAY_STR;
                return (
                  <div
                    key={`${wi}-${di}`}
                    onClick={() => day && !isPast && setSelectedDay(day)}
                    style={{
                      textAlign: "center", padding: "7px 0", borderRadius: 8,
                      background: isSelected ? T.primary : "transparent",
                      cursor: day && !isPast ? "pointer" : "default",
                      opacity: isPast ? 0.3 : 1,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 400, color: !day ? "transparent" : isSelected ? "#fff" : T.text }}>
                      {day ?? ""}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {deadlineStr && (
            <div style={{ marginTop: 10, padding: "6px 10px", background: T.surface2, borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: plan?.modeColor ?? T.tertiary }} />
              <span style={{ fontSize: 11, color: T.tertiary }}>
                Today is {TODAY_DISPLAY} · {MONTH_NAMES[month]} {selectedDay} is {daysUntil} day{daysUntil !== 1 ? "s" : ""} away
              </span>
            </div>
          )}
        </div>

        {plan && (
          <div style={{ background: T.surface, border: `1.5px solid ${plan.modeColor}44`, borderRadius: 16, padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.tertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Your study plan</div>
              <div style={{ background: plan.modeColor + "22", border: `1px solid ${plan.modeColor}44`, borderRadius: 6, padding: "2px 8px" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: plan.modeColor }}>{plan.modeLabel}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, background: T.surface2, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: "-0.03em" }}>{plan.sessionCount}</div>
                <div style={{ fontSize: 12, color: T.secondary, marginTop: 3 }}>sessions total</div>
                <div style={{ fontSize: 11, color: T.tertiary, marginTop: 1 }}>
                  {plan.mode === "spaced" ? "spaced intervals" : "one per day"}
                </div>
              </div>
              <div style={{ flex: 1, background: T.surface2, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: "-0.03em" }}>{plan.minsPerSession}</div>
                <div style={{ fontSize: 12, color: T.secondary, marginTop: 3 }}>minutes each</div>
                <div style={{ fontSize: 11, color: T.tertiary, marginTop: 1 }}>per session</div>
              </div>
            </div>

            <div style={{ background: plan.modeColor + "12", border: `1px solid ${plan.modeColor}33`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{plan.modeDesc}</div>
            </div>

            {phaseLabels.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: i === 0 ? "35%" : "0%", background: T.primary, borderRadius: 3 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {phaseLabels.map(({ label, days }) => (
                    <div key={label} style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: T.secondary }}>{label}</div>
                      <div style={{ fontSize: 10, color: T.tertiary }}>{days}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!plan}
          style={{
            background: plan ? (saved ? T.correct : T.primary) : T.border,
            border: "none", borderRadius: 14, padding: "16px",
            color: plan ? "#fff" : T.tertiary, fontFamily: geist, fontSize: 16, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: plan ? "pointer" : "default", transition: "background 0.2s",
          }}
        >
          {saved ? "Saved ✓" : (plan ? "Start →" : "Pick a deadline date")}
        </button>
      </div>
    </div>
  );
}

export function Deadline() {
  return (
    <DataProvider>
      <DeadlineContent />
    </DataProvider>
  );
}
