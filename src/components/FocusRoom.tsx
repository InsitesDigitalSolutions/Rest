import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HelpCircle, 
  Moon, 
  Play, 
  Pause, 
  Music, 
  Volume2, 
  VolumeX, 
  Clock, 
  Book, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  kjvChapter, 
  TTS_VOICES, 
  isPuterReady, 
  puterSpeak, 
  getBrowserVoice, 
  AUDIO_MANIFEST, 
  MEDITATE_TOPICS,
  KJV_BOOKS
} from '../utils/kjv';
import { KJVChapterRef, KJVVerse } from '../types';

interface FocusRoomProps {
  onClose: () => void;
  audio: any; // useFocusAudio hook reference
  todayEntry?: {
    day: number;
    chapters: KJVChapterRef[];
    readings: string[];
  } | null;
  showToast: (m: string) => void;
  initialSessionType?: "plan" | "promises" | "chapter";
  initialPromiseTopicIdx?: number;
  dark?: boolean;
  C?: any;
  F?: string;
}

export default function FocusRoom({ 
  onClose, 
  audio, 
  todayEntry, 
  showToast,
  initialSessionType,
  initialPromiseTopicIdx,
  dark = true,
  C = {
    bg: "#0A0A0A",
    surface: "#121212",
    surface2: "#181818",
    gold: "#C5A367",
    line: "rgba(255, 255, 255, 0.08)",
    muted: "rgba(255, 255, 255, 0.52)",
    text: "#FFFFFF"
  },
  F = "'Helvetica Neue Light', 'Helvetica Neue-Light', 'Helvetica Neue', Helvetica, Arial, sans-serif"
}: FocusRoomProps) {
  // Styles & Tokens mirroring the parent app's active theme
  const brandGold = C.gold;
  const bgDark = dark ? "rgba(10, 10, 10, 0.45)" : "rgba(245, 243, 237, 0.55)";
  const surfaceDark = dark ? "rgba(18, 18, 18, 0.45)" : "rgba(255, 255, 255, 0.7)";
  const borderDark = C.line;
  const textMuted = C.muted;
  const textFaint = dark ? "rgba(255, 255, 255, 0.28)" : "rgba(28, 26, 22, 0.45)";
  const textPrimary = dark ? "#FFFFFF" : "#1C1A16";
  const fontSans = F;
  const fontSerif = F;

  const [step, setStep] = useState<"setup" | "active">("active");
  const [sessionType, setSessionType] = useState<"plan" | "promises" | "chapter">(
    initialSessionType || (todayEntry && todayEntry.chapters.length > 0 ? "plan" : "promises")
  );
  const [customBook, setCustomBook] = useState("Genesis");
  const [customChapter, setCustomChapter] = useState(1);
  
  // Audio state
  const [activeTrack, setActiveTrack] = useState<any>(AUDIO_MANIFEST[0]);
  const [vol, setVol] = useState(0.4);
  const [musicMuted, setMusicMuted] = useState(false);

  // Focus voice selection
  const [voiceId, setVoiceId] = useState(() => localStorage.getItem("rest_tts_voice") || "natural");
  const [speechSpeed, setSpeechSpeed] = useState(0.9);
  
  // Selected promise topic if sessionType is promises
  const [promiseTopicIdx, setPromiseTopicIdx] = useState(
    initialPromiseTopicIdx !== undefined ? initialPromiseTopicIdx : 0
  );

  // Loaded KJV Verses state
  const [verses, setVerses] = useState<KJVVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [curVerse, setCurVerse] = useState(-1);
  const [currentChapIdx, setCurrentChapIdx] = useState(0);
  const [chaptersList, setChaptersList] = useState<KJVChapterRef[]>([]);

  // TTS State Ref
  const [ttsState, setTtsState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const playRef = useRef({ active: false, idx: 0, speed: 0.9 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Record<number, HTMLAudioElement>>({});
  const autoPlayedRef = useRef<number>(-1);

  // DND confirmation toggle
  const [dndConfirmed, setDndConfirmed] = useState(false);

  const handleRandomChapter = () => {
    const randomBook = KJV_BOOKS[Math.floor(Math.random() * KJV_BOOKS.length)];
    const randomChapNum = Math.floor(Math.random() * randomBook.ch) + 1;
    setCustomBook(randomBook.name);
    setCustomChapter(randomChapNum);
    setSessionType("chapter");
  };

  // Initialize chapters based on source
  useEffect(() => {
    if (sessionType === "plan" && todayEntry && todayEntry.chapters.length > 0) {
      setChaptersList(todayEntry.chapters);
      setCurrentChapIdx(0);
    } else if (sessionType === "chapter") {
      setChaptersList([{ book: customBook, chapter: customChapter }]);
      setCurrentChapIdx(0);
    } else {
      // Create chapters mock/reference lists for selected Promise Topic
      const topic = MEDITATE_TOPICS[promiseTopicIdx];
      const refs: KJVChapterRef[] = topic.refs.map(([book, chap]: any) => ({
        book,
        chapter: parseInt(chap, 10) || 1
      }));
      setChaptersList(refs);
      setCurrentChapIdx(0);
    }
  }, [sessionType, todayEntry, promiseTopicIdx, customBook, customChapter]);

  // Load verses whenever active chapter changes
  useEffect(() => {
    if (chaptersList.length === 0 || currentChapIdx >= chaptersList.length) return;
    
    setLoadingVerses(true);
    const item = chaptersList[currentChapIdx];
    kjvChapter(item.book, item.chapter)
      .then(res => {
        if (res && res.length > 0) {
          // Map to KJVVerse structure
          const mapped: KJVVerse[] = res.map(v => ({
            book: item.book,
            chapter: item.chapter,
            verse: v.verse,
            text: v.text
          }));
          setVerses(mapped);
          setCurVerse(-1);
        } else {
          setVerses([]);
        }
        setLoadingVerses(false);
      })
      .catch(() => {
        setVerses([]);
        setLoadingVerses(false);
      });
  }, [chaptersList, currentChapIdx]);

  // Stop TTS and background music on unmount
  useEffect(() => {
    return () => {
      stopTtsGlobal();
      audio.stop();
    };
  }, []);

  // Auto-start focus session on mount or chapter change once verses are loaded
  useEffect(() => {
    if (verses.length > 0 && autoPlayedRef.current !== currentChapIdx) {
      autoPlayedRef.current = currentChapIdx;
      startBackgroundMusic();
      const delay = setTimeout(() => {
        beginRecitation();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [verses, currentChapIdx]);

  function stopTtsGlobal() {
    playRef.current.active = false;
    setTtsState("idle");
    setCurVerse(-1);
    
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current = null;
    }
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  // Meditative Background audio playback controllers
  function startBackgroundMusic() {
    if (!musicMuted) {
      audio.setVol(vol);
      audio.play(activeTrack);
    }
  }

  function handleTrackSelect(track: any) {
    setActiveTrack(track);
    if (step === "active") {
      audio.play(track);
    }
  }

  function handleVolumeChange(v: number) {
    setVol(v);
    if (!musicMuted) {
      audio.setVol(v);
    }
  }

  function handleMuteToggle() {
    if (musicMuted) {
      setMusicMuted(false);
      audio.setVol(vol);
      audio.play(activeTrack);
    } else {
      setMusicMuted(true);
      audio.stop();
    }
  }

  // TTS Execution Handlers
  function beginRecitation() {
    if (verses.length === 0) {
      showToast("Waiting for verses to load...");
      return;
    }
    stopTtsGlobal();
    playRef.current = { active: true, idx: 0, speed: speechSpeed };
    setTtsState("playing");

    const voice = TTS_VOICES.find(v => v.id === voiceId) || TTS_VOICES[0];
    if (voice.engine === "browser" || !isPuterReady()) {
      reciteBrowser(0, voice);
    } else {
      recitePuter(0, voice);
    }
  }

  // Browser standard SpeechSynthesis API
  function reciteBrowser(startIdx: number, voice: any) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setTtsState("idle");
      return;
    }
    window.speechSynthesis.cancel();
    const browserVoice = getBrowserVoice();

    const stepFn = (idx: number) => {
      if (!playRef.current.active) return;
      if (idx >= verses.length) {
        // Go to next chapter if available
        if (currentChapIdx + 1 < chaptersList.length) {
          setCurrentChapIdx(prev => prev + 1);
          setTimeout(() => {
            beginRecitation();
          }, 800);
        } else {
          stopTtsGlobal();
          showToast("Session complete. Rest in Him.");
        }
        return;
      }

      setCurVerse(idx);
      playRef.current.idx = idx;

      const utterance = new SpeechSynthesisUtterance(verses[idx].text);
      utterance.rate = playRef.current.speed;
      utterance.pitch = 1.0;
      if (browserVoice) utterance.voice = browserVoice;

      utterance.onend = () => {
        if (playRef.current.active) {
          stepFn(idx + 1);
        }
      };
      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && playRef.current.active) {
          stepFn(idx + 1);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    stepFn(startIdx);
  }

  // Puter AI Voice Generation API
  async function recitePuter(startIdx: number, voice: any) {
    const stepFn = async (idx: number) => {
      if (!playRef.current.active) return;
      if (idx >= verses.length) {
        if (currentChapIdx + 1 < chaptersList.length) {
          setCurrentChapIdx(prev => prev + 1);
          setTimeout(() => {
            beginRecitation();
          }, 800);
        } else {
          stopTtsGlobal();
          showToast("Session complete. Rest in Him.");
        }
        return;
      }

      setCurVerse(idx);
      playRef.current.idx = idx;

      let speechAudio = cacheRef.current[idx];
      if (!speechAudio) {
        setTtsState("loading");
        try {
          const res = await puterSpeak(verses[idx].text, voice.id, voice.lang, voice.engine);
          if (res && res.audio_url) {
            speechAudio = new Audio(res.audio_url);
            cacheRef.current[idx] = speechAudio;
          }
        } catch (err) {
          console.error("Neural TTS failed, falling back to browser voice", err);
          reciteBrowser(idx, TTS_VOICES.find(v => v.engine === "browser")!);
          return;
        }
      }

      if (!playRef.current.active) return;
      setTtsState("playing");

      if (speechAudio) {
        audioRef.current = speechAudio;
        speechAudio.playbackRate = playRef.current.speed;
        speechAudio.onended = () => {
          if (playRef.current.active) stepFn(idx + 1);
        };
        speechAudio.onerror = () => {
          if (playRef.current.active) stepFn(idx + 1);
        };
        speechAudio.play().catch(() => {
          if (playRef.current.active) stepFn(idx + 1);
        });
      } else {
        stepFn(idx + 1);
      }
    };

    stepFn(startIdx);
  }

  function handleStartFocusSession() {
    setStep("active");
    startBackgroundMusic();
    setTimeout(() => {
      beginRecitation();
    }, 1000);
  }

  function handleEndFocusSession() {
    stopTtsGlobal();
    audio.stop();
    setStep("setup");
    onClose();
  }

  const currentChapterLabel = chaptersList.length > 0 && currentChapIdx < chaptersList.length
    ? `${chaptersList[currentChapIdx].book} ${chaptersList[currentChapIdx].chapter}`
    : "Reading Complete";

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 950,
        background: bgDark,
        backdropFilter: "blur(24px) saturate(120%)",
        WebkitBackdropFilter: "blur(24px) saturate(120%)",
        color: textPrimary,
        fontFamily: fontSans,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* HEADER BAR */}
      <nav 
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 28px",
          borderBottom: `1px solid ${borderDark}`,
          background: dark ? "rgba(10, 10, 10, 0.45)" : "rgba(245, 243, 237, 0.45)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "20px", fontWeight: "300", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            REST.
          </span>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: brandGold, fontWeight: "500" }}>
            Focus Room
          </span>
        </div>
        
        <button 
          onClick={handleEndFocusSession}
          style={{
            background: surfaceDark,
            border: `1px solid ${borderDark}`,
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: textPrimary,
            transition: "all 0.2s"
          }}
          title="Exit Focus Mode"
        >
          <X size={18} />
        </button>
      </nav>

      {/* ACTIVE SANCTUARY PHASE SCREEN */}
      <main 
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 24px 60px",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Subtle Ambient Glow backdrops */}
        <div 
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(90vw, 480px)",
            height: "min(90vw, 480px)",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(197, 163, 103, 0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: -1
          }}
        />

        {/* ACTIVE STEP INDICATOR BANNER */}
        <div style={{ textAlign: "center", zIndex: 2 }}>
          <span style={{ textTransform: "uppercase", fontSize: "10px", tracking: "0.3em", letterSpacing: "0.25em", color: brandGold, fontWeight: "600" }}>
            Quiet Focus Session
          </span>
          <div style={{ fontSize: "14px", color: textMuted, marginTop: 4, fontFamily: fontSerif }}>
            {currentChapterLabel}
          </div>
        </div>

        {/* CENTER IMMERSIVE AREA (BREATHING RING + HIGHLIGHTS) */}
        <div style={{ flex: 1, display: "flex", flexCol: true, flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 36, margin: "24px 0", zIndex: 2 }}>
          
          {/* Elegant Double Breathing Loop Ring */}
          <div 
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: "1px solid rgba(197, 163, 103, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}
          >
            {/* Outer highly pulse ring */}
            <div 
              style={{
                position: "absolute",
                inset: -12,
                borderRadius: "50%",
                border: "1px dashed rgba(197, 163, 103, 0.25)",
                animation: "breathe 5s ease-in-out infinite"
              }}
            />
            {/* Inner ambient ring */}
            <div 
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "rgba(197, 163, 103, 0.03)",
                border: "1px solid rgba(197, 163, 103, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div 
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: brandGold,
                  opacity: 0.8
                }}
              />
            </div>
          </div>

          {/* SCRIPTURE RECITATION SLIDESHOW */}
          <div style={{ maxWidth: 760, width: "100%", padding: "0 10px", textAlign: "center", minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {loadingVerses ? (
              <div style={{ fontFamily: fontSerif, fontSize: "20px", color: textMuted }}>
                Sourcing scriptures…
              </div>
            ) : verses.length === 0 ? (
              <div style={{ color: textMuted }}>
                Select or trigger standard recruitment
              </div>
            ) : (
              <div style={{ transition: "opacity 0.6s ease" }}>
                <p 
                  style={{
                    fontFamily: fontSerif,
                    fontSize: "clamp(24px, 4.5vw, 38px)",
                    lineHeight: 1.55,
                    color: textPrimary,
                    letterSpacing: "-0.01em",
                    textShadow: dark ? "0 4px 12px rgba(0,0,0,0.5)" : "none"
                  }}
                >
                  "{curVerse >= 0 && curVerse < verses.length ? verses[curVerse].text : "Peace be still…"}"
                </p>
                <div style={{ marginTop: 20, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: brandGold, fontWeight: "500" }}>
                  {curVerse >= 0 && curVerse < verses.length 
                    ? `${verses[curVerse].book} ${verses[curVerse].chapter}:${verses[curVerse].verse}` 
                    : currentChapterLabel}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FLOATING CONTROL BAR AT BOTTOM */}
        <div 
          style={{
            maxWidth: 600,
            width: "100%",
            margin: "0 auto",
            background: dark ? "rgba(18, 18, 18, 0.85)" : "rgba(255, 255, 255, 0.9)",
            border: `1px solid ${borderDark}`,
            borderRadius: 24,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)"
          }}
        >
          {/* Play info status */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div 
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: ttsState === "playing" ? "#10B981" : "#F59E0B",
                animation: ttsState === "playing" ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none"
              }} 
            />
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: textMuted }}>
              {ttsState === "playing" ? "Narrating" : ttsState === "loading" ? "Buffering" : "Paused"}
            </span>
          </div>

          {/* Quick playback keys */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {currentChapIdx > 0 && (
              <button
                onClick={() => {
                  stopTtsGlobal();
                  setCurrentChapIdx(prev => prev - 1);
                }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: textMuted }}
                title="Previous Chapter"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            <button
              onClick={() => {
                if (ttsState === "playing") {
                  // Pause browser Speech
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.pause();
                  }
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  setTtsState("paused");
                } else if (ttsState === "paused") {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.resume();
                  }
                  if (audioRef.current) {
                    audioRef.current.play().catch(() => {});
                  }
                  setTtsState("playing");
                } else {
                  beginRecitation();
                }
              }}
              style={{
                background: brandGold,
                border: "none",
                borderRadius: "50%",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: dark ? "#0A0A0A" : "#FFFFFF"
              }}
            >
              {ttsState === "playing" ? <Pause size={18} fill={dark ? "#0A0A0A" : "#FFFFFF"} /> : <Play size={18} fill={dark ? "#0A0A0A" : "#FFFFFF"} />}
            </button>

            {currentChapIdx + 1 < chaptersList.length && (
              <button
                onClick={() => {
                  stopTtsGlobal();
                  setCurrentChapIdx(prev => prev + 1);
                }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: textMuted }}
                title="Next Chapter"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Quick action keys */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleEndFocusSession}
              style={{
                padding: "8px 16px",
                borderRadius: 30,
                fontSize: 11,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                border: `1px solid ${borderDark}`,
                background: "transparent",
                color: textPrimary,
                cursor: "pointer",
                fontFamily: fontSans,
                transition: "all 0.2s"
              }}
            >
              End Session
            </button>
          </div>
        </div>
      </main>

      {/* Embedded breathe & pulse inline keyframes style tag */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
