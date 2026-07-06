// main.js — boot, routing, level rendering
(function () {
  var OST = window.OST;
  var levels = OST.levels || [];
  levels.sort(function (a, b) { return a.id - b.id; });

  var state = OST.storage.load();
  var current = Math.min(state.currentLevel || 0, levels.length - 1);

  var levelNav = document.getElementById('level-nav');
  var levelNumber = document.getElementById('level-number');
  var levelTitle = document.getElementById('level-title');
  var levelWhy = document.getElementById('level-why');
  var learnEl = document.getElementById('learn-content');
  var playEl = document.getElementById('play-content');
  var tryEl = document.getElementById('try-content');
  var glossaryEl = document.getElementById('glossary');
  var notesEl = document.getElementById('notes');
  var progressPill = document.getElementById('overall-progress');
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');
  var resetBtn = document.getElementById('reset-btn');

  function renderNav() {
    levelNav.innerHTML = '';
    levels.forEach(function (lvl, i) {
      var b = document.createElement('button');
      b.textContent = lvl.id + '. ' + lvl.title;
      if (i === current) b.classList.add('active');
      if (OST.storage.levelCompleted(lvl.id, lvl.puzzles.length)) b.classList.add('completed');
      b.addEventListener('click', function () { goTo(i); });
      levelNav.appendChild(b);
    });
    var done = 0, total = 0;
    levels.forEach(function (lvl) {
      total += lvl.puzzles.length;
      lvl.puzzles.forEach(function (_, idx) { if (OST.storage.isSolved(lvl.id, idx)) done++; });
    });
    progressPill.textContent = done + ' / ' + total + ' puzzles solved';
  }

  function goTo(idx) {
    if (idx < 0 || idx >= levels.length) return;
    current = idx;
    OST.storage.setCurrentLevel(idx);
    renderLevel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderLevel() {
    var lvl = levels[current];
    levelNumber.textContent = 'LEVEL ' + lvl.id + ' OF ' + (levels.length - 1);
    levelTitle.textContent = lvl.title;
    levelWhy.textContent = lvl.whyItMatters || '';

    learnEl.innerHTML = lvl.learn;

    playEl.innerHTML = '';
    if (typeof lvl.mountPlay === 'function') {
      try { lvl.mountPlay(playEl); }
      catch (e) {
        console.error('mountPlay error:', e);
        playEl.innerHTML = '<div class="muted">Could not load interactive piece. (' + OST.escapeHtml(e.message) + ')</div>';
      }
    } else {
      playEl.innerHTML = '<div class="muted">No sandbox for this level — head to the puzzles below.</div>';
    }

    tryEl.innerHTML = '';
    lvl.puzzles.forEach(function (p, idx) { renderPuzzle(lvl, p, idx, tryEl); });
    OST.glossaryRender(lvl.glossary || [], glossaryEl);
    notesEl.value = OST.storage.getNote(lvl.id) || '';

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === levels.length - 1;
    nextBtn.textContent = (current === levels.length - 1) ? 'Done!' : 'Next →';
    renderNav();
  }

  function renderPuzzle(lvl, puzzle, idx, container) {
    var box = document.createElement('div');
    box.className = 'puzzle';
    var solved = OST.storage.isSolved(lvl.id, idx);

    var header = document.createElement('div');
    header.className = 'puzzle-header';
    header.innerHTML =
      '<span class="difficulty-badge ' + puzzle.difficulty + '">' + puzzle.difficulty + '</span>' +
      '<span class="puzzle-status' + (solved ? ' solved' : '') + '">' +
      (solved ? '✓ Solved' : 'Unsolved') + '</span>';
    box.appendChild(header);

    var prompt = document.createElement('div');
    prompt.className = 'puzzle-prompt';
    prompt.innerHTML = puzzle.prompt;
    box.appendChild(prompt);

    var inputHost = document.createElement('div');
    inputHost.className = 'puzzle-input';
    box.appendChild(inputHost);

    var getValue = function () { return null; };
    if (typeof puzzle.mountInput === 'function') {
      try { getValue = puzzle.mountInput(inputHost) || getValue; }
      catch (e) {
        console.error('mountInput error:', e);
        inputHost.innerHTML = '<div class="muted">Input failed to load.</div>';
      }
    }

    var actions = document.createElement('div');
    actions.className = 'puzzle-actions';
    var checkBtn = document.createElement('button');
    checkBtn.className = 'primary-btn';
    checkBtn.textContent = 'Check answer';
    actions.appendChild(checkBtn);
    OST.hints.mount(actions, puzzle.hints || []);
    box.appendChild(actions);

    var feedback = document.createElement('div');
    feedback.className = 'puzzle-feedback';
    box.appendChild(feedback);

    checkBtn.addEventListener('click', function () {
      var answer;
      try { answer = getValue(); }
      catch (e) {
        feedback.className = 'puzzle-feedback show incorrect';
        feedback.textContent = 'Could not read your answer: ' + e.message;
        return;
      }
      var result;
      try { result = puzzle.check(answer); }
      catch (e) {
        feedback.className = 'puzzle-feedback show incorrect';
        feedback.textContent = 'Error checking answer: ' + e.message;
        return;
      }
      if (result && result.correct) {
        feedback.className = 'puzzle-feedback show correct';
        feedback.innerHTML = '✓ ' + (result.feedback || 'Correct!');
        if (!solved) {
          OST.storage.markSolved(lvl.id, idx);
          solved = true;
          header.querySelector('.puzzle-status').textContent = '✓ Solved';
          header.querySelector('.puzzle-status').classList.add('solved');
          renderNav();
        }
      } else {
        feedback.className = 'puzzle-feedback show incorrect';
        feedback.innerHTML = '✗ ' + ((result && result.feedback) || 'Not quite — try again.');
      }
    });

    container.appendChild(box);
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });
  resetBtn.addEventListener('click', function () {
    if (confirm('Reset all progress and notes? This cannot be undone.')) {
      OST.storage.reset();
      current = 0;
      renderLevel();
    }
  });
  notesEl.addEventListener('input', function () {
    OST.storage.setNote(levels[current].id, notesEl.value);
  });

  if (levels.length === 0) {
    document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif">No levels loaded. Check the console.</div>';
    return;
  }
  renderLevel();
})();
