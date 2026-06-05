import React, { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from "recharts";
import {
  TrendingUp, Target, Crosshair, Trophy, Activity,
  ExternalLink, Circle, ChevronLeft, ChevronRight,
} from "lucide-react";
import Papa from "papaparse";
import { CONFIG, HANDLE, LIVE_URL } from "./config.js";

/* ============================================================================
   Live board for the Muttcliffe CFL 2026 sheet.
   - Reads the Bets and Games tabs straight from your published Google Sheet.
   - Sheet must be shared "Anyone with the link = Viewer".
   - All edits to go live are in src/config.js (sheet ID, handle, domain).
   ========================================================================== */

/* ---------- tokens ---------- */
const C = {
  bg: "#080B11", bg2: "#0C1119", panel: "#10161F", panel2: "#0E141C",
  line: "#1C2531", line2: "#283344", ink: "#EAF0F8", mut: "#8696AB", dim: "#5A6878",
  sand: "#C8AE85", sandDim: "#6E6045",            // main colorway (was gold)
  win: "#34D38A", loss: "#F2585F", push: "#7E8AA0",
  mlc: "#5AB0E7", atsc: "#C8AE85", ouc: "#9D7BE7", propc: "#34D38A",
};
const mono = "'JetBrains Mono', ui-monospace, monospace";
const disp = "'Archivo', system-ui, sans-serif";

/* ---------- odds + unit helpers ---------- */
const dec = (a) => (a > 0 ? 1 + a / 100 : 1 + 100 / -a);
const netUnits = (odds, stake, res) =>
  res === "W" ? (odds < 0 ? (-100 / odds) * stake : (odds / 100) * stake)
    : res === "P" ? 0 : -stake;
const clvPct = (odds, close) => (close == null ? null : dec(odds) / dec(close) - 1);
const fmtOdds = (o) => (o > 0 ? `+${o}` : `${o}`);
const fmtU = (u) => `${u > 0 ? "+" : u < 0 ? "\u2212" : ""}${Math.abs(u).toFixed(2)}u`;
const fmtPct = (p, signed) =>
  `${signed && p > 0 ? "+" : signed && p < 0 ? "\u2212" : ""}${Math.abs(p * 100).toFixed(1)}%`;
const winPct = (w, l) => (w + l === 0 ? 0 : w / (w + l));
const num = (s) => {
  const n = parseFloat(String(s ?? "").replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? null : n;
};

/* ---------- type accent ---------- */
const typeColor = (t) => {
  const k = String(t || "").toUpperCase();
  if (k.includes("ML")) return C.mlc;
  if (k.includes("ATS") || k.includes("SPREAD")) return C.atsc;
  if (k.startsWith("O") || k.startsWith("U") || k.includes("TOTAL")) return C.ouc;
  return C.propc;
};

/* ---------- live loader (gviz CSV → papaparse, by header name) ---------- */
async function loadLive() {
  const url = (tab) =>
    `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}` +
    `/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  const grab = (tab) =>
    new Promise((res, rej) =>
      Papa.parse(url(tab), {
        download: true, header: true, skipEmptyLines: true,
        complete: (r) => res(r.data), error: rej,
      })
    );
  const [betsRaw, gamesRaw] = await Promise.all([grab(CONFIG.betsTab), grab(CONFIG.gamesTab)]);

  const games = gamesRaw
    .filter((r) => r.Away && r.Home)
    .map((r) => ({
      week: parseInt(r.Week, 10) || 0,
      away: r.Away, home: r.Home,
      suPick: r["SU Pick"] || "", su: (r.SU || "").trim(),
      line: num(r["Home Line"]),
      atsPick: r["ATS Pick"] || "", ats: (r.ATS || "").trim(),
    }));

  const wagers = betsRaw
    .filter((r) => r.Odds && r["Stake (u)"])
    .map((r) => ({
      week: parseInt(r.Week, 10) || 0,
      date: r.Date, book: r.Book || "", type: r.Type, play: r.Play,
      odds: num(r.Odds), close: num(r.Close),
      stake: num(r["Stake (u)"]), result: (r.Result || "").trim(),
    }));

  return { games, wagers };
}

/* ---------- preview data (used until a sheet ID resolves) ---------- */
const PREVIEW = {
  wagers: [
    { week: 1, date: "2026-06-04", book: "", type: "ML", play: "Montreal ML", odds: -120, close: -127, stake: 1.0, result: "W" },
    { week: 1, date: "2026-06-06", book: "DK", type: "ATS", play: "Winnipeg \u22121.5", odds: -110, close: -118, stake: 1.0, result: "L" },
    { week: 1, date: "2026-06-06", book: "FD", type: "O/U", play: "Over 48.5", odds: -105, close: -110, stake: 0.75, result: "W" },
  ],
  games: [
    { week: 1, away: "MTL", home: "HAM", suPick: "MTL", su: "W", line: null, atsPick: "", ats: "" },
    { week: 1, away: "WPG", home: "CGY", suPick: "WPG", su: "W", line: 1.5, atsPick: "WPG", ats: "W" },
    { week: 1, away: "EDM", home: "OTT", suPick: "OTT", su: "L", line: -2.5, atsPick: "OTT", ats: "L" },
  ],
};

/* ---------- analytics ---------- */
function analyze(wagers, games) {
  const settled = wagers.filter((w) => ["W", "L", "P"].includes(w.result));
  let net = 0, staked = 0, clvSum = 0, clvN = 0;
  const wRec = { W: 0, L: 0, P: 0 };
  const curve = [];
  settled.forEach((w) => {
    const n = netUnits(w.odds, w.stake, w.result);
    net += n; staked += w.stake || 0;
    if (w.result in wRec) wRec[w.result]++;
    const c = clvPct(w.odds, w.close);
    if (c != null) { clvSum += c; clvN++; }
    curve.push({ i: curve.length + 1, bankroll: +net.toFixed(2), play: w.play });
  });
  const su = { W: 0, L: 0 };
  const ats = { W: 0, L: 0, P: 0 };
  games.forEach((g) => {
    if (g.su === "W") su.W++; else if (g.su === "L") su.L++;
    if (g.ats === "W") ats.W++; else if (g.ats === "L") ats.L++; else if (g.ats === "P") ats.P++;
  });
  return {
    net, staked, roi: staked ? net / staked : 0, clv: clvN ? clvSum / clvN : 0,
    wRec, su, ats, suPct: winPct(su.W, su.L), atsPct: winPct(ats.W, ats.L), curve,
  };
}

/* ---------- small UI atoms ---------- */
function Eyebrow({ children, color }) {
  return (
    <span style={{
      font: `700 10px ${disp}`, letterSpacing: ".16em", textTransform: "uppercase",
      color: color || C.mut,
    }}>{children}</span>
  );
}

function Stat({ icon, label, value, sub, tone, hint, big }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13,
      padding: big ? "16px 16px" : "13px 14px", display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.mut }}>
        {icon}<Eyebrow>{label}</Eyebrow>
      </div>
      <div style={{ font: `800 ${big ? 30 : 24}px ${mono}`, color: tone || C.ink, lineHeight: 1, letterSpacing: "-0.01em" }}>
        {value}
      </div>
      {(sub || hint) && (
        <div style={{ font: `500 11px ${disp}`, color: C.dim }}>{sub || hint}</div>
      )}
    </div>
  );
}

function Badge({ type }) {
  const col = typeColor(type);
  return (
    <span style={{
      font: `700 10px ${mono}`, letterSpacing: ".05em", color: col,
      border: `1px solid ${col}55`, background: `${col}14`, borderRadius: 6, padding: "2px 7px",
    }}>{String(type || "").toUpperCase()}</span>
  );
}

function Result({ r }) {
  const map = { W: C.win, L: C.loss, P: C.push };
  if (!r) return <span style={{ font: `600 11px ${disp}`, color: C.dim }}>pending</span>;
  const col = map[r] || C.mut;
  return (
    <span style={{
      font: `800 11px ${mono}`, color: col, border: `1px solid ${col}55`,
      background: `${col}14`, borderRadius: 6, padding: "2px 8px",
    }}>{r}</span>
  );
}

function IconBtn({ children, onClick, dis }) {
  return (
    <button onClick={onClick} disabled={dis} style={{
      cursor: dis ? "default" : "pointer", opacity: dis ? 0.3 : 1, background: "transparent",
      border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, padding: "6px 8px",
      display: "grid", placeItems: "center",
    }}>{children}</button>
  );
}

const recStr = (r) => `${r.W}-${r.L}${r.P ? "-" + r.P : ""}`;

/* ---------- dashboard (live board) ---------- */
function Dashboard({ data, A }) {
  const [tab, setTab] = useState("wagers");
  const tabs = [["wagers", "Wagers"], ["pickem", "Pick'em"], ["spread", "Spread"]];
  const settled = data.wagers.filter((w) => ["W", "L", "P"].includes(w.result));
  const pending = data.wagers.filter((w) => !["W", "L", "P"].includes(w.result));

  return (
    <div className="fu" style={{ animationDelay: ".1s", marginTop: 18 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {tabs.map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            font: `700 13px ${disp}`, letterSpacing: ".03em", cursor: "pointer", padding: "9px 16px",
            borderRadius: 9, color: tab === k ? C.ink : C.mut,
            background: tab === k ? C.panel : "transparent",
            border: `1px solid ${tab === k ? C.line2 : "transparent"}`,
          }}>{lbl}</button>
        ))}
      </div>

      {tab === "wagers" && (
        <div>
          {A.curve.length > 1 && (
            <div style={{
              background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13,
              padding: "14px 10px 6px", marginBottom: 12,
            }}>
              <div style={{ padding: "0 6px 6px" }}><Eyebrow>Bankroll · units</Eyebrow></div>
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={A.curve} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.sand} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={C.sand} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={["auto", "auto"]} />
                    <ReferenceLine y={0} stroke={C.line2} strokeDasharray="3 3" />
                    <Tooltip
                      cursor={{ stroke: C.line2 }}
                      contentStyle={{ background: C.bg2, border: `1px solid ${C.line2}`, borderRadius: 8, font: `600 12px ${mono}` }}
                      labelStyle={{ color: C.mut }}
                      formatter={(v) => [fmtU(v), "Bankroll"]}
                      labelFormatter={() => ""}
                    />
                    <Area type="monotone" dataKey="bankroll" stroke={C.sand} strokeWidth={2} fill="url(#bk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13, overflow: "hidden" }}>
            <Row head cells={["Date", "Type", "Play", "Odds", "Stake", "Net", "CLV"]} />
            {[...settled, ...pending].map((w, i) => {
              const settledRow = ["W", "L", "P"].includes(w.result);
              const n = settledRow ? netUnits(w.odds, w.stake, w.result) : null;
              const c = clvPct(w.odds, w.close);
              return (
                <Row key={i}
                  cells={[
                    <span style={{ color: C.mut }}>{w.date || "—"}</span>,
                    <Badge type={w.type} />,
                    <span style={{ color: C.ink }}>{w.play}{w.book ? <span style={{ color: C.dim }}> · {w.book}</span> : null}</span>,
                    <span style={{ font: `600 12px ${mono}` }}>{fmtOdds(w.odds)}</span>,
                    <span style={{ font: `600 12px ${mono}`, color: C.mut }}>{(w.stake ?? 0).toFixed(2)}u</span>,
                    settledRow
                      ? <span style={{ font: `700 12px ${mono}`, color: n >= 0 ? C.win : C.loss }}>{fmtU(n)}</span>
                      : <Result r={w.result} />,
                    c != null
                      ? <span style={{ font: `600 12px ${mono}`, color: c >= 0 ? C.sand : C.loss }}>{fmtPct(c, true)}</span>
                      : <span style={{ color: C.dim }}>—</span>,
                  ]}
                />
              );
            })}
          </div>
        </div>
      )}

      {tab === "pickem" && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13, overflow: "hidden" }}>
          <Row head cells={["Matchup", "Pick", "Result"]} cols="1.6fr 1fr .6fr" />
          {data.games.filter((g) => g.suPick).map((g, i) => (
            <Row key={i} cols="1.6fr 1fr .6fr"
              cells={[
                <span style={{ color: C.ink }}>{g.away} <span style={{ color: C.dim }}>@</span> {g.home}</span>,
                <span style={{ font: `700 12px ${mono}`, color: C.sand }}>{g.suPick}</span>,
                <Result r={g.su} />,
              ]}
            />
          ))}
        </div>
      )}

      {tab === "spread" && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13, overflow: "hidden" }}>
          <Row head cells={["Matchup", "Pick", "Result"]} cols="1.6fr 1fr .6fr" />
          {data.games.filter((g) => g.atsPick).map((g, i) => {
            const line = g.line == null ? "" : (g.atsPick === g.home ? g.line : -g.line);
            const lineStr = line === "" ? "" : ` ${line > 0 ? "+" : "\u2212"}${Math.abs(line)}`;
            return (
              <Row key={i} cols="1.6fr 1fr .6fr"
                cells={[
                  <span style={{ color: C.ink }}>{g.away} <span style={{ color: C.dim }}>@</span> {g.home}</span>,
                  <span style={{ font: `700 12px ${mono}`, color: C.sand }}>{g.atsPick}{lineStr}</span>,
                  <Result r={g.ats} />,
                ]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ head, cells, cols }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: cols || ".9fr .7fr 1.8fr .7fr .7fr .8fr .8fr",
      alignItems: "center", gap: 8, padding: "11px 16px",
      borderBottom: `1px solid ${C.line}`,
      background: head ? C.panel2 : "transparent",
    }}>
      {cells.map((c, i) => (
        <div key={i} style={head
          ? { font: `700 10px ${disp}`, letterSpacing: ".12em", textTransform: "uppercase", color: C.mut }
          : { font: `500 13px ${disp}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {c}
        </div>
      ))}
    </div>
  );
}

