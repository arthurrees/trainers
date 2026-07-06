// Level 9 — Memory safety
EHT.registerLevel({
  id: 9,
  title: 'Memory Safety Basics',
  whyItMatters: 'About 70% of CVEs in browsers, kernels, and C/C++ codebases are memory-safety bugs (Microsoft and Google have both reported this number for years). You don\'t need to write exploits to benefit from understanding what these bugs are — knowing the categories and the modern mitigations explains why Rust matters and why "just write more careful C" never worked.',
  glossary: ['BoF', 'ASLR', 'DEP', 'canary'],
  learn: ''
    + '<h4>What memory safety means</h4>'
    + '<p>A program is "memory safe" if it cannot:</p>'
    + '<ul>'
    +   '<li>Read or write memory it doesn\'t own (out-of-bounds, use-after-free).</li>'
    +   '<li>Use memory after the underlying object is gone.</li>'
    +   '<li>Read uninitialized memory.</li>'
    +   '<li>Mistake one type of object for another (type confusion).</li>'
    + '</ul>'
    + '<p>C, C++, and pre-1.x Rust unsafe blocks let you do all of these. Memory-safe languages (Rust safe code, Go, Java, Python, JavaScript) prevent them by construction or detect them at runtime.</p>'

    + '<h4>The classic stack buffer overflow</h4>'
    + '<p>A function declares a fixed-size buffer on the stack. Adjacent on the stack: saved registers, then the saved <em>return address</em> — where execution will jump after the function returns. If you write past the buffer, you overwrite the return address.</p>'
    + '<div class="terminal">'
    + 'void greet(char* name) {\n'
    + '    char buf[64];\n'
    + '    strcpy(buf, name);   // <-- no bounds check\n'
    + '    printf("Hello, %s\\n", buf);\n'
    + '}\n'
    + '\n'
    + '<span class="out">Stack frame layout (low→high addresses):</span>\n'
    + '+----------+\n'
    + '| buf[64]  |  <-- local variable\n'
    + '| ...      |\n'
    + '+----------+\n'
    + '| saved EBP|\n'
    + '+----------+\n'
    + '| <span class="bad">saved RIP</span>|  <-- where execution returns to\n'
    + '+----------+\n'
    + '| arg name |\n'
    + '+----------+\n'
    + '\n'
    + '<span class="out">If "name" is 80 bytes, the last 16 bytes overwrite saved EBP and saved RIP.</span>\n'
    + '<span class="out">When greet returns, execution jumps to whatever address the attacker wrote.</span>'
    + '</div>'
    + '<p>That\'s the original 1988 Morris worm shape. It and its descendants drove decades of mitigation work.</p>'

    + '<h4>The mitigation stack (in deployment order)</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Mitigation</th><th>Year</th><th>What it stops</th><th>What it doesn\'t</th></tr>'
    + '<tr><td>Stack canaries</td><td>~2001</td><td>Random "magic value" before saved RIP. Function checks before returning; mismatch → abort. Detects sequential overflows.</td><td>Targeted writes that skip the canary; non-stack overflows.</td></tr>'
    + '<tr><td>DEP / NX (No-eXecute)</td><td>~2004</td><td>Marks data pages non-executable. Can\'t shellcode in the stack.</td><td>Return-Oriented Programming (ROP) — chain together existing executable bytes.</td></tr>'
    + '<tr><td>ASLR</td><td>~2007</td><td>Randomizes where libraries / stack / heap live each run. Attacker doesn\'t know jump targets.</td><td>Information leaks (read a pointer, derive base); partial bypass; brute force on 32-bit.</td></tr>'
    + '<tr><td>CFI (Control Flow Integrity)</td><td>~2014</td><td>Checks every indirect call/return against an allowed-targets list.</td><td>Implementation-specific gaps; data-only attacks.</td></tr>'
    + '<tr><td>CET / Shadow Stack (hw)</td><td>~2020</td><td>Hardware-maintained shadow of the return-address stack. Mismatch faults.</td><td>Limited rollout; not on all chips.</td></tr>'
    + '<tr><td>Memory-safe languages</td><td>—</td><td>Eliminates the bug class entirely for safe code.</td><td>Unsafe blocks; FFI to C; bugs in language runtime.</td></tr>'
    + '</table>'
    + '<p>Each mitigation adds an attacker-side step (info leak, ROP gadget search, etc). None individually eliminates exploitation; combined they make it expensive. Memory-safe languages remove the bug class — same end state, vastly cheaper.</p>'

    + '<h4>Heap bugs — the modern shape</h4>'
    + '<p>Stack overflows are mostly mitigated today. Heap bugs dominate modern exploits:</p>'
    + '<ul>'
    +   '<li><strong>Use-after-free</strong> — you free a pointer, then dereference it. Allocator might reuse that memory for a different object; you now control someone else\'s memory.</li>'
    +   '<li><strong>Double-free</strong> — freeing the same pointer twice corrupts allocator metadata.</li>'
    +   '<li><strong>Heap overflow</strong> — write past a heap chunk, corrupting the next chunk\'s metadata.</li>'
    +   '<li><strong>Type confusion</strong> — common in JS engines: object cast as wrong type, misreading internal fields.</li>'
    + '</ul>'

    + '<h4>Why Rust changes the game</h4>'
    + '<p>Rust\'s ownership and borrow checker statically prevent the four bug categories without garbage collection. The cost is a steeper learning curve than C; the benefit is "this code never has UAF or buffer overflows by construction."</p>'
    + '<p>Real-world impact: Microsoft reports its Pluton-side and Windows kernel Rust components have eliminated whole CVE classes. Android (Bionic) reports memory-safety bugs in NEW code dropped from 76% (2019) to ~24% by aggressively rewriting in Rust. The argument is no longer "can Rust replace C?" — it\'s "what do we rewrite first?"</p>'

    + '<h4>What this trainer is NOT</h4>'
    + '<div class="scope-banner">'
    + '<span class="label">Scope reminder</span>'
    + 'This level teaches the SHAPE of memory bugs and the value of mitigations. It deliberately does not cover writing shellcode, ROP-chain construction, or heap-grooming techniques — those belong in dedicated exploit-development courses (e.g., OffSec\'s OSED). The goal here is "understand why memory safety matters" — enough to read CVEs intelligently and build secure systems.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Watch a stack frame fill up. Slide the input length to see when the saved return address gets overwritten.</p>';

    var input = document.createElement('input'); input.type='range'; input.min=0; input.max=100; input.value=20; input.style.width='320px';
    var bufferSize = 64;
    var output = document.createElement('div'); output.className = 'formula-box';

    function render() {
      var len = parseInt(input.value, 10);
      var bufFill = Math.min(len, bufferSize);
      var ebpFill = Math.min(Math.max(len - bufferSize, 0), 8);
      var ripFill = Math.min(Math.max(len - bufferSize - 8, 0), 8);
      var afterFill = Math.max(0, len - bufferSize - 16);
      var ripWarning = ripFill > 0 ? '<span style="color:var(--bad);font-weight:600"> ← RETURN ADDRESS CORRUPTED — exploit potential</span>' : '';
      var canaryWarning = ebpFill > 0 && ripFill === 0 ? '<span style="color:var(--warn);font-weight:600"> ← stack canary would catch this</span>' : '';
      output.innerHTML =
        '<div class="info-line"><span class="key">User input length:</span> <span class="val">' + len + ' bytes</span></div>' +
        '<div style="margin-top:10px">' +
          '<div class="bar-row" style="margin-bottom:4px"><span class="bar-label">buf[64]</span><span class="bar-track"><span class="bar-fill ' + (bufFill === bufferSize ? 'warn' : 'good') + '" style="width:' + (bufFill / bufferSize * 100) + '%"></span></span><span class="bar-val">' + bufFill + '/64</span></div>' +
          '<div class="bar-row" style="margin-bottom:4px"><span class="bar-label">saved EBP</span><span class="bar-track"><span class="bar-fill ' + (ebpFill > 0 ? 'warn' : 'good') + '" style="width:' + (ebpFill / 8 * 100) + '%"></span></span><span class="bar-val">' + ebpFill + '/8</span></div>' +
          '<div class="bar-row" style="margin-bottom:4px"><span class="bar-label">saved RIP</span><span class="bar-track"><span class="bar-fill ' + (ripFill > 0 ? 'bad' : 'good') + '" style="width:' + (ripFill / 8 * 100) + '%"></span></span><span class="bar-val">' + ripFill + '/8</span></div>' +
        '</div>' +
        '<div class="info-line" style="margin-top:8px"><span class="key">Status:</span> <span class="val">' +
          (ripFill > 0 ? '<span style="color:var(--bad)">Overflow into return address</span>' :
           ebpFill > 0 ? '<span style="color:var(--warn)">Overflow into saved EBP (stack canary would catch)</span>' :
           bufFill === 64 ? 'Buffer at exactly capacity — boundary case' :
           '<span style="color:var(--good)">Within buffer</span>') + canaryWarning + ripWarning +
        '</span></div>' +
        '<div class="info-line muted" style="margin-top:6px">strcpy() doesn\'t check bounds. strncpy(buf, name, sizeof(buf)) prevents the overflow at the source. Modern compilers + canaries + ASLR + DEP raise the cost of exploitation; using a memory-safe language eliminates the bug class.</div>';
    }
    input.addEventListener('input', render);
    render();
    var lbl = document.createElement('label'); lbl.appendChild(document.createTextNode('Input length: ')); lbl.appendChild(input);
    container.appendChild(lbl);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which of these languages has memory-safety bugs (out-of-bounds, use-after-free) as a routine concern in everyday code?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Python</option><option>Java</option><option>C</option><option>JavaScript</option><option>Rust safe code</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'C') return { correct: true, feedback: 'Right. C\'s manual memory management + lack of bounds checks make memory bugs a routine hazard. Python, Java, JavaScript run in managed runtimes that enforce safety. Rust\'s safe code is statically checked. (C++ is in C\'s category; Rust unsafe blocks are too — but everyday safe Rust code is not.)' };
        if (v === 'Python' || v === 'Java' || v === 'JavaScript') return { correct: false, feedback: 'Managed runtime with bounds-checked arrays. The runtime itself can have bugs (CPython is C, JVM is C++) — but everyday code in these languages doesn\'t face memory-safety bugs.' };
        if (v === 'Rust safe code') return { correct: false, feedback: 'Rust\'s borrow checker statically prevents the bug class.' };
        return { correct: false, feedback: 'C.' };
      },
      hints: [
        'Manual memory management + no bounds check = memory bugs as a routine hazard.',
        'Python/Java/JS runtimes enforce safety. Rust safe code is statically checked.',
        'C.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A team disables ASLR "to debug a tricky issue" and forgets to re-enable it before deploying. What does this objectively change about exploit difficulty for a hypothetical buffer-overflow bug in their code?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Nothing — ASLR is just performance optimization</option>' +
          '<option>Massive: with ASLR off, library/stack/heap addresses are predictable across runs. A successful exploit one day works the next day with no re-recon. ASLR forces an attacker to leak addresses first.</option>' +
          '<option>It only affects 32-bit binaries</option>' +
          '<option>It makes crashes more frequent but is otherwise neutral</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Massive') === 0) return { correct: true, feedback: 'Right. ASLR doesn\'t prevent buffer overflows — it makes them harder to weaponize. With ASLR, an attacker must FIRST find a way to leak an address (info-disclosure), THEN craft an exploit using the leaked base. Without ASLR, addresses are constant, so a one-time-developed exploit "just works." Treat ASLR-off in production as roughly equivalent to running 1990s software.' };
        if (v === 'Nothing — ASLR is just performance optimization') return { correct: false, feedback: 'ASLR is a security mitigation, not performance.' };
        if (v === 'It only affects 32-bit binaries') return { correct: false, feedback: 'ASLR works on both 32 and 64-bit; it\'s far MORE effective on 64-bit (more entropy bits).' };
        if (v === 'It makes crashes more frequent but is otherwise neutral') return { correct: false, feedback: 'ASLR doesn\'t affect normal program behavior. It only matters when an attacker is trying to predict addresses.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'ASLR doesn\'t fix bugs; it makes exploits harder.',
        'Without ASLR, addresses are predictable across runs — write an exploit once, reuse forever.',
        'Disabling ASLR objectively makes exploitation much easier.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A C codebase has been audited by a reasonable team for years; they\'ve fixed every reported memory bug. The team argues "rewriting in Rust is unnecessary — we\'re already safe." What\'s the strongest counterargument from real-world data?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Their argument is correct — well-audited C is fine</option>' +
          '<option>Microsoft and Google both report ~70% of CVEs in their C/C++ products are memory bugs, persistently for two decades despite review and tooling. Audit is not a sustainable substitute for not having the bug class. Android\'s Rust rewrite reduced new-code memory bugs from 76% → ~24% in 5 years.</option>' +
          '<option>Rust is faster than C, that\'s the only reason</option>' +
          '<option>C is no longer maintained by the standards committee</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Microsoft and Google both report ~70% of CVEs') === 0) return { correct: true, feedback: 'Right. The 70% figure has been remarkably stable across orgs and years. Reasonable teams + sanitizers + fuzzing reduce the rate but don\'t eliminate the class — humans introduce new memory bugs at a rate that audit catches some-but-not-all of. Memory-safe languages (or formal verification) eliminate the class structurally. Real production data: Android Bionic (system C library) plus all new Rust code in Android has driven new-code memory-safety bugs from 76% to ~24% in 5 years. The rewrite gradient is the right argument.' };
        if (v === 'Their argument is correct — well-audited C is fine') return { correct: false, feedback: 'Industry data over decades disagrees.' };
        if (v === 'Rust is faster than C, that\'s the only reason') return { correct: false, feedback: 'Rust isn\'t universally faster than C; the safety argument is the primary one.' };
        if (v === 'C is no longer maintained by the standards committee') return { correct: false, feedback: 'C2x / C23 was just standardized.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'There\'s a famous statistic about what fraction of CVEs in C/C++ are memory bugs.',
        '~70%, persistently, across decades.',
        'Audit catches some, not all. Memory-safe languages eliminate the class.'
      ]
    }
  ]
});
