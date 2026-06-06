import React, { useState, useEffect, useMemo, useRef } from "react";
import { TrendingUp, Target, Crosshair, Trophy, Activity, ExternalLink, Circle, ChevronLeft, ChevronRight, RefreshCw, Download } from "lucide-react";
import Papa from "papaparse";
import { toPng } from "html-to-image";
import { CONFIG, HANDLE, LIVE_URL } from "./config.js";

/* Live config (sheet ID, tab names, handle, live URL) is set in config.js */
const AVATAR = "data:image/webp;base64,UklGRlYTAABXRUJQVlA4WAoAAAAQAAAAfwAAfwAAQUxQSNkDAAABDjq2bSuSnIioZhIzMzbMQczM42gNgVmyyu02xWi2LGZmZslkKSH+WhVRmZER/8q+L95/LyICoiS7bZsHQKBpqKWokO/9AFu1fGkNSXK/7dfuXn7+tS9++3NcSvqTX/TPL+++VverHZRbzjhNzEjKKTfct++H/0IjE9933w2n5CQtxo7CSO5/ycPvTmrnOHV3llKHSO0wtDJ/92Hrq44iLpiSW67Y82PtzMYu0mwh4sl1xYY9V2whC4uoRXL73V8H1emYpS5owkRVtbu3VwccT+viZ0ZBp15qSyZO1VG6OI5GoeS1LwbV8VRbNSZV7a/NWGjX/2vkpf3c+lbL+yGj5d2utf3xlRa1IyNVH9/e4Upi3HzbP6taHTb8tr6rzoK84P2gE+3YXFUGsotNruH6e4OOS+3cJKneu57eeplz1+tz1up4pbQrc2k3Ct7yexhrNJbUmBXS7jbunLvNCDZpbW5iiZseCStXmqhMXB9hZq3FoS/OKoupqj+U1lIc834VMbqwFTee+FkVcbpJC248+osqYnX6wl7wsA+qiNc/8AX3k+uml6uI2Y2FLHa1fbSKuJ2ZL+DOu3QUIrdRGOgLbOHmejv2ptMab+HsP6dl/BD+eXbDDeS2/u0wUQBzfXu9SbOi++t9CF0DvVHROTopMSCubFCTF5s/DVMFMeqnfSHz8+2rizBq+rmp4Bn/1beI0vVfmrdB4zNVRkqJNicuqALLh9le6Gt46Audecm5sgo0v5JrZuVXESEzkvH8MFU4o9rqrws+V2W8NLBYFWeOywBokrzua3h3SIhIKrXinJu/RfxGlSr9Sg+Nl1WB6VIVG/eWCRNJ9tKYc79fcRcuWb6GF1eB6ilz58Oon1WTONfk9h7y4j2T7OSxlqgQTSeTN4aJwprrjWz+tI/zBsAXsBfMtn2PW6lKTcOOURBciI7smiojp2tuDY4MV1tGB59Hh7yO3p2+0BIZovwNHfxTwU3G6EglOgQf+B/wS/A3hH/dw7/u49/38O/7+M89+M99+M+9+M/98O89+O99/wPvvfjv/fjjHvjjPvjjXvjjfvDjnvjjvvjj3vDj/vjzHvDzPvjzXvDzfvjznvDzvvjz3vDz/vN5Dw7He4DnfeDzXuB5P/C8p4a8r7dQeF+y3vKmvLc/MHhvQ1PeG2m8CYP3Z1yC5z3i8z7hea/wvF943jM87xue9w7P+29P9/BojLoHbsoMXvcBr3uB1/2g657gdV/wujd03R+87hFd94mue0XX/aLrniPUfR/Qlu471XTf8ereb1xM935jB7r3bnT/+zfV/e/fie6fAFZQOCBWDwAAMD8AnQEqgACAAD5JHoxEIqGhForGhCgEhLGAYsItawTd5M4KcFncD+LB+wHu5+mbyVeuD9AD9Ves//cb2B/4B/SMwA/CD2eeEv47wV8uv0jQAxj9j2px8y/HUXHy71F/bO90gH3b+Pj/i/4rzGqAf5r/6XrD/9/nX+s//L7gv65f7/1s/OO9jz9R3Gs6WFi00By+9x1XrBq0R3eHobuIW+r9PmVUXla59HJJUm4L/ASapv3ssaPg12Ccg9XWHxoQGTfa2Vnwn7VXibvLKI2nZIJfN2dmHLvlOOoq5s79koPhZ5UOFXBHK4WJiZc9uofoe2e/kjPjJGqCUXLxfIxKsTHsRFbomHh+aryli72Nvt8hel+nEfm+Bp3t6FHxYLl6jXCyI7IYg6rH5fZrwixclwgpXPmvkLEI1jIUSRfYrNJH0OmaKVItd9HMlbFKr3dSIlBJ5CI6acaabCgGjGhmIdn1hflRMNm4ZYDh4PqEIE9TQChYCjxLx99NrbbGvXiTT6JTWsU+bMTFsRkzwAstqWMlh4I31jHb0HI6w7zqgHhQ460lxLB7T48ppCR1PlzTxWskrhqffNv5mHbOaHQVouWBeeJSXkNoXzcBPWPoYzAoaEcbaHNL6WxeRrJnpp1jsauziWX56XTNdZeKfK2rhQTajjC1WZ73d3/YE2/X56U0AAD+/w1m/6Bjx+G5P7msr+WuT/7SSWfl5hVALNRL0RcY7r/ook+bQuMLFOg7Bp1v7xKIu6ghkcIi8CzwNrqkNiXA0XOxyuGNeWZCvydGmzm3WVC4WXagbwMeh3vQTa7X6Oj2H753UcR6yfLI4S90UjnGysSLntkEsmO9zwHRbQctDtERzPRtutcApvTixBQ03tO7/x24p5J67v4V3JsnS/TFpIgiBB55lqS5CwE7H1wFisNbPWQx95VGgOnR8FQJ34UuFKxjsVHIesU5N+CMQuchUAuNwxla/oepkFEoPc8HX9EHPhJubEt/+LkXbSWWRvJDyfD9U5B+C+h9P1/q8y8/TGnOiWRPmn82G6XAchhMLyafbQmTmcp+4XtvpaT5yg3Xgc+BYaB06fogiwUOM/x/6v+BEGPkGfHPZFZSG80Cewt+RAbvvx+7yf7hdILbr/KKVxAHa3hRZmy0zIUwGFqyQJe0RmfAcFZkln3VWFjjEpa6yRfpZimRg/U2CbPyg+qOyzqL2BQkMDLAI7bqKNXwfjYhDwWc1CicnCf0bPy/z0QNICHaMiug8mo8yXOnaZZI2y+2Py3GRYNbV5GlgQnlmLsPpi+ZKEuPWcNlfb64PAnkhIxEg2TRWmrFHLcL1vWFXdDetIecFT5c2kSukWXf8md6SIMmNyL20Tg4SQSSM4HqmByXVr45/8Qzt9dhLUxMoenf94So5pFr7Qe/7M/R81gi7STDMNeMuDZUIBs4Lb2kIQyv669bwlUU8Kd1YolDbXEKnbFNZuPxNrVBSMpunRrwVupmG7pcOVDuJ7AsZt0RJDIVOx3UvR53wJsnHOUYUm1K56ikzc1l02KU/EOiDfdcS0MzpjU9Vij36TVm2GEcouM8uHMYsGhACNMLXFrn3OAQFE0TUijfcKhMzwMIa/tvUeWcboPAF1O+HC6aTefkv7iu3eMIqCMtx5JoQxpKtXmeh6Qkql66/UqOnvSUFElNeFC8mnRj6BVe8MK2SIy3bv4sV++fYE72oAVqFwX7pMCwj1heAw8Y6T7bfJYMEZxK42HUa3xwr0HS9MxcOwggay/xHB3OgvlQXhHP28yQ+ou7zwM46rw21TuLKobO6o6MMt9EbELsyEAbMbRRWTtCOIVrLEL00FrX4yucd33373TM49WZVydx48YPwY0qKpKT2u//EuUJb2o24R3COMKMCv8i2/cVqH6B38e2jjP1DmjIDMDnoVmr1+Gqv8HC5D8sPmokliigp1/LqZPrrBo5Zz5YqmCJrbJuZow3TQDSLLc5oNwflfi2yUrg9lrghKUDW1MfrUHvsAzkQPwnBpwEjZ3ISdFvcGb0cfQWCZm0rFeTHw77atw+mfS91jT1abYfRMjkQSDIRb4M1AQZwUB+T6dn45/atCcAPLuSD8JOp8rb+bZw8HroHuea6LwzWi4SN02PjymwpG1ZXZHiIYi2f+H2qCR2oUw0SbRR+YpB05Fbt6cc9/JaYBz7oGaV5eQkMayUOp8V+rnR5BZ7fAJQK/98V7C/R2U7tJBBX9wwymk8u77RAWtiYT1ES+cFCEFSVvNc35OVC4Il6bH7jTXiE8iHizYyDIaiP37xrC4FJzHDEh9tE0c8/mzzPeYyaE9tHdOUwHaz9p7O3LYx5XRnzIY25dhiRvn4SFpL/I+XiUBfmTPP5L86wyXVSdafjO059ZymygA0fGiaUGWlQHqx/irDO6Q/jMR6NDJI9CWa4BcPDcEOIaOW8dWBb6OrwJ7jI7NFWDGk/SsXsJMAasGQzOm8hIy8xZnFzj3X8JMjlFwR+NM2tKChVw/xVeqqbDAKW4shMvJ+URXx9NKxkUkgHWggQq5TsM/PAAVtCu75PypUAscH9E3V7lP8zwBFThX1+ksz99HIfTqj40rpAHhVjNvaTkHoIPEDr0i2S3ckaD5Y2lGzB2Zlc+7SbkCr1aX2dNOknbf6KB6CoNc4cvMsEvJ3av0OAecaw8CSMpYxDAkhWWttg7HJ5/InHM8zIaLfg5EQCISAamlKM8xBzspu3Dqzx8GCo+liols4xLpbYhb62mGyidHu9DwfonWnb2aX8gwBUIWQqyjJ0yLOmSQKYpTMuzMAISraF4z20DrT1ZqZqzzEnmv0RtD3wWFb9V6Sl6i/kSt7E9Lbsxxs3cIhntKsHlCtB8SIQL2x6ttdPgF1CiFmVEeqGHMKSqoMKv3tzVLcMJupGU9YH08xv6Fv6syLdhE8FzlS0lD1NrOS1gaoagQ5xz8cpC5fdGxrYHjmUBKPgp3hzpz6+RlciIGo04EG2iLnHNmCkWhA1xBqqAzJgsaWDDrkWf9bAfZ4mY45UkpgZuumeQBOoIJJEGKMMb0lyLBDbok5b/I535Jbv4fkLJblAXOd9s2jcuEQa1IBN6ndDaJ5/Vkh2qskXI46LEBFtMIZTq7RvwKUmqSBM9LQaPXS+T9Krqm6ydy046hAhKiPAcoj81sWk2SV68LUkTwz2CWX6evXO54uAXAW91DFQ5nn7T9OUbe2BIHCe1b1TX6cKbQ+s13wyejQJo8bpdQxjvIGfVxdc45MZMLqwKNQlzcsViBSOR3Bbf+BDdQjRWc5IgZFs4c0KhQmny4WhCYQmGv7sTQO6LQb/6LgFek7nPzvfxWNSoxC0/h+3hFQTWpQw/6spA9f6x/klJPjdrPjQYZmKftASe+aXFZ6Yt43o618IHSt5uXDTMzzTRdWrrtLg2NvWgunN0qFUYaC5aXiKNWcmZo1pK6wlUT7TJyxl+6p3Lk/l5xUVT9FHR+TYc8FlIyrNrVLfK5FcgvmwFTDMYIZ6++1eZVN8OpwYqhn1muU7TIapsO5gyy+uoKVGe7p+76WehpHclnNoevMfqAuSnZPiBN/pJWOAe00zwWg8eK9OW8KptXntczOCyjUbfO3TjoEhO2yzFM5IKf322dqA4nJtwl4VzAdNMDmqaoIchUrl/UOfZtfqMELpOAUfMF+4vq1rhsNk+uhRnajGWvHvOlJYzmZBYCP/PvPq9hHmSGBgGU50MivverHutPAGALOgLiu2oET9SYNT2IkI8HLVyjfyI12OjYt2o9tkfA1SQyixfnR+Ot/9XP6WmsSvZzS64RQDxEmz8/xTpalJWXG0n3ZmOhYRiCbE86o07NOA3CXpdJRlh4eqgo5QULWuBysVnW6/MZ900Bk/XGEge0UpywSwoZoILemMzszudLgFDo+VeYfXT1Wd+ndRqJeYycoX+sQbswdOJWHtmMbrdnXqwEBEhte2eb38OlwmMCkeDlASgEbQ5nuVqjqFh5kKeo3kwFETGovAiCxF3k+eWi3ZLSxz9tRRiY+sjL80ecuMoGf19+p/L/EZj6XJxDTWKF78V/d1jKZZhjy2+jP3z7hY7DkDW/FMxvscW8U4LiiicuCcRJv4SwA5Fk/oADpnQhoI4Cbjnpy1VZ0V40Sy+5VDkSqputHJPDpuYAlg9hnm/zQthvP+8mWr2uzF7/Qu/66ZHN69357kAST/6UXz3525Dc9LlvH3cZhlWw58cjgG2J4JWidSBOh3Lz1mK6rcatpYzGFl/eL47lZ7an/o+DOmC2IJ+K6ZZwtRhH3Fu4K1lCGfQ4PfWUijso+EosjhtlYr5Qws8KzL3PqovyI4t47dlatDq1wfeGL//gYTUd5qOE+gK/m6V5Qn51eEya5oVyJXRYiwQM4DLHcV4QXEdHGGfb02HTVzEKIs17Va/518/HiDS2VPTK9wa99ybk02eGLyFdASMXW5bMLtmC2m26e7mRr1Enxq+9kMkWemrWZFNOZshDCgniKQoQv6OhfADTplvftuRdSI7pV2CLaoAHsxAVVv+bM4hWinwUZTMMFnMrjeVjDZ93aXahvKoP5BRCOh+RguznjrcvXzbq1BDMh3pLeABqbilETMa29ef3dTYZq6DwiUfCIblCewtaQFUtfafBGoKKMAEgSQ8NCca0K6kHSCZZkdWw2G2mzQTVJUL1wUK/+BPrq5X8GI94+X7/EVeuAn3qGDo44czf/k5xn7IKlbL4M9FFqA6cb2vCzn9mfzCKZejOoWMjubsKSTH/RmzryrX+pxaRPRR0ffrsSr3ZMTdT3arog7qMdXEh2yrUEB9zVWsYXrnckVpbNqvUZxzl2g94UvTYVPzwGcst3meonUfqjlmjp9mCSQETKY48/WkKwYqlnpyuwPCkg9cH7/rRIb9x+J6fPW4GSQvOI4WDXmrQiYuljk/hf4XnbZEK25cOPkK/LMNTbdnTpNCdk8Hx2OGv49PKbqbQkPCbbH0ewtLF5dLEdnGoRAnwCH4kicJzRA0a9S/f10tp52fkQsPyCQ+x444ZMIsH6IAujwgEwVba4dK4P+FuY+2GBhX8LZm3BqJz4FyRDZ+jJ/Bc+lIiHK12Ea7qX/1Na2zDSPvIRD6fBrYy2mQQcZ+Js022isycxuMK27NmWUbgMH01X8Vq+H9ejLxE1jNdUJsHbw3WMh49C6DsMQC7DTzT1uvw+7BpNilkxGQtSNTLiRP2HUEb+p32aW8qq++kiBb/0NwA2S3l5f/4YsAAAAAA=";

