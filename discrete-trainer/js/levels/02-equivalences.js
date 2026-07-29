// Level 2 — Logical Equivalences
DMT.registerLevel({
  id: 2,
  title: 'Equivalences & Inference',
  whyItMatters: 'Equivalent expressions let you simplify logic; valid inference tells you which conclusions actually follow. Together they are the engine behind proofs and correctness arguments.',
  glossary: ['≡', '∧', '∨', '¬', '→', '↔', 'T', 'F'],
  learn: ''
    + '<h4>"Equivalent" means same truth table</h4>'
    + '<p>Two expressions are <strong>logically equivalent</strong> (written <code class="inline">≡</code>) if they give the same value for <em>every</em> possible input. The expressions might look totally different — what matters is that their truth tables match column-for-column.</p>'

    + '<div class="example"><div class="label">Example</div>'
    + '<code class="inline">¬¬p ≡ p</code> — "not not p" is just p. (Two negatives cancel, like in arithmetic.)'
    + '</div>'

    + '<h4>Equivalences worth memorising</h4>'
    + '<p>You don\'t need to memorise these the first time through. They show up over and over.</p>'

    + '<table class="truth-table"><thead><tr><th>Name</th><th>Equivalence</th></tr></thead><tbody>'
    + '<tr><td>Identity</td><td><code class="inline">p ∧ T ≡ p</code> &nbsp; and &nbsp; <code class="inline">p ∨ F ≡ p</code></td></tr>'
    + '<tr><td>Domination</td><td><code class="inline">p ∨ T ≡ T</code> &nbsp; and &nbsp; <code class="inline">p ∧ F ≡ F</code></td></tr>'
    + '<tr><td>Idempotent</td><td><code class="inline">p ∧ p ≡ p</code> &nbsp; and &nbsp; <code class="inline">p ∨ p ≡ p</code></td></tr>'
    + '<tr><td>Double negation</td><td><code class="inline">¬¬p ≡ p</code></td></tr>'
    + '<tr><td>Commutative</td><td><code class="inline">p ∧ q ≡ q ∧ p</code> &nbsp; and &nbsp; <code class="inline">p ∨ q ≡ q ∨ p</code></td></tr>'
    + '<tr><td>Associative</td><td><code class="inline">(p ∧ q) ∧ r ≡ p ∧ (q ∧ r)</code></td></tr>'
    + '<tr><td>Distributive</td><td><code class="inline">p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)</code></td></tr>'
    + '<tr><td><strong>De Morgan</strong></td><td><code class="inline">¬(p ∧ q) ≡ ¬p ∨ ¬q</code> &nbsp; and &nbsp; <code class="inline">¬(p ∨ q) ≡ ¬p ∧ ¬q</code></td></tr>'
    + '<tr><td>Material implication</td><td><code class="inline">p → q ≡ ¬p ∨ q</code></td></tr>'
    + '<tr><td>Contrapositive</td><td><code class="inline">p → q ≡ ¬q → ¬p</code></td></tr>'
    + '</tbody></table>'

    + '<div class="callout"><div class="label">De Morgan in code</div>'
    + 'De Morgan\'s laws say "negation flips and to or, and flips or to and." In code:<br>'
    + '<code class="inline">!(a && b) === (!a || !b)</code><br>'
    + '<code class="inline">!(a || b) === (!a && !b)</code><br>'
    + 'Useful when you want to invert an "if" condition cleanly.'
    + '</div>'

    + '<h4>How to verify an equivalence</h4>'
    + '<p>Brute force: build the truth table of both sides and check they match in every row. Once you trust the basic equivalences, you can chain them — substitute one for another to rewrite expressions step by step. That\'s the start of <em>proofs</em>.</p>'

    + '<div class="example"><div class="label">Worked example: simplify ¬(¬p ∨ q)</div>'
    + '¬(¬p ∨ q) <br>'
    + '≡ ¬¬p ∧ ¬q  &nbsp; <span class="muted">(De Morgan)</span><br>'
    + '≡ p ∧ ¬q &nbsp; <span class="muted">(double negation)</span>'
    + '</div>'
    + '<h4>From equivalence to valid inference</h4>'
    + '<p>An argument is <strong>valid</strong> when no truth-table row makes every premise true and the conclusion false. For example, <code class="inline">p → q</code> and <code class="inline">p</code> force <code class="inline">q</code>. This rule is called <strong>modus ponens</strong>.</p>'
    + '<p>Truth tables provide a mechanical validity test; the next levels turn these patterns into proof techniques.</p>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Type two expressions. The app builds both truth tables and tells you whether they\'re equivalent.</p>'
      + '<div class="controls-row">'
      +   '<label style="min-width:50px">Left:</label>'
      +   '<input type="text" id="lhs" value="¬(p ∧ q)" style="flex:1; min-width:200px; font-size:15px">'
      + '</div>'
      + '<div class="controls-row">'
      +   '<label style="min-width:50px">Right:</label>'
      +   '<input type="text" id="rhs" value="¬p ∨ ¬q" style="flex:1; min-width:200px; font-size:15px">'
      + '</div>'
      + '<div class="chip-row" style="margin-bottom:12px;">'
      +   ['¬', '∧', '∨', '→', '↔', '(', ')'].map(function (s) {
            return '<button class="chip" data-ins="' + s + '">' + s + '</button>';
          }).join('')
      + '</div>'
      + '<div id="eq-result" class="formula-box"></div>'
      + '<div id="eq-table" style="margin-top:12px"></div>';

    var lhs = container.querySelector('#lhs');
    var rhs = container.querySelector('#rhs');
    var result = container.querySelector('#eq-result');
    var tbl = container.querySelector('#eq-table');
    var lastFocus = lhs;
    lhs.addEventListener('focus', function () { lastFocus = lhs; });
    rhs.addEventListener('focus', function () { lastFocus = rhs; });

    function update() {
      try {
        var astA = DMT.lib.expr.parse(lhs.value);
        var astB = DMT.lib.expr.parse(rhs.value);
        var eq = DMT.lib.expr.equivalent(lhs.value, rhs.value);
        result.innerHTML = eq
          ? '<span style="color:var(--good);font-size:18px;font-weight:600">✓ Equivalent</span> &nbsp; <span class="muted">(both expressions yield the same truth table)</span>'
          : '<span style="color:var(--bad);font-size:18px;font-weight:600">✗ Not equivalent</span> &nbsp; <span class="muted">(at least one row differs)</span>';
        var allVars = {};
        DMT.lib.expr.collectVars(astA).forEach(function (v) { allVars[v] = true; });
        DMT.lib.expr.collectVars(astB).forEach(function (v) { allVars[v] = true; });
        var vars = Object.keys(allVars).sort();
        var n = Math.pow(2, vars.length);
        var html = '<table class="truth-table"><thead><tr>';
        vars.forEach(function (v) { html += '<th>' + v + '</th>'; });
        html += '<th class="target">' + DMT.escapeHtml(lhs.value) + '</th>';
        html += '<th class="target">' + DMT.escapeHtml(rhs.value) + '</th></tr></thead><tbody>';
        for (var i = 0; i < n; i++) {
          var env = {};
          for (var j = 0; j < vars.length; j++) env[vars[j]] = !!(i & (1 << (vars.length - 1 - j)));
          var va = DMT.lib.expr.evaluate(astA, env);
          var vb = DMT.lib.expr.evaluate(astB, env);
          html += '<tr>';
          vars.forEach(function (v) { html += '<td class="' + (env[v] ? 'true' : 'false') + '">' + (env[v] ? 'T' : 'F') + '</td>'; });
          html += '<td class="target ' + (va ? 'true' : 'false') + '">' + (va ? 'T' : 'F') + '</td>';
          html += '<td class="target ' + (vb ? 'true' : 'false') + '">' + (vb ? 'T' : 'F') + '</td>';
          html += '</tr>';
        }
        html += '</tbody></table>';
        tbl.innerHTML = html;
      } catch (e) {
        result.innerHTML = '<span style="color:var(--bad)">' + DMT.escapeHtml(e.message) + '</span>';
        tbl.innerHTML = '';
      }
    }
    lhs.addEventListener('input', update);
    rhs.addEventListener('input', update);
    Array.prototype.forEach.call(container.querySelectorAll('.chip[data-ins]'), function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-ins');
        var t = lastFocus || lhs;
        var pos = t.selectionStart || t.value.length;
        t.value = t.value.slice(0, pos) + s + t.value.slice(t.selectionEnd || pos);
        t.focus();
        t.selectionStart = t.selectionEnd = pos + s.length;
        update();
      });
    });
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Is <code class="inline">p ∧ T</code> logically equivalent to <code class="inline">p</code>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>yes</option><option>no</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'yes') return { correct: true, feedback: 'Right. AND-ing with T leaves the value unchanged. (Identity law.)' };
        return { correct: false, feedback: 'Build the truth table: p=F gives F ∧ T = F = p. p=T gives T ∧ T = T = p. Same in every row → equivalent.' };
      },
      hints: [
        'Try every value of p (just F and T) and compute both sides.',
        'F ∧ T = F. T ∧ T = T. Compare to p.',
        'Both rows match. They are equivalent (this is the "identity law").'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'By De Morgan\'s law, <code class="inline">¬(p ∨ q)</code> is equivalent to which of the following?',
      mountInput: function (c) {
        var opts = ['¬p ∨ ¬q', '¬p ∧ ¬q', 'p ∧ q', '¬(p ∧ q)'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) {
          return '<option value="' + i + '">' + o + '</option>';
        }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'De Morgan: pushing a negation through OR flips it to AND and negates each part.' };
        if (v === 0) return { correct: false, feedback: 'Close — but you didn\'t flip the connective. De Morgan turns OR into AND when distributing the negation.' };
        return { correct: false, feedback: 'De Morgan: ¬(p ∨ q) = ¬p ∧ ¬q. Distribute the ¬ AND flip ∨ to ∧.' };
      },
      hints: [
        'De Morgan distributes the ¬ to each variable.',
        'Distributing ¬ also flips the connective: OR becomes AND, AND becomes OR.',
        '¬(p ∨ q) ≡ ¬p ∧ ¬q.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Premises: <code class="inline">p → q</code>, <code class="inline">q → r</code>, and <code class="inline">¬r</code>. Which conclusion must follow?',
      mountInput: function (c) {
        var opts = ['p', 'q', '¬p', 'r'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'From q → r and ¬r, modus tollens gives ¬q. Then p → q and ¬q give ¬p.' };
        return { correct: false, feedback: 'Work backward from ¬r: q → r forces ¬q, and then p → q forces ¬p.' };
      },
      hints: [
        'Start with the negative fact ¬r and the premise q → r.',
        'Modus tollens gives ¬q. Now combine ¬q with p → q.',
        'A second use of modus tollens gives ¬p.'
      ]
    }
  ]
});
