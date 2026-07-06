// Level 7 — Intermediate Representation
LT.registerLevel({
  id: 7,
  title: 'Intermediate Representation',
  whyItMatters: 'Compilers do not jump straight from AST to assembly. They lower into a flat, simple form that is easy to analyze and rewrite. That form is the IR.',
  glossary: ['IR', 'three-address code', 'SSA', 'basic block', 'CFG (control)'],
  learn:
    '<p>Walking the AST is fine for an interpreter, but a compiler needs to do real work on the program: optimize it, allocate registers, generate target code. The AST is awkward for that. So compilers introduce a new representation in between.</p>' +

    '<h4>What an IR looks like</h4>' +
    '<p>The most common shape is <b>three-address code</b> (TAC). Every instruction has at most three names: a destination, two source operands. Operations are simple — no nesting, no expressions inside expressions:</p>' +
    '<div class="formula-box">' +
    'AST:  (a + b) * (c - d)<br>' +
    '<br>' +
    'TAC:  t0 = a + b<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t1 = c - d<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t2 = t0 * t1<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return t2' +
    '</div>' +
    '<p>The temps (<code class="inline">t0, t1, t2</code>) are <b>virtual registers</b> — there is an unlimited supply during this phase. Real register assignment happens later. The flat form is much easier to reason about: you can scan the list and ask "is this temp ever used?" or "are both args constants?" without recursion.</p>' +

    '<h4>Basic blocks and the control-flow graph</h4>' +
    '<p>A <b>basic block</b> is a straight-line sequence of IR instructions: control enters at the top and exits at the bottom. No jumps in the middle. Control flow between blocks is captured by branches at the end of each block:</p>' +
    '<div class="formula-box">' +
    'B0:&nbsp;&nbsp;t0 = x &gt; 0<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;branch t0, B1, B2<br>' +
    '<br>' +
    'B1:&nbsp;&nbsp;t1 = x * 2<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;jump B3<br>' +
    '<br>' +
    'B2:&nbsp;&nbsp;t2 = -x<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;jump B3<br>' +
    '<br>' +
    'B3:&nbsp;&nbsp;...' +
    '</div>' +
    '<p>The <b>control-flow graph</b> (CFG) has one node per basic block and edges for every possible branch. Most analyses operate on the CFG: liveness, reaching definitions, dominance — these are all just graph problems.</p>' +

    '<h4>SSA — single assignment everywhere</h4>' +
    '<p><b>SSA</b> stands for <b>Static Single Assignment</b>. It is an IR form where every variable is assigned exactly once. If you re-assign in source, the IR uses a fresh name:</p>' +
    '<div class="formula-box">' +
    'source:  x = 1; x = x + 1; x = x * 2;<br>' +
    '<br>' +
    'SSA:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x_1 = 1<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x_2 = x_1 + 1<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x_3 = x_2 * 2' +
    '</div>' +
    '<p>Sounds annoying. Why bother? Because every "definition" of a value is now globally unique. <b>Reaching definitions</b> become trivial — there is exactly one. Most modern compilers (LLVM, V8\'s TurboFan, Go, Java HotSpot) work in SSA form because optimization passes are far cleaner there.</p>' +
    '<p>For control flow with merging variables, SSA introduces <b>phi (φ) nodes</b>: at a join point, φ picks the right version based on which incoming branch was taken. (Out of scope for this level — just know the symbol exists.)</p>' +

    '<h4>What you get from going through IR</h4>' +
    '<ul>' +
    '<li><b>Optimization is easy.</b> Most passes look for a pattern in the IR and rewrite it.</li>' +
    '<li><b>Multiple front ends.</b> Rust, Swift, C++, Julia all emit LLVM IR; LLVM\'s back end takes it from there.</li>' +
    '<li><b>Multiple back ends.</b> One IR can be compiled for x86, ARM, RISC-V, WASM — without redoing the whole compiler.</li>' +
    '</ul>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Type an expression. The compiler lowers the AST into three-address code. Each temp is a virtual register.</p>' +
      '<input type="text" id="lt-ir-in" style="width:100%;" value="(a + b) * (c - d)">' +
      '<div class="flex-row" style="margin-top:10px;align-items:flex-start;">' +
      '<div style="flex:1"><div class="muted" style="font-size:12px">AST</div>' +
      '<div id="lt-ir-ast" class="expr-tree" style="min-height:60px;"></div></div>' +
      '<div style="flex:1"><div class="muted" style="font-size:12px">Three-address code</div>' +
      '<div id="lt-ir-tac" class="expr-tree" style="min-height:60px;"></div></div>' +
      '</div>';
    var inp = container.querySelector('#lt-ir-in');
    var astOut = container.querySelector('#lt-ir-ast');
    var tacOut = container.querySelector('#lt-ir-tac');
    function update() {
      try {
        var ast = LT.lib.parse.parse(LT.lib.lex.tokenize(inp.value));
        astOut.textContent = LT.lib.parse.astTree(ast);
        astOut.style.color = '';
        var tac = LT.lib.ir.toTAC(ast);
        tacOut.textContent = LT.lib.ir.formatTAC(tac);
        tacOut.style.color = '';
      } catch (e) {
        astOut.textContent = e.message; astOut.style.color = 'var(--bad)';
        tacOut.textContent = ''; tacOut.style.color = '';
      }
    }
    inp.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>How many three-address-code instructions does <code class="inline">a * b + c * d</code> lower to (excluding the final return)?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 3) return { correct: true, feedback: 'Right. t0 = a*b, t1 = c*d, t2 = t0 + t1. Three instructions.' };
        return { correct: false, feedback: 'Each binary op gets its own line. There are 3 binary operators in the expression.' };
      },
      hints: [
        'Each binary op in the AST becomes one instruction in TAC.',
        'There are 3 binary ops here: a*b, c*d, and the outer +.',
        'Three instructions, three temps.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Convert this to SSA form. The source code is:</p>' +
              '<pre class="formula-box">x = 5\nx = x + 1\ny = x * 2\nx = y - 3</pre>' +
              '<p>How many distinct SSA names does <code class="inline">x</code> end up with?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 3) return { correct: true, feedback: 'Right. SSA gives a fresh name to each ASSIGNMENT of x: x_1 = 5, x_2 = x_1 + 1, x_3 = y_1 - 3. Three.' };
        if (v === 4) return { correct: false, feedback: 'Count assignments to x specifically. There are 3 assignments to x and 1 to y.' };
        return { correct: false, feedback: 'Each WRITE to x in the source becomes a fresh SSA name. Reads use whichever name is current.' };
      },
      hints: [
        'In SSA, every assignment creates a NEW name. Reads use the current one.',
        'Count how many times x is on the LEFT of =. That is the number of SSA versions.',
        'x = 5 (x_1), x = x + 1 (x_2), x = y - 3 (x_3). Three.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>How many <b>basic blocks</b> does this program break into? (A basic block has one entry, one exit, no jumps in the middle.)</p>' +
              '<pre class="formula-box">a = 1\nif (a &gt; 0) {\n    b = 2\n} else {\n    c = 3\n}\nd = 4</pre>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 4) return { correct: true, feedback: 'Right. (1) entry through "a=1" and the branch, (2) the then-arm with b=2, (3) the else-arm with c=3, (4) the join point with d=4. Four blocks.' };
        if (v === 3) return { correct: false, feedback: 'You may be missing the join point. After the if/else, both arms merge — that merge point is its own block.' };
        return { correct: false, feedback: 'Walk through it: each branch start and each merge point is a block boundary.' };
      },
      hints: [
        'A block boundary forms wherever control can jump TO or FROM. Branches both create boundaries.',
        'Block 1: "a=1" up to the conditional branch. Block 2: then-arm (b=2). Block 3: else-arm (c=3). Block 4: the merge where d=4 happens.',
        'Four blocks total.'
      ]
    }
  ]
});
