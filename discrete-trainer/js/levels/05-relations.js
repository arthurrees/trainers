// Level 5 — Relations & Functions
DMT.registerLevel({
  id: 5,
  title: 'Relations & Functions',
  whyItMatters: 'A relation is just "which pairs of things are connected" — friendships, divisibility, edges in a graph, parent-of in a family tree, equality. Functions are a special tidy kind of relation. Once you see this layer, half the data structures in CS look obvious.',
  glossary: ['reflexive', 'symmetric', 'transitive', 'f: A→B', 'injective', 'surjective', 'bijective'],
  learn: ''
    + '<h4>What is a relation?</h4>'
    + '<p>A <strong>relation</strong> on a set S is a set of <em>pairs</em> from S. We write <code class="inline">x R y</code> to mean "(x, y) is in relation R".</p>'
    + '<div class="example"><div class="label">Examples</div>'
    + '<ul>'
    +   '<li>"is older than" on people — pairs (a, b) where a is older.</li>'
    +   '<li>"= 0 mod 3" on integers — pairs that have the same remainder when divided by 3.</li>'
    +   '<li>"is friends with" on Facebook users.</li>'
    +   '<li>The edges of an undirected graph.</li>'
    + '</ul>'
    + '</div>'

    + '<h4>The three properties</h4>'
    + '<p>For a relation R on a set S, three special properties show up everywhere:</p>'
    + '<ul>'
    +   '<li><strong>Reflexive</strong>: every element relates to itself. <code class="inline">∀x : x R x</code>. (Like "=" — every number equals itself.)</li>'
    +   '<li><strong>Symmetric</strong>: if x R y then y R x. (Like "is married to" — symmetric. "Is older than" — not symmetric.)</li>'
    +   '<li><strong>Transitive</strong>: if x R y and y R z then x R z. (Like "≤" — chains together. "Is friends with" — usually NOT transitive.)</li>'
    + '</ul>'
    + '<div class="callout"><div class="label">Equivalence relation</div>'
    + 'A relation that is reflexive, symmetric, AND transitive is called an <strong>equivalence relation</strong>. It carves the set into clean buckets ("equivalence classes"). Equality and "same-remainder" are the canonical examples.'
    + '</div>'

    + '<h4>Functions</h4>'
    + '<p>A <strong>function</strong> <code class="inline">f: A → B</code> is a special relation: every input <code class="inline">x ∈ A</code> has exactly one output <code class="inline">f(x) ∈ B</code>. (Like a code function: same input always gives same output, no input is missed.)</p>'

    + '<table class="truth-table"><thead><tr><th>Property</th><th>Means</th><th>Picture</th></tr></thead><tbody>'
    + '<tr><td><strong>Injective</strong> (one-to-one)</td><td>Different inputs give different outputs. No collisions.</td><td>No two arrows hit the same target.</td></tr>'
    + '<tr><td><strong>Surjective</strong> (onto)</td><td>Every output in B is hit by some input.</td><td>No target is left untouched.</td></tr>'
    + '<tr><td><strong>Bijective</strong></td><td>Both injective AND surjective — perfect pairing.</td><td>Every input maps to a unique output, and every output is reached.</td></tr>'
    + '</tbody></table>'

    + '<div class="example"><div class="label">Examples on ℤ → ℤ</div>'
    + '<code class="inline">f(x) = x + 1</code> — bijective (every input goes to a unique output, every output is hit).<br>'
    + '<code class="inline">f(x) = 2x</code> — injective (no collisions) but NOT surjective (1, 3, 5 are never outputs).<br>'
    + '<code class="inline">f(x) = x²</code> on ℤ → ℤ — NOT injective (3 and -3 both map to 9), NOT surjective (no negative outputs).'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">A relation on S = {1, 2, 3, 4}. Click a cell to toggle whether (row, col) is in R. Watch which properties hold.</p>'
      + '<div id="rel-grid" style="display:inline-block;background:var(--bg-3);padding:14px;border-radius:8px;border:1px solid var(--border);"></div>'
      + '<div id="rel-info" style="margin-top:14px"></div>'
      + '<div class="controls-row" style="margin-top:10px">'
      +   '<button class="secondary-btn" id="rel-clear">Clear</button>'
      +   '<button class="secondary-btn" id="rel-equiv">Make equivalence (=)</button>'
      +   '<button class="secondary-btn" id="rel-mod2">Make "same parity"</button>'
      + '</div>';
    var n = 4;
    // pairs[i][j] true if i R j
    var pairs = [];
    for (var i = 0; i < n; i++) { pairs.push([]); for (var j = 0; j < n; j++) pairs[i].push(false); }

    var grid = container.querySelector('#rel-grid');
    var info = container.querySelector('#rel-info');

    function checkProps() {
      // reflexive
      var reflex = true;
      for (var i = 0; i < n; i++) if (!pairs[i][i]) { reflex = false; break; }
      // symmetric
      var sym = true;
      for (var i = 0; i < n && sym; i++) for (var j = 0; j < n; j++) if (pairs[i][j] !== pairs[j][i]) { sym = false; break; }
      // transitive
      var trans = true;
      outer: for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) for (var k = 0; k < n; k++) {
        if (pairs[i][j] && pairs[j][k] && !pairs[i][k]) { trans = false; break outer; }
      }
      return { reflexive: reflex, symmetric: sym, transitive: trans, equivalence: reflex && sym && trans };
    }

    function render() {
      var html = '<table style="border-collapse:collapse;font-family:var(--mono)"><tr><td></td>';
      for (var c = 0; c < n; c++) html += '<th style="padding:6px 12px;color:var(--accent)">' + (c + 1) + '</th>';
      html += '</tr>';
      for (var r = 0; r < n; r++) {
        html += '<tr><th style="padding:6px 12px;color:var(--accent)">' + (r + 1) + '</th>';
        for (var c2 = 0; c2 < n; c2++) {
          var on = pairs[r][c2];
          html += '<td data-r="' + r + '" data-c="' + c2 + '" style="border:1px solid var(--border);width:38px;height:38px;text-align:center;cursor:pointer;background:' + (on ? 'var(--accent)' : 'transparent') + ';color:' + (on ? '#0b0d12' : 'var(--text-dim)') + '">' + (on ? '✓' : '') + '</td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      grid.innerHTML = html;
      Array.prototype.forEach.call(grid.querySelectorAll('td[data-r]'), function (td) {
        td.addEventListener('click', function () {
          var r = parseInt(td.getAttribute('data-r'), 10);
          var c = parseInt(td.getAttribute('data-c'), 10);
          pairs[r][c] = !pairs[r][c];
          render();
        });
      });
      var p = checkProps();
      info.innerHTML = ''
        + '<span class="tag ' + (p.reflexive ? 'yes' : 'no') + '">reflexive</span> '
        + '<span class="tag ' + (p.symmetric ? 'yes' : 'no') + '">symmetric</span> '
        + '<span class="tag ' + (p.transitive ? 'yes' : 'no') + '">transitive</span> '
        + (p.equivalence ? '&nbsp; <strong style="color:var(--good)">→ equivalence relation!</strong>' : '');
    }

    container.querySelector('#rel-clear').addEventListener('click', function () {
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) pairs[i][j] = false;
      render();
    });
    container.querySelector('#rel-equiv').addEventListener('click', function () {
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) pairs[i][j] = (i === j);
      render();
    });
    container.querySelector('#rel-mod2').addEventListener('click', function () {
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) pairs[i][j] = ((i + 1) % 2) === ((j + 1) % 2);
      render();
    });

    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'On the set of all integers, the relation "= " (equality) is which of the following? Tick all that apply.',
      mountInput: function (c) {
        var items = [
          { label: 'reflexive', t: true },
          { label: 'symmetric', t: true },
          { label: 'transitive', t: true },
          { label: 'an equivalence relation', t: true }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var ok = v.every(function (b) { return b.picked === b.expected; });
        if (ok) return { correct: true, feedback: 'Equality is the prototypical equivalence relation: x = x (reflexive), x = y → y = x (symmetric), and x = y, y = z → x = z (transitive).' };
        return { correct: false, feedback: 'Equality on integers has all three properties: every number equals itself; if a=b then b=a; if a=b and b=c then a=c. So it\'s an equivalence relation.' };
      },
      hints: [
        'Reflexive: does x = x always hold? Yes.',
        'Symmetric: if x = y, does y = x? Yes.',
        'All three hold → it is an equivalence relation.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Consider the function <code class="inline">f: ℤ → ℤ</code> defined by <code class="inline">f(x) = 2x</code>. Which is true?',
      mountInput: function (c) {
        var opts = [
          'Injective and surjective (bijective).',
          'Injective but not surjective.',
          'Surjective but not injective.',
          'Neither injective nor surjective.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Injective: 2x = 2y forces x = y, no collisions. Not surjective: 1, 3, 5, ... are never outputs (you can\'t get them by doubling an integer).' };
        if (v === 0) return { correct: false, feedback: 'Not surjective: which integer doubles to give 1? There isn\'t one in ℤ. So not all outputs are reached.' };
        if (v === 2) return { correct: false, feedback: 'It IS injective — different inputs always double to different outputs. No collisions.' };
        return { correct: false, feedback: 'Doubling never collides (injective ✓). But odd numbers like 3 are never outputs (not surjective).' };
      },
      hints: [
        'Injective = no two inputs produce the same output. If 2a = 2b, what does that force?',
        'Surjective = every integer in the codomain is hit. Can you find some integer in ℤ that\'s never an output?',
        'Try output 1. Is there an integer x with 2x = 1? No. So not surjective. But injective.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'On {1, 2, 3}, build a relation R that is <strong>reflexive AND symmetric</strong> but <strong>NOT transitive</strong>. Type R as a comma-separated list of pairs in the form <code class="inline">(a,b)</code>. Example: <code class="inline">(1,1), (2,2), (1,2)</code>',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.style.width = '100%';
        input.placeholder = 'e.g. (1,1), (2,2), (3,3), (1,2), (2,1), (2,3), (3,2)';
        c.appendChild(input);
        return function () { return input.value; };
      },
      check: function (v) {
        var pairs = [];
        var re = /\(\s*([123])\s*,\s*([123])\s*\)/g;
        var m;
        while ((m = re.exec(v))) pairs.push([parseInt(m[1], 10), parseInt(m[2], 10)]);
        if (pairs.length === 0) return { correct: false, feedback: 'I couldn\'t find any pairs in your input. Format them like (1,2).' };
        function has(a, b) { return pairs.some(function (p) { return p[0] === a && p[1] === b; }); }
        for (var i = 1; i <= 3; i++) if (!has(i, i)) return { correct: false, feedback: 'Not reflexive — missing (' + i + ',' + i + ').' };
        for (var i = 1; i <= 3; i++) for (var j = 1; j <= 3; j++) if (has(i, j) && !has(j, i)) return { correct: false, feedback: 'Not symmetric — has (' + i + ',' + j + ') but missing (' + j + ',' + i + ').' };
        var transitive = true, witness = null;
        for (var i = 1; i <= 3 && transitive; i++) for (var j = 1; j <= 3 && transitive; j++) for (var k = 1; k <= 3; k++) {
          if (has(i, j) && has(j, k) && !has(i, k)) { transitive = false; witness = [i, j, k]; break; }
        }
        if (transitive) return { correct: false, feedback: 'Your relation IS transitive (it\'s actually an equivalence relation). The puzzle wants reflexive + symmetric but NOT transitive.' };
        return { correct: true, feedback: 'Reflexive ✓, symmetric ✓, but ' + witness[0] + ' R ' + witness[1] + ' and ' + witness[1] + ' R ' + witness[2] + ' do NOT force ' + witness[0] + ' R ' + witness[2] + '. Classic example.' };
      },
      hints: [
        'Reflexive needs (1,1), (2,2), (3,3) — those are forced.',
        'Symmetric: any (a,b) you add forces (b,a). To break transitivity, add two "chains" like 1↔2 and 2↔3 but skip 1↔3.',
        'Try R = { (1,1), (2,2), (3,3), (1,2), (2,1), (2,3), (3,2) }. Then 1 R 2 and 2 R 3 but NOT 1 R 3.'
      ]
    }
  ]
});
