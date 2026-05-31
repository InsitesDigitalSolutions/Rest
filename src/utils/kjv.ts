import { useState, useEffect, useRef } from 'react';
import { ReadingPlan, AppState, User, AudioTrack } from '../types';

// Declare global types for window integrations
declare global {
  interface Window {
    REST_KJV_0?: string;
    REST_KJV_1?: string;
    REST_KJV_2?: string;
    REST_KJV_3?: string;
    _kjvCache?: Record<string, any>;
    puter?: any;
    webkitAudioContext?: any;
    AudioContext?: any;
  }
}

// ─── KJV DATA LAYER ─────────────────────────────────────────────────────────
const getKJVB64 = (): string => {
  if (typeof window !== 'undefined' && window.REST_KJV_0) {
    return (
      window.REST_KJV_0 +
      (window.REST_KJV_1 || '') +
      (window.REST_KJV_2 || '') +
      (window.REST_KJV_3 || '')
    );
  }
  return '';
};

let _kjvData: any = null; // cached after first decompress
let _kjvError: string | null = null; // set if load fails so we don't retry forever

export async function loadKJV(): Promise<any | null> {
  if (_kjvData) return _kjvData;
  if (_kjvError) return null;
  const KJV_B64 = getKJVB64();
  if (!KJV_B64) {
    _kjvError = "Data files not found. Ensure rest-data-0..3.js are in the same folder.";
    return null;
  }
  try {
    // base64 → Uint8Array
    const binStr = atob(KJV_B64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    // gzip decompress (universally supported: Chrome, Safari, Firefox, Edge)
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();
    writer.write(bytes);
    writer.close();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    _kjvData = JSON.parse(new TextDecoder().decode(combined));
    return _kjvData;
  } catch (err: any) {
    _kjvError = "Decompression failed: " + err.message;
    console.error("REST KJV load error:", err);
    return null;
  }
}

// Fetch all verses in a chapter → [{verse:N, text:"..."}] or null
export async function kjvChapter(book: string, chapter: number): Promise<{ verse: number; text: string }[] | null> {
  const cacheKey = `${book}|${chapter}`;
  if (typeof window !== 'undefined') {
    if (!window._kjvCache) window._kjvCache = {};
    if (window._kjvCache[cacheKey]) return window._kjvCache[cacheKey];
  }
  const data = await loadKJV();
  if (!data) return null;
  const arr = data[book]?.[String(chapter)];
  if (!arr || arr.length === 0) return null;
  const result = arr.map((text: string, i: number) => {
    let clean = text || "";
    // Clean up margin translation footnotes like "...: Heb. [some text]" or simply "...: Heb."
    clean = clean.replace(/\.\.\.\s*:\s*Heb\.?/gi, "");
    clean = clean.replace(/\s*:\s*Heb\.?/gi, "");
    clean = clean.replace(/\.\.\.\s*Heb\.?/gi, "");
    // Trim extra spacing caused by removal
    clean = clean.replace(/\s+/g, " ").trim();
    return { verse: i + 1, text: clean };
  });
  if (typeof window !== 'undefined' && window._kjvCache) {
    window._kjvCache[cacheKey] = result;
  }
  return result;
}

// Fetch a single verse → "text" or null
export async function kjvVerse(book: string, chapter: number, verse: number): Promise<string | null> {
  const ch = await kjvChapter(book, chapter);
  return ch?.[verse - 1]?.text ?? null;
}

// ─── ALL 66 BOOKS in canonical order ────────────────────────────────────────
export interface BookInfo {
  name: string;
  abbr: string;
  ch: number;
}

export const KJV_BOOKS: BookInfo[] = [
  { name: "Genesis", abbr: "Gen", ch: 50 },
  { name: "Exodus", abbr: "Exo", ch: 40 },
  { name: "Leviticus", abbr: "Lev", ch: 27 },
  { name: "Numbers", abbr: "Num", ch: 36 },
  { name: "Deuteronomy", abbr: "Deu", ch: 34 },
  { name: "Joshua", abbr: "Jos", ch: 24 },
  { name: "Judges", abbr: "Jdg", ch: 21 },
  { name: "Ruth", abbr: "Rut", ch: 4 },
  { name: "1 Samuel", abbr: "1Sa", ch: 31 },
  { name: "2 Samuel", abbr: "2Sa", ch: 24 },
  { name: "1 Kings", abbr: "1Ki", ch: 22 },
  { name: "2 Kings", abbr: "2Ki", ch: 25 },
  { name: "1 Chronicles", abbr: "1Ch", ch: 29 },
  { name: "2 Chronicles", abbr: "2Ch", ch: 36 },
  { name: "Ezra", abbr: "Ezr", ch: 10 },
  { name: "Nehemiah", abbr: "Neh", ch: 13 },
  { name: "Esther", abbr: "Est", ch: 10 },
  { name: "Job", abbr: "Job", ch: 42 },
  { name: "Psalms", abbr: "Psa", ch: 150 },
  { name: "Proverbs", abbr: "Pro", ch: 31 },
  { name: "Ecclesiastes", abbr: "Ecc", ch: 12 },
  { name: "Song of Solomon", abbr: "Son", ch: 8 },
  { name: "Isaiah", abbr: "Isa", ch: 66 },
  { name: "Jeremiah", abbr: "Jer", ch: 52 },
  { name: "Lamentations", abbr: "Lam", ch: 5 },
  { name: "Ezekiel", abbr: "Eze", ch: 48 },
  { name: "Daniel", abbr: "Dan", ch: 12 },
  { name: "Hosea", abbr: "Hos", ch: 14 },
  { name: "Joel", abbr: "Joe", ch: 3 },
  { name: "Amos", abbr: "Amo", ch: 9 },
  { name: "Obadiah", abbr: "Oba", ch: 1 },
  { name: "Jonah", abbr: "Jon", ch: 4 },
  { name: "Micah", abbr: "Mic", ch: 7 },
  { name: "Nahum", abbr: "Nah", ch: 3 },
  { name: "Habakkuk", abbr: "Hab", ch: 3 },
  { name: "Zephaniah", abbr: "Zep", ch: 3 },
  { name: "Haggai", abbr: "Hag", ch: 2 },
  { name: "Zechariah", abbr: "Zec", ch: 14 },
  { name: "Malachi", abbr: "Mal", ch: 4 },
  { name: "Matthew", abbr: "Mat", ch: 28 },
  { name: "Mark", abbr: "Mar", ch: 16 },
  { name: "Luke", abbr: "Luk", ch: 24 },
  { name: "John", abbr: "Joh", ch: 21 },
  { name: "Acts", abbr: "Act", ch: 28 },
  { name: "Romans", abbr: "Rom", ch: 16 },
  { name: "1 Corinthians", abbr: "1Co", ch: 16 },
  { name: "2 Corinthians", abbr: "2Co", ch: 13 },
  { name: "Galatians", abbr: "Gal", ch: 6 },
  { name: "Ephesians", abbr: "Eph", ch: 6 },
  { name: "Philippians", abbr: "Php", ch: 4 },
  { name: "Colossians", abbr: "Col", ch: 4 },
  { name: "1 Thessalonians", abbr: "1Th", ch: 5 },
  { name: "2 Thessalonians", abbr: "2Th", ch: 3 },
  { name: "1 Timothy", abbr: "1Ti", ch: 6 },
  { name: "2 Timothy", abbr: "2Ti", ch: 4 },
  { name: "Titus", abbr: "Tit", ch: 3 },
  { name: "Philemon", abbr: "Phm", ch: 1 },
  { name: "Hebrews", abbr: "Heb", ch: 13 },
  { name: "James", abbr: "Jas", ch: 5 },
  { name: "1 Peter", abbr: "1Pe", ch: 5 },
  { name: "2 Peter", abbr: "2Pe", ch: 3 },
  { name: "1 John", abbr: "1Jo", ch: 5 },
  { name: "2 John", abbr: "2Jo", ch: 1 },
  { name: "3 John", abbr: "3Jo", ch: 1 },
  { name: "Jude", abbr: "Jud", ch: 1 },
  { name: "Revelation", abbr: "Rev", ch: 22 },
];

export function buildAllChapters(scope: string): { book: string; chapter: number }[] {
  let books = KJV_BOOKS;
  if (scope === "ot") books = KJV_BOOKS.slice(0, 39);
  if (scope === "nt") books = KJV_BOOKS.slice(39);
  if (scope === "gospels") books = KJV_BOOKS.filter(b => ["Matthew", "Mark", "Luke", "John"].includes(b.name));
  if (scope === "psalms") books = KJV_BOOKS.filter(b => ["Psalms", "Proverbs"].includes(b.name));
  
  const list: { book: string; chapter: number }[] = [];
  for (const book of books) {
    for (let c = 1; c <= book.ch; c++) {
      list.push({ book: book.name, chapter: c });
    }
  }
  return list;
}

export function buildPlan(scope: string, days: number, startISO?: string): any[] {
  const chapters = buildAllChapters(scope);
  const start = new Date(startISO || new Date().toISOString().split("T")[0]).getTime();
  const plan: any[] = [];
  let ci = 0;
  for (let d = 0; d < days; d++) {
    const date = new Date(start + d * 86400000).toISOString().split("T")[0];
    const remaining = chapters.length - ci;
    const left = days - d;
    const n = Math.max(1, Math.ceil(remaining / left));
    const grouped: Record<string, number[]> = {};
    for (let i = 0; i < n && ci < chapters.length; i++, ci++) {
      const { book, chapter } = chapters[ci];
      (grouped[book] = grouped[book] || []).push(chapter);
    }
    const readings: string[] = [];
    const chs: { book: string; chapter: number }[] = [];
    for (const [book, arr] of Object.entries(grouped)) {
      const ranges: string[] = [];
      let s = arr[0], e = arr[0];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] === e + 1) e = arr[i];
        else {
          ranges.push(s === e ? `${s}` : `${s}–${e}`);
          s = e = arr[i];
        }
      }
      ranges.push(s === e ? `${s}` : `${s}–${e}`);
      readings.push(`${book} ${ranges.join(", ")}`);
      for (const c of arr) chs.push({ book, chapter: c });
    }
    if (readings.length) plan.push({ day: d + 1, date, readings, chapters: chs });
  }
  return plan;
}

