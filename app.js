/* Ante Up — app. Plain JS, no build step. */
(function(){
'use strict';
const D = window.AU;
const J = Object.fromEntries(D.JOKERS.map(j => [j.id, j]));
const $ = (s, el=document) => el.querySelector(s);
const h = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf = new Intl.NumberFormat('en-AU');
const fmt = n => nf.format(Math.round(n));
const fmtX = n => (Math.round(n*100)/100).toString();
const STORE = 'anteup.v1';
const TABS = [
  {id:'jokers', name:'Jokers', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h.01M15 16h.01M9 16l6-8"/></svg>'},
  {id:'hands', name:'Hands', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20l-3-11 4-1 2 6"/><path d="M10 14l-1-9 4-1 1 8"/><path d="M14 12l1-8 4 1-1 9"/><path d="M7 20h11l3-6"/></svg>'},
  {id:'builds', name:'Builds', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>'},
  {id:'bosses', name:'Bosses', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12h.01M15 12h.01M10 16h4"/></svg>'},
  {id:'tips', name:'Tips', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.4 1 2.5h6c0-1.1.3-1.9 1-2.5A6 6 0 0 0 12 3z"/></svg>'}
];
const PLUS = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const TICK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const LABEL = {pair:'Pairs',twopair:'Two Pair',trips:'Three of a Kind',quads:'Four of a Kind',straight:'Straights',flush:'Flushes',sflush:'Straight Flushes',highcard:'High Card',fullhouse:'Full Houses',
  face:'face cards',king:'Kings',queen:'Queens',jack:'Jacks',ace:'Aces',low:'low cards',even:'even cards',odd:'odd cards',two:'2s',four:'4s',six:'6s',eight:'8s',nine:'9s',ten:'10s',
  diamond:'Diamonds',heart:'Hearts',spade:'Spades',club:'Clubs',allsuits:'all four suits',wild:'Wild cards',
  steel:'Steel cards',glass:'Glass cards',stone:'Stone cards',gold:'Gold cards',lucky:'Lucky cards',enhanced:'Enhanced cards',seal:'Seals',
  held:'cards held in hand',discard:'discarding',nodiscard:'not discarding',money:'banked money',interest:'interest',planet:'Planet cards',tarot:'Tarot cards',spectral:'Spectral cards',
  sell:'sell value',skip:'skipping blinds',reroll:'rerolls',lasthand:'the final hand',manyhands:'playing lots of hands',onehand:'one hand type',varied:'varied hands',
  fewcards:'small hands',fivecards:'five-card hands',fourcards:'four-card hands',deckadd:'adding cards to the deck',probability:'luck',boss:'Boss Blinds',pack:'Booster Packs',
  jokercount:'joker count',copy:'copying',smalldeck:'a thin deck',bigdeck:'a fat deck',singlecard:'single-card first hands',firsthand:'the first hand',handsize:'hand size',
  retrigger:'retriggers',emptyslots:'empty joker slots',uncommon:'Uncommon jokers',destroy:'destroying jokers',facedestroy:'destroying face cards',noface:'hands without face cards',
  lesshand:'a smaller hand',enhancedeat:'eating enhancements',allscore:'every card scoring'};
const HAND_TAGS = new Set(['pair','twopair','trips','quads','straight','flush','sflush','highcard','fullhouse']);
const CARD_TAGS = new Set(['diamond','heart','spade','club','allsuits','face','king','queen','jack','ace','low','even','odd','two','four','six','eight','nine','ten','wild','steel','glass','stone','gold','lucky','enhanced','seal']);
const SITUATIONAL = new Set(['lasthand','manyhands','emptyslots','onehand','varied','firsthand']);
const ANTI = [['nodiscard','discard'],['enhancedeat','enhanced'],['enhancedeat','steel'],['enhancedeat','glass'],['enhancedeat','lucky'],['enhancedeat','gold'],['lesshand','held'],['lesshand','handsize'],['noface','face'],['varied','onehand'],['fewcards','fivecards'],['smalldeck','bigdeck'],['emptyslots','jokercount']];
const CARD_STAGE = new Set(['greedy','lusty','wrathful','gluttonous','scaryface','smileyface','evensteven','oddtodd','scholar','fibonacci','walkietalkie','arrowhead','onyxagate','bloodstone','roughgem','triboulet','photograph','ancient','idol','wee','hiker','businesscard','goldenticket']);

/* ---------- state ---------- */
const S = {tab:'jokers', sub:'browse', table:[], q:'', rarity:'', role:'', sort:'name',
  calc:{hand:'flush', lvl:1, chips:0, mult:0, x:1, useTable:true}, bossKind:'all'};
function load(){
  try{ const s = JSON.parse(localStorage.getItem(STORE)||'{}');
    if(Array.isArray(s.table)) S.table = s.table.filter(t => J[t.id]).map(t => ({id:t.id, ed: D.EDITIONS[t.ed] ? t.ed : 'b'}));
    if(s.calc) Object.assign(S.calc, s.calc);
    if(s.sort) S.sort = s.sort; if(s.rarity!==undefined) S.rarity = s.rarity; if(s.role!==undefined) S.role = s.role;
  }catch(e){}
}
function save(){ try{ localStorage.setItem(STORE, JSON.stringify({table:S.table, calc:S.calc, sort:S.sort, rarity:S.rarity, role:S.role})); }catch(e){} }
function slots(){ return 5 + S.table.filter(t => t.ed==='n').length; }

/* ---------- toast ---------- */
let toastT;
function toast(msg){ const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(()=>el.classList.remove('show'), 2400); }

/* ---------- routing ---------- */
function parseHash(){
  const raw = location.hash.replace(/^#/, '');
  const [tab, qs] = raw.split('?');
  const params = new URLSearchParams(qs||'');
  return {tab: TABS.some(t=>t.id===tab) ? tab : 'jokers', t: params.get('t')};
}
function route(){
  const {tab, t} = parseHash();
  if(t){
    const parsed = t.split(',').map(s=>{ const [id, ed] = s.split('.'); return J[id] ? {id, ed: D.EDITIONS[ed] ? ed : 'b'} : null; }).filter(Boolean);
    if(parsed.length){ S.table = parsed.slice(0, 10); S.sub = 'table'; save(); toast('Loaded a shared table'); }
    history.replaceState(null, '', '#'+tab);
  }
  S.tab = tab; renderAll();
}

/* ---------- swirl background (canvas, low-res, upscaled) ---------- */
function swirl(){
  const c = $('#swirl'); const ctx = c.getContext('2d', {alpha:false});
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const W = 96, Hh = 54; const off = document.createElement('canvas'); off.width = W; off.height = Hh; const octx = off.getContext('2d');
  const img = octx.createImageData(W, Hh); const px = img.data;
  const stops = [[14,36,32],[27,61,56],[36,96,84],[74,155,134],[27,61,56],[12,30,27]];
  function col(v){ v = Math.min(.999, Math.max(0, v)) * (stops.length-1); const i = Math.floor(v), f = v - i; const a = stops[i], b = stops[i+1]; return [a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f, a[2]+(b[2]-a[2])*f]; }
  let raf = 0, last = 0;
  function paint(t){
    const s = t/1000;
    for(let y=0; y<Hh; y++){ for(let x=0; x<W; x++){
      const nx = x/W*2-1, ny = y/Hh*2-1;
      const d = Math.sqrt(nx*nx+ny*ny);
      let v = Math.sin(nx*3.1 + s*.35) + Math.sin(ny*2.7 - s*.28) + Math.sin((nx+ny)*2.2 + s*.42) + Math.sin(d*4.5 - s*.5 + Math.atan2(ny,nx)*1.5);
      v = (v + 4) / 8;
      const [r,g,b] = col(v); const i = (y*W+x)*4; px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=255;
    }}
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, c.width, c.height);
  }
  function size(){ const dpr = Math.min(1, window.devicePixelRatio||1); c.width = Math.max(1, Math.floor(innerWidth*dpr/2)); c.height = Math.max(1, Math.floor(innerHeight*dpr/2)); paint(last); }
  function loop(t){ if(t - last > 70){ last = t; paint(t); } raf = requestAnimationFrame(loop); }
  function start(){ cancelAnimationFrame(raf); if(reduce.matches || document.hidden){ paint(12000); return; } raf = requestAnimationFrame(loop); }
  addEventListener('resize', size); document.addEventListener('visibilitychange', start); reduce.addEventListener && reduce.addEventListener('change', start);
  size(); start();
}

/* ---------- analysis ---------- */
function tableJokers(){ return S.table.map((t,i) => Object.assign({}, J[t.id], {ed:t.ed, slot:i})); }
function rank(j){ if(j.roles.includes('copy')) return 9; if(j.roles.includes('xmult')) return 3; if(j.roles.includes('mult')) return 2; if(j.roles.includes('chips')) return 1; return 0; }
function xPower(j){ const m = /×(\d+(\.\d+)?)/.exec(j.eff); const base = m ? parseFloat(m[1]) : 1.2; return base + (j.tier==='S'?2:j.tier==='A'?1:0) + (j.ed==='p'?1.5:0); }

function pairScore(a, b){
  let s = 0; const why = []; const anti = [];
  for(const g of (a.gives||[])) if(b.tags.includes(g)){ s += 3; why.push(`${a.name} provides ${LABEL[g]||g} for ${b.name}`); }
  for(const g of (b.gives||[])) if(a.tags.includes(g)){ s += 3; why.push(`${b.name} provides ${LABEL[g]||g} for ${a.name}`); }
  for(const t of a.tags) if(b.tags.includes(t)){
    if(HAND_TAGS.has(t) || CARD_TAGS.has(t)){ s += 2; why.push(`Both reward ${LABEL[t]||t}`); }
    else if(t !== 'copy'){ s += 1; why.push(`Both care about ${LABEL[t]||t}`); }
  }
  for(const [x,y] of ANTI){
    if((a.tags.includes(x) && b.tags.includes(y)) || (b.tags.includes(x) && a.tags.includes(y))){ s -= 3; anti.push(`${LABEL[x]||x} works against ${LABEL[y]||y}`); }
  }
  return {s, why, anti};
}
function comboFor(ids){ const set = new Set(ids); return D.COMBOS.filter(c => c.ids.every(i => set.has(i))); }

function analyse(){
  const js = tableJokers(); const n = js.length; const ids = js.map(j=>j.id);
  const out = {legs:{}, order:[], orderNotes:[], syn:[], warn:[], rec:[], totals:{chips:0, mult:0, x:1, counted:[], skipped:[]}};
  // legs
  for(const leg of ['chips','mult','xmult']){
    const src = js.filter(j => j.roles.includes(leg));
    const edSrc = js.filter(j => (leg==='chips'&&j.ed==='f')||(leg==='mult'&&j.ed==='h')||(leg==='xmult'&&j.ed==='p'));
    const names = src.map(j=>j.name).concat(edSrc.map(j => `${D.EDITIONS[j.ed].name} on ${j.name}`));
    let status = 'notmet';
    if(names.length){
      const solid = src.some(j => !j.decay && !j.scaling && !j.tags.some(t=>SITUATIONAL.has(t))) || edSrc.length;
      status = solid ? 'met' : 'partly';
    }
    let note = '';
    if(status==='partly') note = src.some(j=>j.scaling) ? 'Scales from nothing — needs rounds to grow' : src.some(j=>j.decay) ? 'Decays every round' : 'Situational — not every hand';
    if(status==='notmet') note = leg==='xmult' ? 'No multiplier. Antes 6–8 will stall.' : leg==='chips' ? 'Chips come from cards only.' : 'Base hand Mult only.';
    out.legs[leg] = {status, names, note};
  }
  // order
  const copies = js.filter(j=>j.roles.includes('copy'));
  let body = js.filter(j=>!j.roles.includes('copy') && j.id!=='dagger').sort((a,b)=>rank(a)-rank(b)||a.slot-b.slot);
  const xs = body.filter(j=>j.roles.includes('xmult')).sort((a,b)=>xPower(b)-xPower(a));
  const bs = copies.find(j=>j.id==='brainstorm'), bp = copies.find(j=>j.id==='blueprint');
  if(bs && xs.length){ const best = xs[0]; body = [best].concat(body.filter(j=>j!==best)); out.orderNotes.push(`${best.name} goes leftmost so Brainstorm copies it.`); }
  if(bp){
    const target = xs.find(j => !(bs && j===xs[0])) || xs[0] || body[body.length-1];
    if(target){ const i = body.indexOf(target); body.splice(i, 0, bp); out.orderNotes.push(`Blueprint sits directly left of ${target.name} to copy it.`); }
    else body.push(bp);
  }
  if(bs) body.push(bs);
  const dag = js.find(j=>j.id==='dagger'); if(dag){ body.push(dag); out.orderNotes.push('Ceremonial Dagger goes rightmost so it has nothing to eat — unless you want it to.'); }
  out.order = body;
  if(js.some(j=>CARD_STAGE.has(j.id))) out.orderNotes.push('Per-card jokers (suit, face, rank bonuses) score during card play — their slot barely matters.');
  // nocopy warnings
  if(bp){ const i = body.indexOf(bp); const t = body[i+1]; if(t && t.nocopy) out.warn.push(`Blueprint is copying ${t.name}, which can't be copied.`); if(!t) out.warn.push('Blueprint has nothing to its right.'); }
  if(bs){ const t = body[0]; if(t && t.nocopy) out.warn.push(`Brainstorm copies ${t.name} (leftmost), which can't be copied.`); if(t===bs) out.warn.push('Brainstorm is leftmost — it copies itself, which does nothing.'); }
  if(n > slots()) out.warn.push(`${n} jokers on ${slots()} slots. Mark one Negative or drop one.`);
  // synergies: curated first
  const seen = new Set();
  for(const c of comboFor(ids)){ for(let i=0;i<c.ids.length;i++) for(let k=i+1;k<c.ids.length;k++) seen.add([c.ids[i], c.ids[k]].sort().join('+')); (c.anti ? out.warn : out.syn).push({names:c.ids.map(i=>J[i].name), why:c.why}); }
  for(let i=0;i<n;i++) for(let k=i+1;k<n;k++){
    const key = [js[i].id, js[k].id].sort().join('+'); if(seen.has(key)) continue;
    const p = pairScore(js[i], js[k]);
    if(p.anti.length) out.warn.push({names:[js[i].name, js[k].name], why:p.anti[0]+'.'});
    else if(p.s >= 2) out.syn.push({names:[js[i].name, js[k].name], why:p.why[0]+'.'});
  }
  // decay / risk notes
  for(const j of js){ if(j.decay) out.warn.push({names:[j.name], why:'Fades each round — plan to sell it before it hits zero.'}); if(j.id==='grosmichel') out.warn.push({names:[j.name], why:'1 in 6 to vanish each round. Don\'t build around it.'}); if(j.id==='madness') out.warn.push({names:[j.name], why:'Destroys a random joker every Small and Big blind. Cheap fodder only beside it.'}); }
  if(n && !js.some(j=>j.roles.includes('econ'))) out.warn.push({names:[], why:'No economy joker. Bank $25 for max interest before the next upgrade.'});
  // totals (always-on)
  for(const j of js){
    const f = j.flat || {}; let c = f.chips||0, m = f.mult||0, x = f.x||1;
    if(j.id==='abstract') m += 3*n; if(j.id==='stencil') x *= Math.max(1, slots()-n+1);
    if(j.ed==='f') c += 50; if(j.ed==='h') m += 10; if(j.ed==='p') x *= 1.5;
    const ownFlat = !!(f.chips||f.mult||f.x) || j.id==='abstract' || j.id==='stencil';
    if(c||m||x!==1) { out.totals.chips += c; out.totals.mult += m; out.totals.x *= x; out.totals.counted.push(ownFlat ? j.name + (j.ed!=='b' ? ` + ${D.EDITIONS[j.ed].short}` : '') : `${D.EDITIONS[j.ed].short} on ${j.name}`); }
    if(!ownFlat && (j.roles.includes('chips')||j.roles.includes('mult')||j.roles.includes('xmult'))) out.totals.skipped.push(j.name);
  }
  // recommendations
  const have = new Set(ids);
  const cands = D.JOKERS.filter(j => !have.has(j.id)).map(c => {
    let score = (c.tier==='S'?2:c.tier==='A'?1.5:c.tier==='B'?.5:0); let reason = '';
    for(const t of js){
      const p = pairScore(c, t); score += p.s; if(p.why.length && !reason) reason = p.why[0];
      const cc = comboFor([c.id, t.id]); for(const x of cc){ score += x.anti ? -6 : 4; if(!x.anti && !reason) reason = x.why; }
    }
    for(const leg of ['chips','mult','xmult']) if(c.roles.includes(leg)){ if(out.legs[leg].status==='notmet'){ score += 3; if(!reason) reason = `Fills the ${leg==='xmult'?'xMult':leg==='mult'?'+Mult':'Chips'} leg`; } else if(out.legs[leg].status==='partly') score += 1.5; }
    if(c.roles.includes('econ') && n && !js.some(j=>j.roles.includes('econ'))){ score += 1; if(!reason) reason = 'Economy — you have none'; }
    if(n && !reason) reason = `${c.tier}-tier`; return {c, score, reason};
  }).filter(r => n ? r.score > 1.5 : true).sort((a,b)=>b.score-a.score);
  out.rec = cands.slice(0,6).map(r=>({j:r.c, reason:r.reason.replace(/\.$/,'')}));
  return out;
}

/* ---------- renderers ---------- */
function nav(){
  const mk = t => `<button class="tab" type="button" data-nav="${t.id}" ${S.tab===t.id?'aria-current="page"':''}>${t.icon}<span>${t.name}</span></button>`;
  $('#sidenav').innerHTML = TABS.map(mk).join(''); $('#tabbar').innerHTML = TABS.map(mk).join('');
  $('#toptitle').textContent = TABS.find(t=>t.id===S.tab).name.toUpperCase();
  document.title = `${TABS.find(t=>t.id===S.tab).name} — Ante Up`;
}
function renderAll(){
  nav();
  const main = $('#main');
  main.innerHTML = S.tab==='jokers' ? viewJokers() : S.tab==='hands' ? viewHands() : S.tab==='builds' ? viewBuilds() : S.tab==='bosses' ? viewBosses() : viewTips();
  window.scrollTo(0,0);
}
function title(name, meta){ return `<div class="pagetitle"><h1>${name}</h1>${meta?`<span class="meta">${meta}</span>`:''}</div>`; }
function rarTag(j){ const r = D.RARITY[j.r]; return `<span class="rar" style="background:${r.color}">${r.name.toUpperCase()} · ${j.cost ? '$'+j.cost : 'Soul only'}</span>`; }
function roleTags(j){ return j.roles.map(r=>`<span class="tag tag-${r}">${h(D.ROLES[r]).toUpperCase()}</span>`).join('') + (j.scaling?'<span class="tag tag-scaling">SCALING</span>':''); }
function miniStyle(j){ const c = D.RARITY[j.r].color; return `background:linear-gradient(160deg,${c} 0%,${shade(c,-.3)} 100%)`; }
function shade(hex, k){ const n = parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255; const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k))); return `rgb(${f(r)},${f(g)},${f(b)})`; }
function legColor(leg){ return leg==='chips'?'var(--chips-lt)':leg==='mult'?'var(--mult-lt)':'var(--x-lt)'; }
function jcolor(j){ return j.roles.includes('xmult')||j.roles.includes('copy') ? 'var(--x-lt)' : j.roles.includes('mult') ? 'var(--mult-lt)' : j.roles.includes('chips') ? 'var(--chips-lt)' : 'var(--soft)'; }

/* Jokers */
function filtered(){
  const q = S.q.trim().toLowerCase();
  let list = D.JOKERS.filter(j => (!S.rarity || j.r===S.rarity) && (!S.role || j.roles.includes(S.role) || (S.role==='scaling'&&j.scaling)) && (!q || j.name.toLowerCase().includes(q) || j.eff.toLowerCase().includes(q)));
  const tierN = {S:0,A:1,B:2,C:3}; const rarN = {l:0,r:1,u:2,c:3};
  if(S.sort==='tier') list.sort((a,b)=>tierN[a.tier]-tierN[b.tier]||a.name.localeCompare(b.name));
  else if(S.sort==='cost') list.sort((a,b)=>(a.cost||99)-(b.cost||99)||a.name.localeCompare(b.name));
  else if(S.sort==='rarity') list.sort((a,b)=>rarN[a.r]-rarN[b.r]||a.name.localeCompare(b.name));
  else list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}
function tile(j){
  const on = S.table.some(t=>t.id===j.id);
  return `<article class="tile${on?' on':''}" data-id="${j.id}">
    <div class="top">${rarTag(j)}<span class="tier tier-${j.tier}" title="Tier ${j.tier} (community consensus)">${j.tier}</span></div>
    <button class="add" type="button" data-act="${on?'remove':'add'}" data-id="${j.id}" aria-label="${on?'Remove':'Add'} ${h(j.name)}">${on?TICK:PLUS}</button>
    <h3 class="name">${h(j.name)}</h3>
    <p class="eff">${h(j.eff)}</p>
    <div class="roles">${roleTags(j)}</div>
    ${j.nocopy?'<div class="nocopy">Blueprint / Brainstorm can\'t copy this</div>':''}
  </article>`;
}
function gridHTML(list){ return list.length ? list.map(tile).join('') : `<div class="empty">No jokers match. Try a shorter search.</div>`; }
function viewJokers(){
  const list = filtered();
  const rar = [['','All'],['c','Common'],['u','Uncommon'],['r','Rare'],['l','Legendary']];
  const roles = [['chips','Chips'],['mult','+Mult'],['xmult','xMult'],['econ','Economy'],['retrig','Retrigger'],['util','Utility'],['copy','Copy'],['scaling','Scaling']];
  return `${title('JOKERS', `${D.JOKERS.length} jokers · Balatro 1.0.1`)}
  <div class="seg" role="group" aria-label="View">
    <button type="button" data-sub="browse" aria-pressed="${S.sub==='browse'}">Browse</button>
    <button type="button" data-sub="table" aria-pressed="${S.sub==='table'}">Table <span class="badge" id="seg-count">${S.table.length}</span></button>
  </div>
  <div class="jokers">
    <section class="pane-browse" id="pane-browse" aria-label="Browse jokers" ${S.sub!=='browse'?'hidden':''}>
      <label class="search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a6f6f" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span class="sr">Search jokers</span><input id="q" type="search" placeholder="Search name or effect…" value="${h(S.q)}" autocomplete="off" autocorrect="off" autocapitalize="off"><button class="clear" type="button" data-act="clearq" aria-label="Clear search" ${S.q?'':'hidden'}>${TICK}</button></label>
      <div class="scrollx filters" role="group" aria-label="Rarity">${rar.map(([v,n])=>`<button class="pill" type="button" data-rarity="${v}" aria-pressed="${S.rarity===v}">${v?`<span class="dot" style="background:${D.RARITY[v].color}"></span>`:''}${n}</button>`).join('')}</div>
      <div class="scrollx filters" role="group" aria-label="Role">${roles.map(([v,n])=>`<button class="pill" type="button" data-role="${v}" aria-pressed="${S.role===v}">${n}</button>`).join('')}</div>
      <div class="sortrow"><span class="meta" id="count">${list.length} of ${D.JOKERS.length}</span><label><span class="sr">Sort</span><select class="select" id="sort"><option value="name" ${S.sort==='name'?'selected':''}>A–Z</option><option value="tier" ${S.sort==='tier'?'selected':''}>Best first</option><option value="rarity" ${S.sort==='rarity'?'selected':''}>Rarity</option><option value="cost" ${S.sort==='cost'?'selected':''}>Cheapest</option></select></label></div>
      <div class="grid" id="grid">${gridHTML(list)}</div>
    </section>
    <aside class="pane-table" id="pane-table" aria-label="Your table" ${S.sub!=='table'?'hidden':''}>${tablePane()}</aside>
  </div>`;
}
function tablePane(){
  const js = tableJokers(); const n = js.length; const sl = slots();
  const slotHTML = Array.from({length: Math.max(sl, n)}, (_,i) => { const j = js[i]; return j ? `<div class="mini ed-${j.ed}" style="${miniStyle(j)}" title="${h(j.name)}">${h(j.name)}<span class="sheen"></span></div>` : `<div class="mini empty">Empty</div>`; }).join('');
  if(!n){
    const starters = D.JOKERS.filter(j=>['sly','jolly','banner','cavendish','hologram','mime'].includes(j.id));
    return `<div class="panel">
      <div class="pane-head"><h2>YOUR TABLE <span class="meta">0 / ${sl}</span></h2></div>
      <div class="inset slots">${slotHTML}</div>
      <p class="note" style="margin-top:10px">Add jokers from Browse and the stool check, order, synergies and shopping list appear here. Or load a build from the Builds tab.</p>
      <h3 class="sec">GOOD FIRST BUYS</h3>
      <div class="chips-row">${starters.map(j=>`<button class="pill rec" type="button" data-act="add" data-id="${j.id}" style="--rc:${D.RARITY[j.r].color}">${h(j.name)}</button>`).join('')}</div>
      <div class="tablebar"><button class="btn btn-grey btn-sm" type="button" data-nav="builds">Load a build</button></div>
    </div>`;
  }
  const a = analyse();
  const legName = {chips:'CHIPS', mult:'+MULT', xmult:'xMULT'}; const stName = {met:'Met', partly:'Partly met', notmet:'Not met'};
  const t = a.totals; const bonus = (t.chips||t.mult||t.x!==1);
  return `<div class="panel">
    <div class="pane-head"><h2>YOUR TABLE <span class="meta">${n} / ${sl}</span></h2><button class="btn btn-grey btn-sm" type="button" data-act="autoorder" ${a.order.map(j=>j.id).join()===js.map(j=>j.id).join()?'disabled':''}>Auto-order</button></div>
    <div class="inset slots">${slotHTML}</div>
    <div class="stack" style="margin-top:10px">${js.map((j,i)=>`<div class="trow" data-slot="${i}">
      <div class="head"><div class="who"><span class="word" style="color:${jcolor(j)}">${i+1} · ${h(j.name)}</span><span class="meta">${h(j.eff)}</span></div>
        <div class="acts"><button class="ico" type="button" data-act="left" data-slot="${i}" aria-label="Move ${h(j.name)} left" ${i===0?'disabled':''}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><button class="ico" type="button" data-act="right" data-slot="${i}" aria-label="Move ${h(j.name)} right" ${i===n-1?'disabled':''}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button><button class="ico danger" type="button" data-act="remove" data-id="${j.id}" aria-label="Remove ${h(j.name)}">${TICK}</button></div></div>
      <div class="eds" role="group" aria-label="Edition for ${h(j.name)}">${Object.entries(D.EDITIONS).map(([k,e])=>`<button class="ed ed-${k}" type="button" data-act="ed" data-slot="${i}" data-ed="${k}" aria-pressed="${j.ed===k}" title="${e.name}${e.chips?` +${e.chips} Chips`:e.mult?` +${e.mult} Mult`:e.x?` ×${e.x} Mult`:e.slot?' +1 joker slot':''}">${e.short}</button>`).join('')}</div>
    </div>`).join('')}</div>

    <h3 class="sec">STOOL CHECK</h3>
    <div class="stool">${['chips','mult','xmult'].map(l=>{const L=a.legs[l];return `<div class="inset leg ${L.status}"><span class="word lbl" style="color:${legColor(l)}">${legName[l]}</span><span class="word status">${stName[L.status]}</span><span class="meta">${L.names.length?h(L.names.join(', ')):h(L.note)}</span>${L.names.length&&L.note?`<span class="meta" style="color:#ffb15c">${h(L.note)}</span>`:''}</div>`}).join('')}</div>

    <h3 class="sec">LEFT → RIGHT</h3>
    <div class="inset order"><div class="chain">${a.order.map((j,i)=>`<span style="color:${jcolor(j)}">${h(j.name)}</span>${i<a.order.length-1?'<span class="arrow">→</span>':''}`).join('')}</div>
      <div class="why">Chips and set-up first, flat +Mult next, xMult last so it multiplies everything before it.</div>${a.orderNotes.length?`<ul>${a.orderNotes.map(x=>`<li>${h(x)}</li>`).join('')}</ul>`:''}</div>

    ${bonus?`<h3 class="sec">ALWAYS-ON BONUS</h3><div class="inset totals">${t.chips?`<span class="box chips">+${fmt(t.chips)} chips</span>`:''}${t.mult?`<span class="box mult">+${fmtX(t.mult)} mult</span>`:''}${t.x!==1?`<span class="box x">×${fmtX(t.x)} mult</span>`:''}<span class="meta" style="flex-basis:100%">From ${h(t.counted.join(', '))}.${t.skipped.length?` Conditional, not counted: ${h(t.skipped.join(', '))}.`:''}</span></div>`:''}

    <h3 class="sec">SYNERGIES</h3>
    <div class="stack">${a.syn.length?a.syn.map(s=>`<div class="inset note"><b>${h(s.names.join(' + '))}</b> — ${h(s.why)}</div>`).join(''):'<div class="inset note">Nothing lines up yet. Pick a hand type and buy jokers that all fire on it.</div>'}</div>

    ${a.warn.length?`<h3 class="sec warn">WATCH OUT</h3><div class="stack">${a.warn.map(w=>typeof w==='string'?`<div class="inset note warn">${h(w)}</div>`:`<div class="inset note warn">${w.names.length?`<b>${h(w.names.join(' + '))}</b> — `:''}${h(w.why)}</div>`).join('')}</div>`:''}

    <h3 class="sec">ADD NEXT</h3>
    <div class="chips-row">${a.rec.map(r=>`<button class="pill rec" type="button" data-act="add" data-id="${r.j.id}" style="--rc:${D.RARITY[r.j.r].color}" title="${h(r.reason)}">${h(r.j.name)} <small>${h(r.reason)}</small></button>`).join('')}</div>

    <div class="tablebar"><button class="btn btn-blue btn-sm" type="button" data-act="share">Copy share link</button><button class="btn btn-grey btn-sm" type="button" data-nav="hands">Score it</button><button class="btn btn-red btn-sm" type="button" data-act="clear">Clear table</button></div>
  </div>`;
}
function updateTable(){
  const pane = $('#pane-table'); if(pane) pane.innerHTML = tablePane();
  const badge = $('#seg-count'); if(badge) badge.textContent = S.table.length;
  document.querySelectorAll('.tile').forEach(el => { const on = S.table.some(t=>t.id===el.dataset.id); el.classList.toggle('on', on); const b = el.querySelector('.add'); if(b){ b.dataset.act = on?'remove':'add'; b.innerHTML = on?TICK:PLUS; b.setAttribute('aria-label', `${on?'Remove':'Add'} ${J[el.dataset.id].name}`); } });
}
function updateGrid(){ const g = $('#grid'); if(!g) return; const list = filtered(); g.innerHTML = gridHTML(list); const c = $('#count'); if(c) c.textContent = `${list.length} of ${D.JOKERS.length}`; const cl = $('.search .clear'); if(cl) cl.hidden = !S.q; }

/* Hands */
function calcOut(){
  const c = S.calc; const hd = D.HANDS.find(x=>x.id===c.hand) || D.HANDS[6];
  const lvl = Math.max(1, Math.min(99, c.lvl|0));
  const a = S.table.length ? analyse() : null; const t = (c.useTable && a) ? a.totals : {chips:0, mult:0, x:1, counted:[], skipped:[]};
  const baseC = hd.chips + (lvl-1)*hd.pc, baseM = hd.mult + (lvl-1)*hd.pm;
  const chips = baseC + (+c.chips||0) + t.chips;
  const mult = (baseM + (+c.mult||0) + t.mult) * (Math.max(0, +c.x)||1) * t.x;
  return {hd, lvl, baseC, baseM, chips, mult, score: chips*mult, t};
}
function resultHTML(r){
  const parts = [`${h(r.hd.name)} L${r.lvl} = ${r.baseC} × ${r.baseM}`];
  if(r.t.counted.length) parts.push(`Counted: ${h(r.t.counted.join(', '))}`);
  if(r.t.skipped.length) parts.push(`Not counted (conditional): ${h(r.t.skipped.join(', '))}`);
  return `<span class="meta">${parts.join(' · ')}</span><span class="score">${fmt(r.score)}</span>`;
}
function viewHands(){
  const r = calcOut(); const c = S.calc;
  return `${title('HANDS', 'Base score, planets and a quick calculator')}
  <div class="hands">
  <section aria-label="Calculator">
    <div class="panel calc">
      <div class="fields">
        <label class="field"><span>Hand</span><select class="input" id="c-hand">${D.HANDS.map(hd=>`<option value="${hd.id}" ${hd.id===r.hd.id?'selected':''}>${hd.name}</option>`).join('')}</select></label>
        <div class="field"><span id="lvl-lbl">Level</span><div class="stepper"><button class="step" type="button" data-act="lvl" data-d="-1" aria-label="Level down">−</button><input class="input" id="c-lvl" type="number" inputmode="numeric" min="1" max="99" value="${r.lvl}" aria-labelledby="lvl-lbl"><button class="step" type="button" data-act="lvl" data-d="1" aria-label="Level up">+</button></div></div>
      </div>
      <div class="fields three">
        <label class="field"><span>Card chips</span><input class="input" id="c-chips" type="number" inputmode="numeric" min="0" value="${+c.chips||0}"></label>
        <label class="field"><span>Extra +Mult</span><input class="input" id="c-mult" type="number" inputmode="decimal" min="0" value="${+c.mult||0}"></label>
        <label class="field"><span>Extra ×Mult</span><input class="input" id="c-x" type="number" inputmode="decimal" min="0" step="0.5" value="${+c.x||1}"></label>
      </div>
      <label class="check"><input type="checkbox" id="c-table" ${c.useTable?'checked':''}> Include my table's always-on bonuses${S.table.length?'':' (table is empty)'}</label>
      <div class="inset scorebar" id="scorebar"><span class="box chips">${fmt(r.chips)}</span><span class="times">×</span><span class="box mult">${fmtX(r.mult)}</span></div>
      <div class="result" id="result">${resultHTML(r)}</div>
    </div>
    <h3 class="sec">BLIND TARGETS · WHITE STAKE</h3>
    <div class="inset" style="overflow-x:auto"><table class="targets"><thead><tr><th scope="col">Ante</th><th scope="col">Small</th><th scope="col">Big</th><th scope="col">Boss</th></tr></thead><tbody>${D.ANTES.map((b,i)=>`<tr><td>${i+1}</td><td>${fmt(b)}</td><td>${fmt(b*1.5)}</td><td class="bossv">${fmt(b*2)}</td></tr>`).join('')}</tbody></table></div>
    <p class="meta" style="margin-top:8px">Boss is 2× base. The Wall is 4×, Violet Vessel 6×. Card chips: 2–10 face value, J/Q/K 10, Ace 11.</p>
  </section>
  <section aria-label="Hand table">
    <h3 class="sec">BASE SCORE · GAIN PER PLANET</h3>
    <div class="stack">${D.HANDS.map(hd=>`<button class="hand${hd.secret?' secret':''}" type="button" data-act="pickhand" data-id="${hd.id}" aria-label="Use ${hd.name} in the calculator" style="text-align:left;cursor:pointer;width:100%"><span class="word">${hd.name}${hd.secret?' · secret':''}</span><span class="box chips">${hd.chips}</span><span class="box mult">${hd.mult}</span><span class="meta">${hd.planet}: +${hd.pc} chips, +${hd.pm} mult · ${h(hd.ex)}</span></button>`).join('')}</div>
  </section>
  </div>`;
}
function updateCalc(){ const r = calcOut(); const sb = $('#scorebar'); if(sb) sb.innerHTML = `<span class="box chips">${fmt(r.chips)}</span><span class="times">×</span><span class="box mult">${fmtX(r.mult)}</span>`; const res = $('#result'); if(res) res.innerHTML = resultHTML(r); const lv = $('#c-lvl'); if(lv && +lv.value !== r.lvl) lv.value = r.lvl; }

/* Builds */
function viewBuilds(){
  return `${title('BUILDS', 'Eight archetypes. Load one to see its stool.')}
  <div class="builds">${D.BUILDS.map(b=>`<article class="panel build">
    <h3>${h(b.name)}</h3><span class="goal">${h(b.goal)}</span>
    <div class="chips-row">${b.jokers.map(id=>{const j=J[id];return `<button class="pill rec" type="button" data-act="add" data-id="${id}" style="--rc:${D.RARITY[j.r].color}" title="${h(j.eff)}">${h(j.name)}</button>`}).join('')}</div>
    <dl><dt>Cards</dt><dd>${h(b.keep)}</dd><dt>Planet</dt><dd>${h(b.planet)}</dd><dt>Hurts</dt><dd>${h(b.bad.join(', '))}</dd></dl>
    <div class="inset note tip"><b>Tip</b> — ${h(b.tip)}</div>
    <div class="tablebar"><button class="btn btn-blue btn-sm" type="button" data-act="loadbuild" data-id="${b.id}">Load this build</button></div>
  </article>`).join('')}</div>`;
}

/* Bosses */
function viewBosses(){
  const kinds = [['all','All 28'],['debuff','Debuffs'],['hand','Hand limits'],['score','Score checks'],['money','Money'],['finisher','Finishers']];
  const list = D.BOSSES.filter(b => S.bossKind==='all' || b.kind===S.bossKind);
  const orb = b => ({debuff:'#c9a5ff,#6a3fa6',hand:'#7fd6a8,#2f8f62',score:'#9fb3ae,#4a5c5c',money:'#ffd37a,#c7801a',finisher:'#ffc27a,#c75a12'}[b.kind]);
  return `${title('BOSSES', 'Every Boss Blind and the counter')}
  <div class="scrollx filters" role="group" aria-label="Filter">${kinds.map(([v,n])=>`<button class="pill" type="button" data-boss="${v}" aria-pressed="${S.bossKind===v}">${n}</button>`).join('')}</div>
  <div class="bosses" id="bosslist">${list.map(b=>`<article class="boss${b.kind==='finisher'?' finisher':''}"><div class="orb" style="background:radial-gradient(circle at 35% 30%,${orb(b)} 70%)"></div><h3>${h(b.name)} <span class="meta">· ${b.kind==='finisher'?'Ante 8 finisher':'from Ante '+b.ante}</span></h3><span class="eff">${h(b.eff)}</span><span class="counter"><b>COUNTER</b> ${h(b.counter)}</span></article>`).join('')}</div>`;
}

/* Tips */
function viewTips(){
  return `${title('TIPS', 'The method, in cards')}
  <div class="inset flow" aria-label="Joker order">
    <div class="stepbox" style="background:var(--chips);box-shadow:0 4px 0 var(--chips-dk)"><span class="word">1 · CHIPS &amp; SET-UP</span><small>Retriggers, Pareidolia, Splash, Banner, Sly, Scary Face</small></div><span class="arr" aria-hidden="true"></span>
    <div class="stepbox" style="background:var(--mult);box-shadow:0 4px 0 var(--mult-dk)"><span class="word">2 · +MULT</span><small>Joker, Jolly, Abstract, Green Joker, Supernova</small></div><span class="arr" aria-hidden="true"></span>
    <div class="stepbox" style="background:var(--x);box-shadow:0 4px 0 #5a2f78"><span class="word">3 · xMULT</span><small>Cavendish, The Duo, Hologram, Baron, Blueprint last</small></div>
  </div>
  <div class="tips" style="margin-top:12px">${D.TIPS.map(t=>`<article class="panel tipcard"><h3>${h(t.t)}</h3><p>${h(t.b)}</p></article>`).join('')}</div>
  <p class="sources">Method from Heatmiser's Steam guide <em>How to Win at Balatro With Early Decks</em>, cross-checked against <a href="https://balatrohq.com/guides/" rel="noopener">BalatroHQ</a>. Numbers are Balatro 1.0.1. Tiers are rough community consensus, not gospel. Fan-made; not affiliated with LocalThunk or Playstack.</p>`;
}

/* ---------- actions ---------- */
function addJoker(id){
  if(S.table.some(t=>t.id===id)){ toast(`${J[id].name} is already on the table`); return; }
  if(S.table.length >= slots()){ toast(`Table full (${slots()}) — mark a joker Negative for another slot`); return; }
  S.table.push({id, ed:'b'}); save(); updateTable(); toast(`Added ${J[id].name}`);
}
function removeJoker(id){ S.table = S.table.filter(t=>t.id!==id); save(); updateTable(); toast(`Removed ${J[id].name}`); }
function loadBuild(id){
  const b = D.BUILDS.find(x=>x.id===id); if(!b) return;
  S.table = b.jokers.slice(0,5).map(id=>({id, ed:'b'})); save();
  S.sub = 'table'; location.hash = '#jokers';
  toast(b.jokers.length>5 ? `${b.name} loaded — ${b.jokers.length} listed, first 5 on the table` : `${b.name} loaded`);
}
function share(){
  const url = `${location.origin}${location.pathname}#jokers?t=${S.table.map(t=>`${t.id}.${t.ed}`).join(',')}`;
  const done = () => toast('Share link copied');
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, ()=>prompt('Copy this link', url));
  else prompt('Copy this link', url);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-nav],[data-sub],[data-act],[data-rarity],[data-role],[data-boss]'); if(!b) return;
  if(b.dataset.nav){ e.preventDefault(); if(b.dataset.nav==='hands' && b.dataset.act===undefined && S.tab==='jokers') S.calc.useTable = true; location.hash = '#'+b.dataset.nav; return; }
  if(b.dataset.sub){ S.sub = b.dataset.sub; document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed', x.dataset.sub===S.sub)); $('#pane-browse').hidden = S.sub!=='browse'; $('#pane-table').hidden = S.sub!=='table'; window.scrollTo(0,0); return; }
  if(b.dataset.rarity!==undefined){ S.rarity = b.dataset.rarity; save(); b.parentElement.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed', x.dataset.rarity===S.rarity)); updateGrid(); return; }
  if(b.dataset.role!==undefined){ S.role = S.role===b.dataset.role ? '' : b.dataset.role; save(); b.parentElement.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed', x.dataset.role===S.role)); updateGrid(); return; }
  if(b.dataset.boss!==undefined){ S.bossKind = b.dataset.boss; renderAll(); return; }
  const act = b.dataset.act; const id = b.dataset.id; const slot = +b.dataset.slot;
  if(act==='add') addJoker(id);
  else if(act==='remove') removeJoker(id);
  else if(act==='ed'){ S.table[slot].ed = b.dataset.ed; save(); updateTable(); }
  else if(act==='left'||act==='right'){ const k = act==='left' ? slot-1 : slot+1; if(k<0||k>=S.table.length) return; [S.table[slot], S.table[k]] = [S.table[k], S.table[slot]]; save(); updateTable(); }
  else if(act==='autoorder'){ const a = analyse(); S.table = a.order.map(j=>({id:j.id, ed:j.ed})); save(); updateTable(); toast('Reordered left → right'); }
  else if(act==='clear'){ if(!S.table.length) return; S.table = []; save(); updateTable(); toast('Table cleared'); }
  else if(act==='share') share();
  else if(act==='clearq'){ S.q=''; const q=$('#q'); if(q){ q.value=''; q.focus(); } updateGrid(); }
  else if(act==='loadbuild') loadBuild(id);
  else if(act==='lvl'){ S.calc.lvl = Math.max(1, Math.min(99, (S.calc.lvl|0) + (+b.dataset.d))); save(); updateCalc(); }
  else if(act==='pickhand'){ S.calc.hand = id; save(); const sel = $('#c-hand'); if(sel) sel.value = id; updateCalc(); toast(`${D.HANDS.find(x=>x.id===id).name} in the calculator`); window.scrollTo({top:0, behavior:'smooth'}); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if(t.id==='q'){ S.q = t.value; updateGrid(); }
  else if(t.id==='c-chips'){ S.calc.chips = +t.value||0; save(); updateCalc(); }
  else if(t.id==='c-mult'){ S.calc.mult = +t.value||0; save(); updateCalc(); }
  else if(t.id==='c-x'){ S.calc.x = +t.value||1; save(); updateCalc(); }
  else if(t.id==='c-lvl'){ S.calc.lvl = Math.max(1, Math.min(99, +t.value||1)); save(); updateCalc(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if(t.id==='sort'){ S.sort = t.value; save(); updateGrid(); }
  else if(t.id==='c-hand'){ S.calc.hand = t.value; save(); updateCalc(); }
  else if(t.id==='c-table'){ S.calc.useTable = t.checked; save(); updateCalc(); }
});
addEventListener('hashchange', route);

load(); swirl(); route();
})();