/* ---------- weekly recap card ---------- */
function Recap({ data, weeks, week, setWeek }) {
  const wd = useMemo(() => {
    const w = data.wagers.filter((x) => x.week === week);
    const g = data.games.filter((x) => x.week === week);
    return analyze(w, g);
  }, [data, week]);
  const idx = weeks.indexOf(week);

  return (
    <div className="fu" style={{ animationDelay: ".1s", marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconBtn dis={idx <= 0} onClick={() => setWeek(weeks[idx - 1])}><ChevronLeft size={16} /></IconBtn>
        <Eyebrow color={C.ink}>Week {week}</Eyebrow>
        <IconBtn dis={idx >= weeks.length - 1} onClick={() => setWeek(weeks[idx + 1])}><ChevronRight size={16} /></IconBtn>
      </div>

      <div style={{
        width: "100%", maxWidth: 520, background: `linear-gradient(160deg, ${C.panel}, ${C.panel2})`,
        border: `1px solid ${C.line2}`, borderRadius: 18, overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,.45)",
      }}>
        <div style={{ padding: "20px 22px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ font: `900 22px ${disp}`, letterSpacing: "-0.02em", color: C.ink }}>
              MUTTCLIFFE <span style={{ color: C.sand }}>CFL</span>
            </div>
            <div style={{ font: `600 11px ${disp}`, color: C.mut, marginTop: 3 }}>Week {week} recap · units only</div>
          </div>
          <Eyebrow color={C.sand}>2026</Eyebrow>
        </div>

        <div style={{ padding: "10px 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <RecapRow accent={wd.net >= 0 ? C.win : C.loss} label="Wagers (units)"
            big={fmtU(wd.net)} sub={`${recStr(wd.wRec)} · ROI ${fmtPct(wd.roi, true)}`} />
          <RecapRow accent={C.ink} label="Pick'em"
            big={`${wd.su.W}-${wd.su.L}`} sub={`${fmtPct(winPct(wd.su.W, wd.su.L))} winners`} />
          <RecapRow accent={C.sand} label="Spread"
            big={recStr(wd.ats)} sub={`${fmtPct(winPct(wd.ats.W, wd.ats.L))} ATS`} />
        </div>

        <div style={{ padding: "13px 22px", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,.015)" }}>
          <span style={{ font: `700 13px ${disp}`, color: C.ink }}>{HANDLE}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: `500 11px ${mono}`, color: C.mut }}>
            <Circle size={6} fill={C.win} color={C.win} /> tracked live · {LIVE_URL}
          </span>
        </div>
      </div>

      <div style={{ font: `500 12px ${disp}`, color: C.dim, maxWidth: 440, textAlign: "center" }}>
        Units only. Full bet log is public on the live board — nothing hidden, nothing edited after the fact.
      </div>
    </div>
  );
}

function RecapRow({ accent, label, big, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 13, background: C.panel, border: `1px solid ${C.line}` }}>
      <div>
        <Eyebrow>{label}</Eyebrow>
        <div style={{ font: `500 11px ${disp}`, color: C.mut, marginTop: 6 }}>{sub}</div>
      </div>
      <div style={{ font: `800 30px ${mono}`, color: accent, letterSpacing: "-0.01em", lineHeight: 1 }}>{big}</div>
    </div>
  );
}

/* ---------- app shell ---------- */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState(PREVIEW);
  const [live, setLive] = useState(false);
  const [err, setErr] = useState(null);
  const [week, setWeek] = useState(1);

  useEffect(() => {
    let alive = true;
    if (!CONFIG.spreadsheetId || CONFIG.spreadsheetId.startsWith("PASTE")) return;
    loadLive()
      .then((d) => {
        if (!alive) return;
        if (d.wagers.length || d.games.length) { setData(d); setLive(true); }
      })
      .catch((e) => alive && setErr(String(e)));
    return () => { alive = false; };
  }, []);

  const A = useMemo(() => analyze(data.wagers, data.games), [data]);
  const weeks = useMemo(() => {
    const s = new Set();
    data.wagers.forEach((w) => w.week && s.add(w.week));
    data.games.forEach((g) => g.week && s.add(g.week));
    return [...s].sort((a, b) => a - b);
  }, [data]);

  useEffect(() => {
    if (weeks.length) setWeek(weeks[weeks.length - 1]);
  }, [weeks.length]);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1100px 600px at 80% -10%, #121A26 0%, ${C.bg} 55%)`, color: C.ink, fontFamily: disp }}>
      <style>{`
        @keyframes fu { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .fu { animation: fu .5s both; }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "30px 18px 60px" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div className="fu">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: live ? C.win : C.sand, boxShadow: `0 0 12px ${live ? C.win : C.sand}`, animation: "pulse 2s infinite", display: "inline-block" }} />
              <Eyebrow color={C.sand}>{live ? "Live \u00b7 tracked from sheet" : "Preview data"}</Eyebrow>
            </div>
            <h1 style={{ margin: "6px 0 0", font: `900 34px/0.96 ${disp}`, letterSpacing: "-0.02em" }}>
              MUTTCLIFFE <span style={{ color: C.sand }}>CFL</span>
            </h1>
            <div style={{ font: `500 13px ${disp}`, color: C.mut, marginTop: 3 }}>
              2026 season · wagers, pick&apos;em &amp; spread — all results in units
            </div>
          </div>

          <div style={{ display: "flex", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 11, padding: 4, gap: 4 }}>
            {[["dashboard", "Live board"], ["recap", "Weekly recap"]].map(([k, lbl]) => (
              <button key={k} onClick={() => setView(k)} style={{
                font: `700 12px ${disp}`, letterSpacing: ".04em", textTransform: "uppercase", cursor: "pointer",
                color: view === k ? C.bg : C.mut, background: view === k ? C.sand : "transparent",
                border: "none", borderRadius: 8, padding: "8px 14px", transition: ".15s",
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* season stat strip */}
        <div className="fu" style={{ animationDelay: ".05s", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginTop: 22 }}>
          <Stat icon={<TrendingUp size={15} />} label="Units net" value={fmtU(A.net)} tone={A.net >= 0 ? C.win : C.loss} big />
          <Stat icon={<Activity size={15} />} label="ROI" value={fmtPct(A.roi, true)} tone={A.roi >= 0 ? C.win : C.loss} />
          <Stat icon={<Crosshair size={15} />} label="CLV avg" value={fmtPct(A.clv, true)} tone={A.clv >= 0 ? C.sand : C.loss} hint="beat the close" />
          <Stat icon={<Target size={15} />} label="Wagers" value={recStr(A.wRec)} />
          <Stat icon={<Trophy size={15} />} label="Pick'em" value={`${A.su.W}-${A.su.L}`} sub={fmtPct(A.suPct)} />
          <Stat icon={<Crosshair size={15} />} label="Spread ATS" value={recStr(A.ats)} sub={fmtPct(A.atsPct)} />
        </div>

        {err && (
          <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 11, border: `1px solid ${C.loss}55`, background: `${C.loss}10`, color: C.loss, font: `500 12px ${mono}` }}>
            Couldn&apos;t reach the sheet — showing preview. Check that it&apos;s shared &quot;Anyone with the link&quot; and the tab names match. ({err})
          </div>
        )}

        {view === "dashboard"
          ? <Dashboard data={data} A={A} />
          : <Recap data={data} weeks={weeks.length ? weeks : [1]} week={week} setWeek={setWeek} />}

        <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
          <a href={`https://${LIVE_URL}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: `600 12px ${disp}`, color: C.mut, textDecoration: "none" }}>
            {LIVE_URL} <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
