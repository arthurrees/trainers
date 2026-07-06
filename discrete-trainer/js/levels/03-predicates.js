// Level 3 — Predicates and Quantifiers
DMT.registerLevel({
  id: 3,
  title: 'Predicates & Quantifiers',
  whyItMatters: 'Plain propositions ("Alice is here") are too weak to talk about whole collections. Predicates + quantifiers let you say "every user is logged in" or "some file has the wrong permission" — claims you actually need to make about real systems.',
  glossary: ['∀', '∃', '∈', 'ℕ', 'ℤ', 'T', 'F', '¬'],
  learn: ''
    + '<h4>From propositions to predicates</h4>'
    + '<p>A bare proposition is a statement about a specific thing: "5 is even" (false), "Lansing is in Michigan" (true). A <strong>predicate</strong> is a statement <em>with a blank you can fill in</em> — like a function that returns true/false.</p>'
    + '<div class="example"><div class="label">Predicate examples</div>'
    + '<code class="inline">P(x): "x is even"</code><br>'
    + 'P(4) is true. P(7) is false.<br><br>'
    + '<code class="inline">Q(x, y): "x is older than y"</code><br>'
    + 'A predicate can take more than one argument.'
    + '</div>'
    + '<p>The <strong>domain</strong> is the set of values x is allowed to be. "x is even" only makes sense when x is a number. Common domains:</p>'
    + '<ul>'
    +   '<li><code class="inline">ℕ</code> (naturals): 0, 1, 2, 3, ...</li>'
    +   '<li><code class="inline">ℤ</code> (integers): ..., -2, -1, 0, 1, 2, ...</li>'
    +   '<li><code class="inline">ℝ</code> (reals): every number on the number line.</li>'
    +   '<li>Any set you pick: "the students in this class", "the files in /tmp".</li>'
    + '</ul>'

    + '<h4>The two quantifiers</h4>'
    + '<p>Quantifiers turn a predicate into a single proposition by saying "for how many x" the predicate holds.</p>'

    + '<div class="example"><div class="label">∀ — "for all"</div>'
    + '<code class="inline">∀x ∈ S : P(x)</code> reads <em>"for every x in S, P(x) is true"</em>.<br>'
    + 'It is true exactly when P holds for every single element of S. Even one counterexample makes it false.'
    + '</div>'
    + '<div class="example"><div class="label">∃ — "there exists"</div>'
    + '<code class="inline">∃x ∈ S : P(x)</code> reads <em>"there is at least one x in S where P(x) is true"</em>.<br>'
    + 'It is true if even one element makes P true.'
    + '</div>'

    + '<div class="callout"><div class="label">Programming analogy</div>'
    + '<code class="inline">∀x ∈ list: P(x)</code> is <code class="inline">list.every(P)</code>.<br>'
    + '<code class="inline">∃x ∈ list: P(x)</code> is <code class="inline">list.some(P)</code>.<br>'
    + 'They\'re the same idea.'
    + '</div>'

    + '<h4>Negating a quantifier</h4>'
    + '<p>This trips up everyone the first time. The negation rules:</p>'
    + '<ul>'
    +   '<li><code class="inline">¬(∀x : P(x)) ≡ ∃x : ¬P(x)</code> &nbsp; "not everything is P" = "something is not P"</li>'
    +   '<li><code class="inline">¬(∃x : P(x)) ≡ ∀x : ¬P(x)</code> &nbsp; "no x is P" = "every x fails P"</li>'
    + '</ul>'
    + '<p>Negation flips ∀ to ∃ and vice versa, and pushes the negation onto the predicate.</p>'

    + '<h4>Multiple quantifiers — order matters!</h4>'
    + '<p><code class="inline">∀x ∃y : P(x,y)</code> means "for every x, there is some y" — y can depend on x.<br>'
    + '<code class="inline">∃y ∀x : P(x,y)</code> means "there is some y that works for every x" — much stronger.</p>'
    + '<div class="example"><div class="label">Concrete</div>'
    + '"For every person there is a mother" — <code class="inline">∀p ∃m : isMotherOf(m,p)</code> ✓ true.<br>'
    + '"There is one mother for every person" — <code class="inline">∃m ∀p : isMotherOf(m,p)</code> ✗ false (one mother for everyone? no).'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">A tiny world of objects. Toggle their properties on the left, then a quantified statement on the right tells you if it\'s true in this world.</p>'
      + '<div class="flex-row">'
      +   '<div class="flex-col" style="flex:1;min-width:280px">'
      +     '<strong>The world</strong>'
      +     '<div id="world-grid" class="world-grid"></div>'
      +     '<p class="muted" style="font-size:12px;margin:0">Click a cell to cycle: ⚪ → 🔴 → 🟦 → ⚪. Each can be a circle (○) or square (□) — toggle the shape with right-click or the buttons.</p>'
      +     '<div class="controls-row" id="shape-row"></div>'
      +   '</div>'
      +   '<div class="flex-col" style="flex:1;min-width:280px">'
      +     '<strong>Statement</strong>'
      +     '<div class="controls-row">'
      +       '<select id="quant"><option>∀</option><option>∃</option></select>'
      +       '<span>x :</span>'
      +       '<select id="pred">'
      +         '<option value="red">x is red</option>'
      +         '<option value="blue">x is blue</option>'
      +         '<option value="circle">x is a circle</option>'
      +         '<option value="square">x is a square</option>'
      +         '<option value="redCircle">x is a red circle</option>'
      +       '</select>'
      +     '</div>'
      +     '<div id="qresult" class="formula-box"></div>'
      +   '</div>'
      + '</div>';

    var world = [
      { color: 'red', shape: 'circle' },
      { color: 'blue', shape: 'circle' },
      { color: 'red', shape: 'square' },
      { color: 'blue', shape: 'square' }
    ];
    var grid = container.querySelector('#world-grid');
    var qResult = container.querySelector('#qresult');
    var quant = container.querySelector('#quant');
    var pred = container.querySelector('#pred');

    function emoji(o) {
      var c = (o.color === 'red') ? '🔴' : (o.color === 'blue') ? '🟦' : '⚪';
      var s = (o.shape === 'square') ? '□' : '○';
      return c + ' ' + s;
    }
    function predCheck(o, p) {
      if (p === 'red') return o.color === 'red';
      if (p === 'blue') return o.color === 'blue';
      if (p === 'circle') return o.shape === 'circle';
      if (p === 'square') return o.shape === 'square';
      if (p === 'redCircle') return o.color === 'red' && o.shape === 'circle';
      return false;
    }
    function predLabel(p) {
      var m = { red: 'red', blue: 'blue', circle: 'a circle', square: 'a square', redCircle: 'a red circle' };
      return 'is ' + m[p];
    }

    function render() {
      grid.innerHTML = '';
      world.forEach(function (o, i) {
        var sat = predCheck(o, pred.value);
        var cell = document.createElement('div');
        cell.className = 'world-cell' + (sat ? ' satisfies' : '');
        cell.innerHTML = '<div class="shape">' + emoji(o) + '</div>'
          + '<div class="muted" style="font-size:11px">x' + (i + 1) + '</div>'
          + '<div style="font-size:11px;margin-top:4px">' + (sat ? '<span class="tag yes">satisfies</span>' : '<span class="tag no">no</span>') + '</div>';
        cell.addEventListener('click', function () {
          var order = ['red', 'blue', 'gray'];
          var ix = order.indexOf(o.color);
          o.color = order[(ix + 1) % order.length];
          render();
        });
        cell.addEventListener('contextmenu', function (e) {
          e.preventDefault();
          o.shape = o.shape === 'circle' ? 'square' : 'circle';
          render();
        });
        grid.appendChild(cell);
      });

      var statement = quant.value + ' x : x ' + predLabel(pred.value).slice(3);
      var truth;
      if (quant.value === '∀') truth = world.every(function (o) { return predCheck(o, pred.value); });
      else truth = world.some(function (o) { return predCheck(o, pred.value); });
      qResult.innerHTML = '<div style="font-size:15px;margin-bottom:6px">' + DMT.escapeHtml(statement) + '</div>'
        + (truth
          ? '<span style="color:var(--good);font-weight:600;font-size:18px">TRUE</span> in this world'
          : '<span style="color:var(--bad);font-weight:600;font-size:18px">FALSE</span> in this world');
    }
    quant.addEventListener('change', render);
    pred.addEventListener('change', render);

    var shapeRow = container.querySelector('#shape-row');
    shapeRow.innerHTML = '<span class="muted" style="font-size:12px">Right-click a cell to toggle its shape (○/□).</span>';

    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Domain S = { 2, 4, 6, 8 }. Is the statement <code class="inline">∀x ∈ S : x is even</code> true or false?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>true</option><option>false</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'true') return { correct: true, feedback: 'Every element of {2, 4, 6, 8} is even, so ∀ holds.' };
        return { correct: false, feedback: 'Check each element: 2 even ✓, 4 even ✓, 6 even ✓, 8 even ✓. All four pass, so ∀ is true.' };
      },
      hints: [
        '∀ is true when EVERY element passes the predicate.',
        'Look at each element of {2, 4, 6, 8}. Is each even?',
        'All are even → ∀ is true.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'What is the negation of <code class="inline">∀x : P(x)</code>?',
      mountInput: function (c) {
        var opts = ['∀x : ¬P(x)', '∃x : P(x)', '∃x : ¬P(x)', '¬∃x : P(x)'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) {
          return '<option value="' + i + '">' + o + '</option>';
        }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Negation flips the quantifier (∀ → ∃) and pushes ¬ onto the predicate.' };
        if (v === 0) return { correct: false, feedback: 'You negated the predicate but kept the ∀. The quantifier must flip too.' };
        return { correct: false, feedback: '¬(∀x : P(x)) ≡ ∃x : ¬P(x). "Not everything is P" means "something is not P".' };
      },
      hints: [
        'Saying "not everything is P" means there must be SOMEthing that is not P.',
        'So the new quantifier is ∃, and we negate the predicate.',
        '∃x : ¬P(x).'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Translate the English to symbols:</p><p><em>"Every integer has another integer that is bigger than it."</em></p><p>Domain is ℤ. Pick the closest match.</p>',
      mountInput: function (c) {
        var opts = [
          '∃x ∀y : y > x',
          '∀x ∃y : y > x',
          '∀x ∀y : y > x',
          '∃x ∃y : y > x'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) {
          return '<option value="' + i + '">' + o + '</option>';
        }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: '"For every x, there exists a y bigger than x." y can depend on x — the y for x=5 might be different from the y for x=100.' };
        if (v === 0) return { correct: false, feedback: 'That says "there is one y bigger than every x" — impossible (no biggest integer exists, so no single y works for all x).' };
        return { correct: false, feedback: 'The phrasing "every integer has another" → ∀x. "...that is bigger" → ∃y : y > x. Combined: ∀x ∃y : y > x.' };
      },
      hints: [
        '"Every integer..." starts with ∀.',
        '"...has another integer that is bigger" — for each x, you need to assert the existence of a y. So ∃y comes second.',
        '∀x ∃y : y > x. The y is allowed to depend on x.'
      ]
    }
  ]
});
