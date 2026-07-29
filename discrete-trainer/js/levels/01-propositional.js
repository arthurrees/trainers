// Level 1 — Propositional Logic
DMT.registerLevel({
  id: 1,
  title: 'Propositional Logic',
  whyItMatters: 'A proposition is just a statement that is either true or false — exactly like a boolean in code. Every if/while/return-true-or-false in a program is propositional logic in disguise.',
  glossary: ['T', 'F', '∧', '∨', '¬', '→', '↔'],
  learn: ''
    + '<h4>What is a proposition?</h4>'
    + '<p>A <strong>proposition</strong> is a statement that is either <strong>true</strong> or <strong>false</strong>. Nothing else.</p>'
    + '<ul>'
    +   '<li>"5 is odd" — true.</li>'
    +   '<li>"Lansing is the capital of Michigan" — true.</li>'
    +   '<li>"2 + 2 = 5" — false.</li>'
    +   '<li>"What time is it?" — <em>not</em> a proposition. Questions and commands aren\'t true/false.</li>'
    + '</ul>'
    + '<p>We use single letters (<code class="inline">p, q, r, ...</code>) as shorthand. Same idea as a boolean variable in code.</p>'
    + '<div class="example"><div class="label">Programming analogy</div>'
    + '<code class="inline">let p = (user.age >= 18);</code><br>'
    + '<code class="inline">let q = user.hasLicense;</code><br>'
    + '<code class="inline">let canDrive = p && q;</code><br>'
    + 'In math notation that last line is <code class="inline">p ∧ q</code>.'
    + '</div>'

    + '<h4>The five connectives</h4>'
    + '<p>You combine propositions using <strong>connectives</strong>. The five you need:</p>'
    + '<table class="truth-table"><thead><tr><th>Symbol</th><th>Name</th><th>English</th><th>Like in code</th></tr></thead><tbody>'
    + '<tr><td>¬p</td><td>NOT</td><td>"not p"</td><td><code class="inline">!p</code></td></tr>'
    + '<tr><td>p ∧ q</td><td>AND</td><td>"p and q"</td><td><code class="inline">p && q</code></td></tr>'
    + '<tr><td>p ∨ q</td><td>OR</td><td>"p or q" (either or both)</td><td><code class="inline">p || q</code></td></tr>'
    + '<tr><td>p → q</td><td>IMPLIES</td><td>"if p then q"</td><td><code class="inline">!p || q</code></td></tr>'
    + '<tr><td>p ↔ q</td><td>IFF</td><td>"p if and only if q"</td><td><code class="inline">p === q</code></td></tr>'
    + '</tbody></table>'

    + '<h4>Truth tables</h4>'
    + '<p>The way to define a connective precisely is its <strong>truth table</strong> — every possible input combo and the result.</p>'
    + '<p><strong>NOT (¬)</strong> just flips:</p>'
    + '<table class="truth-table"><thead><tr><th>p</th><th>¬p</th></tr></thead>'
    + '<tbody><tr><td class="false">F</td><td class="true">T</td></tr><tr><td class="true">T</td><td class="false">F</td></tr></tbody></table>'

    + '<p><strong>AND (∧)</strong> — true only when both are true:</p>'
    + '<table class="truth-table"><thead><tr><th>p</th><th>q</th><th>p ∧ q</th></tr></thead><tbody>'
    + '<tr><td class="false">F</td><td class="false">F</td><td class="false">F</td></tr>'
    + '<tr><td class="false">F</td><td class="true">T</td><td class="false">F</td></tr>'
    + '<tr><td class="true">T</td><td class="false">F</td><td class="false">F</td></tr>'
    + '<tr><td class="true">T</td><td class="true">T</td><td class="true">T</td></tr>'
    + '</tbody></table>'

    + '<p><strong>OR (∨)</strong> — true when at least one is true:</p>'
    + '<table class="truth-table"><thead><tr><th>p</th><th>q</th><th>p ∨ q</th></tr></thead><tbody>'
    + '<tr><td class="false">F</td><td class="false">F</td><td class="false">F</td></tr>'
    + '<tr><td class="false">F</td><td class="true">T</td><td class="true">T</td></tr>'
    + '<tr><td class="true">T</td><td class="false">F</td><td class="true">T</td></tr>'
    + '<tr><td class="true">T</td><td class="true">T</td><td class="true">T</td></tr>'
    + '</tbody></table>'

    + '<div class="callout"><div class="label">The tricky one — IMPLIES</div>'
    + '<p><code class="inline">p → q</code> reads "if p, then q". The surprising part: it is <strong>only false</strong> when p is true and q is false. If p is false, the whole thing is automatically true (we say "vacuously true").</p>'
    + '<p>Mental model: a promise. "If you do your homework (p), I\'ll buy you ice cream (q)." When is the promise broken? <em>Only</em> when you did your homework AND I did NOT buy ice cream. If you didn\'t do your homework, no promise was tested — it counts as kept.</p>'
    + '</div>'

    + '<table class="truth-table"><thead><tr><th>p</th><th>q</th><th>p → q</th></tr></thead><tbody>'
    + '<tr><td class="false">F</td><td class="false">F</td><td class="true">T</td></tr>'
    + '<tr><td class="false">F</td><td class="true">T</td><td class="true">T</td></tr>'
    + '<tr><td class="true">T</td><td class="false">F</td><td class="false">F</td></tr>'
    + '<tr><td class="true">T</td><td class="true">T</td><td class="true">T</td></tr>'
    + '</tbody></table>'

    + '<p><strong>IFF (↔)</strong> — "p and q have the same value":</p>'
    + '<table class="truth-table"><thead><tr><th>p</th><th>q</th><th>p ↔ q</th></tr></thead><tbody>'
    + '<tr><td class="false">F</td><td class="false">F</td><td class="true">T</td></tr>'
    + '<tr><td class="false">F</td><td class="true">T</td><td class="false">F</td></tr>'
    + '<tr><td class="true">T</td><td class="false">F</td><td class="false">F</td></tr>'
    + '<tr><td class="true">T</td><td class="true">T</td><td class="true">T</td></tr>'
    + '</tbody></table>'

    + '<h4>Building bigger expressions</h4>'
    + '<p>Combine connectives with parentheses. Precedence (tightest first): <strong>¬</strong>, then <strong>∧</strong>, then <strong>∨</strong>, then <strong>→</strong>, then <strong>↔</strong>. When in doubt, parenthesize.</p>'
    + '<div class="example"><div class="label">Example</div>'
    + '<code class="inline">¬p ∧ q → r</code> means <code class="inline">((¬p) ∧ q) → r</code>.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Type any expression — the truth table appears live. Use the buttons below or type symbols directly. Variables are any letter (p, q, r, x, ...).</p>'
      + '<div class="controls-row">'
      +   '<label>Expression:</label>'
      +   '<input type="text" id="expr-in" value="p → q" style="flex:1; min-width:240px; font-size:16px">'
      + '</div>'
      + '<div class="chip-row" style="margin-bottom:12px;">'
      +   ['¬', '∧', '∨', '→', '↔', '(', ')', 'p', 'q', 'r'].map(function (s) {
            return '<button class="chip" data-ins="' + s + '">' + s + '</button>';
          }).join('')
      + '</div>'
      + '<div id="expr-out"></div>'
      + '<p class="muted" style="margin-top:8px;font-size:12px">'
      +   'You can also type <span class="kbd">!</span> for ¬, <span class="kbd">&</span> for ∧, <span class="kbd">|</span> for ∨, <span class="kbd">-&gt;</span> for →, <span class="kbd">&lt;-&gt;</span> for ↔.'
      + '</p>';
    var input = container.querySelector('#expr-in');
    var out = container.querySelector('#expr-out');

    function update() {
      var expr = input.value.trim();
      if (!expr) { out.innerHTML = '<div class="muted">(type an expression)</div>'; return; }
      try {
        out.innerHTML = DMT.lib.expr.renderTruthTable(expr);
      } catch (e) {
        out.innerHTML = '<div class="puzzle-feedback show incorrect">' + DMT.escapeHtml(e.message) + '</div>';
      }
    }
    input.addEventListener('input', update);
    Array.prototype.forEach.call(container.querySelectorAll('.chip[data-ins]'), function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-ins');
        var pos = input.selectionStart || input.value.length;
        var val = input.value;
        input.value = val.slice(0, pos) + s + val.slice(input.selectionEnd || pos);
        input.focus();
        input.selectionStart = input.selectionEnd = pos + s.length;
        update();
      });
    });
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Set <code class="inline">p = T</code> and <code class="inline">q = F</code>. What is the value of <code class="inline">p ∨ ¬q</code>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>T</option><option>F</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'T') return { correct: true, feedback: '¬q = ¬F = T. Then p ∨ T = T ∨ T = T.' };
        return { correct: false, feedback: 'Step through: q = F, so ¬q = T. Then p ∨ T = T (anything OR true is true).' };
      },
      hints: [
        'Start by computing ¬q. q is F, so ¬q is...',
        '¬q = T. Now compute p ∨ (that result).',
        'p = T, ¬q = T. T ∨ T = T.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Build an expression in <code class="inline">p</code> and <code class="inline">q</code> with truth column <strong>F&nbsp;F&nbsp;F&nbsp;T</strong> (rows in order: p=F q=F, p=F q=T, p=T q=F, p=T q=T).',
      mountInput: function (c) {
        var div = document.createElement('div');
        div.innerHTML = '<input type="text" placeholder="e.g. p ∨ q" style="width:100%;font-size:15px;">';
        var input = div.querySelector('input');
        var live = document.createElement('div');
        live.style.marginTop = '8px';
        live.style.fontFamily = 'var(--mono)';
        live.style.fontSize = '13px';
        function update() {
          if (!input.value.trim()) { live.innerHTML = '<span class="muted">target: F F F T</span>'; return; }
          try {
            var ast = DMT.lib.expr.parse(input.value);
            if (!DMT.lib.expr.usesOnlyVars(ast, ['p', 'q'])) { live.innerHTML = '<span style="color:var(--bad)">Use only p and q.</span>'; return; }
            var col = DMT.lib.expr.valueColumn(ast, ['p', 'q']);
            var match = col === 'FFFT';
            live.innerHTML = '<span class="muted">your column:</span> <span style="color:' + (match ? 'var(--good)' : 'var(--accent)') + '">' + col.split('').join(' ') + '</span> &nbsp; <span class="muted">target:</span> <span style="color:var(--good)">F F F T</span>';
          } catch (e) {
            live.innerHTML = '<span style="color:var(--bad)">' + DMT.escapeHtml(e.message) + '</span>';
          }
        }
        input.addEventListener('input', update);
        update();
        div.appendChild(live);
        c.appendChild(div);
        return function () { return input.value; };
      },
      check: function (v) {
        try {
          var ast = DMT.lib.expr.parse(v);
          if (!DMT.lib.expr.usesOnlyVars(ast, ['p', 'q'])) return { correct: false, feedback: 'Use only the variables p and q.' };
          var col = DMT.lib.expr.valueColumn(ast, ['p', 'q']);
          if (col === 'FFFT') return { correct: true, feedback: 'That is the AND truth table — true only when both are true.' };
          return { correct: false, feedback: 'Your column was ' + col.split('').join(' ') + '; target is F F F T.' };
        } catch (e) { return { correct: false, feedback: 'Could not parse: ' + e.message }; }
      },
      hints: [
        'F F F T means: result is only true in the LAST row, when both p and q are true.',
        'Which connective is "true only when both are true"?',
        'AND. Try: p ∧ q'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Build an expression in <code class="inline">p</code> and <code class="inline">q</code> with truth column <strong>T&nbsp;T&nbsp;F&nbsp;T</strong> (rows: FF, FT, TF, TT).',
      mountInput: function (c) {
        var div = document.createElement('div');
        div.innerHTML = '<input type="text" placeholder="hint: only false in row TF" style="width:100%;font-size:15px;">';
        var input = div.querySelector('input');
        var live = document.createElement('div');
        live.style.marginTop = '8px';
        live.style.fontFamily = 'var(--mono)';
        live.style.fontSize = '13px';
        function update() {
          if (!input.value.trim()) { live.innerHTML = '<span class="muted">target: T T F T</span>'; return; }
          try {
            var ast = DMT.lib.expr.parse(input.value);
            if (!DMT.lib.expr.usesOnlyVars(ast, ['p', 'q'])) { live.innerHTML = '<span style="color:var(--bad)">Use only p and q.</span>'; return; }
            var col = DMT.lib.expr.valueColumn(ast, ['p', 'q']);
            var match = col === 'TTFT';
            live.innerHTML = '<span class="muted">your column:</span> <span style="color:' + (match ? 'var(--good)' : 'var(--accent)') + '">' + col.split('').join(' ') + '</span> &nbsp; <span class="muted">target:</span> <span style="color:var(--good)">T T F T</span>';
          } catch (e) {
            live.innerHTML = '<span style="color:var(--bad)">' + DMT.escapeHtml(e.message) + '</span>';
          }
        }
        input.addEventListener('input', update);
        update();
        div.appendChild(live);
        c.appendChild(div);
        return function () { return input.value; };
      },
      check: function (v) {
        try {
          var ast = DMT.lib.expr.parse(v);
          if (!DMT.lib.expr.usesOnlyVars(ast, ['p', 'q'])) return { correct: false, feedback: 'Use only the variables p and q.' };
          var col = DMT.lib.expr.valueColumn(ast, ['p', 'q']);
          if (col === 'TTFT') return { correct: true, feedback: 'That is the IMPLIES truth table. Only false when p is true and q is false.' };
          return { correct: false, feedback: 'Your column was ' + col.split('').join(' ') + '; target T T F T.' };
        } catch (e) { return { correct: false, feedback: 'Could not parse: ' + e.message }; }
      },
      hints: [
        'The only F is row TF — when p is true and q is false.',
        'Recall the broken-promise reading — false only when p is true but q is false.',
        'It is IMPLIES: p → q'
      ]
    }
  ]
});