export function recalcPlan(scope: string, completedDays: number[], currentPlan: any[], endISO: string): any[] {
  const all = buildAllChapters(scope);
  const readIdx = new Set<number>();
  for (const dn of completedDays) {
    const e = currentPlan.find(d => d.day === dn);
    if (!e) continue;
    for (const ch of e.chapters) {
      const i = all.findIndex(c => c.book === ch.book && c.chapter === ch.chapter);
      if (i >= 0) readIdx.add(i);
    }
  }
  const remaining = all.filter((_, i) => !readIdx.has(i));
  if (!remaining.length) return [];
  const today = new Date().toISOString().split("T")[0];
  const start = new Date(today).getTime(), end = new Date(endISO).getTime();
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const plan: any[] = [];
  let ci = 0;
  for (let d = 0; d < days; d++) {
    const date = new Date(start + d * 86400000).toISOString().split("T")[0];
    const rem = remaining.length - ci;
    const left = days - d;
    const n = Math.max(1, Math.ceil(rem / left));
    const grouped: Record<string, number[]> = {};
    for (let i = 0; i < n && ci < remaining.length; i++, ci++) {
      const { book, chapter } = remaining[ci];
      (grouped[book] = grouped[book] || []).push(chapter);
    }
    const readings: string[] = [];
    const chs: { book: string; chapter: number }[] = [];
    for (const [book, arr] of Object.entries(grouped)) {
      const ranges: string[] = [];
      let s = arr[0], e = arr[0];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] === e + 1) e = arr[i];
        else {
          ranges.push(s === e ? `${s}` : `${s}–${e}`);
          s = e = arr[i];
        }
      }
      ranges.push(s === e ? `${s}` : `${s}–${e}`);
      readings.push(`${book} ${ranges.join(", ")}`);
      for (const c of arr) chs.push({ book, chapter: c });
    }
    if (readings.length) plan.push({ day: d + 1, date, readings, chapters: chs });
  }
  return plan;
}