/* ---------- tokens ---------- */
const C = {
  bg: "#080B11", bg2: "#0C1119", panel: "#10161F", panel2: "#0E141C",
  line: "#1C2531", line2: "#283344", ink: "#EAF0F8", mut: "#92A1B5", dim: "#74859A",
  gold: "#C8AE85", goldDim: "#7E6F45", win: "#34D38A", loss: "#F2585F", push: "#7E8AA0",
  mlc: "#5AB0E7", atsc: "#C8AE85", ouc: "#9D7BE7", propc: "#34D38A",
};
const mono = "'JetBrains Mono', ui-monospace, monospace";
const disp = "'Archivo', system-ui, sans-serif";

/* ---------- odds helpers ---------- */
const dec = (a) => (a > 0 ? 1 + a / 100 : 1 + 100 / -a);
const netUnits = (odds, stake, res) =>
  res === "W" ? (odds < 0 ? (-100 / odds) * stake : (odds / 100) * stake) : res === "P" ? 0 : -stake;
const clvPct = (odds, close) => (close == null ? null : dec(odds) / dec(close) - 1);
const fmtOdds = (o) => (o > 0 ? `+${o}` : `${o}`);
const fmtU = (u) => `${u > 0 ? "+" : u < 0 ? "−" : ""}${Math.abs(u).toFixed(2)}u`;
const fmtPct = (p, signed) => `${signed && p > 0 ? "+" : signed && p < 0 ? "−" : ""}${Math.abs(p * 100).toFixed(1)}%`;
const winPct = (w, l) => (w + l === 0 ? 0 : w / (w + l));
const pctOrDash = (w, l, suffix = "") => (w + l === 0 ? "—" : `${fmtPct(winPct(w, l))}${suffix}`);
const agoLabel = (ms) => {
  if (ms == null) return "";
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
};
// per-week W/L(/P) buckets for a given result key ("su" or "ats")
const weeklyBuckets = (games, key) => {
  const m = {};
  games.forEach((g) => {
    const r = g[key];
    if (!m[g.week]) m[g.week] = { week: g.week, W: 0, L: 0, P: 0 };
    if (r === "W" || r === "L" || r === "P") m[g.week][r]++;
  });
  return Object.values(m).sort((a, b) => a.week - b.week);
};

