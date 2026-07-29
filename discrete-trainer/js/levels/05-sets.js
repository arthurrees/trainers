// Level 5 — Sets & Venn diagrams
DMT.registerLevel({
  id: 5,
  title: 'Sets & Venn Diagrams',
  whyItMatters: 'A set is a collection with no duplicates and no order — exactly what a database, a deduplicated list, or a tag system already is. Set operations show up daily: filtering, joining, deduplicating, intersecting permissions.',
  glossary: ['∈', '∉', '⊆', '∪', '∩', '\\', '△', '∅', '|A|'],
  learn: ''
    + '<h4>What is a set?</h4>'
    + '<p>A <strong>set</strong> is an unordered collection of distinct things. Order doesn\'t matter; duplicates collapse. We write sets with curly braces: <code class="inline">{1, 2, 3}</code>.</p>'
    + '<ul>'
    +   '<li><code class="inline">{1, 2, 3} = {3, 1, 2}</code> — order does not matter.</li>'
    +   '<li><code class="inline">{1, 2, 2} = {1, 2}</code> — duplicates collapse.</li>'
    +   '<li><code class="inline">∅</code> or <code class="inline">{}</code> — the empty set, with no elements.</li>'
    + '</ul>'

    + '<h4>Membership and subset</h4>'
    + '<ul>'
    +   '<li><code class="inline">x ∈ A</code> — "x is in A".</li>'
    +   '<li><code class="inline">x ∉ A</code> — "x is not in A".</li>'
    +   '<li><code class="inline">A ⊆ B</code> — "A is a subset of B": every element of A is also in B.</li>'
    + '</ul>'

    + '<h4>The four core operations</h4>'
    + '<table class="truth-table"><thead><tr><th>Operation</th><th>Symbol</th><th>Means</th><th>Code analogue</th></tr></thead><tbody>'
    + '<tr><td>Union</td><td>A ∪ B</td><td>everything in A, B, or both</td><td><code class="inline">new Set([...a, ...b])</code></td></tr>'
    + '<tr><td>Intersection</td><td>A ∩ B</td><td>only what is in <em>both</em></td><td><code class="inline">a.filter(x => b.has(x))</code></td></tr>'
    + '<tr><td>Difference</td><td>A \\ B</td><td>in A but not in B</td><td><code class="inline">a.filter(x => !b.has(x))</code></td></tr>'
    + '<tr><td>Symmetric diff</td><td>A △ B</td><td>in one but not both</td><td><code class="inline">(A∪B) \\ (A∩B)</code></td></tr>'
    + '</tbody></table>'

    + '<div class="example"><div class="label">Worked example</div>'
    + 'A = {1, 2, 3, 4}, B = {3, 4, 5, 6}<br>'
    + 'A ∪ B = {1, 2, 3, 4, 5, 6}<br>'
    + 'A ∩ B = {3, 4}<br>'
    + 'A \\ B = {1, 2}<br>'
    + 'A △ B = {1, 2, 5, 6}'
    + '</div>'

    + '<h4>Cardinality</h4>'
    + '<p><code class="inline">|A|</code> is the number of elements in A. <code class="inline">|{a, b, c}| = 3</code>. <code class="inline">|∅| = 0</code>.</p>'

    + '<div class="callout"><div class="label">Inclusion–exclusion</div>'
    + 'For two sets: <code class="inline">|A ∪ B| = |A| + |B| - |A ∩ B|</code>. (You\'d double-count the overlap if you didn\'t subtract it.)'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Click each element to move it between the circles. Watch the operation results update live.</p>'
      + '<div class="flex-row">'
      +   '<div style="flex:1;min-width:300px">'
      +     '<strong>Elements (click to cycle: A → B → both → neither):</strong>'
      +     '<div id="elem-grid" class="chip-row" style="margin-top:10px;"></div>'
      +   '</div>'
      +   '<div style="flex:1;min-width:300px">'
      +     '<strong>Live results</strong>'
      +     '<div id="set-live" class="formula-box" style="line-height:1.9"></div>'
      +   '</div>'
      + '</div>';

    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    // 0=neither, 1=A, 2=B, 3=both
    var state = { a: 1, b: 1, c: 3, d: 3, e: 2, f: 2, g: 0, h: 0 };

    var grid = container.querySelector('#elem-grid');
    var live = container.querySelector('#set-live');

    function getA() { return letters.filter(function (x) { return state[x] === 1 || state[x] === 3; }); }
    function getB() { return letters.filter(function (x) { return state[x] === 2 || state[x] === 3; }); }

    function tagFor(s) {
      if (s === 1) return 'A only';
      if (s === 2) return 'B only';
      if (s === 3) return 'A ∩ B';
      return '— neither';
    }
    function colorFor(s) {
      if (s === 1) return '#7ab7ff';
      if (s === 2) return '#a78bfa';
      if (s === 3) return '#fbbf24';
      return '#475569';
    }

    function render() {
      grid.innerHTML = '';
      letters.forEach(function (x) {
        var b = document.createElement('button');
        b.className = 'chip';
        b.style.fontSize = '16px';
        b.style.minWidth = '70px';
        b.style.color = colorFor(state[x]);
        b.style.borderColor = colorFor(state[x]);
        b.innerHTML = x + ' <span class="muted" style="font-size:11px">' + tagFor(state[x]) + '</span>';
        b.addEventListener('click', function () {
          state[x] = (state[x] + 1) % 4;
          render();
        });
        grid.appendChild(b);
      });
      var a = getA(), b = getB();
      var ops = DMT.lib.sets;
      live.innerHTML = ''
        + '<div><span class="muted">A&nbsp; =</span> ' + ops.format(a) + '</div>'
        + '<div><span class="muted">B&nbsp; =</span> ' + ops.format(b) + '</div>'
        + '<div><span class="muted">A ∪ B =</span> <span style="color:var(--accent)">' + ops.format(ops.union(a, b)) + '</span></div>'
        + '<div><span class="muted">A ∩ B =</span> <span style="color:var(--accent)">' + ops.format(ops.intersect(a, b)) + '</span></div>'
        + '<div><span class="muted">A \\ B =</span> <span style="color:var(--accent)">' + ops.format(ops.difference(a, b)) + '</span></div>'
        + '<div><span class="muted">B \\ A =</span> <span style="color:var(--accent)">' + ops.format(ops.difference(b, a)) + '</span></div>'
        + '<div><span class="muted">A △ B =</span> <span style="color:var(--accent)">' + ops.format(ops.symDiff(a, b)) + '</span></div>'
        + '<div style="margin-top:6px"><span class="muted">|A| =</span> ' + a.length + ', <span class="muted">|B| =</span> ' + b.length + ', <span class="muted">|A ∪ B| =</span> ' + ops.union(a, b).length + '</div>';
    }
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Let A = {1, 2, 3} and B = {2, 3, 4}. What is <code class="inline">A ∩ B</code>?',
      mountInput: function (c) {
        var opts = ['{1, 2, 3, 4}', '{2, 3}', '{1, 4}', '{1, 2, 3}'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Intersection = elements in BOTH. 2 ∈ A and 2 ∈ B ✓; 3 ∈ A and 3 ∈ B ✓.' };
        if (v === 0) return { correct: false, feedback: 'That\'s the union (everything in either). ∩ wants only what\'s in both.' };
        return { correct: false, feedback: 'A ∩ B keeps only elements in both A and B. Walk through each: 1? only A. 2? both ✓. 3? both ✓. 4? only B.' };
      },
      hints: [
        '∩ is "intersection" — what is in BOTH sets.',
        'Walk through each candidate: 1 (only A), 2 (both), 3 (both), 4 (only B).',
        'Only 2 and 3 are in both sets.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Let A = {1, 2}, B = {1, 2, 3}. Which of the following are true?',
      mountInput: function (c) {
        var items = [
          { label: 'A ⊆ B', t: true },
          { label: 'B ⊆ A', t: false },
          { label: '|A| < |B|', t: true },
          { label: '3 ∈ A', t: false },
          { label: 'A = B', t: false }
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
        if (ok) return { correct: true, feedback: 'Yes. Every element of A is in B (so A ⊆ B) and |A|=2 < |B|=3. But 3 ∉ A and B ⊄ A, so B ⊆ A and A=B are false.' };
        return { correct: false, feedback: 'A ⊆ B is true (1 and 2 are both in B). B ⊆ A is false (3 is not in A). |A|=2, |B|=3. 3 ∉ A. A ≠ B.' };
      },
      hints: [
        'A ⊆ B asks: is every element of A also in B?',
        '|A| means the count of elements in A.',
        'A ⊆ B: yes. B ⊆ A: no (3 is missing from A). |A| < |B|: 2 < 3. 3 ∈ A: no.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Let A = {1, 2, 3, 4, 5}, B = {2, 4, 6, 8}, C = {1, 2}.</p><p>Compute <code class="inline">(A ∪ B) \\ C</code>. Type the answer as a comma-separated list (any order). Example: <code class="inline">3, 4, 5</code></p>',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.style.width = '100%';
        input.placeholder = 'comma-separated, e.g. 3, 4, 5';
        c.appendChild(input);
        return function () { return input.value; };
      },
      check: function (v) {
        if (!/^\s*\d+\s*(,\s*\d+\s*)*$/.test(v)) {
          return { correct: false, feedback: 'Use only a comma-separated list of integers, such as 3, 4, 5.' };
        }
        var got = v.split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(function (n) { return !isNaN(n); });
        var expected = [3, 4, 5, 6, 8];
        var unique = got.filter(function (x, i) { return got.indexOf(x) === i; });
        var ok = got.length === unique.length && got.length === expected.length && expected.every(function (x) { return got.indexOf(x) !== -1; });
        if (ok) return { correct: true, feedback: 'A ∪ B = {1,2,3,4,5,6,8}. Removing C = {1,2} leaves {3, 4, 5, 6, 8}.' };
        return { correct: false, feedback: 'First do A ∪ B = {1,2,3,4,5,6,8}. Then remove the elements of C = {1,2}. Answer: {3, 4, 5, 6, 8}.' };
      },
      hints: [
        'Step 1: compute A ∪ B (combine, no duplicates).',
        'A ∪ B = {1, 2, 3, 4, 5, 6, 8}. Now subtract everything in C = {1, 2}.',
        'Drop 1 and 2: {3, 4, 5, 6, 8}.'
      ]
    }
  ]
});