// ─── VERSE OF THE DAY pool ──────────────────────────────────────────────────
export const VOTD = [
  { book: "Matthew", chapter: 11, verse: 28, ref: "Matthew 11:28" },
  { book: "Psalms", chapter: 23, verse: 1, ref: "Psalm 23:1" },
  { book: "Isaiah", chapter: 40, verse: 31, ref: "Isaiah 40:31" },
  { book: "Philippians", chapter: 4, verse: 13, ref: "Philippians 4:13" },
  { book: "Proverbs", chapter: 3, verse: 5, ref: "Proverbs 3:5" },
  { book: "John", chapter: 14, verse: 27, ref: "John 14:27" },
  { book: "Psalms", chapter: 46, verse: 10, ref: "Psalm 46:10" },
  { book: "Joshua", chapter: 1, verse: 9, ref: "Joshua 1:9" },
  { book: "Romans", chapter: 8, verse: 28, ref: "Romans 8:28" },
  { book: "Matthew", chapter: 6, verse: 33, ref: "Matthew 6:33" },
  { book: "Psalms", chapter: 91, verse: 1, ref: "Psalm 91:1" },
  { book: "2 Corinthians", chapter: 12, verse: 9, ref: "2 Corinthians 12:9" },
];

// ─── PRAYER PATH — 12-step "How to Pray for an Hour" ────────────────────────
export interface PrayerStep {
  id: string;
  name: string;
  refs: [string, number, number][];
  prompts: string[];
}

export const PRAYER_WHEEL: PrayerStep[] = [
  {
    id: "praise1",
    name: "Praise",
    refs: [["Psalms", 22, 3], ["Psalms", 63, 3], ["Hebrews", 13, 15]],
    prompts: ["Magnify who God is — His holiness, His majesty.", "Offer the sacrifice of praise with your lips.", "Declare His worth above every circumstance."]
  },
  {
    id: "forgive",
    name: "Forgiveness",
    refs: [["Matthew", 6, 14], ["Matthew", 6, 15]],
    prompts: ["Release anyone who has wronged you.", "Forgive as you have been forgiven.", "Let no root of bitterness remain."]
  },
  {
    id: "confess",
    name: "Confession",
    refs: [["Psalms", 139, 23], ["Psalms", 139, 24], ["Psalms", 66, 18]],
    prompts: ["Invite God to search your heart.", "Name and confess what He reveals.", "Turn from every hidden thing."]
  },
  {
    id: "petition",
    name: "Petition",
    refs: [["James", 4, 2], ["James", 4, 3], ["Matthew", 6, 11]],
    prompts: ["Bring your own needs honestly to God.", "Ask according to His will.", "Cast your daily cares on Him."]
  },
  {
    id: "intercede",
    name: "Intercession",
    refs: [["1 Timothy", 2, 1], ["1 Timothy", 2, 2], ["Matthew", 9, 38]],
    prompts: ["Stand in the gap for the lost.", "Pray for leaders and authorities.", "Ask the Lord to send laborers."]
  },
  {
    id: "readbible",
    name: "Read the Bible",
    refs: [["2 Timothy", 3, 16], ["Psalms", 19, 9], ["Psalms", 119, 105]],
    prompts: ["Let Scripture speak before you do.", "Read slowly; let the Word search you.", "Receive it as God-breathed truth."]
  },
  {
    id: "meditate",
    name: "Meditation",
    refs: [["Psalms", 1, 2], ["Psalms", 46, 10], ["Psalms", 77, 12]],
    prompts: ["Be still and know that He is God.", "Ponder His works and His Word.", "Dwell on one truth deeply."]
  },
  {
    id: "thanks",
    name: "Thanksgiving",
    refs: [["Philippians", 4, 6], ["Psalms", 100, 4], ["1 Thessalonians", 5, 18]],
    prompts: ["Thank Him for answered prayer.", "Give thanks in everything.", "Count His mercies one by one."]
  },
  {
    id: "praytheword",
    name: "Pray the Word",
    refs: [["Isaiah", 55, 11], ["Jeremiah", 1, 12], ["Hebrews", 4, 12]],
    prompts: ["Pray a verse back to God, personally.", "Apply Scripture aloud over your life.", "Let His Word shape your asking."]
  },
  {
    id: "singing",
    name: "Singing",
    refs: [["Psalms", 100, 2], ["Ephesians", 5, 19], ["Psalms", 95, 1]],
    prompts: ["Sing to the Lord a new song.", "Make melody in your heart to Him.", "Worship Him in spirit and truth."]
  },
  {
    id: "listen",
    name: "Listening",
    refs: [["1 Kings", 19, 12], ["Psalms", 46, 10], ["1 Samuel", 3, 9]],
    prompts: ["Be quiet and listen for His voice.", "Wait on the still small voice.", "Say: Speak Lord, Your servant hears."]
  },
  {
    id: "praise2",
    name: "Praise (Conclude)",
    refs: [["Matthew", 6, 13], ["Psalms", 52, 9], ["Jude", 1, 25]],
    prompts: ["Close as you began — in praise.", "His is the kingdom and the power.", "Seal this hour with thanksgiving."]
  }
];