/* ---------- preview data (real W1–W3 matchups) ---------- */
const WEEK_RANGE = { 1: "Jun 4–6", 2: "Jun 11–13", 3: "Jun 19–20" };
const GAMES_SAMPLE = [
  // wk, away, home, suPick, su, line(home), atsPick, ats
  [1, "MTL", "HAM", "HAM", "W", -3.5, "HAM", "W"],
  [1, "WPG", "CGY", "WPG", "W", -1.5, "WPG", "W"],
  [1, "EDM", "OTT", "OTT", "L", -2.5, "OTT", "L"],
  [2, "HAM", "WPG", "WPG", "W", -4, "HAM", "W"],
  [2, "TOR", "MTL", "TOR", "W", 1.5, "TOR", "W"],
  [2, "BC", "SSK", "BC", "L", 2.5, "SSK", "P"],
  [3, "BC", "HAM", "HAM", "W", -2.5, "HAM", "L"],
  [3, "TOR", "OTT", "TOR", "L", -3, "OTT", "W"],
  [3, "MTL", "EDM", "EDM", "W", -6, "EDM", "W"],
  [3, "SSK", "CGY", "CGY", "W", -4.5, "SSK", "L"],
].map(([week, away, home, suPick, su, line, atsPick, ats]) => ({ week, away, home, suPick, su, line, atsPick, ats }));

