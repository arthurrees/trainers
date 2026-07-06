// Level 8 — Optimization
LT.registerLevel({
  id: 8,
  title: 'Optimization',
  whyItMatters: 'The IR-to-IR rewrite phase. This is where naive code becomes fast code, by mechanically applying transformations that preserve meaning.',
  glossary: ['optimization', 'constant folding', 'dead code elimination', 'inlining', 'CSE'],
  learn:
    '<p>Once your program is in IR, the compiler runs <b>optimization passes</b>: little programs that take IR and produce equivalent (but better) IR. Each pass is small, focused, and conservative — if it cannot prove a transformation is safe, it leaves the code alone.</p>' +

    '<h4>Constant folding</h4>' +
    '<p>The simplest optimization. If both operands of an op are constants, do the op at compile time:</p>' +
    '<div class="formula-box">' +
    'before:  t0 = 2 + 3<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t1 = t0 * 4<br>' +
    '<br>' +
    'after:&nbsp;&nbsp; t1 = 20' +
    '</div>' +
    '<p>You write things like <code class="inline">SECONDS_PER_DAY = 60*60*24</code> for clarity. The compiler computes <code class="inline">86400</code> once, statically. Folding chains: when t0 = 5 lets t1 fold, that may let t2 fold, and so on.</p>' +

    '<h4>Dead code elimination</h4>' +
    '<p>If a temp is computed but never read, drop it. If a branch is provably never taken, drop it. If a variable is set but never used after, drop the set.</p>' +
    '<div class="formula-box">' +
    'before:  t0 = expensive()  // never used<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return 42<br>' +
    '<br>' +
    'after:&nbsp;&nbsp; return 42' +
    '</div>' +
    '<p>This pass works backward from values that ARE used (return values, function args, side-effects) and marks them live. Anything not marked is dead. Repeating the pass can cascade: removing dead code may make other code newly dead.</p>' +

    '<h4>Common subexpression elimination (CSE)</h4>' +
    '<p>If the same expression is computed twice and nothing in between could have changed its inputs, do it once and reuse:</p>' +
    '<div class="formula-box">' +
    'before:  t0 = a + b<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t1 = c * t0<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t2 = a + b&nbsp;&nbsp;&nbsp;&nbsp;// same as t0<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t3 = d * t2<br>' +
    '<br>' +
    'after:&nbsp;&nbsp; t0 = a + b<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t1 = c * t0<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t3 = d * t0' +
    '</div>' +

    '<h4>Inlining</h4>' +
    '<p>Replace a function call with a copy of the function\'s body. This kills the call overhead and exposes more optimizations across the boundary:</p>' +
    '<div class="formula-box">' +
    'before:  function double(x) { return x * 2; }<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return double(7) + 1;<br>' +
    '<br>' +
    'after:&nbsp;&nbsp; return 7 * 2 + 1;&nbsp;&nbsp;// inlined, then constant-folded to 15' +
    '</div>' +
    '<p>Inlining is the optimization that <i>enables</i> most other optimizations. Once a call is inlined, the caller and callee can be optimized together. Modern compilers inline aggressively for small functions and gate it by heuristics for big ones.</p>' +

    '<h4>The fixed-point loop</h4>' +
    '<p>Compilers run optimization passes <i>repeatedly</i> until nothing changes. Constant folding may make a branch dead. Dead code elim may free a variable. That may unlock more folding. The driver runs the cycle until stable.</p>' +

    '<h4>Other classics, briefly</h4>' +
    '<ul>' +
    '<li><b>Strength reduction</b>: <code class="inline">x * 2</code> → <code class="inline">x &lt;&lt; 1</code>; <code class="inline">x % power_of_2</code> → <code class="inline">x &amp; (n-1)</code>.</li>' +
    '<li><b>Loop-invariant code motion</b>: hoist computations out of loops if their inputs do not change inside.</li>' +
    '<li><b>Loop unrolling</b>: replicate a loop body N times to amortize loop overhead.</li>' +
    '<li><b>Tail-call elimination</b>: turn <code class="inline">return f(x)</code> into a jump back to the top of the function — recursion stops blowing the stack.</li>' +
    '<li><b>Vectorization</b>: pack scalar operations into one SIMD instruction.</li>' +
    '</ul>' +

    '<div class="callout"><div class="label">Conservative by design</div>' +
    'A pass MUST preserve meaning. If a side effect could happen between two reads of <code class="inline">x</code>, you cannot collapse them — even if x "looks" like it has not changed. Most missed-optimization bugs are passes that were too aggressive. Compiler authors live in fear of these.</div>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Type an expression. See the IR before and after constant folding.</p>' +
      '<input type="text" id="lt-opt-in" style="width:100%;" value="(2 + 3) * (4 + 1) + a">' +
      '<div class="flex-row" style="margin-top:10px;align-items:flex-start;">' +
      '<div style="flex:1"><div class="muted" style="font-size:12px">Before</div>' +
      '<div id="lt-opt-before" class="expr-tree" style="min-height:60px;"></div></div>' +
      '<div style="flex:1"><div class="muted" style="font-size:12px">After constant folding + dead-code</div>' +
      '<div id="lt-opt-after" class="expr-tree" style="min-height:60px;"></div></div>' +
      '</div>';
    var inp = container.querySelector('#lt-opt-in');
    var b = container.querySelector('#lt-opt-before');
    var a = container.querySelector('#lt-opt-after');
    function update() {
      try {
        var ast = LT.lib.parse.parse(LT.lib.lex.tokenize(inp.value));
        var tac = LT.lib.ir.toTAC(ast);
        b.textContent = LT.lib.ir.formatTAC(tac); b.style.color = '';
        var folded = LT.lib.ir.constFold(tac);
        var clean = LT.lib.ir.deadCode(folded);
        a.textContent = LT.lib.ir.formatTAC(clean); a.style.color = '';
      } catch (e) {
        b.textContent = e.message; b.style.color = 'var(--bad)';
        a.textContent = ''; a.style.color = '';
      }
    }
    inp.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>After constant folding, what does this IR collapse to?</p>' +
              '<pre class="formula-box">t0 = 3 + 4\nt1 = t0 * 2\nt2 = t1 - 5\nreturn t2</pre>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        if (v === 9) return { correct: true, feedback: 'Right. t0 = 7, t1 = 14, t2 = 9. After folding the whole thing is just `return 9`.' };
        return { correct: false, feedback: 'Each line has only constant operands, so each one folds. Compute step by step.' };
      },
      hints: [
        '3 + 4 folds to 7.',
        'Then 7 * 2 = 14.',
        'Then 14 - 5 = 9.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You have <code class="inline">double(x) = x * 2</code> and a call site <code class="inline">y = double(7)</code>. List which optimizations, applied in this order, would simplify this to a single constant store.</p>',
      mountInput: function (container) {
        var opts = [
          'CSE only',
          'inlining only',
          'inlining, then constant folding',
          'dead-code elimination only'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option'); opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '2') return { correct: true, feedback: 'Yes. Inlining replaces double(7) with 7 * 2. Then constant folding turns 7 * 2 into 14. y = 14.' };
        if (v === '1') return { correct: false, feedback: 'Inlining alone gives `y = 7 * 2`. You still need a fold pass to get `y = 14`.' };
        return { correct: false, feedback: 'Two passes are needed. The first opens the function body up to the constant; the second computes it.' };
      },
      hints: [
        'You first need to remove the function call boundary so the constant 7 meets the * 2.',
        'After inlining: y = 7 * 2.',
        'Then constant folding: y = 14.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Why is dead-code elimination usually <b>repeated</b> after other passes (rather than just run once at the end)? Pick the best reason.</p>',
      mountInput: function (container) {
        var opts = [
          'It is faster to run multiple times than once on a big IR.',
          'Other optimizations frequently produce new dead code as a side effect — so DCE picks up the leftovers.',
          'DCE only works on small programs; running it multiple times handles bigger ones.',
          'Compilers always run every pass exactly once.'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option'); opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '1') return { correct: true, feedback: 'Right. Constant folding turns t0 = 2+3 into a literal that the next instruction can absorb — leaving t0 newly dead. CSE replaces a duplicate computation, leaving the original temp dead. DCE cleans these up. Compilers run a fixed-point loop of passes until nothing changes.' };
        if (v === '3') return { correct: false, feedback: 'Compilers commonly run passes in a fixed-point loop, not exactly-once. Many real pass managers iterate until stable.' };
        return { correct: false, feedback: 'Think about what other passes leave behind in their wake.' };
      },
      hints: [
        'Each optimization can produce new opportunities for other optimizations.',
        'Constant folding may render a temp unused. CSE may render a duplicate computation unused.',
        'DCE picks up the leftovers from other passes — so it gets re-run.'
      ]
    }
  ]
});
