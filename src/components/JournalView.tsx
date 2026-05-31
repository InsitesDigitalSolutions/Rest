import { useState } from 'react';
import { Search } from 'lucide-react';
import { fmtDate } from '../utils/kjv';

interface JournalViewProps {
  state: any;
  addJournal: (type: string, text: string) => void;
  card: any;
  sectionLabel: any;
  mut: string;
  fg: string;
  brd: string;
  setState: any;
}

export default function JournalView({
  state,
  addJournal,
  card,
  sectionLabel,
  mut,
  fg,
  brd,
  setState
}: JournalViewProps) {
  const [type, setType] = useState("Prayer Request");
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const types = ["Prayer Request", "Answered Prayer", "Testimony", "Note", "Scripture Received"];
  const journal = state.journal || [];
  const filtered = journal.filter(
    (j: any) =>
      !q ||
      j.text.toLowerCase().includes(q.toLowerCase()) ||
      j.type.toLowerCase().includes(q.toLowerCase())
  );

  const C_gold = "var(--theme-gold, #C5A367)";
  const F = "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif";

  const goldBtn = {
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

  return (
    <div>
      <div style={sectionLabel}>Prayer Journal</div>
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: "5px 12px",
                borderRadius: 16,
                border: `1px solid ${type === t ? C_gold : brd}`,
                background: type === t ? C_gold + "18" : "transparent",
                color: type === t ? C_gold : mut,
                cursor: "pointer",
                fontFamily: F,
                fontSize: 12,
                transition: "all 0.2s"
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Write a ${type.toLowerCase()}…`}
          rows={3}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "transparent",
            border: `1px solid ${brd}`,
            borderRadius: 10,
            color: fg,
            fontFamily: F,
            fontSize: 14,
            boxSizing: "border-box" as const,
            resize: "vertical" as const,
            marginBottom: 10
          }}
        />
        <button
          onClick={() => {
            addJournal(type, text);
            setText("");
          }}
          disabled={!text.trim()}
          style={{
            ...goldBtn,
            opacity: text.trim() ? 1 : 0.5,
            cursor: text.trim() ? "pointer" : "not-allowed"
          }}
        >
          Save Entry
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 12, top: 11, color: mut }}>
          <Search size={16} />
        </span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search entries…"
          style={{
            width: "100%",
            padding: "10px 14px 10px 40px",
            background: "transparent",
            border: `1px solid ${brd}`,
            borderRadius: 10,
            color: fg,
            fontFamily: F,
            fontSize: 14,
            boxSizing: "border-box" as const
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: mut, fontSize: 13, textAlign: "center", padding: "30px 0" }}>No entries yet.</div>
      ) : (
        filtered.map((j: any) => (
          <div key={j.id} style={{ padding: "12px 4px", borderBottom: `1px solid ${brd}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C_gold, letterSpacing: 1, textTransform: "uppercase" }}>{j.type}</span>
              <span style={{ fontSize: 11, color: mut }}>{fmtDate(j.date)}</span>
            </div>
            <div style={{ fontSize: 15, color: fg, lineHeight: 1.5 }}>{j.text}</div>
            <button
              onClick={() => setState((s: any) => ({ ...s, journal: (s.journal || []).filter((x: any) => x.id !== j.id) }))}
              style={{
                background: "none",
                border: "none",
                color: mut,
                fontSize: 11,
                cursor: "pointer",
                marginTop: 6,
                padding: 0
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
