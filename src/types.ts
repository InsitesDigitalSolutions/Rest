export interface User {
  name: string;
  email: string;
  google?: boolean;
}

export interface KJVChapterRef {
  book: string;
  chapter: number;
}

export interface KJVVerse {
  verse: number;
  text: string;
}

export interface ReadingPlanDay {
  day: number;
  date: string;
  readings: string[];
  chapters: KJVChapterRef[];
}

export interface ReadingPlan {
  presetId: string;
  scope: string;
  days: number;
  startDate: string;
  endDate: string;
  list: ReadingPlanDay[];
}

export interface PrayerSessionLog {
  date: string;
  secs: number;
  ts: number;
}

export interface PrayerState {
  sessions: PrayerSessionLog[];
  level: number;
}

export interface FastingEntry {
  id: number;
  type: string;
  start: string;
  end?: string;
  completed?: boolean;
}

export interface JournalEntry {
  id: number;
  type: string;
  text: string;
  date: string;
}

export interface SavedVerse {
  text: string;
  ref: string;
  ts: number;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  streak: number;
  pct: number;
  prayerHrs: string;
}

export interface AppSettings {
  dark?: boolean;
}

export interface AppState {
  name?: string;
  settings?: AppSettings;
  plan?: ReadingPlan | null;
  completed?: Record<number, number>; // dayNum -> timestamp
  prayer?: PrayerState;
  prayerDurations?: Record<string, number>;
  fast?: FastingEntry | null;
  fastHistory?: FastingEntry[];
  journal?: JournalEntry[];
  savedVerses?: SavedVerse[];
  friends?: Friend[];
}

export interface AudioTrack {
  id: string;
  cat: string;
  title: string;
  url?: string;
  gen?: string;
}

export interface FocusAudio {
  track: AudioTrack | null;
  playing: boolean;
  volume: number;
  play: (t: AudioTrack) => void;
  toggle: () => void;
  stop: () => void;
  setVol: (v: number) => void;
  duck: (ducked: boolean) => void;
}
