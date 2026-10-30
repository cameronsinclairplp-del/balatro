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
const f1 = n => (Math.round(n*10)/10).toFixed(1);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const uniq = arr => [...new Set(arr)];
const STORE = 'anteup.v2';
const TABS = [
  {id:'jokers', name:'Jokers', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h.01M15 16h.01M9 16l6-8"/></svg>'},
  {id:'hands', name:'Hands', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20l-3-11 4-1 2 6"/><path d="M10 14l-1-9 4-1 1 8"/><path d="M14 12l1-8 4 1-1 9"/><path d="M7 20h11l3-6"/></svg>'},
  {id:'builds', name:'Builds', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>'},
  {id:'bosses', name:'Bosses', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12h.01M15 12h.01M10 16h4"/></svg>'},
  {id:'learn', name:'Learn', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V5.5M20 18v3H6.5"/><path d="M9 8h7M9 12h5"/></svg>'}
];
const PLUS = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const TICK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ARR_L = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
const ARR_R = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
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
const FACE_TAGS = ['face','king','queen','jack'];
const TIER = {S:{c:'#ff9a2e',name:'Legendary'}, A:{c:'#c084fc',name:'Epic'}, B:{c:'#5cb0ff',name:'Rare'}, C:{c:'#a8b5b2',name:'Common'}};
const BAND = {strong:{c:'#ff9a2e',name:'Strong fit'}, good:{c:'#c084fc',name:'Good fit'}, some:{c:'#5cb0ff',name:'Some fit'}, none:{c:'#4a5c5c',name:'No fit'}, conflict:{c:'#ff6b63',name:'Conflict'}};
const DECKS = Object.fromEntries(D.DECKS.map(d=>[d.id,d]));

/* ---------- state ---------- */
const S = {tab:'jokers', sub:'browse', table:[], q:'', rarity:'', role:'', sort:'auto', glow:'auto',
  run:{ante:1, money:4, deck:'red', vouchers:[], packs:[]}, runOpen:false,
  shop:{items:[]}, pack:{kind:'buffoon', items:[]}, pq:'', pq2:'',
  calc:{hand:'flush', lvl:1, chips:0, mult:0, x:1, useTable:true}, bossKind:'all', learn:'discards'};
function cleanTable(arr){ return (Array.isArray(arr)?arr:[]).filter(t => t && J[t.id]).map(t => ({id:t.id, ed: D.EDITIONS[t.ed] ? t.ed : 'b'})).slice(0,10); }
function load(){
  try{
    let s = JSON.parse(localStorage.getItem(STORE)||'null');
    if(!s){ const old = JSON.parse(localStorage.getItem('anteup.v1')||'null'); if(old) s = old; }
    if(!s) return;
    S.table = cleanTable(s.table);
    if(s.calc) Object.assign(S.calc, s.calc);
    if(s.run){ Object.assign(S.run, s.run); if(!DECKS[S.run.deck]) S.run.deck='red'; S.run.ante = clamp(+S.run.ante||1,1,39); S.run.money = clamp(+S.run.money||0,-20,9999); S.run.vouchers = Array.isArray(S.run.vouchers)?S.run.vouchers:[]; S.run.packs = Array.isArray(S.run.packs)?S.run.packs:[]; }
    if(s.shop) S.shop.items = cleanTable(s.shop.items);
    if(s.pack){ S.pack.items = cleanTable(s.pack.items); if(['buffoon','jumbo','mega'].includes(s.pack.kind)) S.pack.kind = s.pack.kind; }
    if(s.sort) S.sort = s.sort; if(s.glow) S.glow = s.glow; if(s.rarity!==undefined) S.rarity = s.rarity; if(s.role!==undefined) S.role = s.role;
  }catch(e){}
}
function save(){ try{ localStorage.setItem(STORE, JSON.stringify({table:S.table, calc:S.calc, run:S.run, shop:S.shop, pack:S.pack, sort:S.sort, glow:S.glow, rarity:S.rarity, role:S.role})); }catch(e){} }
function slots(){ return 5 + S.table.filter(t => t.ed==='n').length + (S.run.deck==='black'?1:0) - (S.run.deck==='painted'?1:0) + (S.run.vouchers.includes('Antimatter')?1:0); }
function hasV(name){ return S.run.vouchers.includes(name); }
function wide(){ return matchMedia('(min-width:900px)').matches; }

/* ---------- toast ---------- */
let toastT, undoFn = null;
function toast(msg, undo, label){ const el = $('#toast'); undoFn = undo || null;
  el.innerHTML = h(msg) + (undo ? ` <button class="undo" type="button" data-act="undo">${h(label||'Undo')}</button>` : '');
  el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(()=>{ el.classList.remove('show'); undoFn = null; }, undo ? 5000 : 2400); }

/* ---------- routing ---------- */
function parseHash(){
  const raw = location.hash.replace(/^#/, '');
  const [path, qs] = raw.split('?');
  let [tab, sub] = path.split('/');
  if(tab==='tips'){ tab = 'learn'; sub = 'tips'; }
  if(tab==='learn' && ['discards','deck','tips'].includes(sub)) S.learn = sub;
  if(tab==='jokers' && ['browse','shop','pack','table'].includes(sub)) S.sub = sub;
  const params = new URLSearchParams(qs||'');
  return {tab: TABS.some(t=>t.id===tab) ? tab : 'jokers', params};
}
function route(){
  const {tab, params} = parseHash();
  const t = params.get('t');
  if(t){
    const parsed = t.split(',').map(s=>{ const [id, ed] = s.split('.'); return J[id] ? {id, ed: D.EDITIONS[ed] ? ed : 'b'} : null; }).filter(Boolean);
    if(parsed.length){ S.table = parsed.slice(0, 10); S.sub = 'table'; }
    if(params.get('a')) S.run.ante = clamp(+params.get('a')||1,1,39);
    if(params.get('m')!==null) S.run.money = clamp(+params.get('m')||0,-20,9999);
    if(DECKS[params.get('d')]) S.run.deck = params.get('d');
    save(); toast('Loaded a shared table'); history.replaceState(null, '', '#'+tab);
  }
  S.tab = tab; renderAll();
}

/* ---------- swirl background ---------- */
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
      const nx = x/W*2-1, ny = y/Hh*2-1; const d = Math.sqrt(nx*nx+ny*ny);
      let v = Math.sin(nx*3.1 + s*.35) + Math.sin(ny*2.7 - s*.28) + Math.sin((nx+ny)*2.2 + s*.42) + Math.sin(d*4.5 - s*.5 + Math.atan2(ny,nx)*1.5);
      v = (v + 4) / 8; const [r,g,b] = col(v); const i = (y*W+x)*4; px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=255;
    }}
    octx.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(off, 0, 0, c.width, c.height);
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
  for(const g of (a.gives||[])) if(b.tags.includes(g)){ s += 3; why.push(`${a.name} → ${b.name}: ${LABEL[g]||g}`); }
  for(const g of (b.gives||[])) if(a.tags.includes(g)){ s += 3; why.push(`${b.name} → ${a.name}: ${LABEL[g]||g}`); }
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

/* Deck + voucher + ante adjustments for a candidate joker. */
function contextFor(c, js){
  let pts = 0; const notes = []; const r = S.run; const ante = r.ante; const has = tag => c.tags.includes(tag);
  const isX = c.roles.includes('xmult') || c.roles.includes('copy'), isEcon = c.roles.includes('econ'), isFlat = c.roles.includes('chips')||c.roles.includes('mult');
  if(ante <= 2){ if(isEcon){ pts += .6; notes.push('Economy pays off most this early'); } if(c.scaling){ pts += .5; notes.push('Time to scale'); } if(isFlat) pts += .3; }
  else if(ante <= 5){ if(isX){ pts += .5; notes.push('Mid-game: xMult wins now'); } if(c.scaling) pts += .2; }
  else { if(isX){ pts += .7; notes.push('Late: raw multiplier matters most'); } if(c.scaling){ pts -= .7; notes.push('Late: little time left to scale'); } if(isEcon){ pts -= .6; notes.push('Late: money is worth less'); } if(c.decay) pts -= .5; }
  const face = FACE_TAGS.some(has) && !has('noface');
  switch(r.deck){
    case 'abandoned': if(face && !js.some(j=>j.id==='pareidolia')){ pts -= 2.5; notes.push('Abandoned deck has no face cards'); } break;
    case 'checkered': if(has('flush')||c.id==='smeared'){ pts += .8; notes.push('Two-suit deck: flushes are easy'); } if(has('club')||has('diamond')){ pts -= 2.5; notes.push('Checkered deck has no Clubs or Diamonds'); } if(c.id==='blackboard') pts += .4; break;
    case 'red': if(has('discard')){ pts += .4; notes.push('Red deck: extra discard'); } break;
    case 'blue': if(has('manyhands')){ pts += .4; notes.push('Blue deck: extra hand'); } break;
    case 'green': if(c.id==='tothemoon'){ pts -= 3; notes.push('Green deck earns no interest'); } break;
    case 'plasma': if(isX) pts += .3; break;
    case 'erratic': if(FACE_TAGS.some(has)||['diamond','heart','spade','club','low','even','odd','two','four','six','eight','nine','ten'].some(has)){ pts -= .4; notes.push('Erratic deck: rank and suit counts are random'); } break;
    case 'painted': if(has('held')||has('handsize')){ pts += .5; notes.push('Painted deck: +2 hand size'); } break;
    case 'ghost': if(has('spectral')) pts += .4; break;
    case 'magic': case 'zodiac': if(has('tarot')) pts += .3; if(r.deck==='zodiac'&&has('planet')) pts += .3; break;
    case 'nebula': if(has('planet')){ pts += .4; notes.push('Nebula: Telescope makes planets flow'); } break;
    case 'black': if(c.id==='stencil') pts -= .3; break;
  }
  const v = name => r.vouchers.includes(name);
  if((v('Reroll Surplus')||v('Reroll Glut')) && c.id==='flashcard'){ pts += .6; notes.push('Cheap rerolls feed Flash Card'); }
  if((v('Telescope')||v('Observatory')||v('Planet Merchant')||v('Planet Tycoon')) && has('planet')){ pts += .5; notes.push('Planet vouchers active'); }
  if((v('Tarot Merchant')||v('Tarot Tycoon')) && has('tarot')){ pts += .5; notes.push('Tarot vouchers active'); }
  if((v('Seed Money')||v('Money Tree')) && (has('money')||has('interest'))){ pts += .5; notes.push('Higher interest cap'); }
  if((v('Paint Brush')||v('Palette')) && has('held')){ pts += .4; notes.push('Bigger hand: more held cards'); }
  if((v('Grabber')||v('Nacho Tong')) && has('manyhands')) pts += .3;
  if((v('Wasteful')||v('Recyclomancy')) && has('discard')) pts += .4;
  if((v('Crystal Ball')||v('Omen Globe')) && c.id==='perkeo') pts += .6;
  if((v('Magic Trick')||v('Illusion')) && has('deckadd')){ pts += .4; notes.push('Playing cards in the shop feed deck growth'); }
  if((v("Director's Cut")||v('Retcon')) && has('boss')){ pts -= .5; notes.push('You can already reroll bosses'); }
  if((v('Blank')||v('Antimatter')) && c.id==='stencil') pts -= .3;
  return {pts: clamp(pts, -3, 1.5), notes};
}

function analyse(){
  const js = tableJokers(); const n = js.length; const ids = js.map(j=>j.id);
  const out = {js, legs:{}, order:[], orderNotes:[], syn:[], warn:[], rec:[], totals:{chips:0, mult:0, x:1, counted:[], skipped:[]}, fit:{}, sell:[]};
  for(const leg of ['chips','mult','xmult']){
    const src = js.filter(j => j.roles.includes(leg));
    const edSrc = js.filter(j => (leg==='chips'&&j.ed==='f')||(leg==='mult'&&j.ed==='h')||(leg==='xmult'&&j.ed==='p'));
    const names = src.map(j=>j.name).concat(edSrc.map(j => `${D.EDITIONS[j.ed].name} on ${j.name}`));
    let status = 'notmet';
    if(names.length){ const solid = src.some(j => !j.decay && !j.scaling && !j.tags.some(t=>SITUATIONAL.has(t))) || edSrc.length; status = solid ? 'met' : 'partly'; }
    let note = '';
    if(status==='partly') note = src.some(j=>j.scaling) ? 'Scales from nothing — needs rounds to grow' : src.some(j=>j.decay) ? 'Decays every round' : 'Situational — not every hand';
    if(status==='notmet') note = leg==='xmult' ? 'No multiplier. Antes 6–8 will stall.' : leg==='chips' ? 'Chips come from cards only.' : 'Base hand Mult only.';
    out.legs[leg] = {status, names, note};
  }
  const copies = js.filter(j=>j.roles.includes('copy'));
  let body = js.filter(j=>!j.roles.includes('copy') && j.id!=='dagger').sort((a,b)=>rank(a)-rank(b)||a.slot-b.slot);
  const xs = body.filter(j=>j.roles.includes('xmult')).sort((a,b)=>xPower(b)-xPower(a));
  const bs = copies.find(j=>j.id==='brainstorm'), bp = copies.find(j=>j.id==='blueprint');
  if(bs && xs.length){ const best = xs[0]; body = [best].concat(body.filter(j=>j!==best)); out.orderNotes.push(`${best.name} goes leftmost so Brainstorm copies it.`); }
  if(bp){ const target = xs.find(j => !(bs && j===xs[0])) || xs[0] || body[body.length-1];
    if(target){ const i = body.indexOf(target); body.splice(i, 0, bp); out.orderNotes.push(`Blueprint sits directly left of ${target.name} to copy it.`); } else body.push(bp); }
  if(bs) body.push(bs);
  const dag = js.find(j=>j.id==='dagger'); if(dag){ body.push(dag); out.orderNotes.push('Ceremonial Dagger goes rightmost so it has nothing to eat — unless you want it to.'); }
  out.order = body;
  if(js.some(j=>CARD_STAGE.has(j.id))) out.orderNotes.push('Per-card jokers (suit, face, rank bonuses) score during card play — their slot barely matters.');
  if(bp){ const i = body.indexOf(bp); const t = body[i+1]; if(t && t.nocopy) out.warn.push({names:[], why:`Blueprint is copying ${t.name}, which can't be copied.`}); if(!t) out.warn.push({names:[], why:'Blueprint has nothing to its right.'}); }
  if(bs){ const t = body[0]; if(t && t.nocopy) out.warn.push({names:[], why:`Brainstorm copies ${t.name} (leftmost), which can't be copied.`}); if(t===bs) out.warn.push({names:[], why:'Brainstorm is leftmost — it copies itself, which does nothing.'}); }
  if(n > slots()) out.warn.push({names:[], why:`${n} jokers on ${slots()} slots. Mark one Negative or drop one.`});
  const seen = new Set();
  for(const c of comboFor(ids)){ for(let i=0;i<c.ids.length;i++) for(let k=i+1;k<c.ids.length;k++) seen.add([c.ids[i], c.ids[k]].sort().join('+')); (c.anti ? out.warn : out.syn).push({names:c.ids.map(i=>J[i].name), why:c.why}); }
  for(let i=0;i<n;i++) for(let k=i+1;k<n;k++){
    const key = [js[i].id, js[k].id].sort().join('+'); if(seen.has(key)) continue;
    const p = pairScore(js[i], js[k]);
    if(p.anti.length) out.warn.push({names:[js[i].name, js[k].name], why:p.anti[0]+'.'});
    else if(p.s >= 2) out.syn.push({names:[js[i].name, js[k].name], why:p.why[0]+'.'});
  }
  for(const j of js){ if(j.decay) out.warn.push({names:[j.name], why:'Fades each round — plan to sell it before it hits zero.'}); if(j.id==='grosmichel') out.warn.push({names:[j.name], why:'1 in 6 to vanish each round. Don\'t build around it.'}); if(j.id==='madness') out.warn.push({names:[j.name], why:'Destroys a random joker every Small and Big blind. Cheap fodder only beside it.'}); }
  if(n && !js.some(j=>j.roles.includes('econ')) && S.run.ante <= 5) out.warn.push({names:[], why:'No economy joker. Bank $25 for max interest before the next upgrade.'});
  if(S.run.deck==='abandoned' && !js.some(j=>j.id==='pareidolia')){ const faces = js.filter(j=>FACE_TAGS.some(t=>j.tags.includes(t))); if(faces.length) out.warn.push({names:faces.map(j=>j.name), why:'Abandoned deck has no face cards — these do nothing.'}); }
  if(S.run.deck==='checkered'){ const bad = js.filter(j=>j.tags.includes('club')||j.tags.includes('diamond')); if(bad.length) out.warn.push({names:bad.map(j=>j.name), why:'Checkered deck has no Clubs or Diamonds.'}); }
  if(S.run.deck==='green' && js.some(j=>j.id==='tothemoon')) out.warn.push({names:['To the Moon'], why:'Green deck earns no interest — this does nothing.'});
  for(const j of js){
    const f = j.flat || {}; let c = f.chips||0, m = f.mult||0, x = f.x||1;
    if(j.id==='abstract') m += 3*n; if(j.id==='stencil') x *= Math.max(1, slots()-n+1);
    if(j.ed==='f') c += 50; if(j.ed==='h') m += 10; if(j.ed==='p') x *= 1.5;
    const ownFlat = !!(f.chips||f.mult||f.x) || j.id==='abstract' || j.id==='stencil';
    if(c||m||x!==1) { out.totals.chips += c; out.totals.mult += m; out.totals.x *= x; out.totals.counted.push(ownFlat ? j.name + (j.ed!=='b' ? ` + ${D.EDITIONS[j.ed].short}` : '') : `${D.EDITIONS[j.ed].short} on ${j.name}`); }
    if(!ownFlat && (j.roles.includes('chips')||j.roles.includes('mult')||j.roles.includes('xmult'))) out.totals.skipped.push(j.name);
  }
  const have = new Set(ids);
  for(const c of D.JOKERS) if(!have.has(c.id)) out.fit[c.id] = scoreJoker(c, js, out.legs);
  out.rec = Object.values(out.fit).filter(f => n ? f.score >= 5 : true).sort((a,b)=>b.score-a.score).slice(0,6);
  out.sell = js.map(j => contribution(j, js, out.legs)).sort((a,b)=>a.score-b.score);
  return out;
}

/* Score a candidate joker against the table + run, 0–10. */
function scoreJoker(c, js, legs){
  const n = js.length;
  const power = {S:3.5, A:2.6, B:1.7, C:0.9}[c.tier];
  let synPts = 0; let reasons = []; let anti = []; let comboWhy = '';
  for(const t of js){
    const p = pairScore(c, t); if(p.s > 0) synPts += p.s; reasons.push(...p.why); anti.push(...p.anti);
    for(const x of comboFor([c.id, t.id])){ if(x.anti) anti.unshift(x.why); else { synPts += 4; if(!comboWhy) comboWhy = x.why; } }
  }
  if(c.roles.includes('copy') && js.some(j=>j.roles.includes('xmult'))){ synPts += 3; reasons.unshift('Copies your xMult'); }
  if(comboWhy) reasons.unshift(comboWhy);
  const synergy = Math.min(4, synPts/2);
  let need = 0;
  for(const leg of ['chips','mult','xmult']) if(c.roles.includes(leg) || (leg==='xmult' && c.roles.includes('copy'))){ if(legs[leg].status==='notmet') need = Math.max(need, 2); else if(legs[leg].status==='partly') need = Math.max(need, 1); else if(leg==='xmult') need = Math.max(need, .5); }
  if(c.roles.includes('econ') && !js.some(j=>j.roles.includes('econ')) && S.run.ante <= 5) need = Math.max(need, 1);
  if(n === 0) need = c.roles.some(r=>['chips','mult','xmult'].includes(r)) ? 1.5 : .5;
  const ctx = contextFor(c, js);
  const penalty = Math.min(4, uniq(anti).length*2) + (c.decay ? .5 : 0) + (c.nocopy && js.some(j=>j.id==='blueprint'||j.id==='brainstorm') ? .3 : 0);
  const score = clamp(power + synergy + need + ctx.pts - penalty, 0, 10);
  anti = uniq(anti); reasons = uniq(reasons);
  const band = anti.length ? 'conflict' : score >= 7.5 ? 'strong' : score >= 5.5 ? 'good' : score >= 3.5 ? 'some' : 'none';
  const legName = c.roles.includes('xmult')||c.roles.includes('copy') ? 'xMult' : c.roles.includes('mult') ? '+Mult' : 'Chips';
  const why = anti.length ? anti[0] : reasons[0] || (need >= 2 ? `Fills the ${legName} leg` : ctx.notes[0] || (n ? `${TIER[c.tier].name}-tier, no direct link` : `${TIER[c.tier].name} tier`));
  return {id:c.id, j:c, score: Math.round(score*10)/10, power, synergy, need, context:ctx.pts, penalty, band, why: why.replace(/\.$/,''), reasons:reasons.slice(0,3), anti, notes:ctx.notes};
}
/* How much a joker already on the table is worth to it, 0–10 (for selling). */
function contribution(j, js, legs){
  const others = js.filter(o => o !== j);
  const power = {S:3.5, A:2.6, B:1.7, C:0.9}[j.tier];
  let synPts = 0; const why = [];
  for(const o of others){ const p = pairScore(j, o); if(p.s > 0) synPts += p.s; for(const x of comboFor([j.id, o.id])){ if(!x.anti){ synPts += 4; why.push(x.why); } else why.push('Conflict: '+x.why); } }
  const synergy = Math.min(4, synPts/2);
  let unique = 0;
  for(const leg of ['chips','mult','xmult']) if(j.roles.includes(leg) && others.every(o => !o.roles.includes(leg) && !((leg==='chips'&&o.ed==='f')||(leg==='mult'&&o.ed==='h')||(leg==='xmult'&&o.ed==='p')))) unique += leg==='xmult' ? 2.5 : 1.5;
  if(j.roles.includes('econ') && others.every(o=>!o.roles.includes('econ')) && S.run.ante <= 5) unique += 1;
  const ed = j.ed==='p' ? 1.5 : j.ed==='n' ? 1.2 : j.ed==='b' ? 0 : .5;
  const ctx = contextFor(j, others);
  const penalty = (j.decay ? 1 : 0) + (j.id==='grosmichel' ? .5 : 0);
  const score = clamp(power + synergy + Math.min(2.5, unique) + ed + ctx.pts - penalty, 0, 10);
  let note = why[0] || (unique >= 2.5 ? 'Your only xMult' : unique ? 'Only joker on its leg' : ctx.notes[0] || (synPts ? 'Links with the table' : 'No links with the rest of the table'));
  if(j.ed==='n') note = 'Negative: selling costs you a slot. ' + note;
  return {id:j.id, j, score: Math.round(score*10)/10, note: note.replace(/\.$/,'')};
}
let _aKey = null, _a = null;
function A(){ const k = JSON.stringify([S.table, S.run]); if(k !== _aKey){ _aKey = k; _a = analyse(); } return _a; }

/* ---------- affix colouring, glow ---------- */
function glowMode(){ return S.glow==='auto' ? (S.table.length ? 'fit' : 'power') : S.glow; }
const HANDS_RE = /\b(Straight Flush|Five of a Kind|Flush House|Flush Five|Four of a Kind|Three of a Kind|Two Pair|Full House|High Card|Straights?|Flush|Pair)\b/g;
const CARDS_RE = /\b(face cards?|Kings?|Queens?|Jacks?|Aces?|Steel|Glass|Gold|Lucky|Stone|Wild|Enhanced|Spades?|Hearts?|Diamonds?|Clubs?|Planet|Tarot|Spectral|Negative|Booster Packs?|Boss Blinds?|Blind)\b/g;
function affix(eff){
  let t = h(eff);
  t = t.replace(/([+−-]\d[\d,.]*\s?Chips?)/gi, '<b class="v v-chips">$1</b>');
  t = t.replace(/(×\s?\d[\d.]*\s?Mult|×\d[\d.]*)/g, '<b class="v v-x">$1</b>');
  t = t.replace(/([+−-]\d[\d.]*\s?Mult)/g, '<b class="v v-mult">$1</b>');
  t = t.replace(/([+−-]?\$\d+)/g, '<b class="v v-gold">$1</b>');
  t = t.replace(/(\d+ in \d+)/g, '<b class="v v-prob">$1</b>');
  t = t.replace(/([+−-]\d+ (?:hand size|hands?|discards?|joker slots?))/gi, '<b class="v v-util">$1</b>');
  t = t.replace(HANDS_RE, '<b class="v v-hand">$1</b>');
  t = t.replace(CARDS_RE, '<i class="v v-card">$1</i>');
  return t;
}

/* ---------- small renderers ---------- */
function nav(){
  const mk = t => `<button class="tab" type="button" data-nav="${t.id}" ${S.tab===t.id?'aria-current="page"':''}>${t.icon}<span>${t.name}</span></button>`;
  $('#sidenav').innerHTML = TABS.map(mk).join(''); $('#tabbar').innerHTML = TABS.map(mk).join('');
  $('#toptitle').textContent = TABS.find(t=>t.id===S.tab).name.toUpperCase();
  document.title = `${TABS.find(t=>t.id===S.tab).name} — Ante Up`;
}
function renderAll(){
  nav(); const main = $('#main');
  main.innerHTML = S.tab==='jokers' ? viewJokers() : S.tab==='hands' ? viewHands() : S.tab==='builds' ? viewBuilds() : S.tab==='bosses' ? viewBosses() : viewLearn();
  window.scrollTo(0,0);
}
function title(name, meta){ return `<div class="pagetitle"><h1>${name}</h1>${meta?`<span class="meta">${meta}</span>`:''}</div>`; }
function rarTag(j, p){ const r = D.RARITY[j.r]; const c = j.r==='l' ? '#c983d2' : r.color; return `<span class="rar" style="--rc:${c}">${r.name.toUpperCase()} · ${p!==undefined ? '$'+p : j.cost ? '$'+j.cost : 'Soul only'}</span>`; }
function roleTags(j){ return j.roles.map(r=>`<span class="tag tag-${r}">${h(D.ROLES[r]).toUpperCase()}</span>`).join('') + (j.scaling?'<span class="tag tag-scaling">SCALING</span>':''); }
function legColor(leg){ return leg==='chips'?'var(--chips-lt)':leg==='mult'?'var(--mult-lt)':'var(--x-lt)'; }
function jcolor(j){ return j.roles.includes('xmult')||j.roles.includes('copy') ? 'var(--x-lt)' : j.roles.includes('mult') ? 'var(--mult-lt)' : j.roles.includes('chips') ? 'var(--chips-lt)' : 'var(--soft)'; }
function scoreBadge(f, small){ return `<span class="score10${small?' small':''}" style="--gc:${BAND[f.band].c}" title="${h(BAND[f.band].name)}">${f1(f.score)}<small>/10</small></span>`; }
function price(j, ed){ let p = (j.cost||0) + (D.EDITION_COST[ed]||0); if(hasV('Liquidation')) p = Math.max(1, Math.floor(p*.5)); else if(hasV('Clearance Sale')) p = Math.max(1, Math.floor(p*.75)); return p; }
function afford(p){ return S.run.money + (S.table.some(t=>t.id==='credit') ? 20 : 0) >= p; }
function edsHTML(j, attrs){ return `<div class="eds" role="group" aria-label="Edition for ${h(j.name)}">${Object.entries(D.EDITIONS).map(([k,e])=>`<button class="ed ed-${k}" type="button" ${attrs} data-ed="${k}" aria-pressed="${j.ed===k}" title="${e.name}${e.chips?` +${e.chips} Chips`:e.mult?` +${e.mult} Mult`:e.x?` ×${e.x} Mult`:e.slot?' +1 joker slot':''}">${e.short}</button>`).join('')}</div>`; }
function moveHTML(j, i, n){ return `<div class="acts"><button class="ico" type="button" data-act="left" data-slot="${i}" aria-label="Move ${h(j.name)} left" ${i===0?'disabled':''}>${ARR_L}</button><button class="ico" type="button" data-act="right" data-slot="${i}" aria-label="Move ${h(j.name)} right" ${i===n-1?'disabled':''}>${ARR_R}</button><button class="ico danger" type="button" data-act="remove" data-id="${j.id}" aria-label="Remove ${h(j.name)}">${TICK}</button></div>`; }

/* ---------- Jokers tab ---------- */
function filtered(){
  const q = S.q.trim().toLowerCase();
  let list = D.JOKERS.filter(j => (!S.rarity || j.r===S.rarity) && (!S.role || j.roles.includes(S.role) || (S.role==='scaling'&&j.scaling)) && (!q || j.name.toLowerCase().includes(q) || j.eff.toLowerCase().includes(q)));
  const tierN = {S:0,A:1,B:2,C:3}; const rarN = {l:0,r:1,u:2,c:3};
  const fit = S.table.length ? A().fit : null;
  const mode = S.sort==='auto' ? (fit ? 'fit' : 'tier') : S.sort;
  if(mode==='fit' && fit) list.sort((a,b)=>((fit[b.id]||{}).score??-99)-((fit[a.id]||{}).score??-99)||tierN[a.tier]-tierN[b.tier]||a.name.localeCompare(b.name));
  else if(mode==='tier') list.sort((a,b)=>tierN[a.tier]-tierN[b.tier]||a.name.localeCompare(b.name));
  else if(mode==='cost') list.sort((a,b)=>(a.cost||99)-(b.cost||99)||a.name.localeCompare(b.name));
  else if(mode==='rarity') list.sort((a,b)=>rarN[a.r]-rarN[b.r]||a.name.localeCompare(b.name));
  else list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}
function tile(j){
  const on = S.table.some(t=>t.id===j.id);
  const tier = TIER[j.tier]; const mode = glowMode(); const a = A();
  const f = (mode==='fit' && S.table.length && !on) ? a.fit[j.id] : null;
  const glow = f ? BAND[f.band].c : tier.c; const dim = f && f.band==='none';
  return `<article class="tile${on?' on':''}${dim?' dim':''}" data-id="${j.id}" style="--gc:${glow};--tc:${tier.c}">
    <div class="top">${rarTag(j)}<span class="tier" style="--tc:${tier.c}" title="${tier.name} glow — tier ${j.tier}, community consensus">${j.tier}</span>${f?scoreBadge(f):''}</div>
    <button class="add" type="button" data-act="${on?'remove':'add'}" data-id="${j.id}" aria-label="${on?'Remove':'Add'} ${h(j.name)}">${on?TICK:PLUS}</button>
    <h3 class="name">${h(j.name)}</h3>
    <p class="eff">${affix(j.eff)}</p>
    <div class="roles">${roleTags(j)}</div>
    ${j.nocopy?'<div class="nocopy">Blueprint / Brainstorm can\'t copy this</div>':''}
    ${on?'<div class="fitline" style="color:var(--gold)"><span class="fit-tag">ON YOUR TABLE</span></div>':f?`<div class="fitline" style="color:${glow}">${f.band==='none'?'<span class="v-muted">No link to your table</span>':`<span class="fit-tag">${BAND[f.band].name.toUpperCase()}</span> ${h(f.why)}`}</div>`:''}
  </article>`;
}
function legendHTML(){
  const mode = glowMode(); const n = S.table.length;
  const items = mode==='fit' ? ['strong','good','some','conflict'].map(k=>`<span><i class="dot" style="background:${BAND[k].c}"></i>${BAND[k].name}</span>`) : ['S','A','B','C'].map(k=>`<span><i class="dot" style="background:${TIER[k].c}"></i>${k} · ${TIER[k].name}</span>`);
  return `<span class="legend-items">${items.join('')}</span><span class="legend-sw" role="group" aria-label="Glow by"><button class="pill" type="button" data-glow="power" aria-pressed="${mode==='power'}">Power</button><button class="pill" type="button" data-glow="fit" aria-pressed="${mode==='fit'}" ${n?'':'disabled title="Add jokers to your table first"'}>Fit</button></span>`;
}
function gridHTML(list){ return list.length ? list.map(tile).join('') : `<div class="empty">No jokers match. Try a shorter search.</div>`; }

function effSub(){ return (wide() && S.sub==='table') ? 'browse' : S.sub; }
function viewJokers(){
  const segs = [['browse','Browse'],['shop','Shop'],['pack','Pack'],['table','Table']]; const sub = effSub();
  return `${title('JOKERS', `${D.JOKERS.length} jokers · Balatro 1.0.1`)}
  <section class="tableband" id="tableband" aria-label="Your table">${tableBand()}</section>
  <div class="seg" role="group" aria-label="View">${segs.map(([v,n])=>`<button type="button" data-sub="${v}" aria-pressed="${sub===v}">${n}${v==='table'?` <span class="badge" id="seg-count">${S.table.length}</span>`:''}</button>`).join('')}</div>
  <div class="jokers">
    <div class="pane-left">
      <section class="pane-browse" id="pane-browse" aria-label="Browse jokers" ${sub!=='browse'?'hidden':''}>${browsePane()}</section>
      <section class="pane-shop" id="pane-shop" aria-label="Shop helper" ${sub!=='shop'?'hidden':''}>${shopPane()}</section>
      <section class="pane-pack" id="pane-pack" aria-label="Pack helper" ${sub!=='pack'?'hidden':''}>${packPane()}</section>
    </div>
    <aside class="pane-table" id="pane-table" aria-label="Table analysis" ${sub!=='table'?'hidden':''}>${tablePane()}</aside>
  </div>`;
}
function browsePane(){
  const list = filtered();
  const rar = [['','All'],['c','Common'],['u','Uncommon'],['r','Rare'],['l','Legendary']];
  const roles = [['chips','Chips'],['mult','+Mult'],['xmult','xMult'],['econ','Economy'],['retrig','Retrigger'],['util','Utility'],['copy','Copy'],['scaling','Scaling']];
  return `<label class="search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a6f6f" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span class="sr">Search jokers</span><input id="q" type="search" placeholder="Search name or effect…" value="${h(S.q)}" autocomplete="off" autocorrect="off" autocapitalize="off"><button class="clear" type="button" data-act="clearq" aria-label="Clear search" ${S.q?'':'hidden'}>${TICK}</button></label>
    <div class="scrollx filters" role="group" aria-label="Rarity">${rar.map(([v,n])=>`<button class="pill" type="button" data-rarity="${v}" aria-pressed="${S.rarity===v}">${v?`<span class="dot" style="background:${D.RARITY[v].color}"></span>`:''}${n}</button>`).join('')}</div>
    <div class="scrollx filters" role="group" aria-label="Role">${roles.map(([v,n])=>`<button class="pill" type="button" data-role="${v}" aria-pressed="${S.role===v}">${n}</button>`).join('')}</div>
    <div class="sortrow"><span class="meta" id="count">${list.length} of ${D.JOKERS.length}</span><label><span class="sr">Sort</span><select class="select" id="sort"><option value="auto" ${S.sort==='auto'?'selected':''}>Best</option><option value="tier" ${S.sort==='tier'?'selected':''}>Best first</option><option value="name" ${S.sort==='name'?'selected':''}>A–Z</option><option value="rarity" ${S.sort==='rarity'?'selected':''}>Rarity</option><option value="cost" ${S.sort==='cost'?'selected':''}>Cheapest</option></select></label></div>
    <div class="legend" id="legend">${legendHTML()}</div>
    <div class="grid" id="grid">${gridHTML(list)}</div>`;
}

/* ---------- Your table: big cards across the top + run context ---------- */
function bigCard(j, i, n){
  const tier = TIER[j.tier];
  return `<article class="bigcard ed-${j.ed}" style="--tc:${tier.c};--rc:${D.RARITY[j.r].color}" data-slot="${i}">
    <span class="sheen" aria-hidden="true"></span>
    <div class="bc-top"><span class="bc-pos">${i+1}</span>${rarTag(j)}<span class="tier" style="--tc:${tier.c}">${j.tier}</span></div>
    <h3 class="bc-name">${h(j.name)}</h3>
    <p class="bc-eff">${affix(j.eff)}</p>
    <div class="bc-ctrl">${edsHTML(j, `data-act="ed" data-slot="${i}"`)}${moveHTML(j, i, n)}</div>
  </article>`;
}
function tableBand(){
  const js = tableJokers(); const n = js.length; const sl = slots(); const a = A();
  const cards = js.map((j,i)=>bigCard(j,i,n)).join('') + Array.from({length: Math.max(0, sl-n)}, (_,i) => `<div class="bigcard empty"><span class="bc-pos">${n+i+1}</span><span class="word" style="color:#93a7a3">Empty slot</span><button class="btn btn-grey btn-sm" type="button" data-sub="browse">Browse</button></div>`).join('');
  return `<div class="tb-head"><h2>YOUR TABLE <span class="meta">${n} / ${sl} slots</span></h2><div class="row wrap">${n?`<button class="btn btn-grey btn-sm" type="button" data-act="autoorder" ${a.order.map(j=>j.id).join()===js.map(j=>j.id).join()?'disabled':''}>Auto-order</button><button class="btn btn-blue btn-sm" type="button" data-act="share">Share</button><button class="btn btn-red btn-sm" type="button" data-act="clear">Clear</button>`:''}</div></div>
  <div class="bigslots">${cards}</div>
  ${runPanel()}`;
}
function runPanel(){
  const r = S.run; const open = S.runOpen;
  const vchips = D.VOUCHERS.map(([t1,t2])=>`<span class="vpair"><button class="pill vp" type="button" data-voucher="${h(t1)}" aria-pressed="${r.vouchers.includes(t1)}">${h(t1)}</button><button class="pill vp" type="button" data-voucher="${h(t2)}" aria-pressed="${r.vouchers.includes(t2)}">${h(t2)}</button></span>`).join('');
  const packs = D.PACKS.map(p=>`<button class="pill" type="button" data-pack="${p.id}" aria-pressed="${r.packs.includes(p.id)}" title="${h(p.pick)}">${p.name}</button>`).join('');
  return `<div class="run inset">
    <div class="run-row">
      <div class="field"><span>Ante</span><div class="stepper"><button class="step" type="button" data-run="ante" data-d="-1" aria-label="Ante down">−</button><input class="input" id="r-ante" type="number" inputmode="numeric" min="1" max="39" value="${r.ante}" aria-label="Ante"><button class="step" type="button" data-run="ante" data-d="1" aria-label="Ante up">+</button></div></div>
      <div class="field"><span>Money</span><div class="stepper"><button class="step" type="button" data-run="money" data-d="-5" aria-label="Money down 5">−</button><input class="input" id="r-money" type="number" inputmode="numeric" min="-20" max="9999" value="${r.money}" aria-label="Money in dollars"><button class="step" type="button" data-run="money" data-d="5" aria-label="Money up 5">+</button></div></div>
      <label class="field deckf"><span>Deck</span><select class="input" id="r-deck">${D.DECKS.map(d=>`<option value="${d.id}" ${r.deck===d.id?'selected':''}>${d.name} — ${h(d.eff)}</option>`).join('')}</select></label>
      <div class="field"><span>Vouchers · ${r.vouchers.length||'none'}</span><button class="pill" type="button" data-act="vouchers" aria-expanded="${!!open}">${open?'Hide':'Choose'} vouchers</button></div>
      <div class="field packsf"><span>Packs in this shop</span><div class="chips-row">${packs}</div></div>
    </div>
    ${open?`<div class="vouchers" role="group" aria-label="Active vouchers">${vchips}</div>`:''}
    <div class="meta run-note">${h(DECKS[r.deck].eff)} · ${r.money>=25?'interest capped ($25+)':`$${25-r.money} short of max interest`}${S.table.some(t=>t.id==='credit')?' · Credit Card: can go to −$20':''}</div>
  </div>`;
}

/* Table analysis (phone also gets the rows + controls here) */
function tablePane(){
  const js = tableJokers(); const n = js.length; const a = A();
  if(!n){
    const starters = D.JOKERS.filter(j=>['sly','jolly','banner','cavendish','hologram','mime'].includes(j.id));
    return `<div class="panel">
      <p class="note">Add jokers from Browse and the stool check, order, synergies and shopping list appear here. Or load a build from the Builds tab.</p>
      <h3 class="sec">GOOD FIRST BUYS</h3>
      <div class="chips-row">${starters.map(j=>`<button class="pill rec" type="button" data-act="add" data-id="${j.id}" style="--rc:${TIER[j.tier].c}">${h(j.name)}</button>`).join('')}</div>
      <div class="tablebar"><button class="btn btn-grey btn-sm" type="button" data-nav="builds">Load a build</button></div>
    </div>`;
  }
  const legName = {chips:'CHIPS', mult:'+MULT', xmult:'xMULT'}; const stName = {met:'Met', partly:'Partly met', notmet:'Not met'};
  const t = a.totals; const bonus = (t.chips||t.mult||t.x!==1);
  return `<div class="panel rows-phone">${js.map((j,i)=>`<div class="trow" data-slot="${i}">
      <div class="head"><div class="who"><span class="word" style="color:${jcolor(j)}">${i+1} · ${h(j.name)}</span><span class="affix">${affix(j.eff)}</span></div>${moveHTML(j, i, n)}</div>
      ${edsHTML(j, `data-act="ed" data-slot="${i}"`)}
    </div>`).join('')}
    <div class="tablebar"><button class="btn btn-grey btn-sm" type="button" data-act="autoorder" ${a.order.map(j=>j.id).join()===js.map(j=>j.id).join()?'disabled':''}>Auto-order</button><button class="btn btn-blue btn-sm" type="button" data-act="share">Share</button><button class="btn btn-red btn-sm" type="button" data-act="clear">Clear</button></div></div>

    <div class="panel analysis">
    <h3 class="sec">STOOL CHECK</h3>
    <div class="stool">${['chips','mult','xmult'].map(l=>{const L=a.legs[l];return `<div class="inset leg ${L.status}"><span class="word lbl" style="color:${legColor(l)}">${legName[l]}</span><span class="word status">${stName[L.status]}</span><span class="meta">${L.names.length?h(L.names.join(', ')):h(L.note)}</span>${L.names.length&&L.note?`<span class="meta" style="color:#ffb15c">${h(L.note)}</span>`:''}</div>`}).join('')}</div>

    <h3 class="sec">LEFT → RIGHT</h3>
    <div class="inset order"><div class="chain">${a.order.map((j,i)=>`<span style="color:${jcolor(j)}">${h(j.name)}</span>${i<a.order.length-1?'<span class="arrow">→</span>':''}`).join('')}</div>
      <div class="why">Chips and set-up first, flat +Mult next, xMult last so it multiplies everything before it.</div>${a.orderNotes.length?`<ul>${a.orderNotes.map(x=>`<li>${h(x)}</li>`).join('')}</ul>`:''}</div>

    ${bonus?`<h3 class="sec">ALWAYS-ON BONUS</h3><div class="inset totals">${t.chips?`<span class="box chips">+${fmt(t.chips)} chips</span>`:''}${t.mult?`<span class="box mult">+${fmtX(t.mult)} mult</span>`:''}${t.x!==1?`<span class="box x">×${fmtX(t.x)} mult</span>`:''}<span class="meta" style="flex-basis:100%">From ${h(t.counted.join(', '))}.${t.skipped.length?` Conditional, not counted: ${h(t.skipped.join(', '))}.`:''}</span></div>`:''}

    <h3 class="sec">SYNERGIES</h3>
    <div class="stack">${a.syn.length?a.syn.map(s=>`<div class="inset note"><b>${h(s.names.join(' + '))}</b> — ${h(s.why)}</div>`).join(''):'<div class="inset note">Nothing lines up yet. Pick a hand type and buy jokers that all fire on it.</div>'}</div>

    ${a.warn.length?`<h3 class="sec warn">WATCH OUT</h3><div class="stack">${a.warn.map(w=>`<div class="inset note warn">${w.names.length?`<b>${h(w.names.join(' + '))}</b> — `:''}${h(w.why)}</div>`).join('')}</div>`:''}

    <h3 class="sec">ADD NEXT</h3>
    <div class="chips-row">${a.rec.length?a.rec.map(f=>`<button class="pill rec" type="button" data-act="add" data-id="${f.id}" style="--rc:${BAND[f.band].c}" title="${h(f.why)}">${h(f.j.name)} <small>${f1(f.score)}/10 · ${h(f.why)}</small></button>`).join(''):'<div class="inset note">Nothing scores 5+ against this table right now.</div>'}</div>

    <h3 class="sec">WEAKEST LINKS</h3>
    <div class="stack">${a.sell.slice(0,3).map((s,i)=>`<div class="inset note sellrow"><span class="rankno">${i+1}</span><div><b>${h(s.j.name)}</b> <span class="score10 small" style="--gc:${s.score<4?'#ff6b63':s.score<6?'#ffb15c':'#7ee0a0'}">${f1(s.score)}<small>/10</small></span><div class="meta">${h(s.note)}</div></div></div>`).join('')}</div>
    <p class="meta" style="margin-top:6px">Sell order if you need a slot. The score is what each one gives the rest of this table, not how good it is alone.</p>
    </div>`;
}

/* ---------- Shop helper ---------- */
function picker(target, q){
  const list = q.trim().length < 2 ? [] : D.JOKERS.filter(j => j.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0,8);
  return `<label class="search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a6f6f" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span class="sr">Find a joker to add</span><input id="pq-${target}" data-picker="${target}" type="search" placeholder="Type a joker name, Enter adds the first match" value="${h(q)}" autocomplete="off" autocorrect="off" autocapitalize="off"></label>
  <div class="picklist" id="picklist-${target}">${pickRows(target, q)}</div>`;
}
function pickRows(target, q){
  const list = q.trim().length < 2 ? [] : D.JOKERS.filter(j => j.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0,8);
  return list.map(j=>`<button class="pickrow" type="button" data-pick="${target}" data-id="${j.id}" style="--tc:${TIER[j.tier].c}"><span class="tier" style="--tc:${TIER[j.tier].c}">${j.tier}</span><b>${h(j.name)}</b><span class="meta">${h(D.RARITY[j.r].name)} · ${j.cost?'$'+j.cost:'Soul'}</span></button>`).join('');
}
function optionCard(target, it, i, f, p){
  const j = J[it.id];
  return `<article class="opt" style="--gc:${BAND[f.band].c};--tc:${TIER[j.tier].c}">
    <div class="opt-head"><span class="opt-rank">${i+1}</span><h3 class="bc-name">${h(j.name)}</h3>${scoreBadge(f)}<button class="ico danger" type="button" data-unpick="${target}" data-id="${j.id}" aria-label="Remove ${h(j.name)} from ${target}">${TICK}</button></div>
    <div class="row wrap" style="gap:6px">${rarTag(j, p)}<span class="tier" style="--tc:${TIER[j.tier].c}">${j.tier}</span>${roleTags(j)}${target==='shop'&&!afford(p)?`<span class="tag tag-bad">CAN'T AFFORD</span>`:''}</div>
    <p class="bc-eff">${affix(j.eff)}</p>
    <div class="eds" role="group" aria-label="Edition of ${h(j.name)} on offer">${Object.entries(D.EDITIONS).map(([k,e])=>`<button class="ed ed-${k}" type="button" data-opted="${target}" data-id="${j.id}" data-ed="${k}" aria-pressed="${it.ed===k}">${e.short}</button>`).join('')}</div>
    <ul class="whylist">${f.anti.length?`<li class="bad">${h(f.anti[0])}</li>`:''}${f.reasons.slice(0,2).map(r=>`<li>${h(r)}</li>`).join('')}${f.notes.slice(0,1).map(r=>`<li class="ctx">${h(r)}</li>`).join('')}${f.need>=2?`<li>Fills a leg your table is missing</li>`:''}</ul>
  </article>`;
}
function shopPane(){
  const a = A(); const js = a.js; const n = js.length; const sl = slots();
  const opts = S.shop.items.map(it => ({it, f: a.fit[it.id] || scoreJoker(J[it.id], js, a.legs), p: price(J[it.id], it.ed)})).sort((x,y)=>y.f.score-x.f.score);
  let verdict = '';
  if(opts.length){
    const best = opts[0]; const lines = []; const full = n >= sl; const weakest = a.sell[0]; const canAff = afford(best.p); const second = opts[1];
    if(!canAff) lines.push(`<b>${h(best.f.j.name)}</b> is the best thing here (${f1(best.f.score)}/10) but it costs $${best.p} and you have $${S.run.money}.`);
    else if(full && weakest){
      if(best.f.score >= weakest.score + 1) lines.push(`<b>Buy ${h(best.f.j.name)}</b> (${f1(best.f.score)}/10) and <b>sell ${h(weakest.j.name)}</b> (${f1(weakest.score)}/10 to this table). Net gain even after the swap.`);
      else lines.push(`<b>Skip.</b> ${h(best.f.j.name)} (${f1(best.f.score)}/10) doesn't beat your weakest joker, ${h(weakest.j.name)} (${f1(weakest.score)}/10), by enough to pay for a swap.`);
    } else {
      if(best.f.score >= 6.5) lines.push(`<b>Buy ${h(best.f.j.name)}</b> — ${f1(best.f.score)}/10. ${h(best.f.why)}.`);
      else if(best.f.score >= 5) lines.push(`<b>Buy ${h(best.f.j.name)}</b> if nothing better is coming — ${f1(best.f.score)}/10. ${h(best.f.why)}.`);
      else lines.push(`<b>Skip this shop.</b> Best on offer is ${h(best.f.j.name)} at ${f1(best.f.score)}/10. Bank the money${S.run.money<25?` — you're $${25-S.run.money} short of max interest`:''}.`);
      if(second && afford(best.p + second.p) && n + 2 <= sl && second.f.score >= 6) lines.push(`You can afford both; <b>${h(second.f.j.name)}</b> (${f1(second.f.score)}/10) is also worth a slot.`);
    }
    if(canAff){ const after = S.run.money - best.p; if(S.run.money >= 25 && after < 25 && best.f.score < 7 && S.run.ante <= 5) lines.push(`Buying drops you to $${after} and breaks the $25 interest cap. Only worth it for a 7+.`); if(S.run.packs.includes('buffoon') && best.f.score < 6) lines.push(`A Buffoon pack is in this shop — 2 to 4 jokers to pick from usually beats a ${f1(best.f.score)}/10 single.`); }
    if(js.some(j=>j.id==='redcard') && S.run.packs.length) lines.push('Red Card on the table: every pack you skip here is +3 Mult.');
    verdict = `<div class="verdict panel"><h3 class="sec" style="margin-top:0">VERDICT</h3>${lines.map(l=>`<p>${l}</p>`).join('')}
      ${full&&canAff?`<h4 class="sec" style="font-size:18px">SELL ORDER</h4><ol class="sellorder">${a.sell.slice(0,3).map(s=>`<li><b>${h(s.j.name)}</b> <span class="meta">${f1(s.score)}/10 · ${h(s.note)}</span></li>`).join('')}</ol>`:''}</div>`;
  }
  return `<div class="helper">
    <div class="helper-intro"><h2 class="sec" style="margin:0">SHOP · WHAT TO BUY</h2><p class="meta">Add the jokers on offer (up to 4), set editions, and make sure Ante, Money and Deck are right in Your Table above. Scores are out of 10 against your current table and run.</p></div>
    ${picker('shop', S.pq)}
    ${opts.length?`<div class="opts">${opts.map((o,i)=>optionCard('shop', o.it, i, o.f, o.p)).join('')}</div>${verdict}<div class="tablebar"><button class="btn btn-grey btn-sm" type="button" data-act="clearshop">Clear shop</button>${afford(opts[0].p)?`<button class="btn btn-blue btn-sm" type="button" data-act="buy" data-id="${opts[0].it.id}" data-ed="${opts[0].it.ed}">Bought ${h(opts[0].f.j.name)} → table</button>`:''}</div>`:`<div class="inset note">Nothing on offer yet. Type a name above to add what the shop is showing.</div>`}
  </div>`;
}

/* ---------- Pack helper ---------- */
function packPane(){
  const a = A(); const js = a.js; const kind = S.pack.kind; const take = kind==='mega' ? 2 : 1; const max = kind==='buffoon' ? 2 : 4;
  const opts = S.pack.items.map(it => ({it, f: a.fit[it.id] || scoreJoker(J[it.id], js, a.legs)})).sort((x,y)=>y.f.score-x.f.score);
  const kinds = [['buffoon','Buffoon · 2, take 1'],['jumbo','Jumbo · 4, take 1'],['mega','Mega · 4, take 2']];
  let verdict = '';
  if(opts.length){
    const picks = opts.slice(0, take); const lines = [];
    lines.push(`<b>Take ${picks.map(p=>h(p.f.j.name)).join(' and ')}</b> — ${picks.map(p=>f1(p.f.score)+'/10').join(', ')}. ${h(picks[0].f.why)}.`);
    if(js.length >= slots() && a.sell[0]) lines.push(`Your table is full. Taking it means selling <b>${h(a.sell[0].j.name)}</b> (${f1(a.sell[0].score)}/10 to this table) — ${picks[0].f.score >= a.sell[0].score + 1 ? 'worth it' : 'not clearly worth it; consider skipping the pack'}.`);
    if(picks[0].f.score < 4.5) lines.push(`None of these is good for your table. Skip the pack${js.some(j=>j.id==='redcard')?' — Red Card gets +3 Mult':''}.`);
    verdict = `<div class="verdict panel"><h3 class="sec" style="margin-top:0">VERDICT</h3>${lines.map(l=>`<p>${l}</p>`).join('')}</div>`;
  }
  const tagCount = {}; js.forEach(j => j.tags.forEach(t => { tagCount[t] = (tagCount[t]||0)+1; }));
  const handTag = Object.keys(tagCount).filter(t=>HAND_TAGS.has(t)).sort((x,y)=>tagCount[y]-tagCount[x])[0];
  const planet = handTag ? `${D.PLANET_FOR[handTag]} — your table rewards ${LABEL[handTag]}` : 'No hand type on the table yet. Jupiter (Flush) or Mercury (Pair) are the safe early picks.';
  const tarots = D.TAROT_FOR.filter(t => tagCount[t.tag]).slice(0,3).map(t=>t.pick);
  return `<div class="helper">
    <div class="helper-intro"><h2 class="sec" style="margin:0">PACK · WHAT TO TAKE</h2><p class="meta">Buffoon packs: add what the pack shows and it ranks them against your table. Celestial and Arcana hints come from what your jokers reward.</p></div>
    <div class="scrollx filters" role="group" aria-label="Pack size">${kinds.map(([v,n])=>`<button class="pill" type="button" data-packkind="${v}" aria-pressed="${kind===v}">${n}</button>`).join('')}</div>
    ${picker('pack', S.pq2)}
    ${opts.length?`<div class="opts">${opts.map((o,i)=>optionCard('pack', o.it, i, o.f, price(J[o.it.id], o.it.ed))).join('')}</div>${S.pack.items.length>max?`<div class="inset note warn">A ${kind} pack shows ${max} jokers — you've added ${S.pack.items.length}.</div>`:''}${verdict}<div class="tablebar"><button class="btn btn-grey btn-sm" type="button" data-act="clearpack">Clear pack</button><button class="btn btn-blue btn-sm" type="button" data-act="takepack">Took ${take===2?'the top two':'the top one'} → table</button></div>`:`<div class="inset note">Type the jokers the pack is showing you.</div>`}
    <h3 class="sec">CELESTIAL PACK</h3><div class="inset note"><b>${h(planet)}</b></div>
    <h3 class="sec">ARCANA PACK</h3><div class="inset note">${tarots.length?tarots.map(t=>`<b>${h(t)}</b>`).join(' · '):'Nothing specific yet — The Empress (+4 Mult cards) and The Hierophant (+30 Chips cards) are never wasted.'}</div>
    <h3 class="sec">STANDARD · SPECTRAL</h3><div class="inset note">Standard: take Steel or Glass if you hold Baron, Mime or Glass Joker; Gold if Golden Ticket. Spectral: Deja Vu (Red seal) on your best scoring card is the quiet winner; Ectoplasm for a Negative slot.</div>
  </div>`;
}

/* ---------- updates ---------- */
function updateBand(){ const b = $('#tableband'); if(b) b.innerHTML = tableBand(); }
function updatePane(key){ const el = $('#pane-'+key); if(!el) return; el.innerHTML = key==='shop' ? shopPane() : key==='pack' ? packPane() : key==='table' ? tablePane() : browsePane(); }
function updateTable(){
  _aKey = null; updateBand();
  updatePane('table'); updatePane('shop'); updatePane('pack');
  const badge = $('#seg-count'); if(badge) badge.textContent = S.table.length;
  if($('#grid')) updateGrid();
}
function updateGrid(){ const g = $('#grid'); if(!g) return; const lg = $('#legend'); if(lg) lg.innerHTML = legendHTML(); const list = filtered(); g.innerHTML = gridHTML(list); const c = $('#count'); if(c) c.textContent = `${list.length} of ${D.JOKERS.length}`; const cl = $('#pane-browse .search .clear'); if(cl) cl.hidden = !S.q; }
function showSub(sub){ S.sub = sub; const es = effSub(); document.querySelectorAll('.seg button[data-sub]').forEach(x=>x.setAttribute('aria-pressed', x.dataset.sub===es)); for(const k of ['browse','shop','pack','table']){ const el = $('#pane-'+k); if(el) el.hidden = es!==k; } const seg = $('.seg'); if(seg && !wide()) window.scrollTo({top: seg.offsetTop - 70, behavior:'smooth'}); }

/* ---------- Hands ---------- */
function calcOut(){
  const c = S.calc; const hd = D.HANDS.find(x=>x.id===c.hand) || D.HANDS[6];
  const lvl = Math.max(1, Math.min(99, c.lvl|0));
  const a = S.table.length ? A() : null; const t = (c.useTable && a) ? a.totals : {chips:0, mult:0, x:1, counted:[], skipped:[]};
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
    <div class="inset" style="overflow-x:auto"><table class="targets"><thead><tr><th scope="col">Ante</th><th scope="col">Small</th><th scope="col">Big</th><th scope="col">Boss</th></tr></thead><tbody>${D.ANTES.map((b,i)=>`<tr ${i+1===S.run.ante?'class="now"':''}><td>${i+1}${i+1===S.run.ante?' <span class="meta">now</span>':''}</td><td>${fmt(b)}</td><td>${fmt(b*1.5)}</td><td class="bossv">${fmt(b*2)}</td></tr>`).join('')}</tbody></table></div>
    <p class="meta" style="margin-top:8px">Boss is 2× base. The Wall is 4×, Violet Vessel 6×. Card chips: 2–10 face value, J/Q/K 10, Ace 11.</p>
  </section>
  <section aria-label="Hand table">
    <h3 class="sec">BASE SCORE · GAIN PER PLANET</h3>
    <div class="stack">${D.HANDS.map(hd=>`<button class="hand${hd.secret?' secret':''}" type="button" data-act="pickhand" data-id="${hd.id}" style="text-align:left;cursor:pointer;width:100%"><span class="word">${hd.name}${hd.secret?' · secret':''}</span><span class="sr"> — use in calculator</span><span class="box chips">${hd.chips}</span><span class="box mult">${hd.mult}</span><span class="meta">${hd.planet}: +${hd.pc} chips, +${hd.pm} mult · ${h(hd.ex)}</span></button>`).join('')}</div>
  </section>
  </div>`;
}
function updateCalc(){ const r = calcOut(); const sb = $('#scorebar'); if(sb) sb.innerHTML = `<span class="box chips">${fmt(r.chips)}</span><span class="times">×</span><span class="box mult">${fmtX(r.mult)}</span>`; const res = $('#result'); if(res) res.innerHTML = resultHTML(r); const lv = $('#c-lvl'); if(lv && +lv.value !== r.lvl) lv.value = r.lvl; }

/* ---------- Builds ---------- */
function viewBuilds(){
  return `${title('BUILDS', 'Eight archetypes. Load one to see its stool.')}
  <div class="builds">${D.BUILDS.map(b=>`<article class="panel build">
    <h3>${h(b.name)}</h3><span class="goal">${h(b.goal)}</span>
    <div class="chips-row">${b.jokers.map(id=>{const j=J[id];return `<button class="pill rec" type="button" data-act="add" data-id="${id}" style="--rc:${TIER[j.tier].c}" title="${h(j.eff)}">${h(j.name)}</button>`}).join('')}</div>
    <dl><dt>Cards</dt><dd>${h(b.keep)}</dd><dt>Planet</dt><dd>${h(b.planet)}</dd><dt>Hurts</dt><dd>${h(b.bad.join(', '))}</dd></dl>
    <div class="inset note tip"><b>Tip</b> — ${h(b.tip)}</div>
    <div class="tablebar"><button class="btn btn-blue btn-sm" type="button" data-act="loadbuild" data-id="${b.id}">Load this build</button></div>
  </article>`).join('')}</div>`;
}

/* ---------- Bosses ---------- */
function viewBosses(){
  const kinds = [['all','All 28'],['debuff','Debuffs'],['hand','Hand limits'],['score','Score checks'],['money','Money'],['finisher','Finishers']];
  const list = D.BOSSES.filter(b => S.bossKind==='all' || b.kind===S.bossKind);
  const KIND = {debuff:'Debuff',hand:'Hand limit',score:'Score check',money:'Money'};
  const orb = b => ({debuff:'#c9a5ff,#6a3fa6',hand:'#7fd6a8,#2f8f62',score:'#9fb3ae,#4a5c5c',money:'#ffd37a,#c7801a',finisher:'#ffc27a,#c75a12'}[b.kind]);
  return `${title('BOSSES', 'Every Boss Blind and the counter')}
  <div class="scrollx filters" role="group" aria-label="Filter">${kinds.map(([v,n])=>`<button class="pill" type="button" data-boss="${v}" aria-pressed="${S.bossKind===v}">${n}</button>`).join('')}</div>
  <div class="bosses" id="bosslist">${list.map(b=>`<article class="boss${b.kind==='finisher'?' finisher':''}"><div class="orb" style="background:radial-gradient(circle at 35% 30%,${orb(b)} 70%)"></div><h3>${h(b.name)} <span class="meta">· ${b.kind==='finisher'?'Ante 8 finisher':KIND[b.kind]+' · from Ante '+b.ante}</span></h3><span class="eff">${h(b.eff)}</span><span class="counter"><b>COUNTER</b> ${h(b.counter)}</span></article>`).join('')}</div>`;
}

/* ---------- Learn ---------- */
const SUIT = {s:{p:'M12 2C9 7 5 9 5 13a4 4 0 0 0 6 3.5V21h2v-4.5A4 4 0 0 0 19 13c0-4-4-6-7-11z',c:'#1d2626'},h:{p:'M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z',c:'#d9372c'},d:{p:'M12 2l7 10-7 10-7-10z',c:'#d9372c'},c:{p:'M12 2a4 4 0 0 0-3.5 6A4 4 0 1 0 11 15.5V21h2v-5.5A4 4 0 1 0 15.5 8 4 4 0 0 0 12 2z',c:'#1d2626'}};
const SUITNAME = {s:'spades',h:'hearts',d:'diamonds',c:'clubs'};
function card(code, state){
  const rank = code.slice(0,-1), suit = code.slice(-1), su = SUIT[suit];
  return `<span class="pc ${state}" style="--sc:${su.c}" role="img" aria-label="${rank} of ${SUITNAME[suit]}${state==='keep'?', keep':', discard'}"><b>${rank}</b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${su.p}" fill="currentColor"/></svg></span>`;
}
function diagram(d){
  if(!d) return '';
  if(d.type==='hand'){ const keep = new Set(d.keep);
    return `<figure class="dg hand-dg"><div class="pcs">${d.cards.map((c,i)=>card(c, keep.has(i)?'keep':'toss')).join('')}</div>
      <div class="dg-legend"><span><i class="sw keep"></i>Keep</span><span><i class="sw toss"></i>Discard</span></div>
      <figcaption>${h(d.note)}<span class="dg-result">${h(d.result)}</span></figcaption></figure>`; }
  if(d.type==='steps') return `<ol class="dg steps">${d.items.map((x,i)=>`<li><span class="num">${i+1}</span>${h(x)}</li>`).join('')}</ol>`;
  if(d.type==='bar'){ const total = d.segs.reduce((a,s)=>a+s.n,0);
    return `<figure class="dg bar-dg"><figcaption>${h(d.title)} · ${total} cards</figcaption><div class="bar" role="img" aria-label="${h(d.title)}: ${d.segs.map(s=>s.label).join(', ')}">${d.segs.map(s=>`<span style="flex:${s.n};background:${s.c}" title="${h(s.label)}"></span>`).join('')}</div><div class="dg-legend">${d.segs.map(s=>`<span><i class="sw" style="background:${s.c}"></i>${h(s.label)}</span>`).join('')}</div></figure>`; }
  if(d.type==='table') return `<div class="dg tbl-wrap"><table class="lesson-tbl"><thead><tr>${d.head.map(x=>`<th scope="col">${h(x)}</th>`).join('')}</tr></thead><tbody>${d.rows.map(r=>`<tr>${r.map((x,i)=>i===0?`<th scope="row">${h(x)}</th>`:`<td>${affix(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return '';
}
function lessonCards(list){ return list.map(l=>`<article class="panel lesson"><h3>${h(l.t)}</h3><p>${affix(l.b)}</p>${diagram(l.d)}</article>`).join(''); }
function viewLearn(){
  const sub = S.learn;
  const segs = [['discards','Discards'],['deck','Deck & cards'],['tips','Tips']];
  const intro = {discards:'How to throw cards away so the right ones show up. Odds are for a fresh 52-card deck with 8 in hand.', deck:'What to add, remove and enhance — and how to play the cards you keep.', tips:'The method, in cards.'}[sub];
  const body = sub==='tips' ? viewTipsBody() : `<div class="lessons">${lessonCards(D.LESSONS[sub])}</div>`;
  return `${title('LEARN', intro)}
  <div class="seg learn-seg" role="group" aria-label="Lesson">${segs.map(([v,n])=>`<button type="button" data-learn="${v}" aria-pressed="${sub===v}">${n}</button>`).join('')}</div>
  ${body}`;
}
function viewTipsBody(){
  return `
  <div class="inset flow" aria-label="Joker order">
    <div class="stepbox s1"><span class="word">1 · CHIPS &amp; SET-UP</span><small>Retriggers, Pareidolia, Splash, Banner, Sly, Scary Face</small></div><span class="arr" aria-hidden="true"></span>
    <div class="stepbox s2"><span class="word">2 · +MULT</span><small>Joker, Jolly, Abstract, Green Joker, Supernova</small></div><span class="arr" aria-hidden="true"></span>
    <div class="stepbox s3"><span class="word">3 · xMULT</span><small>Cavendish, The Duo, Hologram, Baron, Blueprint last</small></div>
  </div>
  <div class="tips" style="margin-top:12px">${D.TIPS.map(t=>`<article class="panel tipcard"><h3>${h(t.t)}</h3><p>${h(t.b)}</p></article>`).join('')}</div>
  <p class="sources">Method from Heatmiser's Steam guide <em>How to Win at Balatro With Early Decks</em>, cross-checked against <a href="https://balatrohq.com/guides/" rel="noopener">BalatroHQ</a>. Numbers are Balatro 1.0.1. Tiers are rough community consensus, not gospel. Fan-made; not affiliated with LocalThunk or Playstack.</p>`;
}

/* ---------- actions ---------- */
function addJoker(id, ed){
  if(S.table.some(t=>t.id===id)){ toast(`${J[id].name} is already on the table`); return false; }
  if(S.table.length >= slots()){ toast(`Table full (${slots()}) — mark a joker Negative for another slot, or sell one`); return false; }
  S.table.push({id, ed: ed && D.EDITIONS[ed] ? ed : 'b'}); save(); updateTable();
  const onPhone = S.tab==='jokers' && S.sub!=='table' && !wide();
  toast(`Added ${J[id].name}`, onPhone ? () => showSub('table') : null, onPhone ? 'View table' : null);
  return true;
}
function removeJoker(id){ const prev = S.table.slice(); S.table = S.table.filter(t=>t.id!==id); save(); updateTable(); toast(`Removed ${J[id].name}`, () => { S.table = prev; save(); updateTable(); toast(`${J[id].name} is back`); }); }
function loadBuild(id){
  const b = D.BUILDS.find(x=>x.id===id); if(!b) return;
  S.table = b.jokers.slice(0,5).map(id=>({id, ed:'b'})); save();
  S.sub = 'table'; if(S.tab==='jokers') renderAll(); else location.hash = '#jokers';
  toast(b.jokers.length>5 ? `${b.name} loaded — ${b.jokers.length} listed, first 5 on the table` : `${b.name} loaded`);
}
function share(){
  const url = `${location.origin}${location.pathname}#jokers?t=${S.table.map(t=>`${t.id}.${t.ed}`).join(',')}&a=${S.run.ante}&m=${S.run.money}&d=${S.run.deck}`;
  const done = () => toast('Share link copied');
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, ()=>prompt('Copy this link', url)); else prompt('Copy this link', url);
}
function setRun(patch){ Object.assign(S.run, patch); save(); updateTable(); }
function refreshHelper(key){ const el = $('#pane-'+key); if(el) el.innerHTML = key==='shop' ? shopPane() : packPane(); }

document.addEventListener('click', e => {
  const b = e.target.closest('[data-nav],[data-sub],[data-act],[data-rarity],[data-role],[data-boss],[data-glow],[data-learn],[data-run],[data-voucher],[data-pack],[data-pick],[data-unpick],[data-opted],[data-packkind]'); if(!b) return;
  const d = b.dataset;
  if(d.nav){ e.preventDefault(); if(d.nav===S.tab){ window.scrollTo({top:0, behavior:'smooth'}); return; } location.hash = '#'+d.nav; return; }
  if(d.sub){ showSub(d.sub); return; }
  if(d.rarity!==undefined){ S.rarity = d.rarity; save(); b.parentElement.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed', x.dataset.rarity===S.rarity)); updateGrid(); return; }
  if(d.role!==undefined){ S.role = S.role===d.role ? '' : d.role; save(); b.parentElement.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed', x.dataset.role===S.role)); updateGrid(); return; }
  if(d.boss!==undefined){ S.bossKind = d.boss; renderAll(); return; }
  if(d.glow){ S.glow = d.glow; save(); updateGrid(); return; }
  if(d.learn){ S.learn = d.learn; history.replaceState(null, '', '#learn/'+S.learn); renderAll(); return; }
  if(d.run){ const r = S.run; if(d.run==='ante') setRun({ante: clamp(r.ante + (+d.d), 1, 39)}); else if(d.run==='money') setRun({money: clamp(r.money + (+d.d), -20, 9999)}); return; }
  if(d.voucher){ const set = new Set(S.run.vouchers); set.has(d.voucher) ? set.delete(d.voucher) : set.add(d.voucher); S.runOpen = true; setRun({vouchers:[...set]}); return; }
  if(d.pack!==undefined){ const set = new Set(S.run.packs); set.has(d.pack) ? set.delete(d.pack) : set.add(d.pack); setRun({packs:[...set]}); return; }
  if(d.packkind){ S.pack.kind = d.packkind; save(); refreshHelper('pack'); return; }
  if(d.pick){ const key = d.pick; const list = S[key].items; if(S.table.some(t=>t.id===d.id)){ toast(`${J[d.id].name} is already on your table`); return; } if(!list.some(x=>x.id===d.id)){ if(list.length >= 4){ toast('Four options is the most a shop or pack shows'); return; } list.push({id:d.id, ed:'b'}); } if(key==='shop') S.pq=''; else S.pq2=''; save(); refreshHelper(key); const inp = $('#pq-'+key); if(inp) inp.focus(); return; }
  if(d.unpick){ const key = d.unpick; S[key].items = S[key].items.filter(x=>x.id!==d.id); save(); refreshHelper(key); return; }
  if(d.opted){ const key = d.opted; const it = S[key].items.find(x=>x.id===d.id); if(it){ it.ed = d.ed; save(); refreshHelper(key); } return; }
  const act = d.act; const id = d.id; const slot = +d.slot;
  if(act==='add') addJoker(id);
  else if(act==='remove') removeJoker(id);
  else if(act==='ed'){ S.table[slot].ed = d.ed; save(); updateTable(); }
  else if(act==='left'||act==='right'){ const k = act==='left' ? slot-1 : slot+1; if(k<0||k>=S.table.length) return; [S.table[slot], S.table[k]] = [S.table[k], S.table[slot]]; save(); updateTable(); }
  else if(act==='autoorder'){ const a = A(); S.table = a.order.map(j=>({id:j.id, ed:j.ed})); save(); updateTable(); toast('Reordered left → right'); }
  else if(act==='clear'){ if(!S.table.length) return; const prev = S.table.slice(); S.table = []; save(); updateTable(); toast('Table cleared', () => { S.table = prev; save(); updateTable(); toast('Table restored'); }); }
  else if(act==='undo'){ if(undoFn){ const f = undoFn; undoFn = null; $('#toast').classList.remove('show'); f(); } }
  else if(act==='share') share();
  else if(act==='clearq'){ S.q=''; const q=$('#q'); if(q){ q.value=''; q.focus(); } updateGrid(); }
  else if(act==='loadbuild') loadBuild(id);
  else if(act==='vouchers'){ S.runOpen = !S.runOpen; updateBand(); }
  else if(act==='clearshop'){ S.shop.items = []; save(); refreshHelper('shop'); }
  else if(act==='clearpack'){ S.pack.items = []; save(); refreshHelper('pack'); }
  else if(act==='buy'){ const j = J[id]; const p = price(j, d.ed); if(addJoker(id, d.ed)){ S.run.money -= p; S.shop.items = S.shop.items.filter(x=>x.id!==id); save(); updateTable(); toast(`Bought ${j.name} for $${p} — $${S.run.money} left`); } }
  else if(act==='takepack'){ const a = A(); const take = S.pack.kind==='mega' ? 2 : 1; const picks = S.pack.items.map(it=>({it, f:a.fit[it.id]||scoreJoker(J[it.id], a.js, a.legs)})).sort((x,y)=>y.f.score-x.f.score).slice(0,take); let n=0; for(const p of picks) if(addJoker(p.it.id, p.it.ed)) n++; if(n){ S.pack.items = []; save(); updateTable(); } }
  else if(act==='lvl'){ S.calc.lvl = Math.max(1, Math.min(99, (S.calc.lvl|0) + (+d.d))); save(); updateCalc(); }
  else if(act==='pickhand'){ S.calc.hand = id; save(); const sel = $('#c-hand'); if(sel) sel.value = id; updateCalc(); toast(`${D.HANDS.find(x=>x.id===id).name} in the calculator`); window.scrollTo({top:0, behavior:'smooth'}); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if(t.id==='q'){ S.q = t.value; updateGrid(); }
  else if(t.dataset && t.dataset.picker){ const key = t.dataset.picker; if(key==='shop') S.pq = t.value; else S.pq2 = t.value; const list = $('#picklist-'+key); if(list) list.innerHTML = pickRows(key, t.value); }
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
  else if(t.id==='r-deck'){ setRun({deck: DECKS[t.value] ? t.value : 'red'}); }
  else if(t.id==='r-ante'){ setRun({ante: clamp(+t.value||1, 1, 39)}); }
  else if(t.id==='r-money'){ setRun({money: clamp(+t.value||0, -20, 9999)}); }
});
document.addEventListener('keydown', e => {
  if(e.key==='Escape' && e.target.id==='q' && S.q){ S.q=''; e.target.value=''; updateGrid(); }
  if(e.key==='Enter' && e.target.dataset && e.target.dataset.picker){ const first = $('#picklist-'+e.target.dataset.picker+' .pickrow'); if(first){ e.preventDefault(); first.click(); } }
});
addEventListener('hashchange', route);
let rw = wide(); addEventListener('resize', () => { const w = wide(); if(w !== rw){ rw = w; if(S.tab==='jokers') renderAll(); } });

load(); swirl(); route();
})();
