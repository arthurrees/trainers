// Level 6 — Tree-Walking Interpreters
LT.registerLevel({
  id: 6,
  title: 'Tree-Walking Interpreters',
  whyItMatters: 'The simplest way to "run" a language is to walk its AST and compute values directly. Real languages start here, then optimize.',
  glossary: ['interpreter', 'tree-walking', 'AOT', 'side effect'],
  learn:
    '<p>An <b>interpreter</b> executes a program directly, without producing a separate machine-code binary. The simplest kind is a <b>tree-walking interpreter</b>: it walks the AST, computing values as it goes. About 50 lines of code is enough for a useful one.</p>' +

    '<h4>The shape of a tree-walking interpreter</h4>' +
    '<p>You already saw the core function in level 4. It is recursion over the node type. Extend it with a few more cases and you have a real little language:</p>' +
    '<div class="formula-box">' +
    'function eval(node, env) {<br>' +
    '&nbsp;&nbsp;switch (node.type) {<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "Number":   return node.value;<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "Ident":    return env.lookup(node.name);<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "BinaryOp": ...<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "If":       return eval(node.cond) ? eval(node.then) : eval(node.else);<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "While":    while (eval(node.cond)) eval(node.body); return null;<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "Let":      env.define(node.name, eval(node.value)); return null;<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "Assign":   env.set(node.name, eval(node.value)); return null;<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;case "Call":     ...<br>' +
    '&nbsp;&nbsp;}<br>' +
    '}' +
    '</div>' +
    '<p>That is essentially it. The runtime stack is the host language\'s stack — every recursive call to <code class="inline">eval</code> is a stack frame for the interpreted program. The environment carries variables.</p>' +

    '<h4>Environment</h4>' +
    '<p>The <b>environment</b> is the runtime cousin of the symbol table. Same nested-scope structure, but values instead of types:</p>' +
    '<div class="formula-box">' +
    'class Env {<br>' +
    '&nbsp;&nbsp;constructor(parent) { this.bindings = {}; this.parent = parent; }<br>' +
    '&nbsp;&nbsp;lookup(name) {<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;if (name in this.bindings) return this.bindings[name];<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;if (this.parent) return this.parent.lookup(name);<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;throw "undefined: " + name;<br>' +
    '&nbsp;&nbsp;}<br>' +
    '}' +
    '</div>' +
    '<p>Entering a function or block creates a new env with the previous one as parent. Leaving it discards the inner env. Closures (functions that capture variables) keep the env alive even after the outer scope returns.</p>' +

    '<h4>Why tree-walking is slow</h4>' +
    '<p>This is the smallest possible runtime — a recursion. It is also the slowest. Each operation requires:</p>' +
    '<ul>' +
    '<li>A function call into <code class="inline">eval</code>.</li>' +
    '<li>A switch on <code class="inline">node.type</code>.</li>' +
    '<li>Pointer chasing through the tree to get to operands.</li>' +
    '</ul>' +
    '<p>For arithmetic, that is many dozens of host-language instructions per <i>operation</i> — versus a single machine instruction for compiled code. Tree-walking interpreters are 10×–100× slower than equivalent compiled code, and that is on a good day.</p>' +

    '<h4>Why we still build them</h4>' +
    '<ul>' +
    '<li><b>They are easy to write.</b> First-pass implementation of any language tends to be a tree-walker.</li>' +
    '<li><b>They are easy to debug.</b> The interpreter\'s control flow is the source program\'s control flow.</li>' +
    '<li><b>They survive.</b> Many real languages ship a tree-walker as the default and add a compiler/JIT later (Ruby YARV took years; Python finally got a real JIT in 3.13).</li>' +
    '</ul>' +
    '<p>The next several levels are about all the work it takes to do better than this.</p>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Tiny tree-walking interpreter for arithmetic with variables. Set values, then evaluate any expression.</p>' +
      '<div class="flex-row">' +
      '<div><label>x = </label><input type="number" id="lt-int-x" value="3" style="width:80px"></div>' +
      '<div><label>y = </label><input type="number" id="lt-int-y" value="5" style="width:80px"></div>' +
      '<div><label>z = </label><input type="number" id="lt-int-z" value="7" style="width:80px"></div>' +
      '</div>' +
      '<input type="text" id="lt-int-expr" style="width:100%;margin-top:8px;" value="x + y * z - 1">' +
      '<div id="lt-int-out" class="formula-box" style="margin-top:8px;min-height:36px;"></div>';
    var x = container.querySelector('#lt-int-x');
    var y = container.querySelector('#lt-int-y');
    var z = container.querySelector('#lt-int-z');
    var expr = container.querySelector('#lt-int-expr');
    var out = container.querySelector('#lt-int-out');
    function update() {
      try {
        var env = { x: parseFloat(x.value), y: parseFloat(y.value), z: parseFloat(z.value) };
        var ast = LT.lib.parse.parse(LT.lib.lex.tokenize(expr.value));
        var v = LT.lib.parse.evaluate(ast, env);
        out.innerHTML = '<div>= <span class="result">' + LT.escapeHtml(String(v)) + '</span></div>';
      } catch (e) {
        out.innerHTML = '<div style="color:var(--bad)">' + LT.escapeHtml(e.message) + '</div>';
      }
    }
    [x, y, z, expr].forEach(function (el) { el.addEventListener('input', update); });
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>An interpreter has just walked the AST <code class="inline">BinaryOp(*, Ident("a"), Number(7))</code> with environment <code class="inline">{ a: 6 }</code>. What value does it return?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        if (v === 42) return { correct: true, feedback: 'Yes. Eval the left (look up a → 6), eval the right (7), then 6 * 7 = 42.' };
        return { correct: false, feedback: 'Walk the tree: evaluate the left child, evaluate the right child, then apply the operator.' };
      },
      hints: [
        'Left child is Ident("a") — look it up in the env.',
        'Right child is the literal 7. Operator is *.',
        '6 * 7.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>True or false: a tree-walking interpreter is generally <b>slower per operation</b> than the same program compiled to machine code, because each AST node visit costs much more than a CPU instruction.</p>',
      mountInput: function (container) {
        var sel = document.createElement('select');
        ['true', 'false'].forEach(function (o) {
          var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'true') return { correct: true, feedback: 'Right. A single node visit involves a function call, a switch, and pointer chasing. Compiled code is one or a few machine instructions per operation.' };
        return { correct: false, feedback: 'Tree-walking interpreters are dramatically slower than compiled code — typically 10×–100×. The overhead per operation is huge.' };
      },
      hints: [
        'How many host-language instructions does a single AST node visit cost?',
        'Compare that to a single machine instruction for an arithmetic op in compiled code.',
        'Ratio is often 50–100×.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You are writing a tree-walking interpreter that supports closures. A function captures its enclosing environment when defined. Consider:</p>' +
              '<pre class="formula-box">let x = 10;\nlet f = fn() { return x; };\nx = 20;\nprint(f());</pre>' +
              '<p>What does <code class="inline">f()</code> print, assuming <code class="inline">x</code> is captured <b>by reference</b> (shared with the outer scope, as in Python/JS)?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        if (v === 20) return { correct: true, feedback: 'Yes. By-reference capture means f does not snapshot the value of x at definition time — it holds a reference to the same binding. So when x is reassigned to 20, f sees the new value.' };
        if (v === 10) return { correct: false, feedback: 'That would be by-VALUE capture (C++ default for [=] lambdas). The puzzle says by-reference — the closure shares the binding with the outer scope.' };
        return { correct: false, feedback: 'By-reference closures share the binding. Updates outside are visible inside.' };
      },
      hints: [
        'By-reference capture means f does not copy x. It holds a pointer to the same slot.',
        'When x is set to 20, that change is visible everywhere — including inside f.',
        'Calling f() after the assignment returns the current value of x: 20.'
      ]
    }
  ]
});
