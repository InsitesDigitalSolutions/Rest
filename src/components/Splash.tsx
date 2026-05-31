import { useState, useEffect } from 'react';

interface SplashProps {
  onDone: () => void;
}

export default function Splash({ onDone }: SplashProps) {
  const [phase, setPhase] = useState(0); // 0 glow, 1 come, 2 line, 3 rest, 4 fade

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 1600),
      setTimeout(() => setPhase(2), 3400),
      setTimeout(() => setPhase(3), 4600),
      setTimeout(() => setPhase(4), 7200),
      setTimeout(() => onDone(), 8000),
    ];
    return () => t.forEach(clearTimeout);
  }, [onDone]);

  const bg = "#0A0A0A";
  const text = "#FFFFFF";
  const muted = "rgba(255, 255, 255, 0.55)";
  const gold = "#C5A367";
  const goldGlow = "rgba(197, 163, 103, 0.18)";
  const BRAND = "REST";
  const TAGLINE = "Find Rest in Him";
  const F_thin = "'Helvetica Neue Thin', 'Helvetica Neue-Thin', 'Helvetica Neue-Ultralight', 'Helvetica Neue Ultralight', 'Helvetica Neue', Arial, sans-serif";
  const F = "'Helvetica Neue Light', 'Helvetica Neue-Light', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  return (
    <div
      onClick={onDone}
      id="splash-screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        opacity: phase === 4 ? 0 : 1,
        transition: "opacity 0.8s ease",
        overflow: "hidden",
        fontFamily: F
      }}
    >
      {/* glow */}
      <div
        id="splash-glow"
        style={{
          position: "absolute",
          width: "min(80vw, 520px)",
          height: "min(80vw, 520px)",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(197, 163, 103, 0.45) 0%, rgba(197, 163, 103, 0.12) 30%, transparent 65%)`,
          opacity: phase === 0 ? 1 : phase === 1 ? 0.5 : 0.18,
          transform: `scale(${phase === 0 ? 1 : 1.25})`,
          transition: "opacity 2s ease, transform 4s ease"
        }}
      />
      
      {/* phase 1: come unto me */}
      <div
        id="splash-phase-1"
        style={{
          position: "absolute",
          textAlign: "center",
          opacity: phase === 1 ? 1 : 0,
          transition: "opacity 1.2s ease"
        }}
      >
        <div style={{ fontSize: "clamp(26px, 6vw, 40px)", fontWeight: 300, color: text, letterSpacing: "0.01em", fontFamily: F }}>
          Come unto me.
        </div>
        <div style={{ width: 34, height: 1, background: gold, margin: "22px auto 0", opacity: 0.7 }} />
      </div>

      {/* phase 2: line */}
      <div
        id="splash-phase-2"
        style={{
          position: "absolute",
          width: "70%",
          maxWidth: 520,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${gold}, transparent)`,
          opacity: phase === 2 ? 1 : 0,
          boxShadow: `0 0 18px 2px ${goldGlow}`,
          transform: `scaleX(${phase >= 2 ? 1 : 0.2})`,
          transition: "opacity 0.8s ease, transform 1s ease"
        }}
      />

      {/* phase 3+: REST */}
      <div
        id="splash-phase-3"
        style={{
          position: "absolute",
          textAlign: "center",
          opacity: phase >= 3 ? 1 : 0,
          transition: "opacity 1.4s ease"
        }}
      >
        <div style={{ fontSize: "clamp(48px, 12vw, 84px)", fontWeight: "100", color: gold, letterSpacing: "0.15em", paddingLeft: "0.15em", fontFamily: F_thin }}>
          {BRAND.toUpperCase()}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: "clamp(12px, 3vw, 15px)",
            fontWeight: 300,
            color: muted,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 1.4s ease 0.6s"
          }}
        >
          {TAGLINE}
        </div>
      </div>
    </div>
  );
}