// ─── CHALLENGE LEVELS ───────────────────────────────────────────────────────
export const PRAYER_LEVELS = [
  { id: 0, name: "Beginner", minutes: 5, desc: "5 Minutes Daily" },
  { id: 1, name: "Growing", minutes: 15, desc: "15 Minutes Daily" },
  { id: 2, name: "Disciple", minutes: 30, desc: "30 Minutes Daily" },
  { id: 3, name: "Watchman", minutes: 60, desc: "60 Minutes Daily" },
  { id: 4, name: "Prayer Warrior", minutes: 120, desc: "120 Minutes Daily" },
];

// ─── MEDITATIVE PROMISE TOPICS ──────────────────────────────────────────────
export interface MeditateTopic {
  id: string;
  name: string;
  refs: [string, number, number][];
}

export const MEDITATE_TOPICS: MeditateTopic[] = [
  { 
    id: "peace", 
    name: "Peace", 
    refs: [
      ["John", 14, 27], ["Isaiah", 26, 3], ["Philippians", 4, 7], ["Romans", 15, 13], ["Colossians", 3, 15], 
      ["Psalms", 29, 11], ["John", 16, 33], ["Psalms", 119, 165], ["Galatians", 5, 22], ["James", 3, 18],
      ["Isaiah", 9, 6], ["Isaiah", 32, 17], ["Numbers", 6, 26], ["Romans", 16, 20], ["2 Thessalonians", 3, 16], 
      ["Psalms", 4, 8], ["Proverbs", 16, 7], ["Romans", 5, 1], ["Isaiah", 54, 10], ["Psalms", 85, 8]
    ] 
  },
  { 
    id: "rest", 
    name: "Rest", 
    refs: [
      ["Matthew", 11, 28], ["Psalms", 23, 2], ["Exodus", 33, 14], ["Hebrews", 4, 9], ["Matthew", 11, 29], 
      ["Psalms", 4, 8], ["Jeremiah", 6, 16], ["Psalms", 37, 7], ["Isaiah", 30, 15], ["Psalms", 116, 7],
      ["Genesis", 2, 2], ["Hebrews", 4, 1], ["Psalms", 91, 1], ["Psalms", 62, 1], ["Psalms", 62, 5], 
      ["Revelation", 14, 13], ["Deuteronomy", 5, 14], ["Psalms", 127, 2], ["Proverbs", 3, 24], ["Jeremiah", 31, 25]
    ] 
  },
  { 
    id: "faith", 
    name: "Faith", 
    refs: [
      ["Hebrews", 11, 1], ["Hebrews", 11, 6], ["Romans", 10, 17], ["Mark", 11, 22], ["2 Corinthians", 5, 7], 
      ["Ephesians", 2, 8], ["James", 2, 17], ["Galatians", 2, 20], ["Ephesians", 6, 16], ["1 Peter", 1, 7],
      ["Romans", 4, 20], ["Mark", 9, 23], ["Hebrews", 12, 2], ["Habakkuk", 2, 4], ["Galatians", 3, 11], 
      ["Romans", 1, 17], ["Ephesians", 3, 17], ["1 Timothy", 6, 12], ["Romans", 5, 2], ["James", 1, 3]
    ] 
  },
  { 
    id: "fear", 
    name: "Fear", 
    refs: [
      ["Isaiah", 41, 10], ["2 Timothy", 1, 7], ["Psalms", 27, 1], ["Joshua", 1, 9], ["Psalms", 56, 3], 
      ["Psalms", 34, 4], ["Proverbs", 29, 25], ["1 John", 4, 18], ["Romans", 8, 15], ["Psalms", 23, 4],
      ["Psalms", 118, 6], ["Psalms", 46, 1], ["Luke", 12, 7], ["Deuteronomy", 31, 6], ["Isaiah", 12, 2], 
      ["Psalms", 27, 3], ["Psalms", 91, 5], ["Isaiah", 43, 1], ["Proverbs", 3, 25], ["Revelation", 1, 17]
    ] 
  },
  { 
    id: "anxiety", 
    name: "Anxiety", 
    refs: [
      ["Philippians", 4, 6], ["1 Peter", 5, 7], ["Matthew", 6, 34], ["Psalms", 55, 22], ["Proverbs", 12, 25], 
      ["Matthew", 6, 25], ["Matthew", 6, 33], ["John", 14, 1], ["Psalms", 94, 19], ["Luke", 12, 22],
      ["Matthew", 6, 27], ["Matthew", 6, 28], ["Matthew", 6, 31], ["Psalms", 34, 17], ["Psalms", 42, 5], 
      ["Psalms", 42, 11], ["Proverbs", 3, 5], ["Isaiah", 35, 4], ["Luke", 12, 25], ["Matthew", 10, 19]
    ] 
  },
  { 
    id: "healing", 
    name: "Healing", 
    refs: [
      ["Isaiah", 53, 5], ["Psalms", 103, 3], ["James", 5, 15], ["Jeremiah", 17, 14], ["Psalms", 147, 3], 
      ["Proverbs", 4, 20], ["Proverbs", 4, 22], ["Exodus", 15, 26], ["3 John", 1, 2], ["James", 5, 16],
      ["Psalms", 30, 2], ["Psalms", 41, 3], ["Jeremiah", 30, 17], ["Psalms", 107, 20], ["Isaiah", 58, 8], 
      ["Malachi", 4, 2], ["Psalms", 34, 19], ["Matthew", 8, 17], ["Acts", 3, 16], ["1 Peter", 2, 24]
    ] 
  },
  { 
    id: "salvation", 
    name: "Salvation", 
    refs: [
      ["Acts", 2, 38], ["Romans", 10, 9], ["John", 3, 5], ["Mark", 16, 16], ["Ephesians", 2, 8], 
      ["Romans", 10, 13], ["John", 3, 16], ["Acts", 4, 12], ["Titus", 3, 5], ["Ephesians", 2, 9],
      ["Romans", 1, 16], ["Acts", 16, 31], ["John", 10, 9], ["Acts", 2, 21], ["Romans", 5, 8], 
      ["John", 14, 6], ["Romans", 6, 23], ["Hebrews", 7, 25], ["Acts", 10, 43], ["Romans", 10, 10]
    ] 
  },
  { 
    id: "prayer", 
    name: "Prayer", 
    refs: [
      ["Matthew", 7, 7], ["1 Thessalonians", 5, 17], ["James", 5, 16], ["Philippians", 4, 6], ["Jeremiah", 29, 12], 
      ["Mark", 11, 24], ["Luke", 18, 1], ["Colossians", 4, 2], ["Romans", 12, 12], ["Psalms", 145, 18],
      ["Matthew", 6, 6], ["Matthew", 21, 22], ["Jeremiah", 33, 3], ["Luke", 11, 9], ["John", 15, 7], 
      ["Psalms", 50, 15], ["James", 1, 5], ["Ephesians", 6, 18], ["Psalms", 18, 6], ["Psalms", 66, 19]
    ] 
  },
  { 
    id: "strength", 
    name: "Strength", 
    refs: [
      ["Isaiah", 40, 31], ["Philippians", 4, 13], ["Psalms", 46, 1], ["Nehemiah", 8, 10], ["Isaiah", 41, 10], 
      ["Psalms", 28, 7], ["2 Corinthians", 12, 9], ["Ephesians", 6, 10], ["Psalms", 18, 1], ["Deuteronomy", 31, 6],
      ["Psalms", 18, 32], ["Psalms", 27, 14], ["Psalms", 73, 26], ["Psalms", 138, 3], ["Exodus", 15, 2], 
      ["Psalms", 29, 11], ["Psalms", 119, 28], ["Isaiah", 12, 2], ["Habakkuk", 3, 19], ["Ephesians", 3, 16]
    ] 
  },
  { 
    id: "forgive", 
    name: "Forgiveness", 
    refs: [
      ["1 John", 1, 9], ["Ephesians", 4, 32], ["Colossians", 3, 13], ["Matthew", 6, 14], ["Psalms", 103, 12], 
      ["Isaiah", 43, 25], ["Micah", 7, 18], ["Acts", 3, 19], ["Matthew", 6, 15], ["Proverbs", 28, 13],
      ["Psalms", 86, 5], ["Luke", 23, 34], ["Luke", 6, 37], ["Luke", 11, 4], ["Acts", 10, 43], 
      ["Mark", 11, 25], ["Psalms", 32, 1], ["Psalms", 51, 1], ["Psalms", 130, 4], ["Jeremiah", 31, 34]
    ] 
  },
  { 
    id: "joy", 
    name: "Joy", 
    refs: [
      ["Nehemiah", 8, 10], ["Psalms", 16, 11], ["John", 15, 11], ["Psalms", 30, 5], ["Galatians", 5, 22], 
      ["Romans", 15, 13], ["Psalms", 126, 5], ["James", 1, 2], ["1 Peter", 1, 8], ["Psalms", 118, 24],
      ["Psalms", 97, 11], ["Psalms", 126, 2], ["Luke", 2, 10], ["Isaiah", 61, 10], ["Romans", 14, 17], 
      ["Psalms", 51, 12], ["Habakkuk", 3, 18], ["John", 16, 22], ["Psalms", 4, 7], ["Zephaniah", 3, 17]
    ] 
  },
  { 
    id: "hope", 
    name: "Hope", 
    refs: [
      ["Romans", 15, 13], ["Jeremiah", 29, 11], ["Psalms", 42, 11], ["Hebrews", 6, 19], ["Psalms", 147, 11], 
      ["Isaiah", 40, 31], ["Romans", 8, 24], ["Romans", 12, 12], ["Hebrews", 11, 1], ["Psalms", 39, 7],
      ["Psalms", 71, 14], ["Psalms", 119, 116], ["Psalms", 119, 166], ["Romans", 5, 5], ["Romans", 15, 4], 
      ["Colossians", 1, 27], ["1 Thessalonians", 5, 8], ["Titus", 1, 2], ["1 Peter", 1, 3], ["1 Peter", 1, 21]
    ] 
  },
  { 
    id: "direction", 
    name: "Direction", 
    refs: [
      ["Proverbs", 3, 5], ["Proverbs", 3, 6], ["Psalms", 32, 8], ["Isaiah", 30, 21], ["Proverbs", 16, 9], 
      ["Psalms", 119, 105], ["Psalms", 37, 23], ["Jeremiah", 10, 23], ["Proverbs", 16, 3], ["Psalms", 25, 4],
      ["Psalms", 25, 9], ["Psalms", 119, 133], ["Isaiah", 48, 17], ["Psalms", 43, 3], ["Psalms", 48, 14], 
      ["Psalms", 73, 24], ["Proverbs", 4, 18], ["Isaiah", 58, 11], ["Romans", 8, 14], ["Psalms", 143, 8]
    ] 
  },
  { 
    id: "holiness", 
    name: "Holiness", 
    refs: [
      ["1 Peter", 1, 16], ["Hebrews", 12, 14], ["2 Corinthians", 7, 1], ["Romans", 12, 1], ["1 Peter", 1, 15], 
      ["Romans", 12, 2], ["Leviticus", 20, 7], ["2 Timothy", 2, 21], ["Ephesians", 4, 24], ["Romans", 6, 22],
      ["Ephesians", 1, 4], ["1 Thessalonians", 4, 3], ["1 Thessalonians", 4, 7], ["Hebrews", 12, 10], ["Revelation", 22, 11], 
      ["Leviticus", 11, 44], ["Exodus", 19, 6], ["Luke", 1, 75], ["Psalms", 29, 2], ["Psalms", 93, 5]
    ] 
  },
  { 
    id: "holyghost", 
    name: "The Holy Ghost", 
    refs: [
      ["Acts", 2, 4], ["Acts", 1, 8], ["John", 14, 26], ["Romans", 8, 26], ["John", 15, 26], 
      ["John", 16, 13], ["Galatians", 5, 22], ["Luke", 11, 13], ["Acts", 2, 38], ["Romans", 15, 13],
      ["John", 14, 16], ["John", 14, 17], ["Ephesians", 1, 13], ["Ephesians", 4, 30], ["Romans", 8, 14], 
      ["1 Corinthians", 3, 16], ["1 Corinthians", 6, 19], ["Acts", 10, 44], ["Acts", 19, 2], ["Galatians", 5, 25]
    ] 
  },
  { 
    id: "trust", 
    name: "Trusting God", 
    refs: [
      ["Proverbs", 3, 5], ["Psalms", 37, 5], ["Isaiah", 26, 4], ["Nahum", 1, 7], ["Proverbs", 3, 6], 
      ["Psalms", 56, 3], ["Psalms", 112, 7], ["Jeremiah", 17, 7], ["Psalms", 91, 2], ["Romans", 8, 28],
      ["Psalms", 9, 10], ["Psalms", 20, 7], ["Psalms", 28, 7], ["Psalms", 37, 3], ["Psalms", 115, 11], 
      ["Psalms", 118, 8], ["Psalms", 125, 1], ["Isaiah", 12, 2], ["Mark", 11, 22], ["Hebrews", 13, 6]
    ] 
  },
  { 
    id: "promises", 
    name: "God's Promises", 
    refs: [
      ["2 Corinthians", 1, 20], ["2 Peter", 1, 4], ["Hebrews", 10, 23], ["Numbers", 23, 19], ["Joshua", 21, 45], 
      ["Psalms", 145, 13], ["Hebrews", 6, 18], ["Galatians", 3, 29], ["Hebrews", 11, 11], ["Romans", 4, 21],
      ["Joshua", 23, 14], ["1 Kings", 8, 56], ["Psalms", 119, 140], ["Isaiah", 55, 11], ["Luke", 1, 37], 
      ["Romans", 15, 8], ["Hebrews", 8, 6], ["Titus", 1, 2], ["Hebrews", 9, 15], ["Revelation", 21, 4]
    ] 
  },
  { 
    id: "comfort", 
    name: "Comfort", 
    refs: [
      ["2 Corinthians", 1, 3], ["Psalms", 34, 18], ["Matthew", 5, 4], ["Psalms", 23, 4], ["2 Corinthians", 1, 4], 
      ["Psalms", 119, 50], ["Psalms", 94, 19], ["John", 14, 18], ["John", 14, 27], ["Isaiah", 51, 12],
      ["Psalms", 119, 76], ["Isaiah", 66, 13], ["Matthew", 11, 28], ["John", 14, 16], ["John", 16, 33], 
      ["Psalms", 23, 1], ["Romans", 15, 4], ["Isaiah", 12, 1], ["Isaiah", 40, 1], ["Psalms", 116, 7]
    ] 
  },
  { 
    id: "guidance", 
    name: "Guidance", 
    refs: [
      ["Psalms", 119, 105], ["Proverbs", 3, 6], ["John", 16, 13], ["Psalms", 25, 9], ["Psalms", 32, 8], 
      ["Proverbs", 3, 5], ["Proverbs", 4, 18], ["Isaiah", 58, 11], ["Psalms", 48, 14], ["Psalms", 73, 24],
      ["Psalms", 143, 10], ["Proverbs", 16, 9], ["Jeremiah", 10, 23], ["Proverbs", 16, 3], ["Psalms", 37, 23], 
      ["Isaiah", 30, 21], ["Psalms", 25, 5], ["Luke", 1, 79], ["James", 1, 5], ["Psalms", 119, 133]
    ] 
  },
  { 
    id: "protection", 
    name: "Protection", 
    refs: [
      ["Psalms", 91, 1], ["Psalms", 121, 7], ["Isaiah", 54, 17], ["2 Thessalonians", 3, 3], ["Psalms", 121, 8], 
      ["Psalms", 91, 11], ["Psalms", 34, 7], ["Proverbs", 18, 10], ["Psalms", 138, 7], ["Psalms", 18, 2],
      ["Psalms", 91, 4], ["Psalms", 121, 3], ["Psalms", 121, 5], ["Psalms", 115, 11], ["Deuteronomy", 31, 8], 
      ["Proverbs", 3, 26], ["Proverbs", 30, 5], ["Isaiah", 41, 10], ["Psalms", 46, 1], ["Psalms", 27, 1]
    ] 
  },
  { 
    id: "victory", 
    name: "Victory", 
    refs: [
      ["1 Corinthians", 15, 57], ["Romans", 8, 37], ["1 John", 5, 4], ["Deuteronomy", 20, 4], ["2 Corinthians", 2, 14], 
      ["1 John", 4, 4], ["Romans", 8, 31], ["Psalms", 108, 13], ["Ephesians", 6, 13], ["1 John", 5, 5],
      ["Psalms", 44, 3], ["Psalms", 60, 12], ["Proverbs", 21, 31], ["Luke", 10, 19], ["1 Corinthians", 15, 55], 
      ["Romans", 8, 35], ["2 Corinthians", 10, 4], ["Ephesians", 6, 11], ["Revelation", 12, 11], ["Revelation", 15, 2]
    ] 
  },
];

