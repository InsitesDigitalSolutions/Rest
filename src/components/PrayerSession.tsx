import { useState, useEffect } from 'react';
import { X, Lock, Unlock, Music, Play, Pause, Bookmark } from 'lucide-react';
import { kjvVerse, PRAYER_WHEEL, AUDIO_MANIFEST, MEDITATE_TOPICS } from '../utils/kjv';
import { FocusAudio } from '../types';

interface PrayerSessionProps {
  startStep?: number;
  durations?: Record<string, number>;
  onClose: () => void;
  onLog?: (totalSecs: number, stepsCompletedCount: number) => void;
  audio: FocusAudio;
  onSaveVerse?: (text: string, ref: string) => void;
  styleMode?: "classic" | "symmetrical";
  subjectId?: string;
  prayerMode?: "guided" | "recharge" | "open";
  dark?: boolean;
  themeColors?: any;
}

export default function PrayerSession({
  startStep = 0,
  durations,
  onClose,
  onLog,
  audio,
  onSaveVerse,
  styleMode = "symmetrical",
  subjectId = "default",
  prayerMode = "guided",
  dark = true,
  themeColors
}: PrayerSessionProps) {
  const [stepIdx, setStepIdx] = useState(startStep);
  const isOpenEnded = prayerMode === "open";
  const isRecharge = prayerMode === "recharge";

  // Quick helper to determine initial seconds per step
  const getInitialSeconds = (idx: number) => {
    if (isOpenEnded) return 0;
    if (isRecharge) return 25; // 12 steps * 25s = 5 minutes
    return (durations?.[String(idx)] || 5) * 60;
  };

  const [secsLeft, setSecsLeft] = useState(() => getInitialSeconds(startStep));
  const [totalSecs, setTotalSecs] = useState(0);
  const [running, setRunning] = useState(true);
  const [show, setShow] = useState(true);
  const [promptIdx, setPromptIdx] = useState(0);

  const step = PRAYER_WHEEL[stepIdx];

  // Resolve scriptures for the subject/focus
  let stepRefs = step.refs;
  if (subjectId && subjectId !== "default") {
    const topic = MEDITATE_TOPICS.find(t => t.id === subjectId);
    if (topic && topic.refs && topic.refs.length > 0) {
      // Map 2 verses of the topic to each step (wrap if needed)
      const startIndex = (stepIdx * 2) % topic.refs.length;
      stepRefs = [
        topic.refs[startIndex],
        topic.refs[(startIndex + 1) % topic.refs.length]
      ];
    }
  }

  // Load ALL scriptures related to the specific active prayer focus/step
  const [versesList, setVersesList] = useState<{ref: string, text: string}[]>([]);

  useEffect(() => {
    let active = true;
    if (stepRefs && stepRefs.length > 0) {
      setShow(false);
      Promise.all(
        stepRefs.map(async (r: any) => {
          const text = await kjvVerse(r[0], r[1], r[2]);
          return {
            ref: `${r[0]} ${r[1]}:${r[2]}`,
            text: text || "…"
          };
        })
      ).then(res => {
        if (active) {
          setVersesList(res);
          setShow(true);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [stepIdx, stepRefs]);

  // total elapsed timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTotalSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // step countdown or countup
  useEffect(() => {
    if (!running) return;
    if (isOpenEnded) {
      // open-ended: count up
      const t = setTimeout(() => setSecsLeft(s => s + 1), 1000);
      return () => clearTimeout(t);
    } else {
      if (secsLeft <= 0) {
        nextStep();
        return;
      }
      const t = setTimeout(() => setSecsLeft(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [running, secsLeft, isOpenEnded]);

  // rotating micro-prompts every 20s
  useEffect(() => {
    const t = setInterval(() => setPromptIdx(i => i + 1), 20000);
    return () => clearInterval(t);
  }, [stepIdx]);

  function nextStep() {
    if (stepIdx < PRAYER_WHEEL.length - 1) {
      const ni = stepIdx + 1;
      setStepIdx(ni);
      setSecsLeft(getInitialSeconds(ni));
      setVersesList([]);
    } else {
      finish();
    }
  }

  function prevStep() {
    if (stepIdx > 0) {
      const pi = stepIdx - 1;
      setStepIdx(pi);
      setSecsLeft(getInitialSeconds(pi));
      setVersesList([]);
    }
  }

  function finish() {
    if (onLog) {
      onLog(totalSecs, stepIdx + 1);
    }
    onClose();
  }

  const mm = String(Math.floor(secsLeft / 60)).padStart(2, "0");
  const ss = String(secsLeft % 60).padStart(2, "0");
  const overallPct = Math.round((stepIdx / PRAYER_WHEEL.length) * 100);

  // Dynamic Theme Colors matching user selected theme
  const C_bg = dark 
    ? "rgba(10, 10, 10, 0.42)" 
    : "rgba(245, 243, 237, 0.52)";
  
  const C_surface = dark 
    ? "rgba(18, 18, 18, 0.4)" 
    : "rgba(255, 255, 255, 0.55)";
  
  const C_gold = themeColors?.gold || "#C5A367";
  const C_goldGlow = themeColors?.goldGlow || `${C_gold}26`;
  const C_line = themeColors?.line || (dark ? "rgba(255, 255, 255, 0.06)" : "rgba(28, 26, 22, 0.12)");
  const C_text = themeColors?.text || (dark ? "#FFFFFF" : "#1C1A16");
  const C_muted = themeColors?.muted || (dark ? "rgba(255, 255, 255, 0.45)" : "#7A756B");
  const F = "'Helvetica Neue Light', 'Helvetica Neue-Light', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  const pill = (active?: boolean) => ({
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 6,
    padding: "8px 16px",
    borderRadius: 22,
    border: `1px solid ${active ? C_gold : C_line}`,
    background: active ? C_gold + "18" : "transparent",
    color: active ? C_gold : C_muted,
    cursor: "pointer",
    fontFamily: F,
    fontSize: 12,
    transition: "all 0.2s ease"
  });

  const subjectLabel = subjectId !== "default" 
    ? MEDITATE_TOPICS.find(t => t.id === subjectId)?.name 
    : "Standard Focus";

  const activePrompt = step.prompts[promptIdx % step.prompts.length];

  // OPTION B: SYMMETRICAL FOCAL COLUMN
  if (styleMode === "symmetrical") {
    return (
      <div
        id="prayer-session-overlay-symmetrical"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 650,
          background: C_bg,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          display: "flex",
          flexDirection: "column",
          fontFamily: F,
          color: C_text,
          overflow: "hidden"
        }}
      >
        <div
          id="session-ambient-breathe-symmetrical"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 48%, ${C_goldGlow} 0%, transparent 60%)`,
            pointerEvents: "none",
            animation: "breathe 10s ease-in-out infinite"
          }}
        />

        {/* Minimal header */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
          <button
            onClick={finish}
            style={{
              background: "transparent",
              border: `1px solid ${C_line}`,
              borderRadius: 12,
              padding: "6px 14px",
              cursor: "pointer",
              color: C_muted,
              fontSize: 12,
              letterSpacing: 0.5,
              transition: "all 0.2s"
            }}
          >
            Exit Prayer
          </button>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: C_muted, fontWeight: 500 }}>
            {subjectLabel} · Step {stepIdx + 1} of 12
          </div>
          <div style={{ width: 88 }} />
        </div>

        {/* Minimal Progress Line */}
        <div style={{ position: "relative", zIndex: 2, width: "120px", height: 2, background: C_line, margin: "0 auto", borderRadius: 100, overflow: "hidden" }}>
          <div style={{ width: `${overallPct}%`, height: "100%", background: C_gold, transition: "width 0.6s" }} />
        </div>

        {/* Symmetrical Focal Column */}
        <div style={{ flex: 1, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 24px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          
          {/* Step Name */}
          <div style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: C_gold, marginBottom: 8, fontWeight: 500 }}>
            — {step.name} —
          </div>

          {/* Symmetrical Timer */}
          <div style={{ fontSize: "clamp(38px, 12vw, 68px)", fontWeight: 200, color: C_gold, letterSpacing: "0.05em", fontFamily: F, marginBottom: 20, transition: "color 0.3s" }}>
            {mm}:{ss}
          </div>

          {/* Central Scriptures Block - Showing ALL scriptures related */}
          <div style={{ minHeight: 180, width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", opacity: show ? 0.95 : 0, transition: "opacity 0.6s ease", marginBottom: 24, overflowY: "auto", maxHeight: "40%" }} className="scrolling-element">
            {versesList.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {versesList.map((v, i) => (
                  <div key={i} style={{ borderBottom: i < versesList.length - 1 ? `1px dashed ${C_line}` : "none", paddingBottom: i < versesList.length - 1 ? 12 : 0 }}>
                    <div style={{ fontSize: "clamp(15px, 2.5vw, 19px)", fontWeight: 300, lineHeight: 1.5, color: C_text, fontStyle: "italic" }}>
                      "{v.text}"
                    </div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: C_gold, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
                        — {v.ref}
                      </span>
                      {onSaveVerse && (
                        <button
                          onClick={() => onSaveVerse(v.text, v.ref)}
                          style={{ background: "transparent", border: "none", color: C_gold, opacity: 0.6, cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                          className="hover:opacity-100"
                          title="Save Scripture"
                        >
                          <Bookmark size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C_muted }}>Loading matching promises...</div>
            )}
          </div>

          {/* Encouraging Guided Prompt */}
          <div style={{ fontSize: 14, fontWeight: 300, color: C_muted, maxWidth: 460, lineHeight: 1.6, padding: "0 12px" }}>
            {activePrompt}
          </div>

        </div>

        {/* Footer Controls */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            <button onClick={prevStep} style={pill()} disabled={stepIdx === 0}>
              ‹ Previous Step
            </button>
            
            <button onClick={() => setRunning(r => !r)} style={pill(true)}>
              {running ? <Pause size={13} /> : <Play size={13} />} {running ? "Pause" : "Resume"}
            </button>
            
            <button
              onClick={() => {
                const t = AUDIO_MANIFEST[0];
                audio.track ? audio.toggle() : audio.play(t);
              }}
              style={pill(audio.playing)}
            >
              <Music size={13} /> Ambient Sound
            </button>
            
            <button onClick={nextStep} style={pill()}>
              {stepIdx === PRAYER_WHEEL.length - 1 ? "Finish" : "Next Step ›"}
            </button>
          </div>
          
          {/* Fast Switch Duration Adjustments */}
          {!isOpenEnded && (
            <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: C_muted, marginRight: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Set Duration:</span>
              {[2, 5, 10, 15].map(m => (
                <button
                  key={m}
                  onClick={() => setSecsLeft(m * 60)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: "rgba(255,255,255,0.03)",
                    color: C_muted,
                    cursor: "pointer",
                    fontFamily: F,
                    fontSize: 10,
                    transition: "all 0.15s"
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Scenic mountain silhouette background adapting to light/dark themes */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "220px",
              opacity: 0.16
            }}
          >
            <path
              d="M0,200 L180,130 L450,220 L750,120 L1080,210 L1320,130 L1440,190 L1440,320 L0,320 Z"
              fill={C_gold}
              opacity="0.35"
            />
            <path
              d="M0,234 L280,170 L600,260 L920,160 L1220,240 L1440,180 L1440,320 L0,320 Z"
              fill={dark ? "#121212" : "#E2DFD5"}
              opacity="0.8"
            />
            <path
              d="M0,270 L380,210 L750,285 L1120,195 L1440,260 L1440,320 L0,320 Z"
              fill={dark ? "#070707" : "#D4D0C5"}
            />
          </svg>
        </div>
      </div>
    );
  }

  // OPTION A: CLASSIC PRAYER PATH VIEW
  return (
    <div
      id="prayer-session-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 650,
        background: C_bg,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        display: "flex",
        flexDirection: "column",
        fontFamily: F,
        color: C_text,
        overflow: "hidden"
      }}
    >
      <div
        id="session-ambient-breathe"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 32%, ${C_goldGlow} 0%, transparent 55%)`,
          pointerEvents: "none",
          animation: "breathe 8s ease-in-out infinite"
        }}
      />
      
      {/* header */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
        <button
          onClick={finish}
          style={{
            background: "transparent",
            border: `1px solid ${C_line}`,
            borderRadius: 8,
            padding: "7px 14px",
            cursor: "pointer",
            color: C_muted,
            fontFamily: F,
            fontSize: 13,
          }}
        >
          Exit Session
        </button>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C_muted }}>
          Prayer Focus · {stepIdx + 1}/{PRAYER_WHEEL.length}
        </div>
        <div style={{ width: 78 }} />
      </div>

      {/* overall progress rail */}
      <div style={{ position: "relative", zIndex: 2, height: 3, background: C_line, margin: "0 18px", borderRadius: 100, overflow: "hidden" }}>
        <div style={{ width: `${overallPct}%`, height: "100%", background: C_gold, transition: "width 0.6s" }} />
      </div>

      {/* center content */}
      <div style={{ flex: 1, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px 28px" }}>
        <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: C_gold, marginBottom: 18 }}>
          {step.name}
        </div>
        <div style={{ fontSize: "clamp(46px, 13vw, 84px)", fontWeight: 200, color: C_gold, letterSpacing: "0.04em", marginBottom: 20 }}>
          {mm}:{ss}
        </div>
        
        {/* Central Scriptures Block - Showing ALL scriptures related */}
        <div style={{ maxWidth: 680, minHeight: 150, opacity: show ? 0.95 : 0, transition: "opacity 0.6s ease", overflowY: "auto", maxHeight: "40%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }} className="scrolling-element">
          {versesList.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {versesList.map((v, i) => (
                <div key={i} style={{ borderBottom: i < versesList.length - 1 ? `1px dashed ${C_line}` : "none", paddingBottom: i < versesList.length - 1 ? 12 : 0 }}>
                  <div style={{ fontSize: "clamp(15px, 2.5vw, 19px)", fontWeight: 300, lineHeight: 1.5, color: C_text, fontStyle: "italic" }}>
                    "{v.text}"
                  </div>
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: C_gold, letterSpacing: "0.04em", fontWeight: 500 }}>
                      — {v.ref}
                    </span>
                    {onSaveVerse && (
                      <button
                        onClick={() => onSaveVerse(v.text, v.ref)}
                        style={{ background: "transparent", border: "none", color: C_gold, opacity: 0.6, cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                        className="hover:opacity-100"
                        title="Save Scripture"
                      >
                        <Bookmark size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C_muted }}>Loading scripture promises...</div>
          )}
        </div>

        {/* Guided Prompt Indicator */}
        <div style={{ marginTop: 22, fontSize: 15, fontWeight: 300, color: C_muted, maxWidth: 520, lineHeight: 1.6 }}>
          {activePrompt}
        </div>
      </div>

      {/* footer controls */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 14px 26px", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={prevStep} style={pill()} disabled={stepIdx === 0}>‹ Prev Step</button>
          
          <button onClick={() => setRunning(r => !r)} style={pill(true)}>
            {running ? <Pause size={14} /> : <Play size={14} />} {running ? "Pause" : "Resume"}
          </button>
          
          <button
            onClick={() => {
              const t = AUDIO_MANIFEST[0];
              audio.track ? audio.toggle() : audio.play(t);
            }}
            style={pill(audio.playing)}
          >
            <Music size={14} /> Ambient Sound
          </button>
          
          <button onClick={nextStep} style={pill()}>Next Step ›</button>
        </div>
        
        {!isOpenEnded && (
          <div style={{ display: "flex", gap: 6 }}>
            {[5, 10, 15, 30, 60].map(m => (
              <button
                key={m}
                onClick={() => setSecsLeft(m * 60)}
                style={{
                  padding: "5px 11px",
                  borderRadius: 16,
                  border: `1px solid ${C_line}`,
                  background: "transparent",
                  color: C_muted,
                  cursor: "pointer",
                  fontFamily: F,
                  fontSize: 11
                }}
              >
                {m}m
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Scenic mountain silhouette background adapting to light/dark themes */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "220px",
            opacity: 0.16
          }}
        >
          <path
            d="M0,200 L180,130 L450,220 L750,120 L1080,210 L1320,130 L1440,190 L1440,320 L0,320 Z"
            fill={C_gold}
            opacity="0.35"
          />
          <path
            d="M0,234 L280,170 L600,260 L920,160 L1220,240 L1440,180 L1440,320 L0,320 Z"
            fill={dark ? "#121212" : "#E2DFD5"}
            opacity="0.8"
          />
          <path
            d="M0,270 L380,210 L750,285 L1120,195 L1440,260 L1440,320 L0,320 Z"
            fill={dark ? "#070707" : "#D4D0C5"}
          />
        </svg>
      </div>
    </div>
  );
}
