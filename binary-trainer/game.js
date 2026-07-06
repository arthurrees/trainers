// game.js — Binary Trainer
// Four modes: Explore, Read It (binary→decimal), Write It (decimal→binary), Blitz

var G = {};

// ── Constants ──────────────────────────────────────────
G.BV = [128, 64, 32, 16, 8, 4, 2, 1]; // bit values, MSB first

// ── State ──────────────────────────────────────────────
G.bits = [0,0,0,0,0,0,0,0];   // 8 bits, MSB first
G.locked = false;              // true = bits are display-only
G.mode = '';
G.hi = { r4:0, r7:0, r8:0, w4:0, w7:0, w8:0, blitz:0 };

// Quiz state (read & write modes)
G.Q = {
  mode: '',          // 'read' | 'write'
  nbits: 4,          // 4 | 7 | 8
  maxVal: 15,
  idx: 0,            // current question (1-based)
  total: 10,
  target: 0,
  score: 0,
  streak: 0,
  answered: false,
  history: [],       // {target, got, correct, pts, time}
  timePct: 1,        // 0..1
  timeLimit: 0,
  timerRef: null,
  timerStart: 0
};

// Blitz state
G.BZ = {
  active: false,
  timeLeft: 60,
  timerRef: null,
  score: 0,
  streak: 0,
  combo: 1,
  lives: 3,
  correct: 0,
  total: 0,
  target: 0,
  type: 'read',      // 'read' | 'write'
  answered: false
};

// Explore state
G.EX = { target: null };

// ── Init ───────────────────────────────────────────────
G.init = function () {
  try {
    var s = localStorage.getItem('bintrain_v1');
    if (s) G.hi = JSON.parse(s);
  } catch (e) {}
  G.renderNav();
  G.setMode('explore');
};

G.saveHi = function () {
  try { localStorage.setItem('bintrain_v1', JSON.stringify(G.hi)); } catch (e) {}
};

// ── Nav ────────────────────────────────────────────────
G.renderNav = function () {
  var modes = [
    { id:'explore', label:'🔍 Explore', sub:'free play' },
    { id:'read',    label:'👁 Read It',  sub:'binary → decimal' },
    { id:'write',   label:'✏️ Write It', sub:'decimal → binary' },
    { id:'blitz',   label:'⚡ Blitz',    sub:'60-sec speed run' }
  ];
  document.getElementById('mode-nav').innerHTML = modes.map(function (m) {
    return '<button class="nav-btn" id="nb-'+m.id+'" onclick="G.setMode(\''+m.id+'\')">'
      + m.label + '<span class="sub">'+m.sub+'</span></button>';
  }).join('');
};

G.setMode = function (id) {
  G.stopAllTimers();
  G.mode = id;
  document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.remove('active'); });
  var nb = document.getElementById('nb-'+id);
  if (nb) nb.classList.add('active');
  var area = document.getElementById('game-area');
  switch (id) {
    case 'explore': G.renderExplore(area); break;
    case 'read':    G.renderReadStart(area); break;
    case 'write':   G.renderWriteStart(area); break;
    case 'blitz':   G.renderBlitzStart(area); break;
  }
};

G.stopAllTimers = function () {
  if (G.Q.timerRef) { clearInterval(G.Q.timerRef); G.Q.timerRef = null; }
  if (G.BZ.timerRef) { clearInterval(G.BZ.timerRef); G.BZ.timerRef = null; }
  G.BZ.active = false;
};

// ── Bit utilities ──────────────────────────────────────
G.bv = function () {
  var v = 0;
  for (var i = 0; i < 8; i++) v += G.bits[i] * G.BV[i];
  return v;
};

G.setBits = function (n) {
  for (var i = 0; i < 8; i++) G.bits[i] = (n >> (7-i)) & 1;
};

G.clearBits = function () { G.bits = [0,0,0,0,0,0,0,0]; };

G.rnd = function (maxVal) { return Math.floor(Math.random() * (maxVal + 1)); };

G.hex = function (n) {
  return '0x' + n.toString(16).toUpperCase().padStart(2, '0');
};

G.binStr = function (bits, nbits) {
  var s = bits.slice(8 - nbits).join('');
  // insert space in the middle for 8-bit
  if (nbits === 8) return s.slice(0,4) + ' ' + s.slice(4);
  return s;
};

G.ascii = function (n) {
  if (n >= 32 && n <= 126) return '"' + String.fromCharCode(n) + '"';
  if (n === 10) return '"\\n"';
  if (n === 9)  return '"\\t"';
  if (n === 0)  return '"NUL"';
  return null;
};