const WAGERS_SAMPLE = [
  [1, "Jun 4", "ML", "Hamilton ML", -135, -150, 1.35, "W"],
  [1, "Jun 5", "ATS", "Winnipeg +1.5", 105, -110, 1.0, "W"],
  [1, "Jun 6", "O/U", "EDM / OTT Over 48.5", -110, -108, 1.1, "L"],
  [1, "Jun 6", "Prop", "B. Mitchell Over 249.5 pass yds", 120, 135, 0.6, "L"],
  [2, "Jun 11", "ATS", "Hamilton +4", -110, -120, 1.1, "W"],
  [2, "Jun 12", "ML", "Toronto ML", 130, 118, 0.8, "W"],
  [2, "Jun 13", "O/U", "BC / SSK Under 47", -105, -110, 1.05, "L"],
  [2, "Jun 13", "Prop", "K. Brown anytime TD", 150, 160, 0.5, "W"],
  [3, "Jun 19", "ATS", "Edmonton −6", -110, -118, 1.1, "W"],
  [3, "Jun 20", "ML", "Calgary ML", -160, -175, 1.6, "W"],
  [3, "Jun 20", "O/U", "MTL / EDM Over 51", -110, -104, 1.1, "L"],
  [3, "Jun 20", "Prop", "N. Rourke Over 22.5 comp", -115, -110, 1.15, "L"],
].map(([week, date, type, play, odds, close, stake, result]) => ({ week, date, type, play, odds, close, stake, result }));

