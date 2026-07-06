// Level 5 — Semantic Analysis
LT.registerLevel({
  id: 5,
  title: 'Semantic Analysis',
  whyItMatters: 'Past this stage, the program is not just well-shaped — every name resolves to a declaration, every operation\'s types make sense. This is where most "static" guarantees come from.',
  glossary: ['symbol table', 'scope', 'binding', 'type system', 'static typing', 'dynamic typing', 'type inference'],
  learn:
    '<p>The parser produced an AST. Every node is well-formed. But there are still things you cannot tell from shape alone:</p>' +
    '<ul>' +
    '<li>Does <code class="inline">x</code> in this expression refer to a variable that exists?</li>' +
    '<li>If <code class="inline">x</code> is a string, is <code class="inline">x + 5</code> meaningful?</li>' +
    '<li>If you wrote <code class="inline">return foo();</code>, does <code class="inline">foo</code> exist and accept no args?</li>' +
    '</ul>' +
    '<p>These questions are <b>semantic</b>. The component that answers them is the <b>analyzer</b> (a.k.a. type checker / resolver / front-end pass two). It walks the AST and decorates it with extra info, or rejects the program with a <i>semantic</i> error.</p>' +

    '<h4>The symbol table</h4>' +
    '<p>The core data structure here is the <b>symbol table</b>: a map from names to their declarations. Real symbol tables are usually <i>nested</i> to match scopes:</p>' +
    '<div class="formula-box">' +
    'global { print, x }<br>' +
    '&nbsp;&nbsp;function foo { y, z }    ← inner scope, can see outer<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;block { i }              ← inner inner' +
    '</div>' +
    '<p>Looking up a name walks the chain: check the innermost scope first, then the enclosing one, on up to global. This is <b>lexical scope</b> — a name resolves based on where it is <i>written</i>, not where the call came from.</p>' +

    '<h4>Static vs dynamic typing</h4>' +
    '<p>Languages disagree on when type checking happens:</p>' +
    '<ul>' +
    '<li><b>Static</b> (C, Java, Rust, TypeScript): types are checked before run time. Either you write them or the compiler infers them. Catches a broad class of bugs early at the cost of more verbosity.</li>' +
    '<li><b>Dynamic</b> (Python, Ruby, JS, Lua): every value carries its type at run time, and operations check it on the spot. <code class="inline">"abc" + 5</code> only fails when the line actually runs.</li>' +
    '<li><b>Gradual</b> (Python with type hints, TypeScript over JS): static where you annotate, dynamic everywhere else.</li>' +
    '</ul>' +

    '<h4>Type inference</h4>' +
    '<p><b>Type inference</b> means the compiler figures out the type from context, so you do not have to write it. Pure Hindley-Milner inference (ML, Haskell) can recover almost all types with no annotations. C/Java only infer in narrow places (<code class="inline">var</code> / <code class="inline">auto</code> / <code class="inline">:=</code>). Rust does function-local inference but requires types at boundaries.</p>' +
    '<div class="example"><div class="label">Inference in practice</div>' +
    'Rust: <code class="inline">let x = 42;</code> → <code class="inline">x: i32</code> (default integer)<br>' +
    'Rust: <code class="inline">let v = vec![1u8, 2, 3];</code> → <code class="inline">v: Vec&lt;u8&gt;</code> (from element type)<br>' +
    '<span class="muted">The compiler propagates type info from where it is known to where it is not.</span>' +
    '</div>' +

    '<h4>What semantic errors look like</h4>' +
    '<ul>' +
    '<li><b>Undeclared name</b>: <code class="inline">x = 5;</code> with no <code class="inline">let x</code>.</li>' +
    '<li><b>Type mismatch</b>: <code class="inline">let n: int = "hi";</code></li>' +
    '<li><b>Wrong arity</b>: <code class="inline">add(1, 2, 3)</code> when <code class="inline">add</code> takes two args.</li>' +
    '<li><b>Mutating immutable</b>: <code class="inline">x = 5;</code> when <code class="inline">x</code> is declared <code class="inline">const</code>.</li>' +
    '</ul>' +
    '<p>These are not parser errors — the SHAPE was fine. They are not runtime errors either — they are caught before any code runs (in static languages). They are the analyzer\'s domain.</p>' +

    '<div class="callout"><div class="label">Why scope matters</div>' +
    'The reason "lexical scope" wins out is that you can read a piece of code and immediately know what every name refers to, just by looking at the surrounding text. The alternative (dynamic scope, where names resolve based on the call stack at run time) makes refactoring nearly impossible. Modern languages all use lexical scope, even when they look dynamic.</div>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Type an expression. We pretend you have <code class="inline">x</code>, <code class="inline">y</code> declared as numbers and <code class="inline">name</code> declared as a string. The "analyzer" reports any undeclared names or obviously bad types.</p>' +
      '<input type="text" id="lt-sem-in" style="width:100%;" value="x + y * 3">' +
      '<div id="lt-sem-out" class="formula-box" style="margin-top:10px;min-height:50px;"></div>';

    var inp = container.querySelector('#lt-sem-in');
    var out = container.querySelector('#lt-sem-out');
    var symbols = { x: 'number', y: 'number', name: 'string' };

    function typeOf(node) {
      if (node.type === 'Number') return 'number';
      if (node.type === 'Bool') return 'bool';
      if (node.type === 'Ident') {
        if (!symbols.hasOwnProperty(node.name)) {
          throw new Error('undeclared name: ' + node.name);
        }
        return symbols[node.name];
      }
      if (node.type === 'UnaryOp') {
        var t = typeOf(node.operand);
        if (node.op === '-') {
          if (t !== 'number') throw new Error('cannot negate ' + t);
          return 'number';
        }
        if (node.op === '!') {
          if (t !== 'bool') throw new Error('cannot ! a ' + t);
          return 'bool';
        }
      }
      if (node.type === 'BinaryOp') {
        var lt = typeOf(node.left), rt = typeOf(node.right);
        if (['+', '-', '*', '/'].indexOf(node.op) >= 0) {
          if (lt !== 'number' || rt !== 'number') throw new Error('arithmetic needs numbers, got ' + lt + ' ' + node.op + ' ' + rt);
          return 'number';
        }
        if (['<', '>', '<=', '>='].indexOf(node.op) >= 0) {
          if (lt !== 'number' || rt !== 'number') throw new Error('comparison needs numbers, got ' + lt + ' ' + node.op + ' ' + rt);
          return 'bool';
        }
        if (['==', '!='].indexOf(node.op) >= 0) {
          if (lt !== rt) throw new Error('equality needs same types, got ' + lt + ' vs ' + rt);
          return 'bool';
        }
        if (['&&', '||'].indexOf(node.op) >= 0) {
          if (lt !== 'bool' || rt !== 'bool') throw new Error('logical needs bools');
          return 'bool';
        }
      }
      throw new Error('unknown node');
    }

    function update() {
      try {
        var ast = LT.lib.parse.parse(LT.lib.lex.tokenize(inp.value));
        try {
          var t = typeOf(ast);
          out.innerHTML = '<div style="color:var(--good)">✓ Type-checks. Result type: <b>' + t + '</b></div>';
        } catch (e) {
          out.innerHTML = '<div style="color:var(--bad)">✗ Semantic error: ' + LT.escapeHtml(e.message) + '</div>';
        }
      } catch (e) {
        out.innerHTML = '<div style="color:var(--bad)">✗ Cannot parse: ' + LT.escapeHtml(e.message) + '</div>';
      }
    }
    inp.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You are using a statically-typed language. The compiler reports an error before your program runs:</p>' +
              '<pre class="formula-box">error: cannot add `&amp;str` and `i32`</pre>' +
              '<p>This is best classified as which kind of error?</p>',
      mountInput: function (container) {
        var opts = ['lex error', 'syntax error', 'semantic / type error', 'runtime error'];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option'); opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '2') return { correct: true, feedback: 'Right. The shape is fine — both operands are valid expressions, and + is a valid operator. The complaint is about MEANING (types), so it is a semantic error.' };
        if (v === '3') return { correct: false, feedback: 'In a statically-typed language, this is caught BEFORE running. So not runtime.' };
        return { correct: false, feedback: 'The lexer and parser have no problem. The issue is what the program MEANS once names and operators are checked against types.' };
      },
      hints: [
        'The lexer and parser only care about shape. They do not know what types names have.',
        'In statically-typed languages, type mismatches are reported BEFORE the program runs.',
        'These errors come from the semantic analyzer / type checker.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Given these nested scopes:</p>' +
              '<pre class="formula-box">global:    { x = 1, y = 10 }\n  function foo: { x = 2, z = 5 }\n    block:        { y = 100 }</pre>' +
              '<p>Inside the innermost block, what does <code class="inline">x + y + z</code> evaluate to?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        if (v === 107) return { correct: true, feedback: 'Yes. Lexical scope walks outward: x = 2 (foo shadows global), y = 100 (block shadows global), z = 5 (foo). 2 + 100 + 5 = 107.' };
        if (v === 16) return { correct: false, feedback: 'You used the global x and y. But shadowing means inner scopes hide the outer ones with the same name.' };
        return { correct: false, feedback: 'For each name, walk OUTWARD from where you are. Use the FIRST one you find.' };
      },
      hints: [
        'Lexical scope: look up each name by walking from the current scope outward, stopping at the first match.',
        'x is in foo (= 2), shadowing global. y is in the innermost block (= 100), shadowing global. z is in foo (= 5).',
        '2 + 100 + 5.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Python is dynamically typed. Consider:</p>' +
              '<pre class="formula-box">def f(n):\n    return n + " items"\n\n# (we never call f)</pre>' +
              '<p>Does Python report an error <b>at definition time</b> for the type mismatch?</p>',
      mountInput: function (container) {
        var opts = [
          'Yes — Python checks types when it sees the function and rejects this immediately.',
          'No — the body is parsed but not type-checked. Only when f is called with a value will Python try to evaluate n + " items" and fail (or succeed, if n is a string).',
          'No — Python implicitly converts numbers to strings, so this is always fine.',
          'Yes — Python infers the type of n from usage and reports the conflict.'
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
        if (v === '1') return { correct: true, feedback: 'Right. Dynamic typing means the type check happens when the operation actually runs. Python does not look inside the body until called. Even f(5) only fails on the line that does the +, not when f is defined.' };
        if (v === '2') return { correct: false, feedback: 'Python does NOT auto-convert int to string for +. Try `5 + " items"` in a REPL — it raises TypeError.' };
        return { correct: false, feedback: 'Python does not type-check function bodies at definition time. That is the whole point of dynamic typing.' };
      },
      hints: [
        'Dynamic typing pushes type checks to run time. The compiler/interpreter does not analyze the body up front.',
        'Even if you call f(5), the error fires on the LINE that does the + — not at definition time.',
        'The body parses fine. Nothing is checked about n until the operation actually executes.'
      ]
    }
  ]
});