G.grade = function (pct) {
  if (pct >= 0.95) return '🏆';
  if (pct >= 0.80) return '⭐';
  if (pct >= 0.60) return '👍';
  return '📚';
};

// ── Toggle bit (user click) ────────────────────────────
G.tb = function (i) {
  if (G.locked) return;
  G.bits[i] ^= 1;
  var btn = document.getElementById('b'+i);
  if (btn) {
    btn.textContent = G.bits[i];
    btn.className = 'bit-btn ' + (G.bits[i] ? 'on' : 'off');
    btn.classList.add('anim-pop');
    setTimeout(function () { if (btn) btn.classList.remove('anim-pop'); }, 300);
  }
  G.onBitsChange();
};

G.onBitsChange = function () {
  if (G.mode === 'explore') { G.updateExploreTotal(); G.checkExploreChallenge(); }
  if (G.mode === 'write')   { G.checkWrite(); }
  if (G.mode === 'blitz' && G.BZ.type === 'write') { G.checkBlitzWrite(); }
};

// ── Build bit row HTML ─────────────────────────────────
// nbits: 4 or 8. locked: boolean.
G.makeBitRow = function (nbits, locked) {
  var start = 8 - nbits; // first active index
  var lockCls = locked ? ' locked' : '';

  function makeBit(i) {
    var active = i >= start;
    var v = active ? G.bits[i] : 0;
    var bv = G.BV[i];
    var cls = 'bit-btn ' + (active && v ? 'on' : 'off') + (locked || !active ? ' locked' : '');
    var click = (locked || !active) ? '' : ' onclick="G.tb('+i+')"';
    return '<div class="bit">'
      + '<div class="bit-top">' + (active ? bv : '') + '</div>'
      + '<button id="b'+i+'" class="'+cls+'"'+click+'>'+(active ? v : '')+'</button>'
      + '<div class="bit-bot">' + (active ? '2<sup>'+(7-i)+'</sup>' : '') + '</div>'
      + '</div>';
  }

  if (nbits === 4) {
    // Show only 4 bits (indices 4-7)
    var html = '<div class="bit-row">';
    html += '<div class="bit-group">';
    for (var i = 4; i < 8; i++) html += makeBit(i);
    html += '</div></div>';
    return html;
  }

  // 8 bits in two groups
  var html = '<div class="bit-row">';
  html += '<div class="bit-group">';
  for (var i = 0; i < 4; i++) html += makeBit(i);
  html += '</div>';
  html += '<div class="bit-sep">·</div>';
  html += '<div class="bit-group">';
  for (var i = 4; i < 8; i++) html += makeBit(i);
  html += '</div>';
  html += '</div>';
  return html;
};

// ── EXPLORE MODE ───────────────────────────────────────
G.renderExplore = function (area) {
  G.locked = false;
  G.clearBits();
  if (G.EX.target === null) G.EX.target = G.rnd(255);

  area.innerHTML = ''
    + '<div class="explainer">'
    + 'Each circle is a <strong>bit</strong>. The number above it is its value — a power of 2. '
    + 'Click bits to flip them on/off. The total below updates live.'
    + '</div>'
    + G.makeBitRow(8, false)
    + '<div class="total-box">'
    + '  <div class="total-dec" id="ex-dec">0</div>'
    + '  <div class="total-row">'
    + '    <span class="label-hex"  id="ex-hex">0x00</span>'
    + '    <span class="sep">·</span>'
    + '    <span class="label-bin"  id="ex-bin">0000 0000</span>'
    + '    <span class="sep" id="ex-char-sep">·</span>'
    + '    <span class="label-char" id="ex-char"></span>'
    + '  </div>'
    + '</div>'
    + '<div class="explore-ctrl">'
    + '  <button class="btn btn-ghost btn-sm" onclick="G.exploreRandom()">Random</button>'
    + '  <button class="btn btn-ghost btn-sm" onclick="G.exploreClear()">Clear all</button>'
    + '  <div class="challenge-pill">'
    + '    <span class="challenge-lbl">Try making:</span>'
    + '    <span class="challenge-num" id="ex-target">'+G.EX.target+'</span>'
    + '    <button class="btn btn-ghost btn-sm" onclick="G.exploreNewTarget()">New</button>'
    + '  </div>'
    + '</div>';
};

