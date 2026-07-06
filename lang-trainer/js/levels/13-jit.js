// Level 13 — Bytecode VMs and JITs
LT.registerLevel({
  id: 13,
  title: 'Bytecode VMs & JITs',
  whyItMatters: 'How modern dynamic languages get fast. The compromise between "interpret slowly" and "compile ahead" is to compile while you run.',
  glossary: ['bytecode', 'VM', 'JIT', 'AOT', 'tracing JIT', 'method JIT'],
  learn:
    '<p>Tree-walking is slow. Compiling ahead-of-time is fast but rigid. Many of the languages people use every day (JavaScript, Java, Python from 3.13, Ruby, .NET) take a middle path. They compile to a compact <b>bytecode</b>, run it on a virtual machine, and then JIT-compile the hot parts to native code while the program runs.</p>' +

    '<h4>Bytecode</h4>' +
    '<p>A <b>bytecode</b> is an instruction set for a fictional CPU — designed by the language implementers. Each instruction is one byte (or a few bytes) and operates on either a virtual stack or virtual registers. Bytecode is compact, easy to parse, and uniform across machines.</p>' +
    '<div class="example"><div class="label">Python bytecode for "1 + 2"</div>' +
    '<code class="inline">LOAD_CONST 1</code><br>' +
    '<code class="inline">LOAD_CONST 2</code><br>' +
    '<code class="inline">BINARY_ADD</code><br>' +
    '<code class="inline">RETURN_VALUE</code><br>' +
    '<span class="muted">A stack-based bytecode: each instruction reads/writes the operand stack.</span>' +
    '</div>' +
    '<p>Python (CPython), Java (JVM), .NET (CIL), Lua (Lua VM), and WASM all use bytecode. Differences are in the instruction set, the operand model (stack vs register), and what runs the bytecode.</p>' +

    '<h4>Why bytecode and not just AST?</h4>' +
    '<ul>' +
    '<li><b>Compactness</b>: bytecode is far smaller than an AST in memory.</li>' +
    '<li><b>Speed</b>: dispatching one bytecode op is much faster than walking an AST node.</li>' +
    '<li><b>Portability</b>: ship the bytecode, run it anywhere there is a VM. The "compile once, run anywhere" line.</li>' +
    '<li><b>JIT-friendliness</b>: bytecode\'s flat shape is easy to translate to machine code on the fly.</li>' +
    '</ul>' +

    '<h4>Just-In-Time compilation</h4>' +
    '<p>A <b>JIT</b> compiler watches the program run, identifies hot code, and compiles those pieces to native machine code on the fly. This unlocks two things ahead-of-time compilers cannot do:</p>' +
    '<ul>' +
    '<li><b>Type specialization</b>: in JS, <code class="inline">function add(a, b) { return a + b; }</code> could be int+int, float+float, string+string, ... A JIT can observe that this call site only ever sees int+int and emit code optimized for that case (with a guard to fall back if the assumption breaks).</li>' +
    '<li><b>Profile-guided inlining</b>: real measurements of which calls are hot let the JIT make better inlining decisions than any static heuristic.</li>' +
    '</ul>' +

    '<h4>Method JITs vs tracing JITs</h4>' +
    '<ul>' +
    '<li><b>Method JIT</b> (V8 TurboFan, HotSpot, .NET RyuJIT): compile a whole function once it gets hot. Most modern JITs.</li>' +
    '<li><b>Tracing JIT</b> (PyPy, the old SpiderMonkey TraceMonkey): record an execution TRACE — the linear sequence of operations actually taken on a hot path — and compile that trace as a single straight-line piece of code with guards.</li>' +
    '</ul>' +

    '<h4>The tier ladder</h4>' +
    '<p>Modern engines run multiple tiers, each with different effort/quality trade-offs. V8\'s pipeline:</p>' +
    '<div class="formula-box">' +
    '1. Source → AST → bytecode (Ignition: a fast interpreter)<br>' +
    '2. Hot bytecode → light JIT (Sparkplug, baseline)<br>' +
    '3. Hotter still → optimizing JIT (TurboFan or Maglev)<br>' +
    '<br>' +
    'Code that turns out to be wrong (e.g. a type guard breaks)<br>' +
    '→ <b>deoptimize</b> back to a lower tier' +
    '</div>' +
    '<p>HotSpot calls these C1 and C2. .NET has Tier 0 and Tier 1. The pattern is universal: cheap to start, expensive to optimize, only optimize what is worth it.</p>' +

    '<h4>Deoptimization</h4>' +
    '<p>If the JIT specialized for "a is always an int" and then suddenly a is a string, the optimized code breaks. The runtime handles this by <b>deoptimizing</b>: throw away the specialized native code and resume in the bytecode interpreter at the same logical position. Painful but rare. Stable code stays optimized.</p>' +

    '<h4>WASM</h4>' +
    '<p>WebAssembly is a different beast: a portable bytecode designed to be JIT-compiled cheaply (or run AOT). Static types, sandboxed, deterministic. Targeted by C/C++/Rust/Go for browsers and increasingly server-side. The bytecode is engineered to be fast to compile rather than fast to interpret.</p>' +

    '<div class="callout"><div class="label">"Why is JS fast?"</div>' +
    'JavaScript is a wildly dynamic language. The thing that makes V8 fast is not magic — it is layered: a fast interpreter for cold code, baseline JIT for warm code, an optimizing JIT for hot code, type feedback woven into all of it, and a deoptimizer to fall back gracefully when assumptions break.</div>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Type an arithmetic expression. We compile it to a tiny stack-based bytecode (Python-style).</p>' +
      '<input type="text" id="lt-bc-in" style="width:100%;" value="(1 + 2) * 3 - 4">' +
      '<div class="flex-row" style="margin-top:10px;align-items:flex-start;">' +
      '<div style="flex:1"><div class="muted" style="font-size:12px">Bytecode</div>' +
      '<div id="lt-bc-out" class="expr-tree" style="min-height:80px;"></div></div>' +
      '<div style="flex:1"><div class="muted" style="font-size:12px">Stack at end</div>' +
      '<div id="lt-bc-stack" class="expr-tree" style="min-height:80px;"></div></div>' +
      '</div>';
    var inp = container.querySelector('#lt-bc-in');
    var out = container.querySelector('#lt-bc-out');
    var stk = container.querySelector('#lt-bc-stack');
    function emit(node, lines) {
      if (node.type === 'Number') { lines.push('LOAD_CONST  ' + node.value); return; }
      if (node.type === 'Bool')   { lines.push('LOAD_CONST  ' + node.value); return; }
      if (node.type === 'Ident')  { lines.push('LOAD_NAME   ' + node.name); return; }
      if (node.type === 'UnaryOp') { emit(node.operand, lines); lines.push('UNARY_' + (node.op === '-' ? 'NEG' : 'NOT')); return; }
      if (node.type === 'BinaryOp') {
        emit(node.left, lines); emit(node.right, lines);
        var map = { '+': 'BINARY_ADD', '-': 'BINARY_SUB', '*': 'BINARY_MUL', '/': 'BINARY_DIV',
                    '<': 'COMPARE_LT', '>': 'COMPARE_GT', '<=': 'COMPARE_LE', '>=': 'COMPARE_GE',
                    '==': 'COMPARE_EQ', '!=': 'COMPARE_NE',
                    '&&': 'LOGICAL_AND', '||': 'LOGICAL_OR' };
        lines.push(map[node.op] || ('OP_' + node.op));
      }
    }
    function exec(lines) {
      var stack = [];
      for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split(/\s+/);
        var op = parts[0];
        if (op === 'LOAD_CONST') stack.push(parseFloat(parts[1]));
        else if (op === 'BINARY_ADD') { var b = stack.pop(), a = stack.pop(); stack.push(a + b); }
        else if (op === 'BINARY_SUB') { var b2 = stack.pop(), a2 = stack.pop(); stack.push(a2 - b2); }
        else if (op === 'BINARY_MUL') { var b3 = stack.pop(), a3 = stack.pop(); stack.push(a3 * b3); }
        else if (op === 'BINARY_DIV') { var b4 = stack.pop(), a4 = stack.pop(); stack.push(a4 / b4); }
        else if (op === 'UNARY_NEG') { stack.push(-stack.pop()); }
        else { /* skip non-arithmetic in this play */ }
      }
      stack.push('RETURN_VALUE');
      return stack;
    }
    function update() {
      try {
        var ast = LT.lib.parse.parse(LT.lib.lex.tokenize(inp.value));
        var lines = [];
        emit(ast, lines);
        lines.push('RETURN_VALUE');
        out.textContent = lines.map(function (l, i) { return String(i).padStart(3, ' ') + '  ' + l; }).join('\n');
        out.style.color = '';
        var stack = exec(lines);
        stk.textContent = stack.length === 0 ? '(empty)' : stack.map(function (v) { return ' ' + v; }).reverse().join('\n');
        stk.style.color = '';
      } catch (e) {
        out.textContent = e.message; out.style.color = 'var(--bad)';
        stk.textContent = '';
      }
    }
    inp.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>Bytecode for the expression <code class="inline">3 + 4</code> on a stack-based VM:</p>' +
              '<pre class="formula-box">LOAD_CONST 3\nLOAD_CONST 4\nBINARY_ADD</pre>' +
              '<p>After all three instructions execute, what is on top of the operand stack?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        if (v === 7) return { correct: true, feedback: 'Yes. LOAD_CONST 3 pushes 3. LOAD_CONST 4 pushes 4. BINARY_ADD pops both, pushes 7.' };
        return { correct: false, feedback: 'Trace the stack: each LOAD_CONST pushes a value; BINARY_ADD pops two, pushes their sum.' };
      },
      hints: [
        'Each LOAD_CONST pushes that value onto the stack.',
        'BINARY_ADD pops the top two values and pushes their sum.',
        'After 3, 4, ADD: stack has [7].'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You have a JS function called from many places. The first 99% of calls pass two integers; one rare call passes two strings.</p>' +
              '<p>An optimizing JIT specialized the function for ints. What does the runtime do when the rare call comes in?</p>',
      mountInput: function (container) {
        var opts = [
          'Crash — the specialized code only handles ints.',
          'Implicitly convert the strings to ints.',
          'Trip a guard, throw away the specialized native code, and fall back to the bytecode interpreter for that call (deoptimization).',
          'Recompile the function from scratch synchronously before the call proceeds.'
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
        if (v === '2') return { correct: true, feedback: 'Yes. The specialized code starts with type-check guards. When a guard fires, the runtime "deoptimizes" — discards the specialized code and resumes execution in the lower tier. Later, if the function settles on a new pattern, the JIT may re-specialize.' };
        if (v === '0') return { correct: false, feedback: 'A serious JIT does not crash on guard failure — that would be terrible. It has a fallback path.' };
        return { correct: false, feedback: 'Modern JITs use guards + deoptimization. Look for that option.' };
      },
      hints: [
        'Specialized code starts with type-check GUARDS: "if a or b is not int, jump to the bailout".',
        'On bailout, discard the specialized code and resume in the bytecode interpreter or a lower-tier JIT.',
        'This is called DEOPTIMIZATION — a key feature of every modern JS/Java JIT.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Compare two designs for a dynamic language:</p>' +
              '<ul>' +
              '<li><b>Pure interpreter</b>: tree-walks the AST forever.</li>' +
              '<li><b>Bytecode VM + JIT</b>: compiles to bytecode at load, then JITs hot code as the program runs.</li>' +
              '</ul>' +
              '<p>For a program that runs for 10 ms total and never enters a hot loop, which design likely wins?</p>',
      mountInput: function (container) {
        var opts = [
          'Pure interpreter — the JIT design pays compile-time costs that never amortize.',
          'Bytecode VM + JIT — always faster per operation.',
          'They tie exactly.',
          'It depends on the GC.'
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
        if (v === '0') return { correct: true, feedback: 'Right. JITs are an investment: pay the compile cost up front, profit on long-running hot code. Short scripts where nothing gets hot do not amortize. This is exactly why CPython resisted a JIT for years — most scripts are short.' };
        if (v === '1') return { correct: false, feedback: 'Per-op speed is not the whole picture. A JIT has to PAY for compilation. If the program ends before that pays off, you came out behind.' };
        return { correct: false, feedback: 'Think about the time budget. If the program is 10 ms and the JIT spends 5 ms compiling, that is half your run time gone before any optimized code runs.' };
      },
      hints: [
        'A JIT trades compile time for run-time speed. The trade only pays off if code runs long enough.',
        'For a 10 ms script that never enters a hot loop, the JIT pays compile cost it never amortizes.',
        'Short-running scripts favor the pure interpreter or a very lightweight VM.'
      ]
    }
  ]
});