// ─── AMBIENT AUDIO MANIFEST ────────────────────────────────────────────────
export const AUDIO_MANIFEST: AudioTrack[] = [
  { id: "track1", cat: "Instrumental", title: "Anhedonia", url: "/rest-music-1.mp3" },
  { id: "track2", cat: "Instrumental", title: "Saying Goodbye", url: "/rest-music-2.mp3" },
  { id: "track3", cat: "Instrumental", title: "I Wish I Told You", url: "/rest-music-3.mp3" },
];

export const PIXABAY_KEY = "";

// ─── LOCAL STORAGE PERSISTENCE ──────────────────────────────────────────────
const SKEY = "rest_v7";

export function loadState(): AppState {
  try {
    if (typeof window !== "undefined") {
      const v7 = localStorage.getItem(SKEY);
      if (v7) return JSON.parse(v7);
      for (const o of ["rest_v6", "rest_v5", "rest_v4"]) {
        const r = localStorage.getItem(o);
        if (r) {
          const s = JSON.parse(r);
          localStorage.setItem(SKEY, JSON.stringify(s));
          return s;
        }
      }
    }
  } catch {}
  return {};
}

export function saveState(s: AppState): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(SKEY, JSON.stringify(s));
    }
  } catch {}
}

// ─── LOCAL STORAGE AUTHENTICATION ──────────────────────────────────────────
const AKEY = "rest_auth_v7";