G.updateExploreTotal = function () {
  var n = G.bv();
  var dec = document.getElementById('ex-dec');
  var hex = document.getElementById('ex-hex');
  var bin = document.getElementById('ex-bin');
  var ch  = document.getElementById('ex-char');
  var cs  = document.getElementById('ex-char-sep');
  if (!dec) return;
  dec.textContent = n;
  dec.className = 'total-dec' + (n === 255 ? ' maxed' : '');
  hex.textContent = G.hex(n);
  bin.textContent = G.binStr(G.bits, 8);
  var asc = G.ascii(n);
  if (asc) { ch.textContent = asc; cs.style.display = ''; }
  else      { ch.textContent = '';  cs.style.display = 'none'; }
};

G.checkExploreChallenge = function () {
  var n = G.bv();
  if (n === G.EX.target) {
    // Flash!
    var flash = document.createElement('div');
    flash.className = 'correct-flash';
    document.body.appendChild(flash);
    setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 600);
    // Bounce the number
    var decEl = document.getElementById('ex-dec');
    if (decEl) { decEl.classList.add('anim-pop'); setTimeout(function(){decEl.classList.remove('anim-pop');}, 300); }
    // New target after a moment
    setTimeout(function () { G.EX.target = G.rnd(255); var t = document.getElementById('ex-target'); if (t) t.textContent = G.EX.target; }, 800);
  }
};

G.exploreRandom = function () {
  var n = G.rnd(255);
  G.setBits(n);
  G.rebuildBits(8);
  G.updateExploreTotal();
  G.checkExploreChallenge();
};

G.exploreClear = function () {
  G.clearBits();
  G.rebuildBits(8);
  G.updateExploreTotal();
};

G.exploreNewTarget = function () {
  G.EX.target = G.rnd(255);
  var t = document.getElementById('ex-target');
  if (t) t.textContent = G.EX.target;
};

// Rebuilds all bit buttons in-place (when state changes externally)
G.rebuildBits = function (nbits) {
  var start = 8 - nbits;
  for (var i = 0; i < 8; i++) {
    var btn = document.getElementById('b'+i);
    if (!btn) continue;
    if (i < start) continue;
    btn.textContent = G.bits[i];
    btn.className = 'bit-btn ' + (G.bits[i] ? 'on' : 'off') + (G.locked ? ' locked' : '');
  }
};

// ── READ MODE — Difficulty picker ─────────────────────
G.renderReadStart = function (area) {
  G.locked = true;
  area.innerHTML = ''
    + '<div class="mode-intro anim-in">'
    + '<div class="intro-big">👁</div>'
    + '<h2>Read It</h2>'
    + '<p>Binary bits will be shown. Type the decimal value. '
    + 'Faster answers earn more points. 10 questions per round.</p>'
    + '<div class="diff-grid">'
    + G.diffCard('r4', 'Easy',   '0 – 15',   '4 bits · 10 sec / Q', 'easy',   function(){ G.startQuiz('read',4,15,10); })
    + G.diffCard('r7', 'Medium', '0 – 127',  '8 bits · 10 sec / Q', 'medium', function(){ G.startQuiz('read',8,127,10); })
    + G.diffCard('r8', 'Hard',   '0 – 255',  '8 bits · 7 sec / Q',  'hard',   function(){ G.startQuiz('read',8,255,7); })
    + '</div>'
    + '</div>';

  // Wire up click handlers
  document.getElementById('dc-r4').onclick = function(){ G.startQuiz('read',4,15,10); };
  document.getElementById('dc-r7').onclick = function(){ G.startQuiz('read',8,127,10); };
  document.getElementById('dc-r8').onclick = function(){ G.startQuiz('read',8,255,7); };
};

G.diffCard = function (hiKey, title, range, detail, tier, fn) {
  var tagCls = 'tag-'+tier;
  var hiVal = G.hi[hiKey] || 0;
  return '<div class="diff-card" id="dc-'+hiKey+'">'
    + '<div class="tag '+tagCls+'">'+tier.toUpperCase()+'</div>'
    + '<h3>'+title+'</h3>'
    + '<div class="range">'+range+'</div>'
    + '<p>'+detail+'</p>'
    + '<div class="hi-label">Best: <span>'+hiVal+'</span></div>'
    + '</div>';
};

// ── QUIZ — shared for Read & Write ────────────────────
G.startQuiz = function (mode, nbits, maxVal, timeLimit) {
  G.Q.mode = mode;
  G.Q.nbits = nbits;
  G.Q.maxVal = maxVal;
  G.Q.timeLimit = timeLimit;
  G.Q.idx = 0;
  G.Q.score = 0;
  G.Q.streak = 0;
  G.Q.answered = false;
  G.Q.history = [];
  G.clearBits();
  G.nextQuestion();
};

