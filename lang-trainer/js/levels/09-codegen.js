// Level 9 — Code Generation
LT.registerLevel({
  id: 9,
  title: 'Code Generation',
  whyItMatters: 'IR is generic; assembly is target-specific. The codegen stage is where "compute this thing" becomes "use these registers and these instructions on this CPU".',
  glossary: ['code generation', 'calling convention', 'stack frame', 'register allocation'],
  learn:
    '<p>Codegen takes IR and emits assembly for a particular CPU architecture. This is where the compiler stops being abstract — every choice is influenced by what the target machine can actually do.</p>' +

    '<h4>Instruction selection</h4>' +
    '<p>For each IR op, pick the best assembly instruction. Sometimes there is one obvious choice (<code class="inline">add</code> for integer +). Sometimes there are several (<code class="inline">imul</code>, <code class="inline">lea</code>, or a shift for <code class="inline">x * 2</code>). Sometimes one IR op needs many instructions (a divide on a CPU without div), or many IR ops can fold into one instruction (a multiply-add).</p>' +
    '<div class="example"><div class="label">x86-64</div>' +
    'IR:&nbsp;&nbsp;t = a + b * 4<br>' +
    'asm: <code class="inline">lea rax, [rdi + rsi*4]</code>&nbsp;&nbsp;<span class="muted">// one instruction!</span>' +
    '</div>' +

    '<h4>Register allocation</h4>' +
    '<p>The IR used unlimited virtual registers (<code class="inline">t0, t1, ...</code>). The CPU has a small fixed set (16 general-purpose registers on x86-64, 31 on ARM64). The codegen has to map virtual to physical, and when it runs out, <b>spill</b> values to the stack.</p>' +
    '<p>The classic algorithm is <b>graph coloring</b>: build an interference graph (one node per virtual register, edges between vregs whose lifetimes overlap), and color it with N colors where N is the number of physical registers. Coloring failures become spills. Modern compilers use linear-scan or more advanced variants.</p>' +

    '<h4>Calling conventions</h4>' +
    '<p>A <b>calling convention</b> is a contract for how function calls work at the machine level: which registers hold arguments, which holds the return value, who saves what across calls, how the stack is laid out. Two functions that follow the same convention can call each other even if they were compiled separately.</p>' +
    '<div class="example"><div class="label">System V AMD64 (Linux/macOS x86-64)</div>' +
    'Integer args:&nbsp;&nbsp; rdi, rsi, rdx, rcx, r8, r9 (in order)<br>' +
    'Return value:&nbsp;&nbsp; rax<br>' +
    'Caller-saved:&nbsp;&nbsp; rax, rcx, rdx, rsi, rdi, r8–r11<br>' +
    'Callee-saved:&nbsp;&nbsp; rbx, rbp, r12–r15<br>' +
    'Stack alignment: 16 bytes at call' +
    '</div>' +
    '<p>Microsoft\'s x64 calling convention (used on Windows) is different: rcx, rdx, r8, r9 for the first four args. Same hardware, different rules. The compiler has to know which one to follow.</p>' +

    '<h4>The stack frame</h4>' +
    '<p>Each function call gets a <b>stack frame</b>: a region of stack memory holding locals, saved registers, and the return address. The classic layout (x86-64, growing toward lower addresses):</p>' +
    '<div class="formula-box">' +
    '... caller\'s frame ...<br>' +
    '[arg7, arg8, ...]&nbsp;&nbsp;<span class="muted">// args 1–6 are in registers</span><br>' +
    '[return address]&nbsp;&nbsp;&nbsp;<span class="muted">// pushed by the call instruction</span><br>' +
    '[saved rbp]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">// old frame pointer</span><br>' +
    '[locals + spills]&nbsp;&nbsp;<span class="muted">// rbp - 8, rbp - 16, ...</span><br>' +
    '... rsp points here ...' +
    '</div>' +
    '<p>The <b>function prologue</b> sets up the frame (<code class="inline">push rbp; mov rbp, rsp; sub rsp, N</code>); the <b>epilogue</b> tears it down (<code class="inline">mov rsp, rbp; pop rbp; ret</code>).</p>' +

    '<h4>Putting it together</h4>' +
    '<p>A complete codegen for a function:</p>' +
    '<ol>' +
    '<li>Emit the prologue (set up the frame).</li>' +
    '<li>Walk the IR, emitting target instructions, allocating registers, spilling when needed.</li>' +
    '<li>Honor the calling convention for any calls (move args into the right registers, save caller-saved regs as needed).</li>' +
    '<li>Emit the epilogue (return value in rax, restore registers, ret).</li>' +
    '</ol>' +
    '<p>The output is text — assembly source. The next stage turns that into bytes.</p>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">A toy x86-64 codegen for tiny expressions. Shows assembly using rax/rcx/rdx as scratch registers, with <code class="inline">a, b, c</code> assumed to be in rdi/rsi/rdx (System V).</p>' +
      '<input type="text" id="lt-cg-in" style="width:100%;" value="a + b * 2">' +
      '<div id="lt-cg-out" class="expr-tree" style="margin-top:10px;min-height:60px;"></div>';
    var inp = container.querySelector('#lt-cg-in');
    var out = container.querySelector('#lt-cg-out');

    function emit(ast) {
      // Toy stack-machine codegen: produces a list of asm-style lines using rax as the "top of stack",
      // pushing intermediate values when needed. Vars a/b/c live in rdi/rsi/rdx.
      var lines = [];
      var argMap = { a: 'rdi', b: 'rsi', c: 'rdx' };
      function visit(n) {
        if (n.type === 'Number') { lines.push('  mov rax, ' + n.value); return; }
        if (n.type === 'Ident') {
          if (!argMap[n.name]) throw new Error('only a, b, c supported here');
          lines.push('  mov rax, ' + argMap[n.name]);
          return;
        }
        if (n.type === 'BinaryOp') {
          visit(n.left);
          lines.push('  push rax');
          visit(n.right);
          lines.push('  mov rcx, rax');
          lines.push('  pop rax');
          if (n.op === '+') lines.push('  add rax, rcx');
          else if (n.op === '-') lines.push('  sub rax, rcx');
          else if (n.op === '*') lines.push('  imul rax, rcx');
          else if (n.op === '/') { lines.push('  cqo'); lines.push('  idiv rcx'); }
          else throw new Error('op not supported in this toy: ' + n.op);
          return;
        }
        throw new Error('node not supported in toy codegen: ' + n.type);
      }
      visit(ast);
      lines.push('  ret');
      return lines.join('\n');
    }

    function update() {
      try {
        var ast = LT.lib.parse.parse(LT.lib.lex.tokenize(inp.value));
        out.textContent = emit(ast);
        out.style.color = '';
      } catch (e) {
        out.textContent = e.message;
        out.style.color = 'var(--bad)';
      }
    }
    inp.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>On x86-64 System V (Linux), where does the return value of a function go?</p>',
      mountInput: function (container) {
        var opts = ['top of the stack', 'rax', 'a fixed memory location set by the caller', 'rdi'];
        var sel = document.createElement('select');
        opts.forEach(function (o) {
          var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'rax') return { correct: true, feedback: 'Yes. Integer/pointer return values go in rax. (For larger structs, rdx is also used; for floats, xmm0.)' };
        if (v === 'rdi') return { correct: false, feedback: 'rdi is the FIRST argument register on System V, not the return register.' };
        return { correct: false, feedback: 'Returns happen via a register on x86-64, not via the stack.' };
      },
      hints: [
        'Integer and pointer return values use a single register on x86-64.',
        'It is one of the caller-saved scratch registers.',
        'rax.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>The IR has <code class="inline">t0 = a; t1 = b; t2 = t0 + t1; t3 = c; t4 = t2 * t3</code>. The CPU has only <b>2</b> registers. After register allocation, how many <b>spills to memory</b> are forced (in the worst case, naïve allocation)?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'number';
        container.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Yes. With 2 registers you can hold t0 and t1, do the +, get t2 in one register, but you also need t3=c. Spill once. Real compilers will reuse registers more aggressively, but with naïve allocation, this is what falls out.' };
        if (v === 0) return { correct: false, feedback: 'Three values are alive at once at one point in the program (t2 and t3 plus a target). With only 2 registers, something has to spill.' };
        return { correct: false, feedback: 'Walk through which values are live at each step. Count the peak.' };
      },
      hints: [
        'Find the moment with the MOST values that need to be live at once.',
        'Just before the multiply, you need t2 (the sum) AND t3 (= c). Two values, two registers — fine. But computing t1 from b requires holding t0 and t1 first, then doing the add — three live at the peak.',
        'Worst case, with naïve allocation, you have to spill once.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Function <code class="inline">f</code> calls function <code class="inline">g</code>. Both are compiled with the same calling convention. Function <code class="inline">f</code> wants to keep a value in <code class="inline">r12</code> alive across the call to <code class="inline">g</code>.</p>' +
              '<p>Under <b>System V AMD64</b>, where <code class="inline">r12</code> is <b>callee-saved</b>, who is responsible for making sure that value is preserved?</p>',
      mountInput: function (container) {
        var opts = [
          'f must save r12 to its stack frame before calling g and restore it afterwards.',
          'g is required to save r12 if it touches it, and restore it before returning.',
          'The hardware automatically preserves all registers on function calls.',
          'The OS preserves r12 via context switches.'
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
        if (v === '1') return { correct: true, feedback: 'Right. "Callee-saved" means: if g uses r12, g is responsible for saving it on entry and restoring it on return. f just trusts the convention.' };
        if (v === '0') return { correct: false, feedback: 'That would be the rule for CALLER-saved registers (rax, rcx, etc). For callee-saved, the callee carries the responsibility.' };
        return { correct: false, feedback: 'The whole point of "callee-saved" is to put the responsibility on the function being called. The hardware does NOT preserve registers on call.' };
      },
      hints: [
        'Callee-saved means the CALLEE (the function being called) is responsible.',
        'If g uses r12, g must save it on entry and restore it on return.',
        'If g does not touch r12, no work is needed. Either way, f does NOT save r12.'
      ]
    }
  ]
});
