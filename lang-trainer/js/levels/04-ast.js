// Level 4 — Abstract Syntax Trees
LT.registerLevel({
  id: 4,
  title: 'Abstract Syntax Trees',
  whyItMatters: 'The AST is the central data structure of the front end. Every later stage either reads it, decorates it, or rewrites it.',
  glossary: ['AST', 'parse tree', 'precedence', 'associativity'],
  learn:
    '<p>Once the parser succeeds, it hands you a tree. This tree is the program — punctuation gone, nesting preserved.</p>' +

    '<h4>Parse tree vs AST</h4>' +
    '<p>A <b>parse tree</b> follows the grammar exactly: every nonterminal becomes a node, including the boring "wrapper" rules. An <b>AST</b> (abstract syntax tree) is the trimmed-down cousin: only nodes that carry meaning survive.</p>' +
    '<div class="example"><div class="label">For "1 + 2"</div>' +
    '<b>Parse tree:</b> expr → term → factor → NUMBER(1)<br>' +
    '<b>AST:</b> BinaryOp(+, Number(1), Number(2))<br>' +
    '<span class="muted">The AST drops the chain of single-child wrapper rules. It keeps the structure that matters.</span>' +
    '</div>' +

    '<h4>Anatomy of an AST node</h4>' +
    '<p>Each AST node has a <b>type</b> tag and any operator/operand info it needs. Leaves are values; internal nodes have children. A simple JS-shaped representation:</p>' +
    '<div class="formula-box">' +
    '{ type: "Number",   value: 42 }<br>' +
    '{ type: "Ident",    name:  "x" }<br>' +
    '{ type: "UnaryOp",  op: "-", operand: ... }<br>' +
    '{ type: "BinaryOp", op: "+", left: ..., right: ... }' +
    '</div>' +
    '<p>Real compilers add line/column info to every node (for error messages) and a "scope" pointer once the analyzer fills it in. But the bones are this simple.</p>' +

    '<h4>Tree-walking</h4>' +
    '<p>The fundamental operation on an AST is <b>walking</b> it: visit a node, decide what to do based on its type, recurse into children. This is just recursion over a recursive type.</p>' +
    '<div class="formula-box">' +
    'function eval(node, env) {<br>' +
    '&nbsp;&nbsp;if (node.type === "Number") return node.value;<br>' +
    '&nbsp;&nbsp;if (node.type === "Ident") return env[node.name];<br>' +
    '&nbsp;&nbsp;if (node.type === "BinaryOp") {<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;var l = eval(node.left, env);<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;var r = eval(node.right, env);<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;switch (node.op) { case "+": return l + r; ... }<br>' +
    '&nbsp;&nbsp;}<br>' +
    '}' +
    '</div>' +
    '<p>That single function — about 20 lines — is a complete tree-walking interpreter for arithmetic. Level 6 will extend it. Every other stage of the compiler is similarly a tree walk that produces a different output.</p>' +

    '<h4>Why a tree?</h4>' +
    '<p>Trees match how programs nest. A function body contains statements; a statement contains expressions; an expression contains operands which are themselves expressions. Lists do not capture this. Trees do.</p>' +
    '<p>Source text is the surface; the AST is the structure underneath. Every text-based programming tool — formatters, linters, refactor tools, IDE auto-complete — works on the AST, not the text.</p>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Same expression parser. Compare how the AST changes as you tweak parens.</p>' +
      '<div class="flex-row">' +
      '<div class="flex-col" style="flex:1">' +
      '<input type="text" id="lt-ast-a" style="width:100%;" value="1 + 2 * 3">' +
      '<div id="lt-ast-out-a" class="expr-tree" style="margin-top:8px;min-height:60px;"></div>' +
      '</div>' +
      '<div class="flex-col" style="flex:1">' +
      '<input type="text" id="lt-ast-b" style="width:100%;" value="(1 + 2) * 3">' +
      '<div id="lt-ast-out-b" class="expr-tree" style="margin-top:8px;min-height:60px;"></div>' +
      '</div>' +
      '</div>';
    function bind(inp, out) {
      function update() {
        try {
          var ast = LT.lib.parse.parse(LT.lib.lex.tokenize(inp.value));
          out.textContent = LT.lib.parse.astTree(ast);
          out.style.color = '';
        } catch (e) {
          out.textContent = e.message;
          out.style.color = 'var(--bad)';
        }
      }
      inp.addEventListener('input', update);
      update();
    }
    bind(container.querySelector('#lt-ast-a'), container.querySelector('#lt-ast-out-a'));
    bind(container.querySelector('#lt-ast-b'), container.querySelector('#lt-ast-out-b'));
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>The expression <code class="inline">1 + 2 + 3</code> parses to which tree (with normal left-associativity)?</p>',
      mountInput: function (container) {
        var opts = [
          'BinaryOp(+, 1, BinaryOp(+, 2, 3))',
          'BinaryOp(+, BinaryOp(+, 1, 2), 3)',
          'BinaryOp(+, 1, 2, 3)  — three children',
          'BinaryOp(+, BinaryOp(+, 2, 3), 1)'
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
        if (v === '1') return { correct: true, feedback: 'Right. Left-associative + groups left to right: ((1+2)+3). The deeper subtree is on the LEFT.' };
        if (v === '0') return { correct: false, feedback: 'That is right-associative grouping. + and − are normally LEFT-associative in C-family languages.' };
        if (v === '2') return { correct: false, feedback: 'Most ASTs have binary operators with exactly two children. The recursive descent parser builds nested binary nodes.' };
        return { correct: false, feedback: 'Look at the order of evaluation: 1 first, then +2 makes the left subtree, then +3 wraps that.' };
      },
      hints: [
        'Left-associative means: (((a) op b) op c). The deeper subtree is on the left.',
        'The parser eats 1, then sees + and 2 — builds BinaryOp(+, 1, 2). Then sees + and 3 — wraps it as BinaryOp(+, prev, 3).',
        'Final shape: BinaryOp(+, BinaryOp(+, 1, 2), 3).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>What does this AST evaluate to?</p>' +
              '<pre class="expr-tree">BinaryOp -\n  BinaryOp *\n    Number 5\n    Number 3\n  Number 4</pre>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        if (v === 11) return { correct: true, feedback: 'Yes. The tree is BinaryOp(-, BinaryOp(*, 5, 3), 4) → (5*3) - 4 → 15 - 4 → 11.' };
        return { correct: false, feedback: 'Walk the tree from the bottom up: leaves first, then combine via the operators above them.' };
      },
      hints: [
        'The OUTER node is the LAST operation performed.',
        'The outer node is BinaryOp(-). Its left child is BinaryOp(*) and its right child is 4.',
        '5*3 = 15, then 15 - 4 = 11.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Which of these source expressions matches this AST?</p>' +
              '<pre class="expr-tree">BinaryOp +\n  Number 1\n  BinaryOp *\n    BinaryOp +\n      Number 2\n      Number 3\n    Number 4</pre>',
      mountInput: function (container) {
        var opts = [
          '1 + 2 + 3 * 4',
          '1 + (2 + 3) * 4',
          '(1 + 2 + 3) * 4',
          '1 + 2 * 3 + 4'
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
        if (v === '1') return { correct: true, feedback: 'Yes. The outer node is +, with right child being a multiplication whose LEFT operand is itself an addition. Without parens around (2+3), * would bind tighter and give a different tree.' };
        if (v === '0') return { correct: false, feedback: 'In "1 + 2 + 3 * 4", the * binds tighter than + with no parens, so 3*4 would be its own subtree — not (2+3)*4.' };
        return { correct: false, feedback: 'The outer node is +. The * subtree contains a + as its LEFT child. That requires explicit parens around the addition.' };
      },
      hints: [
        'The outer + means the WHOLE expression is "something + something".',
        'The right side of that + is a *, and the LEFT operand of that * is itself a +. That nested + is forced by parens.',
        'So the source is: 1 + (2 + 3) * 4.'
      ]
    }
  ]
});
