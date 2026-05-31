import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { PLAN_PRESETS } from '../utils/kjv';

interface PlanPickerProps {
  onChoose: (preset: any, customDays: number | null, customEndDate?: string) => void;
  onClose: (() => void) | null;
  dark?: boolean;
}

export default function PlanPicker({ onChoose, onClose, dark }: PlanPickerProps) {
  const [custom, setCustom] = useState(120);
  const [mode, setMode] = useState<"template" | "enddate">("template"); // template | enddate
  const [scopeId, setScopeId] = useState("365");
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  });

  const C_gold = "var(--theme-gold, #C5A367)";
  const C_bg_dark = "#0A0A0A";
  const C_bg_light = "#F7F6F2";
  const C_surface_dark = "#121212";
  const C_surface_light = "#FFFFFF";
  const C_line_dark = "rgba(255, 255, 255, 0.08)";
  const C_line_light = "#E1DFD9";

  const surf = dark ? C_surface_dark : C_surface_light;
  const fg = dark ? "#F4F2EC" : "#1C1A16";
  const mut = dark ? "#8A8A93" : "#7A756B";
  const brd = dark ? C_line_dark : C_line_light;
  const bg = dark ? C_bg_dark : C_bg_light;

  const chosen = PLAN_PRESETS.find(p => p.id === scopeId) || PLAN_PRESETS[2];
  const today = new Date().toISOString().split("T")[0];
  const F = "'Helvetica Neue Light', 'Helvetica Neue-Light', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  const goldBtn = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 18px",
    background: C_gold,
    border: "none",
    borderRadius: 10,
    color: dark ? C_bg_dark : "#1C1A16",
    fontFamily: F,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer"
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 700,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}
      onClick={onClose || (() => {})}
    >
      <div
        style={{
          background: bg,
          border: `1px solid ${brd}`,
          borderRadius: 20,
          padding: "28px 22px",
          maxWidth: 440,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: F,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: fg }}>Choose Your Plan</div>
          {onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: mut, padding: 4 }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", border: `1px solid ${brd}`, borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
          {(["template", "enddate"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                cursor: "pointer",
                fontFamily: F,
                fontSize: 13,
                background: mode === m ? C_gold : "transparent",
                color: mode === m ? C_bg_dark : mut,
                transition: "background 0.2s, color 0.2s"
              }}
            >
              {m === "template" ? "By Plan" : "By End Date"}
            </button>
          ))}
        </div>

        {mode === "template" ? (
          <>
            {PLAN_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => onChoose(p, p.id === "custom" ? custom : null)}
                style={{
                  width: "100%",
                  padding: "15px 16px",
                  marginBottom: 8,
                  borderRadius: 12,
                  background: surf,
                  border: `1px solid ${brd}`,
                  cursor: "pointer",
                  textAlign: "left",
                  color: fg,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: mut, marginTop: 2 }}>
                    {p.id === "custom" ? `${custom} days` : `${p.days} days`}
                  </div>
                </div>
                <span style={{ color: C_gold }}>
                  <ChevronRight size={18} />
                </span>
              </button>
            ))}
            <div style={{ marginTop: 8, padding: "12px 16px", background: surf, border: `1px solid ${brd}`, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: mut, marginBottom: 8 }}>Custom length (days)</div>
              <input
                type="range"
                min="30"
                max="730"
                value={custom}
                onChange={e => setCustom(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: C_gold }}
              />
              <div style={{ textAlign: "center", color: C_gold, fontSize: 14, marginTop: 4 }}>{custom} days</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: mut, marginBottom: 14, lineHeight: 1.5 }}>
              Pick what to read and the date you want to finish — we'll calculate the daily pace.
            </div>
            <div style={{ fontSize: 12, color: mut, marginBottom: 8, fontWeight: 500 }}>Reading scope</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {PLAN_PRESETS.filter(p => p.id !== "custom").map(p => (
                <button
                  key={p.id}
                  onClick={() => setScopeId(p.id)}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 16,
                    border: `1px solid ${scopeId === p.id ? C_gold : brd}`,
                    background: scopeId === p.id ? C_gold + "18" : "transparent",
                    color: scopeId === p.id ? C_gold : mut,
                    cursor: "pointer",
                    fontFamily: F,
                    fontSize: 12,
                    transition: "all 0.2s"
                  }}
                >
                  {p.name.replace(" Plan", "")}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: mut, marginBottom: 8, fontWeight: 500 }}>Finish by</div>
            <input
              type="date"
              value={endDate}
              min={today}
              onChange={e => setEndDate(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: surf,
                border: `1px solid ${brd}`,
                borderRadius: 10,
                color: fg,
                fontFamily: F,
                fontSize: 15,
                boxSizing: "border-box",
                marginBottom: 18
              }}
            />
            <button onClick={() => onChoose(chosen, null, endDate)} style={goldBtn}>
              Create Plan
            </button>
          </>
        )}
      </div>
    </div>
  );
}
export type { PlanPickerProps };