export const authAdapter = {
  current(): User | null {
    try {
      if (typeof window !== "undefined") {
        return JSON.parse(localStorage.getItem(AKEY) || "null");
      }
    } catch {}
    return null;
  },
  _users(): Record<string, { name: string; email: string; pass: string }> {
    try {
      if (typeof window !== "undefined") {
        return JSON.parse(localStorage.getItem(AKEY + "_users") || "{}");
      }
    } catch {}
    return {};
  },
  _saveUsers(u: Record<string, { name: string; email: string; pass: string }>): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(AKEY + "_users", JSON.stringify(u));
      }
    } catch {}
  },
  _hash(p: string): string {
    let h = 0;
    for (let i = 0; i < p.length; i++) {
      h = (h << 5) - h + p.charCodeAt(i);
      h |= 0;
    }
    return String(h);
  },
  signUp(name: string, email: string, password?: string): User {
    const users = this._users();
    email = email.toLowerCase().trim();
    if (!email || !password) throw new Error("Email and password required.");
    if (users[email]) throw new Error("An account with that email already exists.");
    users[email] = { name, email, pass: this._hash(password) };
    this._saveUsers(users);
    const u = { name, email };
    if (typeof window !== "undefined") {
      localStorage.setItem(AKEY, JSON.stringify(u));
    }
    return u;
  },
  signIn(email: string, password?: string): User {
    const users = this._users();
    email = email.toLowerCase().trim();
    const rec = users[email];
    if (!rec || !password || rec.pass !== this._hash(password)) throw new Error("Invalid email or password.");
    const u = { name: rec.name, email };
    if (typeof window !== "undefined") {
      localStorage.setItem(AKEY, JSON.stringify(u));
    }
    return u;
  },
  google(): User {
    const u = { name: "Guest", email: "guest@rest.local", google: true };
    if (typeof window !== "undefined") {
      localStorage.setItem(AKEY, JSON.stringify(u));
    }
    return u;
  },
  reset(email: string): boolean {
    const users = this._users();
    if (!users[email.toLowerCase().trim()]) throw new Error("No account with that email.");
    return true; // pretend email sent (local mode)
  },
  signOut(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AKEY);
    }
  },
};

