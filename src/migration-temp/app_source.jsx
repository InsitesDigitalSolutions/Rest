// ════════════════════════════════════════════════════════════════════════════
// REST — Bible Reader  (standalone module, embedded in the main app)
// Complete KJV: 66 books · 1,189 chapters · 31,100 verses
// ════════════════════════════════════════════════════════════════════════════

// ─── KJV DATA LAYER ─────────────────────────────────────────────────────────
const KJV_B64 = (typeof window !== "undefined" && window.REST_KJV_0)
  ? (window.REST_KJV_0 + window.REST_KJV_1 + window.REST_KJV_2 + window.REST_KJV_3)
  : "";

let _kjvData = null;   // cached after first decompress
let _kjvError = null;  // set if load fails so we don't retry forever

async function loadKJV() {
  if (_kjvData) return _kjvData;
  if (_kjvError) return null;
  if (!KJV_B64) {
    _kjvError = "Data files not found. Ensure rest-data-0..3.js are in the same folder.";
    return null;
  }
  try {
    // base64 → Uint8Array
    const binStr = atob(KJV_B64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    // gzip decompress (universally supported: Chrome, Safari, Firefox, Edge)
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();
    writer.write(bytes);
    writer.close();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
    _kjvData = JSON.parse(new TextDecoder().decode(combined));
    return _kjvData;
  } catch (err) {
    _kjvError = "Decompression failed: " + err.message;
    console.error("REST KJV load error:", err);
    return null;
  }
}

// Fetch all verses in a chapter → [{verse:N, text:"..."}] or null
async function kjvChapter(book, chapter) {
  const cacheKey = `${book}|${chapter}`;
  if (!window._kjvCache) window._kjvCache = {};
  if (window._kjvCache[cacheKey]) return window._kjvCache[cacheKey];
  const data = await loadKJV();
  if (!data) return null;
  const arr = data[book]?.[String(chapter)];
  if (!arr || arr.length === 0) return null;
  const result = arr.map((text, i) => ({ verse: i + 1, text }));
  window._kjvCache[cacheKey] = result;
  return result;
}

// Fetch a single verse → "text" or null
async function kjvVerse(book, chapter, verse) {
  const ch = await kjvChapter(book, chapter);
  return ch?.[verse - 1]?.text ?? null;
}

// ─── ALL 66 BOOKS in canonical order ────────────────────────────────────────
const KJV_BOOKS = [
  {name:"Genesis",      abbr:"Gen",  ch:50},  {name:"Exodus",       abbr:"Exo", ch:40},
  {name:"Leviticus",    abbr:"Lev",  ch:27},  {name:"Numbers",      abbr:"Num", ch:36},
  {name:"Deuteronomy",  abbr:"Deu",  ch:34},  {name:"Joshua",       abbr:"Jos", ch:24},
  {name:"Judges",       abbr:"Jdg",  ch:21},  {name:"Ruth",         abbr:"Rut", ch:4 },
  {name:"1 Samuel",     abbr:"1Sa",  ch:31},  {name:"2 Samuel",     abbr:"2Sa", ch:24},
  {name:"1 Kings",      abbr:"1Ki",  ch:22},  {name:"2 Kings",      abbr:"2Ki", ch:25},
  {name:"1 Chronicles", abbr:"1Ch",  ch:29},  {name:"2 Chronicles", abbr:"2Ch", ch:36},
  {name:"Ezra",         abbr:"Ezr",  ch:10},  {name:"Nehemiah",     abbr:"Neh", ch:13},
  {name:"Esther",       abbr:"Est",  ch:10},  {name:"Job",          abbr:"Job", ch:42},
  {name:"Psalms",       abbr:"Psa",  ch:150}, {name:"Proverbs",     abbr:"Pro", ch:31},
  {name:"Ecclesiastes", abbr:"Ecc",  ch:12},  {name:"Song of Solomon",abbr:"Son",ch:8},
  {name:"Isaiah",       abbr:"Isa",  ch:66},  {name:"Jeremiah",     abbr:"Jer", ch:52},
  {name:"Lamentations", abbr:"Lam",  ch:5 },  {name:"Ezekiel",      abbr:"Eze", ch:48},
  {name:"Daniel",       abbr:"Dan",  ch:12},  {name:"Hosea",        abbr:"Hos", ch:14},
  {name:"Joel",         abbr:"Joe",  ch:3 },  {name:"Amos",         abbr:"Amo", ch:9 },
  {name:"Obadiah",      abbr:"Oba",  ch:1 },  {name:"Jonah",        abbr:"Jon", ch:4 },
  {name:"Micah",        abbr:"Mic",  ch:7 },  {name:"Nahum",        abbr:"Nah", ch:3 },
  {name:"Habakkuk",     abbr:"Hab",  ch:3 },  {name:"Zephaniah",    abbr:"Zep", ch:3 },
  {name:"Haggai",       abbr:"Hag",  ch:2 },  {name:"Zechariah",    abbr:"Zec", ch:14},
  {name:"Malachi",      abbr:"Mal",  ch:4 },
  {name:"Matthew",      abbr:"Mat",  ch:28},  {name:"Mark",         abbr:"Mar", ch:16},
  {name:"Luke",         abbr:"Luk",  ch:24},  {name:"John",         abbr:"Joh", ch:21},
  {name:"Acts",         abbr:"Act",  ch:28},  {name:"Romans",       abbr:"Rom", ch:16},
  {name:"1 Corinthians",abbr:"1Co",  ch:16},  {name:"2 Corinthians",abbr:"2Co", ch:13},
  {name:"Galatians",    abbr:"Gal",  ch:6 },  {name:"Ephesians",    abbr:"Eph", ch:6 },
  {name:"Philippians",  abbr:"Php",  ch:4 },  {name:"Colossians",   abbr:"Col", ch:4 },
  {name:"1 Thessalonians",abbr:"1Th",ch:5 },  {name:"2 Thessalonians",abbr:"2Th",ch:3},
  {name:"1 Timothy",    abbr:"1Ti",  ch:6 },  {name:"2 Timothy",    abbr:"2Ti", ch:4 },
  {name:"Titus",        abbr:"Tit",  ch:3 },  {name:"Philemon",     abbr:"Phm", ch:1 },
  {name:"Hebrews",      abbr:"Heb",  ch:13},  {name:"James",        abbr:"Jas", ch:5 },
  {name:"1 Peter",      abbr:"1Pe",  ch:5 },  {name:"2 Peter",      abbr:"2Pe", ch:3 },
  {name:"1 John",       abbr:"1Jo",  ch:5 },  {name:"2 John",       abbr:"2Jo", ch:1 },
  {name:"3 John",       abbr:"3Jo",  ch:1 },  {name:"Jude",         abbr:"Jud", ch:1 },
  {name:"Revelation",   abbr:"Rev",  ch:22},
];

// Build full chapter list for reading plans
function buildAllChapters(scope) {
  let books = KJV_BOOKS;
  if (scope === "ot")      books = KJV_BOOKS.slice(0, 39);
  if (scope === "nt")      books = KJV_BOOKS.slice(39);
  if (scope === "gospels") books = KJV_BOOKS.filter(b => ["Matthew","Mark","Luke","John"].includes(b.name));
  if (scope === "psalms")  books = KJV_BOOKS.filter(b => ["Psalms","Proverbs"].includes(b.name));
  const list = [];
  for (const book of books)
    for (let c = 1; c <= book.ch; c++)
      list.push({ book: book.name, chapter: c });
  return list;
}

// ─── TTS VOICE ENGINE ────────────────────────────────────────────────────────
// Uses Puter.js neural voices (free, no API key) with Web Speech API fallback.
// Puter voices require the live site (insitesdigitalsolutions.github.io/Rest/).
// Web Speech API fallback works everywhere.

const TTS_VOICES = [
  { id: "Matthew", label: "Matthew", desc: "Warm · Male · US",     engine: "generative", lang: "en-US" },
  { id: "Joanna",  label: "Joanna",  desc: "Calm · Female · US",   engine: "generative", lang: "en-US" },
  { id: "Stephen", label: "Stephen", desc: "Rich · Male · US",     engine: "generative", lang: "en-US" },
  { id: "Ruth",    label: "Ruth",    desc: "Gentle · Female · US", engine: "generative", lang: "en-US" },
  { id: "Gregory", label: "Gregory", desc: "Deep · Male · US",     engine: "generative", lang: "en-US" },
  { id: "Amy",     label: "Amy",     desc: "Clear · Female · UK",  engine: "generative", lang: "en-GB" },
  { id: "Arthur",  label: "Arthur",  desc: "Narrator · UK",        engine: "neural",     lang: "en-GB" },
  { id: "browser", label: "Device Voice", desc: "Built-in · always works", engine: "browser", lang: "en-US" },
];

function isPuterReady() {
  return typeof window !== "undefined" && window.puter && window.puter.ai && typeof window.puter.ai.txt2speech === "function";
}

// Speak text with Puter neural TTS → returns HTMLAudioElement
async function puterSpeak(text, voiceId, lang, engine) {
  return await window.puter.ai.txt2speech(text, { voice: voiceId, engine, language: lang });
}

// Pick best available browser voice for Web Speech fallback
function getBrowserVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter(v => v.lang.startsWith("en"));
  // Prefer: Natural/Enhanced/Premium/Neural > named human voices > any en-US > any en
  return (
    en.find(v => /natural|neural|enhanced|premium/i.test(v.name)) ||
    en.find(v => /samantha|daniel|karen|moira|ava|alex|victoria|allison|zoe/i.test(v.name)) ||
    en.find(v => v.lang === "en-US" && !v.name.toLowerCase().includes("compact")) ||
    en.find(v => v.lang.startsWith("en")) ||
    voices[0] || null
  );
}



//
// backward-compat alias
const fetchChapter = kjvChapter;
// ─── BIBLE READER COMPONENT ──────────────────────────────────────────────────
// Full-screen, mobile-first. Covers all chapters passed in.
// Props:
//   chapters    [{book, chapter}]  — one or more chapters to display
//   onClose     () => void
//   onComplete  () => void  — mark day's reading done
//   onAudioDuck (bool) => void  — lower background music during TTS
//   startAutoPlay bool  — begin TTS immediately on open

