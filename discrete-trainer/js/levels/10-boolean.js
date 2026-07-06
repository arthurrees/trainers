// Level 10 — Trees & Boolean Algebra
DMT.registerLevel({
  id: 10,
  title: 'Trees & Boolean Algebra',
  whyItMatters: 'Trees are the cleanest graphs — file systems, syntax trees, decision trees, search indexes. Boolean algebra is the math of digital circuits and every if-statement; the same simplification rules let you minimize hardware gates and tighten up code.',
  glossary: ['∧', '∨', '¬', '⊕', 'T', 'F'],
  learn: ''
    + '<h4>Trees</h4>'
    + '<p>A <strong>tree</strong> is a graph that is connected and has no cycles. Properties:</p>'
    + '<ul>'
    +   '<li>A tree on n vertices has exactly n − 1 edges.</li>'
    +   '<li>There is exactly one path between any two vertices.</li>'
    +   '<li>Adding any edge creates a cycle. Removing any edge disconnects it.</li>'
    +   '<li>A <strong>leaf</strong> is a vertex of degree 1. Every tree with ≥ 2 vertices has ≥ 2 leaves.</li>'
    + '</ul>'
    + '<div class="callout"><div class="label">Where trees show up</div>'
    + 'File systems, AST (abstract syntax trees), HTML DOM, BSTs, heaps, decision trees, B-trees, tries, segment trees. The whole vocabulary of "parent / child / root / leaf" comes from tree theory.'
    + '</div>'

    + '<h4>Boolean algebra</h4>'
    + '<p>Boolean algebra is propositional logic seen as <em>algebra</em>. Same operators (∧, ∨, ¬), same equivalences from Level 2, but now you treat them like + and × in arithmetic — apply rules to simplify expressions.</p>'

    + '<table class="truth-table"><thead><tr><th>Law</th><th>Form</th></tr></thead><tbody>'
    + '<tr><td>Identity</td><td>p ∧ T = p, &nbsp; p ∨ F = p</td></tr>'
    + '<tr><td>Domination</td><td>p ∨ T = T, &nbsp; p ∧ F = F</td></tr>'
    + '<tr><td>Idempotent</td><td>p ∧ p = p, &nbsp; p ∨ p = p</td></tr>'
    + '<tr><td>Complement</td><td>p ∧ ¬p = F, &nbsp; p ∨ ¬p = T</td></tr>'
    + '<tr><td>Double negation</td><td>¬¬p = p</td></tr>'
    + '<tr><td>De Morgan</td><td>¬(p ∧ q) = ¬p ∨ ¬q</td></tr>'
    + '<tr><td><strong>Absorption</strong></td><td>p ∧ (p ∨ q) = p, &nbsp; p ∨ (p ∧ q) = p</td></tr>'
    + '</tbody></table>'

    + '<div class="example"><div class="label">Worked simplification</div>'
    + '(p ∧ q) ∨ (p ∧ ¬q)<br>'
    + '= p ∧ (q ∨ ¬q) &nbsp; <span class="muted">(distributive law in reverse)</span><br>'
    + '= p ∧ T &nbsp; <span class="muted">(complement)</span><br>'
    + '= p &nbsp; <span class="muted">(identity)</span>'
    + '</div>'

    + '<div class="callout"><div class="label">Why this matters</div>'
    + 'Every digital circuit is a Boolean expression. Minimizing the expression = fewer gates = cheaper, faster hardware. The same simplifications also let you spot redundant logic in code.'
    + '</div>'

    + '<h4>Putting it all together</h4>'
    + '<p>You\'ve walked through the whole arc:</p>'
    + '<ol>'
    +   '<li>Logic — propositions, connectives, truth tables.</li>'
    +   '<li>Equivalences — recognising when two expressions mean the same thing.</li>'
    +   '<li>Predicates and quantifiers — claims about whole sets.</li>'
    +   '<li>Sets — the basic container.</li>'
    +   '<li>Relations and functions — how elements connect.</li>'
    +   '<li>Induction — proving something for infinitely many cases.</li>'
    +   '<li>Counting — how many ways.</li>'
    +   '<li>Pigeonhole and probability — guaranteed collisions and likelihoods.</li>'
    +   '<li>Graphs — the discrete data structure.</li>'
    +   '<li>Trees and Boolean algebra — special graphs and the math of circuits.</li>'
    + '</ol>'
    + '<p>This is the spine of CSE 260. Going in, you\'ll have seen every concept once before — the class will be filling in detail and proving things rigorously, not introducing new vocabulary.</p>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Type a Boolean expression. Click a simplification rule to apply it (the rule only works if the pattern is at the top of the expression). Watch how the expression collapses.</p>'
      + '<div class="controls-row">'
      +   '<label>Expression:</label>'
      +   '<input type="text" id="b-expr" value="(p ∧ q) ∨ (p ∧ ¬q)" style="flex:1; min-width:240px; font-size:15px">'
      +   '<button class="secondary-btn" id="b-reset">Re-parse</button>'
      + '</div>'
      + '<div id="b-tree" class="expr-tree"></div>'
      + '<div style="margin-top:10px"><strong>Simplification rules</strong></div>'
      + '<div class="rule-list" id="b-rules" style="margin-top:6px"></div>'
      + '<div id="b-history" style="margin-top:14px;font-family:var(--mono);font-size:13px"></div>';

    var input = container.querySelector('#b-expr');
    var treeBox = container.querySelector('#b-tree');
    var rules = container.querySelector('#b-rules');
    var history = container.querySelector('#b-history');
    var ast = null;
    var trail = [];

    function format(n) {
      if (!n) return '';
      switch (n.type) {
        case 'true': return 'T';
        case 'false': return 'F';
        case 'var': return n.name;
        case 'not': return '¬' + format(n.v);
        case 'and': return '(' + format(n.l) + ' ∧ ' + format(n.r) + ')';
        case 'or':  return '(' + format(n.l) + ' ∨ ' + format(n.r) + ')';
        case 'xor': return '(' + format(n.l) + ' ⊕ ' + format(n.r) + ')';
        case 'imp': return '(' + format(n.l) + ' → ' + format(n.r) + ')';
        case 'iff': return '(' + format(n.l) + ' ↔ ' + format(n.r) + ')';
      }
    }
    function clone(n) { return JSON.parse(JSON.stringify(n)); }
    function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

    // Try to apply a single rewrite to the WHOLE tree (not subtrees). Returns null if not applicable.
    var ruleDefs = [
      { name: 'Double negation: ¬¬x → x', apply: function (n) {
          if (n.type === 'not' && n.v.type === 'not') return n.v.v;
          return null;
        } },
      { name: 'Identity: x ∧ T → x', apply: function (n) {
          if (n.type === 'and' && n.r.type === 'true') return n.l;
          if (n.type === 'and' && n.l.type === 'true') return n.r;
          return null;
        } },
      { name: 'Identity: x ∨ F → x', apply: function (n) {
          if (n.type === 'or' && n.r.type === 'false') return n.l;
          if (n.type === 'or' && n.l.type === 'false') return n.r;
          return null;
        } },
      { name: 'Domination: x ∨ T → T', apply: function (n) {
          if (n.type === 'or' && (n.l.type === 'true' || n.r.type === 'true')) return { type: 'true' };
          return null;
        } },
      { name: 'Domination: x ∧ F → F', apply: function (n) {
          if (n.type === 'and' && (n.l.type === 'false' || n.r.type === 'false')) return { type: 'false' };
          return null;
        } },
      { name: 'Idempotent: x ∧ x → x', apply: function (n) {
          if (n.type === 'and' && eq(n.l, n.r)) return n.l;
          return null;
        } },
      { name: 'Idempotent: x ∨ x → x', apply: function (n) {
          if (n.type === 'or' && eq(n.l, n.r)) return n.l;
          return null;
        } },
      { name: 'Complement: x ∧ ¬x → F', apply: function (n) {
          if (n.type === 'and' && n.r.type === 'not' && eq(n.l, n.r.v)) return { type: 'false' };
          if (n.type === 'and' && n.l.type === 'not' && eq(n.r, n.l.v)) return { type: 'false' };
          return null;
        } },
      { name: 'Complement: x ∨ ¬x → T', apply: function (n) {
          if (n.type === 'or' && n.r.type === 'not' && eq(n.l, n.r.v)) return { type: 'true' };
          if (n.type === 'or' && n.l.type === 'not' && eq(n.r, n.l.v)) return { type: 'true' };
          return null;
        } },
      { name: 'De Morgan: ¬(x ∧ y) → ¬x ∨ ¬y', apply: function (n) {
          if (n.type === 'not' && n.v.type === 'and') return { type: 'or', l: { type: 'not', v: n.v.l }, r: { type: 'not', v: n.v.r } };
          return null;
        } },
      { name: 'De Morgan: ¬(x ∨ y) → ¬x ∧ ¬y', apply: function (n) {
          if (n.type === 'not' && n.v.type === 'or') return { type: 'and', l: { type: 'not', v: n.v.l }, r: { type: 'not', v: n.v.r } };
          return null;
        } },
      { name: 'Absorption: x ∧ (x ∨ y) → x', apply: function (n) {
          if (n.type === 'and' && n.r.type === 'or' && eq(n.l, n.r.l)) return n.l;
          if (n.type === 'and' && n.r.type === 'or' && eq(n.l, n.r.r)) return n.l;
          if (n.type === 'and' && n.l.type === 'or' && eq(n.r, n.l.l)) return n.r;
          if (n.type === 'and' && n.l.type === 'or' && eq(n.r, n.l.r)) return n.r;
          return null;
        } },
      { name: 'Absorption: x ∨ (x ∧ y) → x', apply: function (n) {
          if (n.type === 'or' && n.r.type === 'and' && eq(n.l, n.r.l)) return n.l;
          if (n.type === 'or' && n.r.type === 'and' && eq(n.l, n.r.r)) return n.l;
          if (n.type === 'or' && n.l.type === 'and' && eq(n.r, n.l.l)) return n.r;
          if (n.type === 'or' && n.l.type === 'and' && eq(n.r, n.l.r)) return n.r;
          return null;
        } },
      { name: 'Distribute (factor): (a ∧ b) ∨ (a ∧ c) → a ∧ (b ∨ c)', apply: function (n) {
          if (n.type === 'or' && n.l.type === 'and' && n.r.type === 'and' && eq(n.l.l, n.r.l)) {
            return { type: 'and', l: n.l.l, r: { type: 'or', l: n.l.r, r: n.r.r } };
          }
          if (n.type === 'or' && n.l.type === 'and' && n.r.type === 'and' && eq(n.l.r, n.r.r)) {
            return { type: 'and', l: n.l.r, r: { type: 'or', l: n.l.l, r: n.r.l } };
          }
          return null;
        } }
    ];

    // Recursive single-rewrite: try each rule on this node, then on left/right/v subtrees, return new node + rule used or null
    function tryRule(node, rule) {
      var attempt = rule.apply(node);
      if (attempt) return attempt;
      var copy = clone(node);
      if (copy.l) {
        var nl = tryRule(copy.l, rule);
        if (nl) { copy.l = nl; return copy; }
      }
      if (copy.r) {
        var nr = tryRule(copy.r, rule);
        if (nr) { copy.r = nr; return copy; }
      }
      if (copy.v) {
        var nv = tryRule(copy.v, rule);
        if (nv) { copy.v = nv; return copy; }
      }
      return null;
    }

    function render() {
      treeBox.textContent = format(ast);
      var html = '';
      ruleDefs.forEach(function (r, i) {
        var probe = tryRule(ast, r);
        var disabled = !probe;
        html += '<button class="rule-btn" data-i="' + i + '"' + (disabled ? ' disabled' : '') + '>' + DMT.escapeHtml(r.name) + '</button>';
      });
      rules.innerHTML = html;
      Array.prototype.forEach.call(rules.querySelectorAll('button[data-i]'), function (b) {
        b.addEventListener('click', function () {
          var i = parseInt(b.getAttribute('data-i'), 10);
          var next = tryRule(ast, ruleDefs[i]);
          if (next) {
            trail.push({ before: format(ast), rule: ruleDefs[i].name });
            ast = next;
            render();
          }
        });
      });
      var hist = '';
      trail.forEach(function (s) { hist += '<div>' + DMT.escapeHtml(s.before) + ' &nbsp;<span class="muted">→ by ' + DMT.escapeHtml(s.rule) + '</span></div>'; });
      hist += '<div style="margin-top:6px;color:var(--accent);font-weight:600">' + DMT.escapeHtml(format(ast)) + '</div>';
      history.innerHTML = hist;
    }

    function reparse() {
      try {
        ast = DMT.lib.expr.parse(input.value);
        trail = [];
        render();
      } catch (e) {
        treeBox.textContent = 'Error: ' + e.message;
        rules.innerHTML = '';
        history.innerHTML = '';
      }
    }

    input.addEventListener('input', reparse);
    container.querySelector('#b-reset').addEventListener('click', reparse);
    reparse();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A graph G has 7 vertices and 6 edges, is connected, and has no cycles. What kind of graph is G?',
      mountInput: function (c) {
        var opts = ['A complete graph', 'A tree', 'A cycle', 'A bipartite graph but not a tree'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Connected + acyclic = tree. The edge count fits the rule |E| = |V| − 1 (6 = 7 − 1).' };
        return { correct: false, feedback: 'Definition of a tree: connected and acyclic. Plus the edge count matches |V|−1: 7 vertices, 6 edges.' };
      },
      hints: [
        'Definition: tree = connected + acyclic.',
        'Also: |E| = |V| − 1 is a hallmark of trees. Here 6 = 7 − 1 ✓.',
        'It\'s a tree.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Simplify <code class="inline">p ∨ (p ∧ q)</code> to its smallest equivalent expression. Type your answer.',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.style.width = '100%';
        input.placeholder = 'try a single variable...';
        c.appendChild(input);
        return function () { return input.value; };
      },
      check: function (v) {
        var clean = v.trim();
        if (!clean) return { correct: false, feedback: 'Type something first.' };
        try {
          if (DMT.lib.expr.equivalent(clean, 'p ∨ (p ∧ q)') && DMT.lib.expr.equivalent(clean, 'p')) {
            if (clean === 'p' || clean === '(p)') return { correct: true, feedback: 'Absorption law: p ∨ (p ∧ q) = p. The "p ∧ q" can\'t make the whole thing true unless p is already true, so p alone covers it.' };
            return { correct: false, feedback: 'Equivalent, but not the simplest form. Try just a single variable.' };
          }
          return { correct: false, feedback: 'Not equivalent to p ∨ (p ∧ q). Build a truth table to compare.' };
        } catch (e) { return { correct: false, feedback: 'Could not parse: ' + e.message }; }
      },
      hints: [
        'Build a truth table for p ∨ (p ∧ q). What does its column look like?',
        'It matches the column for p alone. (Absorption law.)',
        'Answer: p'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Simplify <code class="inline">(p ∧ q) ∨ (p ∧ ¬q)</code> to its simplest form. Type your answer.',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.style.width = '100%';
        input.placeholder = 'simplest equivalent...';
        c.appendChild(input);
        return function () { return input.value; };
      },
      check: function (v) {
        var clean = v.trim();
        if (!clean) return { correct: false, feedback: 'Type something first.' };
        try {
          if (DMT.lib.expr.equivalent(clean, '(p ∧ q) ∨ (p ∧ ¬q)')) {
            if (clean === 'p' || clean === '(p)') return { correct: true, feedback: 'Factor out p: p ∧ (q ∨ ¬q) = p ∧ T = p.' };
            return { correct: false, feedback: 'Equivalent, but not simplest. Factor p out and use complement.' };
          }
          return { correct: false, feedback: 'Not equivalent. Walk through with a truth table.' };
        } catch (e) { return { correct: false, feedback: 'Could not parse: ' + e.message }; }
      },
      hints: [
        'Both terms have a "p ∧" — factor it out using distribution.',
        'p ∧ (q ∨ ¬q). What is q ∨ ¬q?',
        'q ∨ ¬q = T (complement). Then p ∧ T = p (identity). Answer: p.'
      ]
    }
  ]
});