// ─── DATE HELPERS ───────────────────────────────────────────────────────────
export const todayISO = (): string => new Date().toISOString().split("T")[0];

export const fmtDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return new Date(+y, +m - 1, +d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// ─── GENERATIVE / NEURAL TTS HELPERS ───────────────────────────────────────
export const TTS_VOICES = [
  { id: "natural", label: "Premium Natural Voice", desc: "Built-in · Royalty-Free", engine: "browser", lang: "en-US" },
  { id: "samantha", label: "Samantha", desc: "Clear Female · Device Built-in", engine: "browser", lang: "en-US" },
  { id: "premium-male", label: "Preach Male", desc: "Deep Male · Device Built-in", engine: "browser", lang: "en-US" },
  { id: "browser", label: "Default Device Voice", desc: "Built-in · always works", engine: "browser", lang: "en-US" },
];

export function isPuterReady(): boolean {
  return false;
}

export async function puterSpeak(text: string, voiceId: string, lang: string, engine: string): Promise<any> {
  if (!isPuterReady()) throw new Error("Puter is not loaded.");
  return await window.puter.ai.txt2speech(text, { voice: voiceId, engine, language: lang });
}

export function getBrowserVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() as SpeechSynthesisVoice[];
  const en = voices.filter(v => v.lang.startsWith("en"));
  return (
    en.find(v => /natural|neural|enhanced|premium/i.test(v.name)) ||
    en.find(v => /samantha|daniel|karen|moira|ava|alex|victoria|allison|zoe/i.test(v.name)) ||
    en.find(v => v.lang === "en-US" && !v.name.toLowerCase().includes("compact")) ||
    en.find(v => v.lang.startsWith("en")) ||
    voices[0] ||
    null
  );
}

