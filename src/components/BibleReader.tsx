import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Sun, Moon, Headphones, Square, Play, Pause, Check } from 'lucide-react';
import { KJVChapterRef, KJVVerse } from '../types';
import { kjvChapter, TTS_VOICES, isPuterReady, puterSpeak, getBrowserVoice } from '../utils/kjv';

interface BibleReaderProps {
  chapters: KJVChapterRef[];
  onClose: () => void;
  onComplete?: () => void;
  onAudioDuck?: (ducked: boolean) => void;
  startAutoPlay?: boolean;
}

export default function BibleReader({
  chapters,
  onClose,
  onComplete,
  onAudioDuck,
  startAutoPlay
}: BibleReaderProps) {
  const C_DARK = {
    bg: "#0A0A0A",
    surf: "#121212",
    text: "#FFFFFF",
    muted: "rgba(255, 255, 255, 0.52)",
    gold: "var(--theme-gold, #C5A367)",
    line: "rgba(255, 255, 255, 0.08)",
    brd: "rgba(255, 255, 255, 0.12)"
  };
  const C_LIGHT = {
    bg: "#F7F6F2",
    surf: "#FFFFFF",
    text: "#121212",
    muted: "#6B6A66",
    gold: "var(--theme-gold, #C5A367)",
    line: "#E1DFD9",
    brd: "#D5D3CC"
  };

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const T = theme === "dark" ? C_DARK : C_LIGHT;

  const [chIdx, setChIdx] = useState(0); // current chapter index
  const [verses, setVerses] = useState<KJVVerse[] | null | false>(null); // null = loading, false = error
  const [fontSize, setFontSize] = useState(19);
  const [lineH, setLineH] = useState(1.85);
  const [focusMode, setFocus] = useState(false); // hides outer chrome

  // Audio state
  const [voiceId, setVoiceId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rest_tts_voice") || "Matthew";
    }
    return "Matthew";
  });
  const [showVoices, setShowVoices] = useState(false);
  const [ttsState, setTtsState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [curVerse, setCurVerse] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [sleepMins, setSleepMins] = useState(0);
  const [sleepLeft, setSleepLeft] = useState(0);

  const playRef = useRef({ active: false, idx: 0, speed: 1.0 });
  const audioRef = useRef<HTMLAudioElement | null>(null); // current Puter HTMLAudioElement
  const cacheRef = useRef<Record<number, HTMLAudioElement>>({}); // pre-fetched Puter audio
  const verseEls = useRef<Record<number, HTMLDivElement | null>>({});

  const ch = chapters?.[chIdx] || { book: "Genesis", chapter: 1 };
  const label = `${ch.book} ${ch.chapter}`;

  // ── Load chapter text ────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    setVerses(null);
    stopTts();
    cacheRef.current = {};
    kjvChapter(ch.book, ch.chapter).then(result => {
      if (!alive) return;
      setVerses(result || false); // false = error/not found
      if (startAutoPlay && result && result.length > 0) {
        setTimeout(() => beginTts(result, 0), 600);
      }
    });
    return () => {
      alive = false;
    };
  }, [chIdx]);

  // ── Auto-scroll to highlighted verse ────────────────────────────────────
  useEffect(() => {
    if (curVerse >= 0 && verseEls.current[curVerse]) {
      verseEls.current[curVerse]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [curVerse]);

  // ── Sleep timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sleepLeft) return;
    if (sleepLeft <= 1) {
      stopTts();
      setSleepLeft(0);
      return;
    }
    const t = setTimeout(() => setSleepLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sleepLeft]);

  // ── Page visibility — pause TTS when backgrounded ───────────────────────
  useEffect(() => {
    const handler = () => {
      if (document.hidden) pauseTts();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [ttsState]);

  // ── TTS functions ────────────────────────────────────────────────────────
  function stopTts() {
    playRef.current.active = false;
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (onAudioDuck) onAudioDuck(false);
    setTtsState("idle");
    setCurVerse(-1);
    setProgress(0);
  }

  function pauseTts() {
    if (ttsState !== "playing") return;
    playRef.current.active = false;
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }
    if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
    }
    if (onAudioDuck) onAudioDuck(false);
    setTtsState("paused");
  }

  function resumeTts() {
    if (ttsState !== "paused" || !verses) return;
    const idx = playRef.current.idx;
    if (audioRef.current?.paused && audioRef.current.currentTime > 0) {
      playRef.current.active = true;
      if (onAudioDuck) onAudioDuck(true);
      setTtsState("playing");
      audioRef.current.onended = () => {
        if (playRef.current.active) beginTts(verses, idx + 1);
      };
      audioRef.current.play().catch(() => beginTts(verses, idx));
    } else if (typeof window !== "undefined" && window.speechSynthesis?.paused) {
      playRef.current.active = true;
      if (onAudioDuck) onAudioDuck(true);
      setTtsState("playing");
      window.speechSynthesis.resume();
    } else {
      beginTts(verses, idx);
    }
  }

  function toggleTts() {
    if (!verses || verses === false) return;
    if (ttsState === "idle") beginTts(verses, 0);
    else if (ttsState === "playing") pauseTts();
    else if (ttsState === "paused") resumeTts();
  }

  function jumpToVerse(idx: number) {
    if (!verses || verses === false) return;
    stopTts();
    setTimeout(() => beginTts(verses, idx), 80);
  }

  function beginTts(vList: KJVVerse[], startIdx: number) {
    stopTts();
    if (!vList || vList.length === 0) return;
    if (onAudioDuck) onAudioDuck(true);
    playRef.current = { active: true, idx: startIdx, speed };
    setTtsState("playing");
    const voice = TTS_VOICES.find(v => v.id === voiceId) || TTS_VOICES[0];
    if (voice.engine === "browser" || !isPuterReady()) {
      speakBrowser(vList, startIdx, voice);
    } else {
      speakPuter(vList, startIdx, voice);
    }
  }

  // Puter neural TTS
  async function speakPuter(vList: KJVVerse[], startIdx: number, voice: any) {
    const total = vList.length;
    const step = async (idx: number) => {
      if (!playRef.current.active) return;
      if (idx >= total) {
        playRef.current.active = false;
        if (onAudioDuck) onAudioDuck(false);
        setTtsState("idle");
        setCurVerse(-1);
        setProgress(100);
        return;
      }
      setCurVerse(idx);
      setProgress(Math.round((idx / total) * 100));
      playRef.current.idx = idx;

      // Use pre-fetched audio if available
      let audio = cacheRef.current[idx];
      if (!audio) {
        setTtsState("loading");
        try {
          audio = await puterSpeak(vList[idx].text, voice.id, voice.lang, voice.engine);
          cacheRef.current[idx] = audio;
        } catch (err) {
          console.warn("Puter TTS error, falling back to browser voice:", err);
          setTtsState("playing");
          speakBrowser(vList, idx, TTS_VOICES.find(v => v.engine === "browser")!);
          return;
        }
        if (!playRef.current.active) return;
        setTtsState("playing");
      }

      // Pre-fetch next verse
      const nextIdx = idx + 1;
      if (nextIdx < total && !cacheRef.current[nextIdx]) {
        puterSpeak(vList[nextIdx].text, voice.id, voice.lang, voice.engine)
          .then(a => {
            cacheRef.current[nextIdx] = a;
          })
          .catch(() => {});
      }

      audioRef.current = audio;
      audio.playbackRate = playRef.current.speed;
      audio.onended = () => {
        if (playRef.current.active) step(idx + 1);
      };
      audio.onerror = () => {
        if (playRef.current.active) step(idx + 1);
      };
      audio.play().catch(() => {
        if (playRef.current.active) step(idx + 1);
      });
    };
    step(startIdx);
  }

  // Browser Web Speech API fallback
  function speakBrowser(vList: KJVVerse[], startIdx: number, voice: any) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setTtsState("idle");
      return;
    }
    window.speechSynthesis.cancel();
    const total = vList.length;
    const browserVoice = getBrowserVoice();
    const step = (idx: number) => {
      if (!playRef.current.active) return;
      if (idx >= total) {
        playRef.current.active = false;
        if (onAudioDuck) onAudioDuck(false);
        setTtsState("idle");
        setCurVerse(-1);
        setProgress(100);
        return;
      }
      setCurVerse(idx);
      setProgress(Math.round((idx / total) * 100));
      playRef.current.idx = idx;
      const utt = new SpeechSynthesisUtterance(vList[idx].text);
      utt.rate = playRef.current.speed;
      utt.pitch = 1.0;
      if (browserVoice) utt.voice = browserVoice;
      utt.onend = () => {
        if (playRef.current.active) step(idx + 1);
      };
      utt.onerror = (e) => {
        if (e.error !== "interrupted" && playRef.current.active) step(idx + 1);
      };
      window.speechSynthesis.speak(utt);
    };
    step(startIdx);
  }

  function changeSpeed(s: number) {
    setSpeed(s);
    playRef.current.speed = s;
    if (audioRef.current) audioRef.current.playbackRate = s;
  }

  // ── Voice picker sheet ───────────────────────────────────────────────────
  const VoicePicker = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 800,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "flex-end"
      }}
      onClick={() => setShowVoices(false)}
    >
      <div
        style={{
          background: T.surf,
          borderRadius: "18px 18px 0 0",
          padding: "20px 16px 36px",
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          maxHeight: "70vh",
          overflowY: "auto"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: T.text }}>Choose Voice</div>
          <button onClick={() => setShowVoices(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 18, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", lineHeight: 1.5 }}>
          Neural voices require internet. Device Voice always works offline.
        </div>
        {TTS_VOICES.map(v => (
          <button
            key={v.id}
            onClick={() => {
              localStorage.setItem("rest_tts_voice", v.id);
              setVoiceId(v.id);
              setShowVoices(false);
              if (ttsState === "playing" || ttsState === "paused") {
                const curIdx = playRef.current.idx;
                stopTts();
                cacheRef.current = {};
                if (verses) {
                  setTimeout(() => beginTts(verses, curIdx), 120);
                }
              }
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: 8,
              borderRadius: 12,
              background: voiceId === v.id ? T.gold + "22" : "transparent",
              border: `1px solid ${voiceId === v.id ? T.gold : T.brd}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              color: T.text
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, color: voiceId === v.id ? T.gold : T.text }}>{v.label}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{v.desc}</div>
            </div>
            {voiceId === v.id && <span style={{ color: T.gold, fontSize: 16 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const sleepLabel = sleepLeft > 0 ? `${Math.ceil(sleepLeft / 60)}m` : sleepMins ? `${sleepMins}m` : null;
  const isPlaying = ttsState === "playing";
  const isLoading = ttsState === "loading";
  const isPaused = ttsState === "paused";
  const F = "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif";

  return (
    <div
      id="bible-reader-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 700,
        background: theme === "dark" ? "rgba(10, 10, 10, 0.72)" : "rgba(245, 243, 237, 0.78)",
        backdropFilter: "blur(24px) saturate(120%)",
        WebkitBackdropFilter: "blur(24px) saturate(120%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: F,
        color: T.text,
        overflow: "hidden"
      }}
    >
      {showVoices && <VoicePicker />}

      {/* ── HEADER ── */}
      {!focusMode && (
        <div style={{ borderBottom: `1px solid ${T.brd}`, padding: "12px 14px", flexShrink: 0, background: theme === "dark" ? "rgba(18, 18, 18, 0.45)" : "rgba(255, 255, 255, 0.55)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", justifyContent: "space-between", marginBottom: 10 }}>
            <button
              onClick={() => {
                stopTts();
                onClose();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.muted,
                padding: "6px 10px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: F,
                fontSize: 13
              }}
            >
              <X size={18} /> Close
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 500, fontSize: 16, color: T.text }}>{label}</div>
              <div style={{ fontSize: 11, color: T.gold, letterSpacing: 2, textTransform: "uppercase" }}>KJV</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                style={{
                  background: T.surf,
                  border: `1px solid ${T.brd}`,
                  borderRadius: 7,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: T.muted,
                  fontFamily: F,
                  fontSize: 13
                }}
              >
                A−
              </button>
              <button
                onClick={() => setFontSize(s => Math.min(32, s + 2))}
                style={{
                  background: T.surf,
                  border: `1px solid ${T.brd}`,
                  borderRadius: 7,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: T.text,
                  fontFamily: F,
                  fontSize: 15
                }}
              >
                A+
              </button>
              <button
                onClick={() => setFocus(true)}
                style={{ background: T.surf, border: `1px solid ${T.brd}`, borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: T.muted }}
                title="Focus mode (hide controls)"
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                style={{ background: T.surf, border: `1px solid ${T.brd}`, borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: T.muted }}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>

          {/* Chapter navigation if multiple chapters loaded */}
          {chapters.length > 1 && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {chapters.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setChIdx(i)}
                  style={{
                    flexShrink: 0,
                    padding: "6px 13px",
                    borderRadius: 20,
                    border: `1px solid ${chIdx === i ? T.gold : T.brd}`,
                    background: chIdx === i ? T.gold : "transparent",
                    color: chIdx === i ? (theme === "dark" ? C_DARK.bg : C_LIGHT.bg) : T.muted,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: F,
                    whiteSpace: "nowrap"
                  }}
                >
                  {c.book} {c.chapter}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Focus mode: exit triggers */}
      {focusMode && (
        <button
          onClick={() => setFocus(false)}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10,
            background: T.surf + "CC",
            border: `1px solid ${T.brd}`,
            borderRadius: 8,
            padding: "7px 12px",
            cursor: "pointer",
            color: T.muted,
            fontFamily: F,
            fontSize: 12
          }}
        >
          Exit focus
        </button>
      )}

      {/* ── VERSE CONTENT AREA ── */}
      <div
        id="verses-content-container"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: focusMode ? "60px 24px 140px" : "24px 20px 140px",
          maxWidth: 700,
          margin: "0 auto",
          width: "100%"
        }}
      >
        {verses === null && (
          <div style={{ textAlign: "center", paddingTop: 80, color: T.muted, fontFamily: F }}>
            <div style={{ fontSize: 28, marginBottom: 12, animation: "spin 1.2s linear infinite", display: "inline-block" }}>◌</div>
            <div>Loading {label}…</div>
          </div>
        )}

        {verses === false && (
          <div style={{ textAlign: "center", paddingTop: 60, fontFamily: F }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>📖</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: T.text, marginBottom: 8 }}>
              Couldn't load {label}
            </div>
            <div style={{ fontSize: 14, color: T.muted, marginBottom: 20, lineHeight: 1.6 }}>
              Scripture database is loading. Tap button below to re-verify.
            </div>
            <button
              onClick={() => {
                setVerses(null);
                kjvChapter(ch.book, ch.chapter).then(r => setVerses(r || false));
              }}
              style={{
                padding: "11px 22px",
                background: T.gold,
                border: "none",
                borderRadius: 10,
                color: theme === "dark" ? C_DARK.bg : C_LIGHT.bg,
                fontFamily: F,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {verses && verses.length > 0 && (
          <>
            <h2 style={{ fontWeight: 400, fontSize: 32, marginBottom: 28, textAlign: "center", letterSpacing: "-0.01em", color: T.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {label}
            </h2>
            {verses.map((v, i) => (
              <div
                key={v.verse}
                ref={el => {
                  verseEls.current[i] = el;
                }}
                onClick={() => jumpToVerse(i)}
                style={{
                  marginBottom: Math.round(fontSize * lineH * 0.6),
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: curVerse === i ? T.gold + "18" : "transparent",
                  borderLeft: curVerse === i ? `3px solid ${T.gold}` : "3px solid transparent",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: 11, color: T.gold, fontWeight: 500, marginRight: 7, verticalAlign: "super" }}>
                  {v.verse}
                </span>
                <span
                  style={{
                    fontSize: fontSize,
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    lineHeight: lineH,
                    color: T.text,
                    opacity: curVerse >= 0 && curVerse !== i ? 0.6 : 1,
                    transition: "opacity 0.2s"
                  }}
                >
                  {v.text}
                </span>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 20, padding: "16px 0", fontSize: 11, color: T.muted, letterSpacing: "0.04em" }}>
              — end of {label} · tap any verse to listen from there —
            </div>
          </>
        )}
      </div>

      {/* ── AUDIO CONTROLLER PANEL ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: theme === "dark" ? "rgba(18, 18, 18, 0.65)" : "rgba(255, 255, 255, 0.65)",
          borderTop: `1px solid ${T.brd}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          padding: "10px 14px 24px",
          maxWidth: 700,
          margin: "0 auto"
        }}
      >
        <div style={{ height: 3, background: T.brd, borderRadius: 100, marginBottom: 10, overflow: "hidden", cursor: "pointer" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: T.gold, borderRadius: 100, transition: "width 0.3s ease" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowVoices(true)}
            style={{
              flex: 1,
              padding: "8px 10px",
              background: "transparent",
              border: `1px solid ${T.brd}`,
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
              color: T.text,
              fontFamily: F
            }}
          >
            <span style={{ color: isPlaying ? T.gold : T.muted, flexShrink: 0 }}>
              <Headphones size={15} />
            </span>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1, textTransform: "uppercase" }}>Voice</div>
              <div style={{ fontWeight: 500, fontSize: 14, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {TTS_VOICES.find(v => v.id === voiceId)?.label || "Matthew"}
              </div>
            </div>
            <span style={{ color: T.gold, fontSize: 10, flexShrink: 0 }}>▾</span>
          </button>

          <div style={{ fontSize: 11, color: T.muted, minWidth: 52, textAlign: "center", fontFamily: F }}>
            {isLoading ? "loading…" : isPlaying ? `${curVerse + 1}/${verses ? verses.length : "?"}` : isPaused ? "paused" : verses ? `${verses.length} v.` : ""}
          </div>

          <div style={{ display: "flex", gap: 3 }}>
            {[0.8, 1, 1.2, 1.5].map(s => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                style={{
                  padding: "5px 8px",
                  borderRadius: 6,
                  fontFamily: F,
                  fontSize: 10,
                  cursor: "pointer",
                  background: speed === s ? T.gold : "transparent",
                  border: `1px solid ${speed === s ? T.gold : T.brd}`,
                  color: speed === s ? (theme === "dark" ? C_DARK.bg : C_LIGHT.bg) : T.muted,
                  fontWeight: speed === s ? 500 : 400
                }}
              >
                {s}×
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const opts = [0, 15, 30, 45, 60];
              const next = opts[(opts.indexOf(sleepMins) + 1) % opts.length];
              setSleepMins(next);
              setSleepLeft(next * 60);
            }}
            style={{
              background: "transparent",
              border: `1px solid ${sleepMins ? T.gold : T.brd}`,
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              color: sleepMins ? T.gold : T.muted,
              fontFamily: F,
              fontSize: 11,
              minWidth: 32,
              textAlign: "center"
            }}
            title="Sleep timer"
          >
            {sleepLabel || "💤"}
          </button>

          {(isPlaying || isPaused) && (
            <button onClick={stopTts} style={{ background: "transparent", border: `1px solid ${T.brd}`, borderRadius: 8, padding: "9px", cursor: "pointer", color: T.muted }}>
              <Square size={14} />
            </button>
          )}

          <button
            onClick={toggleTts}
            disabled={!verses || verses === false}
            style={{
              background: (!verses || verses === false) ? T.brd : T.gold,
              border: "none",
              borderRadius: "50%",
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: (!verses || verses === false) ? "not-allowed" : "pointer",
              color: theme === "dark" ? C_DARK.bg : C_LIGHT.bg,
              flexShrink: 0,
              boxShadow: isPlaying ? `0 0 20px ${T.gold}88` : "none",
              transition: "box-shadow 0.3s"
            }}
          >
            {isLoading ? <span style={{ fontSize: 16, animation: "spin 0.9s linear infinite", display: "inline-block" }}>◌</span> : isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>

        {onComplete && verses && verses.length > 0 && (
          <button
            onClick={() => {
              stopTts();
              onComplete();
            }}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "12px",
              background: "transparent",
              border: `1px solid ${T.brd}`,
              borderRadius: 10,
              color: T.muted,
              cursor: "pointer",
              fontFamily: F,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <Check size={15} /> Mark Reading Complete
          </button>
        )}
      </div>
    </div>
  );
}
export type { BibleReaderProps };
