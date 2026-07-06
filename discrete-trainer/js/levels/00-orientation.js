// Level 0 — Orientation
DMT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'Discrete math is the math behind every line of code you will ever write — booleans, conditionals, loops, data structures, algorithms. This level is the lay of the land before any of the real machinery.',
  glossary: ['T', 'F', '∧', '∨', '¬', '∀', '∃', '∈', '⊆'],
  learn: ''
    + '<h4>What is "discrete" math?</h4>'
    + '<p><strong>Discrete</strong> means "made of separate, distinct pieces you can count." Whole numbers (1, 2, 3, ...) are discrete. Booleans (true, false) are discrete. Letters in the alphabet are discrete. The opposite is <em>continuous</em> math — calculus, real numbers, smooth curves with infinitely many in-between values.</p>'
    + '<p>You already think discretely every time you write code:</p>'
    + '<ul>'
    +   '<li>An <code class="inline">if</code> statement is a <strong>logical proposition</strong>.</li>'
    +   '<li>An <code class="inline">array</code> or <code class="inline">Set</code> is, well, a <strong>set</strong>.</li>'
    +   '<li>A linked list, a file system, a social network — all <strong>graphs</strong>.</li>'
    +   '<li>"How many distinct passwords are possible?" — <strong>combinatorics</strong>.</li>'
    + '</ul>'
    + '<p>This course gives you the formal language and tools to reason about all of it.</p>'
    + '<div class="callout"><div class="label">Why CS cares</div>'
    + 'Every algorithm proof, database query, type system, and crypto protocol stands on discrete math. Once you have it, things that looked like magic (why does Dijkstra always find the shortest path? why is RSA secure? why does a hash table need a good hash function?) start looking like applied logic.'
    + '</div>'
    + '<h4>The notation you will see</h4>'
    + '<p>Math symbols are just shorthand. Don\'t be intimidated — every one has a plain-English reading. You don\'t need to memorize them right now; the glossary on the right will keep them in front of you as we go.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">∧</span>"and"</div>'
    +   '<div class="symbol-chip"><span class="sym">∨</span>"or"</div>'
    +   '<div class="symbol-chip"><span class="sym">¬</span>"not"</div>'
    +   '<div class="symbol-chip"><span class="sym">→</span>"implies"</div>'
    +   '<div class="symbol-chip"><span class="sym">∀</span>"for all"</div>'
    +   '<div class="symbol-chip"><span class="sym">∃</span>"there exists"</div>'
    +   '<div class="symbol-chip"><span class="sym">∈</span>"is in (a set)"</div>'
    +   '<div class="symbol-chip"><span class="sym">⊆</span>"is a subset of"</div>'
    + '</div>'
    + '<h4>How this app works</h4>'
    + '<p>Every level has three parts:</p>'
    + '<ul>'
    +   '<li><strong>Learn</strong> — short lesson with examples (this section).</li>'
    +   '<li><strong>Play</strong> — sandbox to mess around in. No goal. Click stuff, see what happens.</li>'
    +   '<li><strong>Try</strong> — three puzzles, easy → hard. Hint button when stuck (3 hints per puzzle, last one nearly gives the answer).</li>'
    + '</ul>'
    + '<p>Progress saves automatically. Notes you write in the sidebar save too.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click any symbol to read its plain-English meaning:</p>';
    var symbols = [
      { sym: '∧', name: 'and', desc: 'Both must be true. Like && in code.' },
      { sym: '∨', name: 'or', desc: 'At least one must be true. Like || in code.' },
      { sym: '¬', name: 'not', desc: 'Flips true ↔ false. Like ! in code.' },
      { sym: '→', name: 'implies', desc: '"If this, then that." Only false when the "if" is true and the "then" is false.' },
      { sym: '↔', name: 'if and only if', desc: 'Both true or both false — they always agree.' },
      { sym: '∀', name: 'for all', desc: '"For every possible x..." A claim about everything in the domain.' },
      { sym: '∃', name: 'there exists', desc: '"There is at least one x where..." A claim that something exists.' },
      { sym: '∈', name: 'is an element of', desc: '"5 ∈ {1,3,5,7}" — five is in this set.' },
      { sym: '⊆', name: 'is a subset of', desc: '"{1,3} ⊆ {1,2,3,4}" — every element of the first is also in the second.' },
      { sym: '∪', name: 'union', desc: 'Combine two sets — everything in either one.' },
      { sym: '∩', name: 'intersection', desc: 'Only what is in BOTH sets.' },
      { sym: '∅', name: 'empty set', desc: 'A set with no elements at all.' }
    ];
    var grid = document.createElement('div');
    grid.className = 'chip-row';
    grid.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click any symbol</span>';
    symbols.forEach(function (s) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.style.fontSize = '20px';
      b.textContent = s.sym;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML = '<strong style="font-size:24px;color:var(--accent)">' + s.sym + '</strong> <span class="muted">— "' + s.name + '"</span><br>' + s.desc;
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which symbol means <strong>"and"</strong>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>∨</option><option>∧</option><option>¬</option><option>→</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '∧') return { correct: true, feedback: '∧ is "and". Tip: it points up like a capital "A" with no crossbar.' };
        return { correct: false, feedback: 'Not quite. The wedge that points UP (∧) is "and"; the one pointing down (∨) is "or".' };
      },
      hints: [
        'Imagine the letter A in "And" with the crossbar removed.',
        'It is NOT the down-pointing ∨ — that is "or".',
        'Pick the up-pointing wedge: ∧.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Which of the following are <strong>discrete</strong> (rather than continuous)? Tick all that apply.',
      mountInput: function (c) {
        var items = [
          { label: 'The number of cars in a parking lot', d: true },
          { label: 'The exact temperature outside in degrees Celsius', d: false },
          { label: 'The set of letters in your name', d: true },
          { label: 'The exact reading on a stopwatch', d: false },
          { label: 'The list of friends in your phone', d: true }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.d };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. Things you count one-by-one are discrete; things that take any value in a smooth range are continuous.' };
        return { correct: false, feedback: 'Not quite. Continuous things have infinitely many in-between values (temperature, exact stopwatch time). Discrete things you count: cars, letters, friends.' };
      },
      hints: [
        'A discrete thing has separate, countable pieces.',
        'If a value can be 3.14159265... with no smallest step between values, it is continuous.',
        '"Number of cars", "letters in a name", and "list of friends" are all things you count one at a time.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Translate <code class="inline">∀x ∈ ℕ : x ≥ 0</code> to plain English. Pick the closest match.',
      mountInput: function (c) {
        var opts = [
          'Some natural number is at least 0.',
          'Every natural number is greater than or equal to 0.',
          'There exists a natural number x where x is bigger than 0.',
          'No natural number can be less than 0.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) {
          return '<option value="' + i + '">' + o + '</option>';
        }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: '∀ = "for all", ∈ ℕ = "in the natural numbers", ≥ = "greater than or equal to". So: every natural number is ≥ 0.' };
        if (v === 3) return { correct: false, feedback: 'Close in meaning, but the literal translation should follow the symbols. ∀ is "for every / for all", not "no … is".' };
        return { correct: false, feedback: 'Read symbols left-to-right: ∀ = "for all", x ∈ ℕ = "x in the naturals", " : " = "such that", x ≥ 0 = "x is at least 0".' };
      },
      hints: [
        '∀ means "for all / every". ∃ means "there exists / some".',
        'ℕ is the natural numbers: 0, 1, 2, 3, ...',
        'Reading left to right: "for every x in ℕ, x ≥ 0".'
      ]
    }
  ]
});