function BibleReader({ chapters, onClose, onComplete, onAudioDuck, startAutoPlay }) {
  const C_DARK   = { bg:"#0A0A0C", surf:"#16171C", text:"#F4F2EC", muted:"#8A8A93",
                     gold:"#E0A33B", line:"#26272E", brd:"#2A2B33" };
  const C_LIGHT  = { bg:"#F5F2EB", surf:"#FFFFFF",  text:"#1A1815", muted:"#7A756B",
                     gold:"#B8851E", line:"#E2DCCF", brd:"#D8D1C3" };

  const [theme, setTheme] = useState("dark");
  const T = theme === "dark" ? C_DARK : C_LIGHT;

  const [chIdx, setChIdx]       = useState(0);     // current chapter index
  const [verses, setVerses]     = useState(null);   // [{verse, text}] | null=loading | false=error
  const [fontSize, setFontSize] = useState(19);
  const [lineH, setLineH]       = useState(1.85);
  const [focusMode, setFocus]   = useState(false);  // hides all chrome

  // Audio state
  const [voiceId, setVoiceId]   = useState(() => localStorage.getItem("rest_tts_voice") || "Matthew");
  const [showVoices, setShowVoices] = useState(false);
  const [ttsState, setTtsState] = useState("idle"); // idle | loading | playing | paused
  const [curVerse, setCurVerse] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed]       = useState(1.0);
  const [sleepMins, setSleepMins] = useState(0);
  const [sleepLeft, setSleepLeft] = useState(0);

  const playRef    = useRef({ active: false, idx: 0, speed: 1.0 });
  const audioRef   = useRef(null);   // current Puter HTMLAudioElement
  const cacheRef   = useRef({});     // pre-fetched Puter audio
  const verseEls   = useRef([]);

  const ch    = chapters?.[chIdx] || { book: "Genesis", chapter: 1 };
  const label = `${ch.book} ${ch.chapter}`;

  // ── Load chapter text ────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    setVerses(null);
    stopTts();
    cacheRef.current = {};
    kjvChapter(ch.book, ch.chapter).then(result => {
      if (!alive) return;
      setVerses(result || false);  // false = error/not found
      if (startAutoPlay && result && result.length > 0) {
        setTimeout(() => beginTts(result, 0), 600);
      }
    });
    return () => { alive = false; };
  }, [chIdx]);

  // ── Auto-scroll to highlighted verse ────────────────────────────────────
  useEffect(() => {
    if (curVerse >= 0 && verseEls.current[curVerse]) {
      verseEls.current[curVerse].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [curVerse]);

  // ── Sleep timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sleepLeft) return;
    if (sleepLeft <= 1) { stopTts(); setSleepLeft(0); return; }
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
  }, []);

  // ── TTS functions ────────────────────────────────────────────────────────
  function stopTts() {
    playRef.current.active = false;
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} audioRef.current = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    onAudioDuck && onAudioDuck(false);
    setTtsState("idle");
    setCurVerse(-1);
    setProgress(0);
  }

  function pauseTts() {
    if (ttsState !== "playing") return;
    playRef.current.active = false;
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if (window.speechSynthesis?.speaking) window.speechSynthesis.pause();
    onAudioDuck && onAudioDuck(false);
    setTtsState("paused");
  }

  function resumeTts() {
    if (ttsState !== "paused" || !verses) return;
    const idx = playRef.current.idx;
    if (audioRef.current?.paused && audioRef.current.currentTime > 0) {
      playRef.current.active = true;
      onAudioDuck && onAudioDuck(true);
      setTtsState("playing");
      audioRef.current.onended = () => {
        if (playRef.current.active) speakFrom(verses, idx + 1);
      };
      audioRef.current.play().catch(() => speakFrom(verses, idx));
    } else if (window.speechSynthesis?.paused) {
      playRef.current.active = true;
      onAudioDuck && onAudioDuck(true);
      setTtsState("playing");
      window.speechSynthesis.resume();
    } else {
      beginTts(verses, idx);
    }
  }

  function toggleTts() {
    if (!verses || verses === false) return;
    if (ttsState === "idle")   beginTts(verses, 0);
    else if (ttsState === "playing") pauseTts();
    else if (ttsState === "paused")  resumeTts();
  }

  function jumpToVerse(idx) {
    stopTts();
    setTimeout(() => beginTts(verses, idx), 80);
  }

  function beginTts(vList, startIdx) {
    stopTts();
    if (!vList || vList.length === 0) return;
    onAudioDuck && onAudioDuck(true);
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
  async function speakPuter(vList, startIdx, voice) {
    const total = vList.length;
    const step = async (idx) => {
      if (!playRef.current.active) return;
      if (idx >= total) {
        playRef.current.active = false;
        onAudioDuck && onAudioDuck(false);
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
          speakBrowser(vList, idx, TTS_VOICES.find(v => v.engine === "browser"));
          return;
        }
        if (!playRef.current.active) return;
        setTtsState("playing");
      }

      // Pre-fetch next verse
      const nextIdx = idx + 1;
      if (nextIdx < total && !cacheRef.current[nextIdx]) {
        puterSpeak(vList[nextIdx].text, voice.id, voice.lang, voice.engine)
          .then(a => { cacheRef.current[nextIdx] = a; })
          .catch(() => {});
      }

      audioRef.current = audio;
      audio.playbackRate = playRef.current.speed;
      audio.onended = () => { if (playRef.current.active) step(idx + 1); };
      audio.onerror = () => { if (playRef.current.active) step(idx + 1); };
      audio.play().catch(() => { if (playRef.current.active) step(idx + 1); });
    };
    step(startIdx);
  }

  // Browser Web Speech API fallback
  function speakBrowser(vList, startIdx, voice) {
    if (!window.speechSynthesis) { setTtsState("idle"); return; }
    window.speechSynthesis.cancel();
    const total = vList.length;
    const browserVoice = getBrowserVoice();
    const step = (idx) => {
      if (!playRef.current.active) return;
      if (idx >= total) {
        playRef.current.active = false;
        onAudioDuck && onAudioDuck(false);
        setTtsState("idle");
        setCurVerse(-1);
        setProgress(100);
        return;
      }
      setCurVerse(idx);
      setProgress(Math.round((idx / total) * 100));
      playRef.current.idx = idx;
      const utt = new SpeechSynthesisUtterance(vList[idx].text);
      utt.rate  = playRef.current.speed;
      utt.pitch = 1.0;
      if (browserVoice) utt.voice = browserVoice;
      utt.onend   = () => { if (playRef.current.active) step(idx + 1); };
      utt.onerror = (e) => { if (e.error !== "interrupted" && playRef.current.active) step(idx + 1); };
      window.speechSynthesis.speak(utt);
    };
    step(startIdx);
  }

  function changeSpeed(s) {
    setSpeed(s);
    playRef.current.speed = s;
    if (audioRef.current) audioRef.current.playbackRate = s;
  }

  // ── Voice picker sheet ───────────────────────────────────────────────────
  const VoicePicker = () => (
    <div style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"flex-end"}}
      onClick={() => setShowVoices(false)}>
      <div style={{background:T.surf,borderRadius:"18px 18px 0 0",padding:"20px 16px 36px",
        width:"100%",maxWidth:600,margin:"0 auto",maxHeight:"70vh",overflowY:"auto"}}
        onClick={e => e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,fontFamily:F}}>
          <div style={{fontSize:17,fontWeight:W.medium,color:T.text}}>Choose Voice</div>
          <button onClick={() => setShowVoices(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,padding:4}}>
            <XIc size={20}/>
          </button>
        </div>
        <div style={{fontSize:12,color:T.muted,marginBottom:18,fontFamily:F,lineHeight:1.5}}>
          Neural voices require internet. Device Voice always works offline.
        </div>
        {TTS_VOICES.map(v => (
          <button key={v.id} onClick={() => {
            localStorage.setItem("rest_tts_voice", v.id);
            setVoiceId(v.id);
            setShowVoices(false);
            if (ttsState === "playing" || ttsState === "paused") {
              const idx = playRef.current.idx;
              stopTts();
              cacheRef.current = {};
              setTimeout(() => beginTts(verses, idx), 120);
            }
          }} style={{
            width:"100%",padding:"14px 16px",marginBottom:8,borderRadius:12,
            background: voiceId === v.id ? T.gold + "22" : "transparent",
            border: `1px solid ${voiceId === v.id ? T.gold : T.brd}`,
            display:"flex",justifyContent:"space-between",alignItems:"center",
            cursor:"pointer",textAlign:"left",fontFamily:F,color:T.text
          }}>
            <div>
              <div style={{fontWeight:W.medium,fontSize:15,color:voiceId===v.id?T.gold:T.text}}>{v.label}</div>
              <div style={{color:T.muted,fontSize:12,marginTop:2}}>{v.desc}</div>
            </div>
            {voiceId === v.id && <span style={{color:T.gold,fontSize:16}}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  const sleepLabel = sleepLeft > 0 ? `${Math.ceil(sleepLeft/60)}m` : sleepMins ? `${sleepMins}m` : null;
  const isPlaying  = ttsState === "playing";
  const isLoading  = ttsState === "loading";
  const isPaused   = ttsState === "paused";

  return (
    <div style={{position:"fixed",inset:0,zIndex:700,background:T.bg,display:"flex",
      flexDirection:"column",fontFamily:F,color:T.text,overflow:"hidden"}}>

      {showVoices && <VoicePicker />}

      {/* ── HEADER (hidden in focus mode) ── */}
      {!focusMode && (
        <div style={{borderBottom:`1px solid ${T.brd}`,padding:"12px 14px",flexShrink:0,
          background:T.surf}}>
          {/* Top row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <button onClick={() => { stopTts(); onClose(); }}
              style={{background:"none",border:"none",cursor:"pointer",color:T.muted,
                padding:"6px 10px",borderRadius:8,display:"flex",alignItems:"center",gap:6,
                fontFamily:F,fontSize:13}}>
              <XIc size={18}/> Close
            </button>
            <div style={{textAlign:"center"}}>
              <div style={{fontWeight:W.medium,fontSize:16,color:T.text}}>{label}</div>
              <div style={{fontSize:11,color:T.gold,letterSpacing:2,textTransform:"uppercase"}}>KJV</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={() => setFontSize(s => Math.max(14, s-2))}
                style={{background:T.surf,border:`1px solid ${T.brd}`,borderRadius:7,
                  padding:"4px 8px",cursor:"pointer",color:T.muted,fontFamily:F,fontSize:13}}>A−</button>
              <button onClick={() => setFontSize(s => Math.min(32, s+2))}
                style={{background:T.surf,border:`1px solid ${T.brd}`,borderRadius:7,
                  padding:"4px 8px",cursor:"pointer",color:T.text,fontFamily:F,fontSize:15}}>A+</button>
              <button onClick={() => setFocus(true)}
                style={{background:T.surf,border:`1px solid ${T.brd}`,borderRadius:7,
                  padding:"6px 8px",cursor:"pointer",color:T.muted}}
                title="Focus mode (hide controls)">
                <ExpandIc/>
              </button>
              <button onClick={() => setTheme(t => t==="dark"?"light":"dark")}
                style={{background:T.surf,border:`1px solid ${T.brd}`,borderRadius:7,
                  padding:"6px 8px",cursor:"pointer",color:T.muted}}>
                {theme==="dark" ? <SunIc/> : <MoonIc/>}
              </button>
            </div>
          </div>

          {/* Chapter tabs (scrollable) */}
          {chapters.length > 1 && (
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
              {chapters.map((c, i) => (
                <button key={i} onClick={() => setChIdx(i)}
                  style={{flexShrink:0,padding:"6px 13px",borderRadius:20,
                    border:`1px solid ${chIdx===i ? T.gold : T.brd}`,
                    background: chIdx===i ? T.gold : "transparent",
                    color: chIdx===i ? (theme==="dark"?C_DARK.bg:C_LIGHT.bg) : T.muted,
                    fontSize:12,cursor:"pointer",fontFamily:F,whiteSpace:"nowrap"}}>
                  {c.book} {c.chapter}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Focus mode: minimal exit button */}
      {focusMode && (
        <button onClick={() => setFocus(false)}
          style={{position:"absolute",top:14,right:14,zIndex:10,background:T.surf+"CC",
            border:`1px solid ${T.brd}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",
            color:T.muted,fontFamily:F,fontSize:12}}>
          Exit focus
        </button>
      )}

      {/* ── VERSE CONTENT ── */}
      <div style={{flex:1,overflowY:"auto",padding:focusMode?"60px 24px 140px":"24px 20px 140px",
        maxWidth:700,margin:"0 auto",width:"100%"}}>

        {/* Loading */}
        {verses === null && (
          <div style={{textAlign:"center",paddingTop:80,color:T.muted,fontFamily:F}}>
            <div style={{fontSize:28,marginBottom:12,animation:"spin 1.2s linear infinite",
              display:"inline-block"}}>◌</div>
            <div>Loading {label}…</div>
          </div>
        )}

        {/* Error */}
        {verses === false && (
          <div style={{textAlign:"center",paddingTop:60,fontFamily:F}}>
            <div style={{fontSize:36,marginBottom:16}}>📖</div>
            <div style={{fontSize:16,fontWeight:W.medium,color:T.text,marginBottom:8}}>
              Couldn't load {label}
            </div>
            <div style={{fontSize:14,color:T.muted,marginBottom:20,lineHeight:1.6}}>
              Make sure all four rest-data-*.js files are uploaded alongside index.html.
            </div>
            <button onClick={() => {
              setVerses(null);
              kjvChapter(ch.book, ch.chapter).then(r => setVerses(r || false));
            }} style={{padding:"11px 22px",background:T.gold,border:"none",borderRadius:10,
              color:theme==="dark"?C_DARK.bg:C_LIGHT.bg,fontFamily:F,fontSize:14,
              fontWeight:W.medium,cursor:"pointer"}}>
              Try Again
            </button>
          </div>
        )}

        {/* Verses */}
        {verses && verses.length > 0 && (
          <>
            <h2 style={{fontWeight:W.thin,fontSize:26,marginBottom:28,textAlign:"center",
              letterSpacing:"0.02em",color:T.text}}>{label}</h2>
            {verses.map((v, i) => (
              <div key={v.verse}
                ref={el => verseEls.current[i] = el}
                onClick={() => jumpToVerse(i)}
                style={{
                  marginBottom: Math.round(fontSize * lineH * 0.6),
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: curVerse === i ? T.gold + "18" : "transparent",
                  borderLeft: curVerse === i ? `3px solid ${T.gold}` : "3px solid transparent",
                  transition: "all 0.2s ease",
                }}>
                <span style={{fontSize:11,color:T.gold,fontWeight:W.medium,
                  marginRight:7,verticalAlign:"super"}}>{v.verse}</span>
                <span style={{fontSize:fontSize,lineHeight:lineH,color:T.text,
                  opacity: curVerse >= 0 && curVerse !== i ? 0.6 : 1,
                  transition:"opacity 0.2s"}}>
                  {v.text}
                </span>
              </div>
            ))}
            <div style={{textAlign:"center",marginTop:20,padding:"16px 0",
              fontSize:11,color:T.muted,letterSpacing:"0.04em"}}>
              — end of {label} · tap any verse to listen from there —
            </div>
          </>
        )}
      </div>

      {/* ── AUDIO PLAYER BAR ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,
        background:T.surf+"FA",borderTop:`1px solid ${T.brd}`,
        backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",
        padding:"10px 14px 24px",maxWidth:700,margin:"0 auto"}}>

        {/* Scrub bar */}
        <div style={{height:3,background:T.brd,borderRadius:100,marginBottom:10,overflow:"hidden",
          cursor:"pointer"}}>
          <div style={{width:`${progress}%`,height:"100%",background:T.gold,
            borderRadius:100,transition:"width 0.3s ease"}}/>
        </div>

        {/* Controls row */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>

          {/* Voice selector */}
          <button onClick={() => setShowVoices(true)}
            style={{flex:1,padding:"8px 10px",background:"transparent",
              border:`1px solid ${T.brd}`,borderRadius:10,cursor:"pointer",
              display:"flex",alignItems:"center",gap:8,minWidth:0,color:T.text,
              fontFamily:F}}>
            <span style={{color:isPlaying?T.gold:T.muted,flexShrink:0}}><HeadIc/></span>
            <div style={{flex:1,minWidth:0,textAlign:"left"}}>
              <div style={{fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase"}}>Voice</div>
              <div style={{fontWeight:W.medium,fontSize:14,color:T.text,
                whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {TTS_VOICES.find(v=>v.id===voiceId)?.label || "Matthew"}
              </div>
            </div>
            <span style={{color:T.gold,fontSize:10,flexShrink:0}}>▾</span>
          </button>

          {/* Status / verse count */}
          <div style={{fontSize:11,color:T.muted,minWidth:52,textAlign:"center",fontFamily:F}}>
            {isLoading  ? "loading…"
              : isPlaying ? `${curVerse+1}/${verses?.length||"?"}`
              : isPaused  ? "paused"
              : verses?.length ? `${verses.length} v.`
              : ""}
          </div>

          {/* Speed */}
          <div style={{display:"flex",gap:3}}>
            {[0.8,1,1.2,1.5].map(s => (
              <button key={s} onClick={() => changeSpeed(s)}
                style={{padding:"5px 8px",borderRadius:6,fontFamily:F,fontSize:10,
                  cursor:"pointer",
                  background: speed===s ? T.gold : "transparent",
                  border: `1px solid ${speed===s ? T.gold : T.brd}`,
                  color: speed===s ? (theme==="dark"?C_DARK.bg:C_LIGHT.bg) : T.muted,
                  fontWeight: speed===s ? W.medium : W.regular}}>
                {s}×
              </button>
            ))}
          </div>

          {/* Sleep timer */}
          <button onClick={() => {
            const opts = [0, 15, 30, 45, 60];
            const next = opts[(opts.indexOf(sleepMins)+1) % opts.length];
            setSleepMins(next);
            setSleepLeft(next * 60);
          }} style={{background:"transparent",border:`1px solid ${sleepMins?T.gold:T.brd}`,
            borderRadius:8,padding:"6px 8px",cursor:"pointer",
            color:sleepMins?T.gold:T.muted,fontFamily:F,fontSize:11,minWidth:32,
            textAlign:"center"}}
            title="Sleep timer">
            {sleepLabel || "💤"}
          </button>

          {/* Stop */}
          {(isPlaying || isPaused) && (
            <button onClick={stopTts}
              style={{background:"transparent",border:`1px solid ${T.brd}`,
                borderRadius:8,padding:"9px",cursor:"pointer",color:T.muted}}>
              <StopIc/>
            </button>
          )}

          {/* Play / Pause — large gold button */}
          <button onClick={toggleTts}
            disabled={!verses || verses === false}
            style={{
              background: (!verses || verses===false) ? T.brd : T.gold,
              border:"none",borderRadius:"50%",width:52,height:52,
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor: (!verses||verses===false) ? "not-allowed" : "pointer",
              color: theme==="dark" ? C_DARK.bg : C_LIGHT.bg,
              flexShrink:0,
              boxShadow: isPlaying ? `0 0 20px ${T.gold}88` : "none",
              transition:"box-shadow 0.3s",
            }}>
            {isLoading
              ? <span style={{fontSize:16,animation:"spin 0.9s linear infinite",display:"inline-block"}}>◌</span>
              : isPlaying ? <PauseIc/>
              : <PlayIc/>}
          </button>
        </div>

        {/* Complete reading button */}
        {onComplete && verses && verses.length > 0 && (
          <button onClick={() => { stopTts(); onComplete(); }}
            style={{width:"100%",marginTop:12,padding:"12px",
              background:"transparent",border:`1px solid ${T.brd}`,
              borderRadius:10,color:T.muted,cursor:"pointer",
              fontFamily:F,fontSize:13,display:"flex",alignItems:"center",
              justifyContent:"center",gap:8}}>
            <CheckIc size={15}/> Mark Reading Complete
          </button>
        )}
      </div>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════════════
// REST — "Find Rest In Him"  ·  Apostolic Devotional Platform
// ═══════════════════════════════════════════════════════════════════════════
//
// IMPLEMENTATION PLAN / ARCHITECTURE (summary)
// ───────────────────────────────────────────────────────────────────────────
// PILLARS: Bible Reading · Prayer · Rest. Every feature serves one of these.
//
// TECH STACK (this build): single HTML file, React 18 + Babel (no build step),
//   KJV embedded (rest-data-*.js, public domain), Puter.js neural TTS,
//   Web Audio API ambient pads, Fullscreen API, Service Worker + manifest (PWA).
//
// AUTH ARCHITECTURE: a pluggable `authAdapter` (see AUTH section). This build
//   ships LOCAL accounts (localStorage, hashed-ish) so it works on GitHub Pages
//   with zero backend. To enable real Google sign-in / password reset /
//   cross-device sync, implement the adapter against Firebase Auth + Firestore
//   (stubs + instructions included). We DO NOT fake cloud sync.
//
// DATA MODEL (localStorage, versioned rest_v7):
//   user{ name,email,plan } · completed{dayNum:ts} · notes{dayNum:text}
//   reread{dayNum:bool} · prayer{ sessions[], challengeLevel, streak }
//   journal[] · meditate{ lastTopic } · settings{ theme,fontSize,lineHeight }
//
// AUDIO: generated ambient pads built-in; AUDIO_MANIFEST lists worship/nature
//   tracks with PLACEHOLDER urls — swap in royalty-free files you have rights to.
//
// PWA: manifest + service worker are injected at runtime (see registerPWA()).
//   For full offline install, also host manifest.webmanifest + sw.js (the code
//   writes them as blobs; on GitHub Pages add real files for best results).
// ───────────────────────────────────────────────────────────────────────────

const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;

const BRAND   = "REST";
const TAGLINE = "Find Rest In Him";

// ─── TYPOGRAPHY — Helvetica Neue only ───────────────────────────────────────
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
// weight helpers per spec
const W = { thin:200, light:300, regular:400, medium:500 };

// ─── DESIGN TOKENS — soft, warm, premium, Apostolic gold-on-deep ────────────
const C = {
  bg:      "#0A0A0C",
  bg2:     "#101015",
  surface: "#16171C",
  surface2:"#1C1E25",
  text:    "#F4F2EC",
  muted:   "#8A8A93",
  faint:   "#55565E",
  gold:    "#E0A33B",
  goldSoft:"#C9923A",
  goldGlow:"rgba(224,163,59,0.18)",
  line:    "#26272E",
  warmWhite:"#F4F2EC",
};

// ─── KJV DATA (public domain, embedded) ─────────────────────────────────────
function buildPlan(scope, days, startISO){
  const chapters=buildAllChapters(scope);
  const start=new Date(startISO||new Date().toISOString().split("T")[0]).getTime();
  const plan=[]; let ci=0;
  for(let d=0; d<days; d++){
    const date=new Date(start+d*86400000).toISOString().split("T")[0];
    const remaining=chapters.length-ci, left=days-d;
    const n=Math.max(1,Math.ceil(remaining/left));
    const grouped={};
    for(let i=0;i<n&&ci<chapters.length;i++,ci++){const{book,chapter}=chapters[ci];(grouped[book]=grouped[book]||[]).push(chapter);}
    const readings=[],chs=[];
    for(const[book,arr]of Object.entries(grouped)){
      const ranges=[];let s=arr[0],e=arr[0];
      for(let i=1;i<arr.length;i++){if(arr[i]===e+1)e=arr[i];else{ranges.push(s===e?`${s}`:`${s}–${e}`);s=e=arr[i];}}
      ranges.push(s===e?`${s}`:`${s}–${e}`);
      readings.push(`${book} ${ranges.join(", ")}`);
      for(const c of arr) chs.push({book,chapter:c});
    }
    if(readings.length) plan.push({day:d+1,date,readings,chapters:chs});
  }
  return plan;
}
// Catch-up: keep finish date fixed, redistribute unread chapters from today.
function recalcPlan(scope, completedDays, currentPlan, endISO){
  const all=buildAllChapters(scope);
  const readIdx=new Set();
  for(const dn of completedDays){
    const e=currentPlan.find(d=>d.day===dn); if(!e)continue;
    for(const ch of e.chapters){const i=all.findIndex(c=>c.book===ch.book&&c.chapter===ch.chapter);if(i>=0)readIdx.add(i);}
  }
  const remaining=all.filter((_,i)=>!readIdx.has(i)); if(!remaining.length)return[];
  const today=new Date().toISOString().split("T")[0];
  const start=new Date(today).getTime(), end=new Date(endISO).getTime();
  const days=Math.max(1,Math.round((end-start)/86400000)+1);
  const plan=[]; let ci=0;
  for(let d=0; d<days; d++){
    const date=new Date(start+d*86400000).toISOString().split("T")[0];
    const rem=remaining.length-ci,left=days-d,n=Math.max(1,Math.ceil(rem/left));
    const grouped={};
    for(let i=0;i<n&&ci<remaining.length;i++,ci++){const{book,chapter}=remaining[ci];(grouped[book]=grouped[book]||[]).push(chapter);}
    const readings=[],chs=[];
    for(const[book,arr]of Object.entries(grouped)){
      const ranges=[];let s=arr[0],e=arr[0];
      for(let i=1;i<arr.length;i++){if(arr[i]===e+1)e=arr[i];else{ranges.push(s===e?`${s}`:`${s}–${e}`);s=e=arr[i];}}
      ranges.push(s===e?`${s}`:`${s}–${e}`);
      readings.push(`${book} ${ranges.join(", ")}`);
      for(const c of arr) chs.push({book,chapter:c});
    }
    if(readings.length) plan.push({day:d+1,date,readings,chapters:chs});
  }
  return plan;
}

// ─── VERSE OF THE DAY pool (KJV refs; text pulled from embedded data) ────────
const VOTD = [
  {book:"Matthew",chapter:11,verse:28,ref:"Matthew 11:28"},
  {book:"Psalms",chapter:23,verse:1,ref:"Psalm 23:1"},
  {book:"Isaiah",chapter:40,verse:31,ref:"Isaiah 40:31"},
  {book:"Philippians",chapter:4,verse:13,ref:"Philippians 4:13"},
  {book:"Proverbs",chapter:3,verse:5,ref:"Proverbs 3:5"},
  {book:"John",chapter:14,verse:27,ref:"John 14:27"},
  {book:"Psalms",chapter:46,verse:10,ref:"Psalm 46:10"},
  {book:"Joshua",chapter:1,verse:9,ref:"Joshua 1:9"},
  {book:"Romans",chapter:8,verse:28,ref:"Romans 8:28"},
  {book:"Matthew",chapter:6,verse:33,ref:"Matthew 6:33"},
  {book:"Psalms",chapter:91,verse:1,ref:"Psalm 91:1"},
  {book:"2 Corinthians",chapter:12,verse:9,ref:"2 Corinthians 12:9"},
];

// ─── (Prayer) PRAYER PATH — 12-step "How to Pray for an Hour" ──────────────
// NOT a circular wheel: rendered as a vertical timeline (Prayer Path) with a
// gold progress rail. Each step has a POOL of verses that rotate every 15s,
// plus rotating micro-prompts. Default 5 min/step, user-adjustable.
const PRAYER_WHEEL = [
  {id:"praise1", name:"Praise", refs:[["Psalms",22,3],["Psalms",63,3],["Hebrews",13,15]],
    prompts:["Magnify who God is — His holiness, His majesty.","Offer the sacrifice of praise with your lips.","Declare His worth above every circumstance."]},
  {id:"forgive", name:"Forgiveness", refs:[["Matthew",6,14],["Matthew",6,15]],
    prompts:["Release anyone who has wronged you.","Forgive as you have been forgiven.","Let no root of bitterness remain."]},
  {id:"confess", name:"Confession", refs:[["Psalms",139,23],["Psalms",139,24],["Psalms",66,18]],
    prompts:["Invite God to search your heart.","Name and confess what He reveals.","Turn from every hidden thing."]},
  {id:"petition",name:"Petition", refs:[["James",4,2],["James",4,3],["Matthew",6,11]],
    prompts:["Bring your own needs honestly to God.","Ask according to His will.","Cast your daily cares on Him."]},
  {id:"intercede",name:"Intercession", refs:[["1 Timothy",2,1],["1 Timothy",2,2],["Matthew",9,38]],
    prompts:["Stand in the gap for the lost.","Pray for leaders and authorities.","Ask the Lord to send laborers."]},
  {id:"readbible",name:"Read the Bible", refs:[["2 Timothy",3,16],["Psalms",19,9],["Psalms",119,105]],
    prompts:["Let Scripture speak before you do.","Read slowly; let the Word search you.","Receive it as God-breathed truth."]},
  {id:"meditate",name:"Meditation", refs:[["Psalms",1,2],["Psalms",46,10],["Psalms",77,12]],
    prompts:["Be still and know that He is God.","Ponder His works and His Word.","Dwell on one truth deeply."]},
  {id:"thanks",  name:"Thanksgiving", refs:[["Philippians",4,6],["Psalms",100,4],["1 Thessalonians",5,18]],
    prompts:["Thank Him for answered prayer.","Give thanks in everything.","Count His mercies one by one."]},
  {id:"praytheword",name:"Pray the Word", refs:[["Isaiah",55,11],["Jeremiah",1,12],["Hebrews",4,12]],
    prompts:["Pray a verse back to God, personally.","Apply Scripture aloud over your life.","Let His Word shape your asking."]},
  {id:"singing", name:"Singing", refs:[["Psalms",100,2],["Ephesians",5,19],["Psalms",95,1]],
    prompts:["Sing to the Lord a new song.","Make melody in your heart to Him.","Worship Him in spirit and truth."]},
  {id:"listen",  name:"Listening", refs:[["1 Kings",19,12],["Psalms",46,10],["1 Samuel",3,9]],
    prompts:["Be quiet and listen for His voice.","Wait on the still small voice.","Say: Speak Lord, Your servant hears."]},
  {id:"praise2", name:"Praise (Conclude)", refs:[["Matthew",6,13],["Psalms",52,9],["Jude",1,25]],
    prompts:["Close as you began — in praise.","His is the kingdom and the power.","Seal this hour with thanksgiving."]},
];

// ─── (Prayer) CHALLENGE LEVELS ──────────────────────────────────────────────
const PRAYER_LEVELS = [
  {id:0,name:"Beginner",      minutes:5,  desc:"5 Minutes Daily"},
  {id:1,name:"Growing",       minutes:15, desc:"15 Minutes Daily"},
  {id:2,name:"Disciple",      minutes:30, desc:"30 Minutes Daily"},
  {id:3,name:"Watchman",      minutes:60, desc:"60 Minutes Daily"},
  {id:4,name:"Prayer Warrior",minutes:120,desc:"120 Minutes Daily"},
];

// ─── (Meditate) TOPICS — Bible Promise style, KJV refs ──────────────────────
const MEDITATE_TOPICS = [
  {id:"peace",   name:"Peace",        refs:[["John",14,27],["Philippians",4,7],["Isaiah",26,3],["Psalms",4,8]]},
  {id:"rest",    name:"Rest",         refs:[["Matthew",11,28],["Psalms",23,2],["Exodus",33,14],["Hebrews",4,9]]},
  {id:"faith",   name:"Faith",        refs:[["Hebrews",11,1],["Mark",11,22],["Romans",10,17],["2 Corinthians",5,7]]},
  {id:"fear",    name:"Fear",         refs:[["Isaiah",41,10],["2 Timothy",1,7],["Psalms",27,1],["Joshua",1,9]]},
  {id:"anxiety", name:"Anxiety",      refs:[["Philippians",4,6],["1 Peter",5,7],["Matthew",6,34],["Psalms",55,22]]},
  {id:"healing", name:"Healing",      refs:[["Isaiah",53,5],["Psalms",103,3],["James",5,15],["Jeremiah",17,14]]},
  {id:"salvation",name:"Salvation",   refs:[["Acts",2,38],["Romans",10,9],["John",3,5],["Mark",16,16]]},
  {id:"prayer",  name:"Prayer",       refs:[["Matthew",7,7],["1 Thessalonians",5,17],["James",5,16],["Philippians",4,6]]},
  {id:"strength",name:"Strength",     refs:[["Isaiah",40,31],["Philippians",4,13],["Psalms",46,1],["Nehemiah",8,10]]},
  {id:"forgive", name:"Forgiveness",  refs:[["1 John",1,9],["Ephesians",4,32],["Colossians",3,13],["Matthew",6,14]]},
  {id:"joy",     name:"Joy",          refs:[["Nehemiah",8,10],["Psalms",16,11],["John",15,11],["Psalms",30,5]]},
  {id:"hope",    name:"Hope",         refs:[["Romans",15,13],["Jeremiah",29,11],["Psalms",42,11],["Hebrews",6,19]]},
  {id:"direction",name:"Direction",   refs:[["Proverbs",3,5],["Psalms",32,8],["Isaiah",30,21],["Proverbs",16,9]]},
  {id:"holiness",name:"Holiness",     refs:[["1 Peter",1,16],["Hebrews",12,14],["2 Corinthians",7,1],["Romans",12,1]]},
  {id:"holyghost",name:"The Holy Ghost",refs:[["Acts",2,4],["Acts",1,8],["John",14,26],["Romans",8,26]]},
  {id:"trust",   name:"Trusting God", refs:[["Proverbs",3,5],["Psalms",37,5],["Isaiah",26,4],["Nahum",1,7]]},
  {id:"promises",name:"God's Promises",refs:[["2 Corinthians",1,20],["2 Peter",1,4],["Hebrews",10,23],["Numbers",23,19]]},
  {id:"comfort", name:"Comfort",      refs:[["2 Corinthians",1,3],["Psalms",34,18],["Matthew",5,4],["Psalms",23,4]]},
  {id:"guidance",name:"Guidance",     refs:[["Psalms",119,105],["Proverbs",3,6],["John",16,13],["Psalms",25,9]]},
  {id:"protection",name:"Protection", refs:[["Psalms",91,1],["Psalms",121,7],["Isaiah",54,17],["2 Thessalonians",3,3]]},
  {id:"victory", name:"Victory",      refs:[["1 Corinthians",15,57],["Romans",8,37],["1 John",5,4],["Deuteronomy",20,4]]},
];

// ─── (E) MUSIC — instrumental only (three curated tracks) ──────────────────
// Built-in ambient pads kept as offline fallback. The three MP3s ship beside
// the HTML (rest-music-1..3.mp3). All instrumental — no vocals/lyrics.
const AUDIO_MANIFEST = [
  {id:"track1", cat:"Instrumental", title:"Anhedonia",        url:"rest-music-1.mp3"},
  {id:"track2", cat:"Instrumental", title:"Saying Goodbye",   url:"rest-music-2.mp3"},
  {id:"track3", cat:"Instrumental", title:"I Wish I Told You",url:"rest-music-3.mp3"},
  {id:"pad-calm", cat:"Ambient Pads", title:"Stillness (built-in)", gen:"calm"},
  {id:"pad-warm", cat:"Ambient Pads", title:"Glory (built-in)",     gen:"warm"},
];
// Pixabay instrumental catalog (optional): set PIXABAY_KEY to enable search.
// GET https://pixabay.com/api/audio/?key=KEY&q=meditation  (license review first)
const PIXABAY_KEY = ""; // add your key to enable the in-app instrumental search


// ─── STORAGE (v7, migrates from v6/v5/v4) ───────────────────────────────────
const SKEY="rest_v7";
function loadState(){
  try{
    const v7=localStorage.getItem(SKEY); if(v7)return JSON.parse(v7);
    for(const o of ["rest_v6","rest_v5","rest_v4"]){const r=localStorage.getItem(o);if(r){const s=JSON.parse(r);localStorage.setItem(SKEY,JSON.stringify(s));return s;}}
  }catch{}
  return {};
}
const saveState=s=>{try{localStorage.setItem(SKEY,JSON.stringify(s));}catch{}};

// ─── AUTH ADAPTER (pluggable) ───────────────────────────────────────────────
// LOCAL implementation (works offline, no backend). To enable real Google
// sign-in, password reset, and cross-device sync, replace these methods with
// Firebase Auth + Firestore calls (see commented stubs). Same interface.
const AKEY="rest_auth_v7";
const authAdapter = {
  current(){ try{return JSON.parse(localStorage.getItem(AKEY))||null;}catch{return null;} },
  _users(){ try{return JSON.parse(localStorage.getItem(AKEY+"_users"))||{};}catch{return{};} },
  _saveUsers(u){ try{localStorage.setItem(AKEY+"_users",JSON.stringify(u));}catch{} },
  _hash(p){ let h=0; for(let i=0;i<p.length;i++){h=(h<<5)-h+p.charCodeAt(i);h|=0;} return String(h); },
  signUp(name,email,password){
    const users=this._users(); email=email.toLowerCase().trim();
    if(!email||!password) throw new Error("Email and password required.");
    if(users[email]) throw new Error("An account with that email already exists.");
    users[email]={name,email,pass:this._hash(password)}; this._saveUsers(users);
    const u={name,email}; localStorage.setItem(AKEY,JSON.stringify(u)); return u;
  },
  signIn(email,password){
    const users=this._users(); email=email.toLowerCase().trim();
    const rec=users[email];
    if(!rec||rec.pass!==this._hash(password)) throw new Error("Invalid email or password.");
    const u={name:rec.name,email}; localStorage.setItem(AKEY,JSON.stringify(u)); return u;
  },
  google(){
    // STUB: real impl → firebase signInWithPopup(googleProvider).
    const u={name:"Guest",email:"guest@rest.local",google:true};
    localStorage.setItem(AKEY,JSON.stringify(u)); return u;
  },
  reset(email){
    // STUB: real impl → firebase sendPasswordResetEmail(email).
    const users=this._users(); if(!users[email.toLowerCase().trim()]) throw new Error("No account with that email.");
    return true; // pretend email sent (local mode)
  },
  signOut(){ localStorage.removeItem(AKEY); },
};
/* FIREBASE WIRING (optional, enables real sync):
   1) Add firebase SDK <script> tags. 2) Init app+auth+firestore.
   3) Replace authAdapter methods with: createUserWithEmailAndPassword,
      signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup,
      signOut, onAuthStateChanged. 4) Mirror loadState/saveState to a Firestore
      doc keyed by uid for cross-device sync. */

const todayISO=()=>new Date().toISOString().split("T")[0];
const fmtDate=iso=>{const[y,m,d]=iso.split("-");return new Date(+y,+m-1,+d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});};

// ─── (E) FOCUS AUDIO HOOK (built-in pads + url tracks, TTS ducking) ─────────
function useFocusAudio(){
  const [track,setTrack]=useState(null);
  const [playing,setPlaying]=useState(false);
  const [volume,setVolume]=useState(0.5);
  const elRef=useRef(null),ctxRef=useRef(null),padRef=useRef(null),duckRef=useRef(1),volRef=useRef(0.5);
  function applyVol(){const e=volRef.current*duckRef.current;if(elRef.current)elRef.current.volume=Math.min(1,e);if(padRef.current?.master&&ctxRef.current)padRef.current.master.gain.setTargetAtTime(e*0.4,ctxRef.current.currentTime,0.15);}
  function stopGen(){if(padRef.current){try{padRef.current.nodes.forEach(n=>{try{n.stop();}catch{}});}catch{}padRef.current=null;}}
  function buildGen(kind){
    stopGen(); const ctx=ctxRef.current||new(window.AudioContext||window.webkitAudioContext)(); ctxRef.current=ctx;
    if(ctx.state==="suspended")ctx.resume();
    const master=ctx.createGain(); master.gain.value=volRef.current*0.4*duckRef.current; master.connect(ctx.destination);
    const freqs= kind==="deep"?[82.41,110,164.81]: kind==="warm"?[110,164.81,220,329.63]:[110,138.59,164.81];
    const nodes=[];
    for(const f of freqs){const o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";o.frequency.value=f;g.gain.value=0.2;o.connect(g);g.connect(master);o.start();nodes.push(o);}
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=0.06;lg.gain.value=0.05;lfo.connect(lg);lg.connect(master.gain);lfo.start();nodes.push(lfo);
    padRef.current={master,nodes};
  }
  function play(t){
    if(elRef.current){elRef.current.pause();elRef.current=null;} stopGen(); setTrack(t);
    if(t.url){
      const a=new Audio(t.url);
      a.loop=true;
      a.volume=Math.min(1,volRef.current*duckRef.current);
      a.addEventListener("canplaythrough",()=>{
        a.play().then(()=>{elRef.current=a;setPlaying(true);}).catch(err=>{
          console.error("Audio play() blocked:",err,"url:",t.url);
          buildGen(t.gen||"calm"); setPlaying(true);
        });
      },{once:true});
      a.addEventListener("error",()=>{
        console.error("Audio load error for:",t.url);
        buildGen(t.gen||"calm"); setPlaying(true);
      });
      a.load();
    } else {
      buildGen(t.gen||"calm"); setPlaying(true);
    }
  }
  function toggle(){if(!track)return;if(playing){if(elRef.current)elRef.current.pause();if(ctxRef.current)ctxRef.current.suspend();setPlaying(false);}else{if(elRef.current)elRef.current.play();else if(ctxRef.current)ctxRef.current.resume();else buildGen(track.gen||"calm");setPlaying(true);}}
  function stop(){if(elRef.current){elRef.current.pause();elRef.current=null;}stopGen();if(ctxRef.current){try{ctxRef.current.suspend();}catch{}}setPlaying(false);setTrack(null);}
  function setVol(v){setVolume(v);volRef.current=v;applyVol();}
  function duck(a){duckRef.current=a?0.18:1;applyVol();}
  return {track,playing,volume,play,toggle,stop,setVol,duck};
}

// ─── ICONS (flat, monochrome, currentColor) ─────────────────────────────────
const Ic=({d,size=22,sw=1.5,fill="none"})=>(<svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}</svg>);
const HomeIc =()=><Ic d={["M3 9.5 12 3l9 6.5","M5 9.5V21h14V9.5","M9 21v-6h6v6"]}/>;
const BookIc =()=><Ic d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>;
const PrayIc =()=><Ic d={["M12 2c-1 3-1 5-3 7-1.5 1.5-2 3-2 5a5 5 0 0 0 10 0c0-2-.5-3.5-2-5-2-2-2-4-3-7z","M9 21h6"]}/>;
const MedIc  =()=><Ic d={["M12 3a9 9 0 1 0 9 9","M12 7v5l3 2","M19 3v4M17 5h4"]}/>;
const JournalIc=()=><Ic d={["M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z","M8 8h8M8 12h6"]}/>;
const UserIc =()=><Ic d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]}/>;
const PeopleIc=()=><Ic d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]}/>;
const FireIc =()=><Ic d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>;
const PlayIc =()=><Ic d="M5 3l14 9-14 9V3z" fill="currentColor"/>;
const PauseIc=()=><svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>;
const StopIc =()=><svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>;
const XIc    =({size=22})=><Ic d="M18 6 6 18M6 6l12 12" size={size}/>;
const ChevR  =()=><Ic d="M9 18 15 12 9 6"/>;
const ChevL  =()=><Ic d="M15 18 9 12 15 6"/>;
const ShareIc=()=><Ic d={["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8","M16 6l-4-4-4 4","M12 2v13"]}/>;
const HeartIc=({fill="none"})=><Ic d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" fill={fill}/>;
const ExpandIc=()=><Ic d={["M8 3H5a2 2 0 0 0-2 2v3","M16 3h3a2 2 0 0 1 2 2v3","M8 21H5a2 2 0 0 1-2-2v-3","M16 21h3a2 2 0 0 0 2-2v-3"]}/>;
const HeadIc =()=><Ic d={["M3 18v-6a9 9 0 0 1 18 0v6","M3 18a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z","M21 18a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"]}/>;
const MusicIc=()=><Ic d={["M9 18V5l12-2v13","M6 15a3 3 0 1 0 3 3","M18 13a3 3 0 1 0 3 3"]}/>;
const PlusIc =()=><Ic d="M12 5v14M5 12h14"/>;
const SearchIc=()=><Ic d={["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z","M21 21l-4.3-4.3"]}/>;
const CheckIc=({size=16})=><Ic d="M20 6 9 17 4 12" size={size}/>;
const BookmarkIc=({fill="none"})=><Ic d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill={fill}/>;
const SunIc=()=><Ic d={["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z","M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"]}/>;
const MoonIc=()=><Ic d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>;
const ChartIc=()=><Ic d={["M3 3v18h18","M7 14l4-4 3 3 5-6"]}/>;
const FastIc=()=><Ic d={["M12 2a10 10 0 1 0 10 10","M12 7v5l3 2","M2 2l20 20"]}/>;
const TrashIc=()=><Ic d={["M3 6h18","M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2","M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"]}/>;
const UsersPlusIc=()=><Ic d={["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M19 8v6M22 11h-6"]}/>;
const LockIc=({fill="none"})=><Ic d={["M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z","M8 11V7a4 4 0 0 1 8 0v4"]} fill={fill}/>;
const ClockIc=()=><Ic d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"]}/>;


// ─── SPLASH (matches mockup: glow → "Come unto me" → line → REST) ───────────
function Splash({onDone}){
  const [phase,setPhase]=useState(0); // 0 glow,1 come,2 line,3 rest,4 fade
  useEffect(()=>{
    const t=[
      setTimeout(()=>setPhase(1),1600),
      setTimeout(()=>setPhase(2),3400),
      setTimeout(()=>setPhase(3),4600),
      setTimeout(()=>setPhase(4),7200),
      setTimeout(()=>onDone(),8000),
    ];
    return ()=>t.forEach(clearTimeout);
  },[]);
  return (
    <div onClick={onDone} style={{position:"fixed",inset:0,zIndex:1000,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
      opacity:phase===4?0:1,transition:"opacity 0.8s ease",overflow:"hidden",fontFamily:F}}>
      {/* glow */}
      <div style={{position:"absolute",width:"min(80vw,520px)",height:"min(80vw,520px)",borderRadius:"50%",
        background:`radial-gradient(circle, rgba(224,163,59,0.42) 0%, rgba(224,163,59,0.12) 30%, transparent 65%)`,
        opacity:phase===0?1:phase===1?0.5:0.18,transform:`scale(${phase===0?1:1.25})`,transition:"opacity 2s ease, transform 4s ease"}}/>
      {/* phase 1: come unto me */}
      <div style={{position:"absolute",textAlign:"center",opacity:phase===1?1:0,transition:"opacity 1.2s ease"}}>
        <div style={{fontSize:"clamp(26px,6vw,40px)",fontWeight:W.thin,color:C.text,letterSpacing:"0.01em",fontStyle:"italic"}}>Come unto me.</div>
        <div style={{width:34,height:1,background:C.gold,margin:"22px auto 0",opacity:0.7}}/>
      </div>
      {/* phase 2: line */}
      <div style={{position:"absolute",width:"70%",maxWidth:520,height:1,
        background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,
        opacity:phase===2?1:0,boxShadow:`0 0 18px 2px ${C.goldGlow}`,
        transform:`scaleX(${phase>=2?1:0.2})`,transition:"opacity 0.8s ease, transform 1s ease"}}/>
      {/* phase 3+: REST */}
      <div style={{position:"absolute",textAlign:"center",opacity:phase>=3?1:0,transition:"opacity 1.4s ease"}}>
        <div style={{fontSize:"clamp(40px,11vw,76px)",fontWeight:W.thin,color:C.gold,letterSpacing:"0.34em",paddingLeft:"0.34em"}}>{BRAND}</div>
        <div style={{marginTop:14,fontSize:"clamp(12px,3vw,15px)",fontWeight:W.light,color:C.muted,fontStyle:"italic",letterSpacing:"0.05em",opacity:phase>=3?1:0,transition:"opacity 1.4s ease 0.6s"}}>{TAGLINE}</div>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ────────────────────────────────────────────────────────────
function AuthScreen({onAuth}){
  const [mode,setMode]=useState("in"); // in | up | reset
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[pass,setPass]=useState("");
  const [err,setErr]=useState(""),[msg,setMsg]=useState("");
  const inp={width:"100%",padding:"14px 16px",background:C.surface,border:`1px solid ${C.line}`,borderRadius:12,color:C.text,fontFamily:F,fontSize:15,boxSizing:"border-box",marginBottom:12};
  function submit(){
    setErr("");setMsg("");
    try{
      if(mode==="up"){ if(!name.trim())throw new Error("Please enter your name."); onAuth(authAdapter.signUp(name,email,pass)); }
      else if(mode==="in"){ onAuth(authAdapter.signIn(email,pass)); }
      else { authAdapter.reset(email); setMsg("If an account exists, a reset link has been sent."); }
    }catch(e){ setErr(e.message); }
  }
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:F,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:"120vw",height:"60vh",
        background:`radial-gradient(ellipse, ${C.goldGlow} 0%, transparent 60%)`,pointerEvents:"none"}}/>
      <div style={{maxWidth:380,width:"100%",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{fontSize:44,fontWeight:W.thin,color:C.gold,letterSpacing:"0.3em",paddingLeft:"0.3em"}}>{BRAND}</div>
          <div style={{marginTop:8,fontSize:13,fontWeight:W.light,color:C.muted,fontStyle:"italic"}}>{TAGLINE}</div>
        </div>
        {mode==="up"&&<input style={inp} placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>}
        <input style={inp} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        {mode!=="reset"&&<input style={inp} type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>}
        {err&&<div style={{color:"#E0746A",fontSize:13,marginBottom:12}}>{err}</div>}
        {msg&&<div style={{color:C.gold,fontSize:13,marginBottom:12}}>{msg}</div>}
        <button onClick={submit} style={{width:"100%",padding:"14px",background:C.gold,border:"none",borderRadius:12,color:C.bg,fontSize:16,fontWeight:W.medium,cursor:"pointer",fontFamily:F,marginBottom:12}}>
          {mode==="up"?"Create Account":mode==="in"?"Sign In":"Send Reset Link"}
        </button>
        {mode!=="reset"&&(
          <button onClick={()=>onAuth(authAdapter.google())} style={{width:"100%",padding:"13px",background:"transparent",border:`1px solid ${C.line}`,borderRadius:12,color:C.text,fontSize:14,cursor:"pointer",fontFamily:F,marginBottom:18,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <span style={{fontWeight:W.medium}}>G</span> Continue with Google
          </button>
        )}
        <div style={{textAlign:"center",fontSize:13,color:C.muted}}>
          {mode==="in"&&<>New here? <a onClick={()=>setMode("up")} style={lnk}>Create account</a> · <a onClick={()=>setMode("reset")} style={lnk}>Forgot?</a></>}
          {mode==="up"&&<>Have an account? <a onClick={()=>setMode("in")} style={lnk}>Sign in</a></>}
          {mode==="reset"&&<><a onClick={()=>setMode("in")} style={lnk}>Back to sign in</a></>}
        </div>
        <div style={{textAlign:"center",marginTop:24,fontSize:11,color:C.faint,lineHeight:1.6}}>
          Local account on this device. Cloud sync & Google sign-in activate when Firebase is connected.
        </div>
      </div>
    </div>
  );
}
const lnk={color:C.gold,cursor:"pointer",textDecoration:"none"};


// ─── BIBLE READER (full-screen, focus mode, font/spacing, TTS) ──────────────



// ─── MEDITATE / REST full-screen rotating Scripture ─────────────────────────
function ScriptureRotator({refs, onClose, audio, title, restMode}){
  const [idx,setIdx]=useState(0);
  const [text,setText]=useState(null);
  const [show,setShow]=useState(true);
  const [remaining,setRemaining]=useState(0); // timer seconds
  const [running,setRunning]=useState(false);
  useEffect(()=>{let alive=true;kjvVerse(...refs[idx]).then(t=>{if(alive)setText(t||"...");});return()=>{alive=false;};},[idx]);
  useEffect(()=>{ // rotate every 6s
    const t=setInterval(()=>{setShow(false);setTimeout(()=>{setIdx(i=>(i+1)%refs.length);setShow(true);},700);},15000);
    return()=>clearInterval(t);
  },[refs.length]);
  useEffect(()=>{ if(!running)return; if(remaining<=0){setRunning(false);return;} const t=setTimeout(()=>setRemaining(r=>r-1),1000); return()=>clearTimeout(t); },[running,remaining]);
  const ref=refs[idx]; const refLabel=`${ref[0]} ${ref[1]}:${ref[2]}`;
  const mm=String(Math.floor(remaining/60)).padStart(2,"0"),ss=String(remaining%60).padStart(2,"0");
  return (
    <div style={{position:"fixed",inset:0,zIndex:650,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:F,padding:30,textAlign:"center",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 30%, ${C.goldGlow} 0%, transparent 55%)`,pointerEvents:"none",animation:"breathe 8s ease-in-out infinite"}}/>
      <button onClick={onClose} style={{position:"absolute",top:18,right:18,background:"transparent",border:`1px solid ${C.line}`,borderRadius:8,padding:7,cursor:"pointer",color:C.muted,zIndex:2}}><XIc size={18}/></button>
      <div style={{position:"absolute",top:22,left:0,right:0,fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.muted}}>{restMode?"Rest Mode":title}</div>
      <div style={{maxWidth:760,opacity:show?1:0,transition:"opacity 0.7s ease",position:"relative",zIndex:1}}>
        <div style={{fontSize:"clamp(22px,4.5vw,40px)",fontWeight:W.thin,lineHeight:1.5,color:C.text,letterSpacing:"0.01em"}}>"{text||"…"}"</div>
        <div style={{marginTop:26,fontSize:"clamp(13px,2.5vw,16px)",color:C.gold,fontWeight:W.regular,letterSpacing:"0.05em"}}>{refLabel}</div>
        <div style={{marginTop:4,fontSize:11,color:C.muted,letterSpacing:2}}>KJV</div>
      </div>
      <div style={{position:"absolute",bottom:30,left:0,right:0,display:"flex",flexDirection:"column",alignItems:"center",gap:16,zIndex:2}}>
        {running&&<div style={{fontSize:22,fontWeight:W.thin,color:C.gold,letterSpacing:2}}>{mm}:{ss}</div>}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {[5,10,15,30,60].map(m=>(<button key={m} onClick={()=>{setRemaining(m*60);setRunning(true);}} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${C.line}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:F,fontSize:12}}>{m}m</button>))}
        </div>
        <button onClick={()=>{const t=AUDIO_MANIFEST.find(a=>a.id==="pad-warm");audio.track?audio.toggle():audio.play(t);}} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:20,border:`1px solid ${audio.playing?C.gold:C.line}`,background:"transparent",color:audio.playing?C.gold:C.muted,cursor:"pointer",fontFamily:F,fontSize:12}}>
          <MusicIc/> {audio.playing?"Audio On":"Worship Audio"}
        </button>
      </div>
    </div>
  );
}


// ─── PRAYER SESSION (12-step path, 15s scripture rotation, KJV audio) ───────
function PrayerSession({startStep,durations,onClose,onLog,audio}){
  const [stepIdx,setStepIdx]=useState(startStep||0);
  const [secsLeft,setSecsLeft]=useState((durations?.[startStep||0]||5)*60);
  const [totalSecs,setTotalSecs]=useState(0);
  const [running,setRunning]=useState(true);
  const [verseIdx,setVerseIdx]=useState(0);
  const [verseText,setVerseText]=useState(null);
  const [show,setShow]=useState(true);
  const [locked,setLocked]=useState(false);
  const [promptIdx,setPromptIdx]=useState(0);
  const [pauseRotateUntil,setPauseRotateUntil]=useState(0);
  const step=PRAYER_WHEEL[stepIdx];
  const ref=step.refs[verseIdx%step.refs.length];

  // total elapsed timer
  useEffect(()=>{if(!running)return;const t=setInterval(()=>setTotalSecs(s=>s+1),1000);return()=>clearInterval(t);},[running]);
  // step countdown
  useEffect(()=>{if(!running)return;if(secsLeft<=0){nextStep();return;}const t=setTimeout(()=>setSecsLeft(s=>s-1),1000);return()=>clearTimeout(t);},[running,secsLeft]);
  // load verse text
  useEffect(()=>{let a=true;kjvVerse(ref[0],ref[1],ref[2]).then(t=>{if(a)setVerseText(t||"…");});return()=>{a=false;};},[stepIdx,verseIdx]);
  // 15s scripture rotation (skips if locked or paused by interaction or backgrounded)
  useEffect(()=>{
    const t=setInterval(()=>{
      if(locked||document.hidden||Date.now()<pauseRotateUntil)return;
      setShow(false);
      setTimeout(()=>{setVerseIdx(i=>i+1);setShow(true);},600);
    },15000);
    return()=>clearInterval(t);
  },[locked,pauseRotateUntil]);
  // rotating micro-prompts every 20s
  useEffect(()=>{const t=setInterval(()=>setPromptIdx(i=>i+1),20000);return()=>clearInterval(t);},[stepIdx]);

  function interact(){setPauseRotateUntil(Date.now()+30000);} // pause rotation 30s on interaction
  function nextStep(){if(stepIdx<PRAYER_WHEEL.length-1){const ni=stepIdx+1;setStepIdx(ni);setSecsLeft((durations?.[ni]||5)*60);setVerseIdx(0);setLocked(false);}else finish();}
  function prevStep(){if(stepIdx>0){const pi=stepIdx-1;setStepIdx(pi);setSecsLeft((durations?.[pi]||5)*60);setVerseIdx(0);setLocked(false);}}
  function finish(){onLog&&onLog(totalSecs,stepIdx+1);onClose();}

  const mm=String(Math.floor(secsLeft/60)).padStart(2,"0"),ss=String(secsLeft%60).padStart(2,"0");
  const refLabel=`${ref[0]} ${ref[1]}:${ref[2]}`;
  const overallPct=Math.round((stepIdx/(PRAYER_WHEEL.length))*100);

  return (
    <div onScroll={interact} onClick={interact} style={{position:"fixed",inset:0,zIndex:650,background:C.bg,display:"flex",flexDirection:"column",fontFamily:F,color:C.text,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 32%, ${C.goldGlow} 0%, transparent 55%)`,pointerEvents:"none",animation:"breathe 8s ease-in-out infinite"}}/>
      {/* header */}
      <div style={{position:"relative",zIndex:2,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px"}}>
        <button onClick={finish} style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",color:C.muted,fontFamily:F,fontSize:13}}>End & Save</button>
        <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.muted}}>Prayer Path · {stepIdx+1}/{PRAYER_WHEEL.length}</div>
        <div style={{width:78}}/>
      </div>
      {/* overall progress rail */}
      <div style={{position:"relative",zIndex:2,height:3,background:C.line,margin:"0 18px",borderRadius:100,overflow:"hidden"}}><div style={{width:`${overallPct}%`,height:"100%",background:C.gold,transition:"width 0.6s"}}/></div>

      {/* center */}
      <div style={{flex:1,position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"20px 28px"}}>
        <div style={{fontSize:12,letterSpacing:3,textTransform:"uppercase",color:C.gold,marginBottom:18}}>{step.name}</div>
        <div style={{fontSize:"clamp(46px,13vw,84px)",fontWeight:W.thin,color:C.gold,letterSpacing:"0.04em",marginBottom:24}}>{mm}:{ss}</div>
        <div style={{maxWidth:680,minHeight:120,opacity:show?1:0,transition:"opacity 0.6s ease"}}>
          <div style={{fontSize:"clamp(19px,3.4vw,28px)",fontWeight:W.thin,lineHeight:1.55,color:C.text,fontStyle:"italic"}}>"{verseText||"…"}"</div>
          <div style={{marginTop:14,fontSize:14,color:C.gold,letterSpacing:"0.04em"}}>{refLabel} · KJV {locked&&"· locked"}</div>
        </div>
        <div style={{marginTop:22,fontSize:15,fontWeight:W.light,color:C.muted,maxWidth:520,lineHeight:1.6}}>{step.prompts[promptIdx%step.prompts.length]}</div>
      </div>

      {/* footer controls */}
      <div style={{position:"relative",zIndex:2,padding:"0 14px 26px",display:"flex",flexDirection:"column",gap:14,alignItems:"center"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          <button onClick={()=>{interact();setVerseIdx(i=>Math.max(0,i-1));}} style={pill()}>‹ Verse</button>
          <button onClick={()=>setLocked(l=>!l)} style={pill(locked)}><LockIc fill={locked?"currentColor":"none"}/></button>
          <button onClick={()=>{onLog&&0;showSaveVerse(verseText,refLabel);}} style={pill()}>Save</button>
          <button onClick={()=>{interact();setVerseIdx(i=>i+1);}} style={pill()}>Verse ›</button>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          <button onClick={prevStep} style={pill()}>‹ Prev</button>
          <button onClick={()=>setRunning(r=>!r)} style={pill(true)}>{running?"Pause":"Resume"}</button>
          <button onClick={()=>{const t=AUDIO_MANIFEST[0];audio.track?audio.toggle():audio.play(t);}} style={pill(audio.playing)}><MusicIc/></button>
          <button onClick={nextStep} style={pill()}>Next ›</button>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[5,10,15,30,60].map(m=>(<button key={m} onClick={()=>setSecsLeft(m*60)} style={{padding:"5px 11px",borderRadius:16,border:`1px solid ${C.line}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:F,fontSize:11}}>{m}m</button>))}
        </div>
      </div>
    </div>
  );
}
function pill(active){return{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:22,border:`1px solid ${active?C.gold:C.line}`,background:active?C.gold+"18":"transparent",color:active?C.gold:C.muted,cursor:"pointer",fontFamily:F,fontSize:13};}
// lightweight global for "save verse" from session (wired in App)
let showSaveVerse=()=>{};

// ─── FASTING HUB ────────────────────────────────────────────────────────────
function FastingView({state,setState,card,sectionLabel,mut,fg,brd,showToast}){
  const active=state.fast||null;
  const [type,setType]=useState("Intermittent");
  const [hours,setHours]=useState(16);
  const [focus,setFocus]=useState("");
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{if(!active)return;const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[active]);
  const history=state.fastHistory||[];
  const types=["Water","Daniel","Intermittent","Partial","Custom"];
  function start(){setState(s=>({...s,fast:{type,startTs:Date.now(),targetHrs:hours,focus,checkins:[]}}));showToast("Fast started");}
  function checkin(kind){setState(s=>({...s,fast:{...s.fast,checkins:[{kind,ts:Date.now()},...(s.fast.checkins||[])]}}));showToast(kind+" logged");}
  function end(completed){setState(s=>{const f=s.fast;const rec={...f,endTs:Date.now(),completed};return{...s,fast:null,fastHistory:[rec,...(s.fastHistory||[])]};});showToast("Fast ended");}
  const elapsed=active?Math.floor((now-active.startTs)/1000):0;
  const eh=Math.floor(elapsed/3600),em=Math.floor((elapsed%3600)/60),es=elapsed%60;
  const pctF=active?Math.min(100,(elapsed/(active.targetHrs*3600))*100):0;
  const totalHrs=(history.reduce((a,f)=>a+((f.endTs-f.startTs)/3600000),0)).toFixed(1);

  return (<div>
    <div style={sectionLabel}>Fasting</div>
    {active?(<>
      <div style={{...card,textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:8}}>{active.type} Fast</div>
        <div style={{fontSize:"clamp(36px,10vw,56px)",fontWeight:W.thin,color:fg}}>{String(eh).padStart(2,"0")}:{String(em).padStart(2,"0")}:{String(es).padStart(2,"0")}</div>
        <div style={{fontSize:12,color:mut,marginTop:4}}>of {active.targetHrs}h goal</div>
        <div style={{height:4,background:brd,borderRadius:100,marginTop:14,overflow:"hidden"}}><div style={{width:`${pctF}%`,height:"100%",background:C.gold}}/></div>
        {active.focus&&<div style={{marginTop:14,fontSize:13,color:mut,fontStyle:"italic"}}>"{active.focus}"</div>}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {["Check-in","Struggle","Prayer focus","Scripture"].map(k=>(<button key={k} onClick={()=>checkin(k)} style={ghostBtn(brd,fg)}>{k}</button>))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>end(true)} style={goldBtn()}>Complete Fast</button>
        <button onClick={()=>end(false)} style={ghostBtn(brd,fg)}>End Early</button>
      </div>
      {active.checkins?.length>0&&<div style={{marginTop:18}}>
        <div style={sectionLabel}>Check-ins</div>
        {active.checkins.map((c,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 4px",borderBottom:`1px solid ${brd}`,fontSize:13}}><span style={{color:fg}}>{c.kind}</span><span style={{color:mut}}>{new Date(c.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span></div>))}
      </div>}
    </>):(<>
      <div style={{...card,marginBottom:16}}>
        <div style={{fontSize:12,color:mut,marginBottom:10}}>Type of fast</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {types.map(t=>(<button key={t} onClick={()=>setType(t)} style={{padding:"6px 13px",borderRadius:16,border:`1px solid ${type===t?C.gold:brd}`,background:type===t?C.gold+"18":"transparent",color:type===t?C.gold:mut,cursor:"pointer",fontFamily:F,fontSize:12}}>{t}</button>))}
        </div>
        <div style={{fontSize:12,color:mut,marginBottom:8}}>Goal: {hours} hours</div>
        <input type="range" min="1" max="72" value={hours} onChange={e=>setHours(+e.target.value)} style={{width:"100%",accentColor:C.gold,marginBottom:16}}/>
        <input value={focus} onChange={e=>setFocus(e.target.value)} placeholder="Prayer focus (optional)" style={{width:"100%",padding:"11px 14px",background:"transparent",border:`1px solid ${brd}`,borderRadius:10,color:fg,fontFamily:F,fontSize:14,boxSizing:"border-box",marginBottom:14}}/>
        <button onClick={start} style={{...goldBtn(),width:"100%",justifyContent:"center"}}>Start Fast</button>
      </div>
      <div style={{...card,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
          <div><div style={{fontSize:24,fontWeight:W.thin,color:C.gold}}>{history.length}</div><div style={{fontSize:11,color:mut}}>Fasts</div></div>
          <div><div style={{fontSize:24,fontWeight:W.thin,color:C.gold}}>{totalHrs}</div><div style={{fontSize:11,color:mut}}>Total Hrs</div></div>
          <div><div style={{fontSize:24,fontWeight:W.thin,color:C.gold}}>{history.length?(totalHrs/history.length).toFixed(1):0}</div><div style={{fontSize:11,color:mut}}>Avg Hrs</div></div>
        </div>
      </div>
      <div style={{fontSize:11,color:C.faint,lineHeight:1.6,textAlign:"center"}}>Consult a professional if you have health concerns; listen to your body.</div>
    </>)}
  </div>);
}


// ─── DASHBOARD (Spiritual Disciplines analytics) ────────────────────────────
function Dashboard({state,card,sectionLabel,mut,fg,brd,dark}){
  const [sub,setSub]=useState("overview");
  const completed=state.completed||{};
  const prayer=state.prayer||{sessions:[]};
  const sessions=prayer.sessions||[];
  const fastHist=state.fastHistory||[];
  const saved=state.savedVerses||[];
  const journal=state.journal||[];

  // helpers
  const last7=(arr,key)=>{const now=Date.now();return arr.filter(x=>now-(x.ts||new Date(x.date).getTime())<7*86400000).reduce((a,x)=>a+(x[key]||0),0);};
  const prayerWk=Math.round(last7(sessions,"secs")/60);
  const prayerMonth=Math.round(sessions.filter(s=>Date.now()-s.ts<30*86400000).reduce((a,s)=>a+s.secs,0)/60);
  const prayerYr=Math.round(sessions.reduce((a,s)=>a+s.secs,0)/60);
  const readingDays=Object.keys(completed).length;
  // time-of-day for prayer
  const hourBuckets=new Array(24).fill(0);
  sessions.forEach(s=>{const h=new Date(s.ts).getHours();hourBuckets[h]+=s.secs;});
  const peakHour=hourBuckets.indexOf(Math.max(...hourBuckets));
  const peakLabel=Math.max(...hourBuckets)>0?`${peakHour%12||12}${peakHour<12?"am":"pm"}`:"—";

  // simple bar chart
  const Bars=({data,labels,color})=>{const max=Math.max(...data,1);return(
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:90,marginTop:8}}>
      {data.map((v,i)=>(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <div style={{width:"100%",height:`${(v/max)*70}px`,background:color||C.gold,borderRadius:3,minHeight:2,opacity:0.85}}/>
        <span style={{fontSize:8,color:mut}}>{labels?.[i]||""}</span>
      </div>))}
    </div>);};

  // last 7 days reading + prayer
  const dayLabels=[],readArr=[],prayArr=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=d.toISOString().split("T")[0];
    dayLabels.push(["S","M","T","W","T","F","S"][d.getDay()]);
    readArr.push(Object.entries(completed).filter(([dn,ts])=>new Date(ts).toISOString().split("T")[0]===iso).length);
    prayArr.push(Math.round(sessions.filter(s=>s.date===iso).reduce((a,s)=>a+s.secs,0)/60));
  }

  const tabs=[["overview","Overview"],["reading","Reading"],["prayer","Prayer"],["verses","Verses"],["fasting","Fasting"],["insights","Insights"]];
  const tile=(big,label,sub2)=>(<div style={{...card,padding:16,textAlign:"center"}}><div style={{fontSize:26,fontWeight:W.thin,color:C.gold}}>{big}</div><div style={{fontSize:11,color:mut,marginTop:2}}>{label}</div>{sub2&&<div style={{fontSize:10,color:C.faint,marginTop:2}}>{sub2}</div>}</div>);

  return (<div>
    <div style={sectionLabel}>Spiritual Disciplines</div>
    <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:18,paddingBottom:2}}>
      {tabs.map(([id,l])=>(<button key={id} onClick={()=>setSub(id)} style={{flexShrink:0,padding:"6px 14px",borderRadius:18,border:`1px solid ${sub===id?C.gold:brd}`,background:sub===id?C.gold:"transparent",color:sub===id?C.bg:mut,cursor:"pointer",fontFamily:F,fontSize:12}}>{l}</button>))}
    </div>

    {sub==="overview"&&(<div className="rest-grid">
      {tile(readingDays,"Days Read")}
      {tile(prayerWk+"m","Prayer (7d)")}
      {tile(prayerYr+"m","Prayer (yr)")}
      {tile(saved.length,"Saved Verses")}
      {tile(fastHist.length,"Fasts")}
      {tile(journal.length,"Journal Entries")}
      <div style={{...card,gridColumn:"1/-1"}}><div style={sectionLabel}>This Week · Reading</div><Bars data={readArr} labels={dayLabels}/></div>
      <div style={{...card,gridColumn:"1/-1"}}><div style={sectionLabel}>This Week · Prayer Minutes</div><Bars data={prayArr} labels={dayLabels} color={C.goldSoft}/></div>
    </div>)}

    {sub==="reading"&&(<div className="rest-grid">
      {tile(readingDays,"Days Completed")}
      {tile((state.plan?Math.round(readingDays/state.plan.list.length*100):0)+"%","Plan Complete")}
      {tile(state.plan?state.plan.list.length-readingDays:0,"Days Remaining")}
      <div style={{...card,gridColumn:"1/-1"}}><div style={sectionLabel}>Last 7 Days</div><Bars data={readArr} labels={dayLabels}/></div>
    </div>)}

    {sub==="prayer"&&(<div className="rest-grid">
      {tile(prayerWk+"m","This Week")}
      {tile(prayerMonth+"m","This Month")}
      {tile(prayerYr+"m","This Year")}
      {tile(sessions.length,"Sessions")}
      {tile(sessions.length?Math.round(sessions.reduce((a,s)=>a+s.secs,0)/sessions.length/60)+"m":"0m","Avg Session")}
      {tile(peakLabel,"Peak Time")}
      <div style={{...card,gridColumn:"1/-1"}}><div style={sectionLabel}>Prayer Minutes · 7 Days</div><Bars data={prayArr} labels={dayLabels} color={C.goldSoft}/></div>
    </div>)}

    {sub==="verses"&&(<div>
      <div style={sectionLabel}>Meditation Shelf · Saved Verses</div>
      {saved.length===0?<div style={{color:mut,fontSize:13,textAlign:"center",padding:"30px 0"}}>No saved verses yet. Tap "Save" on any verse.</div>:
        saved.map((v,i)=>(<div key={i} style={{padding:"12px 4px",borderBottom:`1px solid ${brd}`}}><div style={{fontSize:15,color:fg,fontStyle:"italic",lineHeight:1.5}}>"{v.text}"</div><div style={{fontSize:12,color:C.gold,marginTop:4}}>{v.ref} · KJV</div></div>))}
    </div>)}

    {sub==="fasting"&&(<div className="rest-grid">
      {tile(fastHist.length,"Fasts Completed")}
      {tile((fastHist.reduce((a,f)=>a+((f.endTs-f.startTs)/3600000),0)).toFixed(1),"Total Hours")}
      {tile(fastHist.length?(fastHist.reduce((a,f)=>a+((f.endTs-f.startTs)/3600000),0)/fastHist.length).toFixed(1):0,"Avg Length (h)")}
      {tile(fastHist.filter(f=>f.completed).length,"Completed Goal")}
    </div>)}

    {sub==="insights"&&(<div>
      <div style={{...card,marginBottom:14}}><div style={sectionLabel}>Consistency</div>
        <div style={{fontSize:14,color:fg,lineHeight:1.6}}>You've been active {readArr.filter(x=>x>0).length} of the last 7 days for reading and prayed on {prayArr.filter(x=>x>0).length} of them.</div>
      </div>
      <div style={{...card,marginBottom:14}}><div style={sectionLabel}>Best Time of Day</div>
        <div style={{fontSize:14,color:fg}}>Your most frequent prayer time is around <strong style={{color:C.gold}}>{peakLabel}</strong>.</div>
      </div>
      <div style={{...card}}><div style={sectionLabel}>Pattern</div>
        <div style={{fontSize:14,color:mut,lineHeight:1.6}}>On days you pray, you tend to read as well. Keep the rhythm gentle — consistency over intensity.</div>
      </div>
    </div>)}
  </div>);
}

// ─── FRIENDS / SHARING ──────────────────────────────────────────────────────
function FriendsView({state,setState,card,sectionLabel,mut,fg,brd,showToast,plan,completedCount,streak,pct,dark}){
  const friends=state.friends||[];
  const [code,setCode]=useState("");
  const myCode=state.code||"";
  function add(){
    const c=code.trim().toUpperCase();
    if(!c||c.length<6){showToast("Enter a valid code");return;}
    if(c===myCode){showToast("That's your own code");return;}
    if(friends.find(f=>f.code===c)){showToast("Already added");return;}
    // demo friend with simulated mutual progress
    const name=c.slice(0,4).charAt(0)+c.slice(0,4).slice(1).toLowerCase();
    const simP=Math.floor(Math.random()*Math.max(1,completedCount)*1.2);
    setState(s=>({...s,friends:[...(s.friends||[]),{code:c,name,progress:simP,streak:Math.floor(Math.random()*20),reactions:[]}]}));
    setCode("");showToast(name+" added");
  }
  function react(fc,emoji){setState(s=>({...s,friends:(s.friends||[]).map(f=>f.code===fc?{...f,reactions:[emoji,...(f.reactions||[])].slice(0,5)}:f)}));showToast("Sent "+emoji);}
  const planLen=plan?plan.list.length:1;
  return (<div>
    <div style={sectionLabel}>Reading Together</div>
    {/* my card */}
    <div style={{...card,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:C.gold,color:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:W.thin}}>{(state.name||"?")[0].toUpperCase()}</div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:W.medium,color:fg}}>{state.name||"You"}</div><div style={{fontSize:12,color:mut}}>Day {completedCount} · {streak} streak · {pct}%</div></div>
        <div style={{color:C.gold,fontSize:18,fontWeight:W.thin}}>{pct}%</div>
      </div>
      <div style={{marginTop:12,padding:"10px 14px",background:dark?C.bg2:"#F0ECE2",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:10,color:mut,letterSpacing:1,textTransform:"uppercase"}}>Share Code</div><div style={{fontSize:20,fontWeight:W.medium,color:C.gold,letterSpacing:3,fontFamily:"monospace"}}>{myCode||"—"}</div></div>
        <button onClick={()=>{navigator.clipboard?.writeText(myCode);showToast("Code copied");}} style={ghostBtn(brd,fg)}>Copy</button>
      </div>
    </div>
    {/* add */}
    <div style={{display:"flex",gap:8,marginBottom:18}}>
      <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Friend's code" style={{flex:1,padding:"11px 14px",background:"transparent",border:`1px solid ${brd}`,borderRadius:10,color:fg,fontFamily:"monospace",fontSize:15,letterSpacing:2,textTransform:"uppercase",boxSizing:"border-box"}}/>
      <button onClick={add} style={goldBtn()}><UsersPlusIc/> Add</button>
    </div>
    {/* leaderboard */}
    {friends.length===0?<div style={{color:mut,fontSize:13,textAlign:"center",padding:"24px 0"}}>Add a friend's code to see each other's progress.</div>:
      [{name:state.name||"You",progress:completedCount,streak,isMe:true},...friends].sort((a,b)=>b.progress-a.progress).map((f,i)=>(
        <div key={f.code||"me"} style={{padding:"12px 4px",borderBottom:`1px solid ${brd}`,display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:mut,fontSize:13,width:16,textAlign:"center"}}>{i+1}</span>
          <div style={{width:32,height:32,borderRadius:"50%",background:f.isMe?C.gold:"transparent",border:`1px solid ${f.isMe?C.gold:brd}`,display:"flex",alignItems:"center",justifyContent:"center",color:f.isMe?C.bg:fg,fontWeight:W.medium,fontSize:13}}>{f.name[0].toUpperCase()}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:W.medium,color:f.isMe?C.gold:fg}}>{f.name}{f.isMe?" (You)":""}</div>
            <div style={{fontSize:11,color:mut}}>Day {f.progress} · {Math.round(f.progress/planLen*100)}% · {f.streak} streak</div>
            <div style={{height:2,background:brd,borderRadius:100,marginTop:5}}><div style={{width:`${Math.min(100,f.progress/planLen*100)}%`,height:"100%",background:f.isMe?C.gold:mut,borderRadius:100}}/></div>
          </div>
          {!f.isMe&&<div style={{display:"flex",gap:4}}>
            <button onClick={()=>react(f.code,"🙏")} title="Praying" style={{background:"transparent",border:`1px solid ${brd}`,borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:13}}>🙏</button>
            <button onClick={()=>react(f.code,"👏")} title="Finished" style={{background:"transparent",border:`1px solid ${brd}`,borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:13}}>👏</button>
          </div>}
        </div>))}
    <div style={{fontSize:11,color:C.faint,marginTop:16,lineHeight:1.6,textAlign:"center"}}>Shared progress shows % complete only. Your journal and dashboard stay private.</div>
  </div>);
}


