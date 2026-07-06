// Level 1 — Syntax vs Semantics
LT.registerLevel({
  id: 1,
  title: 'Syntax vs Semantics',
  whyItMatters: 'Two different kinds of "is this program OK?" — and the language toolchain catches them at very different times.',
  glossary: ['syntax', 'semantics', 'syntax error', 'runtime error', 'grammar', 'BNF', 'side effect'],
  learn:
    '<p>Two of the most important words in language design are <b>syntax</b> and <b>semantics</b>. They get used loosely all the time, but they mean different things, and the difference shows up in real ways.</p>' +

    '<h4>Syntax: the shape of the text</h4>' +
    '<p><b>Syntax</b> is the rules that decide what arrangements of characters/tokens form a valid program. Curly braces match, expressions have operands, statements end with semicolons (in some languages). Syntax has nothing to do with what the program <i>means</i> — only with how it is written.</p>' +
    '<div class="example"><div class="label">Syntax error</div>' +
    '<code class="inline">if (x &gt; 0 print(x);</code><br>' +
    '<span class="muted">Missing closing paren. Parser cannot match this to any rule. Rejected before any code runs.</span>' +
    '</div>' +

    '<h4>Semantics: what the program means</h4>' +
    '<p><b>Semantics</b> is what your code actually <i>does</i> when it runs. A program can be syntactically perfect and still be a complete disaster:</p>' +
    '<div class="example"><div class="label">Syntactically fine, semantically broken</div>' +
    '<code class="inline">x = 10 / 0;</code><br>' +
    '<span class="muted">No syntax error. The expression follows all the rules. But evaluating it crashes (or returns Infinity, depending on the language).</span>' +
    '</div>' +

    '<h4>When does each get caught?</h4>' +
    '<ul>' +
    '<li><b>Syntax errors</b> are caught by the <b>parser</b> — before any code runs. They are about the shape of the text.</li>' +
    '<li><b>Semantic errors</b> split into two camps:' +
    '<ul>' +
    '<li><b>Static</b> semantic errors (caught before run time, by analyses): "you used a variable that was never declared," "you passed a string where an int was expected." These are still pre-run-time, but the parser was happy — the SHAPE was fine, just the meaning was wrong.</li>' +
    '<li><b>Runtime</b> errors: divide by zero, null deref, file not found, out of memory. The program made it through every check and exploded while running.</li>' +
    '</ul>' +
    '</li>' +
    '</ul>' +

    '<h4>Grammars in BNF</h4>' +
    '<p>Syntax is usually written down in a <b>grammar</b>. The most common notation is <b>BNF</b> (Backus–Naur Form). It looks like this:</p>' +
    '<div class="formula-box">' +
    'expr     ::= term (("+" | "-") term)*<br>' +
    'term     ::= factor (("*" | "/") factor)*<br>' +
    'factor   ::= NUMBER | "(" expr ")"' +
    '</div>' +
    '<p>Read it as: an <code class="inline">expr</code> is a <code class="inline">term</code>, optionally followed by <code class="inline">+</code> or <code class="inline">-</code> and another term, and so on. <code class="inline">|</code> means "or". <code class="inline">*</code> means "zero or more times". <code class="inline">"+"</code> in quotes is the literal plus character.</p>' +
    '<p>That tiny grammar is enough to express <code class="inline">1 + 2 * 3</code> with the right precedence (multiplication binds tighter than addition because <code class="inline">term</code> is "below" <code class="inline">expr</code>). We will rebuild this in level 3.</p>' +

    '<h4>Why the distinction matters</h4>' +
    '<p>The pipeline assumes syntax is settled before semantics is checked. The parser has no idea what your program means. The type checker assumes the AST already exists. Each stage trusts the one before it. Get this layering wrong and your error messages will be terrible.</p>' +

    '<div class="callout"><div class="label">Programmer reality</div>' +
    'Most "weird error message" experiences are the result of one stage trying to recover from upstream confusion. A missing curly brace can produce 200 lines of nonsense errors because the parser keeps trying to find a stable state.</div>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Type a tiny snippet. The lexer/parser will tell you whether it is syntactically valid (using the toy expression grammar from this trainer).</p>' +
      '<input type="text" id="lt-syntax-in" style="width:100%;" value="1 + 2 * (3 + 4)">' +
      '<div id="lt-syntax-out" class="formula-box" style="margin-top:10px;">Result will appear here.</div>';
    var inp = container.querySelector('#lt-syntax-in');
    var out = container.querySelector('#lt-syntax-out');
    function update() {
      var s = inp.value;
      try {
        var toks = LT.lib.lex.tokenize(s);
        try {
          var ast = LT.lib.parse.parse(toks);
          var v;
          try { v = LT.lib.parse.evaluate(ast, {}); }
          catch (eEval) { v = '(could not evaluate: ' + eEval.message + ')'; }
          out.innerHTML =
            '<div style="color:var(--good)">✓ Syntactically valid</div>' +
            '<div class="info-line"><span class="key">tokens:</span> <span class="val">' +
            toks.map(LT.lib.lex.tokenLabel).join('  ') + '</span></div>' +
            '<div class="info-line"><span class="key">value:</span> <span class="val">' + LT.escapeHtml(String(v)) + '</span></div>';
        } catch (eParse) {
          out.innerHTML = '<div style="color:var(--bad)">✗ Syntax error</div>' +
            '<div class="info-line">' + LT.escapeHtml(eParse.message) + '</div>';
        }
      } catch (eLex) {
        out.innerHTML = '<div style="color:var(--bad)">✗ Lex error</div>' +
          '<div class="info-line">' + LT.escapeHtml(eLex.message) + '</div>';
      }
    }
    inp.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>For each of these snippets, decide whether it is a <b>syntax error</b>, a <b>runtime error</b>, or <b>fine</b>. Match each to one category.</p>' +
              '<ol><li><code class="inline">if (x &gt; 0) {</code></li>' +
              '<li><code class="inline">y = 5 / 0;</code></li>' +
              '<li><code class="inline">z = a + b;</code></li></ol>',
      mountInput: function (container) {
        function makeSel(id) {
          var sel = document.createElement('select');
          ['syntax error', 'runtime error', 'fine'].forEach(function (o) {
            var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
            sel.appendChild(opt);
          });
          sel.id = id;
          return sel;
        }
        var w = document.createElement('div'); w.className = 'flex-col';
        function row(label, id) {
          var r = document.createElement('div');
          r.style.display = 'flex'; r.style.gap = '10px'; r.style.alignItems = 'center';
          var lab = document.createElement('span'); lab.textContent = label; lab.style.width = '40px';
          r.appendChild(lab); r.appendChild(makeSel(id));
          return r;
        }
        w.appendChild(row('1.', 'lt-q1'));
        w.appendChild(row('2.', 'lt-q2'));
        w.appendChild(row('3.', 'lt-q3'));
        container.appendChild(w);
        return function () {
          return [
            container.querySelector('#lt-q1').value,
            container.querySelector('#lt-q2').value,
            container.querySelector('#lt-q3').value
          ];
        };
      },
      check: function (v) {
        var want = ['syntax error', 'runtime error', 'fine'];
        for (var i = 0; i < 3; i++) {
          if (v[i] !== want[i]) {
            return { correct: false, feedback: 'Recheck #' + (i + 1) + '. Think about whether the SHAPE of the code is valid, then whether running it could blow up.' };
          }
        }
        return { correct: true, feedback: 'Right. (1) is missing the closing brace — parser rejects it. (2) parses fine but divides by zero at run time. (3) is a perfectly normal addition.' };
      },
      hints: [
        '"Syntax error" = the parser cannot accept it. "Runtime error" = it parses fine but blows up while running.',
        '#1 has an opening brace with no closing one. That is a shape problem.',
        '#2 has perfect shape, but evaluating 5/0 will trap.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Using the BNF for a tiny expression language:</p>' +
              '<div class="formula-box">' +
              'expr   ::= term (("+" | "-") term)*<br>' +
              'term   ::= NUMBER<br>' +
              '</div>' +
              '<p>Which of these strings is <b>not</b> a valid expression in this grammar?</p>',
      mountInput: function (container) {
        var opts = [
          '7',
          '7 + 3',
          '7 - 3 + 2',
          '7 + (3)'
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
        if (v === '3') return { correct: true, feedback: 'Right. The grammar only allows NUMBER as a term — there is no rule for parenthesized expressions. The first three are valid.' };
        return { correct: false, feedback: 'That one fits the grammar. The grammar only has term = NUMBER, so look for something that is not a plain number or a chain of numbers joined by + and -.' };
      },
      hints: [
        'Walk each option through the grammar: an expr is a term, then any number of "+ term" or "- term" pieces.',
        'A term is JUST a NUMBER in this tiny grammar. Nothing else.',
        'Parentheses are not in the grammar at all. So anything with parens cannot match.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Consider this Python:</p>' +
              '<pre class="formula-box">def f():\n    return 1 +</pre>' +
              '<p>And this Python:</p>' +
              '<pre class="formula-box">def f():\n    return undefined_name</pre>' +
              '<p>What kind of error does each one raise, and <b>when</b>?</p>',
      mountInput: function (container) {
        var first = document.createElement('select');
        ['SyntaxError at parse time', 'NameError at run time', 'TypeError at run time', 'no error'].forEach(function (o) {
          var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
          first.appendChild(opt);
        });
        var second = document.createElement('select');
        ['SyntaxError at parse time', 'NameError when f() is called', 'NameError at parse time', 'no error'].forEach(function (o) {
          var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
          second.appendChild(opt);
        });
        var w = document.createElement('div'); w.className = 'flex-col';
        var l1 = document.createElement('div'); l1.appendChild(document.createTextNode('First snippet: ')); l1.appendChild(first);
        var l2 = document.createElement('div'); l2.appendChild(document.createTextNode('Second snippet: ')); l2.appendChild(second);
        w.appendChild(l1); w.appendChild(l2);
        container.appendChild(w);
        return function () { return [first.value, second.value]; };
      },
      check: function (v) {
        var want = ['SyntaxError at parse time', 'NameError when f() is called'];
        if (v[0] === want[0] && v[1] === want[1]) {
          return { correct: true, feedback: 'Yes. The first snippet is a syntax error — "return 1 +" cannot be parsed. The second snippet parses fine; the error only fires when f() actually runs and tries to look up the missing name.' };
        }
        if (v[0] !== want[0]) {
          return { correct: false, feedback: 'Look at the first snippet again. Is "return 1 +" something the parser can accept?' };
        }
        return { correct: false, feedback: 'The second snippet parses fine — Python only checks that local names exist when the function actually runs. So the error fires when?' };
      },
      hints: [
        'A syntax error is one the parser can detect just by looking at the shape of the code.',
        'For the second snippet — Python does not statically resolve every name in a function body. It looks names up at call time.',
        'The first is rejected before f is ever defined. The second succeeds at definition; only calling f() triggers the lookup.'
      ]
    }
  ]
});
