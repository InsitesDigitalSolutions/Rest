import { X, Play, Pause } from 'lucide-react';
import { FocusAudio } from '../types';
import { AUDIO_MANIFEST } from '../utils/kjv';

interface FocusAudioPanelProps {
  audio: FocusAudio;
  onClose: () => void;
  dark?: boolean;
}

export default function FocusAudioPanel({ audio, onClose, dark }: FocusAudioPanelProps) {
  const C_gold = "var(--theme-gold, #C5A367)";
  const C_surface = "#121212";
  const C_text = "#FFFFFF";
  const C_muted = "rgba(255, 255, 255, 0.52)";
  const C_line = "rgba(255, 255, 255, 0.08)";
  const F = "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif";

  const bg = dark ? C_surface : "#FFFFFF";
  const fg = dark ? C_text : "#1C1A16";
  const mut = dark ? C_muted : "#7A756B";
  const brd = dark ? C_line : "#E2DCCF";

  const cats = Array.from(new Set(AUDIO_MANIFEST.map(t => t.cat)));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 450,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bg,
          borderRadius: "16px 16px 0 0",
          padding: "20px 16px 32px",
          width: "100%",
          maxWidth: 600,
          maxHeight: "72vh",
          overflowY: "auto",
          fontFamily: F
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontWeight: 500, fontSize: 17, color: fg }}>Focus Music</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: mut, padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ fontSize: 12, color: mut, marginBottom: 18, lineHeight: 1.5 }}>
          Instrumental only. Plays in the background. Volume lowers automatically while Scripture is read aloud.
        </div>
        
        {cats.map(cat => (
          <div key={cat} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C_gold, marginBottom: 10, fontWeight: 500 }}>
              {cat}
            </div>
            {AUDIO_MANIFEST.filter(t => t.cat === cat).map(t => {
              const active = audio.track?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (active) {
                      audio.toggle();
                    } else {
                      audio.play(t);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    marginBottom: 8,
                    borderRadius: 12,
                    background: active ? C_gold + "18" : "transparent",
                    border: `1px solid ${active ? C_gold : brd}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    color: fg
                  }}
                >
                  <span style={{ color: active && audio.playing ? C_gold : mut, flexShrink: 0 }}>
                    {active && audio.playing ? <Pause size={16} /> : <Play size={16} />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 15, color: active ? C_gold : fg }}>{t.title}</div>
                    <div style={{ color: mut, fontSize: 12, marginTop: 2 }}>
                      {t.cat}
                      {t.gen ? " · Built-in ambient" : ""}
                    </div>
                  </div>
                  {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: audio.playing ? C_gold : mut, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        ))}
        
        {audio.track && (
          <div style={{ borderTop: `1px solid ${brd}`, paddingTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: mut, flexShrink: 0 }}>Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={audio.volume}
              onChange={e => audio.setVol(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: C_gold }}
            />
            <button
              onClick={() => {
                audio.stop();
              }}
              style={{
                background: "transparent",
                border: `1px solid ${brd}`,
                borderRadius: 8,
                padding: "7px 12px",
                cursor: "pointer",
                color: mut,
                fontFamily: F,
                fontSize: 12,
                flexShrink: 0
              }}
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export type { FocusAudioPanelProps };