G.nextQuestion = function () {
  G.Q.idx++;
  if (G.Q.idx > G.Q.total) { G.showResults(); return; }

  // Pick a target, avoid repeating the same value twice in a row
  var prev = G.Q.history.length ? G.Q.history[G.Q.history.length-1].target : -1;
  do { G.Q.target = G.rnd(G.Q.maxVal); } while (G.Q.target === prev && G.Q.maxVal > 1);

  G.Q.answered = false;
  G.Q.timePct = 1;
  G.clearBits();

  if (G.Q.mode === 'read') {
    G.setBits(G.Q.target);
    G.locked = true;
    G.renderReadQuestion();
  } else {
    G.locked = false;
    G.renderWriteQuestion();
  }

  // Start timer
  if (G.Q.timerRef) clearInterval(G.Q.timerRef);
  G.Q.timerStart = Date.now();
  var interval = 80;
  G.Q.timerRef = setInterval(function () {
    if (G.Q.answered) return;
    var elapsed = (Date.now() - G.Q.timerStart) / 1000;
    G.Q.timePct = Math.max(0, 1 - elapsed / G.Q.timeLimit);
    var fill = document.getElementById('q-timer');
    if (fill) {
      fill.style.width = (G.Q.timePct * 100) + '%';
      fill.className = 'timer-fill' + (G.Q.timePct < 0.25 ? ' hot' : '');
    }
    if (G.Q.timePct <= 0) {
      G.Q.answered = true;
      clearInterval(G.Q.timerRef);
      G.Q.timerRef = null;
      if (G.Q.mode === 'read') G.resolveRead(NaN, true);
      else G.resolveWrite(true);
    }
  }, interval);
};

// ── READ QUESTION ──────────────────────────────────────
G.renderReadQuestion = function () {
  var area = document.getElementById('game-area');
  area.innerHTML = ''
    + G.quizTopHTML()
    + '<div class="timer-track"><div class="timer-fill" id="q-timer" style="width:100%"></div></div>'
    + '<div class="q-prompt">What is the decimal value of this binary number?</div>'
    + '<div class="q-binary" id="q-bin-disp">' + G.binStr(G.bits, G.Q.nbits) + '</div>'
    + G.makeBitRow(G.Q.nbits, true)
    + '<div class="answer-row">'
    + '  <input class="ans-input" id="q-inp" type="number" min="0" max="255" placeholder="?" autocomplete="off" autofocus>'
    + '  <button class="btn btn-primary" onclick="G.submitRead()">Submit</button>'
    + '</div>'
    + '<div class="feedback-line" id="q-fb"></div>';

  var inp = document.getElementById('q-inp');
  if (inp) inp.addEventListener('keydown', function(e){ if(e.key==='Enter') G.submitRead(); });
  setTimeout(function(){ var i = document.getElementById('q-inp'); if(i) i.focus(); }, 50);
};

G.submitRead = function () {
  if (G.Q.answered) return;
  var inp = document.getElementById('q-inp');
  if (!inp) return;
  var val = parseInt(inp.value, 10);
  if (isNaN(val) || inp.value.trim() === '') return;
  G.Q.answered = true;
  clearInterval(G.Q.timerRef); G.Q.timerRef = null;
  G.resolveRead(val, false);
};

G.resolveRead = function (got, timedOut) {
  var target = G.Q.target;
  var correct = !timedOut && got === target;
  var elapsed = (Date.now() - G.Q.timerStart) / 1000;
  var pts = 0;
  if (correct) {
    var timeBonus = Math.round(G.Q.timePct * 80);
    var streakBonus = G.Q.streak * 10;
    pts = 20 + timeBonus + streakBonus;
    G.Q.streak++;
    G.Q.score += pts;
  } else {
    G.Q.streak = 0;
  }

  G.Q.history.push({ target: target, got: timedOut ? '—' : got, correct: correct, pts: pts, time: elapsed.toFixed(1) });

  // UI feedback
  var fb = document.getElementById('q-fb');
  var inp = document.getElementById('q-inp');
  if (inp) { inp.className = 'ans-input ' + (correct ? 'correct' : 'wrong'); inp.disabled = true; }
  if (fb) {
    if (timedOut) { fb.textContent = '⏱ Time! Answer: ' + target; fb.className = 'feedback-line err'; }
    else if (correct) { fb.textContent = '+' + pts + ' pts' + (G.Q.streak > 1 ? '  🔥 ×'+G.Q.streak : ''); fb.className = 'feedback-line ok'; }
    else { fb.textContent = '✗  Answer: ' + target; fb.className = 'feedback-line err'; }
  }
  G.updateQuizTop();

  if (!correct && !timedOut && inp) {
    inp.classList.add('anim-shake');
    setTimeout(function(){ if(inp) inp.classList.remove('anim-shake'); }, 400);
  }
  if (correct) {
    var flash = document.createElement('div'); flash.className = 'correct-flash';
    document.body.appendChild(flash);
    setTimeout(function(){ if(flash.parentNode) flash.parentNode.removeChild(flash); }, 600);
  }

  setTimeout(function () { G.nextQuestion(); }, correct ? 900 : 1400);
};