export const PLAN_PRESETS = [
  { id: "365", name: "Whole Bible Plan", scope: "all", days: 365 },
  { id: "ot", name: "Old Testament Plan", scope: "ot", days: 180 },
  { id: "nt", name: "New Testament Plan", scope: "nt", days: 90 },
  { id: "gospels", name: "Gospels Plan", scope: "gospels", days: 30 },
  { id: "psalms", name: "Psalms & Proverbs Plan", scope: "psalms", days: 30 },
  { id: "custom", name: "Custom Length Plan", scope: "all", days: 120 }
];

export function registerPWA(): void {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swCode = `
        const CACHE_NAME = 'rest-v7-offline';
        self.addEventListener('install', (e) => {
          self.skipWaiting();
        });
        self.addEventListener('activate', (e) => {
          e.waitUntil(clients.claim());
        });
        self.addEventListener('fetch', (e) => {
          e.respondWith(fetch(e.request).catch(() => new Response("Offline mode")));
        });
      `;
      const blob = new Blob([swCode], { type: "application/javascript" });
      const swUrl = URL.createObjectURL(blob);
      navigator.serviceWorker.register(swUrl)
        .then(() => console.log("REST PWA service worker registered successfully"))
        .catch(err => console.log("PWA service worker registration failed:", err));
    });
  }
}

export function useFocusAudio() {
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const elRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const padRef = useRef<any | null>(null);
  const duckRef = useRef(1);
  const volRef = useRef(0.5);

  function applyVol() {
    const e = volRef.current * duckRef.current;
    if (elRef.current) {
      elRef.current.volume = Math.min(1, e);
    }
    if (padRef.current?.master && ctxRef.current) {
      padRef.current.master.gain.setTargetAtTime(e * 0.4, ctxRef.current.currentTime, 0.15);
    }
  }

  function stopGen() {
    if (padRef.current) {
      try {
        padRef.current.nodes.forEach((n: any) => {
          try {
            n.stop();
          } catch {}
        });
      } catch {}
      padRef.current = null;
    }
  }

  function buildGen(kind: string) {
    stopGen();
    const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const master = ctx.createGain();
    master.gain.value = volRef.current * 0.4 * duckRef.current;
    master.connect(ctx.destination);
    const freqs = kind === "deep" ? [82.41, 110, 164.81] : kind === "warm" ? [110, 164.81, 220, 329.63] : [110, 138.59, 164.81];
    const nodes: any[] = [];
    for (const f of freqs) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.value = 0.2;
      o.connect(g);
      g.connect(master);
      o.start();
      nodes.push(o);
    }
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 0.06;
    lg.gain.value = 0.05;
    lfo.connect(lg);
    lg.connect(master.gain);
    lfo.start();
    nodes.push(lfo);
    padRef.current = { master, nodes };
  }

  function play(t: AudioTrack) {
    if (elRef.current) {
      elRef.current.pause();
      elRef.current = null;
    }
    stopGen();
    setTrack(t);
    if (t.url) {
      const a = new Audio(t.url);
      a.loop = true;
      a.volume = Math.min(1, volRef.current * duckRef.current);
      a.addEventListener(
        "canplaythrough",
        () => {
          a.play()
            .then(() => {
              elRef.current = a;
              setPlaying(true);
            })
            .catch(err => {
              console.error("Audio play() blocked:", err, "url:", t.url);
              buildGen(t.gen || "calm");
              setPlaying(true);
            });
        },
        { once: true }
      );
      a.addEventListener("error", () => {
        console.error("Audio load error for:", t.url);
        buildGen(t.gen || "calm");
        setPlaying(true);
      });
      a.load();
    } else {
      buildGen(t.gen || "calm");
      setPlaying(true);
    }
  }

  function toggle() {
    if (!track) return;
    if (playing) {
      if (elRef.current) elRef.current.pause();
      if (ctxRef.current) ctxRef.current.suspend();
      setPlaying(false);
    } else {
      if (elRef.current) {
        elRef.current.play();
      } else if (ctxRef.current) {
        ctxRef.current.resume();
      } else {
        buildGen(track.gen || "calm");
      }
      setPlaying(true);
    }
  }

  function stop() {
    if (elRef.current) {
      elRef.current.pause();
      elRef.current = null;
    }
    stopGen();
    if (ctxRef.current) {
      try {
        ctxRef.current.suspend();
      } catch {}
    }
    setPlaying(false);
    setTrack(null);
  }

  function setVol(v: number) {
    setVolume(v);
    volRef.current = v;
    applyVol();
  }

  function duck(a: boolean) {
    duckRef.current = a ? 0.18 : 1;
    applyVol();
  }

  return { track, playing, volume, play, toggle, stop, setVol, duck };
}
