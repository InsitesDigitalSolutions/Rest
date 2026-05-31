import React, { useState, useEffect } from 'react';
import { AppState } from '../types';

interface FastingViewProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  card: Record<string, any>;
  sectionLabel: Record<string, any>;
  mut: string;
  fg: string;
  brd: string;
  showToast: (msg: string) => void;
}

export default function FastingView({
  state,
  setState,
  card,
  sectionLabel,
  mut,
  fg,
  brd,
  showToast
}: FastingViewProps) {
  const active = state.fast || null;
  const [type, setType] = useState("Intermittent");
  const [hours, setHours] = useState(16);
  const [focus, setFocus] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);

  const history = state.fastHistory || [];
  const types = ["Water", "Daniel", "Intermittent", "Partial", "Custom"];

  function start() {
    setState(s => ({
      ...s,
      fast: {
        id: Date.now(),
        type,
        start: new Date().toISOString(),
        startTs: Date.now(), // cache for easy calc
        targetHrs: hours,
        focus,
        checkins: []
      } as any
    }));
    showToast("Fast started");
  }

  function checkin(kind: string) {
    if (!active) return;
    setState(s => {
      const currentFast = s.fast;
      if (!currentFast) return s;
      return {
        ...s,
        fast: {
          ...currentFast,
          checkins: [
            { kind, ts: Date.now() },
            ...(currentFast.checkins || [])
          ]
        }
      };
    });
    showToast(kind + " logged");
  }

  function end(completed: boolean) {
    if (!active) return;
    setState(s => {
      const f = s.fast;
      if (!f) return s;
      const startTs = (f as any).startTs || new Date(f.start).getTime();
      const rec = {
        ...f,
        end: new Date().toISOString(),
        endTs: Date.now(),
        startTs,
        completed
      };
      return {
        ...s,
        fast: null,
        fastHistory: [rec as any, ...(s.fastHistory || [])]
      };
    });
    showToast("Fast ended");
  }

  const startTimestamp = active ? ((active as any).startTs || new Date(active.start).getTime()) : 0;
  const elapsed = active ? Math.floor((now - startTimestamp) / 1000) : 0;
  const eh = Math.floor(elapsed / 3600);
  const em = Math.floor((elapsed % 3600) / 60);
  const es = elapsed % 60;
  const targetHrs = active ? ((active as any).targetHrs || 16) : 16;
  const pctF = active ? Math.min(100, (elapsed / (targetHrs * 3600)) * 100) : 0;

  const totalHrs = history.reduce((acc, f) => {
    const sTime = (f as any).startTs || new Date(f.start).getTime();
    const eTime = (f as any).endTs || (f.end ? new Date(f.end).getTime() : sTime);
    return acc + (eTime - sTime) / 3600000;
  }, 0);

  const C_gold = "var(--theme-gold, #C5A367)";
  const F = "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif";

  const goldBtnStyle = {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: "11px 18px",
    background: C_gold,
    border: "none",
    borderRadius: 10,
    color: "#0A0A0C",
    fontFamily: F,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer"
  };

  const ghostBtnStyle = (borderCol: string, textCol: string) => ({
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: "11px 18px",
    background: "transparent",
    border: `1px solid ${borderCol}`,
    borderRadius: 10,
    color: textCol,
    fontFamily: F,
    fontSize: 14,
    cursor: "pointer"
  });

  return (
    <div id="fasting-view">
      <div style={sectionLabel}>Fasting</div>
      {active ? (
        <>
          <div style={{ ...card, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C_gold, marginBottom: 8 }}>
              {active.type} Fast
            </div>
            <div style={{ fontSize: "clamp(36px,10vw,56px)", fontWeight: 200, color: fg }}>
              {String(eh).padStart(2, "0")}:{String(em).padStart(2, "0")}:{String(es).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 12, color: mut, marginTop: 4 }}>of {targetHrs}h goal</div>
            <div style={{ height: 4, background: brd, borderRadius: 100, marginTop: 14, overflow: "hidden" }}>
              <div style={{ width: `${pctF}%`, height: "100%", background: C_gold }} />
            </div>
            {(active as any).focus && (
              <div style={{ marginTop: 14, fontSize: 13, color: mut }}>
                "{(active as any).focus}"
              </div>
            )}
          </div>
          
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {["Check-in", "Struggle", "Prayer focus", "Scripture"].map(k => (
              <button key={k} onClick={() => checkin(k)} style={ghostBtnStyle(brd, fg)}>
                {k}
              </button>
            ))}
          </div>
          
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => end(true)} style={goldBtnStyle}>Complete Fast</button>
            <button onClick={() => end(false)} style={ghostBtnStyle(brd, fg)}>End Early</button>
          </div>
          
          {(active as any).checkins?.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={sectionLabel}>Check-ins</div>
              {(active as any).checkins.map((c: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px", borderBottom: `1px solid ${brd}`, fontSize: 13 }}>
                  <span style={{ color: fg }}>{c.kind}</span>
                  <span style={{ color: mut }}>{new Date(c.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: mut, marginBottom: 10 }}>Type of fast</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: "6px 13px",
                    borderRadius: 16,
                    border: `1px solid ${type === t ? C_gold : brd}`,
                    background: type === t ? C_gold + "18" : "transparent",
                    color: type === t ? C_gold : mut,
                    cursor: "pointer",
                    fontFamily: F,
                    fontSize: 12
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: mut, marginBottom: 8 }}>Goal: {hours} hours</div>
            <input
              type="range"
              min="1"
              max="72"
              value={hours}
              onChange={e => setHours(+e.target.value)}
              style={{ width: "100%", accentColor: C_gold, marginBottom: 16 }}
            />
            <input
              value={focus}
              onChange={e => setFocus(e.target.value)}
              placeholder="Prayer focus (optional)"
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "transparent",
                border: `1px solid ${brd}`,
                borderRadius: 10,
                color: fg,
                fontFamily: F,
                fontSize: 14,
                boxSizing: "border-box" as const,
                marginBottom: 14
              }}
            />
            <button onClick={start} style={{ ...goldBtnStyle, width: "100%", justifyContent: "center" }}>Start Fast</button>
          </div>
          
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 200, color: C_gold }}>{history.length}</div>
                <div style={{ fontSize: 11, color: mut }}>Fasts</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 200, color: C_gold }}>{totalHrs.toFixed(1)}</div>
                <div style={{ fontSize: 11, color: mut }}>Total Hrs</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 200, color: C_gold }}>
                  {history.length ? (totalHrs / history.length).toFixed(1) : 0}
                </div>
                <div style={{ fontSize: 11, color: mut }}>Avg Hrs</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#55565E", lineHeight: 1.6, textAlign: "center" }}>
            Consult a professional if you have health concerns; listen to your body.
          </div>
        </>
      )}
    </div>
  );
}