// ── WRITE QUESTION ─────────────────────────────────────
G.renderWriteStart = function (area) {
  G.locked = false;
  area.innerHTML = ''
    + '<div class="mode-intro anim-in">'
    + '<div class="intro-big">✏️</div>'
    + '<h2>Write It</h2>'
    + '<p>A decimal number will appear. Click the bits to match it. '
    + 'It auto-checks the moment you hit the right combination.</p>'
    + '<div class="diff-grid">'
    + G.diffCard('w4', 'Easy',   '0 – 15',   '4 bits · 15 sec / Q', 'easy',   null)
    + G.diffCard('w7', 'Medium', '0 – 127',  '8 bits · 15 sec / Q', 'medium', null)
    + G.diffCard('w8', 'Hard',   '0 – 255',  '8 bits · 12 sec / Q', 'hard',   null)
    + '</div>'
    + '</div>';
  document.getElementById('dc-w4').onclick = function(){ G.startQuiz('write',4,15,15); };
  document.getElementById('dc-w7').onclick = function(){ G.startQuiz('write',8,127,15); };
  document.getElementById('dc-w8').onclick = function(){ G.startQuiz('write',8,255,12); };
};

G.renderWriteQuestion = function () {
  var area = document.getElementById('game-area');
  area.innerHTML = ''
    + G.quizTopHTML()
    + '<div class="timer-track"><div class="timer-fill" id="q-timer" style="width:100%"></div></div>'
    + '<div class="write-target">'
    + '  <div class="write-target-label">Make this number using the bits:</div>'
    + '  <div class="write-target-num" id="q-target">' + G.Q.target + '</div>'
    + '</div>'
    + '<div class="write-progress-label" id="q-cur-val">Current: 0</div>'
    + G.makeBitRow(G.Q.nbits, false)
    + '<div class="feedback-line" id="q-fb"></div>';
};

G.checkWrite = function () {
  if (G.Q.answered || G.mode !== 'write') return;
  var n = G.bv();
  // Update the live value display
  var cv = document.getElementById('q-cur-val');
  if (cv) cv.textContent = 'Current: ' + n + ' (' + G.binStr(G.bits, G.Q.nbits) + ')';

  if (n === G.Q.target) {
    G.Q.answered = true;
    clearInterval(G.Q.timerRef); G.Q.timerRef = null;
    G.resolveWrite(false);
  }
};

G.resolveWrite = function (timedOut) {
  var target = G.Q.target;
  var correct = !timedOut;
  var elapsed = (Date.now() - G.Q.timerStart) / 1000;
  var pts = 0;
  if (correct) {
    var timeBonus = Math.round(G.Q.timePct * 80);
    var streakBonus = G.Q.streak * 10;
    pts = 20 + timeBonus + streakBonus;
    G.Q.streak++;
    G.Q.score += pts;
  } else {
    G.Q.streak = 0;
  }

  G.Q.history.push({ target: target, got: timedOut ? '—' : G.bv(), correct: correct, pts: pts, time: elapsed.toFixed(1) });

  var fb = document.getElementById('q-fb');
  if (fb) {
    if (timedOut) {
      fb.textContent = '⏱ Time! The answer was ' + G.binStr(G.decimalToBits(target), G.Q.nbits);
      fb.className = 'feedback-line err';
    } else {
      fb.textContent = '✓ Correct! +' + pts + ' pts' + (G.Q.streak > 1 ? '  🔥 ×'+G.Q.streak : '');
      fb.className = 'feedback-line ok';
    }
  }
  G.updateQuizTop();

  if (correct) {
    var flash = document.createElement('div'); flash.className = 'correct-flash';
    document.body.appendChild(flash);
    setTimeout(function(){ if(flash.parentNode) flash.parentNode.removeChild(flash); }, 600);
    G.locked = true;
    G.rebuildBits(G.Q.nbits);
  } else {
    // Show the answer
    G.setBits(target);
    G.locked = true;
    G.rebuildBits(G.Q.nbits);
  }

  setTimeout(function () { G.nextQuestion(); }, correct ? 900 : 1600);
};