/* ---------- live loader (activates on deploy when CONFIG.spreadsheetId is set) ---------- */
async function loadLive() {
  const num = (s) => { const n = parseFloat(String(s ?? "").replace(/[^0-9.\-]/g, "")); return isNaN(n) ? null : n; };
  const url = (tab) =>
    `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  const grab = (tab) =>
    new Promise((res, rej) =>
      Papa.parse(url(tab), { download: true, header: true, skipEmptyLines: true, complete: (r) => res(r.data), error: rej })
    );
  const [betsRaw, gamesRaw] = await Promise.all([grab(CONFIG.betsTab), grab(CONFIG.gamesTab)]);
  const games = gamesRaw
    .filter((r) => r.Away && r.Home)
    .map((r) => ({
      week: parseInt(r.Week, 10) || 0, away: r.Away, home: r.Home,
      suPick: r["SU Pick"] || "", su: (r["SU"] || "").trim(),
      line: num(r["Home Line"]),
      atsPick: r["ATS Pick"] || "", ats: (r["ATS"] || "").trim(),
    }));
  const wagers = betsRaw
    .filter((r) => r.Odds && r["Stake (u)"])
    .map((r) => ({
      week: parseInt(r.Week, 10) || 0, date: r.Date, type: r.Type, play: r.Play,
      odds: num(r.Odds), close: num(r.Close),
      stake: num(r["Stake (u)"]), result: (r.Result || "").trim(),
    }));
  return { games, wagers };
}

/* ---------- tiny ui atoms ---------- */
const Eyebrow = ({ children, color = C.mut }) => (
  <div style={{ font: `700 11px ${disp}`, letterSpacing: "0.16em", textTransform: "uppercase", color }}>{children}</div>
);
const Avatar = ({ size = 40 }) => (
  <img src={AVATAR} alt="Muttcliffe" width={size} height={size}
    style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
      border: `1px solid ${C.line2}`, boxShadow: `0 0 0 2px rgba(200,174,133,.28)` }} />
);
const Pill = ({ r }) => {
  const m = { W: [C.win, "rgba(52,211,138,.12)"], L: [C.loss, "rgba(242,88,95,.12)"], P: [C.push, "rgba(126,138,160,.14)"] };
  const [fg, bg] = m[r] || [C.dim, "transparent"];
  return (
    <span style={{ font: `700 11px ${mono}`, color: fg, background: bg, border: `1px solid ${fg}33`, borderRadius: 5, padding: "2px 7px", minWidth: 22, textAlign: "center", display: "inline-block" }}>
      {r || "—"}
    </span>
  );
};
const TypeBadge = ({ t }) => {
  const c = { ML: C.mlc, ATS: C.atsc, "O/U": C.ouc, Prop: C.propc }[t] || C.mut;
  return (
    <span style={{ font: `700 10px ${disp}`, letterSpacing: ".06em", color: c, background: `${c}1A`, border: `1px solid ${c}33`, borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap" }}>
      {t}
    </span>
  );
};

/* ===================================================================== */
export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | recap
  const [tab, setTab] = useState("wagers"); // wagers | pickem | spread
  const [data, setData] = useState({ games: GAMES_SAMPLE, wagers: WAGERS_SAMPLE });
  const [live, setLive] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const weeks = useMemo(() => [...new Set(data.games.map((g) => g.week))].sort((a, b) => a - b), [data]);
  const [week, setWeek] = useState(3);

  const pull = () => {
    if (!CONFIG.spreadsheetId) return Promise.resolve();
    setRefreshing(true);
    return loadLive()
      .then((d) => { if (d.games.length || d.wagers.length) { setData(d); setLive(true); setLastSync(Date.now()); } })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { pull(); }, []);
  // auto-refresh every 2 min, and tick the "synced … ago" label every 20s
  useEffect(() => {
    if (!CONFIG.spreadsheetId) return;
    const poll = setInterval(pull, 120000);
    const tick = setInterval(() => setNow(Date.now()), 20000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, []);
  useEffect(() => { if (weeks.length && !weeks.includes(week)) setWeek(weeks[weeks.length - 1]); }, [weeks]);

  const weeklySU = useMemo(() => weeklyBuckets(data.games, "su"), [data]);
  const weeklyATS = useMemo(() => weeklyBuckets(data.games, "ats"), [data]);

  /* aggregates */
  const A = useMemo(() => {
    const w = data.wagers.filter((x) => ["W", "L", "P"].includes(x.result));
    const wRec = { W: 0, L: 0, P: 0 }; let net = 0, staked = 0, clvSum = 0, clvN = 0;
    const curve = [{ i: 0, u: 0 }];
    w.forEach((x, i) => {
      wRec[x.result]++; const n = netUnits(x.odds, x.stake, x.result); net += n; staked += x.stake;
      const cv = clvPct(x.odds, x.close); if (cv != null) { clvSum += cv; clvN++; }
      curve.push({ i: i + 1, u: +net.toFixed(2) });
    });
    const su = { W: 0, L: 0 }, ats = { W: 0, L: 0, P: 0 };
    data.games.forEach((g) => { if (g.su === "W") su.W++; if (g.su === "L") su.L++; if (g.ats) ats[g.ats]++; });
    return {
      wRec, net, roi: staked ? net / staked : 0, clv: clvN ? clvSum / clvN : 0, curve,
      su, ats, suPct: winPct(su.W, su.L), atsPct: winPct(ats.W, ats.L),
    };
  }, [data]);

  const weekData = useMemo(() => {
    const g = data.games.filter((x) => x.week === week);
    const su = { W: 0, L: 0 }, ats = { W: 0, L: 0, P: 0 };
    g.forEach((x) => { if (x.su === "W") su.W++; if (x.su === "L") su.L++; if (x.ats) ats[x.ats]++; });
    const wg = data.wagers.filter((x) => x.week === week && ["W", "L", "P"].includes(x.result));
    let net = 0, st = 0; const rec = { W: 0, L: 0, P: 0 };
    wg.forEach((x) => { net += netUnits(x.odds, x.stake, x.result); st += x.stake; rec[x.result]++; });
    return { games: g, su, ats, net, roi: st ? net / st : 0, wRec: rec };
  }, [data, week]);

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.ink, fontFamily: disp, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fu .6s cubic-bezier(.2,.7,.2,1) both}
        .recharts-surface{overflow:visible}
        *{box-sizing:border-box}
        .wcard{transition:background .15s}
        .wcard:hover{background:rgba(255,255,255,.022)}
        .tbtn{transition:background .15s,color .15s,filter .15s}
        .tbtn:hover{filter:brightness(1.08)}
        tbody tr{transition:background .15s}
        tbody tr:hover{background:rgba(255,255,255,.018)}
        @media (prefers-reduced-motion: reduce){
          .fu{animation:none}
          *[style*="pulse"]{animation:none !important}
        }
        ::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:${C.line2};border-radius:4px}

        /* season stat strip — one clean row on desktop, graceful on small screens */
        .statgrid{display:grid;gap:10px;grid-template-columns:repeat(6,1fr);margin-top:22px}
        @media (max-width:760px){.statgrid{grid-template-columns:repeat(3,1fr)}}
        @media (max-width:440px){.statgrid{grid-template-columns:repeat(2,1fr)}}

        /* wager log — flex card rows that reflow instead of truncating */
        .wcard{display:flex;align-items:center;gap:14px;padding:13px 16px;border-bottom:1px solid ${C.line};flex-wrap:wrap}
        .wsel{display:flex;align-items:center;gap:11px;flex:1 1 240px;min-width:0}
        .wmeta{display:flex;align-items:center;gap:18px;margin-left:auto}
        @media (max-width:560px){
          .wsel{flex:1 1 100%}
          .wmeta{margin-left:0;width:100%;justify-content:space-between;gap:12px}
        }
      `}</style>

      {/* atmosphere */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(900px 380px at 78% -8%, rgba(200,174,133,.12), transparent 60%), radial-gradient(700px 300px at 0% 0%, rgba(90,176,231,.06), transparent 55%)` }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.025,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      <div style={{ position: "relative", maxWidth: 980, margin: "0 auto", padding: "26px 18px 64px" }}>
        {/* header */}
        <div className="fu" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar size={44} />
            <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: live ? C.win : C.gold, boxShadow: `0 0 12px ${live ? C.win : C.gold}`, animation: "pulse 2s infinite", display: "inline-block" }} />
              <Eyebrow color={C.gold}>{live ? "Live · tracked from sheet" : "Preview data"}</Eyebrow>
              {live && lastSync && (
                <button onClick={pull} disabled={refreshing} title="Refresh now"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: refreshing ? "default" : "pointer", color: C.dim, font: `600 11px ${mono}`, padding: 0 }}>
                  <RefreshCw size={11} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                  synced {(now, agoLabel(lastSync))}
                </button>
              )}
            </div>
            <h1 style={{ margin: "6px 0 0", font: `900 34px/0.96 ${disp}`, letterSpacing: "-0.02em" }}>
              MUTTCLIFFE <span style={{ color: C.gold }}>CFL</span>
            </h1>
            <div style={{ font: `500 13px ${disp}`, color: C.mut, marginTop: 3 }}>2026 season · wagers, pick&apos;em &amp; spread — all results in units</div>
            </div>
          </div>
          {/* view toggle */}
          <div style={{ display: "flex", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 11, padding: 4, gap: 4 }}>
            {[["dashboard", "Live board"], ["recap", "Weekly recap"]].map(([k, lbl]) => (
              <button key={k} className="tbtn" onClick={() => setView(k)} style={{
                font: `700 12px ${disp}`, letterSpacing: ".04em", textTransform: "uppercase", cursor: "pointer",
                color: view === k ? C.bg : C.mut, background: view === k ? C.gold : "transparent",
                border: "none", borderRadius: 8, padding: "0 16px", minHeight: 40,
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* season stat strip */}
        <div className="fu statgrid" style={{ animationDelay: ".05s" }}>
          <Stat icon={<TrendingUp size={15} />} label="Units net" value={fmtU(A.net)} tone={A.net >= 0 ? C.win : C.loss} big />
          <Stat icon={<Activity size={15} />} label="ROI" value={fmtPct(A.roi, true)} tone={A.roi >= 0 ? C.win : C.loss} />
          <Stat icon={<Crosshair size={15} />} label="CLV avg" value={fmtPct(A.clv, true)} tone={A.clv >= 0 ? C.gold : C.loss} hint="beat the close" />
          <Stat icon={<Target size={15} />} label="Wagers" value={`${A.wRec.W}-${A.wRec.L}${A.wRec.P ? "-" + A.wRec.P : ""}`} />
          <Stat icon={<Trophy size={15} />} label="Pick'em" value={`${A.su.W}-${A.su.L}`} sub={pctOrDash(A.su.W, A.su.L, " win rate")} />
          <Stat icon={<Crosshair size={15} />} label="Spread ATS" value={`${A.ats.W}-${A.ats.L}${A.ats.P ? "-" + A.ats.P : ""}`} sub={pctOrDash(A.ats.W, A.ats.L, " ATS")} />
        </div>

        {view === "dashboard" ? (
          <Dashboard {...{ tab, setTab, data, A, week, setWeek, weeks, weekData, weeklySU, weeklyATS }} />
        ) : (
          <Recap {...{ week, setWeek, weeks, weekData }} />
        )}

        {/* footer */}
        <div style={{ marginTop: 30, paddingTop: 16, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, color: C.dim, font: `500 12px ${disp}` }}>
          <span>{HANDLE} · units only, never $ · full log shown — nothing cherry-picked</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.mut }}><ExternalLink size={12} /> {LIVE_URL}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- season stat card ---------- */
function Stat({ icon, label, value, sub, hint, tone = C.ink, big }) {
  return (
    <div style={{ background: `linear-gradient(180deg, ${C.panel}, ${C.panel2})`, border: `1px solid ${C.line}`, borderRadius: 13, padding: "13px 14px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.mut }}>
        <span style={{ color: C.dim }}>{icon}</span><Eyebrow>{label}</Eyebrow>
      </div>
      <div style={{ font: `800 ${big ? 30 : 26}px ${mono}`, color: tone, marginTop: 8, letterSpacing: "-0.01em", lineHeight: 1 }}>{value}</div>
      {(sub || hint) && <div style={{ font: `500 11px ${disp}`, color: C.dim, marginTop: 5 }}>{sub || hint}</div>}
    </div>
  );
}

/* ---------- week stepper ---------- */
function WeekNav({ week, setWeek, weeks }) {
  const i = weeks.indexOf(week);
  const go = (d) => { const n = i + d; if (n >= 0 && n < weeks.length) setWeek(weeks[n]); };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 2, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: 3 }}>
      <Step dir={-1} onClick={() => go(-1)} dis={i <= 0}><ChevronLeft size={16} /></Step>
      <div style={{ font: `800 13px ${disp}`, letterSpacing: ".08em", padding: "0 12px", minWidth: 90, textAlign: "center" }}>
        WEEK {week} <span style={{ color: C.dim, fontWeight: 500 }}>· {WEEK_RANGE[week] || ""}</span>
      </div>
      <Step dir={1} onClick={() => go(1)} dis={i >= weeks.length - 1}><ChevronRight size={16} /></Step>
    </div>
  );
}
const Step = ({ children, onClick, dis }) => (
  <button onClick={onClick} disabled={dis} style={{ cursor: dis ? "default" : "pointer", opacity: dis ? 0.3 : 1, background: "transparent", border: "none", color: C.ink, padding: "6px 8px", display: "grid", placeItems: "center" }}>{children}</button>
);

/* ---------- dashboard ---------- */
function Dashboard({ tab, setTab, data, A, week, setWeek, weeks, weekData, weeklySU, weeklyATS }) {
  const tabs = [["wagers", "Wagers"], ["pickem", "Pick'em"], ["spread", "Spread"]];
  return (
    <div className="fu" style={{ animationDelay: ".1s", marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map(([k, lbl]) => (
            <button key={k} className="tbtn" onClick={() => setTab(k)} style={{
              font: `700 13px ${disp}`, letterSpacing: ".03em", cursor: "pointer", padding: "0 16px", minHeight: 44, borderRadius: 9,
              color: tab === k ? C.ink : C.mut, background: tab === k ? C.panel : "transparent",
              border: `1px solid ${tab === k ? C.line2 : "transparent"}`,
            }}>{lbl}</button>
          ))}
        </div>
        {tab !== "wagers" && <WeekNav {...{ week, setWeek, weeks }} />}
      </div>

      {tab === "wagers" && <Wagers data={data} A={A} />}
      {tab === "pickem" && <PickEm weekData={weekData} weekly={weeklySU} />}
      {tab === "spread" && <Spread weekData={weekData} weekly={weeklyATS} />}
    </div>
  );
}

function Panel({ children, pad = 0 }) {
  return <div style={{ background: `linear-gradient(180deg, ${C.panel}, ${C.panel2})`, border: `1px solid ${C.line}`, borderRadius: 15, padding: pad, overflow: "hidden" }}>{children}</div>;
}

function Sparkline({ data, color = C.gold, height = 132 }) {
  const W = 600, H = height;
  const vals = data.map((d) => d.u);
  const min = Math.min(0, ...vals), max = Math.max(0, ...vals);
  const range = max - min || 1;
  const n = data.length;
  const X = (i) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const Y = (u) => H - 6 - ((u - min) / range) * (H - 12);
  const zeroY = Y(0);
  const pts = data.map((d, i) => [X(i), Y(d.u)]);
  const line = n <= 1
    ? `M0,${zeroY.toFixed(1)} L${W},${zeroY.toFixed(1)}`
    : pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = n <= 1 ? null : `${line} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke={C.line2} strokeWidth="1" strokeDasharray="4 4" />
      {area && <path d={area} fill="url(#spark)" />}
      <path d={line} fill="none" stroke={color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function WagerRow({ x, first }) {
  const graded = ["W", "L", "P"].includes(x.result);
  const n = graded ? netUnits(x.odds, x.stake, x.result) : null;
  const cv = clvPct(x.odds, x.close);
  return (
    <div className="wcard" style={{ ...(first ? { borderTop: `1px solid ${C.line}` } : {}), opacity: graded ? 1 : 0.82 }}>
      <div className="wsel">
        <TypeBadge t={x.type} />
        <div style={{ minWidth: 0 }}>
          <div style={{ font: `600 13px ${disp}`, color: C.ink }}>{x.play}</div>
          <div style={{ font: `500 11px ${disp}`, color: C.dim, marginTop: 2 }}>Wk {x.week} · {x.date}</div>
        </div>
      </div>
      <div className="wmeta">
        <Metric label="Odds" val={fmtOdds(x.odds)} color={C.mut} />
        <Metric label="Stake" val={`${(x.stake || 0).toFixed(2)}u`} color={C.mut} />
        <Metric label="Net" val={graded ? fmtU(n) : "—"} color={!graded ? C.dim : n > 0 ? C.win : n < 0 ? C.loss : C.push} bold />
        <Metric label="CLV" val={cv == null ? "—" : fmtPct(cv, true)} color={cv == null ? C.dim : cv >= 0 ? C.gold : C.loss} />
        <Pill r={graded ? x.result : "•"} />
      </div>
    </div>
  );
}

function Wagers({ data, A }) {
  const graded = data.wagers.filter((x) => ["W", "L", "P"].includes(x.result));
  const pending = data.wagers.filter((x) => x.odds != null && !["W", "L", "P"].includes(x.result));
  return (
    <Panel>
      <div style={{ padding: "16px 18px 6px" }}>
        <Eyebrow>Bankroll · running units</Eyebrow>
        <div style={{ height: 132, margin: "12px 0 4px" }}>
          <Sparkline data={A.curve} />
        </div>
      </div>
      {pending.length > 0 && (
        <>
          <SectionLabel>Open · posted before results</SectionLabel>
          {pending.map((x, i) => <WagerRow key={`p${i}`} x={x} first={i === 0} />)}
        </>
      )}
      {graded.length > 0 && <SectionLabel>Settled</SectionLabel>}
      {graded.length === 0 && pending.length === 0 && (
        <div style={{ padding: "26px 16px", textAlign: "center", borderTop: `1px solid ${C.line}`, color: C.dim, font: `500 13px ${disp}` }}>
          No wagers logged yet — they'll appear here as you post them.
        </div>
      )}
      {graded.map((x, i) => <WagerRow key={`g${i}`} x={x} first={i === 0} />)}
    </Panel>
  );
}

const SectionLabel = ({ children }) => (
  <div style={{ padding: "11px 16px 9px", borderTop: `1px solid ${C.line}`, background: "rgba(255,255,255,.012)" }}>
    <Eyebrow color={C.dim}>{children}</Eyebrow>
  </div>
);

const Metric = ({ label, val, color, bold }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 42 }}>
    <span style={{ font: `700 9px ${disp}`, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim }}>{label}</span>
    <span style={{ font: `${bold ? 700 : 500} 13px ${mono}`, color }}>{val}</span>
  </div>
);

