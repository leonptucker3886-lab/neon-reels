/* NEON REELS — a free neon slot machine (play money only) */
(() => {
'use strict';

const $ = (s) => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';

/* ---------------------------------------------------------------- symbols */
const SYMB = [
  { id:'seven',   name:'Lucky 7',  color:'#ff3dc8', weight:3, pays:{3:0.5,  4:2.5,  5:10  } },
  { id:'diamond', name:'Diamond',  color:'#22f0ff', weight:4, pays:{3:0.4,  4:2,    5:7.5 } },
  { id:'crown',   name:'Crown',    color:'#ffd84d', weight:4, pays:{3:0.3,  4:1.5,  5:6   } },
  { id:'bell',    name:'Bell',     color:'#ff4d6d', weight:5, pays:{3:0.25, 4:1.25, 5:5   } },
  { id:'bar',     name:'BAR',      color:'#8b5cff', weight:5, pays:{3:0.2,  4:1,    5:4   } },
  { id:'star',    name:'Star',     color:'#b8ff3b', weight:6, pays:{3:0.15, 4:0.75, 5:3   } },
  { id:'cherry',  name:'Cherries', color:'#ff6fd7', weight:6, pays:{3:0.1,  4:0.5,  5:2   } },
  { id:'wild',    name:'Wild Bolt',color:'#39ff88', weight:3, pays:{3:1,    4:7.5,  5:45  } },
  { id:'scatter', name:'Moon',     color:'#f2f0ff', weight:1, pays:{} } /* pays anywhere */
];
const BY_ID = Object.fromEntries(SYMB.map(s => [s.id, s]));
const FONT = 'system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';

const ART = {
  seven: `<text x="32" y="48" text-anchor="middle" font-size="48" font-weight="900" font-family="${FONT}" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round">7</text>`,
  diamond: `<path d="M32 5 57 32 32 59 7 32Z"/><path d="M19 27 32 13l13 14"/><path d="M7 32h50"/><path d="M19 27 32 59 45 27"/>`,
  crown: `<path d="M7 50 11 15 24 29 32 10 40 29 53 15 57 50Z"/><path d="M7 50h50"/><circle cx="32" cy="6" r="2.6" fill="currentColor" stroke="none"/><circle cx="11" cy="12" r="2.2" fill="currentColor" stroke="none"/><circle cx="53" cy="12" r="2.2" fill="currentColor" stroke="none"/>`,
  bell: `<path d="M32 10c-9.5 0-16 7.5-16 17v11l-5 7h42l-5-7V27c0-9.5-6.5-17-16-17Z"/><path d="M25 51a7 7 0 0 0 14 0"/><path d="M32 5v5"/>`,
  bar: `<rect x="7" y="19" width="50" height="26" rx="7"/><rect x="12" y="24" width="40" height="16" rx="4" opacity=".5"/><text x="32" y="38" text-anchor="middle" font-size="15" font-weight="900" letter-spacing="1" font-family="${FONT}" fill="currentColor" stroke="none">BAR</text>`,
  star: `<path d="M32 5 39.4 24.1 60 25.4 44 38.6 48.9 58.6 32 47.3 15.1 58.6 20 38.6 4 25.4 24.6 24.1Z"/>`,
  cherry: `<circle cx="21" cy="43" r="11"/><circle cx="44" cy="46" r="9"/><path d="M21 32C25 19 33 12 44 9"/><path d="M44 37c-1-11-1-19 0-28"/><path d="M44 9c5 2 8 6 9 11-6 0-9-4-9-11Z"/>`,
  wild: `<path d="M37 4 14 36h12l-3 24 24-32H35Z"/><path d="M8 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor" stroke="none" opacity=".8"/>`,
  scatter: `<path d="M42 6A28 28 0 1 0 42 58A40 40 0 0 1 42 6Z"/><path d="M55 17l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="currentColor" stroke="none"/><path d="M50 41l1.1 3 3 1.1-3 1.1-1.1 3-1.1-3-3-1.1 3-1.1z" fill="currentColor" stroke="none"/>`
};

function svgFor(id, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ART[id]}</svg>`;
}

/* ------------------------------------------------------------------ config */
const COLS = 5, ROWS = 3, GAP = 6, FILLER = 14;
const BETS = [50, 100, 200, 500, 1000, 2500];
const SCAT = { 3: 1.5, 4: 6, 5: 25 };             // × total bet, anywhere
const FS_AWARD = { 3: 10, 4: 15, 5: 20 };
/* win celebrations, keyed to multiples of total bet */
const TIERS = [
  { id: 'epic', label: 'EPIC WIN', at: 25, dur: 2600, parts: 150, shake: 2 },
  { id: 'mega', label: 'MEGA WIN', at: 15, dur: 2100, parts: 95,  shake: 2 },
  { id: 'big',  label: 'BIG WIN',  at: 8,  dur: 1600, parts: 55,  shake: 1 }
];
const tierFor = (total, bet) => TIERS.find(t => total >= t.at * bet) || null;
const LINES = [
  [0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],
  [0,1,2,1,0],[2,1,0,1,2],
  [0,0,1,2,2],[2,2,1,0,0],
  [1,0,0,0,1],[1,2,2,2,1],
  [0,1,1,1,1],[2,1,1,1,1],
  [1,0,1,2,1],[1,2,1,0,1],
  [1,1,0,1,1],[1,1,2,1,1],
  [0,1,2,2,2],[2,1,0,0,0],
  [0,0,1,0,0],[2,2,1,2,2],
  [0,1,0,1,0]
];
const BAG = [];
SYMB.forEach(s => { for (let i = 0; i < s.weight; i++) BAG.push(s.id); });
const pick = () => BAG[(Math.random() * BAG.length) | 0];
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ state */
const store = {
  get(k, d) { try { const v = localStorage.getItem('nr.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('nr.' + k, JSON.stringify(v)); } catch {} }
};
const state = {
  bal: store.get('bal', 25000),
  betIdx: store.get('betIdx', 1),
  jackpot: store.get('jp', 40000),
  bet: 0,
  spinning: false,
  turbo: false,
  autoLeft: 0,
  autoN: 10,
  free: 0,
  lastWin: 0,
  grid: null
};
state.bet = BETS[state.betIdx];

/* --------------------------------------------------------------------- DOM */
const gridEl = $('#grid'), wrapEl = $('#reelwrap'), linesSvg = $('#lines');
const balEl = $('#bal'), bvalEl = $('#bval'), winEl = $('#winamt'), winMsg = $('#winmsg');
const msgEl = $('#msg'), jpEl = $('#jp'), spinBtn = $('#spin'), fsLeft = $('#fsleft');
const cols = [];

function cellEl(id) {
  const d = document.createElement('div');
  d.className = 'cell';
  d.style.color = BY_ID[id].color;
  d.innerHTML = svgFor(id);
  return d;
}
function buildColumns() {
  for (let c = 0; c < COLS; c++) {
    const col = document.createElement('div'); col.className = 'col';
    const strip = document.createElement('div'); strip.className = 'strip';
    for (let r = 0; r < ROWS; r++) strip.appendChild(cellEl(pick()));
    col.appendChild(strip); gridEl.appendChild(col); cols.push(col);
  }
}
function randomGrid() {
  return Array.from({ length: COLS }, () => Array.from({ length: ROWS }, pick));
}
/* cells live inside .col > .strip, so reach through the strip */
const cellsOf = c => [...(cols[c].firstElementChild?.children || [])];
const cellAt = (c, r) => cols[c].firstElementChild?.children[r] || null;

function layout() {
  const w = wrapEl.clientWidth;
  let cellH = (w - GAP * (COLS - 1)) / COLS;
  cellH = Math.max(52, Math.min(124, cellH));
  document.documentElement.style.setProperty('--cellh', cellH + 'px');
}

/* --------------------------------------------------------------- formatting */
const fmt = (n) => Math.round(n).toLocaleString('en-US');
function countTo(el, from, to, dur = 600) {
  const token = (el.__ct = (el.__ct || 0) + 1);      // newer writes win over stale ones
  const done = v => { if (el.__ct === token) el.textContent = fmt(v); };
  if (reduced || from === to) { done(to); return; }
  const t0 = performance.now();
  (function step(t) {
    if (el.__ct !== token) return;
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function resetWin() {
  winEl.__ct = (winEl.__ct || 0) + 1;
  winEl.textContent = '0';
}
function renderHUD() {
  balEl.textContent = fmt(state.bal);
  bvalEl.innerHTML = fmt(state.bet) + '<small>total bet</small>';
  jpEl.textContent = fmt(state.jackpot);
  fsLeft.textContent = state.free;
  document.body.classList.toggle('free', state.free > 0);
}
function toast(text, cls = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + cls; t.textContent = text;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 2400);
  setTimeout(() => t.remove(), 2750);
}

/* --------------------------------------------------------------- particles */
const fx = $('#fx'), ctx = fx.getContext('2d');
let dpr = Math.min(2, window.devicePixelRatio || 1);
let parts = [], dust = [];
function fxResize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  fx.width = innerWidth * dpr; fx.height = innerHeight * dpr;
  fx.style.width = innerWidth + 'px'; fx.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function seedDust() {
  dust = Array.from({ length: reduced ? 0 : 46 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: 0.6 + Math.random() * 1.9, s: 0.08 + Math.random() * 0.3,
    a: 0.12 + Math.random() * 0.4, h: [186, 315, 74, 46][Math.random() * 4 | 0]
  }));
}
function burst(x, y, color, n = 46) {
  if (reduced) n = Math.min(n, 14);
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, sp = 1.6 + Math.random() * 7;
    parts.push({
      x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.6,
      g: 0.16 + Math.random() * 0.14, life: 1, decay: 0.011 + Math.random() * 0.014,
      size: 2 + Math.random() * 5, color: Math.random() < 0.35 ? '#ffd84d' : color,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3
    });
  }
}
function fxLoop() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const d of dust) {
    d.y -= d.s; d.x += Math.sin(d.y / 60) * 0.16;
    if (d.y < -6) { d.y = innerHeight + 6; d.x = Math.random() * innerWidth; }
    ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(Date.now() / 700 + d.x));
    ctx.fillStyle = `hsl(${d.h} 100% 65%)`;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.vy += p.g; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
    if (p.life <= 0 || p.y > innerHeight + 60) { parts.splice(i, 1); continue; }
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(fxLoop);
}

/* ------------------------------------------------------------------- reels */
function runReels(grid) {
  const base = state.turbo ? 620 : 1300, step = state.turbo ? 90 : 180;
  const probe = cols[0].querySelector('.cell');
  const cellH = probe ? probe.getBoundingClientRect().height
    : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cellh'));
  const dist = FILLER * (cellH + GAP);
  return Promise.all(cols.map((col, r) => new Promise(res => {
    const strip = col.querySelector('.strip');
    const frag = document.createDocumentFragment();
    for (let i = 0; i < FILLER; i++) frag.appendChild(cellEl(pick()));
    grid[r].forEach(id => frag.appendChild(cellEl(id)));
    strip.replaceChildren(frag);
    strip.style.transition = 'none';
    strip.style.transform = 'translate3d(0,0,0)';
    strip.classList.add('spin');
    void strip.offsetHeight;                       // reflow: commit start position
    const d = base + r * step;
    strip.style.transition = `transform ${d}ms cubic-bezier(.14,.86,.2,1)`;
    strip.style.transform = `translate3d(0,${-dist}px,0)`;
    setTimeout(() => {
      strip.classList.remove('spin');
      strip.style.transition = 'none';
      strip.style.transform = 'translate3d(0,0,0)';
      const f2 = document.createDocumentFragment();
      grid[r].forEach(id => f2.appendChild(cellEl(id)));
      strip.replaceChildren(f2);
      res();
    }, d + 26);
  })));
}

/* --------------------------------------------------------------- evaluation */
function evalLines(grid, bet) {
  const wins = []; let total = 0;
  LINES.forEach(line => {
    const seq = line.map((row, c) => grid[c][row]);
    let base = null;
    for (const s of seq) if (s !== 'wild') { base = s; break; }
    if (base === null) base = 'wild';
    if (base === 'scatter') return;                // moons pay anywhere only
    let count = 0;
    for (const s of seq) { if (s === base || s === 'wild') count++; else break; }
    const mult = BY_ID[base].pays[count] || 0;
    if (count >= 3 && mult > 0) {
      const amount = Math.round(mult * bet);
      total += amount;
      wins.push({ line, count, symbol: base, amount });
    }
  });
  return { wins, total };
}
const countScatter = grid => grid.flat().filter(id => id === 'scatter').length;

function clearLines() { linesSvg.replaceChildren(); }
function drawWins(wins) {
  const gr = gridEl.getBoundingClientRect();
  if (!gr.width) return;
  linesSvg.setAttribute('viewBox', `0 0 ${gr.width} ${gr.height}`);
  wins.forEach((w, i) => {
    const pts = [];
    for (let c = 0; c < w.count; c++) {
      const cell = cellAt(c, w.line[c]);
      if (!cell) continue;
      const cr = cell.getBoundingClientRect();
      pts.push(`${(cr.left - gr.left + cr.width / 2).toFixed(1)},${(cr.top - gr.top + cr.height / 2).toFixed(1)}`);
    }
    if (pts.length < 2) return;
    const pl = document.createElementNS(NS, 'polyline');
    pl.setAttribute('points', pts.join(' '));
    const col = BY_ID[w.symbol].color;
    pl.setAttribute('stroke', col);
    pl.style.color = col;
    pl.style.animationDelay = `${i * 0.1}s, 0s`;
    linesSvg.appendChild(pl);
  });
}
function markCells(wins, scatterCells) {
  const marked = new Set();
  wins.forEach(w => {
    for (let c = 0; c < w.count; c++) {
      const el = cellAt(c, w.line[c]);
      if (el) { el.classList.add('win'); marked.add(el); }
    }
  });
  scatterCells.forEach(el => { if (el) { el.classList.add('scatterpop'); marked.add(el); } });
  if (!wins.length && !scatterCells.length) return;   // a dead spin keeps full brightness
  for (let c = 0; c < COLS; c++) cellsOf(c).forEach(el => {
    if (!marked.has(el)) el.classList.add('dim');
  });
}

/* ------------------------------------------------------------------ overlays */
const bigwin = $('#bigwin');
const stageEl = $('#stage');

function shake(level = 1) {
  if (reduced || !stageEl) return;
  clearTimeout(shake.t);
  stageEl.classList.remove('shake', 'shake-hard');
  void stageEl.offsetWidth;                       // restart the animation
  stageEl.classList.add(level >= 2 ? 'shake-hard' : 'shake');
  shake.t = setTimeout(() => stageEl.classList.remove('shake', 'shake-hard'), level >= 2 ? 640 : 470);
}

function overlay(title, amount, meta, dur = 1800, tier = 'big') {
  $('#bwt').textContent = title;
  $('#bwa').textContent = typeof amount === 'number' ? '0' : String(amount);
  $('#bwm').textContent = meta;
  bigwin.dataset.tier = tier;
  bigwin.classList.remove('on');
  void bigwin.offsetWidth;                         // replay the entrance
  bigwin.classList.add('on');
  if (typeof amount === 'number') countTo($('#bwa'), 0, amount, Math.min(1000, dur * 0.5));
  return new Promise(r => setTimeout(() => { bigwin.classList.remove('on'); setTimeout(r, 180); }, dur));
}

/* the ladder: colour ramp, shake and confetti all grow with the tier */
const NEON = ['#22f0ff', '#ff3dc8', '#ffd84d', '#b8ff3b', '#8b5cff'];

function celebrate(tier, total, meta) {
  const gr = gridEl.getBoundingClientRect();
  const box = gr.width ? gr : { left: 0, top: 0, width: innerWidth, height: innerHeight };
  const flash = $('#flash');
  flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on');
  shake(tier.shake || 1);
  const parts = tier.parts || 60;
  const shots = parts >= 150 ? 7 : parts >= 90 ? 5 : 3;
  for (let i = 0; i < shots; i++) {
    setTimeout(() => burst(
      box.left + box.width * (0.1 + Math.random() * 0.8),
      box.top + box.height * (0.08 + Math.random() * 0.84),
      NEON[i % NEON.length],
      Math.round(parts / shots)
    ), i * 170);
  }
  return overlay(tier.id === 'jackpot' ? 'NEON JACKPOT' : tier.label, total, meta, tier.dur, tier.id);
}

/* ---------------------------------------------------------------------- spin */
function setSpinning(on) {
  state.spinning = on;
  spinBtn.disabled = on;
  spinBtn.classList.toggle('spinning', on);
  spinBtn.textContent = on ? 'SPINNING' : 'SPIN';
}

function spin() {
  if (state.spinning) return;
  const isFree = state.free > 0;
  const bet = state.bet;

  if (!isFree) {
    if (state.bal < bet) {
      state.bal += 10000;
      toast('Refuel +10,000 Glow coins', 'l');
    }
    if (state.autoLeft > 0) state.autoLeft--;
    state.bal -= bet;
    state.jackpot += Math.round(bet * 0.02);
  } else {
    state.free--;
  }

  state.lastWin = 0;
  setSpinning(true);
  clearLines();
  resetWin();
  $('#winbox').classList.remove('on');
  winMsg.textContent = isFree ? 'Free spin in progress…' : 'Good luck…';
  msgEl.textContent = isFree ? 'Free spin' : `Bet ${fmt(bet)} · ${LINES.length} lines`;
  renderHUD(); store.set('bal', state.bal); store.set('jp', state.jackpot);

  const grid = randomGrid();
  state.grid = grid;
  runReels(grid).then(() => resolve(grid, isFree, bet));
}

async function resolve(grid, isFree, bet) {
  const { wins, total: lineTotal } = evalLines(grid, bet);
  const sc = countScatter(grid);
  let scWin = 0, fsAward = 0;
  if (sc >= 3) {
    scWin = Math.round((SCAT[Math.min(sc, 5)]) * bet);
    fsAward = FS_AWARD[Math.min(sc, 5)];
  }
  const mult = isFree ? 2 : 1;
  const total = Math.round((lineTotal + scWin) * mult);

  const scatterCells = [];
  grid.forEach((colArr, c) => colArr.forEach((id, r) => { if (id === 'scatter') scatterCells.push(cellAt(c, r)); }));

  markCells(wins, scatterCells);
  drawWins(wins);

  const before = state.bal;
  state.bal += total;
  state.lastWin = total;
  countTo(balEl, before, state.bal, 700);
  setTimeout(renderHUD, 760);

  const jpHit = wins.some(w => w.symbol === 'wild' && w.count === 5);

  if (total > 0) {
    $('#winbox').classList.add('on');
    countTo(winEl, 0, total, 700);
    winMsg.textContent = fsAward
      ? `Moon scatter ×${sc} · free spins!`
      : wins.length > 1
        ? `${wins.length} winning lines${mult > 1 ? ' · ×2 free spin' : ''}`
        : `${wins[0].count} × ${BY_ID[wins[0].symbol].name}${mult > 1 ? ' · ×2 free spin' : ''}`;
    // confetti from the winning cells
    const gr = gridEl.getBoundingClientRect();
    wins.slice(0, 6).forEach(w => {
      const c = Math.min(w.count - 1, COLS - 1);
      const el = cellAt(c, w.line[c]);
      if (!el) return;
      const cr = el.getBoundingClientRect();
      burst(cr.left + cr.width / 2, cr.top + cr.height / 2, BY_ID[w.symbol].color, 40);
    });
  } else {
    winMsg.textContent = fsAward ? `Moon scatter ×${sc}` : 'No win — spin again';
    msgEl.textContent = state.turbo ? 'Turbo' : 'Nothing on the lines this time';
  }

  setSpinning(false);

  /* --- showpieces, then schedule the next spin --- */
  if (jpHit) {
    const pot = state.jackpot;
    state.bal += pot; countTo(balEl, state.bal - pot, state.bal, 900);
    state.jackpot = 40000;
    $('#jpbox').classList.add('hit');
    setTimeout(() => $('#jpbox').classList.remove('hit'), 3000);
    toast('NEON JACKPOT! +' + fmt(pot), 'y');
    await celebrate({ id: 'jackpot', dur: 2800, parts: 170, shake: 2 }, pot, 'meter reset · next ' + fmt(40000));
  } else {
    const tier = tierFor(total, bet);
    if (tier) {
      await celebrate(tier, total,
        '×' + (total / bet).toFixed(1) + ' your bet' + (mult > 1 ? ' · ×2 free spin' : ''));
    }
  }

  if (fsAward) {
    state.free += fsAward;
    renderHUD();
    toast(`+${fsAward} free spins · all wins ×2`, 'p');
    await overlay('FREE SPINS', fsAward + ' GAMES', 'all wins ×2', 1500);
  }

  store.set('bal', state.bal); store.set('jp', state.jackpot);
  renderHUD();

  /* --- next spin --- */
  if (state.free > 0) {
    setTimeout(spin, 650);
    return;
  }
  if (state.autoLeft > 0) {
    if (total >= bet * 20) {
      state.autoLeft = 0; updateAutoBtn();
      toast('Autoplay stopped — ' + fmt(total) + ' win (×' + (total / bet).toFixed(0) + ')', 'y');
    } else if (state.bal < bet) {
      state.autoLeft = 0; updateAutoBtn();
      toast('Autoplay stopped — low balance', 'r');
    } else {
      setTimeout(spin, state.turbo ? 340 : 850);
    }
    return;
  }
  msgEl.textContent = total > 0
    ? `Win ${fmt(total)} · press SPIN to go again`
    : 'Press SPIN or hit space';
}

/* ----------------------------------------------------------------- controls */
function setBet(i) {
  if (state.spinning) return;
  state.betIdx = Math.max(0, Math.min(BETS.length - 1, i));
  state.bet = BETS[state.betIdx];
  store.set('betIdx', state.betIdx);
  renderHUD();
  msgEl.textContent = `Total bet ${fmt(state.bet)} · ${LINES.length} lines`;
}
function updateAutoBtn() {
  const b = $('#auto');
  b.textContent = state.autoLeft > 0 ? `Stop ×${state.autoLeft}` : 'Auto';
  b.classList.toggle('pri', state.autoLeft > 0);
}
function buildPaytable() {
  const host = $('#ptable');
  host.innerHTML = SYMB.map(s => {
    const wide = s.id === 'wild' || s.id === 'scatter';
    let val;
    if (s.id === 'scatter') {
      val = `<i>3</i>${SCAT[3]}× <i>4</i>${SCAT[4]}× <i>5</i>${SCAT[5]}×`;
    } else {
      val = `<i>5</i>${s.pays[5]}× <i>4</i>${s.pays[4]}× <i>3</i>${s.pays[3]}×`;
    }
    const note = s.id === 'wild' ? ' · substitutes · 5 on a line = jackpot'
      : s.id === 'scatter' ? ` · 3+ = ${FS_AWARD[3]}/${FS_AWARD[4]}/${FS_AWARD[5]} free spins, pays anywhere` : '';
    return `<div class="pr ${wide ? 'wide' : ''}" style="color:${s.color}">
      ${svgFor(s.id)}
      <div><div class="nm" style="color:var(--txt)">${s.name}</div>
      <div class="pv">${val}</div>
      <div class="pv" style="color:var(--faint)">${note || '× total bet'}</div></div>
    </div>`;
  }).join('');
}

function wireEvents() {
  spinBtn.addEventListener('click', spin);
  $('#bdn').addEventListener('click', () => setBet(state.betIdx - 1));
  $('#bup').addEventListener('click', () => setBet(state.betIdx + 1));
  $('#bmax').addEventListener('click', () => setBet(BETS.length - 1));
  $('#refuel').addEventListener('click', () => {
    state.bal += 10000; store.set('bal', state.bal); renderHUD();
    balEl.parentElement.classList.add('up');
    setTimeout(() => balEl.parentElement.classList.remove('up'), 700);
    toast('Refuel +10,000 Glow coins', 'l');
  });
  $('#turbo').addEventListener('change', e => {
    state.turbo = e.target.checked;
    toast(state.turbo ? 'Turbo on — faster reels' : 'Turbo off', 'p');
  });
  $('#aseg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...e.currentTarget.children].forEach(x => x.classList.toggle('on', x === b));
    state.autoN = +b.dataset.n;
  });
  $('#auto').addEventListener('click', () => {
    if (state.autoLeft > 0) { state.autoLeft = 0; toast('Autoplay stopped'); }
    else {
      if (state.spinning) return;
      state.autoLeft = state.autoN;
      toast(`Autoplay ×${state.autoN}`, 'p');
      spin();
    }
    updateAutoBtn();
  });
  const scrim = $('#ptscrim');
  const openPt = () => { scrim.hidden = false; $('#ptclose').focus(); };
  const closePt = () => { scrim.hidden = true; };
  $('#ptbtn').addEventListener('click', openPt);
  $('#ptclose').addEventListener('click', closePt);
  scrim.addEventListener('click', e => { if (e.target === scrim) closePt(); });

  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); spin(); }
    else if (e.code === 'ArrowUp') { e.preventDefault(); setBet(state.betIdx + 1); }
    else if (e.code === 'ArrowDown') { e.preventDefault(); setBet(state.betIdx - 1); }
    else if (e.key === 't' || e.key === 'T') {
      const t = $('#turbo'); t.checked = !t.checked; t.dispatchEvent(new Event('change'));
    } else if (e.key === 'Escape' && !$('#ptscrim').hidden) closePt();
  });

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); fxResize(); seedDust(); }, 150); });
}

/* --------------------------------------------------------------------- boot */
function boot() {
  buildColumns();
  buildPaytable();
  layout();
  fxResize(); seedDust(); fxLoop();
  wireEvents();
  state.grid = randomGrid();
  cols.forEach((col, c) => {
    const strip = col.querySelector('.strip');
    strip.replaceChildren(...state.grid[c].map(cellEl));
  });
  renderHUD();
  updateAutoBtn();
  if (state.bal < BETS[0]) { state.bal = 25000; store.set('bal', state.bal); renderHUD(); }
  msgEl.textContent = 'Press SPIN or hit space';
}
boot();
})();