G.decimalToBits = function (n) {
  var b = [0,0,0,0,0,0,0,0];
  for (var i = 0; i < 8; i++) b[i] = (n >> (7-i)) & 1;
  return b;
};

// ── QUIZ RESULTS ───────────────────────────────────────
G.showResults = function () {
  if (G.Q.timerRef) { clearInterval(G.Q.timerRef); G.Q.timerRef = null; }
  var score = G.Q.score;
  var maxPossible = G.Q.total * (20 + 80 + G.Q.total * 10); // rough max
  var pct = G.Q.history.filter(function(h){return h.correct;}).length / G.Q.total;
  var grade = G.grade(pct);

  // Save high score
  var hiKey = (G.Q.mode === 'read' ? 'r' : 'w') + (G.Q.maxVal === 15 ? '4' : G.Q.maxVal === 127 ? '7' : '8');
  var isNew = score > (G.hi[hiKey] || 0);
  if (isNew) { G.hi[hiKey] = score; G.saveHi(); }

  var rows = G.Q.history.map(function(h, i){
    var bStr = G.binStr(G.decimalToBits(h.target), G.Q.nbits);
    return '<tr class="'+(h.correct?'ok':'err')+'">'
      + '<td>' + (i+1) + '</td>'
      + '<td>' + h.target + '</td>'
      + '<td>' + bStr + '</td>'
      + '<td>' + (h.correct ? '+'+h.pts+' pts' : '✗') + '</td>'
      + '<td>' + h.time + 's</td>'
      + '</tr>';
  }).join('');

  var area = document.getElementById('game-area');
  area.innerHTML = '<div class="results-wrap anim-in">'
    + '<div class="results-grade">'+grade+'</div>'
    + '<div class="results-pts">'+score+'</div>'
    + '<div class="results-sub">'+ Math.round(pct*100) +'% correct'
    + (isNew ? ' &nbsp;·&nbsp; <span style="color:var(--warn)">🏅 New Best!</span>' : '')
    + '</div>'
    + '<table class="results-tbl">'
    + '<tr><th>#</th><th>Target</th><th>Binary</th><th>Points</th><th>Time</th></tr>'
    + rows
    + '</table>'
    + '<div class="results-btns">'
    + '<button class="btn btn-primary" onclick="G.startQuiz(\''+G.Q.mode+'\','+G.Q.nbits+','+G.Q.maxVal+','+G.Q.timeLimit+')">Play Again</button>'
    + '<button class="btn btn-ghost" onclick="G.setMode(\''+G.Q.mode+'\')">Change Difficulty</button>'
    + '</div>'
    + '</div>';
};

// ── QUIZ TOP BAR (shared) ──────────────────────────────
G.quizTopHTML = function () {
  return '<div class="quiz-top">'
    + '<div class="quiz-progress">Question <strong>' + G.Q.idx + '</strong> / ' + G.Q.total + '</div>'
    + '<div class="quiz-score-lbl" id="q-score">' + G.Q.score + ' pts</div>'
    + '<div class="quiz-streak-lbl" id="q-streak">' + (G.Q.streak > 1 ? '🔥 ×'+G.Q.streak : '') + '</div>'
    + '</div>';
};

G.updateQuizTop = function () {
  var sc = document.getElementById('q-score');
  var st = document.getElementById('q-streak');
  if (sc) sc.textContent = G.Q.score + ' pts';
  if (st) st.textContent = G.Q.streak > 1 ? '🔥 ×'+G.Q.streak : '';
};

// ── BLITZ MODE ─────────────────────────────────────────
G.renderBlitzStart = function (area) {
  area.innerHTML = ''
    + '<div class="mode-intro anim-in">'
    + '<div class="intro-big">⚡</div>'
    + '<h2>Blitz</h2>'
    + '<p>60 seconds. Random mix of read and write questions. '
    + 'Build combos for multipliers. 3 wrong answers and it\'s over.</p>'
    + '<p style="margin-top:-16px;"><strong style="color:var(--warn)">8-bit, 0–255, no time limit per question.</strong></p>'
    + '<div style="margin-bottom:16px">'
    + '<div class="hi-label">Personal Best: <span style="font-family:\'Courier New\',monospace;color:var(--acc)">'+(G.hi.blitz||0)+'</span></div>'
    + '</div>'
    + '<button class="btn btn-primary" onclick="G.startBlitz()" style="font-size:18px;padding:14px 40px">Start Blitz</button>'
    + '</div>';
};

