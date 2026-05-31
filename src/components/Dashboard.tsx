import { useState } from 'react';
import { AppState } from '../types';

interface DashboardProps {
  state: AppState;
  card: Record<string, any>;
  sectionLabel: Record<string, any>;
  mut: string;
  fg: string;
  brd: string;
  dark: boolean;
}

export default function Dashboard({
  state,
  card,
  sectionLabel,
  mut,
  fg,
  brd,
  dark
}: DashboardProps) {
  const [sub, setSub] = useState("overview");
  const completed = state.completed || {};
  const prayer = state.prayer || { sessions: [], level: 0 };
  const sessions = prayer.sessions || [];
  const fastHist = state.fastHistory || [];
  const saved = state.savedVerses || [];
  const journal = state.journal || [];

  // helpers for Date/Time statistics
  const last7 = (arr: any[], key: string) => {
    const now = Date.now();
    return arr
      .filter(x => now - (x.ts || new Date(x.date).getTime()) < 7 * 86400000)
      .reduce((a, x) => a + (x[key] || 0), 0);
  };

  const prayerWk = Math.round(last7(sessions, "secs") / 60);
  const prayerMonth = Math.round(
    sessions
      .filter(s => Date.now() - s.ts < 30 * 86400000)
      .reduce((a, s) => a + s.secs, 0) / 60
  );
  const prayerYr = Math.round(sessions.reduce((a, s) => a + s.secs, 0) / 60);
  const readingDays = Object.keys(completed).length;

  // time-of-day for prayer
  const hourBuckets = new Array(24).fill(0);
  sessions.forEach(s => {
    const h = new Date(s.ts).getHours();
    hourBuckets[h] += s.secs;
  });
  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
  const peakLabel = Math.max(...hourBuckets) > 0
    ? `${peakHour % 12 || 12}${peakHour < 12 ? "am" : "pm"}`
    : "—";

  // standard design tokens
  const C_gold = "var(--theme-gold, #C5A367)";
  const C_goldSoft = "var(--theme-gold, #C5A367)";
  const C_bg = "#0A0A0A";
  const F = "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif";

  // Simple Bar sparklines
  interface BarsProps {
    data: number[];
    labels?: string[];
    color?: string;
  }
  const Bars = ({ data, labels, color }: BarsProps) => {
    const max = Math.max(...data, 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, marginTop: 8 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: "100%",
                height: `${(v / max) * 70}px`,
                background: color || C_gold,
                borderRadius: 3,
                minHeight: 2,
                opacity: 0.85
              }}
            />
            <span style={{ fontSize: 8, color: mut }}>{labels?.[i] || ""}</span>
          </div>
        ))}
      </div>
    );
  };

  // last 7 days reading + prayer array
  const dayLabels: string[] = [];
  const readArr: number[] = [];
  const prayArr: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    dayLabels.push(["S", "M", "T", "W", "T", "F", "S"][d.getDay()]);
    readArr.push(
      Object.entries(completed).filter(([_, ts]) => new Date(ts).toISOString().split("T")[0] === iso).length
    );
    prayArr.push(
      Math.round(sessions.filter(s => s.date === iso).reduce((a, s) => a + s.secs, 0) / 60)
    );
  }

  const tabs = [
    ["overview", "Overview"],
    ["reading", "Reading"],
    ["prayer", "Prayer"],
    ["verses", "Verses"],
    ["fasting", "Fasting"],
    ["insights", "Insights"]
  ];

  const tile = (big: string | number, label: string, sub2?: string) => (
    <div key={label} style={{ ...card, padding: 16, textAlign: "center" as const }}>
      <div style={{ fontSize: 26, fontWeight: 200, color: C_gold }}>{big}</div>
      <div style={{ fontSize: 11, color: mut, marginTop: 2 }}>{label}</div>
      {sub2 && <div style={{ fontSize: 10, color: "#55565E", marginTop: 2 }}>{sub2}</div>}
    </div>
  );

  return (
    <div id="dashboard-view">
      <div style={sectionLabel}>Spiritual Disciplines</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, paddingBottom: 2 }}>
        {tabs.map(([id, l]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 18,
              border: `1px solid ${sub === id ? C_gold : brd}`,
              background: sub === id ? C_gold : "transparent",
              color: sub === id ? C_bg : mut,
              cursor: "pointer",
              fontFamily: F,
              fontSize: 12
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {sub === "overview" && (
        <div className="rest-grid">
          {tile(readingDays, "Days Read")}
          {tile(prayerWk + "m", "Prayer (7d)")}
          {tile(prayerYr + "m", "Prayer (yr)")}
          {tile(saved.length, "Saved Verses")}
          {tile(fastHist.length, "Fasts")}
          {tile(journal.length, "Journal Entries")}
          <div style={{ ...card, gridColumn: "1/-1" }}>
            <div style={sectionLabel}>This Week · Reading</div>
            <Bars data={readArr} labels={dayLabels} />
          </div>
          <div style={{ ...card, gridColumn: "1/-1" }}>
            <div style={sectionLabel}>This Week · Prayer Minutes</div>
            <Bars data={prayArr} labels={dayLabels} color={C_goldSoft} />
          </div>
        </div>
      )}

      {sub === "reading" && (
        <div className="rest-grid">
          {tile(readingDays, "Days Completed")}
          {tile(
            (state.plan ? Math.round((readingDays / state.plan.list.length) * 100) : 0) + "%",
            "Plan Complete"
          )}
          {tile(state.plan ? state.plan.list.length - readingDays : 0, "Days Remaining")}
          <div style={{ ...card, gridColumn: "1/-1" }}>
            <div style={sectionLabel}>Last 7 Days</div>
            <Bars data={readArr} labels={dayLabels} />
          </div>
        </div>
      )}

      {sub === "prayer" && (
        <div className="rest-grid">
          {tile(prayerWk + "m", "This Week")}
          {tile(prayerMonth + "m", "This Month")}
          {tile(prayerYr + "m", "This Year")}
          {tile(sessions.length, "Sessions")}
          {tile(
            sessions.length
              ? Math.round(sessions.reduce((a, s) => a + s.secs, 0) / sessions.length / 60) + "m"
              : "0m",
            "Avg Session"
          )}
          {tile(peakLabel, "Peak Time")}
          <div style={{ ...card, gridColumn: "1/-1" }}>
            <div style={sectionLabel}>Prayer Minutes · 7 Days</div>
            <Bars data={prayArr} labels={dayLabels} color={C_goldSoft} />
          </div>
        </div>
      )}

      {sub === "verses" && (
        <div>
          <div style={sectionLabel}>Meditation Shelf · Saved Verses</div>
          {saved.length === 0 ? (
            <div style={{ color: mut, fontSize: 13, textAlign: "center" as const, padding: "30px 0" }}>
              No saved verses yet. Tap "Save" on any verse.
            </div>
          ) : (
            saved.map((v, i) => (
              <div key={i} style={{ padding: "12px 4px", borderBottom: `1px solid ${brd}` }}>
                <div style={{ fontSize: 15, color: fg, lineHeight: 1.5 }}>
                  "{v.text}"
                </div>
                <div style={{ fontSize: 12, color: C_gold, marginTop: 4 }}>
                  {v.ref} · KJV
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {sub === "fasting" && (
        <div className="rest-grid">
          {tile(fastHist.length, "Fasts Completed")}
          {tile(
            fastHist
              .reduce((acc, f) => {
                const sTime = (f as any).startTs || new Date(f.start).getTime();
                const eTime = (f as any).endTs || (f.end ? new Date(f.end).getTime() : sTime);
                return acc + (eTime - sTime) / 3600000;
              }, 0)
              .toFixed(1),
            "Total Hours"
          )}
          {tile(
            fastHist.length
              ? (
                  fastHist.reduce((acc, f) => {
                    const sTime = (f as any).startTs || new Date(f.start).getTime();
                    const eTime = (f as any).endTs || (f.end ? new Date(f.end).getTime() : sTime);
                    return acc + (eTime - sTime) / 3600000;
                  }, 0) / fastHist.length
                ).toFixed(1)
              : 0,
            "Avg Length (h)"
          )}
          {tile(fastHist.filter(f => f.completed).length, "Completed Goal")}
        </div>
      )}

      {sub === "insights" && (
        <div>
          <div style={{ ...card, marginBottom: 14 }}>
            <div style={sectionLabel}>Consistency</div>
            <div style={{ fontSize: 14, color: fg, lineHeight: 1.6 }}>
              You've been active {readArr.filter(x => x > 0).length} of the last 7 days for reading and prayed on{" "}
              {prayArr.filter(x => x > 0).length} of them.
            </div>
          </div>
          <div style={{ ...card, marginBottom: 14 }}>
            <div style={sectionLabel}>Best Time of Day</div>
            <div style={{ fontSize: 14, color: fg }}>
              Your most frequent prayer time is around <strong style={{ color: C_gold }}>{peakLabel}</strong>.
            </div>
          </div>
          <div style={{ ...card }}>
            <div style={sectionLabel}>Pattern</div>
            <div style={{ fontSize: 14, color: mut, lineHeight: 1.6 }}>
              On days you pray, you tend to read as well. Keep the rhythm gentle — consistency over intensity.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export type { DashboardProps };