function GameRow({ g, mode }) {
  const pick = mode === "su" ? g.suPick : g.atsPick;
  const res = mode === "su" ? g.su : g.ats;
  const lineTxt = g.line == null ? "" : `${g.atsPick} ${signLine(g, pick)}`;
  return (
    <tr style={{ borderBottom: `1px solid ${C.line}` }}>
      <td style={{ padding: "12px 14px", font: `600 13px ${disp}` }}>
        <span style={{ color: C.mut }}>{g.away}</span> <span style={{ color: C.dim }}>@</span> <span>{g.home}</span>
      </td>
      <td style={{ padding: "12px 14px", textAlign: "center", font: `700 13px ${mono}`, color: C.gold }}>
        {mode === "spread" ? lineTxt || "—" : pick || "—"}
      </td>
      <td style={{ padding: "12px 14px", textAlign: "right" }}><Pill r={res} /></td>
    </tr>
  );
}
/* market line shown from the picked side's perspective */
function signLine(g, pick) {
  if (g.line == null) return "";
  const homeLine = g.line; const v = pick === g.home ? homeLine : -homeLine;
  return v > 0 ? `+${v}` : `${v}`;
}

function GameTable({ games, mode, head }) {
  return (
    <Panel>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.line}` }}>
            {["Matchup", head, "Result"].map((h, i) => (
              <th key={i} style={{ font: `700 10px ${disp}`, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right", padding: "11px 14px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{games.map((g, i) => <GameRow key={i} g={g} mode={mode} />)}</tbody>
      </table>
    </Panel>
  );
}

function PickEm({ weekData, weekly }) {
  return (
    <div>
      <WeeklyChart title="Pick'em by week · winners" weekly={weekly} accent={C.win} />
      <RecordBar label="Pick'em this week" rec={`${weekData.su.W}-${weekData.su.L}`} W={weekData.su.W} L={weekData.su.L} />
      <GameTable games={weekData.games} mode="su" head="Pick (winner)" />
    </div>
  );
}
function Spread({ weekData, weekly }) {
  return (
    <div>
      <WeeklyChart title="Spread by week · ATS" weekly={weekly} accent={C.gold} />
      <RecordBar label="Spread this week" rec={`${weekData.ats.W}-${weekData.ats.L}${weekData.ats.P ? "-" + weekData.ats.P : ""}`} W={weekData.ats.W} L={weekData.ats.L} P={weekData.ats.P} />
      <GameTable games={weekData.games} mode="spread" head="Pick (vs spread)" />
    </div>
  );
}

/* ---------- weekly W/L bars (wins up, losses down, bucketed by week) ---------- */
function WeeklyChart({ title, weekly, accent }) {
  const tot = weekly.reduce((a, d) => ({ W: a.W + d.W, L: a.L + d.L, P: a.P + d.P }), { W: 0, L: 0, P: 0 });
  const max = Math.max(1, ...weekly.flatMap((d) => [d.W, d.L]));
  const colH = 50;
  return (
    <Panel>
      <div style={{ padding: "14px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <Eyebrow>{title}</Eyebrow>
        <span style={{ font: `700 12px ${mono}`, color: C.mut }}>
          season {tot.W}-{tot.L}{tot.P ? `-${tot.P}` : ""} · <span style={{ color: C.dim }}>{pctOrDash(tot.W, tot.L)}</span>
        </span>
      </div>
      {weekly.length === 0 ? (
        <div style={{ padding: "20px 16px 24px", color: C.dim, font: `500 13px ${disp}`, textAlign: "center" }}>
          Results appear here once games are graded.
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "stretch", gap: 4, padding: "8px 12px 14px", overflowX: "auto" }}>
          {weekly.map((d) => (
            <div key={d.week} title={`Week ${d.week}: ${d.W}-${d.L}${d.P ? "-" + d.P : ""}`}
              style={{ flex: "1 0 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 30 }}>
              <span style={{ font: `700 10px ${mono}`, color: C.win, opacity: d.W ? 1 : 0.25 }}>{d.W}</span>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: colH, width: "100%", alignItems: "center" }}>
                {d.W > 0 && <div style={{ width: "62%", maxWidth: 22, height: `${(d.W / max) * colH}px`, background: C.win, borderRadius: "4px 4px 0 0" }} />}
              </div>
              <div style={{ height: 1, width: "100%", background: C.line2 }} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", height: colH, width: "100%", alignItems: "center" }}>
                {d.L > 0 && <div style={{ width: "62%", maxWidth: 22, height: `${(d.L / max) * colH}px`, background: C.loss, borderRadius: "0 0 4px 4px" }} />}
              </div>
              <span style={{ font: `700 10px ${mono}`, color: C.loss, opacity: d.L ? 1 : 0.25 }}>{d.L}</span>
              <span style={{ font: `700 10px ${disp}`, color: C.dim, marginTop: 2 }}>W{d.week}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function RecordBar({ label, rec, W, L, P = 0 }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "14px 2px 12px", flexWrap: "wrap" }}>
      <Eyebrow>{label}</Eyebrow>
      <span style={{ font: `800 18px ${mono}`, color: C.ink }}>{rec}</span>
      <span style={{ font: `600 12px ${disp}`, color: C.mut }}>{pctOrDash(W, L, " win rate")}</span>
    </div>
  );
}

/* ---------- weekly recap card (screenshot this) ---------- */
function Recap({ week, setWeek, weeks, weekData }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const saveImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: C.bg, cacheBust: true });
      const a = document.createElement("a");
      a.download = `muttcliffe-cfl-week-${week}.png`;
      a.href = url;
      a.click();
    } catch (e) { /* no-op */ }
    setSaving(false);
  };
  return (
    <div className="fu" style={{ animationDelay: ".08s", marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <WeekNav {...{ week, setWeek, weeks }} />
        <button onClick={saveImage} disabled={saving} className="tbtn"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: saving ? "default" : "pointer", minHeight: 44, padding: "0 16px", borderRadius: 10, background: C.gold, color: C.bg, border: "none", font: `700 12px ${disp}`, letterSpacing: ".03em", textTransform: "uppercase" }}>
          <Download size={14} /> {saving ? "Saving…" : "Save as image"}
        </button>
      </div>

      <div ref={cardRef} style={{ width: 440, maxWidth: "100%", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line2}`,
        background: `radial-gradient(520px 220px at 80% -10%, rgba(200,174,133,.18), transparent 60%), linear-gradient(180deg, ${C.bg2}, ${C.bg})`,
        boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        {/* card header */}
        <div style={{ padding: "20px 22px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size={36} />
            <div>
            <Eyebrow color={C.gold}>Week {week} recap · {WEEK_RANGE[week] || ""}</Eyebrow>
            <div style={{ font: `900 26px ${disp}`, letterSpacing: "-0.02em", marginTop: 4 }}>MUTTCLIFFE <span style={{ color: C.gold }}>CFL</span></div>
            </div>
          </div>
          <div style={{ textAlign: "right", font: `700 11px ${mono}`, color: C.dim }}>2026</div>
        </div>

        {/* big result rows */}
        <div style={{ padding: "10px 22px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
          <RecapRow accent={weekData.net >= 0 ? C.win : C.loss} label="Wagers (units)"
            big={fmtU(weekData.net)} sub={`${weekData.wRec.W}-${weekData.wRec.L}${weekData.wRec.P ? "-" + weekData.wRec.P : ""} · ROI ${fmtPct(weekData.roi, true)}`} />
          <RecapRow accent={C.ink} label="Pick'em" big={`${weekData.su.W}-${weekData.su.L}`} sub={pctOrDash(weekData.su.W, weekData.su.L, " winners")} />
          <RecapRow accent={C.gold} label="Spread" big={`${weekData.ats.W}-${weekData.ats.L}${weekData.ats.P ? "-" + weekData.ats.P : ""}`} sub={pctOrDash(weekData.ats.W, weekData.ats.L, " ATS")} />
        </div>

        {/* footer */}
        <div style={{ marginTop: 14, padding: "13px 22px", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,.015)" }}>
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