G.startBlitz = function () {
  G.BZ.active = true;
  G.BZ.timeLeft = 60;
  G.BZ.score = 0;
  G.BZ.streak = 0;
  G.BZ.combo = 1;
  G.BZ.lives = 3;
  G.BZ.correct = 0;
  G.BZ.total = 0;
  G.BZ.answered = false;
  G.clearBits();
  G.locked = false;

  // Start countdown
  if (G.BZ.timerRef) clearInterval(G.BZ.timerRef);
  G.BZ.timerRef = setInterval(function () {
    if (!G.BZ.active) return;
    G.BZ.timeLeft--;
    var tEl = document.getElementById('bz-time');
    if (tEl) {
      tEl.textContent = G.BZ.timeLeft;
      tEl.className = 'blitz-time' + (G.BZ.timeLeft <= 10 ? ' red' : '');
    }
    if (G.BZ.timeLeft <= 0) {
      clearInterval(G.BZ.timerRef); G.BZ.timerRef = null;
      G.BZ.active = false;
      G.blitzGameOver();
    }
  }, 1000);

  G.nextBlitzQuestion();
};

G.nextBlitzQuestion = function () {
  if (!G.BZ.active) return;
  // Alternating read/write, increasingly skewed toward write (more thinking)
  G.BZ.type = (Math.random() < 0.5) ? 'read' : 'write';
  do { G.BZ.target = G.rnd(255); } while (G.BZ.target === (G.Q ? G.Q.target : -1));
  G.BZ.answered = false;
  G.clearBits();

  if (G.BZ.type === 'read') {
    G.setBits(G.BZ.target);
    G.locked = true;
  } else {
    G.locked = false;
  }

  G.renderBlitzQuestion();
};

G.renderBlitzQuestion = function () {
  var area = document.getElementById('game-area');
  var typeLabel = G.BZ.type === 'read'
    ? '<span class="blitz-type-badge badge-read">READ IT</span>'
    : '<span class="blitz-type-badge badge-write">WRITE IT</span>';

  var lives = '';
  for (var i = 0; i < 3; i++) lives += (i < G.BZ.lives ? '❤️' : '🖤');

  var question = '';
  if (G.BZ.type === 'read') {
    question = '<div class="q-prompt">Decimal value?</div>'
      + '<div class="q-binary">' + G.binStr(G.bits, 8) + '</div>'
      + G.makeBitRow(8, true)
      + '<div class="answer-row">'
      + '<input class="ans-input" id="bz-inp" type="number" min="0" max="255" placeholder="?" autocomplete="off">'
      + '<button class="btn btn-primary" onclick="G.submitBlitzRead()">Go</button>'
      + '</div>';
  } else {
    question = '<div class="q-prompt">Click the bits to make:</div>'
      + '<div class="write-target-num" id="bz-target">' + G.BZ.target + '</div>'
      + '<div class="write-progress-label" id="bz-cur">Current: 0</div>'
      + G.makeBitRow(8, false);
  }

  area.innerHTML = ''
    + '<div class="blitz-top">'
    + '  <div class="blitz-time" id="bz-time">' + G.BZ.timeLeft + '</div>'
    + '  <div class="lives" id="bz-lives">' + lives + '</div>'
    + '  <div class="blitz-score-disp" id="bz-score">' + G.BZ.score + '</div>'
    + '</div>'
    + '<div class="timer-track" id="bz-bar-wrap"><div class="timer-fill" id="bz-bar" style="width:'+(G.BZ.timeLeft/60*100)+'%"></div></div>'
    + '<div class="blitz-combo" id="bz-combo">' + (G.BZ.combo > 1 ? '🔥 COMBO ×'+G.BZ.combo : '') + '</div>'
    + '<div class="center" style="margin-bottom:8px">' + typeLabel + '</div>'
    + question
    + '<div class="feedback-line" id="bz-fb"></div>';

  // Update timer bar continuously
  if (G._bzBarRef) clearInterval(G._bzBarRef);
  G._bzBarRef = setInterval(function () {
    var bar = document.getElementById('bz-bar');
    if (bar) bar.style.width = (G.BZ.timeLeft / 60 * 100) + '%';
  }, 200);

  if (G.BZ.type === 'read') {
    var inp = document.getElementById('bz-inp');
    if (inp) { inp.addEventListener('keydown', function(e){ if(e.key==='Enter') G.submitBlitzRead(); }); }
    setTimeout(function(){ var i = document.getElementById('bz-inp'); if(i) i.focus(); }, 50);
  }
};