// ─── PWA registration (manifest + service worker via blobs) ─────────────────
function registerPWA(){
  try{
    const manifest={name:"REST — Find Rest In Him",short_name:"REST",start_url:".",display:"standalone",
      background_color:"#0A0A0C",theme_color:"#0A0A0C",
      icons:[{src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#0A0A0C"/><text x="256" y="320" font-family="Helvetica" font-size="180" font-weight="200" letter-spacing="20" fill="#E0A33B" text-anchor="middle">REST</text></svg>'),sizes:"512x512",type:"image/svg+xml",purpose:"any"}]};
    const mb=new Blob([JSON.stringify(manifest)],{type:"application/manifest+json"});
    let link=document.querySelector('link[rel="manifest"]')||document.createElement("link");
    link.rel="manifest"; link.href=URL.createObjectURL(mb); document.head.appendChild(link);
    if("serviceWorker"in navigator){
      const sw=`const C="rest-v7";self.addEventListener("install",e=>self.skipWaiting());self.addEventListener("activate",e=>self.clients.claim());self.addEventListener("fetch",e=>{e.respondWith(caches.open(C).then(async c=>{const h=await c.match(e.request);if(h)return h;try{const r=await fetch(e.request);if(e.request.method==="GET"&&r.ok)c.put(e.request,r.clone());return r;}catch(err){return h||Response.error();}}));});`;
      const sb=new Blob([sw],{type:"text/javascript"});
      navigator.serviceWorker.register(URL.createObjectURL(sb)).catch(()=>{});
    }
  }catch(e){console.warn("PWA setup skipped",e);}
}
function toggleFullscreen(){const d=document;if(!d.fullscreenElement){(d.documentElement.requestFullscreen||d.documentElement.webkitRequestFullscreen)?.call(d.documentElement);}else{(d.exitFullscreen||d.webkitExitFullscreen)?.call(d);}}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

// ─── FOCUS AUDIO PANEL (music picker) ──────────────────────────────────────
function FocusAudioPanel({audio, onClose, dark}){
  const bg=dark?C.surface:"#FFFFFF", fg=dark?C.text:"#1C1A16";
  const mut=dark?C.muted:"#7A756B", brd=dark?C.line:"#E2DCCF";
  const cats=[...new Set(AUDIO_MANIFEST.map(t=>t.cat))];
  return (
    <div style={{position:"fixed",inset:0,zIndex:450,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:bg,borderRadius:"16px 16px 0 0",padding:"20px 16px 32px",width:"100%",maxWidth:600,maxHeight:"72vh",overflowY:"auto",fontFamily:F}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontWeight:W.medium,fontSize:17,color:fg}}>Focus Music</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:mut,padding:4}}><XIc size={20}/></button>
        </div>
        <div style={{fontSize:12,color:mut,marginBottom:18,lineHeight:1.5}}>Instrumental only. Plays in the background. Volume lowers automatically while Scripture is read aloud.</div>
        {cats.map(cat=>(
          <div key={cat} style={{marginBottom:18}}>
            <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:10,fontWeight:W.medium}}>{cat}</div>
            {AUDIO_MANIFEST.filter(t=>t.cat===cat).map(t=>{
              const active=audio.track?.id===t.id;
              return (
                <button key={t.id} onClick={()=>{ if(active){audio.toggle();}else{audio.play(t);} }}
                  style={{width:"100%",padding:"14px 16px",marginBottom:8,borderRadius:12,
                    background:active?C.gold+"18":"transparent",
                    border:`1px solid ${active?C.gold:brd}`,
                    display:"flex",alignItems:"center",gap:14,cursor:"pointer",textAlign:"left",color:fg}}>
                  <span style={{color:active&&audio.playing?C.gold:mut,flexShrink:0}}>
                    {active&&audio.playing?<PauseIc/>:<PlayIc/>}
                  </span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:W.medium,fontSize:15,color:active?C.gold:fg}}>{t.title}</div>
                    <div style={{color:mut,fontSize:12,marginTop:2}}>{t.cat}{t.gen?" · Built-in ambient":""}</div>
                  </div>
                  {active&&<span style={{width:8,height:8,borderRadius:"50%",background:audio.playing?C.gold:mut,flexShrink:0}}/>}
                </button>
              );
            })}
          </div>
        ))}
        {audio.track&&(
          <div style={{borderTop:`1px solid ${brd}`,paddingTop:14,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:12,color:mut,flexShrink:0}}>Volume</span>
            <input type="range" min="0" max="1" step="0.01" value={audio.volume}
              onChange={e=>audio.setVol(parseFloat(e.target.value))}
              style={{flex:1,accentColor:C.gold}}/>
            <button onClick={()=>{audio.stop();}} style={{background:"transparent",border:`1px solid ${brd}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",color:mut,fontFamily:F,fontSize:12,flexShrink:0}}>Stop</button>
          </div>
        )}
      </div>
    </div>
  );
}

function App(){
  const [booted,setBooted]=useState(false);
  const [user,setUser]=useState(authAdapter.current());
  const [state,setState]=useState(loadState);
  const [tab,setTab]=useState("home");
  const [dark,setDark]=useState(state.settings?.dark!==false);
  const [toast,setToast]=useState(null);
  const audio=useFocusAudio();

  // overlays
  const [reader,setReader]=useState(null);        // {chapters,dayNum}
  const [rotator,setRotator]=useState(null);      // {refs,title,restMode}
  const [prayer,setPrayer]=useState(null);        // {startStep}
  const [confirmAbort,setConfirmAbort]=useState(false);
  const [showMore,setShowMore]=useState(false);
  const [showAudio,setShowAudio]=useState(false);
  const [showPlanPick,setShowPlanPick]=useState(false);
  const [votdText,setVotdText]=useState(null);

  useEffect(()=>{saveState(state);},[state]);
  // wire global save-verse used by PrayerSession footer
  useEffect(()=>{ showSaveVerse=(text,ref)=>{ if(!text)return; setState(s=>({...s,savedVerses:[{text,ref,ts:Date.now()},...((s.savedVerses||[]).filter(v=>v.ref!==ref))]})); showToast("Verse saved"); }; },[]);
  useEffect(()=>{registerPWA();},[]);
  useEffect(()=>{setState(s=>({...s,settings:{...(s.settings||{}),dark}}));},[dark]);

  // derived plan
  // Validate/migrate stored plan (old format may lack .chapters arrays)
  const plan = (() => {
    const p = state.plan;
    if(!p||!p.list||p.list.length===0) return null;
    if(!p.list[0].chapters||p.list[0].chapters.length===0){
      const rebuilt=buildPlan(p.scope||"all",p.days||365,p.startDate||todayISO());
      return {...p,list:p.list.map((e,i)=>({...e,chapters:rebuilt[i]?.chapters||[]}))};
    }
    return p;
  })();
  const completed=state.completed||{};
  const completedCount=Object.keys(completed).length;
  const todayIdx=plan? Math.max(0,plan.list.findIndex(d=>d.date===todayISO())) :0;
  const todayEntry=plan? plan.list[todayIdx] :null;
  const streak=(()=>{if(!plan)return 0;let s=0;for(let i=todayIdx;i>=0;i--){if(completed[plan.list[i]?.day])s++;else break;}return s;})();
  const pct=plan&&plan.list.length?Math.round(completedCount/plan.list.length*100):0;
  const missed=plan?plan.list.slice(0,todayIdx).filter(d=>!completed[d.day]):[];

  // prayer data
  const prayerData=state.prayer||{sessions:[],level:0};
  const prayerSessions=prayerData.sessions||[];
  const prayerToday=prayerSessions.filter(s=>s.date===todayISO()).reduce((a,s)=>a+s.secs,0);
  const prayerStreak=(()=>{let s=0;let d=new Date();for(;;){const iso=d.toISOString().split("T")[0];if(prayerSessions.some(x=>x.date===iso)){s++;d.setDate(d.getDate()-1);}else break;}return s;})();
  const prayerLifetimeHrs=(prayerSessions.reduce((a,s)=>a+s.secs,0)/3600).toFixed(1);
  const level=PRAYER_LEVELS[prayerData.level||0];

  // VOTD (KJV)
  useEffect(()=>{const v=VOTD[new Date().getDate()%VOTD.length];kjvVerse(v.book,v.chapter,v.verse).then(t=>setVotdText({text:t,ref:v.ref}));},[]);

  const showToast=(m)=>{setToast(m);setTimeout(()=>setToast(null),2600);};

  function choosePlan(preset, customDays, customEndDate){
    // Mode 1: user-chosen end date overrides duration. Mode 2: template duration.
    let days;
    if(customEndDate){ days=Math.max(1,Math.round((new Date(customEndDate)-new Date(todayISO()))/86400000)+1); }
    else { days= preset.id==="custom"? (customDays||120): preset.days; }
    const list=buildPlan(preset.scope,days,todayISO());
    const endDate=list[list.length-1].date;
    setState(s=>({...s,plan:{presetId:preset.id,scope:preset.scope,days,startDate:todayISO(),endDate,list}}));
    setShowPlanPick(false); showToast(`${preset.name} created`);
  }
  function abortPlan(){ setState(s=>({...s, plan:null})); setConfirmAbort(false); setShowPlanPick(true); showToast("Plan ended. Completed days kept."); }
  function markComplete(dayNum){setState(s=>{const c={...(s.completed||{})};if(c[dayNum])delete c[dayNum];else c[dayNum]=Date.now();return{...s,completed:c};});}
  function recalc(){if(!plan)return;const np=recalcPlan(plan.scope,Object.keys(completed).map(Number),plan.list,plan.endDate);if(!np.length){showToast("Nothing to recalculate");return;}setState(s=>({...s,plan:{...s.plan,list:np}}));showToast("Caught up — still finishing "+fmtDate(plan.endDate));}
  function logPrayer(secs){if(secs<5)return;setState(s=>{const p=s.prayer||{sessions:[],level:0};const sessions=[{date:todayISO(),secs,ts:Date.now()},...(p.sessions||[])];
    // auto-progress challenge
    let lvl=p.level||0;const todaySec=sessions.filter(x=>x.date===todayISO()).reduce((a,x)=>a+x.secs,0);
    const next=PRAYER_LEVELS[lvl+1];if(next&&todaySec>=next.minutes*60)lvl=lvl+1;
    return{...s,prayer:{...p,sessions,level:lvl}};});showToast("Prayer logged");}
  function addJournal(type,text){if(!text.trim())return;setState(s=>({...s,journal:[{id:Date.now(),type,text,date:todayISO()},...(s.journal||[])]}));}
  function saveVerse(){setState(s=>({...s,savedVerses:[{...votdText,ts:Date.now()},...((s.savedVerses||[]).filter(v=>v.ref!==votdText.ref))]}));showToast("Verse saved");}
  function shareVerse(){const t=`"${votdText.text}" — ${votdText.ref} (KJV)`;if(navigator.share)navigator.share({text:t}).catch(()=>{});else{navigator.clipboard?.writeText(t);showToast("Verse copied");}}

  if(!booted) return <Splash onDone={()=>setBooted(true)}/>;
  if(!user)   return <AuthScreen onAuth={u=>{setUser(u);if(!loadState().plan)setShowPlanPick(true);}}/>;

  const bg=dark?C.bg:"#F6F4EE",fg=dark?C.text:"#1C1A16",mut=dark?C.muted:"#7A756B",surf=dark?C.surface:"#FFFFFF",brd=dark?C.line:"#E6E0D3";
  const card={background:surf,border:`1px solid ${brd}`,borderRadius:18,padding:20};
  const sectionLabel={color:mut,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:W.medium};


  return (
    <div style={{minHeight:"100vh",background:bg,color:fg,fontFamily:F,transition:"background 0.3s",paddingBottom:80}}>
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:${bg}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes breathe{0%,100%{opacity:0.7}50%{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        button:active{transform:scale(0.98)}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:${brd};border-radius:100px}
        input,textarea,select{outline:none}
        input:focus,textarea:focus{border-color:${C.gold}!important}
        a{color:${C.gold}}
        @media(min-width:1024px){.rest-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
        @media(min-width:1440px){.rest-grid{grid-template-columns:1fr 1fr 1fr}}
      `}</style>

      {/* Overlays */}
      {reader&&<BibleReader chapters={reader.chapters||[]} startAutoPlay={!!reader.autoPlay} onClose={()=>setReader(null)} onAudioDuck={audio.duck} onComplete={reader.dayNum?()=>{markComplete(reader.dayNum);setReader(null);showToast("Reading complete");}:null}/>}
      {rotator&&<ScriptureRotator refs={rotator.refs} title={rotator.title} restMode={rotator.restMode} audio={audio} onClose={()=>setRotator(null)}/>}
      {prayer&&<PrayerSession startStep={prayer.startStep} durations={state.prayerDurations} audio={audio} onLog={logPrayer} onClose={()=>setPrayer(null)}/>}
      {showAudio&&<FocusAudioPanel audio={audio} onClose={()=>setShowAudio(false)} dark={dark}/>}
      {showPlanPick&&<PlanPicker dark={dark} onChoose={choosePlan} onClose={plan?()=>setShowPlanPick(false):null}/>}
      {confirmAbort&&(<div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setConfirmAbort(false)}>
        <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:18,padding:26,maxWidth:360,width:"100%"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:17,fontWeight:W.medium,marginBottom:8,color:fg}}>End this plan?</div>
          <div style={{fontSize:13,color:mut,lineHeight:1.6,marginBottom:20}}>Your completed days and streak are kept. You can start a fresh plan right after.</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={abortPlan} style={{...goldBtn(),flex:1,justifyContent:"center"}}>End Plan</button>
            <button onClick={()=>setConfirmAbort(false)} style={{...ghostBtn(brd,fg),flex:1,justifyContent:"center"}}>Cancel</button>
          </div>
        </div></div>)}

      {/* Header */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:24,fontWeight:W.thin,color:C.gold,letterSpacing:"0.22em",paddingLeft:"0.22em"}}>{BRAND}</div>
          <div style={{fontSize:11,fontWeight:W.light,color:mut,fontStyle:"italic",marginTop:1}}>{TAGLINE}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>{const t=AUDIO_MANIFEST.find(a=>a.id==="pad-calm");audio.track?audio.toggle():audio.play(t);}} style={{...iconBtn(brd,audio.playing?C.gold:mut)}} title="Focus audio"><MusicIc/></button>
          <button onClick={()=>setDark(d=>!d)} style={iconBtn(brd,mut)} title="Theme">{dark?<SunIc/>:<MoonIc/>}</button>
          <button onClick={toggleFullscreen} style={iconBtn(brd,mut)} title="Fullscreen"><ExpandIc/></button>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"24px 20px"}}>

        {/* ════ HOME ════  — mobile-first hub layout ════ */}
        {tab==="home"&&(<div style={{paddingBottom:8}}>

          {/* ── GREETING STRIP ── */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:mut,fontWeight:W.light}}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </div>
            <div style={{fontSize:22,fontWeight:W.medium,color:fg,marginTop:2}}>
              {state.name?`Good ${new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, ${state.name.split(" ")[0]}.`:"Welcome to REST."}
            </div>
            <div style={{fontSize:13,fontStyle:"italic",color:mut,marginTop:2,fontWeight:W.light}}>{TAGLINE}</div>
          </div>

          {/* ── TODAY SNAPSHOT STRIP ── */}
          <div style={{display:"flex",gap:10,marginBottom:22,overflowX:"auto",paddingBottom:2}}>
            {[
              {icon:<FireIc/>,   val:streak,                             label:"Streak"},
              {icon:<PrayIc/>,   val:Math.floor(prayerToday/60)+"m",    label:"Prayer"},
              {icon:<BookmarkIc/>,val:pct+"%",                          label:"Bible"},
              {icon:<FastIc/>,   val:state.fast?"Active":"—",           label:"Fast"},
            ].map(({icon,val,label})=>(
              <div key={label} style={{flexShrink:0,background:surf,border:`1px solid ${brd}`,borderRadius:14,padding:"12px 16px",textAlign:"center",minWidth:72}}>
                <div style={{color:C.gold,display:"flex",justifyContent:"center",marginBottom:4}}>{icon}</div>
                <div style={{fontSize:16,fontWeight:W.medium,color:fg}}>{val}</div>
                <div style={{fontSize:10,color:mut,marginTop:1,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── VERSE OF THE DAY (hero card) ── */}
          <div style={{background:`linear-gradient(135deg, ${C.surface} 0%, ${C.surface2} 100%)`,border:`1px solid ${C.gold}33`,borderRadius:20,padding:"22px 20px",marginBottom:16,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle,${C.goldGlow} 0%,transparent 70%)`,pointerEvents:"none"}}/>
            <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:12,fontWeight:W.medium}}>Verse of the Day · KJV</div>
            <div style={{fontSize:18,fontWeight:W.thin,lineHeight:1.65,color:fg,fontStyle:"italic",marginBottom:14}}>"{votdText?.text||"…"}"</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:C.gold,fontSize:13,fontWeight:W.regular}}>{votdText?.ref}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveVerse} style={{background:"transparent",border:`1px solid ${brd}`,borderRadius:20,padding:"6px 12px",cursor:"pointer",color:mut,fontFamily:F,fontSize:12,display:"flex",alignItems:"center",gap:5}}><HeartIc/> Save</button>
                <button onClick={shareVerse} style={{background:"transparent",border:`1px solid ${brd}`,borderRadius:20,padding:"6px 12px",cursor:"pointer",color:mut,fontFamily:F,fontSize:12,display:"flex",alignItems:"center",gap:5}}><ShareIc/> Share</button>
              </div>
            </div>
          </div>

          {/* ── TODAY'S READING (prominent card) ── */}
          <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:20,padding:"20px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,fontWeight:W.medium,marginBottom:4}}>Today's Reading</div>
                {plan&&<div style={{fontSize:11,color:mut}}>Day {todayEntry?.day} of {plan.list.length} · ends {fmtDate(plan.endDate)}</div>}
              </div>
              {plan&&missed.length>0&&(
                <button onClick={recalc} style={{background:C.gold+"18",border:`1px solid ${C.gold}44`,borderRadius:20,padding:"5px 12px",cursor:"pointer",color:C.gold,fontFamily:F,fontSize:11,display:"flex",alignItems:"center",gap:4}}>
                  <RefreshIc/> Catch Up
                </button>
              )}
            </div>
            {plan?(
              <>
                <div style={{marginBottom:14}}>
                  {todayEntry?.readings.map((r,i)=>(
                    <div key={i} style={{fontSize:17,fontWeight:W.regular,color:completed[todayEntry.day]?C.gold:fg,marginBottom:6,display:"flex",alignItems:"center",gap:8,lineHeight:1.4}}>
                      {completed[todayEntry.day]&&<span style={{color:C.gold,flexShrink:0}}><CheckIc size={14}/></span>}
                      {r}
                    </div>
                  ))}
                </div>
                <div style={{height:3,background:brd,borderRadius:100,marginBottom:16,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:C.gold,transition:"width 0.6s"}}/></div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setReader({chapters:todayEntry.chapters,dayNum:todayEntry.day})} style={{...goldBtn(),flex:1,justifyContent:"center",padding:"13px"}}><BookIc/> Read</button>
                  <button onClick={()=>{setReader({chapters:todayEntry.chapters,dayNum:todayEntry.day,autoPlay:true});}} style={{...ghostBtn(brd,fg),flex:1,justifyContent:"center",padding:"13px"}}><HeadIc/> Listen</button>
                </div>
                {!completed[todayEntry.day]&&(
                  <button onClick={()=>markComplete(todayEntry.day)} style={{width:"100%",marginTop:10,padding:"10px",background:"transparent",border:`1px solid ${brd}`,borderRadius:10,color:mut,cursor:"pointer",fontFamily:F,fontSize:13}}>
                    Mark as Complete
                  </button>
                )}
              </>
            ):(
              <div style={{textAlign:"center",padding:"10px 0 4px"}}>
                <div style={{color:mut,fontSize:14,marginBottom:16,lineHeight:1.6}}>Start a Bible reading plan to see your daily assignment here.</div>
                <button onClick={()=>setShowPlanPick(true)} style={{...goldBtn(),width:"100%",justifyContent:"center",padding:"14px"}}><BookIc/> Choose a Plan</button>
              </div>
            )}
          </div>

          {/* ── QUICK ACTIONS ROW (2×2 large tap targets) ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <button onClick={()=>setPrayer({startStep:0})} style={{background:surf,border:`1px solid ${brd}`,borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left",color:fg}}>
              <div style={{color:C.gold,marginBottom:8}}><PrayIc/></div>
              <div style={{fontSize:15,fontWeight:W.medium,color:fg}}>Prayer Path</div>
              <div style={{fontSize:11,color:mut,marginTop:2}}>{Math.floor(prayerToday/60)} min today · {level.name}</div>
              <div style={{height:2,background:brd,borderRadius:100,marginTop:10,overflow:"hidden"}}><div style={{width:`${Math.min(100,prayerToday/(level.minutes*60)*100)}%`,height:"100%",background:C.gold}}/></div>
            </button>
            <button onClick={()=>setRotator({refs:MEDITATE_TOPICS[1].refs,title:"Rest",restMode:true})} style={{background:surf,border:`1px solid ${brd}`,borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left",color:fg}}>
              <div style={{color:C.gold,marginBottom:8}}><MedIc/></div>
              <div style={{fontSize:15,fontWeight:W.medium,color:fg}}>Rest Mode</div>
              <div style={{fontSize:11,color:mut,marginTop:2}}>Rotating scripture</div>
              <div style={{fontSize:11,color:mut,marginTop:6,fontStyle:"italic"}}>"Be still…" Ps 46:10</div>
            </button>
            <button onClick={()=>setTab("meditate")} style={{background:surf,border:`1px solid ${brd}`,borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left",color:fg}}>
              <div style={{color:C.gold,marginBottom:8}}><ClockIc/></div>
              <div style={{fontSize:15,fontWeight:W.medium,color:fg}}>Meditate</div>
              <div style={{fontSize:11,color:mut,marginTop:2}}>21 promise topics</div>
              <div style={{fontSize:11,color:mut,marginTop:6}}>Scripture meditation</div>
            </button>
            <button onClick={()=>setTab("fasting")} style={{background:surf,border:`1px solid ${brd}`,borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left",color:fg}}>
              <div style={{color:C.gold,marginBottom:8}}><FastIc/></div>
              <div style={{fontSize:15,fontWeight:W.medium,color:fg}}>Fasting</div>
              <div style={{fontSize:11,color:mut,marginTop:2}}>{state.fast?"Fast active":"Start a fast"}</div>
              <div style={{fontSize:11,color:mut,marginTop:6}}>{state.fastHistory?.length||0} completed</div>
            </button>
          </div>

          {/* ── QUICK LINKS ROW ── */}
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:12}}>
            {[
              {label:"Journal",    action:()=>setTab("journal"),    icon:<JournalIc/>},
              {label:"Friends",    action:()=>setTab("friends"),    icon:<PeopleIc/>},
              {label:"Dashboard",  action:()=>setTab("dashboard"),  icon:<ChartIc/>},
              {label:"Music",      action:()=>setShowAudio(true),   icon:<MusicIc/>},
              {label:"Favorites",  action:()=>setTab("dashboard"), icon:<HeartIc/>},
            ].map(({label,action,icon})=>(
              <button key={label} onClick={action} style={{flexShrink:0,background:surf,border:`1px solid ${brd}`,borderRadius:22,padding:"8px 14px",cursor:"pointer",color:mut,fontFamily:F,fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                <span style={{color:C.gold}}>{icon}</span>{label}
              </button>
            ))}
          </div>

          {/* ── REST FOOTER QUOTE ── */}
          <div style={{textAlign:"center",padding:"18px 10px 4px"}}>
            <div style={{fontSize:14,fontStyle:"italic",color:mut,lineHeight:1.7,fontWeight:W.light}}>"Come unto me, all ye that labour and are heavy laden, and I will give you rest."</div>
            <div style={{fontSize:11,color:C.gold,marginTop:6}}>Matthew 11:28 · KJV</div>
          </div>

        </div>)}

        {/* ════ BIBLE PLAN ════ */}
        {tab==="plan"&&(<div>
          {!plan?(<div style={{...card,textAlign:"center"}}><div style={{color:mut,marginBottom:16}}>Create a reading plan to begin.</div><button onClick={()=>setShowPlanPick(true)} style={goldBtn()}>Choose a Plan</button></div>):(<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div><div style={{fontSize:18,fontWeight:W.medium}}>{PLAN_PRESETS.find(p=>p.id===plan.presetId)?.name}</div><div style={{fontSize:12,color:mut}}>{completedCount} of {plan.list.length} days · {pct}%</div></div>
              <div style={{display:"flex",gap:8}}>
                {missed.length>0&&<button onClick={recalc} style={ghostBtn(brd,C.gold)}>Recalculate</button>}
                <button onClick={()=>setShowPlanPick(true)} style={ghostBtn(brd,fg)}>Change Plan</button>
                <button onClick={()=>setConfirmAbort(true)} style={ghostBtn(brd,fg)}>End Plan</button>
              </div>
            </div>
            <div style={{height:4,background:brd,borderRadius:100,marginBottom:20,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:C.gold}}/></div>
            {missed.length>0&&<div style={{...card,marginBottom:16,borderColor:C.gold+"55"}}><div style={{fontSize:14,fontWeight:W.medium,marginBottom:4}}>{missed.length} day{missed.length>1?"s":""} behind</div><div style={{fontSize:12,color:mut,marginBottom:12}}>Recalculate to redistribute remaining chapters and still finish by {fmtDate(plan.endDate)}.</div><button onClick={recalc} style={goldBtn()}>Recalculate Plan</button></div>}
            <div style={{maxHeight:"60vh",overflowY:"auto"}}>
              {plan.list.map((d,i)=>{const done=!!completed[d.day],today=d.date===todayISO();return(
                <div key={d.day} onClick={()=>setReader({chapters:d.chapters,dayNum:d.day})} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 4px",borderBottom:`1px solid ${brd}`,cursor:"pointer"}}>
                  <div style={{flexShrink:0,width:22,height:22,borderRadius:"50%",background:done?C.gold:"transparent",border:`1px solid ${done?C.gold:today?C.gold:brd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:done?C.bg:mut}}>{done?<CheckIc size={12}/>:d.day}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:10,color:today?C.gold:mut,marginBottom:2}}>{fmtDate(d.date)}{today?" · Today":""}</div><div style={{fontSize:15,color:done?mut:fg,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.readings.join(" · ")}</div></div>
                  <span style={{color:mut}}><ChevR/></span>
                </div>);})}
            </div>
          </>)}
        </div>)}

        {/* ════ PRAYER ════ */}
        {tab==="prayer"&&(<div>
          <div style={sectionLabel}>Prayer · {level.name}</div>
          <div className="rest-grid" style={{marginBottom:20}}>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:28,fontWeight:W.thin,color:C.gold}}>{Math.floor(prayerToday/60)}m</div><div style={{fontSize:12,color:mut}}>Today</div></div>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:28,fontWeight:W.thin,color:C.gold}}>{prayerStreak}</div><div style={{fontSize:12,color:mut}}>Day Streak</div></div>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:28,fontWeight:W.thin,color:C.gold}}>{prayerLifetimeHrs}</div><div style={{fontSize:12,color:mut}}>Lifetime Hrs</div></div>
          </div>
          <div style={{...card,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div><div style={{fontSize:16,fontWeight:W.medium,color:fg}}>The Prayer Path</div><div style={{fontSize:12,color:mut,marginTop:2}}>12 steps · pray for an hour · scriptures rotate every 15s</div></div>
            <button onClick={()=>setPrayer({startStep:0})} style={goldBtn()}><PrayIc/> Begin</button>
          </div>
          {/* Vertical timeline — Prayer Path (NOT circular) */}
          <div style={sectionLabel}>The Path</div>
          <div style={{position:"relative",paddingLeft:34}}>
            <div style={{position:"absolute",left:15,top:8,bottom:8,width:2,background:brd}}/>
            {PRAYER_WHEEL.map((s,i)=>(
              <div key={s.id} onClick={()=>setPrayer({startStep:i})} style={{position:"relative",marginBottom:14,cursor:"pointer"}}>
                <div style={{position:"absolute",left:-26,top:4,width:18,height:18,borderRadius:"50%",background:C.bg,border:`2px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 10px ${C.goldGlow}`}}><div style={{width:6,height:6,borderRadius:"50%",background:C.gold}}/></div>
                <div style={{...card,padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.gold}}>{i+1}. {s.name}</div>
                    <span style={{color:mut}}><ChevR/></span>
                  </div>
                  <div style={{fontSize:12,color:mut,marginTop:4}}>{s.refs.map(r=>`${r[0]} ${r[1]}:${r[2]}`).join(" · ")}</div>
                </div>
              </div>))}
          </div>
        </div>)}

        {/* ════ MEDITATE ════ */}
        {tab==="meditate"&&(<div>
          <div style={sectionLabel}>Meditate on His Promises · KJV</div>
          <div style={{fontSize:14,color:mut,marginBottom:20,lineHeight:1.6}}>Choose a topic. Scripture will rotate gently, one promise at a time, for quiet meditation.</div>
          <div className="rest-grid">
            {MEDITATE_TOPICS.map(t=>(<button key={t.id} onClick={()=>setRotator({refs:t.refs,title:t.name,restMode:false})} style={{...card,cursor:"pointer",textAlign:"left",color:fg,padding:18}}>
              <div style={{fontSize:17,fontWeight:W.regular}}>{t.name}</div>
              <div style={{fontSize:12,color:mut,marginTop:4}}>{t.refs.length} promises</div>
            </button>))}
          </div>
        </div>)}

        {/* ════ FRIENDS ════ */}
        {tab==="friends"&&<FriendsView state={state} setState={setState} card={card} sectionLabel={sectionLabel} mut={mut} fg={fg} brd={brd} dark={dark} showToast={showToast} plan={plan} completedCount={completedCount} streak={streak} pct={pct}/>}

        {/* ════ DASHBOARD ════ */}
        {tab==="dashboard"&&<Dashboard state={state} card={card} sectionLabel={sectionLabel} mut={mut} fg={fg} brd={brd} dark={dark}/>}

        {/* ════ FASTING ════ */}
        {tab==="fasting"&&<FastingView state={state} setState={setState} card={card} sectionLabel={sectionLabel} mut={mut} fg={fg} brd={brd} showToast={showToast}/>}

        {/* ════ JOURNAL ════ */}
        {tab==="journal"&&<JournalView dark={dark} state={state} addJournal={addJournal} card={card} sectionLabel={sectionLabel} mut={mut} fg={fg} brd={brd} setState={setState}/>}

        {/* ════ PROFILE ════ */}
        {tab==="profile"&&(<div>
          <div style={{...card,textAlign:"center",marginBottom:18}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:C.gold,color:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:W.thin,margin:"0 auto 12px"}}>{(user.name||"?")[0].toUpperCase()}</div>
            <div style={{fontSize:18,fontWeight:W.medium}}>{user.name}</div>
            <div style={{fontSize:13,color:mut}}>{user.email}</div>
          </div>
          <div className="rest-grid" style={{marginBottom:18}}>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:26,fontWeight:W.thin,color:C.gold}}>{streak}</div><div style={{fontSize:12,color:mut}}>Reading Streak</div></div>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:26,fontWeight:W.thin,color:C.gold}}>{prayerStreak}</div><div style={{fontSize:12,color:mut}}>Prayer Streak</div></div>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:26,fontWeight:W.thin,color:C.gold}}>{pct}%</div><div style={{fontSize:12,color:mut}}>Reading Done</div></div>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:26,fontWeight:W.thin,color:C.gold}}>{prayerLifetimeHrs}</div><div style={{fontSize:12,color:mut}}>Lifetime Prayer Hrs</div></div>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:26,fontWeight:W.thin,color:C.gold}}>{level.name}</div><div style={{fontSize:12,color:mut}}>Challenge Level</div></div>
            <div style={{...card,textAlign:"center"}}><div style={{fontSize:16,fontWeight:W.regular,color:fg}}>{plan?PLAN_PRESETS.find(p=>p.id===plan.presetId)?.name:"None"}</div><div style={{fontSize:12,color:mut}}>Current Plan</div></div>
          </div>
          <button onClick={()=>{authAdapter.signOut();setUser(null);}} style={{...ghostBtn(brd,fg),width:"100%",justifyContent:"center"}}>Sign Out</button>
          <div style={{textAlign:"center",marginTop:20,fontSize:11,color:C.faint,lineHeight:1.6}}>REST · {TAGLINE}<br/>Install from your browser menu for the full app experience.</div>
        </div>)}
      </div>

      {/* Now-playing bar */}
      {audio.track&&(<div style={{position:"fixed",bottom:64,left:0,right:0,zIndex:80,background:surf+"F5",borderTop:`1px solid ${brd}`,backdropFilter:"blur(10px)",padding:"8px 16px",display:"flex",alignItems:"center",gap:12,maxWidth:1280,margin:"0 auto"}}>
        <span style={{color:audio.playing?C.gold:mut}}><MusicIc/></span>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:W.medium,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{audio.track.title}</div></div>
        <input type="range" min="0" max="1" step="0.01" value={audio.volume} onChange={e=>audio.setVol(parseFloat(e.target.value))} style={{width:70,accentColor:C.gold}}/>
        <button onClick={audio.toggle} style={{background:C.gold,border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.bg}}>{audio.playing?<PauseIc/>:<PlayIc/>}</button>
        <button onClick={audio.stop} style={{background:"transparent",border:`1px solid ${brd}`,borderRadius:8,padding:7,cursor:"pointer",color:mut}}><StopIc/></button>
      </div>)}

      {/* Bottom nav (primary) + More sheet */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:85,background:surf,borderTop:`1px solid ${brd}`,display:"flex",justifyContent:"space-around",padding:"8px 0 max(8px,env(safe-area-inset-bottom))",maxWidth:1280,margin:"0 auto"}}>
        {[["home","Home",<HomeIc/>],["plan","Bible",<BookIc/>],["prayer","Prayer",<PrayIc/>],["meditate","Meditate",<MedIc/>],["dashboard","Stats",<ChartIc/>],["more","More",<PlusIc/>]].map(([id,lbl,ic])=>(
          <button key={id} onClick={()=>{ if(id==="more"){setShowMore(true);} else setTab(id); }} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 8px",color:tab===id?C.gold:mut,fontFamily:F}}>
            {ic}<span style={{fontSize:10,fontWeight:tab===id?W.medium:W.regular}}>{lbl}</span>
          </button>))}
      </div>
      {showMore&&(<div style={{position:"fixed",inset:0,zIndex:90,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"flex-end"}} onClick={()=>setShowMore(false)}>
        <div style={{background:surf,borderRadius:"16px 16px 0 0",padding:"18px 16px 32px",width:"100%",maxWidth:600,margin:"0 auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:mut,marginBottom:14}}>More</div>
          <div className="rest-grid">
            {[["journal","Journal",<JournalIc/>],["friends","Friends",<PeopleIc/>],["fasting","Fasting",<FastIc/>],["profile","Profile",<UserIc/>]].map(([id,lbl,ic])=>(
              <button key={id} onClick={()=>{setTab(id);setShowMore(false);}} style={{...card,cursor:"pointer",display:"flex",alignItems:"center",gap:12,color:fg,padding:16}}>
                <span style={{color:C.gold}}>{ic}</span><span style={{fontSize:15,fontWeight:W.medium}}>{lbl}</span>
              </button>))}
          </div>
        </div></div>)}

      {toast&&<div style={{position:"fixed",bottom:audio.track?116:78,left:"50%",transform:"translateX(-50%)",background:surf,border:`1px solid ${C.gold}`,color:C.gold,padding:"10px 20px",borderRadius:100,fontSize:13,fontFamily:F,whiteSpace:"nowrap",animation:"fadeUp 0.3s ease",zIndex:500}}>{toast}</div>}
    </div>
  );
}


