import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { AppState, Friend } from '../types';

interface FriendsViewProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  card: Record<string, any>;
  sectionLabel: Record<string, any>;
  mut: string;
  fg: string;
  brd: string;
  showToast: (msg: string) => void;
  plan: any;
  completedCount: number;
  streak: number;
  pct: number;
  dark: boolean;
}

export default function FriendsView({
  state,
  setState,
  card,
  sectionLabel,
  mut,
  fg,
  brd,
  showToast,
  plan,
  completedCount,
  streak,
  pct,
  dark
}: FriendsViewProps) {
  const friends = state.friends || [];
  const [code, setCode] = useState("");
  const myCode = state.name ? state.name.slice(0, 3).toUpperCase() + "777" : "Y777"; // fallback mock share code

  const C_gold = "var(--theme-gold, #C5A367)";
  const C_bg = "#0A0A0A";
  const C_faint = "rgba(255, 255, 255, 0.3)";
  const C_bg2 = "#121212";
  const F = "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif";

  function add() {
    const c = code.trim().toUpperCase();
    if (!c || c.length < 5) {
      showToast("Enter a valid code");
      return;
    }
    if (c === myCode) {
      showToast("That's your own code");
      return;
    }
    if (friends.find(f => f.id === c)) {
      showToast("Already added");
      return;
    }
    
    // demo friend with simulated mutual progress
    const name = c.slice(0, 4).charAt(0) + c.slice(0, 4).slice(1).toLowerCase();
    const simP = Math.max(1, Math.floor(Math.random() * Math.max(1, completedCount) * 1.2));
    
    const newFriend: Friend = {
      id: c,
      name,
      email: `${name.toLowerCase()}@rest.local`,
      streak: Math.max(1, Math.floor(Math.random() * 20)),
      pct: pct,
      prayerHrs: (Math.random() * 10).toFixed(1)
    };

    setState(s => ({
      ...s,
      friends: [...(s.friends || []), newFriend]
    }));
    
    setCode("");
    showToast(name + " added");
  }

  function react(fc: string, emoji: string) {
    showToast("Sent " + emoji + " to friend");
  }

  const planLen = plan ? plan.list.length : 1;

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
    padding: "10px 14px",
    background: "transparent",
    border: `1px solid ${borderCol}`,
    borderRadius: 10,
    color: textCol,
    fontFamily: F,
    fontSize: 13,
    cursor: "pointer"
  });

  return (
    <div id="friends-view">
      <div style={sectionLabel}>Reading Together</div>
      
      {/* my card */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: C_gold,
              color: C_bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 300
            }}
          >
            {(state.name || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: fg }}>{state.name || "You"}</div>
            <div style={{ fontSize: 12, color: mut }}>
              Day {completedCount} · {streak} streak · {pct}%
            </div>
          </div>
          <div style={{ color: C_gold, fontSize: 18, fontWeight: 300 }}>{pct}%</div>
        </div>
        
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: dark ? C_bg2 : "#F0ECE2",
            borderRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: mut, letterSpacing: 1, textTransform: "uppercase" }}>Share Code</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: C_gold, letterSpacing: 3, fontFamily: "monospace" }}>
              {myCode}
            </div>
          </div>
          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(myCode);
              }
              showToast("Code copied");
            }}
            style={ghostBtnStyle(brd, fg)}
          >
            Copy
          </button>
        </div>
      </div>

      {/* add */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Friend's code"
          style={{
            flex: 1,
            padding: "11px 14px",
            background: "transparent",
            border: `1px solid ${brd}`,
            borderRadius: 10,
            color: fg,
            fontFamily: "monospace",
            fontSize: 15,
            letterSpacing: 2,
            textTransform: "uppercase",
            boxSizing: "border-box" as const
          }}
        />
        <button onClick={add} style={goldBtnStyle}>
          <UserPlus size={16} /> Add
        </button>
      </div>

      {/* leaderboard */}
      {friends.length === 0 ? (
        <div style={{ color: mut, fontSize: 13, textAlign: "center" as const, padding: "24px 0" }}>
          Add a friend's code to see each other's progress.
        </div>
      ) : (
        [
          { id: "me", name: state.name || "You", progress: completedCount, streak, isMe: true },
          ...friends.map(f => ({ id: f.id, name: f.name, progress: f.streak, streak: f.streak, isMe: false }))
        ]
          .sort((a, b) => b.progress - a.progress)
          .map((f, i) => (
            <div
              key={f.id}
              style={{
                padding: "12px 4px",
                borderBottom: `1px solid ${brd}`,
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
            >
              <span style={{ color: mut, fontSize: 13, width: 16, textAlign: "center" as const }}>{i + 1}</span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: f.isMe ? C_gold : "transparent",
                  border: `1px solid ${f.isMe ? C_gold : brd}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.isMe ? C_bg : fg,
                  fontWeight: 500,
                  fontSize: 13
                }}
              >
                {f.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: f.isMe ? C_gold : fg }}>
                  {f.name}
                  {f.isMe ? " (You)" : ""}
                </div>
                <div style={{ fontSize: 11, color: mut }}>
                  Day {f.progress} · {Math.round((f.progress / planLen) * 100)}% · {f.streak} streak
                </div>
                <div style={{ height: 2, background: brd, borderRadius: 100, marginTop: 5 }}>
                  <div
                    style={{
                      width: `${Math.min(100, (f.progress / planLen) * 100)}%`,
                      height: "100%",
                      background: f.isMe ? C_gold : mut,
                      borderRadius: 100
                    }}
                  />
                </div>
              </div>
              {!f.isMe && (
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => react(f.id, "🙏")}
                    title="Praying"
                    style={{ background: "transparent", border: `1px solid ${brd}`, borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontSize: 13 }}
                  >
                    🙏
                  </button>
                  <button
                    onClick={() => react(f.id, "👏")}
                    title="Finished"
                    style={{ background: "transparent", border: `1px solid ${brd}`, borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontSize: 13 }}
                  >
                    👏
                  </button>
                </div>
              )}
            </div>
          ))
      )}
      
      <div style={{ fontSize: 11, color: C_faint, marginTop: 16, lineHeight: 1.6, textAlign: "center" as const }}>
        Shared progress shows % complete only. Your journal and dashboard stay private.
      </div>
    </div>
  );
}
export type { FriendsViewProps };