G.submitBlitzRead = function () {
  if (G.BZ.answered || !G.BZ.active) return;
  var inp = document.getElementById('bz-inp');
  if (!inp) return;
  var val = parseInt(inp.value, 10);
  if (isNaN(val) || inp.value.trim() === '') return;
  G.BZ.answered = true;
  G.BZ.total++;
  var correct = val === G.BZ.target;
  G.resolveBlitz(correct, val);
};

G.checkBlitzWrite = function () {
  if (G.BZ.answered || !G.BZ.active || G.mode !== 'blitz') return;
  var n = G.bv();
  var cv = document.getElementById('bz-cur');
  if (cv) cv.textContent = 'Current: ' + n + ' (' + G.binStr(G.bits, 8) + ')';
  if (n === G.BZ.target) {
    G.BZ.answered = true;
    G.BZ.total++;
    G.resolveBlitz(true, n);
  }
};

G.resolveBlitz = function (correct, got) {
  var fb = document.getElementById('bz-fb');
  var inp = document.getElementById('bz-inp');

  if (correct) {
    G.BZ.streak++;
    G.BZ.combo = Math.min(5, 1 + Math.floor(G.BZ.streak / 2));
    var pts = 10 * G.BZ.combo;
    G.BZ.score += pts;
    G.BZ.correct++;

    if (inp) inp.className = 'ans-input correct';
    if (fb) { fb.textContent = '+'+pts+' pts' + (G.BZ.combo > 1 ? '  ×'+G.BZ.combo : ''); fb.className = 'feedback-line ok'; }

    var flash = document.createElement('div'); flash.className = 'correct-flash';
    document.body.appendChild(flash);
    setTimeout(function(){ if(flash.parentNode) flash.parentNode.removeChild(flash); }, 500);

    // Lock bits so they stay green for a moment
    G.locked = true;
    G.rebuildBits(8);
  } else {
    G.BZ.streak = 0;
    G.BZ.combo = 1;
    G.BZ.lives--;

    if (inp) { inp.className = 'ans-input wrong'; inp.classList.add('anim-shake'); }
    if (fb) { fb.textContent = '✗  Answer: ' + G.BZ.target; fb.className = 'feedback-line err'; }

    var livesEl = document.getElementById('bz-lives');
    if (livesEl) {
      var l = '';
      for (var i = 0; i < 3; i++) l += (i < G.BZ.lives ? '❤️' : '🖤');
      livesEl.innerHTML = l;
    }

    if (G.BZ.lives <= 0) {
      setTimeout(function () {
        clearInterval(G.BZ.timerRef); G.BZ.timerRef = null;
        G.BZ.active = false;
        G.blitzGameOver();
      }, 1000);
      return;
    }
  }

  var sc = document.getElementById('bz-score');
  if (sc) sc.textContent = G.BZ.score;
  var co = document.getElementById('bz-combo');
  if (co) co.textContent = G.BZ.combo > 1 ? '🔥 COMBO ×'+G.BZ.combo : '';

  setTimeout(function () {
    if (!G.BZ.active) return;
    G.nextBlitzQuestion();
  }, correct ? 700 : 1200);
};

G.blitzGameOver = function () {
  if (G._bzBarRef) { clearInterval(G._bzBarRef); G._bzBarRef = null; }
  var score = G.BZ.score;
  var isNew = score > (G.hi.blitz || 0);
  if (isNew) { G.hi.blitz = score; G.saveHi(); }

  var acc = G.BZ.total > 0 ? Math.round(G.BZ.correct / G.BZ.total * 100) : 0;
  var area = document.getElementById('game-area');
  area.innerHTML = '<div class="blitz-over anim-in">'
    + '<h2>⚡ Blitz Over!</h2>'
    + '<div class="blitz-final">'+score+'</div>'
    + (isNew ? '<div class="blitz-new-hi">🏅 New Personal Best!</div>' : '')
    + '<div class="blitz-stats">'
    + G.BZ.correct + ' / ' + G.BZ.total + ' correct &nbsp;·&nbsp; '
    + acc + '% accuracy &nbsp;·&nbsp; '
    + 'Best combo: ×' + Math.min(5, 1 + Math.floor(G.BZ.streak / 2))
    + '</div>'
    + '<div class="results-btns">'
    + '<button class="btn btn-primary" onclick="G.startBlitz()" style="font-size:16px">Play Again</button>'
    + '<button class="btn btn-ghost" onclick="G.setMode(\'explore\')">Explore</button>'
    + '</div>'
    + '</div>';
};

// ── Bootstrap ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function () { G.init(); });