// ─── PLAN PICKER ────────────────────────────────────────────────────────────
function PlanPicker({onChoose,onClose,dark}){
  const [custom,setCustom]=useState(120);
  const [mode,setMode]=useState("template"); // template | enddate
  const [scopeId,setScopeId]=useState("365");
  const [endDate,setEndDate]=useState(()=>{const d=new Date();d.setDate(d.getDate()+90);return d.toISOString().split("T")[0];});
  const surf=dark?C.surface:"#FFFFFF",fg=dark?C.text:"#1C1A16",mut=dark?C.muted:"#7A756B",brd=dark?C.line:"#E6E0D3";
  const chosen=PLAN_PRESETS.find(p=>p.id===scopeId)||PLAN_PRESETS[2];
  const today=new Date().toISOString().split("T")[0];
  return (
    <div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose||(()=>{})}>
      <div style={{background:dark?C.bg:"#F6F4EE",border:`1px solid ${brd}`,borderRadius:20,padding:"28px 22px",maxWidth:440,width:"100%",maxHeight:"85vh",overflowY:"auto",fontFamily:F}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:20,fontWeight:W.medium,color:fg}}>Choose Your Plan</div>
          {onClose&&<button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:mut}}><XIc/></button>}
        </div>
        {/* mode toggle */}
        <div style={{display:"flex",border:`1px solid ${brd}`,borderRadius:10,overflow:"hidden",marginBottom:18}}>
          {[["template","By Plan"],["enddate","By End Date"]].map(([m,l])=>(<button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",border:"none",cursor:"pointer",fontFamily:F,fontSize:13,background:mode===m?C.gold:"transparent",color:mode===m?C.bg:mut}}>{l}</button>))}
        </div>
        {mode==="template"?(<>
          {PLAN_PRESETS.map(p=>(<button key={p.id} onClick={()=>onChoose(p,p.id==="custom"?custom:null)} style={{width:"100%",padding:"15px 16px",marginBottom:8,borderRadius:12,background:surf,border:`1px solid ${brd}`,cursor:"pointer",textAlign:"left",color:fg,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:15,fontWeight:W.medium}}>{p.name}</div><div style={{fontSize:12,color:mut,marginTop:2}}>{p.id==="custom"?`${custom} days`:`${p.days} days`}</div></div>
            <span style={{color:C.gold}}><ChevR/></span>
          </button>))}
          <div style={{marginTop:8,padding:"12px 16px",background:surf,border:`1px solid ${brd}`,borderRadius:12}}>
            <div style={{fontSize:12,color:mut,marginBottom:8}}>Custom length (days)</div>
            <input type="range" min="30" max="730" value={custom} onChange={e=>setCustom(+e.target.value)} style={{width:"100%",accentColor:C.gold}}/>
            <div style={{textAlign:"center",color:C.gold,fontSize:14,marginTop:4}}>{custom} days</div>
          </div>
        </>):(<>
          <div style={{fontSize:13,color:mut,marginBottom:14}}>Pick what to read and the date you want to finish — we'll calculate the daily pace.</div>
          <div style={{fontSize:12,color:mut,marginBottom:8}}>Reading scope</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {PLAN_PRESETS.filter(p=>p.id!=="custom").map(p=>(<button key={p.id} onClick={()=>setScopeId(p.id)} style={{padding:"7px 13px",borderRadius:16,border:`1px solid ${scopeId===p.id?C.gold:brd}`,background:scopeId===p.id?C.gold+"18":"transparent",color:scopeId===p.id?C.gold:mut,cursor:"pointer",fontFamily:F,fontSize:12}}>{p.name.replace(" Plan","")}</button>))}
          </div>
          <div style={{fontSize:12,color:mut,marginBottom:8}}>Finish by</div>
          <input type="date" value={endDate} min={today} onChange={e=>setEndDate(e.target.value)} style={{width:"100%",padding:"12px 14px",background:surf,border:`1px solid ${brd}`,borderRadius:10,color:fg,fontFamily:F,fontSize:15,boxSizing:"border-box",marginBottom:18}}/>
          <button onClick={()=>onChoose(chosen,null,endDate)} style={{...goldBtn(),width:"100%",justifyContent:"center"}}>Create Plan</button>
        </>)}
      </div>
    </div>
  );
}

// ─── JOURNAL VIEW ───────────────────────────────────────────────────────────
function JournalView({state,addJournal,card,sectionLabel,mut,fg,brd,setState}){
  const [type,setType]=useState("Prayer Request");
  const [text,setText]=useState("");
  const [q,setQ]=useState("");
  const types=["Prayer Request","Answered Prayer","Testimony","Note","Scripture Received"];
  const journal=state.journal||[];
  const filtered=journal.filter(j=>!q||j.text.toLowerCase().includes(q.toLowerCase())||j.type.toLowerCase().includes(q.toLowerCase()));
  return (<div>
    <div style={sectionLabel}>Prayer Journal</div>
    <div style={{...card,marginBottom:16}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {types.map(t=>(<button key={t} onClick={()=>setType(t)} style={{padding:"5px 12px",borderRadius:16,border:`1px solid ${type===t?C.gold:brd}`,background:type===t?C.gold+"18":"transparent",color:type===t?C.gold:mut,cursor:"pointer",fontFamily:F,fontSize:12}}>{t}</button>))}
      </div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Write a ${type.toLowerCase()}…`} rows={3} style={{width:"100%",padding:"12px 14px",background:"transparent",border:`1px solid ${brd}`,borderRadius:10,color:fg,fontFamily:F,fontSize:14,boxSizing:"border-box",resize:"vertical",marginBottom:10}}/>
      <button onClick={()=>{addJournal(type,text);setText("");}} disabled={!text.trim()} style={{...goldBtn(),opacity:text.trim()?1:0.5}}>Save Entry</button>
    </div>
    <div style={{position:"relative",marginBottom:14}}>
      <span style={{position:"absolute",left:12,top:11,color:mut}}><SearchIc/></span>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search entries…" style={{width:"100%",padding:"10px 14px 10px 40px",background:"transparent",border:`1px solid ${brd}`,borderRadius:10,color:fg,fontFamily:F,fontSize:14,boxSizing:"border-box"}}/>
    </div>
    {filtered.length===0?<div style={{color:mut,fontSize:13,textAlign:"center",padding:"30px 0"}}>No entries yet.</div>:
      filtered.map(j=>(<div key={j.id} style={{padding:"12px 4px",borderBottom:`1px solid ${brd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.gold,letterSpacing:1,textTransform:"uppercase"}}>{j.type}</span><span style={{fontSize:11,color:mut}}>{fmtDate(j.date)}</span></div>
        <div style={{fontSize:15,color:fg,lineHeight:1.5}}>{j.text}</div>
        <button onClick={()=>setState(s=>({...s,journal:(s.journal||[]).filter(x=>x.id!==j.id)}))} style={{background:"none",border:"none",color:mut,fontSize:11,cursor:"pointer",marginTop:6,padding:0}}>Delete</button>
      </div>))}
  </div>);
}

// ─── shared button styles ───────────────────────────────────────────────────
function goldBtn(){return{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 18px",background:C.gold,border:"none",borderRadius:10,color:C.bg,fontFamily:F,fontSize:14,fontWeight:W.medium,cursor:"pointer"};}
function ghostBtn(brd,fg){return{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 18px",background:"transparent",border:`1px solid ${brd}`,borderRadius:10,color:fg,fontFamily:F,fontSize:14,cursor:"pointer"};}
function iconBtn(brd,col){return{background:"transparent",border:`1px solid ${brd}`,borderRadius:10,padding:9,cursor:"pointer",color:col,display:"flex",alignItems:"center",justifyContent:"center"};}

// ─── MOUNT ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));

  